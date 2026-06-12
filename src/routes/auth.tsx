import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { useTrack } from "@/lib/track-context";
import { TRACKS } from "@/lib/tracks";
import { useT, localizedTrack } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign In or Create Account — ClearExam" },
      { name: "description", content: "Sign in or create a ClearExam account to start preparing for Bangladesh university admissions." },
      { property: "og:title", content: "Sign In or Create Account — ClearExam" },
      { property: "og:description", content: "Sign in or create a ClearExam account to start preparing for Bangladesh university admissions." },
      { property: "og:url", content: "https://clear-exam-genius.lovable.app/auth" },
    ],
    links: [{ rel: "canonical", href: "https://clear-exam-genius.lovable.app/auth" }],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "reset";

const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(255);
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters" }).max(72);

function AuthPage() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const { track, setTrack, ready: trackReady } = useTrack();
  const { t, lang } = useT();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(track ?? "engineering");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !trackReady || !user) return;
    navigate({ to: track ? "/chat" : "/", replace: true });
  }, [ready, trackReady, user, track, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailParsed = emailSchema.safeParse(email);
    if (!emailParsed.success) { toast.error(emailParsed.error.issues[0].message); return; }
    if (mode !== "reset") {
      const p = passwordSchema.safeParse(password);
      if (!p.success) { toast.error(p.error.issues[0].message); return; }
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.toastSignedIn"));
        navigate({ to: "/chat", replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { active_track: selectedTrack },
          },
        });
        if (error) throw error;
        setTrack(selectedTrack);
        toast.success(t("auth.toastSignedUp"));
        navigate({ to: "/chat", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        toast.success(t("auth.toastResetSent"));
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.toastError"));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) { toast.error(result.error.message ?? t("auth.toastError")); return; }
      if (result.redirected) return;
      navigate({ to: "/chat", replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--navy)] via-[var(--navy)] to-[#0d1f3a] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <GraduationCap className="size-6 text-[var(--highlight)]" />
            ClearExam
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            {mode === "signin" ? t("auth.signInTitle") : mode === "signup" ? t("auth.signUpTitle") : t("auth.resetTitle")}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {mode === "signin" ? t("auth.signInSubtitle") : mode === "signup" ? t("auth.signUpSubtitle") : t("auth.resetSubtitle")}
          </p>

          {mode !== "reset" && (
            <>
              <button
                onClick={google}
                disabled={busy}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-white/90 disabled:opacity-50"
              >
                <GoogleIcon /> {t("auth.google")}
              </button>
              <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-white/40">
                <span className="h-px flex-1 bg-white/10" /> {t("auth.or")} <span className="h-px flex-1 bg-white/10" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-3">
            <Field icon={<Mail className="size-4" />} type="email" placeholder={t("auth.emailPlaceholder")} value={email} onChange={setEmail} autoComplete="email" />
            {mode !== "reset" && (
              <Field icon={<Lock className="size-4" />} type="password" placeholder={t("auth.passwordPlaceholder")} value={password} onChange={setPassword} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
            )}
            {mode === "signup" && (
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-white/60">{t("auth.trackLabel")}</div>
                <div className="grid grid-cols-2 gap-2">
                  {TRACKS.map((tr) => {
                    const local = localizedTrack(lang, tr.id);
                    const active = selectedTrack === tr.id;
                    return (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => setSelectedTrack(tr.id)}
                        className={`rounded-lg border p-3 text-left text-xs transition ${active ? "border-[var(--highlight)] bg-white/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                      >
                        <div className="text-lg">{tr.icon}</div>
                        <div className="mt-1 font-medium">{local.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--highlight)] px-3 py-2.5 text-sm font-semibold text-[var(--navy)] transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {mode === "signin" ? t("auth.signInCta") : mode === "signup" ? t("auth.signUpCta") : t("auth.resetCta")}
            </button>
          </form>

          <div className="mt-5 space-y-1.5 text-center text-xs text-white/60">
            {mode === "signin" && (
              <>
                <button onClick={() => setMode("reset")} className="block w-full text-white/70 hover:text-white">{t("auth.forgot")}</button>
                <div>
                  {t("auth.noAccount")}{" "}
                  <button onClick={() => setMode("signup")} className="font-medium text-[var(--highlight)] hover:underline">{t("auth.signUpCta")}</button>
                </div>
              </>
            )}
            {mode === "signup" && (
              <div>
                {t("auth.haveAccount")}{" "}
                <button onClick={() => setMode("signin")} className="font-medium text-[var(--highlight)] hover:underline">{t("auth.signInCta")}</button>
              </div>
            )}
            {mode === "reset" && (
              <button onClick={() => setMode("signin")} className="text-white/70 hover:text-white">{t("auth.backToSignIn")}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, type, placeholder, value, onChange, autoComplete }: {
  icon: React.ReactNode; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
}) {
  return (
    <label className="relative block">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/40 focus:border-[var(--highlight)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]/40"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 11v3.8h5.4c-.2 1.4-1.6 4.1-5.4 4.1-3.3 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 4.3 14.5 3.3 12 3.3 7 3.3 3 7.3 3 12.4S7 21.5 12 21.5c6.9 0 9.2-4.8 9.2-7.3 0-.5 0-.9-.1-1.2H12z" />
    </svg>
  );
}
