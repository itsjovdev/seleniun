import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Sparkles, Wand2, X, RotateCcw, ArrowDownToLine, AlertCircle } from "lucide-react";
import { generateAiWriterText } from "@/lib/ai-writer-client";
import { markdownToHtml } from "@/lib/markdown-to-html";

type SuggestionCat = { catKey: string; itemKeys: string[] };

const SUGGESTIONS: SuggestionCat[] = [
  {
    catKey: "magic.cat.students",
    itemKeys: [
      "magic.sug.students.1",
      "magic.sug.students.2",
      "magic.sug.students.3",
    ],
  },
  {
    catKey: "magic.cat.marketing",
    itemKeys: [
      "magic.sug.marketing.1",
      "magic.sug.marketing.2",
      "magic.sug.marketing.3",
    ],
  },
  {
    catKey: "magic.cat.sales",
    itemKeys: [
      "magic.sug.sales.1",
      "magic.sug.sales.2",
      "magic.sug.sales.3",
    ],
  },
  {
    catKey: "magic.cat.hr",
    itemKeys: [
      "magic.sug.hr.1",
      "magic.sug.hr.2",
      "magic.sug.hr.3",
    ],
  },
];

export default function MagicWrite({ docIsEmpty }: { docIsEmpty: boolean }) {
  const { t, locale } = useI18n();
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [typedBeforePick, setTypedBeforePick] = useState<string>("");
  const [phase, setPhase] = useState<"idle" | "generating" | "ready">("idle");
  const temperature = 0.65;
  const [targetWords, setTargetWords] = useState(1000);

  const system = useMemo(() => {
    const langInstruction = locale === "es"
      ? "Escribe en espanol claro y neutro."
      : "Write in clear, neutral English.";
    return (
      langInstruction + " Use markdown format:\n" +
      "- Headings with ## and ###\n" +
      "- Bold with **text**\n" +
      "- Lists with -\n" +
      "Generate extensive, detailed and complete content. Include a strong introduction, multiple sections with 5-8 bullets each, concrete examples and data, and a thorough conclusion with next steps. Fill at least 2-3 pages of content. NEVER stop mid-sentence."
    );
  }, [locale]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { words } = (e as CustomEvent).detail || {};
      if (typeof words === "number") {
        setTargetWords(Math.max(0, words));
      }
    };
    window.addEventListener("magicwrite:space", handler);
    return () => window.removeEventListener("magicwrite:space", handler);
  }, []);

  const canGenerate = useMemo(
    () => prompt.trim().length >= 5 && !loading,
    [prompt, loading]
  );

  const countWords = (txt: string) =>
    (txt || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean).length;

  const finishAtNiceBoundary = (text: string) => {
    const trimmed = text.trimEnd();
    // If it already ends with sentence-ending punctuation, it's fine
    if (/[.!?:;)\]"'»]\s*$/.test(trimmed)) return trimmed;
    // Find the last sentence-ending punctuation
    const lastSentenceEnd = Math.max(
      trimmed.lastIndexOf(". "),
      trimmed.lastIndexOf(".\n"),
      trimmed.lastIndexOf("! "),
      trimmed.lastIndexOf("!\n"),
      trimmed.lastIndexOf("? "),
      trimmed.lastIndexOf("?\n"),
    );
    if (lastSentenceEnd > trimmed.length * 0.7) {
      return trimmed.slice(0, lastSentenceEnd + 1);
    }
    // If no good boundary found, just add ellipsis-free ending
    const lastPeriod = trimmed.lastIndexOf(".");
    if (lastPeriod > trimmed.length * 0.5) {
      return trimmed.slice(0, lastPeriod + 1);
    }
    return trimmed;
  };

  const trimToTargetWords = (text: string, target: number) => {
    if (!target || target <= 0) return text;
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= target * 1.15) return finishAtNiceBoundary(text);
    let wordCount = 0;
    const lines = text.split("\n");
    const result: string[] = [];
    for (const line of lines) {
      const lineWords = line.split(/\s+/).filter(Boolean);
      if (wordCount + lineWords.length > target * 1.15) {
        break;
      }
      result.push(line);
      wordCount += lineWords.length;
    }
    return finishAtNiceBoundary(result.join("\n"));
  };

  const simulateEditorFit = (htmlContent: string): string => {
    const MAX_HEIGHT = 930 * 3;
    const container = document.createElement("div");
    container.style.cssText = `
      position: absolute; left: -9999px; width: 794px; padding: 96px;
      font-family: Inter, system-ui, sans-serif; font-size: 14pt; line-height: 1.6; box-sizing: border-box;
    `;
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .temp-fit p { margin: 0 0 12pt 0; font-size: 14pt; line-height: 1.6; }
      .temp-fit h1 { font-size: 32pt; font-weight: 800; margin: 20pt 0 16pt; line-height: 1.2; }
      .temp-fit h2 { font-size: 24pt; font-weight: 700; margin: 16pt 0 12pt; line-height: 1.3; }
      .temp-fit h3 { font-size: 14pt; font-weight: 600; margin: 12pt 0 8pt; }
      .temp-fit ul, .temp-fit ol { padding-left: 32px; margin: 12pt 0; }
      .temp-fit li { margin: 6pt 0; line-height: 1.6; }
    `;
    document.head.appendChild(styleEl);
    container.className = "temp-fit";
    document.body.appendChild(container);
    container.innerHTML = htmlContent;
    if (container.scrollHeight <= MAX_HEIGHT) {
      document.head.removeChild(styleEl);
      document.body.removeChild(container);
      return htmlContent;
    }
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    const elements = Array.from(temp.children);
    let fitted = "";
    for (const elem of elements) {
      container.innerHTML = fitted + elem.outerHTML;
      if (container.scrollHeight <= MAX_HEIGHT) {
        fitted += elem.outerHTML;
      } else {
        const text = elem.textContent || "";
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const tagName = elem.tagName.toLowerCase();
        let partialContent = "";
        for (const sentence of sentences) {
          const testContent = partialContent + sentence;
          container.innerHTML = fitted + `<${tagName}>${testContent}</${tagName}>`;
          if (container.scrollHeight <= MAX_HEIGHT) {
            partialContent = testContent;
          } else {
            break;
          }
        }
        if (partialContent.trim()) {
          fitted += `<${tagName}>${partialContent}</${tagName}>`;
        }
        break;
      }
    }
    document.head.removeChild(styleEl);
    document.body.removeChild(container);
    return fitted;
  };

  const makeUserPrompt = (base: string, extra?: string) =>
    `${base}\n\nTarget length: ${targetWords} words. ` +
    "Generate COMPLETE and detailed content: robust introduction, sections with 5-7 bullets each, " +
    "concrete examples, and a final section with next steps. " +
    "Maximize useful content without filler." +
    (extra ? `\n${extra}` : "");

  const generate = useCallback(async () => {
    if (!canGenerate) return;
    setError(null);
    setDraft("");
    setPhase("generating");
    setLoading(true);
    try {
      let text = "";
      const maxTokens = Math.min(4000, Math.max(200, Math.round(targetWords * 2)));
      const first = await generateAiWriterText(
        makeUserPrompt(prompt),
        system,
        temperature,
        maxTokens,
        (chunk) => {
          text += chunk;
          setDraft(markdownToHtml(text));
        }
      );
      text = finishAtNiceBoundary(first.text || "");
      setDraft(markdownToHtml(text));
      setPhase("ready");
    } catch (e: any) {
      setError(e?.message || "Error generating text");
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  }, [prompt, system, temperature, canGenerate, targetWords]);

  const insert = () => {
    if (!draft) return;
    window.dispatchEvent(
      new CustomEvent("magicwrite:insert", {
        detail: { text: draft, closeModal: true, skipTrim: true },
      })
    );
    setPrompt("");
    setDraft("");
    setPhase("idle");
    setActiveCat(null);
    setSelectedIdea(null);
    setTypedBeforePick("");
    setError(null);
  };

  const currentItems = activeCat
    ? SUGGESTIONS.find((s) => s.catKey === activeCat)?.itemKeys ?? []
    : [];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white px-3 sm:px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-ocean-700 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-gray-900">{t("magic.title")}</h1>
            <p className="text-xs text-gray-500 leading-tight">{t("magic.subtitle")}</p>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 sm:py-5 space-y-4 sm:space-y-5">
        {/* INPUT AREA */}
        {phase === "idle" && (
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 sm:p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {t("magic.whatToWrite")}
            </label>

            <textarea
              value={prompt}
              onChange={(e) => {
                if (selectedIdea) setSelectedIdea(null);
                setPrompt(e.target.value);
              }}
              placeholder={t("magic.placeholder")}
              className="w-full min-h-[100px] sm:min-h-[110px] rounded-lg border border-gray-300 bg-white
                         px-3 py-2.5 text-sm placeholder-gray-400
                         focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none resize-none transition-all"
            />

            <div className="flex flex-col gap-2.5 mt-3">
              <p className="text-xs text-gray-500">
                {t("magic.tip")}
              </p>

              <button
                onClick={generate}
                disabled={!canGenerate}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg
                           bg-ocean-700 hover:bg-ocean-800 text-white px-4 py-2.5
                           text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                           active:scale-[0.98]"
              >
                <Wand2 className="h-4 w-4" />
                {t("magic.generate")}
              </button>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{t("magic.errorFallback")}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SUGGESTIONS */}
        {phase === "idle" && (
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">{t("magic.quickIdeas")}</h2>
              <span className="text-xs text-gray-500">{t("magic.selectCategory")}</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-2 min-w-min">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.catKey}
                    onClick={() => setActiveCat(activeCat === s.catKey ? null : s.catKey)}
                    className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border whitespace-nowrap ${
                      activeCat === s.catKey
                        ? "bg-ocean-700 text-white border-ocean-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-ocean-50 hover:text-ocean-700 hover:border-ocean-400"
                    }`}
                  >
                    {t(s.catKey)}
                  </button>
                ))}
              </div>
            </div>

            {activeCat && currentItems.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {currentItems.map((ideaKey) => {
                  const idea = t(ideaKey);
                  const active = selectedIdea === ideaKey;
                  return (
                    <button
                      key={ideaKey}
                      onClick={() => {
                        if (selectedIdea === ideaKey) {
                          setSelectedIdea(null);
                          setPrompt(typedBeforePick);
                        } else {
                          if (!selectedIdea) setTypedBeforePick(prompt);
                          setSelectedIdea(ideaKey);
                          setPrompt(idea);
                        }
                      }}
                      className={`text-left rounded-lg px-3 py-2.5 text-xs sm:text-sm leading-relaxed border transition-all ${
                        active
                          ? "border-ocean-500 bg-ocean-50"
                          : "border-gray-200 bg-white hover:border-ocean-300 hover:bg-ocean-50/50"
                      }`}
                    >
                      <span className={active ? "font-medium text-ocean-900" : "text-gray-700"}>
                        {idea}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* LOADING */}
        {phase === "generating" && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-600">
            <div className="relative">
              <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 border-4 border-ocean-200 border-t-ocean-700 rounded-full" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-ocean-700" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-800">{t("magic.generating")}</p>
            <p className="mt-1 text-xs text-gray-500">{t("magic.generatingWait")}</p>
          </div>
        )}

        {/* RESULT */}
        {phase === "ready" && !!draft && (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between bg-gray-50 px-3.5 sm:px-4 py-2.5 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800">{t("magic.generatedDraft")}</h4>
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">
                {countWords(draft)} {t("magic.words")}
              </span>
            </div>

            <div className="preview-content p-3.5 sm:p-5 max-h-[55vh] overflow-y-auto text-gray-800 text-sm sm:text-[15px] leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: draft }} />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 border-t border-gray-200 bg-white px-3.5 sm:px-4 py-3">
              <button
                onClick={generate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium
                           hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("magic.regenerate")}
              </button>
              <button
                onClick={insert}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-ocean-700 hover:bg-ocean-800
                           text-white text-sm font-semibold transition-all
                           active:scale-[0.98]"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                {t("magic.insert")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
