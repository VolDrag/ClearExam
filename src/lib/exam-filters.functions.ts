import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const trackSchema = z.object({ track: z.string().min(1) });

export const getExamFilters = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => trackSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subjects, error: sErr } = await supabaseAdmin
      .from("subjects")
      .select("id, name_en")
      .eq("track_id", data.track)
      .order("ordinal", { ascending: true });
    if (sErr) throw sErr;
    const subjectIds = (subjects ?? []).map((s) => s.id);
    if (subjectIds.length === 0) return { subjects: [], universities: [], years: [], languages: [] };

    const { data: meta, error: mErr } = await supabaseAdmin
      .from("questions")
      .select("institution, year, language")
      .in("subject_id", subjectIds);
    if (mErr) throw mErr;

    const uniSet = new Set<string>();
    const yearSet = new Set<number>();
    const langSet = new Set<string>();
    for (const row of meta ?? []) {
      if (row.institution) uniSet.add(row.institution);
      if (row.year !== null && row.year !== undefined) yearSet.add(row.year as number);
      if (row.language) langSet.add(row.language as string);
    }
    return {
      subjects: (subjects ?? []).map((s) => s.name_en),
      universities: Array.from(uniSet).sort(),
      years: Array.from(yearSet).sort((a, b) => b - a),
      languages: Array.from(langSet).sort(),
    };
  });


const bankSchema = z.object({
  track: z.string().min(1),
  institution: z.string().optional(),
  year: z.number().int().optional(),
  subject: z.string().optional(),
  lang: z.enum(["en", "bn"]).default("en"),
  limit: z.number().int().min(1).max(200).default(50),
});

export const fetchInstitutionBank = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bankSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let subjectsQ = supabaseAdmin.from("subjects").select("id, name_en").eq("track_id", data.track);
    if (data.subject && data.subject !== "All") subjectsQ = subjectsQ.eq("name_en", data.subject);
    const { data: subjects, error: sErr } = await subjectsQ;
    if (sErr) throw sErr;
    const subjectIds = (subjects ?? []).map((s) => s.id);
    if (subjectIds.length === 0) return { questions: [] };

    let qQ = supabaseAdmin
      .from("questions")
      .select("id, subject_id, question_text, question_text_bn, year, institution")
      .in("subject_id", subjectIds)
      .order("year", { ascending: false });
    if (data.institution && data.institution !== "All") qQ = qQ.eq("institution", data.institution);
    if (data.year) qQ = qQ.eq("year", data.year);
    const { data: questions, error: qErr } = await qQ.limit(data.limit);
    if (qErr) throw qErr;
    if (!questions || questions.length === 0) return { questions: [] };

    const qIds = questions.map((q) => q.id);
    const [optsRes, ansRes] = await Promise.all([
      supabaseAdmin.from("question_options")
        .select("id, question_id, option_text, label, ordinal")
        .in("question_id", qIds)
        .order("ordinal", { ascending: true }),
      supabaseAdmin.from("correct_answers")
        .select("question_id, option_id").in("question_id", qIds),
    ]);
    if (optsRes.error) throw optsRes.error;
    if (ansRes.error) throw ansRes.error;
    const subjectName = new Map<string, string>((subjects ?? []).map((s) => [s.id, s.name_en]));
    const correctByQ = new Map<string, string>((ansRes.data ?? []).map((a) => [a.question_id, a.option_id]));
    const optsByQ = new Map<string, { id: string; text: string; ordinal: number }[]>();
    for (const o of optsRes.data ?? []) {
      const arr = optsByQ.get(o.question_id) ?? [];
      arr.push({ id: o.id, text: o.option_text ?? o.label ?? "", ordinal: o.ordinal });
      optsByQ.set(o.question_id, arr);
    }
    return {
      questions: questions.map((q) => {
        const opts = (optsByQ.get(q.id) ?? []).sort((a, b) => a.ordinal - b.ordinal);
        const correctId = correctByQ.get(q.id);
        const answerIdx = Math.max(0, opts.findIndex((o) => o.id === correctId));
        // Show authentic stored text (whatever language the question was stored in).
        const authenticText = q.question_text ?? q.question_text_bn ?? "";
        return {
          id: q.id,
          subject: subjectName.get(q.subject_id) ?? "—",
          text: authenticText,
          options: opts.map((o) => o.text),
          answer: answerIdx,
          year: q.year,
          institution: q.institution,
        };
      }),
    };
  });


const fetchSchema = z.object({
  track: z.string().min(1),
  subject: z.string().optional(),
  university: z.string().optional(),
  year: z.number().int().optional(),
  count: z.number().int().min(1).max(100).default(10),
  lang: z.enum(["en", "bn"]).default("en"),
});

export const fetchExamQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => fetchSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let subjectsQ = supabaseAdmin.from("subjects").select("id, name_en").eq("track_id", data.track);
    if (data.subject && data.subject !== "All") subjectsQ = subjectsQ.eq("name_en", data.subject);
    const { data: subjects, error: sErr } = await subjectsQ;
    if (sErr) throw sErr;
    const subjectIds = (subjects ?? []).map((s) => s.id);
    if (subjectIds.length === 0) return { questions: [] };

    let qQ = supabaseAdmin
      .from("questions")
      .select("id, subject_id, question_text, question_text_bn, year, institution, language")
      .in("subject_id", subjectIds)
      .eq("language", data.lang);
    if (data.university && data.university !== "All") qQ = qQ.eq("institution", data.university);
    if (data.year) qQ = qQ.eq("year", data.year);


    const { data: questions, error: qErr } = await qQ.limit(200);
    if (qErr) throw qErr;
    if (!questions || questions.length === 0) return { questions: [] };

    const qIds = questions.map((q) => q.id);
    const [optsRes, ansRes] = await Promise.all([
      supabaseAdmin
        .from("question_options")
        .select("id, question_id, label, option_text, ordinal")
        .in("question_id", qIds)
        .order("ordinal", { ascending: true }),
      supabaseAdmin
        .from("correct_answers")
        .select("question_id, option_id")
        .in("question_id", qIds),
    ]);
    if (optsRes.error) throw optsRes.error;
    if (ansRes.error) throw ansRes.error;

    const subjectName = new Map<string, string>((subjects ?? []).map((s) => [s.id, s.name_en]));
    const correctByQ = new Map<string, string>((ansRes.data ?? []).map((a) => [a.question_id, a.option_id]));
    const optsByQ = new Map<string, { id: string; text: string; ordinal: number }[]>();
    for (const o of optsRes.data ?? []) {
      const arr = optsByQ.get(o.question_id) ?? [];
      arr.push({ id: o.id, text: o.option_text ?? o.label ?? "", ordinal: o.ordinal });
      optsByQ.set(o.question_id, arr);
    }

    // shuffle and take count
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, data.count);

    return {
      questions: shuffled.map((q) => {
        const opts = (optsByQ.get(q.id) ?? []).sort((a, b) => a.ordinal - b.ordinal);
        const correctId = correctByQ.get(q.id);
        const answerIdx = Math.max(0, opts.findIndex((o) => o.id === correctId));
        return {
          id: q.id,
          subject: subjectName.get(q.subject_id) ?? "—",
          text: q.question_text ?? q.question_text_bn ?? "",
          options: opts.map((o) => o.text),
          optionIds: opts.map((o) => o.id),
          answer: answerIdx,
          citation: `${q.institution ?? ""} ${q.year ?? ""}`.trim(),
          year: q.year,
          institution: q.institution,
        };
      }),
    };
  });
