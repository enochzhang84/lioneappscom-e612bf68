// 换算器配置索引：根据 key 拿到 ConverterConfig 与对应 UnitDef 列表。
import type { ConverterConfig } from "./types";
import { LENGTH_CONFIGS } from "./length";
import { getUnits } from "./units";

const ALL: ConverterConfig[] = [
  ...LENGTH_CONFIGS,
];

const INDEX = new Map<string, ConverterConfig>(ALL.map((c) => [c.key, c]));

export function getConverterConfig(key: string): ConverterConfig | null {
  return INDEX.get(key) ?? null;
}

export function getConverterUnits(config: ConverterConfig) {
  return getUnits(config.category);
}

export type { ConverterConfig, UnitDef } from "./types";
