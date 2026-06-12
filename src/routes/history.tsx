import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useTrack } from "@/lib/track-context";
import { deleteNote, deleteThread, loadNotes, loadThreads, type ChatThread, type SavedNote } from "@/lib/chat-store";
import { useT, localizedTrack } from "@/lib/i18n";
import { EmptyState } from "@/components/EmptyState";
import { Bookmark, MessageSquare, Trash2 } from "lucide-react";
import { useRequireAuth } from "@/lib/use-require-auth";

export const Route = createFileRoute("/history")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Exam History — ClearExam" },
      { name: "description", content: "Review every mock exam you have taken with scores, subject breakdowns, and missed questions." },
      { property: "og:title", content: "Exam History — ClearExam" },
      { property: "og:description", content: "Review every mock exam you have taken with scores, subject breakdowns, and missed questions." },
      { property: "og:url", content: "https://clear-exam-genius.lovable.app/history" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://clear-exam-genius.lovable.app/history" }],
  }),
  component: HistoryPage,
});


function HistoryPage() {
  const { authed } = useRequireAuth();
  const { track, ready } = useTrack();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"chats" | "notes">("chats");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);

  useEffect(() => {
    if (ready && authed && !track) navigate({ to: "/" });
    setThreads(loadThreads());
    setNotes(loadNotes());
  }, [ready, authed, track, navigate]);

  if (!authed || !ready || !track) return null;

  const byDate = threads.reduce<Record<string, ChatThread[]>>((acc, th) => {
    const d = new Date(th.updatedAt).toDateString();
    (acc[d] ??= []).push(th);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-3xl font-bold">{t("hist.title")}</h1>

        <div className="mt-6 inline-flex rounded-lg border bg-card p-1">
          <button onClick={() => setTab("chats")} className={`rounded-md px-4 py-1.5 text-sm ${tab === "chats" ? "bg-[var(--brand)] text-white" : ""}`}>{t("hist.sessions")}</button>
          <button onClick={() => setTab("notes")} className={`rounded-md px-4 py-1.5 text-sm ${tab === "notes" ? "bg-[var(--brand)] text-white" : ""}`}>{t("hist.notes")}</button>
        </div>

        <div className="mt-6">
          {tab === "chats" ? (
            threads.length === 0 ? (
              <EmptyState icon={<MessageSquare className="size-10" />} title={t("hist.noSessions")} description={t("hist.noSessionsDesc")} action={<button onClick={() => navigate({ to: "/chat" })} className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm text-white">{t("hist.startChat")}</button>} />
            ) : (
              <div className="space-y-6">
                {Object.entries(byDate).map(([date, list]) => (
                  <div key={date}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{date}</h3>
                    <div className="space-y-2">
                      {list.map((th) => (
                        <div key={th.id} className="group flex items-center gap-3 rounded-lg border bg-card p-4">
                          <button onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: th.id } })} className="flex-1 text-left">
                            <div className="font-medium">{th.title}</div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="rounded-full bg-[var(--brand)]/10 px-2 py-0.5 font-medium text-[var(--brand)]">{localizedTrack(lang, th.track).name}</span>
                              <span>{th.messages.length} {t("hist.messages")}</span>
                              <span>· {new Date(th.updatedAt).toLocaleTimeString()}</span>
                            </div>
                          </button>
                          <button onClick={() => { deleteThread(th.id); setThreads(loadThreads()); }} className="rounded p-2 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : notes.length === 0 ? (
            <EmptyState icon={<Bookmark className="size-10" />} title={t("hist.noNotes")} description={t("hist.noNotesDesc")} />
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="rounded-full bg-[var(--brand)]/10 px-2 py-0.5 text-xs font-medium text-[var(--brand)]">{localizedTrack(lang, n.track).name}</span>
                      <h4 className="mt-2 font-medium">{n.question}</h4>
                      <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{n.answer}</p>
                      <div className="mt-2 text-xs text-muted-foreground">{t("hist.savedAt")} {new Date(n.savedAt).toLocaleString()}</div>
                    </div>
                    <button onClick={() => { deleteNote(n.id); setNotes(loadNotes()); }} className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
