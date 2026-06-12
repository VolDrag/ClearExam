import { createFileRoute, Link } from "@tanstack/react-router";
import { saveTrackChoice } from "@/lib/track-context";
import { TRACKS } from "@/lib/tracks";
import { useT, localizedTrack } from "@/lib/i18n";
import { GraduationCap, ArrowRight, Languages } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClearExam — AI Admission Tutor for Bangladesh" },
      {
        name: "description",
        content:
          "Personalized AI tutor for BUET, MBBS, DU and IBA admission prep with mock exams, question bank, and revision tools.",
      },
      { property: "og:title", content: "ClearExam — AI Admission Tutor for Bangladesh" },
      {
        property: "og:description",
        content:
          "Personalized AI tutor for BUET, MBBS, DU and IBA admission prep with mock exams, question bank, and revision tools.",
      },
      { property: "og:url", content: "https://clear-exam-genius.lovable.app/" },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ece6c19e-81db-4744-87de-3f1720929f68/id-preview-d3b5ea78--3193d3bb-3205-44d7-a452-e1ef5e7599c6.lovable.app-1781158532539.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ece6c19e-81db-4744-87de-3f1720929f68/id-preview-d3b5ea78--3193d3bb-3205-44d7-a452-e1ef5e7599c6.lovable.app-1781158532539.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://clear-exam-genius.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "ClearExam",
          url: "https://clear-exam-genius.lovable.app",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "ClearExam",
          url: "https://clear-exam-genius.lovable.app",
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, lang, setLang } = useT();

  const pickTrack = (id: (typeof TRACKS)[number]["id"]) => {
    saveTrackChoice(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--navy)] via-[var(--navy)] to-[#0d1f3a] text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="size-6 text-[var(--highlight)]" />
          ClearExam
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-xs text-white/60 sm:block">{t("landing.crumb")}</div>
          <div className="flex items-center overflow-hidden rounded-full border border-white/15 bg-white/5 text-xs font-medium">
            <Languages className="ml-2 size-3.5 text-white/60" />
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`w-10 px-2 py-1 ${lang === "en" ? "bg-[var(--highlight)] text-[var(--navy)]" : "text-white/70 hover:text-white"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("bn")}
              className={`w-10 px-2 py-1 ${lang === "bn" ? "bg-[var(--highlight)] text-[var(--navy)]" : "text-white/70 hover:text-white"}`}
            >
              বাং
            </button>
          </div>
          <Link
            to="/auth"
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium hover:bg-white/10"
          >
            {t("landing.signIn")}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-12 text-center">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
          {t("landing.tagBadge")}
        </span>
        <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          {t("landing.heading1")}
          <br />
          <span className="text-[var(--highlight)]">{t("landing.heading2")}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-white/70">{t("landing.subtitle")}</p>
      </section>

      <section className="mx-auto mt-14 max-w-4xl px-6 pb-24">
        <div className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-white/60">
          {t("landing.selectTrack")}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TRACKS.map((tr) => {
            const local = localizedTrack(lang, tr.id);
            return (
              <Link
                key={tr.id}
                to="/auth"
                onClick={() => pickTrack(tr.id)}
                className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-colors hover:border-[var(--highlight)]/60 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{tr.icon}</div>
                  <ArrowRight className="size-5 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">{local.name}</h2>
                <p className="mt-1 text-sm text-white/60">{local.institutions}</p>
                <p className="mt-3 text-sm text-white/70">{local.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
