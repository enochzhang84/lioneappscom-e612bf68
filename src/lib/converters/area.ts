// 面积换算 config
import type { ConverterConfig } from "./types";

const COMMON_FORMULAS = [
  "1 平方米 (m²) = 10,000 平方厘米 = 10.7639 平方英尺",
  "1 公顷 (ha) = 10,000 平方米 = 15 亩",
  "1 亩 = 666.6667 平方米 ≈ 0.1647 英亩",
  "1 英亩 (ac) = 4046.856 平方米 ≈ 6.0702 亩",
  "1 平方公里 (km²) = 100 公顷 = 1,000,000 平方米",
];

const COMMON_FAQS = [
  { q: "1 亩等于多少平方米？", a: "中国市亩 1 亩 = 666.6667 平方米 ≈ 0.1647 英亩。" },
  { q: "1 英亩等于多少亩？", a: "1 英亩 = 4046.856 平方米 ≈ 6.0702 亩。" },
  { q: "结果保留几位小数？", a: "默认最多显示 6 位有效数字，可一键复制全部单位结果。" },
];

function make(key: string, name: string, symbol: string, defaultValue: number, extra: {q:string;a:string}[] = []): ConverterConfig {
  return {
    key: `area-${key}`,
    category: "area",
    title: `${name}换算器`,
    intro: `支持 ${name}、平方米、平方厘米、平方公里、公顷、亩、平方英尺、平方码、英亩、平方英里 之间快速换算。`,
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
      title: `${name}换算器 - ${name}、平方米、公顷、亩、英亩在线换算`,
      description: `免费在线${name}换算工具，支持公制与英制面积单位（平方米、公顷、亩、英亩、平方英尺等）之间快速换算。`,
      keywords: `${name}换算, ${name}转平方米, ${name}转亩, 面积换算, 单位换算`,
    },
  };
}

export const AREA_CONFIGS: ConverterConfig[] = [
  make("m2",  "平方米",   "m²", 1),
  make("cm2", "平方厘米", "cm²", 100),
  make("km2", "平方公里", "km²", 1),
  make("ha",  "公顷",     "ha", 1),
  make("mu",  "亩",       "亩", 1, [
    { q: "1 亩水稻大概是多大？", a: "1 亩 ≈ 666.67 平方米，相当于长 25 米 × 宽 26.67 米的地块。" },
  ]),
  make("ft2", "平方英尺", "ft²", 1),
  make("yd2", "平方码",   "yd²", 1),
  make("ac",  "英亩",     "ac", 1),
  make("mi2", "平方英里", "mi²", 1),
];
