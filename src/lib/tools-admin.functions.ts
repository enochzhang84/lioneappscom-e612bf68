// Admin CMS writes for tool_categories and tool_items. Requires admin role.
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

const uuid = z.string().uuid();

// ---------- Categories ----------
const categoryInput = z.object({
  id: uuid.optional(),
  page_id: uuid,
  title: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(20).nullable().optional(),
  sort_order: z.number().int().default(0),
  is_visible: z.boolean().default(true),
});

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { page_id: string }) => z.object({ page_id: uuid }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("tool_categories")
      .select("*")
      .eq("page_id", data.page_id)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => categoryInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload = {
      page_id: data.page_id,
      title: data.title,
      description: data.description ?? null,
      icon: data.icon ?? null,
      sort_order: data.sort_order,
      is_visible: data.is_visible,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("tool_categories").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("tool_categories").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("tool_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Items ----------
const itemInput = z.object({
  id: uuid.optional(),
  page_id: uuid,
  category_id: uuid.nullable().optional(),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, "slug 只能小写字母数字和短横线"),
  title: z.string().min(1).max(160),
  subtitle: z.string().max(300).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  content: z.string().nullable().optional(),
  html_content: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  link_url: z.string().nullable().optional(),
  button_text: z.string().max(60).nullable().optional(),
  sort_order: z.number().int().default(0),
  is_visible: z.boolean().default(true),
});

export const adminListItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { page_id: string }) => z.object({ page_id: uuid }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("tool_items")
      .select("*")
      .eq("page_id", data.page_id)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpsertItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => itemInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload = {
      page_id: data.page_id,
      category_id: data.category_id ?? null,
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle ?? null,
      description: data.description ?? null,
      content: data.content ?? null,
      html_content: data.html_content ?? null,
      image_url: data.image_url ?? null,
      video_url: data.video_url ?? null,
      link_url: data.link_url ?? null,
      button_text: data.button_text ?? null,
      sort_order: data.sort_order,
      is_visible: data.is_visible,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("tool_items").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("tool_items").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const adminDeleteItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("tool_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
