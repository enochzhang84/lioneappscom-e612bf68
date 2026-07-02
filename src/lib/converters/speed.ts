// 速度换算 config
import type { ConverterConfig } from "./types";

const FORMULAS = [
  "1 km/h = 0.62137 mph = 0.27778 m/s",
  "1 mph = 1.60934 km/h = 0.44704 m/s",
  "1 m/s = 3.6 km/h = 2.23694 mph",
  "1 节 (knot) = 1.852 km/h = 1.15078 mph（航海/航空常用）",
];

const FAQS = [
  { q: "美国限速 65 mph 是多少公里/小时？", a: "65 mph × 1.60934 ≈ 104.6 km/h。" },
  { q: "60 km/h 换算成 mph 是多少？", a: "60 ÷ 1.60934 ≈ 37.28 mph。" },
  { q: "什么时候用节 (knot)？", a: "船舶航速与飞机空速常用节，1 节 = 每小时 1 海里 = 1.852 km/h。" },
];

function make(key: string, name: string, defaultValue: number): ConverterConfig {
  return {
    key: `speed-${key}`,
    category: "speed",
    title: `${name}换算器`,
    intro: `支持 ${name}、km/h、mph、m/s、节 (knot) 之间快速换算，一键得到所有单位结果。`,
    defaultUnit: key,
    defaultValue,
    examples: [
      { from: key, value: 30 },
      { from: key, value: 60 },
      { from: key, value: 100 },
    ],
    formulas: FORMULAS,
    faqs: FAQS,
    seo: {
      title: `${name}换算器 - MPH、KM/H、m/s、节在线换算`,
      description: `免费在线速度换算工具，MPH ⇄ KM/H、m/s、节 (knot) 之间精确互换，适用于驾驶、航海、跑步等场景。`,
      keywords: `${name}换算, mph 转 kmh, kmh 转 mph, 速度换算, 节 换算`,
    },
  };
}

export const SPEED_CONFIGS: ConverterConfig[] = [
  make("kmh",  "公里/小时",  60),
  make("mph",  "英里/小时",  60),
  make("ms",   "米/秒",       10),
  make("knot", "节 (knot)",   20),
];
