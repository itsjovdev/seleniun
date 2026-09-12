// scripts/prerender.ts
//
// Build-time static prerender for Seleniun's public routes.
//
// WHY THIS EXISTS
// Seleniun is a client-rendered Vite/React SPA. Without this step, every public
// URL served the exact same generic dist/index.html shell — title, meta
// description, canonical, hreflang, H1, breadcrumbs and FAQ only existed once
// react-helmet-async and React mounted in the browser. Any client that does not
// execute JavaScript (curl, most non-Google crawlers, some AI search bots) saw
// no page-specific content at all. This script runs after `vite build` and
// writes one fully-formed index.html per public route (EN + ES), reusing the
// exact same translation strings the React app already renders
// (src/lib/i18n-data.ts is the single source of truth for both). It does NOT
// render the React component tree in Node — it only injects
// title/meta/link/h1/copy/JSON-LD strings into the already-built client shell,
// so there is zero risk of the many browser-only libraries used deeper in the
// app (pdf-lib, pdfjs-dist, signature_pad, TipTap, framer-motion, etc.)
// executing in a Node/SSR context.
//
// After the browser loads a prerendered file, main.tsx's createRoot(...).render()
// takes over and fully re-renders the app client-side as it always has — the
// static markup is not hydrated, just replaced. This keeps behavior identical
// to today for every interactive feature.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { translations } from "../src/lib/i18n-data.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE = "https://www.seleniun.com";
const LOCALES = ["en", "es"] as const;
type Locale = (typeof LOCALES)[number];

function t(key: string, locale: Locale): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[locale] ?? entry.en ?? key;
}

function esc(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ld(schema: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

// ---------------------------------------------------------------------------
// Head (SEO metadata) — mirrors src/lib/locale-utils.tsx's <LocaleSEO> exactly
// ---------------------------------------------------------------------------
function buildSeo(locale: Locale, cleanPath: string, titleKey: string, descKey: string) {
  const title = t(titleKey, locale);
  const description = t(descKey, locale);
  const canonical = `${SITE}/${locale}${cleanPath}`;
  const enUrl = `${SITE}/en${cleanPath}`;
  const esUrl = `${SITE}/es${cleanPath}`;
  const ogLocale = locale === "es" ? "es_ES" : "en_US";
  return { title, description, canonical, enUrl, esUrl, ogLocale };
}

function injectHead(html: string, seo: ReturnType<typeof buildSeo>): string {
  html = html.replace(/<title>.*?<\/title>/s, `<title>${esc(seo.title)}</title>`);
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${esc(seo.description)}" />`
  );
  // The base template already has one static og:url and one og:locale tag
  // (index.html's site-wide defaults). Overwrite them in place instead of
  // appending new ones, so the page never ships two of either.
  html = html.replace(
    /<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${seo.canonical}" />`
  );
  html = html.replace(
    /<meta property="og:locale"[^>]*>/,
    `<meta property="og:locale" content="${seo.ogLocale}" />`
  );
  const extraTags = [
    `<link rel="canonical" href="${seo.canonical}" />`,
    `<link rel="alternate" hreflang="en" href="${seo.enUrl}" />`,
    `<link rel="alternate" hreflang="es" href="${seo.esUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${seo.enUrl}" />`,
  ].join("\n    ");
  return html.replace("</head>", `    ${extraTags}\n  </head>`);
}

function injectLang(html: string, locale: Locale): string {
  return html.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`);
}

// The bare "/" root is not one of the 15 canonical routes — it has no page
// content of its own, only a client-side redirect to /en/ or /es/ (see
// LocaleRedirect in src/lib/locale-utils.tsx). Before this fix it shipped
// with zero canonical/hreflang signal, which a Google Search Console
// inspection (2026-08) showed Google treating ambiguously against /es/ and
// /en/. This adds canonical + hreflang (pointing at /en, matching the
// x-default already used everywhere else on the site) without touching its
// title, description, H1, or body — it still isn't a "page", just no longer
// an untagged one.
function injectRootCanonicalHreflang(html: string): string {
  const enUrl = `${SITE}/en`;
  const esUrl = `${SITE}/es`;
  const extraTags = [
    `<link rel="canonical" href="${enUrl}" />`,
    `<link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `<link rel="alternate" hreflang="es" href="${esUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${enUrl}" />`,
  ].join("\n    ");
  return html.replace("</head>", `    ${extraTags}\n  </head>`);
}

