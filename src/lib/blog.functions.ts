// Blog CRUD + public reads (bilingual).
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

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// ================= Types =================
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  title_zh: string | null;
  title_en: string | null;
  excerpt: string | null;
  excerpt_zh: string | null;
  excerpt_en: string | null;
  content: string;
  content_zh: string | null;
  content_en: string | null;
  cover_image: string | null;
  cover_alt_zh: string | null;
  cover_alt_en: string | null;
  category: string | null;
  category_id: string | null;
  tags: string[];
  status: string;
  featured: boolean;
  views: number;
  seo_title: string | null;
  seo_title_zh: string | null;
  seo_title_en: string | null;
  seo_description: string | null;
  meta_description_zh: string | null;
  meta_description_en: string | null;
  og_image_url: string | null;
  reading_time: number | null;
  author_id: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  allow_comments: boolean;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogCategory = {
  id: string;
  slug: string;
  name_zh: string;
  name_en: string;
  description_zh: string | null;
  description_en: string | null;
  sort_order: number;
  is_active: boolean;
};

export type PublicPostRow = Pick<
  BlogPost,
  | "id"
  | "slug"
  | "title_zh"
  | "title_en"
  | "excerpt_zh"
  | "excerpt_en"
  | "cover_image"
  | "cover_alt_zh"
  | "cover_alt_en"
  | "category_id"
  | "tags"
  | "featured"
  | "reading_time"
  | "published_at"
>;

const PUBLIC_COLS =
  "id,slug,title_zh,title_en,excerpt_zh,excerpt_en,cover_image,cover_alt_zh,cover_alt_en,category_id,tags,featured,reading_time,published_at";

// ================= Public reads =================
export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supa = publicClient();
  const { data, error } = await supa
    .from("blog_categories")
    .select("id,slug,name_zh,name_en,description_zh,description_en,sort_order,is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogCategory[];
});

export const listPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator(
    (d?: { category?: string; q?: string; page?: number; pageSize?: number }) =>
      z
        .object({
          category: z.string().optional(),
          q: z.string().optional(),
          page: z.number().int().min(1).default(1),
          pageSize: z.number().int().min(1).max(50).default(9),
        })
        .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const supa = publicClient();
    let catId: string | null = null;
    if (data.category) {
      const { data: cat } = await supa
        .from("blog_categories")
        .select("id")
        .eq("slug", data.category)
        .maybeSingle();
      catId = (cat as { id: string } | null)?.id ?? null;
      if (!catId) return { items: [] as PublicPostRow[], total: 0 };
    }

    let query = supa
      .from("blog_posts")
      .select(PUBLIC_COLS, { count: "exact" })
      .eq("status", "published")
      .is("deleted_at", null);

    if (catId) query = query.eq("category_id", catId);
    if (data.q?.trim()) {
      const kw = data.q.trim().replace(/[%,]/g, " ");
      query = query.or(
        [
          `title_zh.ilike.%${kw}%`,
          `title_en.ilike.%${kw}%`,
          `excerpt_zh.ilike.%${kw}%`,
          `excerpt_en.ilike.%${kw}%`,
          `content_zh.ilike.%${kw}%`,
          `content_en.ilike.%${kw}%`,
        ].join(","),
      );
    }

    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    const { data: rows, error, count } = await query
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw new Error(error.message);
    return { items: (rows ?? []) as PublicPostRow[], total: count ?? 0 };
  });

export const getFeaturedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const supa = publicClient();
  const { data, error } = await supa
    .from("blog_posts")
    .select(PUBLIC_COLS)
    .eq("status", "published")
    .is("deleted_at", null)
    .eq("featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(4);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicPostRow[];
});

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const supa = publicClient();
    const { data: row, error } = await supa
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const post = row as BlogPost;
    // Best-effort category lookup (no throws).
    let category: BlogCategory | null = null;
    if (post.category_id) {
      const { data: c } = await supa
        .from("blog_categories")
        .select("id,slug,name_zh,name_en,description_zh,description_en,sort_order,is_active")
        .eq("id", post.category_id)
        .maybeSingle();
      category = (c as BlogCategory | null) ?? null;
    }
    // Related: same category, then newest — max 3
    let related: PublicPostRow[] = [];
    if (post.category_id) {
      const { data: r } = await supa
        .from("blog_posts")
        .select(PUBLIC_COLS)
        .eq("status", "published")
        .is("deleted_at", null)
        .eq("category_id", post.category_id)
        .neq("id", post.id)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(3);
      related = (r ?? []) as PublicPostRow[];
    }
    if (related.length < 3) {
      const { data: r2 } = await supa
        .from("blog_posts")
        .select(PUBLIC_COLS)
        .eq("status", "published")
        .is("deleted_at", null)
        .neq("id", post.id)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(3 - related.length);
      const seen = new Set(related.map((r) => r.id));
      for (const r of (r2 ?? []) as PublicPostRow[]) if (!seen.has(r.id)) related.push(r);
    }
    return { post, category, related };
  });

// ================= Admin =================
const blogInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "slug 只允许小写字母、数字和短横线"),
  title_zh: z.string().max(300).optional().nullable(),
  title_en: z.string().max(300).optional().nullable(),
  excerpt_zh: z.string().max(600).optional().nullable(),
  excerpt_en: z.string().max(600).optional().nullable(),
  content_zh: z.string().default(""),
  content_en: z.string().default(""),
  cover_image: z.string().max(500).optional().nullable(),
  cover_alt_zh: z.string().max(200).optional().nullable(),
  cover_alt_en: z.string().max(200).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().max(40)).default([]),
  status: z.enum(["draft", "scheduled", "published", "unpublished"]).default("draft"),
  featured: z.boolean().default(false),
  allow_comments: z.boolean().default(false),
  seo_title_zh: z.string().max(160).optional().nullable(),
  seo_title_en: z.string().max(160).optional().nullable(),
  meta_description_zh: z.string().max(320).optional().nullable(),
  meta_description_en: z.string().max(320).optional().nullable(),
  og_image_url: z.string().max(500).optional().nullable(),
  reading_time: z.number().int().min(0).max(240).optional().nullable(),
  published_at: z.string().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
});

