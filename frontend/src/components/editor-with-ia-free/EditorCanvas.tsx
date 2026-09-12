import React, { useRef, useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { EditorApi } from "@/hooks/useEditor";
import { BASE_PT, PAD, A4_PX } from "@/lib/editor-constants";
import FloatingActions from "./FloatingActions";

type Props = {
  editor: EditorApi;
};

const MAX_PAGES = 3;
const PAGE_HEIGHT = 1122;
const TOTAL_HEIGHT = PAGE_HEIGHT * MAX_PAGES;
const EDITABLE_HEIGHT = TOTAL_HEIGHT - PAD.top - PAD.bottom;

export default function EditorCanvas({ editor }: Props) {
  const { t } = useI18n();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [visiblePages, setVisiblePages] = useState(1);

  const calcScale = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const available = wrapper.clientWidth;
    const newScale = available < A4_PX ? available / A4_PX : 1;
    setScale(newScale);
  }, []);

  useEffect(() => {
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, [calcScale]);

  // Dynamic page growth: detect content height and show only needed pages
  const updateVisiblePages = useCallback(() => {
    const el = editor.editorRef.current;
    if (!el) return;

    // Find actual content bottom by checking last child element
    const children = Array.from(el.children);
    let contentBottom = 0;
    if (children.length > 0) {
      const last = children[children.length - 1] as HTMLElement;
      contentBottom = last.offsetTop + last.offsetHeight;
    }

    // Convert to paper coordinates (add top padding)
    const paperBottom = contentBottom + PAD.top;

    // Grow when content is close to page boundary (50px buffer)
    const needed = Math.max(1, Math.min(MAX_PAGES, Math.ceil((paperBottom + 50) / PAGE_HEIGHT)));
    setVisiblePages(needed);
  }, []);

  // Watch for content changes with MutationObserver
  useEffect(() => {
    const el = editor.editorRef.current;
    if (!el) return;

    const observer = new MutationObserver(updateVisiblePages);
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    updateVisiblePages();

    return () => observer.disconnect();
  }, [updateVisiblePages]);

  // Also update on input events (covers typing, paste, etc.)
  const handleInput = useCallback(() => {
    editor.ensureRecalc();
    editor.updateCursorPosition();
    updateVisiblePages();
    requestAnimationFrame(() => {
      const el = editor.editorRef.current;
      if (el && el.scrollHeight > EDITABLE_HEIGHT) {
        editor.undo();
        editor.setShowLimitWarning(true);
        setTimeout(() => editor.setShowLimitWarning(false), 3000);
      }
    });
  }, [editor, updateVisiblePages]);

  const currentHeight = PAGE_HEIGHT * visiblePages;

  return (
    <div ref={wrapperRef} className="w-full flex justify-center">
      {/* Outer clip: only shows the pages that have content */}
      <div
        style={{
          width: A4_PX * scale,
          height: currentHeight * scale,
          overflow: "hidden",
        }}
      >
        <div
          className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-200 sm:border-2 overflow-hidden relative origin-top-left"
          style={{
            width: A4_PX,
            height: TOTAL_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          {/* Page breaks — thin line between visible pages */}
          {visiblePages > 1 &&
            Array.from({ length: visiblePages - 1 }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 pointer-events-none border-t border-gray-300"
                style={{ top: PAGE_HEIGHT * (i + 1) }}
              />
            ))}

          <div
            className="relative"
            style={{
              paddingTop: PAD.top,
              paddingRight: PAD.right,
              paddingBottom: PAD.bottom,
              paddingLeft: PAD.left,
              height: "100%",
            }}
          >
            <div className="relative h-full">
              <div
                ref={editor.editorRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                data-placeholder={t("editor.placeholder")}
                className={`editor-content text-gray-900 focus:outline-none relative overflow-hidden ${
                  editor.isEmpty ? "show-placeholder" : ""
                }`}
                style={{
                  lineHeight: "1.6",
                  fontSize: `${BASE_PT}pt`,
                  height: `${EDITABLE_HEIGHT}px`,
                  maxHeight: `${EDITABLE_HEIGHT}px`,
                }}
                onInput={handleInput}
                onKeyUp={() => {
                  editor.ensureRecalc();
                  editor.updateCursorPosition();
                }}
                onKeyDown={() => {
                  editor.updateCursorPosition();
                }}
                onClick={editor.updateCursorPosition}
                onFocus={() => {
                  editor.ensureRecalc();
                  editor.updateCursorPosition();
                }}
                onBlur={() => {
                  editor.ensureRecalc();
                }}
              />

              {editor.showPlus && (
                <FloatingActions
                  top={scale < 1 ? editor.cursorPosition.top / scale : editor.cursorPosition.top}
                  left={-38}
                  open={editor.showActionsMenu}
                  onToggle={() =>
                    editor.setShowActionsMenu(!editor.showActionsMenu)
                  }
                  onH1={() => editor.execCommand("formatBlock", "<h1>")}
                  onH2={() => editor.execCommand("formatBlock", "<h2>")}
                  onUl={() => editor.execCommand("insertUnorderedList")}
                  onOl={() => editor.execCommand("insertOrderedList")}
                  onQuote={() => editor.execCommand("formatBlock", "<blockquote>")}
                  onHr={() => editor.execCommand("insertHorizontalRule")}
                />
              )}

              {editor.showLimitWarning && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-2xl font-bold text-xs sm:text-sm animate-bounce z-50 whitespace-nowrap">
                  {t("editor.pageLimit")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
