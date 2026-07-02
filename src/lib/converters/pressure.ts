// 胎压 / 压力换算 config
import type { ConverterConfig } from "./types";

const FORMULAS = [
  "1 bar = 100 kPa = 14.5038 psi",
  "1 psi = 6.89476 kPa = 0.06895 bar",
  "1 kPa = 0.145038 psi = 0.01 bar",
  "1 MPa = 1000 kPa = 10 bar = 145.038 psi",
  "标准大气压 1 atm ≈ 101.325 kPa ≈ 14.696 psi",
];

const FAQS = [
  { q: "轿车常规胎压是多少？", a: "多数轿车推荐胎压 32–35 psi ≈ 2.2–2.4 bar ≈ 220–240 kPa。请以车门 B 柱铭牌为准。" },
  { q: "psi 和 bar 怎么快速换算？", a: "1 bar ≈ 14.5 psi。粗算：bar × 14.5 ≈ psi；psi ÷ 14.5 ≈ bar。" },
  { q: "冷胎和热胎测量有区别吗？", a: "有。铭牌指的是冷胎压。行驶后轮胎升温，胎压通常上升 2–4 psi 属正常，无需放气。" },
];

function make(key: string, name: string, defaultValue: number): ConverterConfig {
  return {
    key: `pressure-${key}`,
    category: "pressure",
    title: `${name}换算器`,
    intro: `支持 ${name}、PSI、bar、kPa、MPa、大气压 (atm) 之间快速换算，适用于汽车胎压、气压检测等场景。`,
    defaultUnit: key,
    defaultValue,
    examples: [
      { from: key, value: 32 },
      { from: key, value: 35 },
      { from: key, value: 40 },
    ],
    formulas: FORMULAS,
    faqs: FAQS,
    seo: {
      title: `${name}换算器 - PSI、BAR、KPA 胎压压力在线换算`,
      description: `免费在线胎压/压力换算工具，PSI ⇄ BAR ⇄ kPa ⇄ MPa 精确互换，适合汽车轮胎气压、工业压力等场景。`,
      keywords: `${name}换算, 胎压换算, psi 转 bar, bar 转 kpa, 压力换算`,
    },
  };
}

export const PRESSURE_CONFIGS: ConverterConfig[] = [
  make("psi", "PSI",   32),
  make("bar", "bar",   2.2),
  make("kpa", "kPa",   220),
  make("mpa", "MPa",   0.22),
  make("atm", "大气压", 2.2),
];
