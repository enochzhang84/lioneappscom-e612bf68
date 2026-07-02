// 美国生活相关计算器：Sales Tax、小费
import type { CalculatorConfig } from "./types";

const SALES_TAX: CalculatorConfig = {
  key: "sales-tax",
  category: "usa",
  title: "Sales Tax 美国销售税计算器",
  intro: "输入税前金额和州/市销售税率，一键计算含税总价与税额。适用于美国购物、发票核对。",
  inputs: [
    { key: "amount", label: "税前金额", unit: "USD", defaultValue: 100, min: 0, step: 0.01 },
    { key: "rate", label: "销售税率", unit: "%", defaultValue: 7.25, min: 0, max: 20, step: 0.01, hint: "加州 7.25%、纽约市 8.875%、德州 6.25%、佛州 6%" },
  ],
  outputs: [
    { key: "tax", label: "销售税", unit: "USD", format: "money" },
    { key: "total", label: "含税总价", unit: "USD", format: "money", primary: true },
  ],
  compute: (v) => {
    const a = Number(v.amount) || 0;
    const r = Number(v.rate) || 0;
    const tax = a * r / 100;
    return { tax, total: a + tax };
  },
  formulas: [
    "税额 = 税前金额 × 税率",
    "含税总价 = 税前金额 + 税额",
  ],
  examples: [
    { label: "$100 · 加州 7.25%", values: { amount: 100, rate: 7.25 } },
    { label: "$50 · 纽约市 8.875%", values: { amount: 50, rate: 8.875 } },
    { label: "$999 · 德州 6.25%", values: { amount: 999, rate: 6.25 } },
  ],
  faqs: [
    { q: "美国各州销售税率哪里查？", a: "以州税务局 (Department of Revenue) 数据为准，部分城市有额外市税；本工具用于估算，请以购物小票为准。" },
    { q: "俄勒冈州为什么算出来没税？", a: "OR、NH、MT、DE、AK 5 个州没有州级销售税，输入 0 即可。" },
  ],
};

const TIP: CalculatorConfig = {
  key: "tip",
  category: "usa",
  title: "小费计算器 (Tip Calculator)",
  intro: "美式餐厅、外卖、Uber 小费计算：按人数均摊、按百分比计算，一键得到每人应付。",
  inputs: [
    { key: "bill", label: "账单金额", unit: "USD", defaultValue: 60, min: 0, step: 0.01 },
    { key: "tip", label: "小费百分比", unit: "%", defaultValue: 18, min: 0, max: 50, step: 1, hint: "普通 15%、标准 18%、优秀 20%、外卖 10-15%" },
    { key: "people", label: "人数", defaultValue: 2, min: 1, step: 1 },
  ],
  outputs: [
    { key: "tipAmt", label: "小费", unit: "USD", format: "money" },
    { key: "total", label: "总计", unit: "USD", format: "money" },
    { key: "perPerson", label: "每人应付", unit: "USD", format: "money", primary: true },
  ],
  compute: (v) => {
    const b = Number(v.bill) || 0;
    const t = Number(v.tip) || 0;
    const p = Math.max(1, Math.floor(Number(v.people) || 1));
    const tipAmt = b * t / 100;
    const total = b + tipAmt;
    return { tipAmt, total, perPerson: total / p };
  },
  formulas: [
    "小费 = 账单 × 小费百分比",
    "总计 = 账单 + 小费",
    "每人应付 = 总计 ÷ 人数",
  ],
  examples: [
    { label: "$60 · 18% · 2 人", values: { bill: 60, tip: 18, people: 2 } },
    { label: "$120 · 20% · 4 人", values: { bill: 120, tip: 20, people: 4 } },
    { label: "$25 外卖 · 15% · 1 人", values: { bill: 25, tip: 15, people: 1 } },
  ],
  faqs: [
    { q: "美国餐厅小费一般给多少？", a: "堂食 15-20%，酒吧每杯 $1，外卖 10-15%，Uber/出租车 10-20%。高端餐厅按 20% 起。" },
    { q: "小费按税前还是税后？", a: "习惯上以税前金额（subtotal）计算，本工具直接使用输入金额即可。" },
  ],
};

export const USA_CALCS: CalculatorConfig[] = [SALES_TAX, TIP];
