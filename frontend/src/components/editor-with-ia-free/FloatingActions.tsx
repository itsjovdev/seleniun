import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { Type } from "lucide-react";

type Props = {
  top: number;
  left: number;
  open: boolean;
  onToggle: () => void;
  onH1: () => void;
  onH2: () => void;
  onUl: () => void;
  onOl: () => void;
  onQuote: () => void;
  onHr: () => void;
};

export default function FloatingActions({
  top, left, open, onToggle, onH1, onH2, onUl, onOl, onQuote, onHr
}: Props) {
  const { t } = useI18n();
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);

  const placeMenu = () => {
    const GAP = 12;
    const W = menuRef.current?.offsetWidth ?? 320;
    const H = menuRef.current?.offsetHeight ?? 220;

    let baseX = clickPos?.x;
    let baseY = clickPos?.y;

    if (baseX == null || baseY == null) {
      const r = anchorRef.current?.getBoundingClientRect();
      baseX = r?.left ?? 80;
      baseY = r?.top ?? 80;
    }

    let topVp = Math.round(baseY);
    topVp = Math.min(Math.max(8, topVp), window.innerHeight - H - 8);

    let leftVp = Math.round(baseX - GAP - W);
    leftVp = Math.max(12, Math.min(leftVp, window.innerWidth - W - 8));

    setMenuPos({ top: topVp, left: leftVp });
  };

  useLayoutEffect(() => {
    if (!open) return;
    placeMenu();
    requestAnimationFrame(placeMenu);
    const handleScroll = () => { onToggle(); };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open, clickPos, onToggle]);

  const anchor = (
    <div ref={anchorRef} style={{ top: top - 5, left }} className="absolute z-50">
      <button
        type="button"
        className="plus-button h-7 w-7 rounded-full bg-indigo-50 border-[2.5px] border-indigo-400 shadow-lg hover:shadow-xl hover:bg-indigo-100 hover:border-indigo-600 hover:scale-110 transition-all flex items-center justify-center text-indigo-600 hover:text-indigo-700 text-sm font-bold leading-none"
        title={t("editor.quickActions")}
        onClick={(e) => {
          e.stopPropagation();
          setClickPos({ x: e.clientX, y: e.clientY });
          onToggle();
        }}
      >
        +
      </button>
    </div>
  );

  const actions = [
    { label: t("editor.headingH1"), action: onH1 },
    { label: t("editor.headingH2"), action: onH2 },
    { label: t("editor.bulletList"), action: onUl },
    { label: t("editor.numberedList"), action: onOl },
    { label: t("editor.quote"), action: onQuote },
    { label: t("editor.separator"), action: onHr },
  ];

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="actions-menu fixed w-72 bg-white rounded-xl border border-gray-200 shadow-2xl z-[9999] overflow-hidden"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Type className="h-4 w-4 text-indigo-600" /> {t("editor.quickActions")}
            </div>
          </div>

          <div className="p-2 grid grid-cols-2 gap-1.5">
            {actions.map((a) => (
              <button
                key={a.label}
                className="text-left px-3 py-2 rounded-lg hover:bg-indigo-50 text-sm font-medium text-gray-700 hover:text-indigo-700 transition-colors"
                onClick={() => { a.action(); onToggle(); }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {anchor}
      {menu}
    </>
  );
}
