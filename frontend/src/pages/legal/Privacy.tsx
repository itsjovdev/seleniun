import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import { Shield, Server, Brain, BarChart3, User, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumbs from "@/components/nav/Breadcrumbs";

export default function Privacy() {
  const { t } = useI18n();

  const sections = [
    { icon: Server, title: t("privacy.noStoreTitle"), desc: t("privacy.noStoreDesc"), color: "bg-blue-600" },
    { icon: Brain, title: t("privacy.noTrainTitle"), desc: t("privacy.noTrainDesc"), color: "bg-violet-600" },
    { icon: BarChart3, title: t("privacy.minimalTitle"), desc: t("privacy.minimalDesc"), color: "bg-amber-500" },
    { icon: User, title: t("privacy.independentTitle"), desc: t("privacy.independentDesc"), color: "bg-green-600" },
  ];

  return (
    <>
      <LocaleSEO path="/legal/privacy" title={t("seo.privacy.title")} description={t("seo.privacy.description")} />
      <Breadcrumbs items={[{ label: t("privacy.title") }]} />

      <section className="pb-4">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Shield className="w-4 h-4" /> {t("privacy.title")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{t("privacy.title")}</h1>
            <p className="text-sm text-gray-400 mb-6">{t("privacy.lastUpdated")}</p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{t("privacy.intro")}</p>
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
                <h2 className="font-bold text-gray-900 mb-1">{t("privacy.contactTitle")}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("privacy.contactDesc")}{" "}
                  <a href="mailto:support@devjov.dev" className="text-blue-600 hover:underline font-medium">support@devjov.dev</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
