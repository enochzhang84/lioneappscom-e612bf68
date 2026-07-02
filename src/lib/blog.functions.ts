// Blog CRUD + public reads.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createClient } from "@supabase/supabase-js";

async function ensureAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: string | null;
  tags: string[];
  status: string;
  featured: boolean;
  views: number;
  seo_title: string | null;
  seo_description: string | null;
  author_id: string | null;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const blogInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "slug 只允许小写字母、数字和短横线"),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(600).nullable().optional(),
  content: z.string().default(""),
  cover_image: z.string().max(500).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  tags: z.array(z.string().max(40)).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  seo_title: z.string().max(160).nullable().optional(),
  seo_description: z.string().max(320).nullable().optional(),
  published_at: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

// ---------- Public reads ----------
export const listPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const supa = publicClient();
  const { data, error } = await supa
    .from("blog_posts")
    .select("id,slug,title,excerpt,cover_image,category,tags,featured,published_at")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const supa = publicClient();
    const { data: row, error } = await supa
      .from("blog_posts").select("*").eq("slug", data.slug).eq("status", "published").maybeSingle();
    if (error) throw new Error(error.message);
    return (row as BlogPost | null) ?? null;
  });

// ---------- Admin CRUD ----------
export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("blog_posts").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BlogPost[];
  });

export const adminGetPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("blog_posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return row as BlogPost | null;
  });

export const adminUpsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => blogInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt ?? null,
      content: data.content,
      cover_image: data.cover_image ?? null,
      category: data.category ?? null,
      tags: data.tags,
      status: data.status,
      featured: data.featured,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      published_at:
        data.status === "published"
          ? data.published_at ?? new Date().toISOString()
          : data.published_at ?? null,
      sort_order: data.sort_order,
      author_id: context.userId,
    };
    if (data.id) {
      const { error } = await context.supabase.from("blog_posts").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("blog_posts").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
