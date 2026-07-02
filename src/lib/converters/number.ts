// 数字缩放换算 config（万、亿、million、billion 互换）
import type { ConverterConfig } from "./types";

const FORMULAS = [
  "1 万 = 10,000 = 10⁴",
  "1 亿 = 10⁸ = 1 万万",
  "1 兆（中式）= 万亿 = 10¹²",
  "1 million (百万) = 10⁶ = 100 万",
  "1 billion (十亿) = 10⁹ = 10 亿",
  "1 trillion (万亿) = 10¹² = 1 兆 = 10000 亿",
];

const FAQS = [
  { q: "1 亿等于多少 million？", a: "1 亿 = 10⁸ = 100 million（一亿等于一百个百万）。" },
  { q: "1 billion 是十亿还是万亿？", a: "现代英文（美式与英式均已统一）1 billion = 10⁹ = 十亿。旧英式的「long scale」已不常用。" },
  { q: "为什么中文习惯用「万」和「亿」，英文用 K/M/B？", a: "中文以万（10⁴）为分组，英文以千（10³）为分组，因此换算时数量级会错位，本工具帮你自动转换。" },
];

function make(key: string, name: string, defaultValue: number): ConverterConfig {
  return {
    key: `number-${key}`,
    category: "number",
    title: `${name}换算器`,
    intro: `支持 ${name}、个、万、亿、兆、千 (K)、百万 (M)、十亿 (B)、万亿 (T) 之间快速换算，中英文数字单位互转。`,
    defaultUnit: key,
    defaultValue,
    examples: [
      { from: key, value: 1 },
      { from: key, value: 10 },
      { from: key, value: 100 },
    ],
    formulas: FORMULAS,
    faqs: FAQS,
    seo: {
      title: `${name}换算器 - 万、亿、million、billion 中英文数字换算`,
      description: `免费在线数字单位换算工具，快速在万、亿、兆与 million、billion、trillion 之间互转，适合财经、报表、翻译使用。`,
      keywords: `${name}换算, 万转 million, 亿转 billion, 数字换算, 中英文数字, million 是多少万`,
    },
  };
}

export const NUMBER_CONFIGS: ConverterConfig[] = [
  make("wan",      "万",       1),
  make("yi",       "亿",       1),
  make("zhao",     "兆",       1),
  make("million",  "million",  1),
  make("billion",  "billion",  1),
  make("trillion", "trillion", 1),
];
