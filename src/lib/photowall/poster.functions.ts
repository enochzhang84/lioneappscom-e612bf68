import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { extractPosterTextFromImage } from "./poster.server";

const InputSchema = z.object({
  /** data URL 或 https 图片地址（海报图） */
  imageUrl: z.string().min(16).max(12_000_000),
  lang: z.enum(["zh", "en", "auto"]).optional(),
});

/** 从海报图片中智能提取主题文字（标题/副标题/讲员/时间/地点/经文等） */
export const extractPosterText = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI 服务暂不可用（缺少 API Key）");
    return extractPosterTextFromImage(apiKey, data.imageUrl, data.lang ?? "auto");
  });
