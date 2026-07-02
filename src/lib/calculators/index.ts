// Calculator 注册表：通过 key 获取配置。
import type { CalculatorConfig } from "./types";
import { DECORATION_CALCS } from "./decoration";
import { LOGISTICS_CALCS } from "./logistics";
import { FINANCE_CALCS } from "./finance";

const ALL: CalculatorConfig[] = [
  ...DECORATION_CALCS,
  ...LOGISTICS_CALCS,
  ...FINANCE_CALCS,
];

const INDEX = new Map<string, CalculatorConfig>(ALL.map((c) => [c.key, c]));

export function getCalculatorConfig(key: string): CalculatorConfig | null {
  return INDEX.get(key) ?? null;
}

export type { CalculatorConfig } from "./types";
