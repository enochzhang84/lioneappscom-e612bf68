import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Json } from "@/integrations/supabase/types";
import { ensureAdmin } from "./platform";

type PluginInput = {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  category?: string | null;
  icon?: string | null;
  version?: string;
  component_key: string;
  default_config?: Record<string, unknown>;
  enabled?: boolean;
  sort_order?: number;
};

export const listEnabledPlugins = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("tool_plugins")
      .select("id, code, name, description, category, icon, component_key, default_config, sort_order")
      .eq("enabled", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
);

export const adminListPlugins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("tool_plugins")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpsertPlugin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PluginInput) => data)
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const payload = {
      code: data.code.trim(),
      name: data.name.trim(),
      description: data.description ?? null,
      category: data.category ?? null,
      icon: data.icon ?? null,
      version: data.version ?? "1.0.0",
      component_key: data.component_key.trim(),
      default_config: (data.default_config ?? {}) as Json,
      enabled: data.enabled ?? true,
      sort_order: data.sort_order ?? 0,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("tool_plugins")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: inserted, error } = await context.supabase
      .from("tool_plugins")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const adminTogglePlugin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; enabled: boolean }) => data)
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase
      .from("tool_plugins")
      .update({ enabled: data.enabled })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePlugin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase
      .from("tool_plugins")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
