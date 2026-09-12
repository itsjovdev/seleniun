# Seleniun Backend

Document-processing API behind [seleniun.com](https://www.seleniun.com) — PDF/Office conversion,
compression, splitting/merging, encryption, and AI-assisted summarization/text generation.

Built with [NestJS](https://nestjs.com) (Express, TypeScript). Free and open source under the MIT
license — use it, fork it, ship it commercially, whatever you need.

## Features

- **Convert**: PDF ↔ Word, Excel ↔ PDF
- **Organize**: compress, split, merge PDFs
- **Encrypt**: password-protect PDFs (owner/user password via `pdftk`)
- **AI**: extract + summarize PDF text, and general-purpose text generation, both through a
  pluggable LLM provider (DeepSeek, Gemini, or Cohere — pick whichever you have a key for)

Under the hood it shells out to Ghostscript, `pdftk`, LibreOffice, and `poppler-utils` for the
heavy document-processing work, plus a small Python helper (PyMuPDF/`pdf2docx`) for PDF→DOCX.

## Requirements

- Node.js 20+
- Either Docker (recommended — the `Dockerfile` installs every system dependency), or locally
  installed: Ghostscript, `pdftk`, LibreOffice, `poppler-utils`, Python 3 with `PyMuPDF` and
  `pdf2docx`

## Setup

```bash
npm install
cp .env.example .env   # fill in at least one LLM provider key if you want /pdf/summarize and /ai/*
npm run start:dev
```

Or with Docker:

```bash
docker compose up --build
```

## Environment variables

See [`.env.example`](.env.example). The only required decision is `LLM_PROVIDER`
(`deepseek` | `gemini` | `cohere`) plus the matching API key — the PDF-conversion endpoints work
with no AI key configured at all.

## API

All routes are under the `/api` prefix.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/convert/pdf-to-word` | PDF → DOCX |
| POST | `/api/convert/word-to-pdf` | DOCX → PDF |
| POST | `/api/convert/pdf-to-excel` | PDF → XLSX |
| POST | `/api/convert/excel-to-pdf` | XLSX → PDF |
| POST | `/api/convert/compress-pdf` | Compress a PDF |
| POST | `/api/convert/split-pdf` | Split a PDF into page ranges |
| POST | `/api/convert/merge-pdf` | Merge multiple PDFs |
| POST | `/api/pdf-encrypt/encrypt` | Password-protect a PDF |
| POST | `/api/pdf/summarize` | Extract text from a PDF and summarize it via the configured LLM |
| POST | `/api/ai/generate` | General-purpose prompt → text generation |
| POST | `/api/ai/generate/stream` | Same as above, streamed |

File-upload endpoints expect `multipart/form-data` with the file in a `file` field.

## Development

```bash
npm run lint     # ESLint
npm run test     # unit tests
npm run test:e2e # e2e tests
npm run build    # compile to dist/
```

## Contributing

```bash
npm install
cp .env.example .env
npm run start:dev
```

Before opening a PR:

```bash
npm run lint
npm run test
npm run build
```

Keep endpoints thin — business logic belongs in the module's `*.service.ts`. New env vars must
be added to `.env.example` and documented above. Match the existing code style (`npm run lint`
runs Prettier + ESLint). Add or update tests for the module you touch.

Open a GitHub issue for bugs (with steps to reproduce) or feature requests (with a clear use case).

## License

[MIT](../LICENSE)
