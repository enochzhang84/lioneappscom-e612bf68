// 温度换算 config（非线性）
import type { ConverterConfig } from "./types";

const COMMON_FORMULAS = [
  "摄氏 → 华氏：°F = °C × 9/5 + 32",
  "华氏 → 摄氏：°C = (°F − 32) × 5/9",
  "摄氏 → 开尔文：K = °C + 273.15",
  "华氏 → 兰氏：°R = °F + 459.67",
  "水的冰点：0°C = 32°F = 273.15K",
  "水的沸点（标准大气压）：100°C = 212°F = 373.15K",
];

const COMMON_FAQS = [
  { q: "为什么 -40°C 和 -40°F 相同？", a: "把两个公式联立求解，−40 是摄氏度与华氏度唯一相等的温度点。" },
  { q: "0K（绝对零度）是多少摄氏度？", a: "0K = −273.15°C = −459.67°F，是理论上的最低温度。" },
  { q: "为什么温度不能像长度一样简单相乘？", a: "温度存在偏移量（如 32°F 对应 0°C），因此换算是「乘系数 + 加减常数」的仿射变换。" },
];

function make(key: string, name: string, symbol: string, defaultValue: number, extra: {q:string;a:string}[] = []): ConverterConfig {
  return {
    key: `temperature-${key}`,
    category: "temperature",
    title: `${name}换算器`,
    intro: `支持 ${name}、摄氏度 (°C)、华氏度 (°F)、开尔文 (K)、兰氏度 (°R) 之间准确换算，输入即结果。`,
    defaultUnit: key,
    defaultValue,
    examples: [
      { from: key, value: 0 },
      { from: key, value: 25 },
      { from: key, value: 100 },
    ],
    formulas: COMMON_FORMULAS,
    faqs: [...extra, ...COMMON_FAQS],
    seo: {
      title: `${name}换算器 - 摄氏度、华氏度、开尔文在线转换`,
      description: `免费在线${name}换算工具，精确换算摄氏度、华氏度、开尔文、兰氏度，附带公式说明与常见示例。`,
      keywords: `${name}换算, 摄氏华氏换算, °C 转 °F, 华氏转摄氏, 温度单位换算`,
    },
  };
}

export const TEMPERATURE_CONFIGS: ConverterConfig[] = [
  make("c", "摄氏度", "°C", 25, [
    { q: "室温 25°C 是多少华氏度？", a: "25°C × 9/5 + 32 = 77°F。" },
  ]),
  make("f", "华氏度", "°F", 77, [
    { q: "98.6°F 是多少摄氏度？", a: "(98.6 − 32) × 5/9 = 37°C，正常人体体温。" },
  ]),
  make("k", "开尔文", "K",  298),
  make("r", "兰氏度", "°R", 537),
];
