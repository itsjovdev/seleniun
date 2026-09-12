//C:\Users\jov\Documents\proyectos\seleniun\document-intellisense\src\hooks\useEditor.ts

import { useEffect, useRef, useState } from "react";
import * as html2pdf from "html2pdf.js";
import { A4_PX, BASE_PT, PAD } from "@/lib/editor-constants";
import { cleanEditorText, downloadBlob } from "@/lib/editor-utils";
import { markdownToHtml } from "@/lib/markdown-to-html";

export type EditorApi = ReturnType<typeof useEditor>;

type Args = { onCloseMagic: () => void };

// Alto maximo del area editable (A4 1122px * 3 pages - paddings)
const MAX_PAGES = 3;
const MAX_CONTENT_HEIGHT = (1122 * MAX_PAGES) - PAD.top - PAD.bottom;

// ≈ alto de línea en px para Inter a BASE_PT con line-height 1.6
const LINE_HEIGHT_PX = (parseFloat(`${BASE_PT}`) * 1.3333) * 1.6;

export default function useEditor({ onCloseMagic }: Args) {
  const editorRef = useRef<HTMLDivElement>(null);

  // ---- SELECCIÓN ----
  const lastRangeRef = useRef<Range | null>(null);
  const saveSelection = () => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    if (el.contains(r.startContainer) && el.contains(r.endContainer)) {
      lastRangeRef.current = r.cloneRange();
    }
  };
  const restoreSelection = () => {
    const el = editorRef.current;
    const sel = window.getSelection();
    const r = lastRangeRef.current;
    if (!el || !sel || !r) return;
    el.focus();
    sel.removeAllRanges();
    sel.addRange(r);
  };

  // ---- Estado de formato / UI ----
  const [isEmpty, setIsEmpty] = useState(true);
  const [fmt, setFmt] = useState({
    bold: false, italic: false, underline: false, strikethrough: false,
    unorderedList: false, orderedList: false, h1: false, h2: false, blockquote: false,
  });
  const [currentFont, setCurrentFont] = useState("Inter");
  const [currentSize, setCurrentSize] = useState(`${BASE_PT}pt`);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showPlus, setShowPlus] = useState(true);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const checkHeightLimit = (): boolean => {
    if (!editorRef.current) return false;
    return editorRef.current.scrollHeight > MAX_CONTENT_HEIGHT;
  };

  // ===== CÁLCULO DINÁMICO DE PALABRAS (sin semillas temáticas) =====

  // Genera un array de N "palabras neutras" (tokens) para medir cabida.
  const makeNeutralPool = (n: number) => Array.from({ length: n }, () => "w");

  // Presupuesto EXACTO de palabras que caben en lo que queda de la página
  const getRemainingWordBudget = () => {
    const root = editorRef.current;
    if (!root) return 350; // fallback

    const used = root.scrollHeight;
    const free = Math.max(0, MAX_CONTENT_HEIGHT - used);
    if (free < 16) return 0;

    // Elemento de prueba
    const probe = document.createElement("p");
    probe.style.margin = "0 0 12pt 0";
    probe.style.lineHeight = "1.6";
    probe.style.fontSize = `${BASE_PT}pt`;
    probe.style.whiteSpace = "normal";
    probe.style.wordBreak = "break-word";
    probe.style.visibility = "hidden";
    probe.style.position = "absolute";
    probe.style.left = "-99999px";
    document.body.appendChild(probe);

    // Guardamos el HTML actual
    const snapshot = root.innerHTML;

    let lo = 0;
    let hi = 4000; // margen enorme
    let best = 0;

    const pool = makeNeutralPool(hi);

    const tryWith = (n: number) => {
      root.innerHTML = snapshot;
      probe.textContent = pool.slice(0, n).join(" ");
      root.appendChild(probe);
      const ok = root.scrollHeight <= MAX_CONTENT_HEIGHT;
      root.removeChild(probe);
      return ok;
    };

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (tryWith(mid)) { best = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }

    root.innerHTML = snapshot;
    document.body.removeChild(probe);
    return best;
  };

  // Capacidad TOTAL de palabras en una página vacía con tus estilos
  const getMaxWordsPerPage = () => {
    const host = document.createElement("div");
    Object.assign(host.style, {
      position: "absolute",
      left: "-99999px",
      top: "0",
      width: `${A4_PX}px`,
      height: `${1122}px`,
      padding: `${PAD.top}px ${PAD.right}px ${PAD.bottom}px ${PAD.left}px`,
      overflow: "hidden",
      visibility: "hidden",
      background: "white",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      fontSize: `${BASE_PT}pt`,
      lineHeight: "1.6",
      boxSizing: "border-box",
    } as CSSStyleDeclaration);

    const inner = document.createElement("div");
    inner.style.height = `${MAX_CONTENT_HEIGHT}px`;
    inner.style.maxHeight = `${MAX_CONTENT_HEIGHT}px`;
    inner.style.overflow = "hidden";
    host.appendChild(inner);
    document.body.appendChild(host);

    const p = document.createElement("p");
    p.style.margin = "0 0 12pt 0";
    p.style.lineHeight = "1.6";
    p.style.fontSize = `${BASE_PT}pt`;
    p.style.whiteSpace = "normal";
    p.style.wordBreak = "break-word";
    inner.appendChild(p);

    let lo = 0, hi = 6000, best = 0;
    const pool = makeNeutralPool(hi);

    const fits = (n: number) => {
      p.textContent = pool.slice(0, n).join(" ");
      return inner.scrollHeight <= MAX_CONTENT_HEIGHT;
    };

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (fits(mid)) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }

    document.body.removeChild(host);
    return best;
  };

  // Objetivo dinámico:
  // - si el doc está vacío: capacidad total de la página
  // - si ya hay contenido: lo que aún cabe
  const wordTarget = () => (isEmpty ? getMaxWordsPerPage() : getRemainingWordBudget());

  // ===== Normalización de bloques =====
  const ensureRootHasBlock = () => {
    const el = editorRef.current;
    if (!el) return;
    const hasBlock = Array.from(el.childNodes).some(
      (n) => n.nodeType === 1 && /^(P|DIV|BLOCKQUOTE|UL|OL|H1|H2|LI)$/i.test((n as Element).tagName)
    );
    if (!hasBlock) {
      const html = (el.innerHTML || "").trim().replace(/(<br\s*\/?>\s*)+/gi, "</p><p>");
      el.innerHTML = `<p>${html || "<br>"}</p>`;
    }
  };

  const normalizeForLists = () => {
    const root = editorRef.current;
    if (!root) return;

    root.querySelectorAll(":scope > div").forEach((div) => {
      const p = document.createElement("p");
      p.innerHTML = (div as HTMLElement).innerHTML || "<br>";
      (div as HTMLElement).replaceWith(p);
    });

    [...root.querySelectorAll(":scope > p")].forEach((p) => {
      if (p.querySelector("br")) {
        const parts = p.innerHTML.split(/<br\s*\/?>/i);
        const frag = document.createDocumentFragment();
        parts.forEach((html) => {
          const np = document.createElement("p");
          np.innerHTML = html || "<br>";
          frag.appendChild(np);
        });
        p.replaceWith(frag);
      }
    });

    [...root.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim().length) {
        const p = document.createElement("p");
        p.textContent = n.textContent || "";
        n.replaceWith(p);
      }
    });
  };

  const willOverflowNextLine = (): boolean => {
    const el = editorRef.current;
    if (!el) return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;

    const range = sel.getRangeAt(0).cloneRange();
    const probeBR = document.createElement("br");
    const probeZW = document.createTextNode("\u200b");
    range.insertNode(probeZW);
    range.insertNode(probeBR);

    const overflow = el.scrollHeight > MAX_CONTENT_HEIGHT;

    probeBR.parentNode?.removeChild(probeBR);
    probeZW.parentNode?.removeChild(probeZW);

    return overflow;
  };

  const readFormatting = () => {
    const safe = (cmd: string) => { try { return document.queryCommandState(cmd); } catch { return false; } };
    const blockValue = (() => {
      try { return (document.queryCommandValue("formatBlock") || "").toString().toUpperCase(); } catch { return ""; }
    })();
    setFmt({
      bold: safe("bold"),
      italic: safe("italic"),
      underline: safe("underline"),
      strikethrough: safe("strikeThrough"),
      unorderedList: safe("insertUnorderedList"),
      orderedList: safe("insertOrderedList"),
      h1: blockValue === "H1",
      h2: blockValue === "H2",
      blockquote: blockValue === "BLOCKQUOTE",
    });
  };

  const ensureRecalc = () => {
    const txt = cleanEditorText(editorRef.current);
    setIsEmpty(txt.length === 0);
    readFormatting();
  };

  const saveToHistory = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && editorRef.current) {
      const newIndex = historyIndex - 1;
      editorRef.current.innerHTML = history[newIndex];
      setHistoryIndex(newIndex);
      ensureRecalc();
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && editorRef.current) {
      const newIndex = historyIndex + 1;
      editorRef.current.innerHTML = history[newIndex];
      setHistoryIndex(newIndex);
      ensureRecalc();
    }
  };

  // Inicializa con un <p><br></p> y separador por defecto
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "<p><br></p>";
      try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch {}
      ensureRecalc();
    }
  }, []);

  // Recalcula + guarda selección cuando cambia
  useEffect(() => {
    const onSel = () => requestAnimationFrame(() => { ensureRecalc(); saveSelection(); });
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const updateCursorPosition = () => {
    if (!editorRef.current) return;
    requestAnimationFrame(() => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      try {
        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);
        const marker = document.createElement("span");
        marker.textContent = "\u200b";
        range.insertNode(marker);
        const rect = marker.getBoundingClientRect();
        const editorRect = editorRef.current!.getBoundingClientRect();
        marker.parentNode?.removeChild(marker);
        setCursorPosition({ top: Math.max(0, rect.top - editorRect.top), left: -36 });
      } catch {}
    });
  };

  // ---- Ejecuta comandos (con restauración de selección) ----
  const execCommand = (command: string, value?: string) => {
    restoreSelection();

    if (
      command === "insertUnorderedList" ||
      command === "insertOrderedList" ||
      (command === "formatBlock" && (value || "").toLowerCase().includes("blockquote"))
    ) {
      ensureRootHasBlock();
      normalizeForLists();
    }

    if (command === "formatBlock" && (value || "").toLowerCase().includes("blockquote")) {
      if (fmt.blockquote) {
        document.execCommand("formatBlock", false, "p");
      } else {
        document.execCommand("formatBlock", false, "<blockquote>");
      }
    } else {
      document.execCommand(command, false, value);
    }

    editorRef.current?.focus();
    saveToHistory();
    ensureRecalc();
    updateCursorPosition();
  };

  const applyInlineStyleAtCaret = (styles: Partial<CSSStyleDeclaration>) => {
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    if (styles.fontFamily) span.setAttribute("data-custom-font", "true");
    if (styles.fontSize) span.setAttribute("data-custom-size", "true");
    Object.assign(span.style, styles);

    if (sel.isCollapsed) {
      let container: Node = range.startContainer;
      if (container.nodeType === Node.TEXT_NODE) container = container.parentNode as Node;
      const blockEl = (container as HTMLElement)?.closest("[contenteditable] p, [contenteditable] div, [contenteditable] li") as HTMLElement | null;
      if (blockEl && blockEl.innerHTML.trim() === "<br>") { blockEl.innerHTML = ""; blockEl.appendChild(span); }
      else { range.insertNode(span); }
      const zw = document.createTextNode("\u200b");
      span.appendChild(zw);
      const newRange = document.createRange();
      newRange.setStart(zw, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      try { range.surroundContents(span); }
      catch {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    saveToHistory();
    editorRef.current?.focus();
    ensureRecalc();
    updateCursorPosition();
  };

  const applyFont = (font: string) => {
    setCurrentFont(font);
    restoreSelection();
    document.execCommand("fontName", false, font);
    editorRef.current?.focus();
    setShowFontMenu(false);
    saveToHistory();
  };

  const applySize = (size: string) => {
    setCurrentSize(size);
    restoreSelection();
    document.execCommand("fontSize", false, "7");
    if (editorRef.current) {
      editorRef.current.querySelectorAll('font[size="7"]').forEach((el) => {
        const span = document.createElement("span");
        span.style.fontSize = size;
        span.style.lineHeight = "1.6";
        span.innerHTML = (el as HTMLElement).innerHTML;
        (el as HTMLElement).replaceWith(span);
      });
    }
    editorRef.current?.focus();
    setShowSizeMenu(false);
    saveToHistory();
  };

  // ---- Export / Print ----
  const exportPDF = async (filename = "documento.pdf") => {
    try { if (document.fonts?.ready) await (document.fonts as any).ready; } catch {}
    let content = editorRef.current?.innerHTML ?? "";
    if (!/<(p|div|h[1-6]|ul|ol|blockquote|li)[>\s]/i.test(content)) content = `<p>${content}</p>`;

    const PAGE_H = 1122;

    const pdfStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; box-sizing: border-box; }
      html, body { margin:0; padding:0; }
      body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color:#111827; }
      .page { width:${A4_PX}px; box-sizing:border-box; margin:0 auto; padding:${PAD.top}px ${PAD.right}px ${PAD.bottom}px ${PAD.left}px; overflow:visible; word-break:break-word; font-size:${BASE_PT}pt; line-height:1.6; color:#111827; }
      .page p { margin:0 0 12pt 0; }
      .page h1 { font-size:32pt; font-weight:800; margin:20pt 0 16pt; line-height:1.2; }
      .page h2 { font-size:24pt; font-weight:700; margin:16pt 0 12pt; line-height:1.3; }
      .page blockquote { border-left:4px solid #6366f1; padding-left:20px; margin:16pt 0; color:#4b5563; font-style:italic; background:#f9fafb; padding:12pt 20pt; border-radius:8px; }
      .page ul, .page ol { padding-left:32px; margin:12pt 0; }
      .page li { margin:6pt 0; line-height:1.6; }
      .page hr { border:none; border-top:2px solid #e5e7eb; margin:20pt 0; }
      .page, .page * { transform: translateZ(0); }
    `;

    // Pre-render: create a hidden div with exact same styles and measure ACTUAL rendered height.
    // This eliminates guessing — we measure what the browser actually renders.
    const measureContainer = document.createElement("div");
    measureContainer.style.cssText = "position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;";
    const styleEl = document.createElement("style");
    styleEl.textContent = pdfStyles;
    measureContainer.appendChild(styleEl);
    const pageDiv = document.createElement("div");
    pageDiv.className = "page";
    pageDiv.innerHTML = content;
    measureContainer.appendChild(pageDiv);
    document.body.appendChild(measureContainer);

    // Wait for fonts and rendering
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    // scrollHeight already includes .page padding (box-sizing: border-box), don't double-count
    const measuredHeight = pageDiv.scrollHeight;
    document.body.removeChild(measureContainer);

    // Determine how many editor pages the content spans
    const editorEl = editorRef.current;
    let editorPages = 1;
    if (editorEl) {
      const children = Array.from(editorEl.children);
      if (children.length > 0) {
        const last = children[children.length - 1] as HTMLElement;
        const contentBottom = last.offsetTop + last.offsetHeight + PAD.top;
        editorPages = Math.max(1, Math.min(MAX_PAGES, Math.ceil(contentBottom / PAGE_H)));
      }
    }

    // If editor shows 1 page, PDF must be 1 page: use measured height (+ buffer) so nothing splits.
    // If editor shows multiple pages, use standard page height for proper multi-page breaking.
    const pdfPageHeight = editorPages === 1
      ? Math.max(measuredHeight + 40, PAGE_H)
      : PAGE_H;

    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${filename.replace(/\.pdf$/i, "")}</title><style>${pdfStyles}</style></head><body><div class="page">${content}</div></body></html>`;
    const element = document.createElement("div");
    element.innerHTML = html;
    await (html2pdf as any)
      .default()
      .from(element)
      .set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        jsPDF: { unit: "px", format: [A4_PX, pdfPageHeight], orientation: "portrait" },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, windowWidth: A4_PX, windowHeight: pdfPageHeight },
      })
      .save();
  };
  const exportDOCX = async (filename = "documento.docx") => {
    let content = editorRef.current?.innerHTML ?? "";
    if (!/<(p|div|h[1-6]|ul|ol|blockquote|li)[>\s]/i.test(content)) content = `<p>${content}</p>`;
    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color:#111827; font-size:${BASE_PT}pt; line-height:1.6; margin:${PAD.top}px ${PAD.right}px ${PAD.bottom}px ${PAD.left}px; }
      p { margin:0 0 12pt 0; }
      h1 { font-size:32pt; font-weight:800; margin:20pt 0 16pt; line-height:1.2; }
      h2 { font-size:24pt; font-weight:700; margin:16pt 0 12pt; line-height:1.3; }
      blockquote { border-left:4px solid #6366f1; padding-left:20px; margin:16pt 0; color:#4b5563; font-style:italic; }
      ul, ol { padding-left:32px; margin:12pt 0; }
      li { margin:6pt 0; }
    `;
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${filename.replace(/\.docx$/i, "")}</title><style>${styles}</style></head><body>${content}</body></html>`;
    // @ts-expect-error HTMLDocx is loaded globally via a script tag, no type declarations
    const blob = window.HTMLDocx.asBlob(html);
    downloadBlob(blob, filename);
  };

  const printDoc = () => {
    let content = editorRef.current?.innerHTML ?? "";
    if (!/<(p|div|h[1-6]|ul|ol|blockquote|li)[>\s]/i.test(content)) content = `<p>${content}</p>`;
    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
      html, body { margin:0; padding:0; }
      body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color:#111827; }
      .page { width:${A4_PX}px; margin:0 auto; padding:${PAD.top}px ${PAD.right}px ${PAD.bottom}px ${PAD.left}px; font-size:${BASE_PT}pt; line-height:1.6; }
      p { margin:0 0 12pt 0; }
      h1 { font-size:32pt; font-weight:800; margin:20pt 0 16pt; line-height:1.2; }
      h2 { font-size:24pt; font-weight:700; margin:16pt 0 12pt; line-height:1.3; }
      blockquote { border-left:4px solid #6366f1; padding-left:20px; margin:16pt 0; color:#4b5563; font-style:italic; background:#f9fafb; padding:12pt 20pt; }
      ul, ol { padding-left:32px; margin:12pt 0; }
      li { margin:6pt 0; }
      hr { border:none; border-top:2px solid #e5e7eb; margin:20pt 0; }
    `;
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Imprimir</title><style>${styles}</style></head><body><div class="page">${content}</div></body></html>`;
    const w = window.open("", "_blank", "width=1024,height=768");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.onload = () => { w.focus(); w.print(); w.close(); };
  };

  // Limite de 3 paginas (con prediccion para Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "Z" && e.shiftKey))) { e.preventDefault(); redo(); return; }

      const isContentKey = e.key.length === 1 || e.key === "Enter";
      if (isContentKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === "Enter" && willOverflowNextLine()) {
          e.preventDefault();
          setShowLimitWarning(true);
          setTimeout(() => setShowLimitWarning(false), 3000);
          return;
        }
        if (checkHeightLimit()) {
          e.preventDefault();
          setShowLimitWarning(true);
          setTimeout(() => setShowLimitWarning(false), 3000);
          return;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  // Insercion de “magic write” ajustada a 3 paginas y cierre limpio
useEffect(() => {
  const handler = (e: Event) => {
    const { text, closeModal, skipTrim } = (e as CustomEvent).detail || {};
    const root = editorRef.current;
    if (!text || !root) return;

    restoreSelection();
    root.focus();

    // Si viene con skipTrim=true, insertar directamente sin recortar
    if (skipTrim) {
      document.execCommand("insertHTML", false, text);
    } else {
      // Lógica antigua para otros casos (por si acaso)
      document.execCommand("insertHTML", false, text);
    }

    setShowActionsMenu(false);
    saveToHistory();
    ensureRecalc();
    updateCursorPosition();
    if (closeModal) onCloseMagic();
  };

  window.addEventListener("magicwrite:insert", handler);
  return () => window.removeEventListener("magicwrite:insert", handler);
}, [onCloseMagic]);

  // Palabras disponibles aproximadas (métrica rápida, útil para UI)
  const remainingWords = () => {
    const used = editorRef.current?.scrollHeight ?? 0;
    const freePx = Math.max(0, MAX_CONTENT_HEIGHT - used);
    const freeLines = freePx / LINE_HEIGHT_PX;
    const WORDS_PER_LINE = 10.5; // promedio seguro
    return Math.max(250, Math.floor(freeLines * WORDS_PER_LINE));
  };

  return {
    editorRef,
    isEmpty,
    ensureRecalc,
    showPlus, setShowPlus,
    showActionsMenu, setShowActionsMenu, setShowLimitWarning,
    cursorPosition, updateCursorPosition,
    showLimitWarning,

    // 👉 APIs de capacidad dinámica
    getRemainingWordBudget,
    getMaxWordsPerPage,
    wordTarget,

    fmt,
    isActive: (cmd: string) => {
      switch (cmd) {
        case "bold": return fmt.bold;
        case "italic": return fmt.italic;
        case "underline": return fmt.underline;
        case "strikethrough": return fmt.strikethrough;
        case "insertUnorderedList": return fmt.unorderedList;
        case "insertOrderedList": return fmt.orderedList;
        case "h1": return fmt.h1;
        case "h2": return fmt.h2;
        case "blockquote": return fmt.blockquote;
        default: return false;
      }
    },
    execCommand,
    currentFont, currentSize,
    showFontMenu, setShowFontMenu,
    showSizeMenu, setShowSizeMenu,
    applyFont, applySize,
    undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1,
    exportPDF, exportDOCX, printDoc,

    // métrica rápida (si la usas en UI)
    remainingWords,
  };
}
