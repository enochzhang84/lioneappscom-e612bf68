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

export const sbListProducts = createServerFn({ method: "POST" })
  .inputValidator((d: { categories?: string[] }) => d)
  .handler(async ({ data }) => {
    const c = publicClient();
    let q = c.from("sb_products").select("*").eq("is_visible", true).order("sort_order", { ascending: true });
    if (data.categories && data.categories.length) q = q.in("category", data.categories);
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
    if (error || !row) return { row: null as null };
    if (row.share_expires_at && new Date(row.share_expires_at).getTime() < Date.now()) {
      return { row: null };
    }
    return { row };
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

// Products
export const sbAdminListProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { category?: string } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    let q = context.supabase.from("sb_products").select("*").order("category").order("sort_order");
    if (data?.category) q = q.eq("category", data.category);
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
  model: z.string().max(120).nullable().optional(),
  description_zh: z.string().max(2000).nullable().optional(),
  description_en: z.string().max(2000).nullable().optional(),
  image_url: z.string().max(1000).nullable().optional(),
  specs: z.record(z.string(), z.any()).default({}),
  list_price: z.number().min(0),
  install_fee: z.number().min(0).default(0),
  stock_status: z.enum(["in_stock", "special_order", "out_of_stock", "discontinued"]).default("in_stock"),
  is_visible: z.boolean().default(true),
  is_sample: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  currency: z.string().default("USD"),
});

export const sbAdminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductPayload.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const payload = { ...data, price_updated_at: new Date().toISOString() };
    if (data.id) {
      const { id, ...rest } = payload;
      const { error } = await context.supabase.from("sb_products").update(rest as never).eq("id", id!);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _ignored, ...insertPayload } = payload;
    const { data: row, error } = await context.supabase.from("sb_products").insert(insertPayload as never).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const sbAdminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("sb_products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Settings
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
