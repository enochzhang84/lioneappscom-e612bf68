import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/integrations/supabase/types";

/**
 * ================================================================
 * AI Knowledge Engine
 * ================================================================
 * 平台级 AI 知识引擎，所有产品共享：
 *   - 确定性内容（题目解析、文章摘要、产品描述等）优先走缓存；
 *   - 未命中才调用 AI Gateway，并把结果落库；
 *   - 后台统一管理：查看、批量生成、重新生成、删除、统计。
 *
 * 使用方式：
 *   1. 前端：先调 getAiContent，命中直接展示（免费）。
 *   2. 未命中：走产品自身 quota，再调 generateAiContent 触发生成。
 *   3. 后台管理：admin* 系列函数。
 *
 * 支持模块（module）：dmv | church | estimate | warehouse | blog | tool | article ...
 * ================================================================
 */

// ---------- 常量 ----------
export const DMV_PROMPT_VERSION = "v1";
export const DMV_DEFAULT_MODEL = "google/gemini-2.5-flash";
export const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// ---------- 类型 ----------
const KeySchema = z.object({
  module: z.string().min(1).max(40),
  record_type: z.string().min(1).max(40),
  record_id: z.string().min(1).max(120),
  language: z.string().min(2).max(10).default("zh"),
  prompt_version: z.string().min(1).max(20).default("v1"),
});

export type AiCacheKey = z.infer<typeof KeySchema>;

export type AiCacheRow = {
  id: string;
  module: string;
  record_type: string;
  record_id: string;
  language: string;
  prompt_version: string;
  provider: string | null;
  model: string | null;
  ai_content: Json | null;
  status: string;
  error: string | null;
  tokens_in: number;
  tokens_out: number;
  updated_at: string;
  created_at: string;
};

// ---------- Supabase 客户端 ----------
function publicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase 环境变量缺失");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// ---------- 只读：查缓存 ----------
export const getAiContent = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => KeySchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("ai_cache")
      .select("id, module, record_type, record_id, language, prompt_version, provider, model, ai_content, status, error, tokens_in, tokens_out, updated_at, created_at")
      .eq("module", data.module)
      .eq("record_type", data.record_type)
      .eq("record_id", data.record_id)
      .eq("language", data.language)
      .eq("prompt_version", data.prompt_version)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { cached: false as const, row: null };
    if (row.status !== "ready" || !row.ai_content) return { cached: false as const, row: row as AiCacheRow };
    return { cached: true as const, row: row as AiCacheRow };
  });

// ---------- Prompt 构建器（按 module + record_type 分派） ----------
type PromptResult = { system: string; user: string; model: string; temperature: number };

async function buildDmvQuestionPrompt(
  recordId: string,
  language: string,
): Promise<PromptResult> {
  const sb = await adminClient();
  const { data: q, error } = await sb
    .from("quiz_questions")
    .select("id, question, option_a, option_b, option_c, option_d, correct_answer, explanation")
    .eq("id", recordId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!q) throw new Error("题目不存在");

  const manualName =
    language === "zh" ? "California Driver Handbook (加州驾驶手册)" : "California Driver Handbook";

  const opts = (["a", "b", "c", "d"] as const)
    .map((k) => {
      const t = (q as unknown as Record<string, string | null>)[`option_${k}`];
      return t ? `${k.toUpperCase()}. ${t}` : null;
    })
    .filter(Boolean)
    .join("\n");

  const system =
    "你是加州 DMV 驾照考试的资深教练与考试专家,精通 California Driver Handbook 与 California Vehicle Code (CVC)。请针对给定考题输出**结构化 JSON**,内容详实、专业、口吻友好,面向准备 DMV 考试的中文考生。**只输出 JSON,不要 Markdown 代码块。**";
  const user = `请分析以下 DMV 考题,并严格按以下 JSON 结构输出:

{
  "why_correct": "为什么正确答案(${q.correct_answer})是正确的,详细说明,不少于100字",
  "why_wrong": [ { "key": "A", "text": "选项原文", "reason": "为什么这个选项错误(2-3句)" }, ... 除正确答案外的每个选项都要有 ],
  "exam_point": "本题在 DMV 考试中考查的核心交通法规/知识点(2-4句)",
  "exam_tips": "考试技巧,包括容易混淆的地方、记忆口诀、注意事项(2-4句)",
  "official_reference": "对应的 ${manualName} 章节名 + California Vehicle Code(CVC) 具体条文号(如 CVC §22350),尽量准确",
  "related_knowledge": [ "延伸知识点1", "延伸知识点2", "延伸知识点3" ],
  "similar_questions": [ { "question": "同类型考题题干", "hint": "答题要点提示" }, { ... }, { ... } ]
}

【题目】${q.question}
【选项】
${opts}
【正确答案】${q.correct_answer}
${q.explanation ? `【已有简要解析】${q.explanation}` : ""}

请直接输出 JSON。`;

  return { system, user, model: DMV_DEFAULT_MODEL, temperature: 0.4 };
}

