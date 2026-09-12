import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Mail, Bug, Palette, Gauge } from "lucide-react";
import Breadcrumbs from "@/components/nav/Breadcrumbs";

export default function Improve() {
  const { t } = useI18n();

  const ideas = [
    { icon: Lightbulb, text: t("improve.idea1"), color: "text-amber-500" },
    { icon: Bug, text: t("improve.idea2"), color: "text-red-500" },
    { icon: Palette, text: t("improve.idea3"), color: "text-violet-500" },
    { icon: Gauge, text: t("improve.idea4"), color: "text-blue-500" },
  ];

  return (
    <>
      <LocaleSEO path="/improve" title={t("seo.improve.title")} description={t("seo.improve.description")} />
      <Breadcrumbs items={[{ label: t("improve.title") }]} />

      <section className="pb-4">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Lightbulb className="w-4 h-4" /> {t("improve.badge")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{t("improve.title")}</h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{t("improve.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="max-w-3xl mx-auto">
          <Card className="border border-gray-200 shadow-xl">
            <CardContent className="p-6 md:p-10 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t("improve.whatToSend")}</h2>
                <div className="space-y-3">
                  {ideas.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <item.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.color}`} />
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button asChild className="rounded-xl px-6 py-5 text-base font-bold">
                  <a href="mailto:support@devjov.dev?subject=Seleniun%20feedback&body=Feature%2Fbug%20description%3A%0A%0AExpected%20result%3A%0A%0AActual%20result%3A%0A%0AFile%20size%20%28if%20relevant%29%3A%0A">
                    <Mail className="w-4 h-4 mr-2" /> {t("improve.sendBtn")}
                  </a>
                </Button>
                <p className="text-sm text-gray-400">{t("improve.emailLabel")} <a className="text-blue-600 hover:underline font-medium" href="mailto:support@devjov.dev">support@devjov.dev</a></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
