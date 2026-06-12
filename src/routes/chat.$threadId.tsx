import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { MathMarkdown } from "@/components/MathMarkdown";
import { useTrack } from "@/lib/track-context";
import { useT, localizedTrack } from "@/lib/i18n";
import {
  createThread,
  deleteThread,
  extractText,
  getThread,
  loadThreads,
  saveNote,
  upsertThread,
  type ChatThread,
} from "@/lib/chat-store";
import { getTrack } from "@/lib/tracks";
import { mockSources } from "@/lib/mock-data";
import { popReview } from "@/lib/exam-store";
import { useRequireAuth } from "@/lib/use-require-auth";
import { Navbar } from "@/components/Navbar";
import { OcrSkeleton } from "@/components/Skeletons";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  Plus, Send, Trash2, Bookmark, ThumbsUp, ThumbsDown, GraduationCap,
  Sparkles, BookOpen, ImagePlus, AlertCircle, RefreshCw, X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$threadId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AI Tutor Thread — ClearExam" },
      { name: "description", content: "Continue a guided tutoring conversation with the ClearExam AI tutor." },
      { property: "og:title", content: "AI Tutor Thread — ClearExam" },
      { property: "og:description", content: "Continue a guided tutoring conversation with the ClearExam AI tutor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChatThreadPage,
});

function ChatThreadPage() {
  return (
    <ErrorBoundary fallbackTitle="The tutor view did not load" fallbackDescription="Refresh the page or pick another conversation from the sidebar.">
      <ChatThreadInner />
    </ErrorBoundary>
  );
}

