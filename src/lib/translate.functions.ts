import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  texts: z.array(z.string().min(1)).min(1).max(12),
  target: z.enum(["en", "zh"]).default("en"),
});

export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Translation service unavailable");

    const targetLang = data.target === "en" ? "English" : "Simplified Chinese";
    const sourceLang = data.target === "en" ? "Chinese" : "English";

    const numbered = data.texts.map((t, i) => `[${i + 1}] ${t}`).join("\n");
    const systemPrompt = `You are a professional bilingual translator specializing in DMV commercial driver license (CDL) exam content. Translate ${sourceLang} to ${targetLang}. Keep technical terms accurate (air brake, tractor, trailer, PSI, etc.). Preserve numbering. Return ONLY a JSON object of shape {"translations": ["...", "..."]} with translations in original order. No commentary.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: numbered },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Translation failed: ${resp.status} ${text.slice(0, 200)}`);
    }

    const json = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { translations?: string[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Translation returned invalid JSON");
    }
    const translations = Array.isArray(parsed.translations) ? parsed.translations : [];
    if (translations.length !== data.texts.length) {
      // pad/truncate to original length to keep client mapping simple
      const out = data.texts.map((_, i) => translations[i] ?? "");
      return { translations: out };
    }
    return { translations };
  });
