import type { TrackId } from "./tracks";
import type { ExamQuestion } from "./mock-data";

const KEY = "clearexam.activeExam";
const HISTORY_KEY = "clearexam.examHistory";

export type ExamStatus = "running" | "submitted";

export interface ExamState {
  attemptId: string;
  track: TrackId;
  subject: string;
  questions: ExamQuestion[];
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  current: number;
  deadlineMs: number;
  startedAt: number;
  finishedAt?: number;
  status: ExamStatus;
}

export interface ExamSummary {
  attemptId: string;
  track: TrackId;
  subject: string;
  score: number;
  total: number;
  durationSeconds: number;
  finishedAt: number;
  subjects: { subject: string; correct: number; total: number }[];
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function loadActiveExam(): ExamState | null {
  if (typeof window === "undefined") return null;
  return safeParse<ExamState>(window.localStorage.getItem(KEY));
}

export function saveActiveExam(state: ExamState | null) {
  if (typeof window === "undefined") return;
  if (state === null) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function createExam(opts: {
  track: TrackId;
  subject: string;
  questions: ExamQuestion[];
  secondsPerQuestion: number;
}): ExamState {
  const now = Date.now();
  return {
    attemptId: crypto.randomUUID(),
    track: opts.track,
    subject: opts.subject,
    questions: opts.questions,
    answers: {},
    flagged: {},
    current: 0,
    deadlineMs: now + opts.questions.length * opts.secondsPerQuestion * 1000,
    startedAt: now,
    status: "running",
  };
}

export function loadHistory(): ExamSummary[] {
  if (typeof window === "undefined") return [];
  return safeParse<ExamSummary[]>(window.localStorage.getItem(HISTORY_KEY)) ?? [];
}

export function recordSummary(summary: ExamSummary) {
  if (typeof window === "undefined") return;
  const all = loadHistory();
  all.unshift(summary);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(all.slice(0, 100)));
}

export function summarize(state: ExamState): ExamSummary {
  const subjects: Record<string, { correct: number; total: number }> = {};
  let score = 0;
  for (const q of state.questions) {
    subjects[q.subject] ??= { correct: 0, total: 0 };
    subjects[q.subject].total += 1;
    if (state.answers[q.id] === q.answer) {
      subjects[q.subject].correct += 1;
      score += 1;
    }
  }
  return {
    attemptId: state.attemptId,
    track: state.track,
    subject: state.subject,
    score,
    total: state.questions.length,
    durationSeconds: Math.max(1, Math.floor(((state.finishedAt ?? Date.now()) - state.startedAt) / 1000)),
    finishedAt: state.finishedAt ?? Date.now(),
    subjects: Object.entries(subjects).map(([subject, v]) => ({ subject, ...v })),
  };
}

export function getRemainingSeconds(deadlineMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
}

const REVIEW_KEY = "clearexam.aiReviewPayload";
export interface ReviewPayload {
  track: TrackId;
  items: { question: string; correct: string; chosen: string | null }[];
}
export function stashReview(payload: ReviewPayload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(REVIEW_KEY, JSON.stringify(payload));
}
export function popReview(): ReviewPayload | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(REVIEW_KEY);
  window.sessionStorage.removeItem(REVIEW_KEY);
  return safeParse<ReviewPayload>(raw);
}
