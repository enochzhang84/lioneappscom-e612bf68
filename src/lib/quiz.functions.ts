// Public quiz reads. Uses the publishable (anon) key on the server. Anon column
// grants prevent selecting correct_answer/explanation, so grading happens via
// `gradeQuiz` below using the service role after the user submits.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type QuestionType =
  | "single_choice"
  | "image_choice"
  | "sign_recognition"
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "hotspot";

export type QuizQuestion = {
  id: string;
  question_type: QuestionType;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  category: string;
  image_url: string | null;
  question_en: string | null;
  option_a_en: string | null;
  option_b_en: string | null;
  option_c_en: string | null;
  option_d_en: string | null;
};

export type GradedQuestion = {
  id: string;
  question_type: QuestionType;
  question: string;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  question_en: string | null;
  option_a_en: string | null;
  option_b_en: string | null;
  option_c_en: string | null;
  option_d_en: string | null;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  explanation_en: string | null;
  official_source: string | null;
  manual_name: string | null;
  manual_chapter: string | null;
  manual_page: string | null;
  manual_url: string | null;
  google_keywords: string | null;
  category: string;
  picked: "A" | "B" | "C" | "D" | null;
  is_correct: boolean;
};

export type GradeResult = {
  total: number;
  correct: number;
  wrong: number;
  results: GradedQuestion[];
};

export const getRandomQuizQuestions = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: string; count?: number }) =>
    z.object({
      category: z.string().min(1).max(40).default("c1"),
      count: z.number().int().min(1).max(200).default(36),
    }).parse(d ?? {}),
  )
  .handler(async ({ data }): Promise<QuizQuestion[]> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    // Exclude any bank that is inactive or opted out of exam pools; this lets
    // multiple banks share one category (e.g. c1_signs) and be pooled together.
    const { data: excluded } = await supabasePublic
      .from("question_bank_nodes")
      .select("id")
      .eq("node_type", "bank")
      .or("is_active.eq.false,include_in_exam.eq.false");
    const excludedIds = new Set(((excluded ?? []) as Array<{ id: string }>).map((b) => b.id));
    // Only select non-sensitive columns; anon lacks column grants for
    // correct_answer/explanation. Never return answer keys to the client.
    const { data: rows, error } = await supabasePublic
      .from("quiz_questions")
      .select("id, question_type, question, option_a, option_b, option_c, option_d, category, image_url, question_en, option_a_en, option_b_en, option_c_en, option_d_en, question_bank_id")
      .eq("category", data.category)
      .eq("is_active", true);
    if (error) throw new Error(error.message);
    const list = ((rows ?? []) as Array<QuizQuestion & { question_bank_id: string | null }>)
      .filter((q) => !q.question_bank_id || !excludedIds.has(q.question_bank_id))
      .map(({ question_bank_id: _bank, ...rest }) => rest as QuizQuestion);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, data.count);
  });


// Mixed-pool random draw: fetch N from each specified category, then shuffle.
// Used by综合模拟考 (e.g. C1 = 36 written + 12 signs = 48).
export const getMixedRandomQuestions = createServerFn({ method: "GET" })
  .inputValidator((d: { pools: { category: string; count: number }[] }) =>
    z.object({
      pools: z
        .array(
          z.object({
            category: z.string().min(1).max(40),
            count: z.number().int().min(1).max(200),
          }),
        )
        .min(1)
        .max(6),
    }).parse(d),
  )
  .handler(async ({ data }): Promise<QuizQuestion[]> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data: excluded } = await supabasePublic
      .from("question_bank_nodes")
      .select("id")
      .eq("node_type", "bank")
      .or("is_active.eq.false,include_in_exam.eq.false");
    const excludedIds = new Set(((excluded ?? []) as Array<{ id: string }>).map((b) => b.id));

    const combined: QuizQuestion[] = [];
    for (const pool of data.pools) {
      const { data: rows, error } = await supabasePublic
        .from("quiz_questions")
        .select("id, question_type, question, option_a, option_b, option_c, option_d, category, image_url, question_en, option_a_en, option_b_en, option_c_en, option_d_en, question_bank_id")
        .eq("category", pool.category)
        .eq("is_active", true);
      if (error) throw new Error(error.message);
      const list = ((rows ?? []) as Array<QuizQuestion & { question_bank_id: string | null }>)
        .filter((q) => !q.question_bank_id || !excludedIds.has(q.question_bank_id))
        .map(({ question_bank_id: _bank, ...rest }) => rest as QuizQuestion);
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      combined.push(...list.slice(0, pool.count));
    }
    // Final shuffle so written & sign questions are interleaved.
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return combined;
  });

