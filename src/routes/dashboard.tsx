import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useTrack } from "@/lib/track-context";
import { useT, localizedTrack } from "@/lib/i18n";
import { dashboardSeed } from "@/lib/mock-data";
import { loadHistory, type ExamSummary } from "@/lib/exam-store";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, Calendar, ClipboardList, Target } from "lucide-react";
import { useRequireAuth } from "@/lib/use-require-auth";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — ClearExam" },
      { name: "description", content: "Track your readiness, exam history, subject accuracy, and study streak in one place." },
      { property: "og:title", content: "Dashboard — ClearExam" },
      { property: "og:description", content: "Track your readiness, exam history, subject accuracy, and study streak in one place." },
      { property: "og:url", content: "https://clear-exam-genius.lovable.app/dashboard" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://clear-exam-genius.lovable.app/dashboard" }],
  }),
  component: DashboardPage,
});


function DashboardPage() {
  const { authed } = useRequireAuth();
  const { track, ready } = useTrack();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [history, setHistory] = useState<ExamSummary[]>([]);

  useEffect(() => {
    if (ready && authed && !track) navigate({ to: "/" });
    setHistory(loadHistory());
  }, [ready, authed, track, navigate]);

  const tr = localizedTrack(lang, track ?? "engineering");
  const seed = useMemo(() => dashboardSeed(), []);

  if (!authed || !ready || !track) return null;

  const hasData = history.length > 0;

  const examLine = hasData
    ? history.slice().reverse().slice(-12).map((h, i) => ({
        name: `M${i + 1}`,
        score: Math.round((h.score / h.total) * 100),
      }))
    : seed.exams;

  const subjectAccuracy = aggregateSubjects(history) ?? seed.subjects;
  const readiness = hasData ? computeReadiness(history) : seed.readiness;
  const yearHeatmap = useMemo(() => buildYearHeatmap(history, seed.heatmap), [history, seed.heatmap]);
  const totalMinutes = hasData
    ? Math.round(history.reduce((s, h) => s + h.durationSeconds, 0) / 60)
    : seed.summary.studyMinutes;
  const questionsAnswered = hasData
    ? history.reduce((s, h) => s + h.total, 0)
    : seed.summary.questions;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{t("dash.title")}</h1>
            <p className="text-muted-foreground">
              {t("dash.track")}:{" "}
              <span className="font-medium text-foreground">{tr.name}</span> · {tr.institutions}
            </p>
          </div>
          {!hasData && (
            <button
              onClick={() => navigate({ to: "/exam" })}
              className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {t("dash.startFirstExam")}
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card title={t("dash.overall")} icon={<Target className="size-4" />}>
            <div className="flex items-center gap-4">
              <ReadinessRing percent={readiness} />
              <div className="text-sm">
                <div className="text-3xl font-bold">{readiness}%</div>
                <div className="text-muted-foreground">{readinessLabel(readiness, t)}</div>
              </div>
            </div>
          </Card>

          <Card title={t("dash.history")} icon={<Activity className="size-4" />}>
            {hasData || examLine.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={examLine}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="score" stroke="var(--brand)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder label={t("dash.noExamHistory")} />
            )}
          </Card>

          <Card title={t("dash.accuracy")} icon={<ClipboardList className="size-4" />}>
            {subjectAccuracy.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={subjectAccuracy} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="subject" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
                  <Bar dataKey="accuracy" fill="var(--brand)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder label={t("dash.noSubjectData")} />
            )}
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr]">
          <Card title={t("dash.weak")}>
            <ul className="space-y-3">
              {seed.weakAreas.map((w) => (
                <li key={w.topic} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{w.topic}</div>
                    <div className="text-xs text-muted-foreground">{w.accuracy}{t("dash.accuracySuffix")}</div>
                  </div>
                  <button
                    onClick={() => navigate({ to: "/chat" })}
                    className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                  >
                    {t("dash.practice")}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card title={t("dash.streak")} icon={<Calendar className="size-4" />}>
            <YearHeatmap data={yearHeatmap} />
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stat label={t("dash.questions")} value={questionsAnswered.toString()} />
          <Stat label={t("dash.studyTime")} value={`${Math.round(totalMinutes / 60)} h`} />
          <Stat label={t("dash.examsCompleted")} value={history.length.toString()} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {icon}
        {title}
      </h2>

      <div className="mt-4">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
    </div>
  );
}

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center text-xs text-muted-foreground">
      <Activity className="mb-2 size-6 opacity-40" />
      {label}
    </div>
  );
}

function ReadinessRing({ percent }: { percent: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const off = c - (percent / 100) * c;
  const color = percent >= 75 ? "var(--success)" : percent >= 50 ? "var(--highlight)" : "var(--danger)";
  const weight = percent >= 75 ? 11 : percent >= 50 ? 10 : 9;
  return (
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} stroke="var(--muted)" strokeWidth="9" fill="none" />
      <circle
        cx="48" cy="48" r={r}
        stroke={color}
        strokeWidth={weight}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: "stroke-dashoffset 900ms ease, stroke-width 300ms" }}
      />
    </svg>
  );
}

function readinessLabel(p: number, t: (k: string) => string) {
  if (p >= 80) return t("dash.readiness.high");
  if (p >= 55) return t("dash.readiness.mid");
  return t("dash.readiness.low");
}

function computeReadiness(history: ExamSummary[]): number {
  if (history.length === 0) return 0;
  const recent = history.slice(0, 5);
  const avg = recent.reduce((s, h) => s + (h.score / h.total) * 100, 0) / recent.length;
  const consistency = Math.min(history.length, 10) * 2;
  return Math.min(100, Math.round(avg * 0.8 + consistency));
}

function aggregateSubjects(history: ExamSummary[]) {
  if (history.length === 0) return null;
  const acc: Record<string, { correct: number; total: number }> = {};
  for (const h of history) for (const s of h.subjects) {
    acc[s.subject] ??= { correct: 0, total: 0 };
    acc[s.subject].correct += s.correct;
    acc[s.subject].total += s.total;
  }
  return Object.entries(acc).map(([subject, v]) => ({
    subject,
    accuracy: Math.round((v.correct / Math.max(1, v.total)) * 100),
  }));
}

function buildYearHeatmap(history: ExamSummary[], fallback: { date: string; count: number }[]) {
  const map = new Map<string, number>();
  for (const h of history) {
    const d = new Date(h.finishedAt).toISOString().slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + Math.max(1, Math.round(h.durationSeconds / 600)));
  }
  if (map.size === 0) return fallback;
  const today = new Date();
  const days = 364;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: map.get(key) ?? 0 };
  });
}

function YearHeatmap({ data }: { data: { date: string; count: number }[] }) {
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));
  const color = (n: number) =>
    n === 0 ? "var(--muted)" :
    n <= 1 ? "color-mix(in oklab, var(--brand) 25%, transparent)" :
    n <= 2 ? "color-mix(in oklab, var(--brand) 45%, transparent)" :
    n <= 3 ? "color-mix(in oklab, var(--brand) 70%, transparent)" :
    "var(--brand)";
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {wk.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} sessions`}
                className="size-2.5 rounded-[2px]"
                style={{ background: color(d.count) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
