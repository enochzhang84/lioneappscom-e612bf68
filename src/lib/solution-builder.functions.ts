// Solution Builder — server functions
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ensureAdmin } from "@/lib/platform";
import type { SbProduct, SbSettings, SbSolutionRow, LineItem, CompatWarning, ToolKey } from "@/lib/solution-builder/types";

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
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

const LineItemSchema = z.object({
  id: z.string(),
  kind: z.enum(["product", "service"]),
  category: z.string(),
  name_zh: z.string(),
  name_en: z.string(),
  brand: z.string().optional(),
  model: z.string().optional(),
  qty: z.number(),
  unit_price: z.number(),
  install_fee: z.number().optional(),
  note: z.string().optional(),
});

const CompatSchema = z.object({
  level: z.enum(["ok", "notice", "error"]),
  message_zh: z.string(),
  message_en: z.string(),
});

const SolutionPayload = z.object({
  id: z.string().uuid().optional().nullable(),
  solution_type: z.enum(["pc", "nas", "home-network", "full-solution"]),
  title: z.string().min(1).max(200),
  language: z.enum(["zh", "en"]).default("zh"),
  currency: z.string().default("USD"),
  customer_name: z.string().max(200).optional().nullable(),
  customer_email: z.string().email().max(200).optional().nullable().or(z.literal("")),
  customer_phone: z.string().max(60).optional().nullable(),
  organization_name: z.string().max(200).optional().nullable(),
  customer_city: z.string().max(200).optional().nullable(),
  customer_budget: z.string().max(200).optional().nullable(),
  customer_timeline: z.string().max(200).optional().nullable(),
  customer_notes: z.string().max(4000).optional().nullable(),
  subtotal: z.number(),
  service_fee: z.number(),
  tax_rate: z.number(),
  tax_amount: z.number(),
  discount: z.number(),
  one_time_total: z.number(),
  monthly_total: z.number(),
  annual_total: z.number(),
  items: z.array(LineItemSchema).max(200),
  config: z.record(z.string(), z.any()),
  computed: z.record(z.string(), z.any()),
  compat_warnings: z.array(CompatSchema).max(60),
  source: z.enum(["builder", "submission"]).default("builder"),
});

type NormalizedSolution = z.infer<typeof SolutionPayload>;

// ======== Public: list products, settings ========

// Public product columns — MUST NOT include cost_price or internal_notes
const PUBLIC_PRODUCT_COLS =
  "id, category, category_id, subcategory, slug, name_zh, name_en, brand, brand_id, model, description_zh, description_en, short_description_zh, short_description_en, image_url, gallery_urls, manufacturer_url, specification_pdf_url, usage_tags, builder_types, specs, performance_scores, series, generation, codename, architecture, launch_year, launch_date, data_completeness, list_price, install_fee, monthly_fee, annual_fee, stock_status, stock_quantity, lead_time_days, warranty_months, is_visible, is_sample, sort_order, currency, price_updated_at, product_code, sku";

export const sbListProducts = createServerFn({ method: "POST" })
  .inputValidator((d: { categories?: string[]; builder_type?: string }) => d)
  .handler(async ({ data }) => {
    const c = publicClient();
    let q = c.from("sb_products").select(PUBLIC_PRODUCT_COLS).eq("is_visible", true).is("deleted_at", null).order("sort_order", { ascending: true });
    if (data.categories && data.categories.length) q = q.in("category", data.categories);
    if (data.builder_type) q = q.contains("builder_types", [data.builder_type]);
    const { data: rows, error } = await q;
    if (error) return { products: [] as SbProduct[], error: error.message };
    return { products: (rows ?? []) as unknown as SbProduct[] };
  });


export const sbGetSettings = createServerFn({ method: "GET" }).handler(async () => {
  const c = publicClient();
  const { data, error } = await c.from("sb_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) {
    return {
      currency: "USD",
      tax_rate: 0,
      default_service_fee: 0,
      margin_rate: 0,
      discount_rate: 0,
      proposal_validity_days: 30,
      contact_email: "hello@lioneapps.com",
      contact_phone: null,
      disclaimer_zh: "本方案为初步配置与预算参考，最终设备兼容性、库存、价格和服务范围需在正式确认后确定。",
      disclaimer_en: "This document is a preliminary configuration and estimate. Final compatibility, availability, pricing and service scope are subject to confirmation.",
    } as SbSettings;
  }
  return {
    currency: data.currency,
    tax_rate: Number(data.tax_rate) || 0,
    default_service_fee: Number(data.default_service_fee) || 0,
    margin_rate: Number(data.margin_rate) || 0,
    discount_rate: Number(data.discount_rate) || 0,
    proposal_validity_days: data.proposal_validity_days,
    contact_email: data.contact_email,
    contact_phone: data.contact_phone,
    disclaimer_zh: data.disclaimer_zh,
    disclaimer_en: data.disclaimer_en,
  } as SbSettings;
});

