// Admin quiz CRUD. Requires auth + admin role.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

async function ensureAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

const questionInput = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().nullable().optional(),
  option_d: z.string().nullable().optional(),
  question_en: z.string().nullable().optional(),
  option_a_en: z.string().nullable().optional(),
  option_b_en: z.string().nullable().optional(),
  option_c_en: z.string().nullable().optional(),
  option_d_en: z.string().nullable().optional(),
  correct_answer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().nullable().optional(),
  explanation_en: z.string().nullable().optional(),
  official_source: z.string().nullable().optional(),
  manual_name: z.string().nullable().optional(),
  manual_chapter: z.string().nullable().optional(),
  manual_page: z.string().nullable().optional(),
  manual_url: z.string().nullable().optional(),
  google_keywords: z.string().nullable().optional(),
  category: z.string().min(1).max(40).default("c1"),
  question_bank_id: z.string().uuid().nullable().optional(),
  difficulty: z.string().max(20).default("medium"),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const adminListQuiz = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { category?: string } | undefined) =>
    z.object({ category: z.string().max(40).optional() }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    let q = context.supabase.from("quiz_questions").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminGetQuiz = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase.from("quiz_questions").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpsertQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => questionInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload = {
      question: data.question,
      option_a: data.option_a,
      option_b: data.option_b,
      option_c: data.option_c ?? null,
      option_d: data.option_d ?? null,
      question_en: data.question_en ?? null,
      option_a_en: data.option_a_en ?? null,
      option_b_en: data.option_b_en ?? null,
      option_c_en: data.option_c_en ?? null,
      option_d_en: data.option_d_en ?? null,
      correct_answer: data.correct_answer,
      explanation: data.explanation ?? null,
      explanation_en: data.explanation_en ?? null,
      official_source: data.official_source ?? null,
      manual_name: data.manual_name ?? null,
      manual_chapter: data.manual_chapter ?? null,
      manual_page: data.manual_page ?? null,
      manual_url: data.manual_url ?? null,
      google_keywords: data.google_keywords ?? null,
      category: data.category,
      difficulty: data.difficulty,
      is_active: data.is_active,
      sort_order: data.sort_order,
    };
    if (data.id) {
      const { error } = await context.supabase.from("quiz_questions").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("quiz_questions").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminDeleteQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("quiz_questions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleQuizActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; is_active: boolean }) =>
    z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("quiz_questions").update({ is_active: data.is_active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
