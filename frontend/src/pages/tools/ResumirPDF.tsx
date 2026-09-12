import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload, FileType, CheckCircle, AlertCircle, Sparkles, Clock, Shield, Copy, Download, Loader2,
} from "lucide-react";
import ToolsCTA from "@/components/nav/ToolsCTA";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import ToolContentSections from "@/components/nav/ToolContentSections";
import { throwApiError, getErrorMessage } from "@/lib/api-error";
import { formatFileSize } from "@/hooks/useFileUpload";

const MAX_SIZE_MB = 10;

export default function ResumirPDF() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fmt = formatFileSize;

  const resetForm = () => {
    setFile(null); setError(null); setSummary(null); setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateAndSetFile = (f: File) => {
    if (f.type !== "application/pdf") { setError(t("tool.onlyPdf")); return; }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) { setError(t("error.FILE_TOO_LARGE")); return; }
    setFile(f); setError(null); setSummary(null); setCopied(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = Array.from(e.dataTransfer.files)[0];
    if (f) validateAndSetFile(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) return setError(t("tool.selectPdf"));

    try {
      setLoading(true);
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/pdf/summarize?mode=executive&format=markdown", {
        method: "POST",
        body: form,
      });
      if (!res.ok) await throwApiError(res);
      const data = await res.json();
      setSummary(data.summary_markdown ?? "");
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  const copySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(t("error.UNKNOWN_ERROR"));
    }
  };

  const downloadBlob = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const baseName = file?.name.replace(/\.pdf$/i, "") ?? "summary";

  const downloadAsTxt = () => summary && downloadBlob(summary, `${baseName}_summary.txt`, "text/plain");
  const downloadAsMd = () => summary && downloadBlob(summary, `${baseName}_summary.md`, "text/markdown");
  const downloadAsPdf = async () => {
    if (!summary) return;
    const [{ default: pdfMake }, pdfFonts] = await Promise.all([
      import("pdfmake/build/pdfmake"),
      import("pdfmake/build/vfs_fonts"),
    ]);
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;
    pdfMake.createPdf({
      content: summary.split("\n").map((line: string) => ({ text: line, margin: [0, 2, 0, 2] })),
      defaultStyle: { fontSize: 11 },
    }).download(`${baseName}_summary.pdf`);
  };

  return (
    <>
      <LocaleSEO path="/tools/summarize-pdf" title={t("seo.summarizePdf.title")} description={t("seo.summarizePdf.description")} />
      <Breadcrumbs items={[{ label: t("breadcrumb.tools"), href: "/#tools" }, { label: t("summarizePdf.title") }]} />

      <section className="pb-4">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> {t("summarizePdf.badge")}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">{t("summarizePdf.heading")} <span className="text-amber-600">PDF</span></h1>
            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("summarizePdf.subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-600" /><span>{t("feature.fastResults")}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-600" /><span>{t("feature.instantProcessing")}</span></div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-amber-600" /><span>{t("feature.privateSecure")}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="max-w-3xl mx-auto">
          <Card className="border border-gray-200 shadow-xl">
            <CardContent className="p-6 md:p-10">
              <form onSubmit={onSubmit} className="space-y-6">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 md:p-14 text-center transition-all duration-200 ${dragOver ? "border-amber-500 bg-amber-50 scale-[1.01]" : file ? "border-amber-400 bg-amber-50" : "border-gray-300 hover:border-amber-400 hover:bg-gray-50"}`}
                  onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                >
                  <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading} />
                  {!file ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center"><Upload className="w-8 h-8 text-white" /></div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{t("tool.dropPdf")}</h3>
                        <p className="text-gray-500 mb-2">{t("common.or")} <button type="button" className="text-amber-600 hover:underline font-semibold" onClick={() => fileInputRef.current?.click()}>{t("common.clickToSelect")}</button></p>
                        <p className="text-xs text-gray-400">{t("summarizePdf.supportedHint")}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center"><FileType className="w-8 h-8 text-white" /></div>
                      <div>
                        <p className="text-sm font-semibold text-amber-600 mb-1">{t("common.fileReady")}</p>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-400">{fmt(file.size)}</p>
                        <button type="button" onClick={resetForm} disabled={loading} className="mt-2 text-sm text-gray-400 hover:text-gray-600">{t("common.changeFile")}</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <Button type="submit" disabled={!file || loading} className={`px-10 py-6 text-lg font-bold rounded-xl text-white shadow-md ${loading ? "bg-amber-600 cursor-wait" : "bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"}`}>
                    {loading ? <span className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" />{t("summarizePdf.generating")}</span> : <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" />{t("summarizePdf.summarizeBtn")}</span>}
                  </Button>
                </div>

                {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"><AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" /><p className="text-red-700">{error}</p></div>}
              </form>

              {summary && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h2 className="text-lg font-bold text-gray-900">{t("summarizePdf.summary")}</h2>
                  </div>
                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[60vh] overflow-auto">
                    {summary}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={copySummary}>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> {copied ? t("summarizePdf.copied") : t("summarizePdf.copy")}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={downloadAsTxt}>
                      <Download className="w-3.5 h-3.5 mr-1.5" /> {t("summarizePdf.downloadTxt")}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={downloadAsMd}>
                      <Download className="w-3.5 h-3.5 mr-1.5" /> {t("summarizePdf.downloadMd")}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={downloadAsPdf}>
                      <Download className="w-3.5 h-3.5 mr-1.5" /> {t("summarizePdf.downloadPdf")}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: Shield, title: t("feature.private"), description: t("feature.privateDesc"), color: "bg-ocean-700" },
              { icon: Sparkles, title: t("feature.fastResults"), description: t("feature.fastResultsDesc"), color: "bg-ocean-500" },
              { icon: Clock, title: t("feature.instantProcessing"), description: t("feature.privateSecure"), color: "bg-ocean-900" },
            ].map((f, i) => (
              <Card key={i} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-5 text-center">
                  <div className={`mx-auto mb-3 w-10 h-10 ${f.color} rounded-lg flex items-center justify-center`}><f.icon className="w-5 h-5 text-white" /></div>
                  <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <ToolContentSections prefix="summarizePdf" accent="amber" />

          <ToolsCTA title={t("cta.needMore")} subtitle={t("cta.explore")} links={[
            { to: "/tools/compress-pdf", label: t("compressPdf.compressBtn"), variant: "outline" },
            { to: "/ai-docs", label: t("nav.aiWriter"), variant: "outline" },
            { to: "/#tools", label: t("cta.seeAllTools"), variant: "default" },
          ]} />
        </div>
      </section>
    </>
  );
}
