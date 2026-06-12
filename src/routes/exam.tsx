import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Navbar } from "@/components/Navbar";
import { useTrack } from "@/lib/track-context";
import { getTrack } from "@/lib/tracks";
import { useT, localizedTrack } from "@/lib/i18n";
import {
  createExam,
  getRemainingSeconds,
  loadActiveExam,
  recordSummary,
  saveActiveExam,
  stashReview,
  summarize,
  type ExamState,
} from "@/lib/exam-store";
import { fetchExamQuestions, getExamFilters } from "@/lib/exam-filters.functions";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useRequireAuth } from "@/lib/use-require-auth";
import { ChevronLeft, ChevronRight, Flag, Timer, Sparkles, RotateCcw, Inbox, Loader2 } from "lucide-react";
import { MathMarkdown } from "@/components/MathMarkdown";
import { toast } from "sonner";

export const Route = createFileRoute("/exam")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mock Exam — ClearExam" },
      { name: "description", content: "Take a timed mock exam built from authentic past papers and review wrong answers instantly." },
      { property: "og:title", content: "Mock Exam — ClearExam" },
      { property: "og:description", content: "Take a timed mock exam built from authentic past papers and review wrong answers instantly." },
      { property: "og:url", content: "https://clear-exam-genius.lovable.app/exam" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://clear-exam-genius.lovable.app/exam" }],
  }),
  component: ExamPage,
});


type Phase = "setup" | "running" | "result";

