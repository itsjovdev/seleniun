// src/App.tsx
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/lib/i18n";
import LocaleRoute from "@/lib/LocaleRoute";
import { LocaleRedirect, LegacyRedirect } from "@/lib/locale-utils";
import { Loader2 } from "lucide-react";

import MarketingLayout from "@/components/layout/MarketingLayout";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

// Tool/editor/legal pages are code-split: each pulls in its own heavy
// dependencies (pdf-lib, signature_pad, html2canvas/html2pdf.js/jspdf via the
// AI editor, the react-markdown chain) that were previously bundled into the
// single main chunk and downloaded on every page — including Home — even
// when unused. Index/NotFound stay eager since they're small and are the
// default landing experience. This does not touch scripts/prerender.ts: the
// prerendered HTML is generated from dist/index.html after the client build,
// independently of how the client JS is chunked.
const PdfToWord = lazy(() => import("@/pages/tools/PdfToWord"));
const WordToPDF = lazy(() => import("@/pages/tools/WordToPDF"));
const CompressPdf = lazy(() => import("@/pages/tools/CompressPdf"));
const SplitMergePdf = lazy(() => import("@/pages/tools/SplitMergePdf"));
const SignPdf = lazy(() => import("./pages/tools/SignPdf"));
const ResumirPDF = lazy(() => import("./pages/tools/ResumirPDF"));
const EncryptPdf = lazy(() => import("./pages/tools/EncryptPdf"));
const CreateDocAI = lazy(() => import("./pages/tools/CreateDocAI"));
const ExcelToPdf = lazy(() => import("./pages/tools/ExcelToPdf"));
const PdfToExcel = lazy(() => import("./pages/tools/PdfToExcel"));

const Contact = lazy(() => import("@/pages/legal/Contact"));
const Improve = lazy(() => import("@/pages/legal/Improve"));
const Terms = lazy(() => import("@/pages/legal/Terms"));
const Privacy = lazy(() => import("@/pages/legal/Privacy"));

import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-ocean-700" />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<LocaleRedirect />} />

                <Route path="/:locale" element={<LocaleRoute />}>
                  <Route element={<MarketingLayout headerVariant="transparent" withFooter />}>
                    <Route index element={<Index />} />
                  </Route>

                  <Route element={<MarketingLayout headerVariant="solid" withFooter />}>
                    <Route path="tools/pdf-to-word" element={<PdfToWord />} />
                    <Route path="tools/word-to-pdf" element={<WordToPDF />} />
                    <Route path="tools/compress-pdf" element={<CompressPdf />} />
                    <Route path="tools/split-merge-pdf" element={<SplitMergePdf />} />
                    <Route path="tools/sign-pdf" element={<SignPdf />} />
                    <Route path="tools/summarize-pdf" element={<ResumirPDF />} />
                    <Route path="tools/encrypt-pdf" element={<EncryptPdf />} />
                    <Route path="tools/excel-to-pdf" element={<ExcelToPdf />} />
                    <Route path="tools/pdf-to-excel" element={<PdfToExcel />} />
                    <Route path="ai-docs" element={<CreateDocAI />} />
                    <Route path="legal/terms" element={<Terms />} />
                    <Route path="legal/privacy" element={<Privacy />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="improve" element={<Improve />} />
                  </Route>
                </Route>

                <Route path="/tools/*" element={<LegacyRedirect />} />
                <Route path="/ai-docs" element={<LegacyRedirect />} />
                <Route path="/legal/*" element={<LegacyRedirect />} />
                <Route path="/contact" element={<LegacyRedirect />} />
                <Route path="/improve" element={<LegacyRedirect />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </I18nProvider>
  );
}