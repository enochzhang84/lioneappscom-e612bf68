// Product Modules —— 平台产品模块注册表读写。
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ensureAdmin } from "@/lib/platform";
import type { Database } from "@/integrations/supabase/types";

// 公开读取：仅返回启用的模块。给前台产品列表用。
export const listEnabledModules = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("product_modules")
    .select("code,name,tagline,icon,category,sort_order")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// 管理员读取：全部（含 disabled）
export const adminListModules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("product_modules")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const moduleInput = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1).max(40).regex(/^[a-z0-9_-]+$/),
  name: z.string().min(1).max(80),
  tagline: z.string().max(200).nullable().optional(),
  icon: z.string().max(40).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
  enabled: z.boolean(),
  sort_order: z.number().int(),
});

export const adminUpsertModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof moduleInput>) => moduleInput.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase
      .from("product_modules")
      .upsert(data, { onConflict: "code" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; enabled: boolean }) =>
    z.object({ id: z.string().uuid(), enabled: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase
      .from("product_modules")
      .update({ enabled: data.enabled })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("product_modules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
