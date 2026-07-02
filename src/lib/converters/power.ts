// 功率换算 config
import type { ConverterConfig } from "./types";

const FORMULAS = [
  "1 千瓦 (kW) = 1000 瓦特 (W)",
  "1 英制马力 (hp) = 745.6999 W ≈ 0.7457 kW",
  "1 公制马力 (PS) = 735.49875 W ≈ 0.7355 kW（欧洲车常用）",
  "1 BTU/h = 0.29307 W（空调制冷量常用）",
  "1 匹（空调）≈ 735 W ≈ 2500 BTU/h（约 1 公制马力）",
];

const FAQS = [
  { q: "英制马力和公制马力有什么区别？", a: "英制 hp = 745.7 W（英美常用），公制 PS = 735.5 W（欧洲、日本常用）。数值差约 1.4%。" },
  { q: "空调 1 匹是多少瓦？", a: "1 匹 ≈ 735 W 的制冷量，约 2500 BTU/h，适合 10–15 平米房间。" },
  { q: "汽车标定的马力用哪种？", a: "美国车用 hp（bhp），欧洲车用 PS（马力），日本车常写 PS 或 kW。" },
];

function make(key: string, name: string, defaultValue: number): ConverterConfig {
  return {
    key: `power-${key}`,
    category: "power",
    title: `${name}换算器`,
    intro: `支持 ${name}、瓦特、千瓦、英制马力、公制马力、BTU/h、千卡/h 之间快速换算。`,
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
      title: `${name}换算器 - 瓦特、千瓦、马力、BTU 在线换算`,
      description: `免费在线${name}换算工具，支持 W、kW、hp、PS、BTU/h、kcal/h 等功率单位精确换算，适用于电器、空调、汽车马力对照。`,
      keywords: `${name}换算, 千瓦转马力, kW 转 hp, 马力换算, 功率换算, 空调匹数`,
    },
  };
}

export const POWER_CONFIGS: ConverterConfig[] = [
  make("kW",    "千瓦",     1),
  make("W",     "瓦特",     1000),
  make("hp",    "英制马力", 1),
  make("ps",    "公制马力", 1),
  make("btuh",  "BTU/h",   9000),
  make("kcalh", "千卡/h",   1000),
];
