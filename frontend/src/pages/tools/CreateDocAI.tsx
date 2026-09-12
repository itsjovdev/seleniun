import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import useEditor from "@/hooks/useEditor";
import EditorHeader from "@/components/editor-with-ia-free/EditorHeader";
import EditorToolbar from "@/components/editor-with-ia-free/EditorToolbar";
import EditorCanvas from "@/components/editor-with-ia-free/EditorCanvas";
import MagicWrite from "./MagicWrite";
import { FileText, Wand2 } from "lucide-react";
import Breadcrumbs from "@/components/nav/Breadcrumbs";

export default function CreateDocAI() {
  const { t } = useI18n();
  const [docTitle, setDocTitle] = useState(t("editor.docName"));
  const editor = useEditor({ onCloseMagic: () => {} });
  const [mobileTab, setMobileTab] = useState<"editor" | "magic">("editor");

  const sendAnalyticsEvent = (format: string) => {
    const trySend = () => {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "document_generated", {
          event_category: "usage",
          event_label: `AI Document (${format})`,
          value: 1,
        });
      } else {
        setTimeout(trySend, 1000);
      }
    };
    trySend();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LocaleSEO path="/ai-docs" title={t("seo.aiDocs.title")} description={t("seo.aiDocs.description")} />
      <h1 className="sr-only">{t("aiDocs.heading")}</h1>
      <Breadcrumbs items={[{ label: t("nav.aiWriter") }]} />
      <EditorHeader
        docTitle={docTitle}
        setDocTitle={setDocTitle}
        onDownloadPDF={() => {
          editor.exportPDF(`${docTitle || "document"}.pdf`);
          sendAnalyticsEvent("PDF");
        }}
        onDownloadDOCX={() => {
          editor.exportDOCX(`${docTitle || "document"}.docx`);
          sendAnalyticsEvent("DOCX");
        }}
        onPrint={editor.printDoc}
      />

      <EditorToolbar editor={editor} />

      {/* Mobile tab switcher */}
      <div className="lg:hidden sticky top-[56px] z-40 bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setMobileTab("editor")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
              mobileTab === "editor"
                ? "text-ocean-700 border-b-2 border-ocean-700 bg-ocean-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="h-4 w-4" />
            {t("editor.title")}
          </button>
          <button
            onClick={() => setMobileTab("magic")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
              mobileTab === "magic"
                ? "text-ocean-700 border-b-2 border-ocean-700 bg-ocean-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Wand2 className="h-4 w-4" />
            {t("magic.title")}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-3 sm:gap-4 lg:gap-6 items-start">
          {/* Editor - visible on desktop always, on mobile only when tab=editor */}
          <div className={`overflow-y-auto max-h-[80vh] lg:max-h-[85vh] rounded-xl sm:rounded-2xl ${
            mobileTab !== "editor" ? "hidden lg:block" : ""
          }`}>
            <EditorCanvas editor={editor} />
          </div>

          {/* MagicWrite - visible on desktop always, on mobile only when tab=magic */}
          <div className={`border rounded-xl bg-white shadow-sm overflow-hidden lg:sticky lg:top-28 max-h-[80vh] lg:max-h-[85vh] overflow-y-auto ${
            mobileTab !== "magic" ? "hidden lg:block" : ""
          }`}>
            <MagicWrite docIsEmpty={editor.isEmpty} />
          </div>
        </div>
      </div>
    </div>
  );
}