// History-aware mixed draw: excludes questions the user has already seen
// per pool. If a pool's remaining unseen count is less than requested, we
// take all remaining and top up from already-seen (a new round starts for
// that pool). Returns per-pool metadata so the client can maintain history.
export type PoolDrawResult = {
  category: string;
  exhausted: boolean;
  pickedIds: string[];
  totalAvailable: number;
  freshRemainingBefore: number;
};

export const getMixedRandomQuestionsWithHistory = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { pools: { category: string; count: number; excludeIds?: string[] }[] }) =>
      z.object({
        pools: z
          .array(
            z.object({
              category: z.string().min(1).max(40),
              count: z.number().int().min(1).max(200),
              excludeIds: z.array(z.string().uuid()).max(5000).default([]),
            }),
          )
          .min(1)
          .max(6),
      }).parse(d),
  )
  .handler(async ({ data }): Promise<{ questions: QuizQuestion[]; pools: PoolDrawResult[] }> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data: excludedBanks } = await supabasePublic
      .from("question_bank_nodes")
      .select("id")
      .eq("node_type", "bank")
      .or("is_active.eq.false,include_in_exam.eq.false");
    const excludedBankIds = new Set(
      ((excludedBanks ?? []) as Array<{ id: string }>).map((b) => b.id),
    );

    const combined: QuizQuestion[] = [];
    const poolResults: PoolDrawResult[] = [];

    for (const pool of data.pools) {
      const { data: rows, error } = await supabasePublic
        .from("quiz_questions")
        .select("id, question_type, question, option_a, option_b, option_c, option_d, category, image_url, question_en, option_a_en, option_b_en, option_c_en, option_d_en, question_bank_id")
        .eq("category", pool.category)
        .eq("is_active", true);
      if (error) throw new Error(error.message);
      const all = ((rows ?? []) as Array<QuizQuestion & { question_bank_id: string | null }>)
        .filter((q) => !q.question_bank_id || !excludedBankIds.has(q.question_bank_id))
        .map(({ question_bank_id: _bank, ...rest }) => rest as QuizQuestion);

      const excludeSet = new Set(pool.excludeIds ?? []);
      const fresh: QuizQuestion[] = [];
      const seen: QuizQuestion[] = [];
      for (const q of all) (excludeSet.has(q.id) ? seen : fresh).push(q);

      const shuffle = <T,>(arr: T[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      };
      shuffle(fresh);
      shuffle(seen);

      const need = Math.min(pool.count, all.length);
      const takeFresh = fresh.slice(0, Math.min(need, fresh.length));
      const remainingNeed = need - takeFresh.length;
      const takeSeen = remainingNeed > 0 ? seen.slice(0, remainingNeed) : [];
      const picked = [...takeFresh, ...takeSeen];

      combined.push(...picked);
      poolResults.push({
        category: pool.category,
        exhausted: remainingNeed > 0,
        pickedIds: picked.map((q) => q.id),
        totalAvailable: all.length,
        freshRemainingBefore: fresh.length,
      });
    }

    // Final shuffle so pools interleave.
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return { questions: combined, pools: poolResults };
  });

const answerEnum = z.enum(["A", "B", "C", "D"]);

