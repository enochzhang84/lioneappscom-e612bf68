// SEO metadata CRUD. Admin-only writes, public read.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createClient } from "@supabase/supabase-js";

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

export type SeoMeta = {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  robots: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const seoInput = z.object({
  id: z.string().uuid().optional(),
  path: z.string().min(1).max(200).regex(/^\/[^\s]*$/, "路径需以 / 开头，且不含空格"),
  title: z.string().max(160).nullable().optional(),
  description: z.string().max(320).nullable().optional(),
  og_image_url: z.string().max(500).nullable().optional(),
  canonical_url: z.string().max(500).nullable().optional(),
  robots: z.string().max(80).default("index,follow"),
  is_active: z.boolean().default(true),
});

// ---------- Public reader (safe, RLS scoped to is_active=true) ----------
export const getSeoMetaByPath = createServerFn({ method: "GET" })
  .inputValidator((d: { path: string }) => z.object({ path: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const supa = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: row } = await supa
      .from("seo_meta")
      .select("path,title,description,og_image_url,canonical_url,robots")
      .eq("path", data.path)
      .eq("is_active", true)
      .maybeSingle();
    return row ?? null;
  });

// ---------- Admin CRUD ----------
export const adminListSeo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("seo_meta")
      .select("*")
      .order("path", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as SeoMeta[];
  });

export const adminGetSeo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("seo_meta").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row as SeoMeta | null;
  });

export const adminUpsertSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => seoInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload = {
      path: data.path,
      title: data.title ?? null,
      description: data.description ?? null,
      og_image_url: data.og_image_url ?? null,
      canonical_url: data.canonical_url ?? null,
      robots: data.robots ?? "index,follow",
      is_active: data.is_active,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("seo_meta").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("seo_meta").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const adminDeleteSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("seo_meta").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
