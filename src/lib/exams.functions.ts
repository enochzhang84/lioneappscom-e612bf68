// Public + admin server fns for quiz_exams.
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type ExamConfig = {
  id: string;
  category: string;
  title: string;
  subtitle: string | null;
  total_questions: number;
  pass_count: number;
  time_seconds: number;
  bilingual: boolean;
  back_href: string | null;
  back_label: string | null;
  is_active: boolean;
  sort_order: number;
};

function pub() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function ensureAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role")
    .eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

// ---------- Public ----------
export const getExamByCategory = createServerFn({ method: "GET" })
  .inputValidator((d: { category: string }) =>
    z.object({ category: z.string().min(1).max(60) }).parse(d),
  )
  .handler(async ({ data }): Promise<ExamConfig | null> => {
    const { data: row, error } = await pub()
      .from("quiz_exams").select("*")
      .eq("category", data.category).eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as ExamConfig | null) ?? null;
  });

// ---------- Admin ----------
export const adminListExams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ExamConfig[]> => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("quiz_exams").select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as ExamConfig[];
  });

export const adminGetExam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }): Promise<ExamConfig | null> => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("quiz_exams").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return (row as ExamConfig | null) ?? null;
  });

const examInput = z.object({
  id: z.string().uuid().optional(),
  category: z.string().min(1).max(60).regex(/^[a-z0-9_-]+$/, "只能小写字母、数字、_ 或 -"),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(400).nullable().optional(),
  total_questions: z.number().int().min(1).max(500),
  pass_count: z.number().int().min(0).max(500),
  time_seconds: z.number().int().min(0).max(60 * 60 * 6),
  bilingual: z.boolean().default(false),
  back_href: z.string().max(200).nullable().optional(),
  back_label: z.string().max(100).nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const adminUpsertExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => examInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload = {
      category: data.category,
      title: data.title,
      subtitle: data.subtitle ?? null,
      total_questions: data.total_questions,
      pass_count: data.pass_count,
      time_seconds: data.time_seconds,
      bilingual: data.bilingual,
      back_href: data.back_href ?? null,
      back_label: data.back_label ?? null,
      is_active: data.is_active,
      sort_order: data.sort_order,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("quiz_exams").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("quiz_exams").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const adminDeleteExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("quiz_exams").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Category summary — questions grouped by category, useful for quiz index sidebar.
export const adminListQuizCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Array<{ category: string; total: number; active: number }>> => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("quiz_questions").select("category, is_active");
    if (error) throw new Error(error.message);
    const map = new Map<string, { total: number; active: number }>();
    for (const r of (data ?? []) as Array<{ category: string; is_active: boolean }>) {
      const m = map.get(r.category) ?? { total: 0, active: 0 };
      m.total++; if (r.is_active) m.active++;
      map.set(r.category, m);
    }
    return [...map.entries()].map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => a.category.localeCompare(b.category));
  });
