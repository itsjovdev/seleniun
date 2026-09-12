import { useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, CheckCircle, AlertCircle, Sparkles, Clock, Shield, Zap, Split, Merge, X, Plus, Loader2,
} from "lucide-react";
import ToolsCTA from "@/components/nav/ToolsCTA";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import ToolContentSections from "@/components/nav/ToolContentSections";
import { throwApiError, getErrorMessage } from "@/lib/api-error";
import { formatFileSize } from "@/hooks/useFileUpload";

const API_URL = "";

export default function SplitMergePdf() {
  const { t } = useI18n();
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitLoading, setSplitLoading] = useState(false);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [splitSuccess, setSplitSuccess] = useState(false);
  const [pageRanges, setPageRanges] = useState("");

  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [mergeSuccess, setMergeSuccess] = useState(false);

  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("split");
  const splitFileInputRef = useRef<HTMLInputElement>(null);
  const mergeFileInputRef = useRef<HTMLInputElement>(null);

  const handleSplitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSplitError(null); setSplitSuccess(false);
    if (!splitFile) return setSplitError(t("tool.selectPdf"));
    if (!pageRanges.trim()) return setSplitError(t("error.PAGES_REQUIRED"));

    try {
      setSplitLoading(true);
      const form = new FormData();
      form.append("file", splitFile);
      form.append("pages", pageRanges.trim());
      const res = await fetch(`${API_URL}/api/convert/split-pdf`, { method: "POST", body: form });
      if (!res.ok) await throwApiError(res);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${splitFile.name.replace(/\.pdf$/i, "")}_split.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setSplitSuccess(true);
      setTimeout(() => setSplitSuccess(false), 5000);
    } catch (err: any) {
      setSplitError(getErrorMessage(err, t));
    } finally { setSplitLoading(false); }
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMergeError(null); setMergeSuccess(false);
    if (mergeFiles.length < 2) return setMergeError(t("error.MERGE_MIN_FILES"));

    try {
      setMergeLoading(true);
      const form = new FormData();
      mergeFiles.forEach((file) => form.append("files", file));
      const res = await fetch(`${API_URL}/api/convert/merge-pdf`, { method: "POST", body: form });
      if (!res.ok) await throwApiError(res);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged_document.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setMergeSuccess(true);
      setTimeout(() => setMergeSuccess(false), 5000);
    } catch (err: any) {
      setMergeError(getErrorMessage(err, t));
    } finally { setMergeLoading(false); }
  };

  const handleSplitDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = Array.from(e.dataTransfer.files).find(f => f.type === "application/pdf");
    if (f) { setSplitFile(f); setSplitError(null); } else setSplitError(t("tool.onlyPdf"));
  };

  const handleMergeDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const pdfs = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (pdfs.length) { setMergeFiles(prev => [...prev, ...pdfs]); setMergeError(null); } else setMergeError(t("tool.onlyPdf"));
  };

  const fmt = formatFileSize;

  return (
    <>
      <LocaleSEO path="/tools/split-merge-pdf" title={t("seo.splitMerge.title")} description={t("seo.splitMerge.description")} />
      <Breadcrumbs items={[{ label: t("breadcrumb.tools"), href: "/#tools" }, { label: t("splitMerge.title") }]} />

      <section className="pb-4">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-ocean-100 text-ocean-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Split className="w-4 h-4" /> {t("splitMerge.badge")}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              {t("splitMerge.heading").split(t("splitMerge.headingColored"))[0]}<span className="text-ocean-700">{t("splitMerge.headingColored")}</span>{t("splitMerge.heading").split(t("splitMerge.headingColored")).slice(1).join(t("splitMerge.headingColored"))}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("splitMerge.subtitle")} <strong className="text-gray-700">{t("tool.freeSecureFast")}</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-ocean-700" /><span>{t("feature.secure100")}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-ocean-700" /><span>{t("feature.instantProcessing")}</span></div>
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-ocean-700" /><span>{t("feature.noLimits")}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="split" className="flex items-center gap-2"><Split className="w-4 h-4" /> {t("splitMerge.split")}</TabsTrigger>
              <TabsTrigger value="merge" className="flex items-center gap-2"><Merge className="w-4 h-4" /> {t("splitMerge.merge")}</TabsTrigger>
            </TabsList>

            {/* Split */}
            <TabsContent value="split">
              <Card className="border border-gray-200 shadow-xl">
                <CardContent className="p-6 md:p-10">
                  <form onSubmit={handleSplitSubmit} className="space-y-6">
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 md:p-14 text-center transition-all duration-200 ${dragOver ? "border-ocean-500 bg-ocean-50 scale-[1.01]" : splitFile ? "border-ocean-400 bg-ocean-50" : "border-gray-300 hover:border-ocean-400 hover:bg-gray-50"}`}
                      onDrop={handleSplitDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                    >
                      <input ref={splitFileInputRef} type="file" accept="application/pdf" onChange={(e) => setSplitFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {!splitFile ? (
                        <div className="space-y-4">
                          <div className="mx-auto w-16 h-16 bg-ocean-700 rounded-2xl flex items-center justify-center"><Upload className="w-8 h-8 text-white" /></div>
                          <h3 className="text-xl font-bold text-gray-900">{t("splitMerge.selectSplit")}</h3>
                          <p className="text-sm text-gray-500">or <button type="button" className="text-ocean-700 hover:underline font-semibold" onClick={() => splitFileInputRef.current?.click()}>{t("common.clickToSelect")}</button></p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto w-16 h-16 bg-ocean-700 rounded-2xl flex items-center justify-center"><Split className="w-8 h-8 text-white" /></div>
                          <p className="text-sm font-semibold text-ocean-700">{t("common.fileReady")}</p>
                          <p className="font-medium text-gray-900">{splitFile.name}</p>
                          <p className="text-sm text-gray-400">{fmt(splitFile.size)}</p>
                        </div>
                      )}
                    </div>

                    {splitFile && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">{t("splitMerge.pageRanges")}</label>
                        <input type="text" value={pageRanges} onChange={(e) => setPageRanges(e.target.value)} placeholder="1-3,5,7-10" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent" />
                      </div>
                    )}

                    <div className="text-center">
                      <Button type="submit" disabled={!splitFile || !pageRanges.trim() || splitLoading} className={`px-10 py-6 text-lg font-bold rounded-xl text-white shadow-md ${splitLoading ? "bg-ocean-700 cursor-wait" : "bg-ocean-700 hover:bg-ocean-800 disabled:opacity-50 disabled:cursor-not-allowed"}`}>
                        {splitLoading ? <span className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" />{t("tool.splitting")}</span> : <span className="flex items-center gap-2"><Split className="w-5 h-5" />{t("splitMerge.split")}</span>}
                      </Button>
                    </div>

                    {splitLoading && (
                      <div className="flex flex-col items-center gap-3 p-6 bg-ocean-50 border border-ocean-200 rounded-xl">
                        <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 text-ocean-700 animate-spin" /><p className="text-ocean-700 font-medium">{t("splitMerge.splittingPdf")}</p></div>
                        <div className="w-full bg-ocean-200 rounded-full h-1.5 overflow-hidden"><div className="bg-ocean-700 h-1.5 rounded-full animate-pulse" style={{ width: "70%" }} /></div>
                      </div>
                    )}

                    {splitError && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"><AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" /><p className="text-red-700">{splitError}</p></div>}
                    {splitSuccess && <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><p className="text-green-700">{t("splitMerge.splitSuccess")}</p></div>}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Merge */}
            <TabsContent value="merge">
              <Card className="border border-gray-200 shadow-xl">
                <CardContent className="p-6 md:p-10">
                  <form onSubmit={handleMergeSubmit} className="space-y-6">
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 md:p-14 text-center transition-all duration-200 ${dragOver ? "border-ocean-500 bg-ocean-50" : mergeFiles.length ? "border-ocean-400 bg-ocean-50" : "border-gray-300 hover:border-ocean-400 hover:bg-gray-50"}`}
                      onDrop={handleMergeDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                    >
                      <input ref={mergeFileInputRef} type="file" accept="application/pdf" multiple onChange={(e) => setMergeFiles(prev => [...prev, ...Array.from(e.target.files || [])])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="space-y-3">
                        <div className="mx-auto w-16 h-16 bg-ocean-700 rounded-2xl flex items-center justify-center"><Plus className="w-8 h-8 text-white" /></div>
                        <h3 className="text-xl font-bold text-gray-900">{t("splitMerge.selectMerge")}</h3>
                        <p className="text-sm text-gray-500">or <button type="button" className="text-ocean-700 hover:underline font-semibold" onClick={() => mergeFileInputRef.current?.click()}>{t("splitMerge.selectMergeMultiple")}</button></p>
                        <p className="text-xs text-gray-400">{t("splitMerge.minFiles")}</p>
                      </div>
                    </div>

                    {mergeFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">{t("splitMerge.selectedFiles")} ({mergeFiles.length}):</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {mergeFiles.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-gray-900">{file.name}</p>
                                <p className="text-sm text-gray-400">{fmt(file.size)}</p>
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setMergeFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <Button type="submit" disabled={mergeFiles.length < 2 || mergeLoading} className={`px-10 py-6 text-lg font-bold rounded-xl text-white shadow-md ${mergeLoading ? "bg-ocean-700 cursor-wait" : "bg-ocean-700 hover:bg-ocean-800 disabled:opacity-50 disabled:cursor-not-allowed"}`}>
                        {mergeLoading ? <span className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" />{t("tool.merging")}</span> : <span className="flex items-center gap-2"><Merge className="w-5 h-5" />{t("splitMerge.merge")} ({mergeFiles.length})</span>}
                      </Button>
                    </div>

                    {mergeLoading && (
                      <div className="flex flex-col items-center gap-3 p-6 bg-ocean-50 border border-ocean-200 rounded-xl">
                        <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 text-ocean-700 animate-spin" /><p className="text-ocean-700 font-medium">{t("splitMerge.mergingPdfs")}</p></div>
                        <div className="w-full bg-ocean-200 rounded-full h-1.5 overflow-hidden"><div className="bg-ocean-700 h-1.5 rounded-full animate-pulse" style={{ width: "70%" }} /></div>
                      </div>
                    )}

                    {mergeError && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"><AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" /><p className="text-red-700">{mergeError}</p></div>}
                    {mergeSuccess && <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><p className="text-green-700">{t("splitMerge.mergeSuccess")}</p></div>}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: Shield, title: t("feature.private"), description: t("feature.privateDesc"), color: "bg-ocean-700" },
              { icon: Zap, title: t("feature.blazingFast"), description: t("feature.blazingFastDesc"), color: "bg-ocean-500" },
              { icon: Sparkles, title: t("feature.noLimits"), description: t("feature.noLimitsDesc"), color: "bg-ocean-900" },
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

          <ToolContentSections prefix="splitMerge" accent="ocean" />

          <ToolsCTA title={t("cta.needMore")} subtitle={t("cta.explore")} links={[
            { to: "/tools/compress-pdf", label: t("compressPdf.compressBtn"), variant: "outline" },
            { to: "/tools/encrypt-pdf", label: t("encryptPdf.title"), variant: "outline" },
            { to: "/#tools", label: t("cta.seeAllTools"), variant: "default" },
          ]} />
        </div>
      </section>
    </>
  );
}
