import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { translations, type Locale } from "./i18n-data";

export type { Locale };

type I18nContextType = { locale: Locale; setLocale: (l: Locale) => void; t: (k: string) => string; };
const I18nContext = createContext<I18nContextType | null>(null);

function getDefaultLocale(): Locale {
  const s = localStorage.getItem("seleniun-locale");
  if (s === "en" || s === "es") return s;
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getDefaultLocale);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const setLocale = useCallback((nl: Locale) => {
    setLocaleState(nl);
    localStorage.setItem("seleniun-locale", nl);
    document.documentElement.lang = nl;
  }, []);
  const t = useCallback((key: string): string => {
    const e = translations[key];
    if (!e) return key;
    return e[locale] ?? e["en"] ?? key;
  }, [locale]);
  return (<I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>);
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale } = useI18n();
  const getHref = (target: "en" | "es") => {
    if (typeof window === "undefined") return `/${target}/`;
    return window.location.pathname.replace(/^\/(en|es)(\/|$)/, `/${target}$2`) + window.location.search + window.location.hash;
  };
  return (
    <div className={"inline-flex items-center rounded-full backdrop-blur-xl bg-white/10 border border-white/20 p-0.5 select-none " + className}>
      <a
        href={locale === "en" ? undefined : getHref("en")}
        className={
          "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 " +
          (locale === "en"
            ? "bg-ocean-700 text-white shadow-md"
            : "text-gray-500 hover:text-gray-700 cursor-pointer")
        }
        aria-label="Switch to English"
      >
        EN
      </a>
      <a
        href={locale === "es" ? undefined : getHref("es")}
        className={
          "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 " +
          (locale === "es"
            ? "bg-ocean-700 text-white shadow-md"
            : "text-gray-500 hover:text-gray-700 cursor-pointer")
        }
        aria-label="Cambiar a español"
      >
        ES
      </a>
    </div>
  );
}
