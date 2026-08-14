// 导航可见性 —— 只控制左侧导航栏入口是否显示，不影响页面本身/路由/数据。
// 存储：platform_settings(scope='navigation', key='hidden_items')，value 为被隐藏的导航 key 数组。
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { ensureAdmin } from "@/lib/platform";

const SCOPE = "navigation";
const KEY = "hidden_items";

export const adminGetHiddenNavItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<string[]> => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("platform_settings")
      .select("value")
      .eq("scope", SCOPE)
      .eq("key", KEY)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const value = data?.value;
    return Array.isArray(value) ? (value as unknown[]).filter((v): v is string => typeof v === "string") : [];
  });

export const adminSetHiddenNavItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { items: string[] }) =>
    z.object({ items: z.array(z.string().min(1).max(200)).max(500) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("platform_settings").upsert(
      {
        scope: SCOPE,
        key: KEY,
        value: data.items as never,
        description: "左侧导航栏被隐藏的入口（页面仍可通过 URL 访问）",
        updated_by: context.userId,
      },
      { onConflict: "scope,key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
