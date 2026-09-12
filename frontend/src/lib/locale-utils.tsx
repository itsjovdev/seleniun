import { useMemo } from "react";
import { Link, useLocation, useParams, Navigate, type LinkProps } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useI18n, type Locale } from "@/lib/i18n";

const SITE = "https://www.seleniun.com";

export function useLocalePath() {
  const { locale } = useI18n();
  return useMemo(() => ({
    lp: (p: string) => `/${locale}${p.startsWith("/") ? p : "/" + p}`,
    locale,
    stripLocale: (pathname: string) => pathname.replace(/^\/(en|es)(\/|$)/, "$2") || "/",
  }), [locale]);
}

export function LocaleLink({ to, ...props }: LinkProps) {
  const { locale } = useI18n();
  const toStr = typeof to === "string" ? to : to.pathname || "";
  const prefixed = toStr.startsWith("/") && !toStr.match(/^\/(en|es)(\/|$)/)
    ? `/${locale}${toStr}`
    : toStr;
  return <Link {...props} to={prefixed} />;
}

export function LocaleSEO({ path, title, description }: { path: string; title: string; description: string }) {
  const { locale } = useI18n();
  const cleanPath = path === "/" ? "" : path;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${SITE}/${locale}${cleanPath}`} />
      <link rel="alternate" hreflang="en" href={`${SITE}/en${cleanPath}`} />
      <link rel="alternate" hreflang="es" href={`${SITE}/es${cleanPath}`} />
      <link rel="alternate" hreflang="x-default" href={`${SITE}/en${cleanPath}`} />
      <meta property="og:url" content={`${SITE}/${locale}${cleanPath}`} />
      <meta property="og:locale" content={locale === "es" ? "es_ES" : "en_US"} />
    </Helmet>
  );
}

export function LocaleRedirect() {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("seleniun-locale") : null;
  let locale: Locale = "en";
  if (stored === "en" || stored === "es") {
    locale = stored;
  } else if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("es")) {
    locale = "es";
  }
  return <Navigate to={`/${locale}/`} replace />;
}

export function LegacyRedirect() {
  const location = useLocation();
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("seleniun-locale") : null;
  let locale: Locale = "en";
  if (stored === "en" || stored === "es") locale = stored;
  return <Navigate to={`/${locale}${location.pathname}${location.search}${location.hash}`} replace />;
}