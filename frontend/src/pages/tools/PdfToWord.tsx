import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  FileType,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Clock,
  Shield,
  Zap,
  Loader2,
} from "lucide-react";
import ToolsCTA from "@/components/nav/ToolsCTA";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import ToolContentSections from "@/components/nav/ToolContentSections";
import { throwApiError, getErrorMessage } from "@/lib/api-error";
import { useFileUpload, formatFileSize } from "@/hooks/useFileUpload";

const API_URL = "";

export default function PdfToWord() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    file, setFile, dragOver, setDragOver, fileInputRef, handleDrop, handleFileSelect,
  } = useFileUpload({
    isValidDrop: (f) => f.type === "application/pdf",
    onFileAccepted: () => setError(null),
    onDropRejected: () => setError(t("tool.onlyPdf")),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!file) {
      setError(t("tool.selectPdf"));
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API_URL}/api/convert/pdf-to-word`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) await throwApiError(res);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, "")}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LocaleSEO path="/tools/pdf-to-word" title={t("seo.pdfToWord.title")} description={t("seo.pdfToWord.description")} />
      <Breadcrumbs items={[{ label: t("breadcrumb.tools"), href: "/#tools" }, { label: t("pdfToWord.title") }]} />

      {/* Hero */}
      <section className="pb-4">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <FileType className="w-4 h-4" />
              {t("pdfToWord.badge")}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              {t("pdfToWord.title").replace("Word", "")}<span className="text-blue-600">Word</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("pdfToWord.subtitle")} <strong className="text-gray-700">{t("tool.freeSecureFast")}</strong>
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /><span>{t("feature.secure100")}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" /><span>{t("feature.conversionInSeconds")}</span></div>
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" /><span>{t("feature.layoutPreserved")}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Converter */}
      <section className="container pb-16">
        <div className="max-w-3xl mx-auto">
          <Card className="border border-gray-200 shadow-xl">
            <CardContent className="p-6 md:p-10">
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Drop zone */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 md:p-14 text-center transition-all duration-200 ${
                    dragOver
                      ? "border-blue-500 bg-blue-50 scale-[1.01]"
                      : file
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {!file ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{t("tool.dropPdf")}</h3>
                        <p className="text-gray-500 mb-2">
                          {t("common.or")}{" "}
                          <button type="button" className="text-blue-600 hover:underline font-semibold" onClick={() => fileInputRef.current?.click()}>
                            {t("common.clickToSelect")}
                          </button>
                        </p>
                        <p className="text-xs text-gray-400">{t("tool.pdfUpTo100")}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <FileType className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-600 mb-1">{t("common.fileReady")}</p>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                        <button
                          type="button"
                          onClick={() => { setFile(null); setError(null); }}
                          className="mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {t("common.changeFile")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Button */}
                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={!file || loading}
                    className={`px-10 py-6 text-lg font-bold rounded-xl text-white shadow-md transition-all ${loading ? "bg-blue-600 cursor-wait" : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"}`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("tool.converting")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        {t("pdfToWord.convertBtn")}
                      </span>
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-green-700">{t("tool.conversionComplete")}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: Shield, title: t("feature.private"), description: t("feature.privateDesc"), color: "bg-ocean-700" },
              { icon: Zap, title: t("feature.blazingFast"), description: t("feature.blazingFastDesc"), color: "bg-ocean-500" },
              { icon: Sparkles, title: t("feature.layoutPerfect"), description: t("feature.layoutPerfectDesc"), color: "bg-ocean-900" },
            ].map((feature, i) => (
              <Card key={i} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5 text-center">
                  <div className={`mx-auto mb-3 w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <ToolContentSections prefix="pdfToWord" accent="blue" />

          <ToolsCTA
            title={t("cta.needMore")}
            subtitle={t("cta.explore")}
            links={[
              { to: "/tools/word-to-pdf", label: t("wordToPdf.title"), variant: "outline" },
              { to: "/tools/compress-pdf", label: t("compressPdf.compressBtn"), variant: "outline" },
              { to: "/#tools", label: t("cta.seeAllTools"), variant: "default" },
            ]}
          />
        </div>
      </section>
    </>
  );
}