function ChatThreadInner() {
  const { authed } = useRequireAuth();
  const { threadId } = useParams({ from: "/chat/$threadId" });
  const { track, ready } = useTrack();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !authed) return;
    if (!track) { navigate({ to: "/" }); return; }
    const list = loadThreads();
    setThreads(list);
    const existing = getThread(threadId);
    if (!existing) {
      const fresh = createThread(track);
      navigate({ to: "/chat/$threadId", params: { threadId: fresh.id }, replace: true });
      return;
    }
    setThread(existing);
    setHydrated(true);
  }, [threadId, ready, authed, track, navigate]);

  const tCfg = getTrack(thread?.track ?? track);
  const tLocal = localizedTrack(lang, thread?.track ?? track ?? "engineering");

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages, id }) => ({
        body: { messages, id, track: thread?.track ?? track, lang },
      }),
    }),
    [thread?.track, track, lang],
  );

  const { messages, sendMessage, status, setMessages, regenerate } = useChat({
    id: threadId,
    transport,
    onError: (e) => {
      setStreamError(e.message || t("chat.aiError"));
      toast.error(e.message || t("chat.aiError"));
    },
  });

  useEffect(() => {
    if (hydrated && thread) setMessages(thread.messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, threadId]);

  useEffect(() => {
    if (!hydrated || !thread) return;
    if (status === "submitted" || status === "streaming") return;
    const firstUser = messages.find((m) => m.role === "user");
    const title = firstUser ? extractText(firstUser).slice(0, 60) || "New conversation" : thread.title;
    const updated: ChatThread = { ...thread, messages, title, updatedAt: Date.now() };
    upsertThread(updated);
    setThreads(loadThreads());
    setThread(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status, hydrated]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, ocrLoading]);

  useEffect(() => { inputRef.current?.focus(); }, [threadId, status]);

  // Handle review payload from exam results
  useEffect(() => {
    if (!hydrated) return;
    const review = popReview();
    if (!review) return;
    const block = [
      t("chat.reviewPrompt"),
      "",
      ...review.items.map((it, i) =>
        `${i + 1}. ${it.question}\n   Correct answer: ${it.correct}\n   My answer: ${it.chosen ?? "skipped"}`),
    ].join("\n");
    sendMessage({ text: block });
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    setStreamError(null);
    sendMessage({ text });
    setInput("");
  };

  const newChat = () => {
    if (!track) return;
    const fresh = createThread(track);
    navigate({ to: "/chat/$threadId", params: { threadId: fresh.id } });
  };

  const onDelete = (id: string) => {
    deleteThread(id);
    const list = loadThreads();
    setThreads(list);
    if (id === threadId) {
      if (list.length) navigate({ to: "/chat/$threadId", params: { threadId: list[0].id }, replace: true });
      else newChat();
    }
  };

  const simulateOcr = (label: string) => {
    setOcrLoading(true);
    window.setTimeout(() => {
      setOcrLoading(false);
      const extracted = label === "sample"
        ? "A projectile is launched at 20 m per second at an angle of 30 degrees with the horizontal. Find the maximum height it reaches. (g = 9.8 m per s squared)"
        : "Extracted question text from your image. Edit if needed, then press send.";
      setInput(extracted);
      toast.success(t("chat.imageReady"));
      inputRef.current?.focus();
    }, 1800);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    e.target.value = "";
    simulateOcr("upload");
  };

  const retry = () => {
    setStreamError(null);
    regenerate();
  };

  if (!ready || !thread) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{t("common.loading")}</div>;
  }

  const lastAi = [...messages].reverse().find((m) => m.role === "assistant");
  const sourceMsg = selectedMsgId ? messages.find((m) => m.id === selectedMsgId) : lastAi;
  const sources = sourceMsg ? mockSources(thread.track) : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-0 px-0 pb-16 md:grid-cols-[280px_1fr] md:pb-0 lg:grid-cols-[280px_1fr_320px]">
        <aside className="hidden border-r bg-white md:flex md:flex-col">
          <div className="p-3">
            <button onClick={newChat} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Plus className="size-4" /> {t("chat.new")}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {threads.length === 0 ? (
              <p className="px-3 text-xs text-muted-foreground">{t("chat.noConversations")}</p>
            ) : (
              threads.map((th) => (
                <div
                  key={th.id}
                  className={`group mb-1 flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                    th.id === threadId ? "bg-accent" : "hover:bg-accent/60"
                  }`}
                >
                  <button
                    onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: th.id } })}
                    className="flex-1 truncate text-left"
                  >
                    <div className="truncate font-medium">{th.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {localizedTrack(lang, th.track).name} · {new Date(th.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    onClick={() => onDelete(th.id)}
                    className="rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            {messages.length === 0 && !ocrLoading ? (
              <EmptyChat samples={tCfg.samples} onPick={(q) => { setInput(q); inputRef.current?.focus(); }} trackName={tLocal.name} />
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((m, i) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    onSelect={() => { setSelectedMsgId(m.id); setShowSources(true); }}
                    onSave={(q, a) => {
                      saveNote({ id: crypto.randomUUID(), question: q, answer: a, track: thread.track, savedAt: Date.now() });
                      toast.success(t("chat.savedToast"));
                    }}
                    prevUser={messages[i - 1]}
                    saveLabel={t("chat.saveToNotes")}
                    sourcedLabel={t("chat.pastPaperSourced")}
                  />
                ))}
                {(status === "submitted" || status === "streaming") && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex gap-1">
                      <span className="size-2 animate-bounce rounded-full bg-[var(--brand)]" style={{ animationDelay: "0ms" }} />
                      <span className="size-2 animate-bounce rounded-full bg-[var(--brand)]" style={{ animationDelay: "150ms" }} />
                      <span className="size-2 animate-bounce rounded-full bg-[var(--brand)]" style={{ animationDelay: "300ms" }} />
                    </span>
                    {t("chat.thinking")}
                  </div>
                )}
                {ocrLoading && <OcrSkeleton />}
                {streamError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 animate-fade-in-up">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{t("chat.errorTitle")}</div>
                      <div className="text-xs text-muted-foreground">{t("chat.errorDescription")}</div>
                      <button
                        onClick={retry}
                        className="mt-2 inline-flex items-center gap-1 rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                      >
                        <RefreshCw className="size-3" /> {t("chat.retry")}
                      </button>
                    </div>
                    <button onClick={() => setStreamError(null)} className="rounded p-1 text-muted-foreground hover:bg-accent">
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t bg-white p-4">
            <div className="mx-auto flex max-w-3xl items-end gap-2">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-10 items-center gap-1 rounded-md border bg-background px-3 text-sm hover:bg-accent"
                title={t("chat.attachImage")}
                aria-label={t("chat.attachImage")}
                disabled={ocrLoading}
              >
                <ImagePlus className="size-4 text-[var(--brand)]" />
              </button>

              <button
                type="button"
                onClick={() => simulateOcr("sample")}
                className="hidden h-10 items-center gap-1 rounded-md border bg-background px-3 text-xs sm:flex hover:bg-accent"
                disabled={ocrLoading}
              >
                <Sparkles className="size-3.5 text-[var(--highlight)]" /> {t("chat.sampleImage")}
              </button>
              <details className="relative">
                <summary className="flex h-10 cursor-pointer list-none items-center gap-1 rounded-md border bg-background px-3 text-sm hover:bg-accent">
                  <Sparkles className="size-4 text-[var(--brand)]" /> {t("chat.samples")}
                </summary>
                <div className="absolute bottom-12 left-0 z-10 w-72 rounded-lg border bg-white p-2 shadow-lg">
                  {tCfg.samples.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </details>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
                }}
                rows={1}
                placeholder={t("chat.placeholder", { track: tLocal.name })}
                className="min-h-10 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
              <button
                type="submit"
                disabled={!input.trim() || status === "streaming" || status === "submitted"}
                className="flex h-10 items-center gap-1 rounded-md bg-[var(--brand)] px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                <Send className="size-4" /> {t("chat.send")}
              </button>
            </div>
          </form>
        </main>

        <aside
          className={`${
            showSources
              ? "fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t bg-white p-4 shadow-xl lg:static lg:max-h-none lg:rounded-none lg:border-l lg:border-t-0 lg:p-4 lg:shadow-none"
              : "hidden lg:block lg:border-l lg:bg-white lg:p-4"
          } animate-fade-in-up`}
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="size-4" /> {t("chat.citationsTitle")}
            </h3>
            <button className="text-xs text-muted-foreground lg:hidden" onClick={() => setShowSources(false)}>
              {t("common.close")}
            </button>
          </div>
          {sources.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">{t("chat.sourcesEmpty")}</p>
          ) : (
            <div className="mt-3 space-y-3">
              {sources.map((s, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-3 transition hover:border-[var(--brand)]/50 hover:shadow-sm animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{s.institution} {s.year}</div>
                    <span className="rounded-full bg-[var(--highlight)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--highlight-foreground)]">
                      {s.subject}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{s.excerpt}</p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{t("chat.matchConfidence")}</span><span className="font-mono">{s.match}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[var(--brand)] transition-[width] duration-700"
                          style={{ width: `${s.match}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{t("chat.frequency")}</span>
                        <span className="font-mono">{Math.max(1, Math.round(s.match / 12))}x in 5 years</span>
                      </div>
                      <div className="mt-1 flex gap-1">
                        {Array.from({ length: 5 }).map((_, k) => (
                          <span
                            key={k}
                            className={`h-1.5 flex-1 rounded-full ${
                              k < Math.round(s.match / 20) ? "bg-[var(--highlight)]" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function EmptyChat({ samples, onPick, trackName }: { samples: string[]; onPick: (q: string) => void; trackName: string }) {
  const { t } = useT();
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-16 text-center animate-fade-in-up">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--brand)]/10">
        <GraduationCap className="size-7 text-[var(--brand)]" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold">{t("chat.emptyTitle", { track: trackName })}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("chat.emptySubtitle")}</p>
      <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {samples.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-lg border bg-white p-3 text-left text-sm transition hover:border-[var(--brand)] hover:bg-[var(--brand)]/5"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message, prevUser, onSelect, onSave, saveLabel, sourcedLabel,
}: {
  message: UIMessage;
  prevUser?: UIMessage;
  onSelect: () => void;
  onSave: (q: string, a: string) => void;
  saveLabel: string;
  sourcedLabel: string;
}) {
  const text = extractText(message);
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-fade-in-up">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-[var(--navy)] px-4 py-2.5 text-sm text-[var(--navy-foreground)]">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 animate-fade-in-up" onClick={onSelect}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white">
        <GraduationCap className="size-4" />
      </div>
      <div className="max-w-[85%] flex-1 cursor-pointer rounded-2xl rounded-tl-sm border bg-white p-4 transition hover:border-[var(--brand)]/40 hover:shadow-sm">
        <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:font-semibold prose-p:my-2 prose-ol:my-2 prose-ul:my-2 prose-code:rounded prose-code:bg-muted prose-code:px-1">
          <MathMarkdown>{text || "…"}</MathMarkdown>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--highlight)]/20 px-2 py-0.5 font-medium text-[var(--highlight-foreground)]">
            <BookOpen className="size-3" /> {sourcedLabel}
          </span>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent" aria-label="Helpful"><ThumbsUp className="size-3.5" /></button>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent" aria-label="Not helpful"><ThumbsDown className="size-3.5" /></button>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(prevUser ? extractText(prevUser) : "Saved answer", text); }}
            className="ml-auto inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"
          >
            <Bookmark className="size-3" /> {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
