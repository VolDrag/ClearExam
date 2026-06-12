import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useT } from "@/lib/i18n";
import { listBookmarks, removeBookmark, markReviewed } from "@/lib/revision.functions";
import { stashReview } from "@/lib/exam-store";
import { useTrack } from "@/lib/track-context";
import { Bookmark, Sparkles, Trash2, BookOpen, Zap } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

export const Route = createFileRoute("/revision")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Revision Bank — ClearExam" },
      { name: "description", content: "Review questions you bookmarked or got wrong with spaced practice and AI rapid fire quizzes." },
      { property: "og:title", content: "Revision Bank — ClearExam" },
      { property: "og:description", content: "Review questions you bookmarked or got wrong with spaced practice and AI rapid fire quizzes." },
      { property: "og:url", content: "https://clear-exam-genius.lovable.app/revision" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://clear-exam-genius.lovable.app/revision" }],
  }),
  component: RevisionPage,
});

interface Item {
  bookmarkId: string;
  questionId: string;
  reason: string;
  subject: string;
  track: string | null;
  text: string;
  options: string[];
  answer: number;
  citation: string;
  reviewCount: number;
}

function RevisionPage() {
  const { authed } = useRequireAuth();
  const { t, lang } = useT();
  const { track } = useTrack();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[] | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const load = async () => {
    const res = await listBookmarks({ data: { lang } });
    setItems(res.items as Item[]);
  };

  useEffect(() => {
    if (!authed) return;
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"));
  }, [authed, lang]);

  const subjects = useMemo(
    () => ["All", ...Array.from(new Set((items ?? []).map((i) => i.subject)))],
    [items],
  );
  const filtered = (items ?? []).filter(
    (i) => (subjectFilter === "All" || i.subject === subjectFilter) && (!track || !i.track || i.track === track),
  );

  const removeOne = async (id: string) => {
    await removeBookmark({ data: { questionId: id } });
    toast.success(t("rev.removed"));
    load();
  };

  const rapidFire = async () => {
    if (filtered.length === 0) return;
    const picks = filtered.slice(0, 10);
    await markReviewed({ data: { questionIds: picks.map((p) => p.questionId) } });
    stashReview({
      track: (track ?? "engineering") as any,
      items: picks.map((p) => ({
        question: `${p.text}\n   Options: ${p.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("  ")}`,
        correct: p.options[p.answer] ?? "",
        chosen: null,
      })),
    });
    sessionStorage.setItem("clearexam.rapidFire", "1");
    navigate({ to: "/chat" });
  };

  if (!authed) return null;

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Bookmark className="size-7 text-[var(--brand)]" /> {t("rev.title")}
            </h1>
            <p className="text-muted-foreground">{t("rev.subtitle")}</p>
          </div>
          {filtered.length > 0 && (
            <button
              onClick={rapidFire}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Zap className="size-4" /> {t("rev.rapidFire")}
            </button>
          )}
        </div>

        {items === null ? (
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl border bg-card" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<Bookmark className="size-10" />}
              title={t("rev.emptyTitle")}
              description={t("rev.emptyDesc")}
              action={<button onClick={() => navigate({ to: "/exam" })} className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm text-white">{t("rev.startExam")}</button>}
            />
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    subjectFilter === s ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "hover:bg-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {filtered.map((q) => {
                const open = revealed[q.questionId];
                return (
                  <div key={q.bookmarkId} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-[var(--brand)]/10 px-2 py-0.5 font-medium text-[var(--brand)]">{q.subject}</span>
                        <span className="rounded-full bg-accent px-2 py-0.5">{q.reason}</span>
                        {q.citation && <span className="text-muted-foreground">{q.citation}</span>}
                        {q.reviewCount > 0 && <span className="text-muted-foreground">{t("rev.reviewedTimes", { n: q.reviewCount })}</span>}
                      </div>
                      <button onClick={() => removeOne(q.questionId)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={t("common.delete")}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm font-medium">{q.text}</p>
                    <div className="mt-3 space-y-1.5">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`rounded-md border px-3 py-2 text-sm ${
                            open && i === q.answer ? "border-[var(--success)] bg-[var(--success)]/10" : ""
                          }`}
                        >
                          <span className="mr-2 font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setRevealed((r) => ({ ...r, [q.questionId]: !open }))}
                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
                      >
                        <BookOpen className="size-3.5" /> {open ? t("rev.hideAnswer") : t("rev.showAnswer")}
                      </button>
                      <button
                        onClick={async () => {
                          await markReviewed({ data: { questionIds: [q.questionId] } });
                          stashReview({
                            track: (track ?? "engineering") as any,
                            items: [{
                              question: q.text,
                              correct: q.options[q.answer] ?? "",
                              chosen: null,
                            }],
                          });
                          navigate({ to: "/chat" });
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-[var(--navy)] px-3 py-1.5 text-xs text-white hover:opacity-90"
                      >
                        <Sparkles className="size-3.5 text-[var(--highlight)]" /> {t("rev.askTutor")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
