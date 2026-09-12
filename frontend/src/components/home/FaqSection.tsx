"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { FAQ_ITEMS } from "@/constants/homeData";
import { useI18n } from "@/lib/i18n";

interface FaqSectionProps {
  openFaq: number | null;
  setOpenFaq: (i: number | null) => void;
}

export default function FaqSection({ openFaq, setOpenFaq }: FaqSectionProps) {
  const { t } = useI18n();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: t(item.qKey),
      acceptedAnswer: { "@type": "Answer", text: t(item.aKey) },
    })),
  };

  return (
    <section id="faq" className="py-16 sm:py-20 md:py-32 bg-background border-t border-border">
      <div className="container max-w-4xl px-4 sm:px-6">
        <header className="text-center mb-10 sm:mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-secondary text-primary px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-border mb-4 sm:mb-6">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="uppercase tracking-widest">{t("faq.badge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            {t("faq.title")}
          </h2>
        </header>

        <div className="space-y-3 sm:space-y-4">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <motion.div
                key={i}
                initial={false}
                className={`overflow-hidden rounded-xl border transition-colors duration-300 ${
                  isOpen ? "border-primary bg-card" : "border-border bg-transparent hover:bg-secondary/50"
                }`}
              >
                <h3 className="m-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between p-5 md:p-6 text-left outline-none"
                  >
                    <span className={`text-base sm:text-lg font-bold transition-colors ${isOpen ? "text-primary" : "text-foreground"}`}>
                      {t(item.qKey)}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className={`flex-shrink-0 ml-4 p-1 rounded-full ${isOpen ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                        <div className="p-3 sm:p-5 rounded-lg bg-secondary/80 border border-border text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg">
                          {t(item.aKey)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <p className="text-sm text-muted-foreground/50 font-medium italic">
            {t("faq.disclaimer")}
          </p>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
}
