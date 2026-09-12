
import { LocaleSEO } from "@/lib/locale-utils";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "@/components/nav/Header";
import { useI18n } from "@/lib/i18n";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ToolsSection from "@/components/home/ToolsSection";
import FaqSection from "@/components/home/FaqSection";

export default function Index() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  return (
    <>
      <LocaleSEO path="/" title={t("seo.home.title")} description={t("seo.home.description")} />

      {/* Fondo limpio */}
      <div className="fixed inset-0 bg-background -z-10" />

      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      <main className="relative pt-28">
        <HeroSection />
        <HowItWorksSection />
        <ToolsSection />
        <FaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />
      </main>
    </>
  );
}