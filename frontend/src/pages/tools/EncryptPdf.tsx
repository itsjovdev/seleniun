import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload, FileType, CheckCircle, AlertCircle, Lock, Shield, Clock, Sparkles, Key, Eye, EyeOff, Loader2,
} from "lucide-react";
import ToolsCTA from "@/components/nav/ToolsCTA";
import Breadcrumbs from "@/components/nav/Breadcrumbs";
import ToolContentSections from "@/components/nav/ToolContentSections";
import { PdfEncryptBackendClient } from "@/lib/PdfEncryptBackendClient";
import { getErrorMessage } from "@/lib/api-error";
import { useFileUpload, formatFileSize } from "@/hooks/useFileUpload";

export default function EncryptPdf() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const {
    file, setFile, dragOver, setDragOver, fileInputRef, handleDrop, handleFileSelect, reset: resetFile,
  } = useFileUpload({
    isValidDrop: (f) => f.type === "application/pdf",
    onFileAccepted: () => setError(null),
    onDropRejected: () => setError(t("tool.onlyPdf")),
  });

  const pwdStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabel = pwdStrength >= 5 ? t("encryptPdf.strong") : pwdStrength >= 3 ? t("encryptPdf.medium") : t("encryptPdf.weak");
  const strengthColor = pwdStrength >= 5 ? "text-green-600" : pwdStrength >= 3 ? "text-yellow-600" : "text-red-600";

  const fmt = formatFileSize;

  const resetForm = () => {
    resetFile(); setPassword(""); setError(null); setProgress(0); setSuccess(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    if (!file) return setError(t("tool.selectPdf"));
    if (!password.trim()) return setError(t("encryptPdf.enterPassword"));
    if (password.length < 4) return setError(t("encryptPdf.minChars"));

    try {
      setLoading(true); setProgress(10);
      const client = new PdfEncryptBackendClient();
      setProgress(30);
      const encryptedBlob = await client.encrypt(file, password);
      setProgress(80);
      const url = URL.createObjectURL(encryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, "")}_encrypted.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setProgress(100); setSuccess(true);
      setTimeout(() => { setProgress(0); setLoading(false); resetForm(); }, 1500);
    } catch (err: any) {
      setError(getErrorMessage(err, t));
      setLoading(false); setProgress(0);
    }
  };

  return (
    <>
      <LocaleSEO path="/tools/encrypt-pdf" title={t("seo.encryptPdf.title")} description={t("seo.encryptPdf.description")} />
      <Breadcrumbs items={[{ label: t("breadcrumb.tools"), href: "/#tools" }, { label: t("encryptPdf.title") }]} />

      <section className="pb-4">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Lock className="w-4 h-4" /> {t("encryptPdf.badge")}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">{t("encryptPdf.heading")} <span className="text-rose-600">PDF</span></h1>
            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("encryptPdf.subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-rose-600" /><span>{t("feature.aes256")}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-rose-600" /><span>{t("feature.instantProcessing")}</span></div>
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-rose-600" /><span>{t("feature.privateSecure")}</span></div>
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
                  className={`relative border-2 border-dashed rounded-xl p-8 md:p-14 text-center transition-all duration-200 ${dragOver ? "border-rose-500 bg-rose-50 scale-[1.01]" : file ? "border-rose-400 bg-rose-50" : "border-gray-300 hover:border-rose-400 hover:bg-gray-50"}`}
                  onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                >
                  <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading} />
                  {!file ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center"><Upload className="w-8 h-8 text-white" /></div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{t("tool.dropPdf")}</h3>
                        <p className="text-gray-500 mb-2">{t("common.or")} <button type="button" className="text-rose-600 hover:underline font-semibold" onClick={() => fileInputRef.current?.click()}>{t("common.clickToSelect")}</button></p>
                        <p className="text-xs text-gray-400">{t("tool.pdfUpTo500")}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center"><FileType className="w-8 h-8 text-white" /></div>
                      <div>
                        <p className="text-sm font-semibold text-rose-600 mb-1">{t("common.fileReady")}</p>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-400">{fmt(file.size)}</p>
                        <button type="button" onClick={resetForm} disabled={loading} className="mt-2 text-sm text-gray-400 hover:text-gray-600">{t("common.changeFile")}</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900">{t("encryptPdf.setPassword")}</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPwd ? "text" : "password"} id="password" value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder={t("encryptPdf.enterPassword")}
                      className="w-full pl-12 pr-12 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
                      disabled={loading}
                    />
                    <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{t("encryptPdf.passwordHint")}</span>
                      <span className={`font-semibold ${strengthColor}`}>{t("encryptPdf.strength")} {strengthLabel}</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <Button type="submit" disabled={!file || !password.trim() || loading} className={`px-10 py-6 text-lg font-bold rounded-xl text-white shadow-md ${loading ? "bg-rose-600 cursor-wait" : "bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"}`}>
                    {loading ? <span className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" />{t("tool.encrypting")}</span> : <span className="flex items-center gap-2"><Lock className="w-5 h-5" />{t("encryptPdf.encryptBtn")}</span>}
                  </Button>
                </div>

                {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"><AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" /><p className="text-red-700">{error}</p></div>}
                {success && <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><p className="text-green-700">{t("encryptPdf.success")}</p></div>}
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: Shield, title: t("feature.private"), description: t("feature.privateDesc"), color: "bg-ocean-700" },
              { icon: Lock, title: t("feature.passwordProtected"), description: t("feature.passwordProtectedDesc"), color: "bg-ocean-500" },
              { icon: Sparkles, title: t("feature.realEncryption"), description: t("feature.realEncryptionDesc"), color: "bg-ocean-900" },
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

          <ToolContentSections prefix="encryptPdf" accent="rose" />

          <ToolsCTA title={t("cta.needMore")} subtitle={t("cta.explore")} links={[
            { to: "/tools/sign-pdf", label: t("signPdf.title"), variant: "outline" },
            { to: "/tools/compress-pdf", label: t("compressPdf.compressBtn"), variant: "outline" },
            { to: "/#tools", label: t("cta.seeAllTools"), variant: "default" },
          ]} />
        </div>
      </section>
    </>
  );
}
