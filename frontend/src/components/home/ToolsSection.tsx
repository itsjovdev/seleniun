"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Rocket, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocaleLink as RouterLink } from "@/lib/locale-utils";
import { PDF_TOOLS, AI_TOOLS } from "@/constants/homeData";
import { useI18n } from "@/lib/i18n";

const getFunctionalColor = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("excel")) return "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:border-emerald-300";
  if (t.includes("word")) return "text-blue-600 bg-blue-50 border-blue-100 group-hover:border-blue-300";
  if (t.includes("pdf") || t.includes("compress") || t.includes("merge")) {
    if (t.includes("excel") || t.includes("word")) return getFunctionalColor(t.split("\u2192")[0].trim());
    return "text-red-600 bg-red-50 border-red-100 group-hover:border-red-300";
  }
  if (t.includes("encrypt") || t.includes("sign")) return "text-slate-600 bg-slate-50 border-slate-200 group-hover:border-slate-400";
  return "text-primary bg-secondary border-border";
};

export default function ToolsSection() {
  const { t } = useI18n();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <section id="features" className="py-16 sm:py-20 md:py-32 bg-background scroll-mt-20">
      <div className="container max-w-7xl px-4 sm:px-6">
        <div className="mb-14 sm:mb-18 md:mb-24">
          <header className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10 md:mb-12 border-b border-border pb-4 sm:pb-6">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
              <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground uppercase">{t("tools.standardUtilities")}</h2>
          </header>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {PDF_TOOLS.map((tool, i) => {
              const colorStyles = getFunctionalColor(tool.title);
              return (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="group relative h-full border border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                    <CardHeader className="text-center pt-5 sm:pt-6 md:pt-8 px-3 sm:px-4 md:px-6">
                      <div className={`mx-auto mb-3 sm:mb-4 md:mb-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:rotate-3 ${colorStyles}`}>
                        <tool.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                      </div>
                      <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                        {t(tool.titleKey)}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 line-clamp-2">
                        {t(tool.descKey)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 sm:pb-6 md:pb-8 px-3 sm:px-4 md:px-6">
                      <Button asChild variant="outline" className="w-full border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                        <RouterLink to={tool.to} className="flex items-center justify-center gap-2">
                          {t(tool.ctaKey)} <ExternalLink className="w-3.5 h-3.5" />
                        </RouterLink>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="mt-12 pt-12 sm:mt-16 sm:pt-16 md:mt-20 md:pt-20 border-t border-border/50">
          <header className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10 md:mb-12">
            <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground uppercase">{t("tools.aiPowerUps")}</h2>
          </header>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          >
            {AI_TOOLS.map((tool, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className={`group h-full border ${tool.live ? 'border-border' : 'border-dashed border-muted'} bg-card transition-all`}>
                  <CardHeader className="pt-6 sm:pt-8 md:pt-10 px-4 sm:px-6 md:px-8">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 sm:mb-6 transition-transform group-hover:-rotate-6 ${tool.live ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-muted text-muted-foreground'}`}>
                      <tool.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-foreground">{t(tool.titleKey)}</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3">{t(tool.descKey)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6 sm:pb-8 md:pb-10 px-4 sm:px-6 md:px-8">
                    {tool.live ? (
                      <Button asChild className="w-full bg-foreground hover:bg-primary text-background hover:text-primary-foreground transition-all duration-300">
                        <RouterLink to={tool.to!}>{t("tools.launchAi")}</RouterLink>
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">{t("tools.comingSoon")}</span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
