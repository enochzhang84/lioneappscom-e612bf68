// 重量换算 config
import type { ConverterConfig } from "./types";

const COMMON_FORMULAS = [
  "1 千克 (kg) = 1000 克 = 2 斤 = 2.2046 磅",
  "1 斤 = 0.5 千克 = 10 两 = 500 克（中国市斤）",
  "1 磅 (lb) = 0.45359237 千克 = 16 盎司",
  "1 盎司 (oz) = 28.3495 克",
  "1 克拉 (ct) = 0.2 克（宝石专用）",
];

const COMMON_FAQS = [
  { q: "1 斤等于多少克？", a: "1 中国市斤 = 500 克 = 0.5 千克 = 10 两。" },
  { q: "1 磅等于多少斤？", a: "1 磅 ≈ 0.9072 斤（1 磅 = 453.59 克 ≈ 0.9072 斤）。" },
  { q: "克拉是什么单位？", a: "克拉 (carat, ct) 是宝石重量单位，1 克拉 = 0.2 克。" },
];

function make(key: string, name: string, symbol: string, defaultValue: number, extra: {q:string;a:string}[] = []): ConverterConfig {
  return {
    key: `weight-${key}`,
    category: "weight",
    title: `${name}换算器`,
    intro: `支持 ${name}、千克、克、毫克、吨、斤、两、磅、盎司、克拉 之间快速换算。`,
    defaultUnit: key,
    defaultValue,
    examples: [
      { from: key, value: 1 },
      { from: key, value: 10 },
      { from: key, value: 100 },
    ],
    formulas: COMMON_FORMULAS,
    faqs: [...extra, ...COMMON_FAQS],
    seo: {
      title: `${name}换算器 - ${name}、千克、克、斤、磅在线换算`,
      description: `免费在线${name}换算工具，支持公制、英制及中国传统重量单位（千克、克、斤、两、磅、盎司、克拉）快速换算。`,
      keywords: `${name}换算, ${name}转千克, ${name}转斤, 重量换算, 质量换算, 单位换算`,
    },
  };
}

export const WEIGHT_CONFIGS: ConverterConfig[] = [
  make("kg",    "千克", "kg", 1),
  make("g",     "克",   "g",  100),
  make("mg",    "毫克", "mg", 1000),
  make("t",     "吨",   "t",  1),
  make("jin",   "斤",   "斤", 1, [
    { q: "1 斤肉大概是多少？", a: "1 中国市斤 = 500 克，相当于约 1.1 磅。" },
  ]),
  make("liang", "两",   "两", 10),
  make("lb",    "磅",   "lb", 1),
  make("oz",    "盎司", "oz", 1),
  make("ct",    "克拉", "ct", 1),
];
