// Admin CRUD for question_bank_nodes (three-level tree: category → module → bank).
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

async function ensureAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export type BankNode = {
  id: string;
  parent_id: string | null;
  node_type: "category" | "module" | "bank";
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  legacy_category: string | null;
  question_count: number;
};

// List every node + question count per bank. Small dataset, single call.
export const adminListBankNodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: nodes, error } = await context.supabase
      .from("question_bank_nodes")
      .select("id,parent_id,node_type,name,name_en,slug,icon,description,sort_order,is_active,legacy_category")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);

    // count questions per bank
    const { data: counts, error: cErr } = await context.supabase
      .from("quiz_questions")
      .select("question_bank_id");
    if (cErr) throw new Error(cErr.message);
    const countMap = new Map<string, number>();
    for (const row of counts ?? []) {
      const id = (row as { question_bank_id: string | null }).question_bank_id;
      if (!id) continue;
      countMap.set(id, (countMap.get(id) ?? 0) + 1);
    }

    return (nodes ?? []).map((n) => ({
      ...n,
      question_count: countMap.get(n.id) ?? 0,
    })) as BankNode[];
  });

const upsertInput = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().nullable(),
  node_type: z.enum(["category", "module", "bank"]),
  name: z.string().min(1).max(100),
  name_en: z.string().max(100).nullable().optional(),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, "slug 只能包含小写字母、数字、-"),
  icon: z.string().max(40).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const adminUpsertBankNode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => upsertInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload = {
      parent_id: data.parent_id,
      node_type: data.node_type,
      name: data.name,
      name_en: data.name_en ?? null,
      slug: data.slug,
      icon: data.icon ?? null,
      description: data.description ?? null,
      sort_order: data.sort_order,
      is_active: data.is_active,
    };
    if (data.id) {
      const { error } = await context.supabase.from("question_bank_nodes").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("question_bank_nodes").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const adminDeleteBankNode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    // Cascades to children via FK; questions get SET NULL on question_bank_id.
    const { error } = await context.supabase.from("question_bank_nodes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleBankNodeActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; is_active: boolean }) =>
    z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("question_bank_nodes").update({ is_active: data.is_active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminReorderBankNode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; sort_order: number }) =>
    z.object({ id: z.string().uuid(), sort_order: z.number().int() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("question_bank_nodes").update({ sort_order: data.sort_order }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
