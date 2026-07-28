// 服务端：调用 Lovable AI Gateway 的视觉模型解析海报文字
export type PosterField = {
  kind: string;
  text: string;
  confidence?: number;
};

const SYSTEM = `你是活动海报文字识别与分类专家。
从图片中提取所有可读文字，并按语义分类。只输出 JSON，不要 markdown 代码块。
格式：{"fields":[{"kind":"title","text":"..."}],"palette":["#RRGGBB"],"lang":"zh"}
kind 只能取以下之一：
title(主标题) subtitle(副标题) speaker(讲员/嘉宾) role(职称) date(日期) time(时间)
location(地点) address(详细地址) verse(经文/引言) verseRef(经文出处) theme(主题词)
organizer(主办方) contact(联系方式) note(备注) tag(标签)
规则：
- 忠实原文，不翻译、不改写、不补充没有的内容。
- 大标题拆分为 title 与 subtitle；讲员姓名与职称分开。
- palette 给出海报 2-4 个主色（十六进制）。
- 无法识别时返回 {"fields":[]}。`;

export async function extractPosterTextFromImage(apiKey: string, imageUrl: string, lang: string) {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: lang === "en" ? "Extract poster text (English)." : lang === "zh" ? "提取海报文字（中文）。" : "提取海报文字。" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });

  if (resp.status === 429) throw new Error("AI 调用频率过高，请稍后再试。");
  if (resp.status === 402) throw new Error("AI 额度不足，请稍后再试。");
  if (!resp.ok) throw new Error(`海报识别失败 (${resp.status})`);

  const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = (json.choices?.[0]?.message?.content ?? "").trim();
  const body = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let parsed: { fields?: PosterField[]; palette?: string[]; lang?: string } = {};
  try {
    parsed = JSON.parse(body);
  } catch {
    const m = body.match(/\{[\s\S]*\}/);
    if (m) { try { parsed = JSON.parse(m[0]); } catch { /* ignore */ } }
  }
  const fields = (parsed.fields ?? [])
    .filter((f) => f && typeof f.text === "string" && f.text.trim())
    .map((f) => ({ kind: String(f.kind || "note"), text: f.text.trim().slice(0, 200) }))
    .slice(0, 24);
  const palette = (parsed.palette ?? []).filter((c) => /^#[0-9a-fA-F]{6}$/.test(c)).slice(0, 4);
  return { fields, palette, lang: parsed.lang ?? lang };
}
