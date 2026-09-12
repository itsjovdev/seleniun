# Seleniun Frontend

Seleniun is a document processing platform providing online PDF tools and
AI-powered document processing. This is the frontend (React + Vite).

Free and open source under the MIT license — use it, fork it, ship it commercially,
whatever you need. The backend lives at [`../backend`](../backend) in this same repo.

Website: **https://www.seleniun.com/**

## Tools

- PDF to Word
- Word to PDF
- Excel to PDF
- PDF to Excel
- Compress PDF
- Split / Merge PDF
- Encrypt PDF
- Sign PDF
- Summarize PDF (AI)
- AI Document Writer

Files are processed to complete each operation and are not retained
afterward. See the [Privacy Policy](https://www.seleniun.com/en/legal/privacy)
for details.

## Tech stack

React + TypeScript + Vite, TailwindCSS + shadcn/ui, react-router-dom, a
lightweight custom i18n system (EN/ES, see `src/lib/i18n.tsx` and
`src/lib/i18n-data.ts`), and a build-time static prerender
(`scripts/prerender.ts`) so every public route ships page-specific
title/description/canonical/hreflang/H1/content without requiring
JavaScript.

Every tool page calls the backend through a relative `/api/...` path
(proxied to the backend in dev via `vite.config.ts`, and rewritten to it
in production via `vercel.json`) — never a hardcoded host.

## Local development

```bash
npm install
npm run dev      # dev server on http://localhost:8080
```

## Build

```bash
npm run build    # vite build + static prerender of all public routes
```

## Other scripts

```bash
npm run prerender   # re-run just the prerender step against an existing dist/
npm run indexnow     # notify IndexNow (Bing) that sitemap URLs changed — manual/CI use only
npm run lint
```

## Contributing

```bash
npm install
npm run dev
```

Before opening a PR:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Follow the existing tool-page pattern (`LocaleSEO`, `Breadcrumbs`, `ToolContentSections`,
`ToolsCTA`, `useI18n`, and the `useFileUpload` hook) when adding or editing a tool page — see
any file in `src/pages/tools/`. Add new UI copy to `src/lib/i18n-data.ts` in both `en` and `es`;
never hardcode user-facing text. Don't modify files in `src/components/ui/` by hand — they're
shadcn-managed. New tool pages must be added to `src/App.tsx` and `public/sitemap.xml`.

Open a GitHub issue for bugs (with steps to reproduce) or feature requests (with a clear use case).

## License

[MIT](../LICENSE)
