import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LocaleLink } from "@/lib/locale-utils";
import {
  ChevronDown,
  FileText,
  FileArchive,
  ScissorsSquare,
  FileSignature,
  Sparkles,
  Lock,
    FileSpreadsheet,
} from "lucide-react";

/** === DATA === */
export const toolsBasic = [
  { title: "PDF → Word", titleKey: "pdfToWord.title", href: "/tools/pdf-to-word", icon: FileText, descKey: "mega.pdfToWord.desc" },
  { title: "Word → PDF", titleKey: "wordToPdf.title", href: "/tools/word-to-pdf", icon: FileText, descKey: "mega.wordToPdf.desc" },
  { title: "Excel → PDF", titleKey: "excelToPdf.title", href: "/tools/excel-to-pdf", icon: FileSpreadsheet, descKey: "mega.excelToPdf.desc" },
  { title: "PDF → Excel", titleKey: "pdfToExcel.title", href: "/tools/pdf-to-excel", icon: FileSpreadsheet, descKey: "mega.pdfToExcel.desc" },
  { title: "Compress PDF", titleKey: "compressPdf.title", href: "/tools/compress-pdf", icon: FileArchive, descKey: "mega.compressPdf.desc" },
  { title: "Merge / Split PDF", titleKey: "splitMerge.title", href: "/tools/split-merge-pdf", icon: ScissorsSquare, descKey: "mega.splitMerge.desc" },
  { title: "Sign PDF", titleKey: "signPdf.title", href: "/tools/sign-pdf", icon: FileSignature, descKey: "mega.signPdf.desc" },
  { title: "Summarize PDF", titleKey: "summarizePdf.title", href: "/tools/summarize-pdf", icon: Sparkles, descKey: "mega.summarizePdf.desc" },
  { title: "Encrypt PDF", titleKey: "encryptPdf.title", href: "/tools/encrypt-pdf", icon: Lock, descKey: "mega.encryptPdf.desc" },
];

/** === GROUPS (sections) === */
const groups: {
  key: "convert" | "organize" | "sign" | "ai";
  titleKey: string;
  hintKey: string;
  items: string[];
}[] = [
{ key: "convert", titleKey: "mega.convert", hintKey: "mega.convertHint", items: ["PDF → Word", "Word → PDF", "Excel → PDF", "PDF → Excel"] }, // 👈 AGREGAR LOS DOS NUEVOS
  { key: "organize", titleKey: "mega.organize", hintKey: "mega.organizeHint", items: ["Compress PDF", "Merge / Split PDF", "Encrypt PDF"] },
  { key: "sign", titleKey: "mega.sign", hintKey: "mega.signHint", items: ["Sign PDF"] },
  { key: "ai", titleKey: "mega.ai", hintKey: "mega.aiHint", items: ["Summarize PDF"] },
];

/** === Icon color palette per tool === */
const iconStyles: Record<
  string,
  { bg: string; ring: string; text: string; hoverRing: string; hoverShadow: string }
> = {
"PDF → Word": {
  bg: "bg-gradient-to-br from-sky-50 to-sky-100",
  ring: "ring-1 ring-sky-200",
  text: "text-sky-700",
  hoverRing: "group-hover:ring-sky-300",
  hoverShadow: "group-hover:shadow-sky-200/70",
},

"Word → PDF": {
  bg: "bg-gradient-to-br from-rose-50 to-rose-100",
  ring: "ring-1 ring-rose-200",
  text: "text-rose-700",
  hoverRing: "group-hover:ring-rose-300",
  hoverShadow: "group-hover:shadow-rose-200/70",
},
"Excel → PDF": {
  bg: "bg-gradient-to-br from-green-50 to-green-100",
  ring: "ring-1 ring-green-200",
  text: "text-green-700",
  hoverRing: "group-hover:ring-green-300",
  hoverShadow: "group-hover:shadow-green-200/70",
},
"PDF → Excel": {
  bg: "bg-gradient-to-br from-teal-50 to-teal-100",
  ring: "ring-1 ring-teal-200",
  text: "text-teal-700",
  hoverRing: "group-hover:ring-teal-300",
  hoverShadow: "group-hover:shadow-teal-200/70",
},
  "Compress PDF": {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
    ring: "ring-1 ring-amber-200",
    text: "text-amber-700",
    hoverRing: "group-hover:ring-amber-300",
    hoverShadow: "group-hover:shadow-amber-200/70",
  },
  "Merge / Split PDF": {
    bg: "bg-gradient-to-br from-violet-50 to-violet-100",
    ring: "ring-1 ring-violet-200",
    text: "text-violet-700",
    hoverRing: "group-hover:ring-violet-300",
    hoverShadow: "group-hover:shadow-violet-200/70",
  },
  "Sign PDF": {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    ring: "ring-1 ring-emerald-200",
    text: "text-emerald-700",
    hoverRing: "group-hover:ring-emerald-300",
    hoverShadow: "group-hover:shadow-emerald-200/70",
  },
  "Summarize PDF": {
    bg: "bg-gradient-to-br from-fuchsia-50 to-fuchsia-100",
    ring: "ring-1 ring-fuchsia-200",
    text: "text-fuchsia-700",
    hoverRing: "group-hover:ring-fuchsia-300",
    hoverShadow: "group-hover:shadow-fuchsia-200/70",
  },
  "Encrypt PDF": {
    bg: "bg-gradient-to-br from-slate-50 to-slate-100",
    ring: "ring-1 ring-slate-200",
    text: "text-slate-700",
    hoverRing: "group-hover:ring-slate-300",
    hoverShadow: "group-hover:shadow-slate-200/70",
  },
};

