import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTrack } from "@/lib/track-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import { createThread, loadThreads } from "@/lib/chat-store";

export const Route = createFileRoute("/chat/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AI Tutor — ClearExam" },
      { name: "description", content: "Chat with an AI tutor that explains admission problems step by step in English or Bangla." },
      { property: "og:title", content: "AI Tutor — ClearExam" },
      { property: "og:description", content: "Chat with an AI tutor that explains admission problems step by step in English or Bangla." },
      { property: "og:url", content: "https://clear-exam-genius.lovable.app/chat" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://clear-exam-genius.lovable.app/chat" }],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const { authed } = useRequireAuth();
  const { track, ready } = useTrack();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !authed) return;
    if (!track) {
      navigate({ to: "/" });
      return;
    }
    const existing = loadThreads().find((t) => t.track === track);
    const thread = existing ?? createThread(track);
    navigate({ to: "/chat/$threadId", params: { threadId: thread.id }, replace: true });
  }, [ready, authed, track, navigate]);

  return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
}
