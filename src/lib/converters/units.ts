// 所有单位定义（按 category 分组）。新增单位只需在这里加一行。
import { linear, type UnitDef } from "./types";

// ========== 长度 · 基准：米 (m) ==========
export const LENGTH_UNITS: UnitDef[] = [
  { key: "m",    name: "米",   symbol: "m",    ...linear(1) },
  { key: "cm",   name: "厘米", symbol: "cm",   ...linear(0.01) },
  { key: "mm",   name: "毫米", symbol: "mm",   ...linear(0.001) },
  { key: "km",   name: "公里", symbol: "km",   ...linear(1000) },
  { key: "in",   name: "英寸", symbol: "in",   ...linear(0.0254) },
  { key: "ft",   name: "英尺", symbol: "ft",   ...linear(0.3048) },
  { key: "yd",   name: "码",   symbol: "yd",   ...linear(0.9144) },
  { key: "mile", name: "英里", symbol: "mile", ...linear(1609.344) },
];

// ========== 面积 · 基准：平方米 (m²) ==========
export const AREA_UNITS: UnitDef[] = [
  { key: "m2",   name: "平方米",   symbol: "m²",   ...linear(1) },
  { key: "cm2",  name: "平方厘米", symbol: "cm²",  ...linear(0.0001) },
  { key: "km2",  name: "平方公里", symbol: "km²",  ...linear(1_000_000) },
  { key: "ha",   name: "公顷",     symbol: "ha",   ...linear(10_000) },
  { key: "mu",   name: "亩",       symbol: "亩",   ...linear(666.6666667) },
  { key: "ft2",  name: "平方英尺", symbol: "ft²",  ...linear(0.09290304) },
  { key: "yd2",  name: "平方码",   symbol: "yd²",  ...linear(0.83612736) },
  { key: "ac",   name: "英亩",     symbol: "ac",   ...linear(4046.8564224) },
  { key: "mi2",  name: "平方英里", symbol: "mi²",  ...linear(2_589_988.110336) },
];

// ========== 重量 · 基准：千克 (kg) ==========
export const WEIGHT_UNITS: UnitDef[] = [
  { key: "kg",   name: "千克",   symbol: "kg",  ...linear(1) },
  { key: "g",    name: "克",     symbol: "g",   ...linear(0.001) },
  { key: "mg",   name: "毫克",   symbol: "mg",  ...linear(0.000001) },
  { key: "t",    name: "吨",     symbol: "t",   ...linear(1000) },
  { key: "jin",  name: "斤",     symbol: "斤",  ...linear(0.5) },
  { key: "liang",name: "两",     symbol: "两",  ...linear(0.05) },
  { key: "lb",   name: "磅",     symbol: "lb",  ...linear(0.45359237) },
  { key: "oz",   name: "盎司",   symbol: "oz",  ...linear(0.028349523125) },
  { key: "ct",   name: "克拉",   symbol: "ct",  ...linear(0.0002) },
];

// ========== 温度 · 基准：摄氏度 (°C) —— 非线性 ==========
export const TEMPERATURE_UNITS: UnitDef[] = [
  { key: "c", name: "摄氏度",   symbol: "°C",
    toBase:   (v) => v,
    fromBase: (v) => v },
  { key: "f", name: "华氏度",   symbol: "°F",
    toBase:   (v) => (v - 32) * 5 / 9,
    fromBase: (v) => v * 9 / 5 + 32 },
  { key: "k", name: "开尔文",   symbol: "K",
    toBase:   (v) => v - 273.15,
    fromBase: (v) => v + 273.15 },
  { key: "r", name: "兰氏度",   symbol: "°R",
    toBase:   (v) => (v - 491.67) * 5 / 9,
    fromBase: (v) => (v + 273.15) * 9 / 5 },
];

// ========== 体积 · 基准：升 (L) ==========
export const VOLUME_UNITS: UnitDef[] = [
  { key: "L",    name: "升",         symbol: "L",   ...linear(1) },
  { key: "mL",   name: "毫升",       symbol: "mL",  ...linear(0.001) },
  { key: "m3",   name: "立方米",     symbol: "m³",  ...linear(1000) },
  { key: "cm3",  name: "立方厘米",   symbol: "cm³", ...linear(0.001) },
  { key: "gal_us", name: "美制加仑", symbol: "gal", ...linear(3.785411784) },
  { key: "gal_uk", name: "英制加仑", symbol: "gal(UK)", ...linear(4.54609) },
  { key: "qt",   name: "夸脱",       symbol: "qt",  ...linear(0.946352946) },
  { key: "pt",   name: "品脱",       symbol: "pt",  ...linear(0.473176473) },
  { key: "cup",  name: "杯",         symbol: "cup", ...linear(0.2365882365) },
  { key: "floz", name: "液盎司",     symbol: "fl oz", ...linear(0.0295735295625) },
  { key: "ft3",  name: "立方英尺",   symbol: "ft³", ...linear(28.316846592) },
];

export const UNIT_SETS: Record<string, UnitDef[]> = {
  length: LENGTH_UNITS,
  area: AREA_UNITS,
  weight: WEIGHT_UNITS,
  temperature: TEMPERATURE_UNITS,
  volume: VOLUME_UNITS,
};

export function getUnits(category: string): UnitDef[] | null {
  return UNIT_SETS[category] ?? null;
}
