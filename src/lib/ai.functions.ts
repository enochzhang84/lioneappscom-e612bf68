import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Lione Apps AI Gateway
 * 统一入口：所有 AI 工具通过 runAiTool 调用 Lovable AI Gateway。
 * 未来切换 Provider / 模型，只需修改此文件。
 */

const InputSchema = z.object({
  toolKey: z.string().min(1).max(64),
  system: z.string().min(1).max(4000),
  user: z.string().min(1).max(24000),
  temperature: z.number().min(0).max(2).optional(),
  model: z.string().max(80).optional(),
});

const DEFAULT_MODEL = "google/gemini-2.5-flash";

export const runAiTool = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI 服务暂不可用（缺少 API Key）");

    const model = data.model?.trim() || DEFAULT_MODEL;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: data.system },
          { role: "user", content: data.user },
        ],
        temperature: data.temperature ?? 0.7,
      }),
    });

    if (resp.status === 429) throw new Error("AI 调用频率过高，请稍后再试。");
    if (resp.status === 402) throw new Error("AI 额度不足，请稍后再试或联系管理员补充额度。");
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`AI 调用失败 (${resp.status}): ${text.slice(0, 200)}`);
    }

    const json = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return {
      toolKey: data.toolKey,
      output: content.trim(),
      usage: json.usage ?? null,
      model,
    };
  });
