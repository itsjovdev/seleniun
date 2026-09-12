import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronDown, Download, FileDown, Sparkles, Edit2 } from "lucide-react";

type Props = {
  docTitle: string;
  setDocTitle: (v: string) => void;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  onPrint: () => void;
};

export default function EditorHeader({
  docTitle,
  setDocTitle,
  onDownloadPDF,
  onDownloadDOCX,
  onPrint
}: Props) {
  const { t } = useI18n();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    if (showDownloadMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDownloadMenu]);

  const DownloadMenuContent = () => (
    <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
      <div className="py-1.5">
        <button
          onClick={() => { onDownloadPDF(); setShowDownloadMenu(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <FileDown className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-gray-900">{t("editor.exportPdf")}</span>
            <span className="text-xs text-gray-500">{t("editor.exportPdfDesc")}</span>
          </div>
        </button>

        <div className="h-px bg-gray-100 mx-3"></div>

        <button
          onClick={() => { onDownloadDOCX(); setShowDownloadMenu(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileDown className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-gray-900">{t("editor.exportWord")}</span>
            <span className="text-xs text-gray-500">{t("editor.exportWordDesc")}</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo + title */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="relative">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="hidden sm:block text-sm font-bold text-gray-900">
                {t("editor.title")}
              </span>
            </div>

            <div className="hidden sm:block h-6 w-px bg-gray-200"></div>

            {/* Editable title */}
            {isEditingTitle ? (
              <div className="flex-1 min-w-0 max-w-2xl">
                <input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") setIsEditingTitle(false);
                  }}
                  className="text-sm sm:text-base font-semibold text-gray-900 border-b-2 border-indigo-600 outline-none bg-transparent px-2 py-1 w-full"
                  autoFocus
                  placeholder={t("editor.docTitle")}
                />
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium ml-2">
                  {t("editor.pressEnter")} ⏎
                </span>
              </div>
            ) : (
              <div className="relative group flex-1 min-w-0 max-w-2xl">
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold text-gray-700 hover:text-indigo-600 transition-all px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 w-full justify-start truncate"
                >
                  <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                  <span className="truncate">{docTitle}</span>
                </button>

                <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                  {t("editor.clickToEdit")}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            )}
          </div>

          {/* Download button (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <Download className="h-4 w-4" />
                {t("editor.download")}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showDownloadMenu ? "rotate-180" : ""}`} />
              </button>
              {showDownloadMenu && <DownloadMenuContent />}
            </div>
          </div>

          {/* Download icon (mobile) */}
          <div className="relative md:hidden flex-shrink-0" ref={mobileMenuRef}>
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="h-5 w-5 text-gray-700" />
            </button>
            {showDownloadMenu && <DownloadMenuContent />}
          </div>
        </div>
      </div>
    </header>
  );
}