// Lightweight single-question grader. Returns only is_correct so we can
// support "pass-and-stop" during live exams without exposing the full key set.
export const checkAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; answer: "A" | "B" | "C" | "D" }) =>
    z.object({ id: z.string().uuid(), answer: answerEnum }).parse(d),
  )
  .handler(async ({ data }): Promise<{ is_correct: boolean; correct_answer?: "A" | "B" | "C" | "D" }> => {
    // Graded through a SECURITY DEFINER DB function so no service-role key is
    // needed — answer keys still never leave the database unfiltered.
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data: res, error } = await supabasePublic.rpc("check_quiz_answer", {
      _id: data.id,
      _answer: data.answer,
    });
    if (error) throw new Error(error.message);
    const payload = (res ?? {}) as { is_correct?: boolean; correct_answer?: "A" | "B" | "C" | "D" };
    return payload.correct_answer
      ? { is_correct: !!payload.is_correct, correct_answer: payload.correct_answer }
      : { is_correct: !!payload.is_correct };
  });

    const correct = (row?.correct_answer ?? null) as "A" | "B" | "C" | "D" | null;
    const is_correct = !!correct && correct === data.answer;
    // Only reveal the correct letter after a wrong pick — this powers instant
    // feedback UX. Never leaks the key before the user attempts the question.
    return is_correct || !correct
      ? { is_correct }
      : { is_correct, correct_answer: correct };
  });

export const gradeQuiz = createServerFn({ method: "POST" })
  .inputValidator((d: { ids: string[]; answers: Record<string, "A" | "B" | "C" | "D"> }) =>
    z.object({
      ids: z.array(z.string().uuid()).min(1).max(200),
      answers: z.record(z.string().uuid(), answerEnum),
    }).parse(d),
  )
  .handler(async ({ data }): Promise<GradeResult> => {
    // Answer keys are only readable server-side. Use the admin client scoped to
    // just the submitted question IDs so we never expose the full key set.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("quiz_questions")
      .select("id, question_type, question, image_url, option_a, option_b, option_c, option_d, correct_answer, explanation, question_en, option_a_en, option_b_en, option_c_en, option_d_en, explanation_en, official_source, manual_name, manual_chapter, manual_page, manual_url, google_keywords, category")
      .in("id", data.ids);
    if (error) throw new Error(error.message);

    // Preserve original submission order.
    const byId = new Map((rows ?? []).map((r) => [r.id as string, r]));
    const results: GradedQuestion[] = data.ids
      .map((id) => byId.get(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((r) => {
        const picked = (data.answers[r.id as string] ?? null) as "A" | "B" | "C" | "D" | null;
        const correct = r.correct_answer as "A" | "B" | "C" | "D";
        const rr = r as unknown as Record<string, string | null>;
        return {
          id: r.id as string,
          question_type: ((r as unknown as { question_type?: QuestionType }).question_type ?? "single_choice") as QuestionType,
          question: r.question as string,
          image_url: (r as unknown as { image_url: string | null }).image_url ?? null,
          option_a: r.option_a as string,
          option_b: r.option_b as string,
          option_c: (r.option_c as string | null) ?? null,
          option_d: (r.option_d as string | null) ?? null,
          question_en: (r.question_en as string | null) ?? null,
          option_a_en: (r.option_a_en as string | null) ?? null,
          option_b_en: (r.option_b_en as string | null) ?? null,
          option_c_en: (r.option_c_en as string | null) ?? null,
          option_d_en: (r.option_d_en as string | null) ?? null,
          correct_answer: correct,
          explanation: (r.explanation as string | null) ?? null,
          explanation_en: (r.explanation_en as string | null) ?? null,
          official_source: rr.official_source ?? null,
          manual_name: rr.manual_name ?? null,
          manual_chapter: rr.manual_chapter ?? null,
          manual_page: rr.manual_page ?? null,
          manual_url: rr.manual_url ?? null,
          google_keywords: rr.google_keywords ?? null,
          category: (r.category as string) ?? "",
          picked,
          is_correct: picked === correct,
        };
      });

    const correct = results.reduce((n, r) => n + (r.is_correct ? 1 : 0), 0);
    return { total: results.length, correct, wrong: results.length - correct, results };
  });
