import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import { FileText, ShieldOff, AlertTriangle, Heart, RefreshCw, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumbs from "@/components/nav/Breadcrumbs";

export default function Terms() {
  const { t } = useI18n();

  const sections = [
    { icon: ShieldOff, title: t("terms.noWarrantyTitle"), desc: t("terms.noWarrantyDesc"), color: "bg-red-500" },
    { icon: AlertTriangle, title: t("terms.riskTitle"), desc: t("terms.riskDesc"), color: "bg-amber-500" },
    { icon: Heart, title: t("terms.freeTitle"), desc: t("terms.freeDesc"), color: "bg-green-600" },
    { icon: RefreshCw, title: t("terms.changesTitle"), desc: t("terms.changesDesc"), color: "bg-violet-600" },
  ];

  return (
    <>
      <LocaleSEO path="/legal/terms" title={t("seo.terms.title")} description={t("seo.terms.description")} />
      <Breadcrumbs items={[{ label: t("terms.title") }]} />

      <section className="pb-4">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <FileText className="w-4 h-4" /> {t("terms.title")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{t("terms.title")}</h1>
            <p className="text-sm text-gray-400 mb-6">{t("terms.lastUpdated")}</p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{t("terms.intro")}</p>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {sections.map((s, i) => (
            <Card key={i} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className={`flex-shrink-0 w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 mb-1">{s.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1">{t("terms.contactTitle")}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("terms.contactDesc")}{" "}
                  <a href="mailto:support@devjov.dev" className="text-violet-600 hover:underline font-medium">support@devjov.dev</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
