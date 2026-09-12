import { useI18n } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";

const ACCENT_TEXT: Record<string, string> = {
  blue: "text-blue-600",
  red: "text-red-500",
  amber: "text-amber-600",
  ocean: "text-ocean-700",
  teal: "text-teal-600",
  rose: "text-rose-600",
  emerald: "text-emerald-600",
};

const ACCENT_BG: Record<string, string> = {
  blue: "bg-blue-50 border-blue-100",
  red: "bg-red-50 border-red-100",
  amber: "bg-amber-50 border-amber-100",
  ocean: "bg-ocean-50 border-ocean-100",
  teal: "bg-teal-50 border-teal-100",
  rose: "bg-rose-50 border-rose-100",
  emerald: "bg-emerald-50 border-emerald-100",
};

/**
 * Real, tool-specific content: how it works, why use Seleniun, common use cases
 * and a short FAQ (with FAQPage JSON-LD). Text comes from i18n keys under
 * `content.<prefix>.*` — same content is mirrored in scripts/prerender.ts so it
 * exists in the initial HTML without JavaScript.
 */
export default function ToolContentSections({ prefix, accent = "ocean" }: { prefix: string; accent?: string }) {
  const { t } = useI18n();
  const c = (key: string) => t(`content.${prefix}.${key}`);
  const accentText = ACCENT_TEXT[accent] ?? ACCENT_TEXT.ocean;
  const accentBg = ACCENT_BG[accent] ?? ACCENT_BG.ocean;

  const faqItems = [1, 2, 3, 4].map((n) => ({
    q: c(`faqQ${n}`),
    a: c(`faqA${n}`),
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="mt-14 space-y-12">
      {/* How it works */}
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{c("howTitle")}</h2>
        <ol className="space-y-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-start gap-3">
              <span className={`flex-shrink-0 w-6 h-6 rounded-full ${accentBg} border flex items-center justify-center text-xs font-bold ${accentText}`}>
                {n}
              </span>
              <p className="text-gray-600 leading-relaxed">{c(`step${n}`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Why use Seleniun */}
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{c("whyTitle")}</h2>
        <ul className="space-y-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-start gap-3">
              <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${accentText}`} />
              <p className="text-gray-600 leading-relaxed">{c(`benefit${n}`)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Use cases */}
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{c("useCasesTitle")}</h2>
        <ul className="grid sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className={`rounded-xl border p-4 text-sm text-gray-600 leading-relaxed ${accentBg}`}>
              {c(`useCase${n}`)}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{c("faqTitle")}</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{item.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </section>
    </div>
  );
}
