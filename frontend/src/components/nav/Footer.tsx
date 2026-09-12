import { LocaleLink as Link } from "@/lib/locale-utils";
import { Instagram } from "lucide-react";
import logo from "@/assets/seleniunsvg.svg";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-[#0b1220] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-5">
            <img src={logo} alt="Seleniun" className="h-10 w-auto object-contain" />
            <p className="text-gray-400 leading-relaxed max-w-sm">
              {t("footer.desc")}
            </p>
            <a
              href="https://www.instagram.com/seleniun_com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          </div>

          <div>
            <p className="text-sm font-semibold mb-5 text-white">{t("footer.legal")}</p>
            <ul className="space-y-3 text-sm">
              <li><Link to="/legal/terms" className="text-gray-400 hover:text-white transition">{t("footer.terms")}</Link></li>
              <li><Link to="/legal/privacy" className="text-gray-400 hover:text-white transition">{t("footer.privacy")}</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-5 text-white">{t("footer.support")}</p>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">{t("footer.contact")}</Link></li>
              <li><Link to="/improve" className="text-gray-400 hover:text-white transition">{t("footer.feedback")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="my-10 h-px bg-white/10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>&copy; {year} Seleniun. {t("footer.rights")}</p>
          <div className="flex gap-6">
            <Link to="/legal/privacy" className="hover:text-white transition">{t("footer.privacy")}</Link>
            <Link to="/legal/terms" className="hover:text-white transition">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
