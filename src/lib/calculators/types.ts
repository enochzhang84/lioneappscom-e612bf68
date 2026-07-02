// 通用计算器配置类型。每个 Calculator = 一组输入字段 + compute 函数 + 一组输出字段。
export type FieldOption = { value: string; label: string };

export type CalcInput = {
  key: string;
  label: string;
  unit?: string;
  type?: "number" | "select";
  defaultValue?: number | string;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  options?: FieldOption[];
};

export type CalcOutput = {
  key: string;
  label: string;
  unit?: string;
  hint?: string;
  primary?: boolean;
  /** 覆盖格式化：例如 "int" 显示为整数。默认保留 2 位小数。 */
  format?: "int" | "money" | "auto";
};

export type CalculatorConfig = {
  key: string;
  category: "decoration" | "logistics" | "finance";
  title: string;
  intro: string;
  inputs: CalcInput[];
  outputs: CalcOutput[];
  /** 根据当前输入计算输出；返回 key -> number|string */
  compute: (values: Record<string, number | string>) => Record<string, number | string>;
  formulas: string[];
  examples?: { label: string; values: Record<string, number | string> }[];
  faqs?: { q: string; a: string }[];
};
