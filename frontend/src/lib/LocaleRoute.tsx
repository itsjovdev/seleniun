import { useEffect } from "react";
import { Outlet, useParams, Navigate, useLocation } from "react-router-dom";
import { useI18n, type Locale } from "@/lib/i18n";

export default function LocaleRoute() {
  const { locale } = useParams<{ locale: string }>();
  const { setLocale } = useI18n();
  const location = useLocation();

  const isValid = locale === "en" || locale === "es";

  useEffect(() => {
    if (isValid) {
      setLocale(locale as Locale);
    }
  }, [locale, isValid, setLocale]);

  if (!isValid) {
    const stored = localStorage.getItem("seleniun-locale");
    const detectedLocale = (stored === "en" || stored === "es") ? stored : "en";
    const rest = location.pathname.replace(/^\/[^/]+/, "");
    return <Navigate to={`/${detectedLocale}${rest || "/"}`} replace />;
  }

  return <Outlet />;
}