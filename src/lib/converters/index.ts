// 换算器配置索引：根据 key 拿到 ConverterConfig 与对应 UnitDef 列表。
import type { ConverterConfig } from "./types";
import { LENGTH_CONFIGS } from "./length";
import { AREA_CONFIGS } from "./area";
import { WEIGHT_CONFIGS } from "./weight";
import { TEMPERATURE_CONFIGS } from "./temperature";
import { VOLUME_CONFIGS } from "./volume";
import { POWER_CONFIGS } from "./power";
import { FUEL_CONFIGS } from "./fuel";
import { NUMBER_CONFIGS } from "./number";
import { getUnits } from "./units";

const ALL: ConverterConfig[] = [
  ...LENGTH_CONFIGS,
  ...AREA_CONFIGS,
  ...WEIGHT_CONFIGS,
  ...TEMPERATURE_CONFIGS,
  ...VOLUME_CONFIGS,
  ...POWER_CONFIGS,
  ...FUEL_CONFIGS,
  ...NUMBER_CONFIGS,
];

const INDEX = new Map<string, ConverterConfig>(ALL.map((c) => [c.key, c]));

export function getConverterConfig(key: string): ConverterConfig | null {
  return INDEX.get(key) ?? null;
}

export function getConverterUnits(config: ConverterConfig) {
  return getUnits(config.category);
}

export type { ConverterConfig, UnitDef } from "./types";