async function buildPrompt(
  module: string,
  recordType: string,
  recordId: string,
  language: string,
): Promise<PromptResult> {
  if (module === "dmv" && recordType === "question") {
    return buildDmvQuestionPrompt(recordId, language);
  }
  throw new Error(`AI 引擎暂不支持 module=${module} record_type=${recordType}`);
}

// ---------- 调用 AI Gateway ----------
async function callAiGateway(p: PromptResult): Promise<{
  raw: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
}> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI 服务暂不可用（缺少 API Key）");

  const resp = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: p.model,
      messages: [
        { role: "system", content: p.system },
        { role: "user", content: p.user },
      ],
      temperature: p.temperature,
    }),
  });

  if (resp.status === 429) throw new Error("AI 调用频率过高，请稍后再试。");
  if (resp.status === 402) throw new Error("AI 额度不足，请联系管理员补充额度。");
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI 调用失败 (${resp.status}): ${t.slice(0, 200)}`);
  }

  const json = (await resp.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  return {
    raw: (json.choices?.[0]?.message?.content ?? "").trim(),
    model: p.model,
    tokens_in: json.usage?.prompt_tokens ?? 0,
    tokens_out: json.usage?.completion_tokens ?? 0,
  };
}

function tryParseJson(raw: string): unknown {
  let s = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const l = s.indexOf("{");
  const r = s.lastIndexOf("}");
  if (l !== -1 && r !== -1) s = s.slice(l, r + 1);
  return JSON.parse(s);
}

// ---------- 生成并落库（公开）----------
export const generateAiContent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => KeySchema.parse(d))
  .handler(async ({ data }) => {
    const sb = await adminClient();

    // 二次检查（防并发重复生成）
    const { data: existing } = await sb
      .from("ai_cache")
      .select("id, ai_content, status")
      .eq("module", data.module)
      .eq("record_type", data.record_type)
      .eq("record_id", data.record_id)
      .eq("language", data.language)
      .eq("prompt_version", data.prompt_version)
      .maybeSingle();
    if (existing && existing.status === "ready" && existing.ai_content) {
      return { cached: true as const, ai_content: existing.ai_content, id: existing.id };
    }

    const prompt = await buildPrompt(data.module, data.record_type, data.record_id, data.language);
    try {
      const out = await callAiGateway(prompt);
      const parsed = tryParseJson(out.raw);
      const upsertPayload = {
        module: data.module,
        record_type: data.record_type,
        record_id: data.record_id,
        language: data.language,
        prompt_version: data.prompt_version,
        provider: "lovable-gateway",
        model: out.model,
        ai_content: parsed as never,
        status: "ready",
        error: null,
        tokens_in: out.tokens_in,
        tokens_out: out.tokens_out,
        updated_at: new Date().toISOString(),
      };
      const { data: row, error: upErr } = await sb
        .from("ai_cache")
        .upsert(upsertPayload, {
          onConflict: "module,record_type,record_id,language,prompt_version",
        })
        .select("id")
        .single();
      if (upErr) throw new Error(upErr.message);
      return { cached: false as const, ai_content: parsed, id: row.id };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await sb.from("ai_cache").upsert(
        {
          module: data.module,
          record_type: data.record_type,
          record_id: data.record_id,
          language: data.language,
          prompt_version: data.prompt_version,
          provider: "lovable-gateway",
          model: prompt.model,
          status: "failed",
          error: msg.slice(0, 500),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "module,record_type,record_id,language,prompt_version" },
      );
      throw e;
    }
  });

// ---------- Admin：列表 ----------
const ListSchema = z.object({
  module: z.string().optional(),
  record_type: z.string().optional(),
  status: z.enum(["ready", "failed", "generating"]).optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(500).default(100),
  offset: z.number().int().min(0).default(0),
});

async function ensureAdmin(context: { supabase: { rpc: Function }; userId: string }) {
  const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!isAdmin) throw new Error("Forbidden");
}

export const adminListAiCache = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const sb = await adminClient();
    let q = sb
      .from("ai_cache")
      .select(
        "id, module, record_type, record_id, language, prompt_version, provider, model, status, error, tokens_in, tokens_out, updated_at, created_at",
        { count: "exact" },
      )
      .order("updated_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);
    if (data.module) q = q.eq("module", data.module);
    if (data.record_type) q = q.eq("record_type", data.record_type);
    if (data.status) q = q.eq("status", data.status);
    if (data.search) q = q.ilike("record_id", `%${data.search}%`);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as AiCacheRow[], total: count ?? 0 };
  });

// ---------- Admin：统计 ----------
export const adminAiCacheStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const sb = await adminClient();
    const { data: rows, error } = await sb
      .from("ai_cache")
      .select("module, record_type, status, tokens_in, tokens_out");
    if (error) throw new Error(error.message);
    type Bucket = { module: string; record_type: string; ready: number; failed: number; total: number; tokens_in: number; tokens_out: number };
    const map = new Map<string, Bucket>();
    let readyAll = 0, failedAll = 0, tokIn = 0, tokOut = 0;
    for (const r of rows ?? []) {
      const key = `${r.module}::${r.record_type}`;
      const b = map.get(key) ?? { module: r.module, record_type: r.record_type, ready: 0, failed: 0, total: 0, tokens_in: 0, tokens_out: 0 };
      b.total += 1;
      if (r.status === "ready") { b.ready += 1; readyAll += 1; }
      if (r.status === "failed") { b.failed += 1; failedAll += 1; }
      b.tokens_in += r.tokens_in ?? 0;
      b.tokens_out += r.tokens_out ?? 0;
      tokIn += r.tokens_in ?? 0;
      tokOut += r.tokens_out ?? 0;
      map.set(key, b);
    }
    return {
      total: (rows ?? []).length,
      ready: readyAll,
      failed: failedAll,
      tokens_in: tokIn,
      tokens_out: tokOut,
      buckets: Array.from(map.values()).sort((a, b) => b.total - a.total),
    };
  });

// ---------- Admin：删除 / 重新生成 ----------
export const adminDeleteAiCache = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const sb = await adminClient();
    const { error } = await sb.from("ai_cache").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRegenerateAiCache = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const sb = await adminClient();
    const { data: row, error } = await sb
      .from("ai_cache")
      .select("module, record_type, record_id, language, prompt_version")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("缓存不存在");
    // 删除后重跑
    await sb.from("ai_cache").delete().eq("id", data.id);
    const prompt = await buildPrompt(row.module, row.record_type, row.record_id, row.language);
    const out = await callAiGateway(prompt);
    const parsed = tryParseJson(out.raw);
    const { data: created, error: upErr } = await sb
      .from("ai_cache")
      .upsert(
        {
          module: row.module,
          record_type: row.record_type,
          record_id: row.record_id,
          language: row.language,
          prompt_version: row.prompt_version,
          provider: "lovable-gateway",
          model: out.model,
          ai_content: parsed as never,
          status: "ready",
          error: null,
          tokens_in: out.tokens_in,
          tokens_out: out.tokens_out,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "module,record_type,record_id,language,prompt_version" },
      )
      .select("id")
      .single();
    if (upErr) throw new Error(upErr.message);
    return { ok: true, id: created.id };
  });

// ---------- Admin：批量生成 DMV 题目解析 ----------
const BulkDmvSchema = z.object({
  kind: z.enum(["written", "signs", "all"]).default("all"),
  language: z.string().default("zh"),
  prompt_version: z.string().default(DMV_PROMPT_VERSION),
  limit: z.number().int().min(1).max(500).default(20),
  onlyMissing: z.boolean().default(true),
});

export const adminBulkGenerateDmv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BulkDmvSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const sb = await adminClient();

    // 取题目 ID 列表（复用 quiz_questions）
    let qq = sb.from("quiz_questions").select("id, question_type").limit(2000);
    if (data.kind === "written") qq = qq.eq("question_type", "text");
    if (data.kind === "signs") qq = qq.eq("question_type", "sign");
    const { data: qs, error: qErr } = await qq;
    if (qErr) throw new Error(qErr.message);
    const allIds = (qs ?? []).map((q) => q.id as string);

    // 排除已缓存
    let pending = allIds;
    if (data.onlyMissing && allIds.length) {
      const { data: cached } = await sb
        .from("ai_cache")
        .select("record_id")
        .eq("module", "dmv")
        .eq("record_type", "question")
        .eq("language", data.language)
        .eq("prompt_version", data.prompt_version)
        .eq("status", "ready")
        .in("record_id", allIds);
      const cachedSet = new Set((cached ?? []).map((r) => r.record_id as string));
      pending = allIds.filter((id) => !cachedSet.has(id));
    }

    const batch = pending.slice(0, data.limit);
    let ok = 0, fail = 0;
    const errors: { id: string; error: string }[] = [];

    for (const id of batch) {
      try {
        const prompt = await buildDmvQuestionPrompt(id, data.language);
        const out = await callAiGateway(prompt);
        const parsed = tryParseJson(out.raw);
        const { error: upErr } = await sb.from("ai_cache").upsert(
          {
            module: "dmv",
            record_type: "question",
            record_id: id,
            language: data.language,
            prompt_version: data.prompt_version,
            provider: "lovable-gateway",
            model: out.model,
            ai_content: parsed as never,
            status: "ready",
            error: null,
            tokens_in: out.tokens_in,
            tokens_out: out.tokens_out,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "module,record_type,record_id,language,prompt_version" },
        );
        if (upErr) throw new Error(upErr.message);
        ok += 1;
      } catch (e) {
        fail += 1;
        const msg = e instanceof Error ? e.message : String(e);
        errors.push({ id, error: msg.slice(0, 200) });
        await sb.from("ai_cache").upsert(
          {
            module: "dmv",
            record_type: "question",
            record_id: id,
            language: data.language,
            prompt_version: data.prompt_version,
            provider: "lovable-gateway",
            model: DMV_DEFAULT_MODEL,
            status: "failed",
            error: msg.slice(0, 500),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "module,record_type,record_id,language,prompt_version" },
        );
      }
    }

    return {
      totalQuestions: allIds.length,
      pendingBefore: pending.length,
      processed: batch.length,
      succeeded: ok,
      failed: fail,
      remaining: Math.max(0, pending.length - batch.length),
      errors,
    };
  });
