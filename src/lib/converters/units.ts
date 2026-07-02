// 所有单位定义（按 category 分组）。新增单位只需在这里加一行。
import { linear, type UnitDef } from "./types";

// 基准：米 (m)
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

export const UNIT_SETS: Record<string, UnitDef[]> = {
  length: LENGTH_UNITS,
};

export function getUnits(category: string): UnitDef[] | null {
  return UNIT_SETS[category] ?? null;
}
