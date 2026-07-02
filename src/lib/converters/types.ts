// 通用单位换算配置类型 —— 一份组件跑所有换算器。
// 每个单位定义"到基准单位"和"从基准单位"的换算函数，
// 从而同时支持线性换算（米/英尺）与非线性换算（温度）。

export type UnitDef = {
  key: string;          // "m" / "ft" / "c" / "f"
  name: string;         // 显示名："米"
  symbol: string;       // 单位符号："m"
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
};

export type ConverterFAQ = { q: string; a: string };

export type ConverterConfig = {
  key: string;                    // "length-m"
  category: string;               // "length" —— 决定使用哪一套 units
  title: string;                  // 页面标题
  intro: string;                  // 一句话简介
  defaultUnit: string;            // 默认输入单位 key
  defaultValue: number;           // 默认输入值
  examples: { from: string; value: number; note?: string }[];
  formulas: string[];             // 公式说明（纯文本）
  faqs: ConverterFAQ[];
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
};

// 便捷：线性换算（相对基准单位的倍率）
export function linear(factor: number): Pick<UnitDef, "toBase" | "fromBase"> {
  return {
    toBase: (v) => v * factor,
    fromBase: (v) => v / factor,
  };
}
