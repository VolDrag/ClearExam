import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useTrack } from "@/lib/track-context";
import { useT, localizedTrack } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, MessageSquare, ClipboardList, GraduationCap, Languages, Bookmark, LogOut, Library } from "lucide-react";
import { TrackChangeModal } from "./TrackChangeModal";
import { useState } from "react";
import { toast } from "sonner";

export function Navbar() {
  const { track } = useTrack();
  const { t, lang, setLang } = useT();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!track) return null;
  const tr = localizedTrack(lang, track);

  const NAV = [
    { to: "/chat", label: t("nav.tutor"), icon: MessageSquare },
    { to: "/exam", label: t("nav.exam"), icon: ClipboardList },
    { to: "/question-bank", label: t("nav.bank"), icon: Library },
    { to: "/revision", label: t("nav.revision"), icon: Bookmark },
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("auth.signedOut"));
    navigate({ to: "/", replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-[var(--navy)] text-[var(--navy-foreground)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Link to="/chat" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="size-5 text-[var(--highlight)]" />
            <span>ClearExam</span>
          </Link>

          <button
            onClick={() => setModal(true)}
            className="ml-1 hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium transition hover:bg-white/10 sm:flex"
          >
            <span className="text-[var(--highlight)]">●</span>
            <span>{tr.name}</span>
            <span className="hidden text-white/50 md:inline">· {tr.institutions}</span>
            <span className="text-white/40">{t("common.change")}</span>
          </button>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
                    active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div
            role="group"
            aria-label={t("nav.langLabel")}
            className="ml-auto flex items-center overflow-hidden rounded-full border border-white/15 bg-white/5 text-xs font-medium md:ml-2"
          >
            <Languages className="ml-2 size-3.5 text-white/60" />
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 transition ${lang === "en" ? "bg-[var(--highlight)] text-[var(--navy)]" : "text-white/70 hover:text-white"}`}
              aria-pressed={lang === "en"}
            >EN</button>
            <button
              onClick={() => setLang("bn")}
              className={`px-2.5 py-1 transition ${lang === "bn" ? "bg-[var(--highlight)] text-[var(--navy)]" : "text-white/70 hover:text-white"}`}
              aria-pressed={lang === "bn"}
            >বাং</button>
          </div>

          {user && (
            <button
              onClick={handleSignOut}
              title={t("auth.signOut")}
              className="ml-1 hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80 hover:bg-white/10 sm:flex"
            >
              <span className="grid size-5 place-items-center rounded-full bg-[var(--highlight)] text-[10px] font-bold text-[var(--navy)]">
                {(user.email ?? "?")[0]?.toUpperCase()}
              </span>
              <LogOut className="size-3.5" />
            </button>
          )}
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t bg-white md:hidden">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = path.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex flex-col items-center gap-1 py-2 text-[11px] ${
                active ? "text-[var(--brand)]" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <TrackChangeModal open={modal} onClose={() => setModal(false)} />
    </>
  );
}
