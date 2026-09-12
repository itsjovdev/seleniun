import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Smartphone } from "lucide-react";

type Props = {
  blob: Blob | null;
  filename: string;
  ctaText?: string;
};

export default function ShareBar({
  blob,
  filename,
  ctaText = "Want to share it right away?",
}: Props) {
  const [msg, setMsg] = useState<string>("");

  const file = useMemo(() => {
    if (!blob) return null;
    const type = blob.type && blob.type.length ? blob.type : guessType(filename);
    return new File([blob], filename, { type });
  }, [blob, filename]);

  const canShareFiles =
    !!(navigator.canShare && file && navigator.canShare({ files: [file] }));

  const share = async () => {
    if (!file || !navigator.share) return;
    try {
      await navigator.share({ title: filename, files: [file] });
      setMsg("Shared!");
    } catch {
      // user cancelled
    }
  };

  if (!blob) return null;

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-border/60 bg-background/60 backdrop-blur p-5 md:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-base md:text-lg">{ctaText}</p>
            {!canShareFiles && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                “Share” is available on mobile browsers that support file sharing.
              </p>
            )}
          </div>

          {/* Share */}
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();     // evita submit del form
              e.stopPropagation();    // evita burbujas que disparen acciones externas
              share();
            }}
            disabled={!canShareFiles}
            className="gap-2 rounded-xl px-4 md:px-5 py-2 md:py-2.5
                       bg-gradient-to-r from-indigo-600 to-blue-600
                       hover:from-indigo-700 hover:to-blue-700
                       text-white shadow-md disabled:opacity-60"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        {msg && <p className="text-sm text-muted-foreground mt-3">{msg}</p>}
      </div>
    </div>
  );
}

function guessType(name: string) {
  const n = name.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (n.endsWith(".doc")) return "application/msword";
  return "application/octet-stream";
}
