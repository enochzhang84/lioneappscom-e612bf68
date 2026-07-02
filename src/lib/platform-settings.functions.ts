// Platform Settings —— 平台级配置的统一读写。
// 与 site_settings（内容层站点文案）区分：这里存 SMTP / 集成 / 特性开关 / 品牌等 platform 层配置。
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { ensureAdmin } from "@/lib/platform";

const scopeSchema = z.string().min(1).max(60).regex(/^[a-z0-9_-]+$/, "scope 仅小写字母数字下划线短横线");
const keySchema = z.string().min(1).max(80).regex(/^[a-z0-9_.-]+$/, "key 仅小写字母数字点下划线短横线");

export const adminListPlatformSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { scope?: string } | undefined) =>
    z.object({ scope: scopeSchema.optional() }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    let q = context.supabase
      .from("platform_settings")
      .select("*")
      .order("scope", { ascending: true })
      .order("key", { ascending: true });
    if (data.scope) q = q.eq("scope", data.scope);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpsertPlatformSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { scope: string; key: string; value: unknown; description?: string | null }) =>
    z
      .object({
        scope: scopeSchema,
        key: keySchema,
        value: z.unknown(),
        description: z.string().max(500).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("platform_settings").upsert(
      {
        scope: data.scope,
        key: data.key,
        value: data.value as never,
        description: data.description ?? null,
        updated_by: context.userId,
      },
      { onConflict: "scope,key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePlatformSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("platform_settings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
