import { useI18n } from "@/lib/i18n";
import { LocaleSEO } from "@/lib/locale-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle } from "lucide-react";
import Breadcrumbs from "@/components/nav/Breadcrumbs";

export default function Contact() {
  const { t } = useI18n();
  return (
    <>
      <LocaleSEO path="/contact" title={t("seo.contact.title")} description={t("seo.contact.description")} />
      <Breadcrumbs items={[{ label: t("contact.title") }]} />

      <section className="pb-4">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <MessageCircle className="w-4 h-4" /> {t("contact.title")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{t("contact.title")}</h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">{t("contact.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="max-w-xl mx-auto">
          <Card className="border border-gray-200 shadow-xl">
            <CardContent className="p-6 md:p-10 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">{t("contact.emailUs")}</p>
                <a href="mailto:support@devjov.dev" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  support@devjov.dev
                </a>
              </div>

              <Button asChild className="rounded-xl px-8 py-5 text-base font-bold">
                <a href="mailto:support@devjov.dev?subject=Seleniun%20contact&body=Hi%2C%20here%20are%20the%20details%3A">
                  <Mail className="w-4 h-4 mr-2" /> {t("contact.openApp")}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