export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("blog_posts")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as BlogPost[];
  });

export const adminGetPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("blog_posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as BlogPost | null;
  });

export const adminUpsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => blogInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    // Compute effective read fields for legacy columns
    const title = data.title_zh || data.title_en || "(Untitled)";
    const excerpt = data.excerpt_zh || data.excerpt_en || null;
    const content = data.content_zh || data.content_en || "";
    const payload = {
      slug: data.slug,
      title,
      title_zh: data.title_zh ?? null,
      title_en: data.title_en ?? null,
      excerpt,
      excerpt_zh: data.excerpt_zh ?? null,
      excerpt_en: data.excerpt_en ?? null,
      content,
      content_zh: data.content_zh ?? "",
      content_en: data.content_en ?? "",
      cover_image: data.cover_image ?? null,
      cover_alt_zh: data.cover_alt_zh ?? null,
      cover_alt_en: data.cover_alt_en ?? null,
      category_id: data.category_id ?? null,
      tags: data.tags,
      status: data.status,
      featured: data.featured,
      allow_comments: data.allow_comments,
      seo_title: data.seo_title_zh || data.seo_title_en || null,
      seo_title_zh: data.seo_title_zh ?? null,
      seo_title_en: data.seo_title_en ?? null,
      seo_description: data.meta_description_zh || data.meta_description_en || null,
      meta_description_zh: data.meta_description_zh ?? null,
      meta_description_en: data.meta_description_en ?? null,
      og_image_url: data.og_image_url ?? null,
      reading_time: data.reading_time ?? null,
      published_at:
        data.status === "published"
          ? data.published_at ?? new Date().toISOString()
          : data.published_at ?? null,
      scheduled_at: data.scheduled_at ?? null,
      sort_order: data.sort_order,
      author_id: context.userId,
    };
    if (data.id) {
      const { error } = await context.supabase.from("blog_posts").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("blog_posts")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const adminBulkAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ids: string[]; action: "publish" | "unpublish" | "delete" }) =>
    z
      .object({
        ids: z.array(z.string().uuid()).min(1),
        action: z.enum(["publish", "unpublish", "delete"]),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    if (data.action === "delete") {
      const { error } = await context.supabase
        .from("blog_posts")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", data.ids);
      if (error) throw new Error(error.message);
    } else if (data.action === "publish") {
      const { error } = await context.supabase
        .from("blog_posts")
        .update({ status: "published", published_at: new Date().toISOString() })
        .in("id", data.ids);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("blog_posts")
        .update({ status: "unpublished" })
        .in("id", data.ids);
      if (error) throw new Error(error.message);
    }
    return { ok: true, count: data.ids.length };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("blog_posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDuplicatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: src, error } = await context.supabase
      .from("blog_posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!src) throw new Error("Not found");
    const p = src as BlogPost;
    const newSlug = `${p.slug}-copy-${Math.random().toString(36).slice(2, 6)}`;
    const { data: row, error: err2 } = await context.supabase
      .from("blog_posts")
      .insert({
        slug: newSlug,
        title: `${p.title} (Copy)`,
        title_zh: p.title_zh ? `${p.title_zh}（副本）` : null,
        title_en: p.title_en ? `${p.title_en} (Copy)` : null,
        excerpt_zh: p.excerpt_zh,
        excerpt_en: p.excerpt_en,
        content: p.content,
        content_zh: p.content_zh ?? "",
        content_en: p.content_en ?? "",
        cover_image: p.cover_image,
        cover_alt_zh: p.cover_alt_zh,
        cover_alt_en: p.cover_alt_en,
        category_id: p.category_id,
        tags: p.tags,
        status: "draft",
        featured: false,
        reading_time: p.reading_time,
        author_id: context.userId,
      })
      .select("id")
      .single();
    if (err2) throw new Error(err2.message);
    return { id: (row as { id: string }).id };
  });

// ================= Categories admin =================
export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("blog_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as BlogCategory[];
  });

const categoryInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "slug 只允许小写字母、数字和短横线"),
  name_zh: z.string().min(1).max(120),
  name_en: z.string().min(1).max(120),
  description_zh: z.string().max(400).optional().nullable(),
  description_en: z.string().max(400).optional().nullable(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const adminUpsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => categoryInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    if (data.id) {
      const { error } = await context.supabase
        .from("blog_categories")
        .update({
          slug: data.slug,
          name_zh: data.name_zh,
          name_en: data.name_en,
          description_zh: data.description_zh ?? null,
          description_en: data.description_en ?? null,
          sort_order: data.sort_order,
          is_active: data.is_active,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("blog_categories")
      .insert({
        slug: data.slug,
        name_zh: data.name_zh,
        name_en: data.name_en,
        description_zh: data.description_zh ?? null,
        description_en: data.description_en ?? null,
        sort_order: data.sort_order,
        is_active: data.is_active,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { count, error: ce } = await context.supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("category_id", data.id)
      .is("deleted_at", null);
    if (ce) throw new Error(ce.message);
    if ((count ?? 0) > 0) {
      throw new Error(
        `该分类下仍有 ${count} 篇文章，请先将文章重新分配到其他分类再删除。`,
      );
    }
    const { error } = await context.supabase.from("blog_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
