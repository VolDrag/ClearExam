import type { UIMessage } from "ai";
import type { TrackId } from "./tracks";

const THREADS_KEY = "clearexam.threads";
const NOTES_KEY = "clearexam.notes";

export interface ChatThread {
  id: string;
  title: string;
  track: TrackId;
  messages: UIMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface SavedNote {
  id: string;
  question: string;
  answer: string;
  track: TrackId;
  subject?: string;
  savedAt: number;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadThreads(): ChatThread[] {
  return read<ChatThread[]>(THREADS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveThreads(threads: ChatThread[]) {
  write(THREADS_KEY, threads);
}

export function getThread(id: string): ChatThread | undefined {
  return loadThreads().find((t) => t.id === id);
}

export function upsertThread(thread: ChatThread) {
  const all = loadThreads();
  const idx = all.findIndex((t) => t.id === thread.id);
  if (idx >= 0) all[idx] = thread;
  else all.unshift(thread);
  saveThreads(all);
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}

export function createThread(track: TrackId, title = "New conversation"): ChatThread {
  const now = Date.now();
  const thread: ChatThread = {
    id: crypto.randomUUID(),
    title,
    track,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  upsertThread(thread);
  return thread;
}

export function loadNotes(): SavedNote[] {
  return read<SavedNote[]>(NOTES_KEY, []).sort((a, b) => b.savedAt - a.savedAt);
}

export function saveNote(note: SavedNote) {
  const all = loadNotes();
  all.unshift(note);
  write(NOTES_KEY, all);
}

export function deleteNote(id: string) {
  write(NOTES_KEY, loadNotes().filter((n) => n.id !== id));
}

export function extractText(msg: UIMessage): string {
  return msg.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}
