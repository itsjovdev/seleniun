import { LocaleLink, useLocalePath } from "@/lib/locale-utils";
import { useI18n } from "@/lib/i18n";
import { ChevronRight } from "lucide-react";

const SITE = "https://www.seleniun.com";

export type BreadcrumbItem = {
  label: string;
  /** Path without locale prefix, e.g. "/tools" or "/tools/pdf-to-word". Omit for the current (last) item. */
  href?: string;
};

/**
 * Visible breadcrumb trail + BreadcrumbList JSON-LD, for any public page except Home.
 * The JSON-LD mirrors exactly the visible items — no hidden or invented entries.
 */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useI18n();
  const { lp, locale } = useLocalePath();

  const trail: BreadcrumbItem[] = [{ label: t("breadcrumb.home"), href: "/" }, ...items];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${SITE}${lp(item.href ?? "#")}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="container pt-24 sm:pt-28 pb-2">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-gray-500">
        {trail.map((item, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" aria-hidden="true" />}
              {isLast || !item.href ? (
                <span className="font-medium text-gray-700" aria-current="page">{item.label}</span>
              ) : (
                <LocaleLink to={item.href} className="hover:text-ocean-700 hover:underline transition-colors">
                  {item.label}
                </LocaleLink>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </nav>
  );
}