const byTitle = new Map(toolsBasic.map((t) => [t.title, t]));
const groupedStatic = groups
  .map((g) => ({
    ...g,
    tools: g.items.map((title) => byTitle.get(title)).filter(Boolean) as typeof toolsBasic,
  }))
  .filter((g) => g.tools.length > 0);

type ToolsMegaMenuProps = {
  mobile?: boolean;
  onItemClick?: () => void;
  className?: string;
  isActive?: boolean;
};

export default function ToolsMegaMenu({
  mobile = false,
  onItemClick,
  className = "",
  isActive = false,
}: ToolsMegaMenuProps) {
  const { t: tr } = useI18n();
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => groupedStatic, []);

  /** ================= MOBILE ================= */
// En ToolsMegaMenu.tsx - Sección MOBILE (alrededor de línea 85-120)

if (mobile) {
  return (
    <div className={`mt-1 ${className}`}>
      <div
        className="max-h-[50vh] overflow-y-auto overscroll-contain bg-white rounded-xl border border-gray-200 shadow-2xl"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 rounded-t-xl">
          <div className="px-3 py-3">
            <div className="flex items-center gap-2 text-[11px] tracking-wide font-semibold text-gray-700 uppercase">
              <div className="w-1 h-4 bg-ocean-700 rounded-full" />{tr("mega.tools")}</div>
          </div>
        </div>

        <div className="p-2">
          {grouped.map((group, gi) => (
            <div key={group.key} className="pb-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                <div className="text-[11px] font-semibold tracking-wide text-gray-600 uppercase">
                  {tr(group.titleKey)}
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-gray-200 to-transparent" />
              </div>
              <div className="px-3 text-[11px] text-gray-500 mb-1">{tr(group.hintKey)}</div>

              <ul className="space-y-1">
                {group.tools.map((t) => {
                  const Icon = t.icon as any;
                  const color = iconStyles[t.title] ?? iconStyles["Encrypt PDF"];
                  return (
                    <li key={t.title}>
                      <LocaleLink
                        to={t.href}
                        onClick={() => onItemClick?.()}
                        className="group flex items-start gap-3 px-3 py-3 rounded-lg bg-white hover:bg-blue-50/40 transition-colors relative z-10"
                      >
                        <span
                          className={[
                            "h-10 w-10 grid place-items-center rounded-xl flex-shrink-0 shadow-sm",
                            color.bg,
                            color.ring,
                            color.hoverRing,
                            color.hoverShadow,
                            "transition-all duration-200",
                          ].join(" ")}
                        >
                          <Icon className={`h-5 w-5 ${color.text}`} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold leading-tight text-gray-900 text-sm">{tr(t.titleKey)}</span>
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-px rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60">{tr("mega.free")}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 leading-snug line-clamp-1">{tr(t.descKey)}</div>
                        </div>
                      </LocaleLink>
                    </li>
                  );
                })}
              </ul>

              {gi !== grouped.length - 1 && (
                <div className="pt-3">
                  <div className="mx-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

  /** ================= DESKTOP (centered) ================= */
  return (
    <div className={`relative hidden md:block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={(e) => {
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        className={`relative px-3 py-2 rounded-full transition-all duration-200 inline-flex items-center gap-1 ${
          isActive || open
            ? "text-white bg-ocean-700 shadow-lg scale-105"
            : "text-foreground/70 hover:text-foreground/90 hover:bg-black/5"
        }`}
      >
        {tr("nav.tools")}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="
            absolute left-1/2 -translate-x-1/2 mt-3
            w-[820px] max-w-[90vw] max-h-[80vh] overflow-y-auto overscroll-contain
            rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)]
            ring-1 ring-black/5 z-50
          "
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 rounded-t-2xl">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] tracking-wide font-semibold text-gray-700 uppercase">
                <div className="w-1 h-4 bg-ocean-700 rounded-full" />{tr("mega.tools")}</div>
              <span className="text-[11px] text-gray-500">{toolsBasic.length} {tr("nav.tools").toLowerCase()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-6">
              {grouped.map((group, gi) => (
                <section key={group.key} className="bg-slate-50 rounded-xl border border-gray-200 shadow-sm">
                  <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{tr(group.titleKey)}</h4>
                      <p className="text-[11px] text-gray-500">{tr(group.hintKey)}</p>
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-2" />
                    <span className="text-[11px] text-gray-500">{group.tools.length}</span>
                  </header>

                  <ul className="p-2">
                    {group.tools.map((t) => {
                      const Icon = t.icon as any;
                      const color = iconStyles[t.title] ?? iconStyles["Encrypt PDF"];
                      return (
                        <li key={t.title}>
                          <LocaleLink
                            to={t.href}
                            className="group flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white transition transform hover:-translate-y-0.5"
                            onClick={() => setOpen(false)}
                          >
                            <span
                              className={[
                                "h-9 w-9 grid place-items-center rounded-lg border shadow-sm",
                                color.bg,
                                color.ring,
                                color.hoverRing,
                                color.hoverShadow,
                                "transition-all duration-200",
                              ].join(" ")}
                            >
                              <Icon className={`h-5 w-5 ${color.text}`} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium leading-tight text-gray-900">{tr(t.titleKey)}</span>
                                <span className="text-[9px] font-semibold uppercase px-1.5 py-px rounded bg-emerald-50 text-emerald-600 border border-emerald-200/60">{tr("mega.free")}</span>
                              </div>
                              <div className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-1">{tr(t.descKey)}</div>
                            </div>
                          </LocaleLink>
                        </li>
                      );
                    })}
                  </ul>

                  {gi !== grouped.length - 1 && (
                    <div className="px-4 pb-3">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
