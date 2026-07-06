import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * AI 用量配额控制
 * 为每个 AI 功能提供按天免费额度控制，防止滥用并保护 Lovable AI 额度。
 * 未登录用户由客户端 localStorage 临时限制；登录用户由数据库持久化。
 */

export const DEFAULT_FREE_QUOTA = 3;

export type QuotaResult = {
  featureKey: string;
  freeQuota: number;
  usedToday: number;
  remaining: number;
};

const featureKeySchema = z.string().min(1).max(80);

function todayUtc(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 查询今日已用量（登录用户） */
export const getAiQuota = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { featureKey: string }) =>
    z.object({ featureKey: featureKeySchema }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = (await context.supabase
      .from("ai_usage_daily")
      .select("count")
      .eq("user_id", context.userId)
      .eq("feature_key", data.featureKey)
      .eq("usage_date", todayUtc())
      .maybeSingle()) as {
      data: { count: number } | null;
      error: { message: string } | null;
    };

    if (error) throw new Error(error.message);
    const usedToday = row?.count ?? 0;
    return {
      featureKey: data.featureKey,
      freeQuota: DEFAULT_FREE_QUOTA,
      usedToday,
      remaining: Math.max(0, DEFAULT_FREE_QUOTA - usedToday),
    } as QuotaResult;
  });

/** 消耗一次额度并记录审计日志（登录用户） */
export const consumeAiQuota = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { featureKey: string; questionId?: string | null }) =>
    z
      .object({
        featureKey: featureKeySchema,
        questionId: z.string().max(120).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const today = todayUtc();

    // 先查询当前用量
    const { data: existing, error: findError } = (await context.supabase
      .from("ai_usage_daily")
      .select("id,count")
      .eq("user_id", context.userId)
      .eq("feature_key", data.featureKey)
      .eq("usage_date", today)
      .maybeSingle()) as {
      data: { id: string; count: number } | null;
      error: { message: string } | null;
    };
    if (findError) throw new Error(findError.message);

    const currentCount = existing?.count ?? 0;
    if (currentCount >= DEFAULT_FREE_QUOTA) {
      return {
        featureKey: data.featureKey,
        freeQuota: DEFAULT_FREE_QUOTA,
        usedToday: currentCount,
        remaining: 0,
      } as QuotaResult;
    }

    // 更新或插入聚合记录
    if (existing) {
      const { error: updErr } = await context.supabase
        .from("ai_usage_daily")
        .update({ count: existing.count + 1, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (updErr) throw new Error(updErr.message);
    } else {
      const { error: insErr } = await context.supabase.from("ai_usage_daily").insert({
        user_id: context.userId,
        feature_key: data.featureKey,
        usage_date: today,
        count: 1,
      });
      if (insErr) throw new Error(insErr.message);
    }

    // 记录审计日志
    const { error: logErr } = await context.supabase.from("ai_usage_logs").insert({
      user_id: context.userId,
      feature_key: data.featureKey,
      question_id: data.questionId ?? null,
      metadata: {},
    });
    if (logErr) console.error("ai_usage_logs insert failed", logErr.message);

    const nextCount = currentCount + 1;
    return {
      featureKey: data.featureKey,
      freeQuota: DEFAULT_FREE_QUOTA,
      usedToday: nextCount,
      remaining: Math.max(0, DEFAULT_FREE_QUOTA - nextCount),
    } as QuotaResult;
  });
