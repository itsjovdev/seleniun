import {
  Download,
  Sparkles,
  Upload,
  FileArchive,
  FileText,
  Shield,
  ScissorsSquare,
  MessageSquare,
  PenLine,
  FileSpreadsheet,
} from "lucide-react";

// CSS constants
export const CARD_BASE = "bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl";
export const ICON_TILE = "w-16 h-16 md:w-18 md:h-18 rounded-2xl grid place-items-center shadow-lg";
export const BUTTON_PRIMARY =
  "rounded-xl bg-ocean-700 hover:bg-ocean-900 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300";

// How it works steps - use i18n keys for title/description
export const HOW_IT_WORKS_STEPS = [
  {
    icon: Sparkles,
    titleKey: "howItWorks.step1.title",
    descKey: "howItWorks.step1.desc",
    color: "from-purple-500 via-pink-500 to-rose-500",
    bgColor: "from-purple-50 to-pink-50",
  },
  {
    icon: Upload,
    titleKey: "howItWorks.step2.title",
    descKey: "howItWorks.step2.desc",
    color: "from-blue-500 via-cyan-500 to-teal-500",
    bgColor: "from-blue-50 to-cyan-50",
  },
  {
    icon: Download,
    titleKey: "howItWorks.step3.title",
    descKey: "howItWorks.step3.desc",
    color: "from-green-500 via-emerald-500 to-teal-500",
    bgColor: "from-green-50 to-emerald-50",
  },
];

// PDF Tools
export const PDF_TOOLS = [
  { icon: FileText, title: "PDF \u2192 Word", titleKey: "pdfToWord.title", ctaKey: "pdfToWord.convertBtn", descKey: "tools.pdfToWord.desc", to: "/tools/pdf-to-word", gradient: "from-red-500 to-pink-600", free: true },
  { icon: FileText, title: "Word \u2192 PDF", titleKey: "wordToPdf.title", ctaKey: "wordToPdf.convertBtn", descKey: "tools.wordToPdf.desc", to: "/tools/word-to-pdf", gradient: "from-blue-500 to-indigo-600", free: true },
  { icon: FileSpreadsheet, title: "Excel \u2192 PDF", titleKey: "excelToPdf.title", ctaKey: "excelToPdf.convertBtn", descKey: "tools.excelToPdf.desc", to: "/tools/excel-to-pdf", gradient: "from-green-500 to-teal-600", free: true },
  { icon: FileSpreadsheet, title: "PDF \u2192 Excel", titleKey: "pdfToExcel.title", ctaKey: "pdfToExcel.convertBtn", descKey: "tools.pdfToExcel.desc", to: "/tools/pdf-to-excel", gradient: "from-teal-500 to-cyan-600", free: true },
  { icon: FileArchive, title: "Compress PDF", titleKey: "compressPdf.title", ctaKey: "compressPdf.compressBtn", descKey: "tools.compressPdf.desc", to: "/tools/compress-pdf", gradient: "from-green-500 to-emerald-600", free: true },
  { icon: ScissorsSquare, title: "Merge / Split PDF", titleKey: "splitMerge.title", ctaKey: "splitMerge.title", descKey: "tools.splitMerge.desc", to: "/tools/split-merge-pdf", gradient: "from-purple-500 to-violet-600", free: true },
  { icon: Shield, title: "Encrypt PDF", titleKey: "encryptPdf.title", ctaKey: "encryptPdf.encryptBtn", descKey: "tools.encryptPdf.desc", to: "/tools/encrypt-pdf", gradient: "from-amber-500 to-orange-600", free: true },
  { icon: PenLine, title: "Sign PDF", titleKey: "signPdf.title", ctaKey: "signPdf.title", descKey: "tools.signPdf.desc", to: "/tools/sign-pdf", gradient: "from-teal-500 to-cyan-600", free: true },
];

// AI Tools
export const AI_TOOLS = [
  { icon: FileText, titleKey: "tools.pdfSummarizer.title", descKey: "tools.pdfSummarizer.desc", gradient: "from-indigo-400 to-purple-500", to: "/tools/summarize-pdf", live: true, free: true },
  { icon: MessageSquare, titleKey: "tools.chatPdf.title", descKey: "tools.chatPdf.desc", gradient: "from-pink-400 to-rose-500", live: false },
  { icon: PenLine, titleKey: "tools.improveWriting.title", descKey: "tools.improveWriting.desc", gradient: "from-cyan-400 to-blue-500", live: false },
];

// FAQ items - use i18n keys
export const FAQ_ITEMS = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
  { qKey: "faq.q7", aKey: "faq.a7" },
];