// ======== Anon or authenticated: save/submit a solution ========
// Uses publishable client + RLS: anon may INSERT with created_by NULL;
// authenticated users are handled via a separate authenticated fn below.

export const sbSubmitPublic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SolutionPayload.parse(d))
  .handler(async ({ data }) => {
    const c = publicClient();
    const { id: _ignore, ...payload } = data;
    const { data: row, error } = await c
      .from("sb_solutions")
      .insert({ ...payload, status: "submitted", source: "submission", created_by: null })
      .select("id, solution_number")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, solution_number: row.solution_number };
  });

// ======== Authenticated: save/list/get my solutions ========

export const sbSaveMine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SolutionPayload.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload = { ...data, created_by: userId };
    if (data.id) {
      const { id, ...rest } = payload;
      const { data: row, error } = await supabase
        .from("sb_solutions")
        .update(rest as never)
        .eq("id", id!)
        .select("id, solution_number")
        .single();
      if (error) throw new Error(error.message);
      return { id: row.id, solution_number: row.solution_number };
    }
    const { id: _ignore, ...insertPayload } = payload;
    const { data: row, error } = await supabase
      .from("sb_solutions")
      .insert(insertPayload as never)
      .select("id, solution_number")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, solution_number: row.solution_number };
  });

export const sbListMine = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("sb_solutions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { rows: (data ?? []) as unknown as SbSolutionRow[] };
  });

export const sbGetMine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("sb_solutions").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return { row: row as unknown as SbSolutionRow | null };
  });

export const sbShareMine = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; days?: number | null }) =>
    z.object({ id: z.string().uuid(), days: z.number().int().min(1).max(365).nullable().optional() }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const token = crypto.randomUUID().replace(/-/g, "");
    const expires = data.days ? new Date(Date.now() + data.days * 86400_000).toISOString() : null;
    const { error } = await context.supabase
      .from("sb_solutions")
      .update({ share_token: token, share_expires_at: expires })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { token, expires };
  });

// ======== Public: view a shared solution by token (via server, no PII leakage) ========
export const sbGetShared = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => z.object({ token: z.string().min(16).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("sb_solutions")
      .select("solution_number, solution_type, title, language, currency, items, config, computed, compat_warnings, subtotal, service_fee, tax_rate, tax_amount, discount, one_time_total, monthly_total, annual_total, share_expires_at, created_at, organization_name, customer_name")
      .eq("share_token", data.token)
      .maybeSingle();
    if (error || !row) return { row: null, status: "not_found" as const };
    if (row.share_expires_at && new Date(row.share_expires_at).getTime() < Date.now()) {
      return { row: null, status: "expired" as const, expires_at: row.share_expires_at };
    }
    return { row, status: "ok" as const };
  });


// ======== Admin ========

