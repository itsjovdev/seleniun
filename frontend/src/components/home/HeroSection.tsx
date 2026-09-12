import { motion } from "framer-motion";

import { TypeAnimation } from 'react-type-animation';
import SeleniunEngine from "@/components/SeleniunEngine";
import { useI18n } from "@/lib/i18n";

export default function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden">

      <div className="container relative min-h-0 lg:min-h-[85vh] flex items-center py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center w-full">
          <div className="space-y-5 sm:space-y-6 lg:space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-muted-foreground tracking-wide uppercase text-xs sm:text-sm font-medium">
                {t("hero.badge")}
              </p>
              <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] text-foreground tracking-tight">
                {t("hero.title1")} <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                {t("hero.title2")}
              </h1>
            </motion.div>

            <div className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl min-h-[2.5rem] sm:min-h-[3rem]">
              <TypeAnimation
                sequence={[
                  t("hero.type1"), 1500,
                  t("hero.type2"), 1500,
                  t("hero.type3"), 1500,
                  t("hero.type4"), 1500,
                ]}
                wrapper="p"
                speed={50}
                repeat={Infinity}
              />
            </div>

            <p className="text-sm sm:text-base text-muted-foreground/80 leading-relaxed max-w-xl">
              {t("hero.description")}
            </p>

            <div className="flex gap-8 sm:gap-12 pt-4 sm:pt-6 border-t border-border/50">
              <div className="space-y-0.5 sm:space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">150+</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{t("hero.stat1.label")}</p>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">10+</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{t("hero.stat2.label")}</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card border border-border/60 rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-4 sm:p-6 lg:p-10 shadow-xl backdrop-blur-sm">
              <div className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 lg:mb-10 text-center tracking-wide font-medium">
                {t("hero.engineDesc")}
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-xl">
                  <SeleniunEngine />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
