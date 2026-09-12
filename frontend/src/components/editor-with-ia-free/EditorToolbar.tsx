import React from "react";
import { useI18n } from "@/lib/i18n";
import ToolbarButton from "@/components/ui/ToolbarButton";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Bold, Italic, Minus, Quote, Redo2, Strikethrough,
  List, ListOrdered, Underline, Undo2, ChevronDown
} from "lucide-react";
import { EditorApi } from "@/hooks/useEditor";
import { FONTS, SIZES } from "@/lib/editor-constants";

type Props = {
  editor: EditorApi;
};

export default function EditorToolbar({ editor }: Props) {
  const { t } = useI18n();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2">
        <div
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 sm:gap-1 pr-1.5 sm:pr-2 border-r border-gray-300 flex-shrink-0">
            <ToolbarButton title={t("editor.undoShortcut")} onClick={editor.undo} disabled={!editor.canUndo}><Undo2 className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title={t("editor.redoShortcut")} onClick={editor.redo} disabled={!editor.canRedo}><Redo2 className="h-4 w-4" /></ToolbarButton>
          </div>

          {/* Fonts - hidden on very small screens */}
          <div className="relative font-menu-trigger hidden sm:block flex-shrink-0">
            <button
              onClick={() => { editor.setShowFontMenu(!editor.showFontMenu); editor.setShowSizeMenu(false); }}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 bg-white hover:border-indigo-300 rounded-lg text-xs sm:text-sm min-w-[100px] sm:min-w-[140px] justify-between"
            >
              <span className="truncate font-medium" style={{ fontFamily: editor.currentFont }}>{editor.currentFont}</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
            </button>
            {editor.showFontMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 shadow-xl rounded-xl w-56 max-h-72 overflow-y-auto z-50">
                {FONTS.map((font) => (
                  <button key={font} onClick={() => editor.applyFont(font)}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-sm border-b border-gray-100 last:border-0"
                    style={{ fontFamily: font }}>
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="relative size-menu-trigger flex-shrink-0">
            <button
              onClick={() => { editor.setShowSizeMenu(!editor.showSizeMenu); editor.setShowFontMenu(false); }}
              className="flex items-center gap-1 px-2 py-1.5 sm:py-2 border border-gray-200 bg-white hover:border-indigo-300 rounded-lg text-xs sm:text-sm w-14 sm:w-20 justify-between"
            >
              <span className="font-medium">{editor.currentSize.replace("pt", "")}</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
            </button>
            {editor.showSizeMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 shadow-xl rounded-xl w-24 max-h-72 overflow-y-auto z-50">
                {SIZES.map((size) => (
                  <button key={size} onClick={() => editor.applySize(size)}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-sm border-b border-gray-100 last:border-0">
                    {size.replace("pt", "")}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 sm:h-8 bg-gray-300 flex-shrink-0" />

          {/* Text styles */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <ToolbarButton title={t("editor.bold")} active={editor.isActive("bold")} onClick={() => editor.execCommand("bold")}><Bold className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title={t("editor.italic")} active={editor.isActive("italic")} onClick={() => editor.execCommand("italic")}><Italic className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title={t("editor.underline")} active={editor.isActive("underline")} onClick={() => editor.execCommand("underline")}><Underline className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title={t("editor.strikethrough")} active={editor.isActive("strikethrough")} onClick={() => editor.execCommand("strikeThrough")} className="hidden sm:inline-flex"><Strikethrough className="h-4 w-4" /></ToolbarButton>
          </div>

          <div className="w-px h-6 sm:h-8 bg-gray-300 flex-shrink-0" />

          {/* Headings */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <ToolbarButton title={t("editor.heading1")} active={editor.isActive("h1")}
              onClick={() => editor.isActive("h1") ? editor.execCommand("formatBlock", "<p>") : editor.execCommand("formatBlock", "<h1>")}>
              <span className="text-xs sm:text-sm font-bold">H1</span>
            </ToolbarButton>
            <ToolbarButton title={t("editor.heading2")} active={editor.isActive("h2")}
              onClick={() => editor.isActive("h2") ? editor.execCommand("formatBlock", "<p>") : editor.execCommand("formatBlock", "<h2>")}>
              <span className="text-xs sm:text-sm font-bold">H2</span>
            </ToolbarButton>
          </div>

          <div className="w-px h-6 sm:h-8 bg-gray-300 flex-shrink-0" />

          {/* Align - hidden on mobile */}
          <div className="hidden md:flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <ToolbarButton title={t("editor.alignLeft")} onClick={() => editor.execCommand("justifyLeft")}><AlignLeft className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title={t("editor.center")} onClick={() => editor.execCommand("justifyCenter")}><AlignCenter className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title={t("editor.alignRight")} onClick={() => editor.execCommand("justifyRight")}><AlignRight className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title={t("editor.justify")} onClick={() => editor.execCommand("justifyFull")}><AlignJustify className="h-4 w-4" /></ToolbarButton>
          </div>

          <div className="hidden md:block w-px h-6 sm:h-8 bg-gray-300 flex-shrink-0" />

          {/* Lists / others */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <ToolbarButton title={t("editor.bulletListTool")} active={editor.isActive("insertUnorderedList")} onClick={() => editor.execCommand("insertUnorderedList")}><List className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title={t("editor.numberedListTool")} active={editor.isActive("insertOrderedList")} onClick={() => editor.execCommand("insertOrderedList")}><ListOrdered className="h-4 w-4" /></ToolbarButton>
            <ToolbarButton title={t("editor.quoteTool")} active={editor.isActive("blockquote")} onClick={() => editor.execCommand("formatBlock", "<blockquote>")}><Quote className="h-4 w-4" /></ToolbarButton>
          </div>
        </div>
      </div>
    </div>
  );
}
