import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LocaleLink, useLocalePath } from "@/lib/locale-utils";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import ToolsMegaMenu from "@/components/menu-herramientas/ToolsMegaMenu";
import logo from "@/assets/seleniun.png";
import { LanguageSwitcher, useI18n } from "@/lib/i18n";

export default function Header({
  variant = "transparent",
}: { variant?: "transparent" | "solid" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [desktopToolsOpen, setDesktopToolsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, locale } = useI18n();
  const { lp, stripLocale } = useLocalePath();

  // Detectar clics fuera del menú móvil para cerrarlo (solo desktop)
  useEffect(() => {
    if (!mobileOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const mobileMenu = document.getElementById("mobile-menu");
      const hamburgerButton = document.querySelector('[aria-label="Open menu"]');
      
      // Solo cierra si es mousedown (desktop) y fuera del menú
      if (mobileMenu && !mobileMenu.contains(target) && !hamburgerButton?.contains(target)) {
        setMobileOpen(false);
        setMobileToolsOpen(false);
      }
    };

    // Solo mousedown, NO touchstart
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  // Detectar cuando se abre/cierra el mega menu de Tools en desktop
  useEffect(() => {
    const handleClick = (e: any) => {
      const toolsButton = e.target.closest("[data-tools-button]");
      const toolsMenu = document.querySelector("[data-tools-menu]");

      if (toolsButton) {
        setDesktopToolsOpen(true);
      } else if (!e.target.closest("[data-tools-menu]")) {
        setDesktopToolsOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Detectar sección activa basada en scroll (solo home)
  useEffect(() => {
    if (stripLocale(pathname) !== "/") {
      setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const sections = [
        { id: "how-it-works", element: document.getElementById("how-it-works") },
        { id: "features", element: document.getElementById("features") },
        { id: "faq", element: document.getElementById("faq") },
      ];

      if (window.scrollY < 300) {
        setActiveSection("");
        return;
      }

      let currentActive = "";
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const viewportCenter = scrollTop + viewportHeight / 2;

      sections.forEach(({ id, element }) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;
          const elementBottom = elementTop + rect.height;

          if (viewportCenter >= elementTop && viewportCenter < elementBottom) {
            currentActive = id;
          }

          if (id === "faq") {
            const documentHeight = document.documentElement.scrollHeight;
            const bottomThreshold = documentHeight - viewportHeight - 100;
            if (scrollTop > bottomThreshold && rect.top < viewportHeight * 0.5) {
              currentActive = "faq";
            }
          }
        }
      });

      setActiveSection(currentActive);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const go = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();

    if (stripLocale(pathname) === "/") {

      
      const target = document.getElementById(id);
      if (target) {
        const headerOffset = 90;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
        
        // Cierra el menú DESPUÉS del scroll
        setTimeout(() => {

          setMobileOpen(false);
          setMobileToolsOpen(false);
        }, 300);
      } else {

        setMobileOpen(false);
        setMobileToolsOpen(false);
      }
    } else {

      setMobileOpen(false);
      setMobileToolsOpen(false);
      navigate(lp(`/#${id}`));
    }
  };

  const isActive = (section: string) => {
    if (stripLocale(pathname) !== "/") return false;
    if (section === "tools") return activeSection === "features";
    return activeSection === section;
  };

  const handleMobileMenuToggle = () => {

    if (mobileOpen) {
      setMobileOpen(false);
      setMobileToolsOpen(false);
    } else {
      setMobileOpen(true);
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-3 sm:top-4 z-50 bg-transparent">
        <div className="mx-auto max-w-[1080px] w-full pointer-events-auto px-3">
          <nav
            className={[
              "flex md:grid md:grid-cols-[auto_1fr_auto] items-center justify-between",
              "h-14 sm:h-16",
              "rounded-full border border-white/10 backdrop-blur-xl bg-[rgba(255,255,255,0.02)]",
              "shadow-[0_8px_24px_rgba(15,15,15,0.08)]",
              "px-4 sm:px-6",
            ].join(" ")}
            aria-label="Primary"
          >
            {/* Logo */}
            <div className="flex items-center h-14 sm:h-16 overflow-hidden shrink-0 min-w-[120px]">
              <LocaleLink to="/" className="flex items-center px-2 py-1">
                <img src={logo} alt="Seleniun logo" className="h-24 sm:h-28 md:h-32 lg:h-36 w-auto" />
              </LocaleLink>
            </div>

            {/* Menú Desktop (centrado) */}
            <div className="hidden md:flex items-center gap-0.5 text-[13px] justify-center whitespace-nowrap">
              <LocaleLink
                to="/#how-it-works"
                onClick={(e) => go("how-it-works", e)}
                className={`relative px-2.5 py-1.5 rounded-full transition-all duration-200 ${
                  isActive("how-it-works")
                    ? "text-white bg-ocean-700 shadow-lg scale-105"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
                }`}
              >{t("nav.howItWorks")}
              </LocaleLink>

              <LocaleLink
                to="/#features"
                onClick={(e) => go("features", e)}
                className={`relative px-2.5 py-1.5 rounded-full transition-all duration-200 ${
                  isActive("features")
                    ? "text-white bg-ocean-700 shadow-lg scale-105"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
                }`}
              >
                {t("nav.features")}
              </LocaleLink>

              <LocaleLink
                to="/ai-docs"
                className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all duration-200 ${
                  stripLocale(pathname).startsWith("/ai-docs")
                    ? "text-white bg-ocean-700 shadow-lg scale-105"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
                }`}
              >
                <span>{t("nav.aiWriter")}</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400 text-white shadow-md"
                  title="Nueva función 🚀"
                >{t("nav.new")}</span>
              </LocaleLink>

              <ToolsMegaMenu />

              <LocaleLink
                to="/#faq"
                onClick={(e) => go("faq", e)}
                className={`relative px-2.5 py-1.5 rounded-full transition-all duration-200 ${
                  isActive("faq")
                    ? "text-white bg-ocean-700 shadow-lg scale-105"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
                }`}
              >
                {t("nav.faq")}
              </LocaleLink>
            </div>

            {/* Language Switcher (desktop) */}
            <div className="hidden md:flex items-center justify-end">
              <LanguageSwitcher />
            </div>

            {/* Burger móvil */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-full p-2 hover:bg-white/20 transition text-gray-700"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={handleMobileMenuToggle}
            >
              {mobileOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </nav>
        </div>

        {/* Panel móvil */}
        {mobileOpen && (
          <div className="md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="container mt-2 pb-4">
              <div
                id="mobile-menu"
                className="rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl p-2 shadow-xl max-h-[80vh] overflow-y-auto"
              >
              {/* How it works */}
              <LocaleLink
                to="/#how-it-works"
                data-menu-item="how-it-works"
                onClick={(e) => go("how-it-works", e)}
                className={`block w-full text-left px-3 py-3 rounded-xl font-medium transition-all ${
                  isActive("how-it-works")
                    ? "bg-ocean-700 text-white shadow-md"
                    : "hover:bg-white/20 text-gray-700"
                }`}
              >{t("nav.howItWorks")}</LocaleLink>

              {/* Features */}
              <LocaleLink
                to="/#features"
                data-menu-item="features"
                onClick={(e) => go("features", e)}
                className={`block w-full text-left px-3 py-3 rounded-xl font-medium transition-all ${
                  isActive("features")
                    ? "bg-ocean-700 text-white shadow-md"
                    : "hover:bg-white/20 text-gray-700"
                }`}
              >{t("nav.features")}</LocaleLink>

              {/* AI Writer */}
              <LocaleLink
                to="/ai-docs"
                data-menu-item="ai-writer"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileToolsOpen(false);
                }}
                className={`block w-full text-left px-3 py-3 rounded-xl font-medium transition-all relative ${
                  stripLocale(pathname).startsWith("/ai-docs")
                    ? "bg-ocean-700 text-white shadow-md"
                    : "hover:bg-white/20 text-gray-700"
                }`}
              >{t("nav.aiWriter")}<span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-900">{t("nav.new")}</span>
              </LocaleLink>

              {/* Tools móvil */}
              <button
                data-menu-item="tools"
                onClick={() => setMobileToolsOpen((v) => !v)}
                className={`
                  w-full mt-1 flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all font-medium
                  ${
                    mobileToolsOpen
                      ? "bg-ocean-700 text-white border-ocean-500/30 shadow-lg transform scale-[1.02]"
                      : "border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30 text-gray-700"
                  }
                  border
                `}
                aria-expanded={mobileToolsOpen}
                aria-controls="mobile-tools-sheet"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      mobileToolsOpen ? "bg-white/80" : "bg-ocean-500"
                    }`}
                  />
                  <span>{t("nav.tools")}</span>
                </div>
                <div className="flex items-center gap-2">
                  {mobileToolsOpen && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{t("nav.tools")}</span>}
                  <span className={`transition-transform duration-300 ${mobileToolsOpen ? "rotate-180" : ""}`}>▾</span>
                </div>
              </button>

              <div
                id="mobile-tools-sheet"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  mobileToolsOpen ? "max-h-[400px] opacity-100 mt-2 mb-2" : "max-h-0 opacity-0 mt-0 mb-0"
                }`}
              >
                <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-xl">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <div className="w-1 h-3 bg-ocean-500 rounded-full"></div>
                    {t("nav.basicTools")}
                  </div>
                  <ToolsMegaMenu 
                    mobile 
                    onItemClick={() => {

                      setTimeout(() => {
                        setMobileOpen(false);
                        setMobileToolsOpen(false);
                      }, 100);
                    }} 
                  />
                </div>
              </div>

              {/* Language */}
              <div className="px-3 py-2">
                <LanguageSwitcher className="w-full justify-center" />
              </div>

              {/* FAQ */}
              <LocaleLink
                to="/#faq"
                data-menu-item="faq"
                onClick={(e) => go("faq", e)}
                className={`block w-full text-left px-3 py-3 rounded-xl font-medium transition-all ${
                  isActive("faq")
                    ? "bg-ocean-700 text-white shadow-md"
                    : "hover:bg-white/20 text-gray-700"
                }`}
              >{t("nav.faq")}</LocaleLink>
            </div>
          </div>
        </div>
        )}
      </header>

      <div aria-hidden className="pointer-events-none h-[68px] sm:h-20" />
    </>
  );
}