export const sbAdminListSolutions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: string; search?: string }) => d)
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    let q = context.supabase.from("sb_solutions").select("*").order("created_at", { ascending: false }).limit(200);
    if (data?.status) q = q.eq("status", data.status);
    if (data?.search) q = q.or(`title.ilike.%${data.search}%,customer_name.ilike.%${data.search}%,solution_number.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as unknown as SbSolutionRow[] };
  });

export const sbAdminGetSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { data: row, error } = await context.supabase.from("sb_solutions").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return { row: row as unknown as SbSolutionRow | null };
  });

export const sbAdminUpdateSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; patch: Partial<SbSolutionRow> }) => d)
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const allowed = ["status", "admin_notes", "assigned_to", "title", "customer_name", "customer_email", "customer_phone", "organization_name", "customer_city", "customer_notes"];
    const patch: Record<string, any> = {};
    for (const k of allowed) if (k in data.patch) patch[k] = (data.patch as Record<string, any>)[k];
    const { error } = await context.supabase.from("sb_solutions").update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sbAdminDeleteSolution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("sb_solutions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Admin: manage share link (regenerate / revoke / update expiry only)
export const sbAdminUpdateShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; action: "regenerate" | "revoke" | "set_expiry"; days?: number | null }) =>
    z.object({
      id: z.string().uuid(),
      action: z.enum(["regenerate", "revoke", "set_expiry"]),
      days: z.number().int().min(1).max(3650).nullable().optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const patch: { share_token?: string | null; share_expires_at?: string | null } = {};
    if (data.action === "revoke") {
      patch.share_token = null;
      patch.share_expires_at = null;
    } else if (data.action === "regenerate") {
      patch.share_token = crypto.randomUUID().replace(/-/g, "");
      patch.share_expires_at = data.days ? new Date(Date.now() + data.days * 86400_000).toISOString() : null;
    } else {
      patch.share_expires_at = data.days ? new Date(Date.now() + data.days * 86400_000).toISOString() : null;
    }
    const { data: row, error } = await context.supabase
      .from("sb_solutions")
      .update(patch as never)
      .eq("id", data.id)
      .select("share_token, share_expires_at")
      .single();
    if (error) throw new Error(error.message);
    return { token: row.share_token, expires: row.share_expires_at };
  });

// Products
export const sbAdminListProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { category?: string; builder_type?: string; search?: string; brand_id?: string; include_deleted?: boolean; generation?: string; socket?: string; ddr?: string; completeness?: string } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    let q = context.supabase.from("sb_products").select("*").order("category").order("sort_order");
    if (!data?.include_deleted) q = q.is("deleted_at", null);
    if (data?.category) q = q.eq("category", data.category);
    if (data?.brand_id) q = q.eq("brand_id", data.brand_id);
    if (data?.builder_type) q = q.contains("builder_types", [data.builder_type]);
    if (data?.generation) q = q.eq("generation", data.generation);
    if (data?.completeness) q = q.eq("data_completeness", data.completeness);
    if (data?.socket) q = q.eq("specs->>socket", data.socket);
    if (data?.ddr) q = q.eq("specs->>memory_type", data.ddr);
    if (data?.search) q = q.or(`name_zh.ilike.%${data.search}%,name_en.ilike.%${data.search}%,brand.ilike.%${data.search}%,model.ilike.%${data.search}%,product_code.ilike.%${data.search}%,sku.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as unknown as SbProduct[] };
  });


const ProductPayload = z.object({
  id: z.string().uuid().optional().nullable(),
  category: z.string().min(1).max(60),
  subcategory: z.string().max(60).nullable().optional(),
  slug: z.string().min(1).max(120),
  name_zh: z.string().min(1).max(200),
  name_en: z.string().min(1).max(200),
  brand: z.string().max(120).nullable().optional(),
  brand_id: z.string().uuid().nullable().optional(),
  model: z.string().max(120).nullable().optional(),
  product_code: z.string().max(120).nullable().optional(),
  sku: z.string().max(120).nullable().optional(),
  description_zh: z.string().max(2000).nullable().optional(),
  description_en: z.string().max(2000).nullable().optional(),
  short_description_zh: z.string().max(500).nullable().optional(),
  short_description_en: z.string().max(500).nullable().optional(),
  image_url: z.string().max(1000).nullable().optional(),
  manufacturer_url: z.string().max(1000).nullable().optional(),
  builder_types: z.array(z.string().max(30)).max(10).default([]),
  usage_tags: z.array(z.string().max(60)).max(30).default([]),
  specs: z.record(z.string(), z.any()).default({}),
  list_price: z.number().min(0),
  cost_price: z.number().min(0).default(0),
  install_fee: z.number().min(0).default(0),
  monthly_fee: z.number().min(0).default(0),
  annual_fee: z.number().min(0).default(0),
  stock_status: z.enum(["in_stock", "special_order", "out_of_stock", "discontinued"]).default("in_stock"),
  stock_quantity: z.number().int().nullable().optional(),
  lead_time_days: z.number().int().min(0).nullable().optional(),
  warranty_months: z.number().int().min(0).nullable().optional(),
  is_visible: z.boolean().default(true),
  is_sample: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  currency: z.string().default("USD"),
  // M1 extended fields
  category_id: z.string().uuid().nullable().optional(),
  series: z.string().max(120).nullable().optional(),
  generation: z.string().max(60).nullable().optional(),
  codename: z.string().max(120).nullable().optional(),
  architecture: z.string().max(120).nullable().optional(),
  launch_year: z.number().int().min(1990).max(2100).nullable().optional(),
  launch_date: z.string().max(40).nullable().optional(),
  gallery_urls: z.array(z.string().max(1000)).max(20).nullable().optional(),
  specification_pdf_url: z.string().max(1000).nullable().optional(),
  performance_scores: z.record(z.string(), z.number()).nullable().optional(),
  data_completeness: z.enum(["stub", "partial", "complete"]).nullable().optional(),
  internal_notes: z.string().max(4000).nullable().optional(),
});

