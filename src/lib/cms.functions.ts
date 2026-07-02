// Public CMS reads. Uses the publishable (anon) key on the server — RLS allows
// SELECT on rows where is_visible = true. Does NOT require SERVICE_ROLE_KEY.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

export type ProductCard = {
  id: string;
  slug: string;
  title: string;
  tag: string | null;
  short_desc: string | null;
  hero_image_url: string | null;
  sort_order: number;
};

export type ProductFull = ProductCard & {
  long_content: Json;
};

export type CaseCard = {
  id: string;
  slug: string;
  title: string;
  tag: string | null;
  cover_image_url: string | null;
  summary: string | null;
  sort_order: number;
};

export type CaseFull = CaseCard & {
  details: Json;
};

export const listProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductCard[]> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data, error } = await supabasePublic
      .from("products")
      .select("id, slug, title, tag, short_desc, hero_image_url, sort_order")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as ProductCard[];
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }): Promise<ProductFull | null> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data: row, error } = await supabasePublic
      .from("products")
      .select("id, slug, title, tag, short_desc, hero_image_url, sort_order, long_content")
      .eq("slug", data.slug)
      .eq("is_visible", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as ProductFull | null);
  });

export const listCases = createServerFn({ method: "GET" }).handler(
  async (): Promise<CaseCard[]> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data, error } = await supabasePublic
      .from("cases")
      .select("id, slug, title, tag, cover_image_url, summary, sort_order")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as CaseCard[];
  },
);

export const getCaseBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }): Promise<CaseFull | null> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data: row, error } = await supabasePublic
      .from("cases")
      .select("id, slug, title, tag, cover_image_url, summary, sort_order, details")
      .eq("slug", data.slug)
      .eq("is_visible", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as CaseFull | null;
  });

export const getSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, Json>> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data, error } = await supabasePublic.from("site_settings").select("key, value");
    if (error) throw new Error(error.message);
    const out: Record<string, Json> = {};
    for (const row of data ?? []) out[row.key as string] = (row.value as Json) ?? {};
    return out;
  },
);

export type PageNavItem = {
  id: string;
  slug: string;
  nav_label: string;
  sort_order: number;
};

export type PageFull = {
  id: string;
  slug: string;
  title: string;
  nav_label: string;
  page_type: "content" | "tools" | "blank";
  content: Json;
  show_in_nav: boolean;
  is_visible: boolean;
  sort_order: number;
};

export const listNavPages = createServerFn({ method: "GET" }).handler(
  async (): Promise<PageNavItem[]> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data, error } = await supabasePublic
      .from("pages")
      .select("id, slug, nav_label, sort_order")
      .eq("is_visible", true)
      .eq("show_in_nav", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as PageNavItem[];
  },
);

export const getPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }): Promise<PageFull | null> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data: row, error } = await supabasePublic
      .from("pages")
      .select("id, slug, title, nav_label, page_type, content, show_in_nav, is_visible, sort_order")
      .eq("slug", data.slug)
      .eq("is_visible", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as PageFull | null;
  });

export type ToolCategory = {
  id: string;
  page_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

export type ToolItem = {
  id: string;
  page_id: string;
  category_id: string | null;
  parent_id: string | null;
  slug: string;
  title: string;
  subtitle: string | null;
  icon: string | null;
  description: string | null;
  content: string | null;
  html_content: string | null;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  button_text: string | null;
  sort_order: number;
  created_at: string;
};

export const getToolsByPageSlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }): Promise<{ page: PageFull; categories: ToolCategory[]; items: ToolItem[] } | null> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data: page, error: pageErr } = await supabasePublic
      .from("pages")
      .select("id, slug, title, nav_label, page_type, content, show_in_nav, is_visible, sort_order")
      .eq("slug", data.slug)
      .eq("is_visible", true)
      .maybeSingle();
    if (pageErr) throw new Error(pageErr.message);
    if (!page) return null;

    const [{ data: cats, error: catErr }, { data: items, error: itemErr }] = await Promise.all([
      supabasePublic
        .from("tool_categories")
        .select("id, page_id, title, description, icon, sort_order")
        .eq("page_id", (page as PageFull).id)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true }),
      supabasePublic
        .from("tool_items")
        .select("id, page_id, category_id, parent_id, slug, title, subtitle, icon, description, content, html_content, image_url, video_url, link_url, button_text, sort_order, created_at")
        .eq("page_id", (page as PageFull).id)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true }),
    ]);
    if (catErr) throw new Error(catErr.message);
    if (itemErr) throw new Error(itemErr.message);
    return {
      page: page as PageFull,
      categories: (cats ?? []) as ToolCategory[],
      items: (items ?? []) as ToolItem[],
    };
  });

export const getToolItem = createServerFn({ method: "GET" })
  .inputValidator((d: { pageSlug: string; itemSlug: string }) =>
    z.object({ pageSlug: z.string().min(1).max(100), itemSlug: z.string().min(1).max(100) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ page: PageFull; item: ToolItem; category: ToolCategory | null } | null> => {
    const { supabasePublic } = await import("@/integrations/supabase/public-server");
    const { data: page, error: pageErr } = await supabasePublic
      .from("pages")
      .select("id, slug, title, nav_label, page_type, content, show_in_nav, is_visible, sort_order")
      .eq("slug", data.pageSlug)
      .eq("is_visible", true)
      .maybeSingle();
    if (pageErr) throw new Error(pageErr.message);
    if (!page) return null;
    const { data: item, error: itemErr } = await supabasePublic
      .from("tool_items")
      .select("id, page_id, category_id, parent_id, slug, title, subtitle, icon, description, content, html_content, image_url, video_url, link_url, button_text, sort_order, created_at")
      .eq("page_id", (page as PageFull).id)
      .eq("slug", data.itemSlug)
      .eq("is_visible", true)
      .maybeSingle();
    if (itemErr) throw new Error(itemErr.message);
    if (!item) return null;
    let category: ToolCategory | null = null;
    const catId = (item as ToolItem).category_id;
    if (catId) {
      const { data: cat } = await supabasePublic
        .from("tool_categories")
        .select("id, page_id, title, description, icon, sort_order")
        .eq("id", catId)
        .maybeSingle();
      category = (cat as ToolCategory | null) ?? null;
    }
    return { page: page as PageFull, item: item as ToolItem, category };
  });


