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