function injectBody(html: string, bodyHtml: string): string {
  return html.replace(
    '<div id="root"></div>',
    `<div id="root"><div data-prerender="seo">\n${bodyHtml}\n    </div></div>`
  );
}

// ---------------------------------------------------------------------------
// Breadcrumbs — mirrors src/components/nav/Breadcrumbs.tsx exactly
// ---------------------------------------------------------------------------
type Crumb = { label: string; cleanPath?: string }; // cleanPath omitted => current page

function breadcrumbHtml(locale: Locale, trail: Crumb[]): string {
  const full: Crumb[] = [{ label: t("breadcrumb.home", locale), cleanPath: "" }, ...trail];
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: full.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${SITE}/${locale}${(item.cleanPath ?? "").replace("/#tools", "")}`,
    })),
  };
  const visible = full
    .map((item, i) => {
      const isLast = i === full.length - 1;
      if (isLast || item.cleanPath === undefined) {
        return `<span class="crumb-current">${esc(item.label)}</span>`;
      }
      return `<a href="/${locale}${item.cleanPath}">${esc(item.label)}</a>`;
    })
    .join(' <span class="crumb-sep">/</span> ');
  return `<nav aria-label="Breadcrumb">${visible}</nav>\n${ld(schema)}`;
}

// ---------------------------------------------------------------------------
// Tool content sections — mirrors src/components/nav/ToolContentSections.tsx
// ---------------------------------------------------------------------------
function toolContentHtml(locale: Locale, prefix: string): string {
  const c = (key: string) => t(`content.${prefix}.${key}`, locale);
  const faqItems = [1, 2, 3, 4].map((n) => ({ q: c(`faqQ${n}`), a: c(`faqA${n}`) }));
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return [
    `<h2>${esc(c("howTitle"))}</h2>`,
    `<ol>${[1, 2, 3].map((n) => `<li>${esc(c(`step${n}`))}</li>`).join("")}</ol>`,
    `<h2>${esc(c("whyTitle"))}</h2>`,
    `<ul>${[1, 2, 3].map((n) => `<li>${esc(c(`benefit${n}`))}</li>`).join("")}</ul>`,
    `<h2>${esc(c("useCasesTitle"))}</h2>`,
    `<ul>${[1, 2, 3].map((n) => `<li>${esc(c(`useCase${n}`))}</li>`).join("")}</ul>`,
    `<h2>${esc(c("faqTitle"))}</h2>`,
    faqItems.map((item) => `<h3>${esc(item.q)}</h3><p>${esc(item.a)}</p>`).join("\n"),
    ld(faqSchema),
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Body content builders — each mirrors the exact JSX already rendered by the
// corresponding React page component. No new copy is introduced anywhere below.
// ---------------------------------------------------------------------------
function badge(text: string): string {
  return `      <p>${esc(text)}</p>`;
}

type RelatedLink = { cleanPath: string; labelKey: string };

// Mirrors src/components/nav/ToolsCTA.tsx exactly — same links, same labels,
// same order as the <ToolsCTA> already rendered on each tool page. Real <a href>
// tags so a plain curl (no JS) can already find the cross-links between tools.
function relatedLinksHtml(locale: Locale, links: RelatedLink[]): string {
  const items = links
    .map((l) => {
      const href = l.cleanPath.startsWith("/#")
        ? `/${locale}${l.cleanPath}`
        : `/${locale}${l.cleanPath}`;
      return `<li><a href="${href}">${esc(t(l.labelKey, locale))}</a></li>`;
    })
    .join("");
  return [
    `      <h2>${esc(t("cta.needMore", locale))}</h2>`,
    `      <p>${esc(t("cta.explore", locale))}</p>`,
    `      <ul>${items}</ul>`,
  ].join("\n");
}

function toolPage(locale: Locale, opts: {
  toolTitleKey: string;
  badgeKey: string;
  h1: string;
  subtitleKey: string;
  freeSecureFast: boolean;
  contentPrefix: string;
  relatedLinks: RelatedLink[];
}): string {
  const subtitle = t(opts.subtitleKey, locale);
  const suffix = opts.freeSecureFast ? ` ${t("tool.freeSecureFast", locale)}` : "";
  return [
    breadcrumbHtml(locale, [
      { label: t("breadcrumb.tools", locale), cleanPath: "/#tools" },
      { label: t(opts.toolTitleKey, locale) },
    ]),
    badge(t(opts.badgeKey, locale)),
    `      <h1>${esc(opts.h1)}</h1>`,
    `      <p>${esc(subtitle)}${suffix ? " " + esc(suffix.trim()) : ""}</p>`,
    toolContentHtml(locale, opts.contentPrefix),
    relatedLinksHtml(locale, opts.relatedLinks),
  ].join("\n");
}

function legalPage(locale: Locale, opts: {
  h1Key: string;
  lastUpdatedKey?: string;
  introKey: string;
  sections: Array<{ titleKey: string; descKey: string }>;
  contactTitleKey?: string;
  contactDescKey?: string;
}): string {
  const lines: string[] = [breadcrumbHtml(locale, [{ label: t(opts.h1Key, locale) }])];
  lines.push(`      <h1>${esc(t(opts.h1Key, locale))}</h1>`);
  if (opts.lastUpdatedKey) lines.push(`      <p>${esc(t(opts.lastUpdatedKey, locale))}</p>`);
  lines.push(`      <p>${esc(t(opts.introKey, locale))}</p>`);
  for (const s of opts.sections) {
    lines.push(`      <h2>${esc(t(s.titleKey, locale))}</h2>`);
    lines.push(`      <p>${esc(t(s.descKey, locale))}</p>`);
  }
  if (opts.contactTitleKey && opts.contactDescKey) {
    lines.push(`      <h2>${esc(t(opts.contactTitleKey, locale))}</h2>`);
    lines.push(`      <p>${esc(t(opts.contactDescKey, locale))} support@devjov.dev</p>`);
  }
  return lines.join("\n");
}

function buildHome(locale: Locale): string {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ["q1", "q2", "q3", "q4", "q5", "q6", "q7"].map((n) => ({
      "@type": "Question",
      name: t(`faq.${n}`, locale),
      acceptedAnswer: { "@type": "Answer", text: t(`faq.a${n.slice(1)}`, locale) },
    })),
  };
  return [
    badge(t("hero.badge", locale)),
    `      <h1>${esc(t("hero.title1", locale))} ${esc(t("hero.title2", locale))}</h1>`,
    `      <p>${esc(t("hero.type1", locale))}</p>`,
    `      <p>${esc(t("hero.description", locale))}</p>`,
    `      <h2>${esc(t("howItWorks.title", locale))}</h2>`,
    `      <p>${esc(t("howItWorks.subtitle", locale))}</p>`,
    `      <h2>${esc(t("faq.title", locale))}</h2>`,
    ...["q1", "q2", "q3", "q4", "q5", "q6", "q7"].flatMap((n) => [
      `      <h3>${esc(t(`faq.${n}`, locale))}</h3>`,
      `      <p>${esc(t(`faq.a${n.slice(1)}`, locale))}</p>`,
    ]),
    ld(faqSchema),
  ].join("\n");
}

function buildAiDocs(locale: Locale): string {
  return [
    `      <h1 class="sr-only">${esc(t("aiDocs.heading", locale))}</h1>`,
    breadcrumbHtml(locale, [{ label: t("nav.aiWriter", locale) }]),
    `      <p>${esc(t("editor.title", locale))}</p>`,
    `      <p>${esc(t("magic.title", locale))} — ${esc(t("magic.subtitle", locale))}</p>`,
  ].join("\n");
}

function buildContact(locale: Locale): string {
  return [
    breadcrumbHtml(locale, [{ label: t("contact.title", locale) }]),
    `      <h1>${esc(t("contact.title", locale))}</h1>`,
    `      <p>${esc(t("contact.subtitle", locale))}</p>`,
    `      <p>${esc(t("contact.emailUs", locale))} support@devjov.dev</p>`,
  ].join("\n");
}

function buildImprove(locale: Locale): string {
  return [
    breadcrumbHtml(locale, [{ label: t("improve.title", locale) }]),
    `      <h1>${esc(t("improve.title", locale))}</h1>`,
    `      <p>${esc(t("improve.subtitle", locale))}</p>`,
    `      <h2>${esc(t("improve.whatToSend", locale))}</h2>`,
    ...["1", "2", "3", "4"].map((n) => `      <p>${esc(t(`improve.idea${n}`, locale))}</p>`),
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Route manifest — the 15 real paths defined in src/App.tsx / public/sitemap.xml.
// Nothing here is invented: every path, title key and description key already
// exists in the app today.
// ---------------------------------------------------------------------------
type Route = { cleanPath: string; seoPrefix: string; build: (locale: Locale) => string };

const TOOL_ROUTES: Route[] = [
  {
    cleanPath: "/tools/pdf-to-word",
    seoPrefix: "pdfToWord",
    build: (l) => toolPage(l, { toolTitleKey: "pdfToWord.title", badgeKey: "pdfToWord.badge", h1: t("pdfToWord.title", l), subtitleKey: "pdfToWord.subtitle", freeSecureFast: true, contentPrefix: "pdfToWord", relatedLinks: [
      { cleanPath: "/tools/word-to-pdf", labelKey: "wordToPdf.title" },
      { cleanPath: "/tools/compress-pdf", labelKey: "compressPdf.compressBtn" },
      { cleanPath: "/#tools", labelKey: "cta.seeAllTools" },
    ] }),
  },
  {
    cleanPath: "/tools/word-to-pdf",
    seoPrefix: "wordToPdf",
    build: (l) => toolPage(l, { toolTitleKey: "wordToPdf.title", badgeKey: "wordToPdf.badge", h1: `${t("wordToPdf.heading", l)} PDF`, subtitleKey: "wordToPdf.subtitle", freeSecureFast: true, contentPrefix: "wordToPdf", relatedLinks: [
      { cleanPath: "/tools/pdf-to-word", labelKey: "pdfToWord.title" },
      { cleanPath: "/tools/compress-pdf", labelKey: "compressPdf.compressBtn" },
      { cleanPath: "/#tools", labelKey: "cta.seeAllTools" },
    ] }),
  },
  {
    cleanPath: "/tools/compress-pdf",
    seoPrefix: "compressPdf",
    build: (l) => toolPage(l, { toolTitleKey: "compressPdf.title", badgeKey: "compressPdf.badge", h1: `${t("compressPdf.heading", l)} PDF`, subtitleKey: "compressPdf.subtitle", freeSecureFast: true, contentPrefix: "compressPdf", relatedLinks: [
      { cleanPath: "/tools/split-merge-pdf", labelKey: "splitMerge.title" },
      { cleanPath: "/tools/encrypt-pdf", labelKey: "encryptPdf.title" },
      { cleanPath: "/#tools", labelKey: "cta.seeAllTools" },
    ] }),
  },
  {
    cleanPath: "/tools/split-merge-pdf",
    seoPrefix: "splitMerge",
    build: (l) => toolPage(l, { toolTitleKey: "splitMerge.title", badgeKey: "splitMerge.badge", h1: t("splitMerge.heading", l), subtitleKey: "splitMerge.subtitle", freeSecureFast: true, contentPrefix: "splitMerge", relatedLinks: [
      { cleanPath: "/tools/compress-pdf", labelKey: "compressPdf.compressBtn" },
      { cleanPath: "/tools/encrypt-pdf", labelKey: "encryptPdf.title" },
      { cleanPath: "/#tools", labelKey: "cta.seeAllTools" },
    ] }),
  },
  {
    cleanPath: "/tools/sign-pdf",
    seoPrefix: "signPdf",
    build: (l) => toolPage(l, { toolTitleKey: "signPdf.title", badgeKey: "signPdf.badge", h1: `${t("signPdf.heading", l)} PDF`, subtitleKey: "signPdf.subtitle", freeSecureFast: true, contentPrefix: "signPdf", relatedLinks: [
      { cleanPath: "/tools/encrypt-pdf", labelKey: "encryptPdf.title" },
      { cleanPath: "/tools/compress-pdf", labelKey: "compressPdf.compressBtn" },
      { cleanPath: "/#tools", labelKey: "cta.seeAllTools" },
    ] }),
  },
  {
    cleanPath: "/tools/summarize-pdf",
    seoPrefix: "summarizePdf",
    build: (l) => toolPage(l, { toolTitleKey: "summarizePdf.title", badgeKey: "summarizePdf.badge", h1: `${t("summarizePdf.heading", l)} PDF`, subtitleKey: "summarizePdf.subtitle", freeSecureFast: true, contentPrefix: "summarizePdf", relatedLinks: [
      { cleanPath: "/ai-docs", labelKey: "nav.aiWriter" },
      { cleanPath: "/tools/pdf-to-word", labelKey: "pdfToWord.title" },
      { cleanPath: "/#tools", labelKey: "cta.seeAllTools" },
    ] }),
  },
  {
    cleanPath: "/tools/encrypt-pdf",
    seoPrefix: "encryptPdf",
    build: (l) => toolPage(l, { toolTitleKey: "encryptPdf.title", badgeKey: "encryptPdf.badge", h1: `${t("encryptPdf.heading", l)} PDF`, subtitleKey: "encryptPdf.subtitle", freeSecureFast: false, contentPrefix: "encryptPdf", relatedLinks: [
      { cleanPath: "/tools/sign-pdf", labelKey: "signPdf.title" },
      { cleanPath: "/tools/compress-pdf", labelKey: "compressPdf.compressBtn" },
      { cleanPath: "/#tools", labelKey: "cta.seeAllTools" },
    ] }),
  },
  {
    cleanPath: "/tools/excel-to-pdf",
    seoPrefix: "excelToPdf",
    build: (l) => toolPage(l, { toolTitleKey: "excelToPdf.title", badgeKey: "excelToPdf.badge", h1: `${t("excelToPdf.heading", l)} PDF`, subtitleKey: "excelToPdf.subtitle", freeSecureFast: true, contentPrefix: "excelToPdf", relatedLinks: [
      { cleanPath: "/tools/pdf-to-excel", labelKey: "pdfToExcel.title" },
      { cleanPath: "/tools/compress-pdf", labelKey: "compressPdf.compressBtn" },
      { cleanPath: "/#tools", labelKey: "cta.seeAllTools" },
    ] }),
  },
  {
    cleanPath: "/tools/pdf-to-excel",
    seoPrefix: "pdfToExcel",
    build: (l) => toolPage(l, { toolTitleKey: "pdfToExcel.title", badgeKey: "pdfToExcel.badge", h1: `${t("pdfToExcel.heading", l)} Excel`, subtitleKey: "pdfToExcel.subtitle", freeSecureFast: true, contentPrefix: "pdfToExcel", relatedLinks: [
      { cleanPath: "/tools/excel-to-pdf", labelKey: "excelToPdf.title" },
      { cleanPath: "/tools/compress-pdf", labelKey: "compressPdf.compressBtn" },
      { cleanPath: "/#tools", labelKey: "cta.seeAllTools" },
    ] }),
  },
];

const ROUTES: Route[] = [
  { cleanPath: "", seoPrefix: "home", build: buildHome },
  ...TOOL_ROUTES,
  { cleanPath: "/ai-docs", seoPrefix: "aiDocs", build: buildAiDocs },
  { cleanPath: "/contact", seoPrefix: "contact", build: buildContact },
  {
    cleanPath: "/legal/terms",
    seoPrefix: "terms",
    build: (l) =>
      legalPage(l, {
        h1Key: "terms.title",
        lastUpdatedKey: "terms.lastUpdated",
        introKey: "terms.intro",
        sections: [
          { titleKey: "terms.noWarrantyTitle", descKey: "terms.noWarrantyDesc" },
          { titleKey: "terms.riskTitle", descKey: "terms.riskDesc" },
          { titleKey: "terms.freeTitle", descKey: "terms.freeDesc" },
          { titleKey: "terms.changesTitle", descKey: "terms.changesDesc" },
        ],
        contactTitleKey: "terms.contactTitle",
        contactDescKey: "terms.contactDesc",
      }),
  },
  {
    cleanPath: "/legal/privacy",
    seoPrefix: "privacy",
    build: (l) =>
      legalPage(l, {
        h1Key: "privacy.title",
        lastUpdatedKey: "privacy.lastUpdated",
        introKey: "privacy.intro",
        sections: [
          { titleKey: "privacy.noStoreTitle", descKey: "privacy.noStoreDesc" },
          { titleKey: "privacy.noTrainTitle", descKey: "privacy.noTrainDesc" },
          { titleKey: "privacy.minimalTitle", descKey: "privacy.minimalDesc" },
          { titleKey: "privacy.independentTitle", descKey: "privacy.independentDesc" },
        ],
        contactTitleKey: "privacy.contactTitle",
        contactDescKey: "privacy.contactDesc",
      }),
  },
  { cleanPath: "/improve", seoPrefix: "improve", build: buildImprove },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
function outFilePath(locale: Locale, cleanPath: string): string {
  const segments = cleanPath.split("/").filter(Boolean);
  return path.join(DIST, locale, ...segments, "index.html");
}

function run() {
  const templatePath = path.join(DIST, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("[prerender] dist/index.html not found — run `vite build` first.");
    process.exit(1);
  }
  const template = fs.readFileSync(templatePath, "utf8");

  let written = 0;
  for (const route of ROUTES) {
    for (const locale of LOCALES) {
      const seo = buildSeo(locale, route.cleanPath, `seo.${route.seoPrefix}.title`, `seo.${route.seoPrefix}.description`);
      let html = template;
      html = injectLang(html, locale);
      html = injectHead(html, seo);
      html = injectBody(html, route.build(locale));

      const outPath = outFilePath(locale, route.cleanPath);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, "utf8");
      written++;
    }
  }

  // Real 404: Vercel serves dist/404.html with an HTTP 404 status for any
  // unmatched path once the SPA catch-all rewrite is removed from vercel.json.
  // Content mirrors src/pages/NotFound.tsx exactly (English-only there too).
  const notFoundHtml = injectHead(
    injectLang(template, "en"),
    {
      title: "404 - Page not found | Seleniun",
      description: "The page you are looking for does not exist.",
      canonical: `${SITE}/en`,
      enUrl: `${SITE}/en`,
      esUrl: `${SITE}/es`,
      ogLocale: "en_US",
    }
  )
    .replace("</head>", `    <meta name="robots" content="noindex, nofollow" />\n  </head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root"><div data-prerender="seo">\n      <h1>404</h1>\n      <p>Page not found</p>\n      <a href="/">Back to home</a>\n    </div></div>`
    );
  fs.writeFileSync(path.join(DIST, "404.html"), notFoundHtml, "utf8");
  written++;

  // Patch the root dist/index.html (served at "/") in place — see
  // injectRootCanonicalHreflang above. Uses the original in-memory `template`
  // string, so this has no effect on the 30 route files already written above.
  const rootHtml = injectRootCanonicalHreflang(template);
  fs.writeFileSync(templatePath, rootHtml, "utf8");

  console.log(`[prerender] wrote ${written} static HTML files (${ROUTES.length} routes x ${LOCALES.length} locales + 404.html) into dist/, plus canonical/hreflang on the root index.html`);
}

run();
