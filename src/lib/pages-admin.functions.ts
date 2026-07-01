// Admin CMS writes for Pages. Requires auth + admin role.
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

const slug = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "slug 只能小写字母数字和短横线");

const pageInput = z.object({
  id: z.string().uuid().optional(),
  slug,
  title: z.string().min(1).max(120),
  nav_label: z.string().min(1).max(60),
  page_type: z.enum(["content", "tools", "blank"]).default("content"),
  content: z.array(z.record(z.string(), z.any())).default([]),
  show_in_nav: z.boolean().default(true),
  is_visible: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const adminListPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("pages")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("pages")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpsertPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => pageInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    if (data.id) {
      const { error } = await context.supabase
        .from("pages")
        .update({
          slug: data.slug,
          title: data.title,
          nav_label: data.nav_label,
          page_type: data.page_type,
          content: data.content,
          show_in_nav: data.show_in_nav,
          is_visible: data.is_visible,
          sort_order: data.sort_order,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("pages")
      .insert({
        slug: data.slug,
        title: data.title,
        nav_label: data.nav_label,
        page_type: data.page_type,
        content: data.content,
        show_in_nav: data.show_in_nav,
        is_visible: data.is_visible,
        sort_order: data.sort_order,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const adminDeletePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("pages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminTogglePageVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; is_visible: boolean }) =>
    z.object({ id: z.string().uuid(), is_visible: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("pages")
      .update({ is_visible: data.is_visible })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminMovePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; sort_order: number }) =>
    z.object({ id: z.string().uuid(), sort_order: z.number().int() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("pages")
      .update({ sort_order: data.sort_order })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
