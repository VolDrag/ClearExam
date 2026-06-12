import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/update-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Update Password — ClearExam" },
      { name: "description", content: "Set a new password for your ClearExam account." },
      { property: "og:title", content: "Update Password — ClearExam" },
      { property: "og:description", content: "Set a new password for your ClearExam account." },
      { property: "og:url", content: "https://clear-exam-genius.lovable.app/update-password" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://clear-exam-genius.lovable.app/update-password" }],
  }),
  component: UpdatePasswordPage,
});

const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters" }).max(72);

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const { t } = useT();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery token from the URL automatically on this page
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = passwordSchema.safeParse(password);
    if (!p.success) { toast.error(p.error.issues[0].message); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(t("auth.toastPasswordUpdated"));
      navigate({ to: "/chat", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.toastError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--navy)] via-[var(--navy)] to-[#0d1f3a] text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-10">
        <form onSubmit={submit} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <GraduationCap className="size-6 text-[var(--highlight)]" /> ClearExam
          </div>
          <h1 className="mt-6 text-2xl font-bold">{t("auth.updateTitle")}</h1>
          <p className="mt-1 text-sm text-white/60">{t("auth.updateSubtitle")}</p>
          <label className="relative mt-6 block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"><Lock className="size-4" /></span>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.newPasswordPlaceholder")}
              className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/40 focus:border-[var(--highlight)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]/40"
            />
          </label>
          <button
            type="submit" disabled={busy || !ready}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--highlight)] px-3 py-2.5 text-sm font-semibold text-[var(--navy)] hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("auth.updateCta")}
          </button>
          {!ready && (
            <p className="mt-3 text-center text-xs text-white/50">{t("auth.updateWaiting")}</p>
          )}
        </form>
      </div>
    </div>
  );
}
