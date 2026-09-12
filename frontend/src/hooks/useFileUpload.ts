import { useRef, useState } from "react";

interface UseFileUploadOptions {
  isValidDrop?: (file: File) => boolean;
  onFileAccepted?: (file: File) => void;
  onDropRejected?: () => void;
}

export function useFileUpload({ isValidDrop, onFileAccepted, onDropRejected }: UseFileUploadOptions = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accept = (f: File) => {
    setFile(f);
    onFileAccepted?.(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    const match = isValidDrop ? dropped.find(isValidDrop) : dropped[0];
    if (match) accept(match);
    else onDropRejected?.();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) accept(selected);
  };

  const reset = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return { file, setFile, dragOver, setDragOver, fileInputRef, handleDrop, handleFileSelect, reset };
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
