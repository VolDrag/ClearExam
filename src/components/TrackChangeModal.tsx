import { useNavigate } from "@tanstack/react-router";
import { useTrack } from "@/lib/track-context";
import { TRACKS } from "@/lib/tracks";
import { useT, localizedTrack } from "@/lib/i18n";
import { toast } from "sonner";

export function TrackChangeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setTrack, track } = useTrack();
  const { t, lang } = useT();
  const navigate = useNavigate();

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">{t("trackmodal.title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("trackmodal.subtitle")}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {TRACKS.map((tr) => {
            const local = localizedTrack(lang, tr.id);
            return (
              <button
                key={tr.id}
                onClick={() => {
                  setTrack(tr.id);
                  toast.success(local.name);
                  onClose();
                  navigate({ to: "/chat" });
                }}
                className={`rounded-xl border p-4 text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand)]/5 ${
                  track === tr.id ? "border-[var(--brand)] bg-[var(--brand)]/5" : ""
                }`}
              >
                <div className="text-2xl">{tr.icon}</div>
                <div className="mt-2 font-medium">{local.name}</div>
                <div className="text-xs text-muted-foreground">{local.institutions}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