function ExamPage() {
  const { authed } = useRequireAuth();
  const { track, ready } = useTrack();
  const { t: tr, lang } = useT();
  const navigate = useNavigate();
  const [state, setState] = useState<ExamState | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [hydrated, setHydrated] = useState(false);
  const [subject, setSubject] = useState("All");
  const [university, setUniversity] = useState("All");
  const [year, setYear] = useState<string>("All");
  const [count, setCount] = useState(10);
  const [examLang, setExamLang] = useState<"en" | "bn">(lang);
  const [tick, setTick] = useState(0);
  const [filters, setFilters] = useState<{ subjects: string[]; universities: string[]; years: number[]; languages?: string[] } | null>(null);
  const [loadingStart, setLoadingStart] = useState(false);


  useEffect(() => {
    if (!ready || !authed) return;
    if (!track) { navigate({ to: "/" }); return; }
    const active = loadActiveExam();
    if (active && active.track === track) {
      setState(active);
      setPhase(active.status === "submitted" ? "result" : "running");
    }
    setHydrated(true);
  }, [ready, authed, track, navigate]);

  useEffect(() => {
    if (!authed || !track) return;
    getExamFilters({ data: { track } }).then(setFilters).catch(() => setFilters({ subjects: [], universities: [], years: [] }));
  }, [authed, track]);

  useEffect(() => { if (hydrated) saveActiveExam(state); }, [state, hydrated]);

  useEffect(() => {
    if (phase !== "running" || !state) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [phase, state]);

  const remaining = state ? getRemainingSeconds(state.deadlineMs) : 0;

  const submit = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.status === "submitted") return prev;
      const finished: ExamState = { ...prev, status: "submitted", finishedAt: Date.now() };
      recordSummary(summarize(finished));
      return finished;
    });
    setPhase("result");
    toast.success(tr("exam.submittedToast"));
  }, [tr]);

  useEffect(() => {
    if (phase === "running" && state && remaining <= 0) submit();
  }, [phase, state, remaining, submit, tick]);

  const trackCfg = getTrack(track);
  const tLocal = localizedTrack(lang, track ?? "engineering");

  if (!authed || !ready || !hydrated) return null;

  const start = async () => {
    if (!track) return;
    setLoadingStart(true);
    try {
      const res = await fetchExamQuestions({
        data: {
          track,
          subject: subject === "All" ? undefined : subject,
          university: university === "All" ? undefined : university,
          year: year === "All" ? undefined : Number(year),
          count,
          lang: examLang,
        },
      });

      if (res.questions.length === 0) {
        toast.info(tr("exam.empty"));
        return;
      }
      setState(createExam({ track, subject, questions: res.questions as any, secondsPerQuestion: 60 }));
      setPhase("running");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingStart(false);
    }
  };

  const discardAndRestart = () => {
    saveActiveExam(null);
    setState(null);
    setPhase("setup");
  };

  if (phase === "setup") {
    const subjectOptions = filters?.subjects.length ? filters.subjects : trackCfg.subjects;
    return (
      <div className="min-h-screen pb-20">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-12">
          <span className="rounded-full bg-[var(--brand)]/10 px-3 py-1 text-xs font-medium text-[var(--brand)]">
            {tr("exam.badge", { track: tLocal.name })}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{tr("exam.setupTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{tr("exam.setupSubtitle")}</p>

          <div className="mt-8 space-y-5 rounded-2xl border bg-card p-6">
            <Select label={tr("exam.university")} value={university} onChange={setUniversity}
              options={["All", ...(filters?.universities ?? [])]}
              renderOption={(v) => v === "All" ? tr("exam.allInstitutions") : v}
            />
            <Select label={tr("exam.year")} value={year} onChange={setYear}
              options={["All", ...(filters?.years ?? []).map(String)]}
              renderOption={(v) => v === "All" ? tr("exam.allYears") : v}
            />
            <Select label={tr("exam.subject")} value={subject} onChange={setSubject}
              options={["All", ...subjectOptions]}
              renderOption={(v) => v === "All" ? tr("exam.all") : v}
            />
            <div>
              <div className="mb-1 text-sm font-medium">{tr("exam.numQuestions")}</div>
              <div className="flex gap-2">
                {[10, 20, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm transition ${
                      count === n
                        ? "border-[var(--brand)] bg-[var(--brand)]/5 font-medium text-[var(--brand)]"
                        : "hover:bg-accent"
                    }`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">{tr("exam.versionLabel")}</div>
              <div className="flex gap-2">
                {(["en", "bn"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setExamLang(l)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm transition ${
                      examLang === l
                        ? "border-[var(--brand)] bg-[var(--brand)]/5 font-medium text-[var(--brand)]"
                        : "hover:bg-accent"
                    }`}
                  >{l === "en" ? tr("exam.versionEn") : tr("exam.versionBn")}</button>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{tr("exam.versionHint")}</p>
            </div>

            <button
              onClick={start}
              disabled={loadingStart}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--brand)] py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loadingStart ? <><Loader2 className="size-4 animate-spin" /> {tr("exam.loading")}</> : tr("exam.start")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "running" && state) {
    return <RunningView state={state} remaining={remaining} onChange={setState} onSubmit={submit} onDiscard={discardAndRestart} />;
  }

  if (phase === "result" && state) {
    return <ResultView state={state} onRestart={discardAndRestart} navigate={navigate} />;
  }

  return null;
}

function Select({ label, value, onChange, options, renderOption }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; renderOption: (v: string) => React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
        {options.map((o) => <option key={o} value={o}>{renderOption(o)}</option>)}
      </select>
    </label>
  );
}

