// Platform Core — 权限与共享工具。所有 Admin 后端函数请复用这里的 helper。
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * 校验当前用户是否具有 admin 角色。用于所有 admin-scoped server functions。
 * 用法：`.middleware([requireSupabaseAuth]).handler(async ({ context }) => { await ensureAdmin(context); ... })`
 */
export async function ensureAdmin(context: {
  supabase: SupabaseClient<Database>;
  userId: string;
}): Promise<void> {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}
