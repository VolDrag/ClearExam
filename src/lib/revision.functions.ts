import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const addSchema = z.object({
  questionId: z.string().uuid(),
  reason: z.enum(["incorrect", "flagged", "manual"]).default("manual"),
});

export const addBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => addSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("revision_bookmarks")
      .upsert(
        { user_id: context.userId, question_id: data.questionId, reason: data.reason },
        { onConflict: "user_id,question_id" },
      );
    if (error) throw error;
    return { ok: true };
  });

export const removeBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ questionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("revision_bookmarks")
      .delete()
      .eq("user_id", context.userId)
      .eq("question_id", data.questionId);
    if (error) throw error;
    return { ok: true };
  });

export const listBookmarks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ lang: z.enum(["en", "bn"]).default("en") }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("revision_bookmarks")
      .select("id, question_id, reason, created_at, review_count, last_reviewed_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!rows || rows.length === 0) return { items: [] };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const qIds = rows.map((r) => r.question_id);
    const [qs, opts, ans, subs] = await Promise.all([
      supabaseAdmin
        .from("questions")
        .select("id, subject_id, question_text, question_text_bn, year, institution")
        .in("id", qIds),
      supabaseAdmin
        .from("question_options")
        .select("id, question_id, label, option_text, ordinal")
        .in("question_id", qIds),
      supabaseAdmin.from("correct_answers").select("question_id, option_id").in("question_id", qIds),
      supabaseAdmin.from("subjects").select("id, name_en, track_id"),
    ]);
    if (qs.error) throw qs.error;
    if (opts.error) throw opts.error;
    if (ans.error) throw ans.error;
    if (subs.error) throw subs.error;

    const subjectName = new Map<string, { name: string; track: string }>(
      (subs.data ?? []).map((s) => [s.id, { name: s.name_en, track: s.track_id }]),
    );
    const correctById = new Map<string, string>((ans.data ?? []).map((a) => [a.question_id, a.option_id]));
    const optsByQ = new Map<string, { id: string; text: string; ordinal: number }[]>();
    for (const o of opts.data ?? []) {
      const arr = optsByQ.get(o.question_id) ?? [];
      arr.push({ id: o.id, text: o.option_text ?? o.label ?? "", ordinal: o.ordinal });
      optsByQ.set(o.question_id, arr);
    }
    const qById = new Map((qs.data ?? []).map((q) => [q.id, q]));

    return {
      items: rows
        .filter((r) => qById.has(r.question_id))
        .map((r) => {
          const q = qById.get(r.question_id)!;
          const meta = subjectName.get(q.subject_id);
          const sortedOpts = (optsByQ.get(q.id) ?? []).sort((a, b) => a.ordinal - b.ordinal);
          const correctId = correctById.get(q.id);
          return {
            bookmarkId: r.id,
            questionId: r.question_id,
            reason: r.reason,
            createdAt: r.created_at,
            reviewCount: r.review_count,
            subject: meta?.name ?? "—",
            track: meta?.track ?? null,
            text: (data.lang === "bn" && q.question_text_bn) ? q.question_text_bn : q.question_text,
            options: sortedOpts.map((o) => o.text),
            answer: Math.max(0, sortedOpts.findIndex((o) => o.id === correctId)),
            citation: `${q.institution ?? ""} ${q.year ?? ""}`.trim(),
          };
        }),
    };
  });

export const markReviewed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ questionIds: z.array(z.string().uuid()) }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.questionIds.length === 0) return { ok: true };
    const { data: existing, error: e1 } = await context.supabase
      .from("revision_bookmarks")
      .select("id, question_id, review_count")
      .eq("user_id", context.userId)
      .in("question_id", data.questionIds);
    if (e1) throw e1;
    for (const row of existing ?? []) {
      await context.supabase
        .from("revision_bookmarks")
        .update({ review_count: (row.review_count ?? 0) + 1, last_reviewed_at: new Date().toISOString() })
        .eq("id", row.id);
    }
    return { ok: true };
  });
