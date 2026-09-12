// Utils comunes del editor
export const cleanEditorText = (el: HTMLElement | null) => {
  if (!el) return "";
  let txt = el.textContent || "";
  txt = txt.replace(/\u00A0/g, " ");
  txt = txt.replace(/[\u200B-\u200D\uFEFF]/g, "");
  return txt.trim();
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
