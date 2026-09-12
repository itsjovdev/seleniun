import { useI18n } from "@/lib/i18n";
import { LocaleLink as Link } from "@/lib/locale-utils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type CtaLink = {
  to: string;
  label: string;
  variant?: "default" | "outline";
};

export default function ToolsCTA({
  title = "Need more tools?",
  subtitle = "Explore our other document conversion and optimization utilities.",
  links = [],
  className = "",
}: {
  title?: string;
  subtitle?: string;
  links?: CtaLink[];
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <section className={`mt-16 ${className}`}>
      <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-10">
        <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr]">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
              <Sparkles className="h-3.5 w-3.5" />
              {t("cta.documentTools")}
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 md:text-[28px]">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-500 md:text-base">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
            {links.map((l, i) => (
              <Link key={i} to={l.to} className="shrink-0">
                <Button
                  variant={l.variant === "outline" ? "outline" : "default"}
                  className={`rounded-xl px-4 py-5 md:px-5 ${
                    l.variant === "outline"
                      ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      : "bg-ocean-700 text-white hover:bg-ocean-900"
                  }`}
                >
                  <span className="text-sm md:text-base">{l.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