export const sbAdminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductPayload.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const payload = { ...data };
    if (data.id) {
      const { id, ...rest } = payload;
      const { error } = await context.supabase.from("sb_products").update(rest as never).eq("id", id!);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _ignored, ...insertPayload } = payload;
    const { data: row, error } = await context.supabase.from("sb_products").insert({ ...insertPayload, price_updated_at: new Date().toISOString() } as never).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const sbAdminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; hard?: boolean }) => z.object({ id: z.string().uuid(), hard: z.boolean().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    if (data.hard) {
      const { error } = await context.supabase.from("sb_products").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("sb_products").update({ deleted_at: new Date().toISOString(), is_visible: false } as never).eq("id", data.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const sbAdminRestoreProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("sb_products").update({ deleted_at: null } as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ======== Brands ========
const BrandPayload = z.object({
  id: z.string().uuid().optional().nullable(),
  brand_code: z.string().min(1).max(60).regex(/^[a-z0-9_-]+$/, "小写字母、数字、_、-"),
  name: z.string().min(1).max(200),
  name_zh: z.string().max(200).nullable().optional(),
  name_en: z.string().max(200).nullable().optional(),
  logo_url: z.string().max(1000).nullable().optional(),
  website_url: z.string().max(1000).nullable().optional(),
  country: z.string().max(60).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const sbAdminListBrands = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase.from("solution_product_brands").select("*").order("sort_order").order("name");
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const sbAdminSaveBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BrandPayload.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await context.supabase.from("solution_product_brands").update(rest as never).eq("id", id!);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _i, ...ins } = data;
    const { data: row, error } = await context.supabase.from("solution_product_brands").insert(ins as never).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const sbAdminDeleteBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("solution_product_brands").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ======== Categories ========
const CategoryPayload = z.object({
  id: z.string().uuid().optional().nullable(),
  builder_type: z.enum(["pc", "nas", "home-network", "shared", "service"]),
  code: z.string().min(1).max(60).regex(/^[a-z0-9_-]+$/, "小写字母、数字、_、-"),
  name_zh: z.string().min(1).max(120),
  name_en: z.string().min(1).max(120),
  parent_code: z.string().max(60).nullable().optional(),
  icon: z.string().max(60).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const sbAdminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase.from("solution_product_categories").select("*").order("builder_type").order("sort_order");
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const sbAdminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CategoryPayload.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await context.supabase.from("solution_product_categories").update(rest as never).eq("id", id!);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _i, ...ins } = data;
    const { data: row, error } = await context.supabase.from("solution_product_categories").insert(ins as never).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const sbAdminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("solution_product_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ======== Price history ========
export const sbAdminPriceHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { product_id: string }) => z.object({ product_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("solution_price_history").select("*").eq("product_id", data.product_id)
      .order("changed_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

// ======== Bulk import (CSV / JSON rows) ========
const BulkRow = ProductPayload.omit({ id: true });
export const sbAdminBulkUpsertProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { rows: unknown[] }) => z.object({ rows: z.array(BulkRow).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error, count } = await context.supabase
      .from("sb_products")
      .upsert(data.rows.map((r) => ({ ...r, price_updated_at: new Date().toISOString() })) as never, { onConflict: "slug", count: "exact" });
    if (error) throw new Error(error.message);
    return { count: count ?? data.rows.length };
  });

const SettingsPayload = z.object({
  currency: z.string().min(1).max(10),
  tax_rate: z.number().min(0).max(1),
  default_service_fee: z.number().min(0),
  margin_rate: z.number().min(0).max(1),
  discount_rate: z.number().min(0).max(1),
  proposal_validity_days: z.number().int().min(1).max(365),
  contact_email: z.string().email(),
  contact_phone: z.string().max(60).nullable().optional(),
  disclaimer_zh: z.string().max(2000),
  disclaimer_en: z.string().max(2000),
});
export const sbAdminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SettingsPayload.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("sb_settings").update(data as never).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Placeholder helper for future compat checks (unused but exported for typing)
export type { LineItem, CompatWarning, ToolKey };
