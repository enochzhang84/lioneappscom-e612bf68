// 体积换算 config
import type { ConverterConfig } from "./types";

const COMMON_FORMULAS = [
  "1 升 (L) = 1000 毫升 = 1000 立方厘米",
  "1 立方米 (m³) = 1000 升",
  "1 美制加仑 (US gal) = 3.7854 升",
  "1 英制加仑 (UK gal) = 4.5461 升",
  "1 美制杯 = 236.588 mL，1 液盎司 (fl oz) = 29.5735 mL",
  "1 立方英尺 (ft³) = 28.3168 升",
];

const COMMON_FAQS = [
  { q: "美制加仑和英制加仑一样吗？", a: "不一样。美制 1 gal = 3.7854 L，英制 1 gal = 4.5461 L，英制约大 20%。汽油/汽车里程一般用美制。" },
  { q: "一杯水到底是多少毫升？", a: "美制标准杯 = 236.588 mL；中国日常「一杯」通常按 250 mL 计。" },
  { q: "1 升水等于多少千克？", a: "在标准状态下 1 升水 ≈ 1 千克（4°C 时精确等于 1 kg）。" },
];

function make(key: string, name: string, symbol: string, defaultValue: number, extra: {q:string;a:string}[] = []): ConverterConfig {
  return {
    key: `volume-${key}`,
    category: "volume",
    title: `${name}换算器`,
    intro: `支持 ${name}、升、毫升、立方米、立方厘米、美/英制加仑、夸脱、品脱、杯、液盎司、立方英尺 之间换算。`,
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
      title: `${name}换算器 - ${name}、升、毫升、加仑在线换算`,
      description: `免费在线${name}换算工具，覆盖公制与英美制体积单位（升、毫升、立方米、加仑、夸脱、品脱、杯、液盎司）快速换算。`,
      keywords: `${name}换算, ${name}转升, ${name}转加仑, 体积换算, 容量换算, 单位换算`,
    },
  };
}

export const VOLUME_CONFIGS: ConverterConfig[] = [
  make("L",      "升",       "L",   1),
  make("mL",     "毫升",     "mL",  100),
  make("m3",     "立方米",   "m³",  1),
  make("cm3",    "立方厘米", "cm³", 100),
  make("gal_us", "美制加仑", "gal", 1, [
    { q: "美国汽车油箱一般多少加仑？", a: "轿车约 12–16 美制加仑（45–60 升），SUV 约 18–24 加仑。" },
  ]),
  make("gal_uk", "英制加仑", "gal(UK)", 1),
  make("qt",     "夸脱",     "qt",  1),
  make("pt",     "品脱",     "pt",  1),
  make("cup",    "杯",       "cup", 1),
  make("floz",   "液盎司",   "fl oz", 1),
  make("ft3",    "立方英尺", "ft³", 1),
];
