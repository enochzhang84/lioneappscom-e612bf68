// 油耗换算 config（非线性 —— L/100km ↔ mpg 是倒数关系）
import type { ConverterConfig } from "./types";

const FORMULAS = [
  "L/100km ↔ km/L：km/L = 100 / (L/100km)",
  "L/100km ↔ 美制 mpg：mpg = 235.2146 / (L/100km)",
  "L/100km ↔ 英制 mpg：mpg = 282.4809 / (L/100km)",
  "美制 mpg 与英制 mpg 差别：英制加仑 (4.5461 L) 比美制加仑 (3.7854 L) 大约 20%",
];

const FAQS = [
  { q: "L/100km 越小越省油对吗？", a: "对。L/100km 表示每 100 公里烧多少升油，数值越小越省油；mpg 相反，越大越省油。" },
  { q: "美制 30 mpg 换算成 L/100km 是多少？", a: "235.2146 / 30 ≈ 7.84 L/100km。" },
  { q: "为什么美制 mpg 和英制 mpg 不同？", a: "英制加仑 (UK gal) 是 4.5461 L，美制加仑 (US gal) 是 3.7854 L，同样的 mpg 数值代表不同的省油程度。" },
];

function make(key: string, name: string, defaultValue: number): ConverterConfig {
  return {
    key: `fuel-${key}`,
    category: "fuel",
    title: `${name}换算器`,
    intro: `支持 ${name}、L/100km、km/L、美制 MPG、英制 MPG 之间快速换算，帮你对照不同市场的车辆油耗。`,
    defaultUnit: key,
    defaultValue,
    examples: [
      { from: key, value: 6 },
      { from: key, value: 8 },
      { from: key, value: 10 },
    ],
    formulas: FORMULAS,
    faqs: FAQS,
    seo: {
      title: `${name}换算器 - L/100km、km/L、mpg 油耗互换`,
      description: `免费在线油耗换算工具，L/100km 与 美制/英制 mpg、km/L 精确互换，帮你快速对比不同车型的油耗表现。`,
      keywords: `${name}换算, 油耗换算, L/100km 转 mpg, mpg 转百公里油耗, km/L 换算`,
    },
  };
}

export const FUEL_CONFIGS: ConverterConfig[] = [
  make("l100km", "L/100km",  8),
  make("kmpl",   "km/L",     12.5),
  make("mpg_us", "美制 mpg", 30),
  make("mpg_uk", "英制 mpg", 36),
];
