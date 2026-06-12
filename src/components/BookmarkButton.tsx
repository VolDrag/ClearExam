import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { addBookmark, removeBookmark } from "@/lib/revision.functions";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export function BookmarkButton({
  questionId,
  reason,
  initial = false,
}: { questionId: string; reason: "incorrect" | "flagged" | "manual"; initial?: boolean }) {
  const { t } = useT();
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      if (saved) {
        await removeBookmark({ data: { questionId } });
        setSaved(false);
        toast.success(t("rev.removed"));
      } else {
        await addBookmark({ data: { questionId, reason } });
        setSaved(true);
        toast.success(t("rev.saved"));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition ${
        saved ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]" : "hover:bg-accent"
      }`}
      aria-pressed={saved}
      title={saved ? t("rev.removeBookmark") : t("rev.saveBookmark")}
    >
      {busy ? <Loader2 className="size-3 animate-spin" /> : saved ? <BookmarkCheck className="size-3" /> : <Bookmark className="size-3" />}
      {saved ? t("rev.bookmarked") : t("rev.bookmark")}
    </button>
  );
}
