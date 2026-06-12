import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useTrack } from "@/lib/track-context";
import { useT } from "@/lib/i18n";
import { getExamFilters, fetchInstitutionBank } from "@/lib/exam-filters.functions";
import { MathMarkdown } from "@/components/MathMarkdown";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Library, Loader2, ChevronDown, CheckCircle2, Inbox } from "lucide-react";

export const Route = createFileRoute("/question-bank")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Question Bank — Past Papers by Institution | ClearExam" },
      { name: "description", content: "Browse authentic previous year admission questions filtered by institution, year, and subject." },
      { property: "og:title", content: "Question Bank — Past Papers by Institution | ClearExam" },
      { property: "og:description", content: "Browse authentic previous year admission questions filtered by institution, year, and subject." },
      { property: "og:url", content: "https://clear-exam-genius.lovable.app/question-bank" },
    ],
    links: [{ rel: "canonical", href: "https://clear-exam-genius.lovable.app/question-bank" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "ClearExam Question Bank",
        url: "https://clear-exam-genius.lovable.app/question-bank",
        description: "Authentic previous year university admission questions for Bangladesh.",
      }),
    }],
  }),
  component: () => (
    <ErrorBoundary fallbackTitle="Question bank did not load" fallbackDescription="Refresh the page or change the filter selection.">
      <BankPage />
    </ErrorBoundary>
  ),
});

type Question = {
  id: string;
  subject: string;
  text: string;
  options: string[];
  answer: number;
  year: number | null;
  institution: string | null;
};

function BankPage() {
  const { authed } = useRequireAuth();
  const { track, ready } = useTrack();
  const { t, lang } = useT();
  const [filters, setFilters] = useState<{ subjects: string[]; universities: string[]; years: number[] } | null>(null);
  const [institution, setInstitution] = useState("All");
  const [year, setYear] = useState("All");
  const [subject, setSubject] = useState("All");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authed || !track) return;
    getExamFilters({ data: { track } })
      .then(setFilters)
      .catch(() => setFilters({ subjects: [], universities: [], years: [] }));
  }, [authed, track]);

  useEffect(() => {
    if (!authed || !track) return;
    setLoading(true);
    fetchInstitutionBank({
      data: {
        track,
        institution: institution === "All" ? undefined : institution,
        year: year === "All" ? undefined : Number(year),
        subject: subject === "All" ? undefined : subject,
        lang,
        limit: 100,
      },
    })
      .then((r) => setQuestions(r.questions as Question[]))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [authed, track, institution, year, subject, lang]);

  if (!ready || !authed) return null;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <Library className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">{t("bank.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("bank.subtitle")}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-3">
          <FilterSelect label={t("bank.institution")} value={institution} onChange={setInstitution}
            options={["All", ...(filters?.universities ?? [])]}
            render={(v) => v === "All" ? t("bank.allInstitutions") : v} />
          <FilterSelect label={t("bank.year")} value={year} onChange={setYear}
            options={["All", ...(filters?.years ?? []).map(String)]}
            render={(v) => v === "All" ? t("bank.allYears") : v} />
          <FilterSelect label={t("bank.subject")} value={subject} onChange={setSubject}
            options={["All", ...(filters?.subjects ?? [])]}
            render={(v) => v === "All" ? t("bank.allSubjects") : v} />
        </div>

        <div className="mt-6 min-h-[20rem]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("bank.loading")}
            </div>
          ) : questions && questions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card py-16 text-center">
              <Inbox className="size-8 text-muted-foreground" />
              <div className="text-sm font-medium">{t("bank.emptyTitle")}</div>
              <div className="max-w-sm text-xs text-muted-foreground">{t("bank.emptyBody")}</div>
            </div>
          ) : (
            <div className="space-y-3">
              {(questions ?? []).map((q, i) => {
                const isOpen = !!open[q.id];
                return (
                  <article key={q.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-[var(--brand)]/10 px-2 py-0.5 font-medium text-[var(--brand)]">
                        {q.institution ?? t("bank.unknownInstitution")}
                      </span>
                      {q.year && <span className="rounded-full bg-accent px-2 py-0.5 font-medium">{q.year}</span>}
                      <span className="rounded-full bg-accent px-2 py-0.5 font-medium">{q.subject}</span>
                      <span className="ml-auto text-muted-foreground">{i + 1}</span>
                    </div>
                    <div className="mt-3 text-sm font-medium leading-relaxed">
                      <MathMarkdown>{q.text}</MathMarkdown>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const correct = isOpen && oi === q.answer;
                        return (
                          <li key={oi} className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm transition ${
                            correct ? "border-[var(--success)] bg-[var(--success)]/10" : "border-transparent bg-background"
                          }`}>
                            <span className="mt-0.5 font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + oi)}.</span>
                            <span className="flex-1"><MathMarkdown inline>{opt}</MathMarkdown></span>
                            {correct && <CheckCircle2 className="size-4 shrink-0 text-[var(--success)]" />}
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      onClick={() => setOpen((p) => ({ ...p, [q.id]: !p[q.id] }))}
                      className="mt-3 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      <ChevronDown className={`size-3.5 transition ${isOpen ? "rotate-180" : ""}`} />
                      {isOpen ? t("bank.hideAnswer") : t("bank.showAnswer")}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, render }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; render: (v: string) => React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full truncate rounded-md border bg-background px-3 py-2 text-sm">
        {options.map((o) => <option key={o} value={o}>{render(o)}</option>)}
      </select>
    </label>
  );
}