function formatClock(seconds: number) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function RunningView({ state, remaining, onChange, onSubmit, onDiscard }: {
  state: ExamState; remaining: number;
  onChange: (updater: (s: ExamState | null) => ExamState | null) => void;
  onSubmit: () => void; onDiscard: () => void;
}) {
  const { t: tr } = useT();
  const q = state.questions[state.current];
  const danger = remaining < 60;

  const setAnswer = (idx: number) => onChange((prev) => prev ? { ...prev, answers: { ...prev.answers, [q.id]: idx } } : prev);
  const toggleFlag = () => onChange((prev) => prev ? { ...prev, flagged: { ...prev.flagged, [q.id]: !prev.flagged[q.id] } } : prev);
  const jumpTo = (i: number) => onChange((prev) => prev ? { ...prev, current: i } : prev);

  return (
    <div className="min-h-screen pb-32">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="sr-only">{tr("exam.badge", { track: "" })}</h1>
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">{tr("exam.question")} {state.current + 1} / {state.questions.length}</div>

          <div className="flex items-center gap-2">
            <button onClick={onDiscard} className="inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent" title={tr("exam.discard")}>
              <RotateCcw className="size-3.5" /> {tr("exam.discard")}
            </button>
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-sm transition ${danger ? "animate-pulse bg-[var(--danger)] text-white" : "bg-[var(--navy)] text-white"}`}>
              <Timer className="size-4 text-[var(--highlight)]" /> {formatClock(remaining)}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
          <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium">{q.subject}</span>
          <div className="mt-4 min-h-[3rem] text-lg font-medium leading-relaxed">
            <MathMarkdown>{q.text}</MathMarkdown>
          </div>
          <div className="mt-6 space-y-2">
            {q.options.map((opt, i) => {
              const selected = state.answers[q.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(i)}
                  className={`flex w-full items-start gap-2 rounded-lg border p-3 text-left transition ${
                    selected ? "border-[var(--brand)] bg-[var(--brand)]/5 shadow-sm" : "hover:border-[var(--brand)]/50 hover:bg-accent"
                  }`}
                >
                  <span className="mt-0.5 font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                  <span className="flex-1"><MathMarkdown inline>{opt}</MathMarkdown></span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button onClick={toggleFlag} className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition ${state.flagged[q.id] ? "border-[var(--highlight)] bg-[var(--highlight)]/20" : "hover:bg-accent"}`}>
              <Flag className="size-4" /> {state.flagged[q.id] ? tr("exam.flagged") : tr("exam.flag")}
            </button>
            <div className="flex gap-2">
              <button onClick={() => jumpTo(Math.max(0, state.current - 1))} disabled={state.current === 0} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-40">
                <ChevronLeft className="size-4" />
              </button>
              {state.current < state.questions.length - 1 ? (
                <button onClick={() => jumpTo(state.current + 1)} className="rounded-md bg-[var(--navy)] px-4 py-1.5 text-sm text-white hover:opacity-90">
                  {tr("exam.next")} <ChevronRight className="ml-1 inline size-4" />
                </button>
              ) : (
                <button onClick={onSubmit} className="rounded-md bg-[var(--brand)] px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                  {tr("exam.submit")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 backdrop-blur md:bottom-0">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="mb-2 flex items-center gap-4 text-[11px] text-muted-foreground">
            <Legend swatch="bg-[var(--brand)]" label={tr("exam.legend.answered")} />
            <Legend swatch="border bg-card" label={tr("exam.legend.unanswered")} />
            <Legend swatch="bg-[var(--highlight)]/40 border border-[var(--highlight)]" label={tr("exam.legend.flagged")} />
            <Legend swatch="ring-2 ring-[var(--brand)]" label={tr("exam.legend.current")} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {state.questions.map((qq, i) => {
              const answered = state.answers[qq.id] !== undefined;
              const isFlag = state.flagged[qq.id];
              const active = i === state.current;
              return (
                <button
                  key={qq.id}
                  onClick={() => jumpTo(i)}
                  aria-label={`Question ${i + 1}`}
                  className={`flex size-8 items-center justify-center rounded-md text-xs font-semibold transition ${
                    active ? "ring-2 ring-[var(--brand)] ring-offset-2" : ""
                  } ${
                    isFlag ? "border border-[var(--highlight)] bg-[var(--highlight)]/30 text-[var(--highlight-foreground)]" : answered ? "bg-[var(--brand)] text-white" : "border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >{i + 1}</button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block size-3 rounded-sm ${swatch}`} />
      {label}
    </div>
  );
}

function ResultView({ state, onRestart, navigate }: {
  state: ExamState; onRestart: () => void; navigate: ReturnType<typeof useNavigate>;
}) {
  const { t: tr } = useT();
  const summary = useMemo(() => summarize(state), [state]);
  const pct = Math.round((summary.score / summary.total) * 100);
  const wrong = useMemo(() => state.questions.filter((q) => state.answers[q.id] !== q.answer), [state]);
  const flaggedQs = useMemo(() => state.questions.filter((q) => state.flagged[q.id]), [state]);
  const reviewSet = useMemo(() => {
    const set = new Map<string, { q: typeof state.questions[number]; reason: "incorrect" | "flagged" }>();
    for (const q of wrong) set.set(q.id, { q, reason: "incorrect" });
    for (const q of flaggedQs) if (!set.has(q.id)) set.set(q.id, { q, reason: "flagged" });
    return Array.from(set.values());
  }, [wrong, flaggedQs]);

  const sendToTutor = () => {
    stashReview({
      track: state.track,
      items: wrong.map((q) => ({
        question: q.text,
        correct: q.options[q.answer],
        chosen: state.answers[q.id] !== undefined ? q.options[state.answers[q.id]] : null,
      })),
    });
    navigate({ to: "/chat" });
  };

  const chartData = summary.subjects.map((s) => ({ subject: s.subject, accuracy: Math.round((s.correct / s.total) * 100) }));

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold">{tr("exam.results")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tr("exam.completedIn", { mins: Math.max(1, Math.round(summary.durationSeconds / 60)) })}
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center rounded-2xl border bg-card p-6 shadow-sm">
            <RadialGauge percent={pct} />
            <div className="mt-3 text-base font-semibold">{summary.score} / {summary.total}</div>
            <div className="text-xs text-muted-foreground">{verdict(pct, tr)}</div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground">{tr("exam.subjectBreakdown")}</h3>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="subject" type="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} formatter={(v) => [`${v}%`, tr("exam.accuracy")]} />
                  <Bar dataKey="accuracy" fill="var(--brand)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{tr("exam.reviewWrong")}</h3>
          {wrong.length > 0 && (
            <button onClick={sendToTutor} className="inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Sparkles className="size-4" /> {tr("exam.reviewWithTutor")}
            </button>
          )}
        </div>

        {reviewSet.length === 0 ? (
          <p className="mt-4 rounded-2xl border bg-card p-6 text-center text-muted-foreground">
            {tr("exam.perfect")}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {reviewSet.map(({ q, reason }) => (
              <div key={q.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="text-sm font-medium"><MathMarkdown inline>{q.text}</MathMarkdown></div>
                  <BookmarkButton questionId={q.id} reason={reason} />
                </div>
                <div className="mt-2 text-xs text-destructive">
                  <span className="font-medium">{tr("exam.yourAnswer")}: </span>
                  {state.answers[q.id] !== undefined
                    ? <MathMarkdown inline>{q.options[state.answers[q.id]]}</MathMarkdown>
                    : tr("exam.skipped")}
                </div>
                <div className="text-xs text-[var(--success)]">
                  <span className="font-medium">{tr("exam.correct")}: </span>
                  <MathMarkdown inline>{q.options[q.answer]}</MathMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onRestart} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            {tr("exam.newExam")}
          </button>
          <button onClick={() => navigate({ to: "/dashboard" })} className="rounded-md bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            {tr("exam.viewDashboard")}
          </button>
        </div>
      </div>
    </div>
  );
}

function verdict(pct: number, tr: (k: string) => string) {
  if (pct >= 85) return tr("exam.verdict.excellent");
  if (pct >= 70) return tr("exam.verdict.strong");
  if (pct >= 50) return tr("exam.verdict.improving");
  return tr("exam.verdict.keepGoing");
}

function RadialGauge({ percent }: { percent: number }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const color = percent >= 75 ? "var(--success)" : percent >= 50 ? "var(--highlight)" : "var(--danger)";
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} stroke="var(--muted)" strokeWidth="12" fill="none" />
      <circle cx="70" cy="70" r={r} stroke={color} strokeWidth="12" fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 800ms ease" }} />
      <text x="70" y="78" textAnchor="middle" fontSize="28" fontWeight="700" fill="var(--foreground)">{percent}%</text>
    </svg>
  );
}
