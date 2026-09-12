import React from "react";

type Props = {
  active?: boolean;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
  children: React.ReactNode;
};

export default function ToolbarButton({ active, disabled, title, onClick, children }: Props) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-indigo-100 text-indigo-700 shadow-sm"
          : disabled
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}
