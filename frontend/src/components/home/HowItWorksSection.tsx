"use client";

import { motion, type Variants } from "framer-motion";
import { Sparkles } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/constants/homeData";
import { useI18n } from "@/lib/i18n";

export default function HowItWorksSection() {
  const { t } = useI18n();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section id="how-it-works" className="py-16 sm:py-20 md:py-32 bg-background scroll-mt-20">
      <div className="container max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-secondary text-muted-foreground px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold mb-4 sm:mb-6 border border-border">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span className="uppercase tracking-widest">{t("howItWorks.badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 sm:mb-6 tracking-tight">
            {t("howItWorks.title")}
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("howItWorks.subtitle")}
          </p>
        </motion.header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
        >
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="group relative p-5 sm:p-6 md:p-8 rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-sm"
            >
              <div className="absolute top-4 sm:top-6 right-5 sm:right-8 text-4xl sm:text-5xl font-black text-secondary group-hover:text-border/50 transition-colors select-none">
                0{i + 1}
              </div>
              <div className="relative">
                <div className="mb-5 sm:mb-6 md:mb-8 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
                  <step.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                  {t(step.titleKey)}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {t(step.descKey)}
                </p>
              </div>
              <div className="absolute bottom-0 left-5 right-5 sm:left-8 sm:right-8 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full opacity-50" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-12 md:mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground/60 font-medium">
            {t("howItWorks.footer")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
