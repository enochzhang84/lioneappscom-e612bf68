// 金融计算器：房贷月供 / 复利存款
import type { CalculatorConfig } from "./types";

const mortgage: CalculatorConfig = {
  key: "mortgage",
  category: "finance",
  title: "房贷月供计算器（等额本息）",
  intro: "按等额本息方式计算月供、总利息和总还款额。输入贷款金额、年利率和还款年限即可。",
  inputs: [
    { key: "principal", label: "贷款金额", unit: "元", defaultValue: 1_000_000, step: 10000, min: 0 },
    { key: "rate", label: "年利率", unit: "%", defaultValue: 3.5, step: 0.05, min: 0 },
    { key: "years", label: "还款年限", unit: "年", defaultValue: 30, step: 1, min: 1 },
  ],
  outputs: [
    { key: "monthly", label: "月供", unit: "元", primary: true, format: "money" },
    { key: "totalPay", label: "总还款", unit: "元", format: "money" },
    { key: "totalInterest", label: "总利息", unit: "元", format: "money" },
  ],
  compute: (v) => {
    const P = +v.principal, r = +v.rate / 100 / 12, n = +v.years * 12;
    let monthly = 0;
    if (r === 0) monthly = n > 0 ? P / n : 0;
    else monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = monthly * n;
    const totalInterest = totalPay - P;
    return { monthly, totalPay, totalInterest };
  },
  formulas: [
    "月利率 i = 年利率 ÷ 12",
    "月供 M = P × i × (1+i)ⁿ ÷ ((1+i)ⁿ − 1)",
    "总还款 = 月供 × 期数；总利息 = 总还款 − 本金",
  ],
  examples: [
    { label: "100万 · 3.5% · 30年", values: { principal: 1_000_000, rate: 3.5, years: 30 } },
    { label: "200万 · 3.1% · 30年", values: { principal: 2_000_000, rate: 3.1, years: 30 } },
    { label: "50万 · 4.0% · 20年", values: { principal: 500_000, rate: 4.0, years: 20 } },
  ],
  faqs: [
    { q: "和等额本金有什么区别？", a: "等额本息每月还款相同，前期利息占比高；等额本金每月还款递减，总利息更少。本工具算的是等额本息。" },
    { q: "年利率填 LPR 还是加点后利率？", a: "填实际执行利率（LPR ± 基点），即银行合同上写的利率。" },
  ],
};

const compound: CalculatorConfig = {
  key: "compound-interest",
  category: "finance",
  title: "复利计算器（存款 / 投资）",
  intro: "计算按复利增长的本息合计。可选择计息频率（年 / 季 / 月 / 日）。",
  inputs: [
    { key: "principal", label: "本金", unit: "元", defaultValue: 100_000, step: 1000, min: 0 },
    { key: "rate", label: "年利率", unit: "%", defaultValue: 4, step: 0.1, min: 0 },
    { key: "years", label: "投资年限", unit: "年", defaultValue: 10, step: 1, min: 0 },
    { key: "freq", label: "计息频率", type: "select", defaultValue: "12",
      options: [
        { value: "1", label: "每年" },
        { value: "4", label: "每季度" },
        { value: "12", label: "每月" },
        { value: "365", label: "每日" },
      ] },
  ],
  outputs: [
    { key: "future", label: "到期本息", unit: "元", primary: true, format: "money" },
    { key: "interest", label: "利息收入", unit: "元", format: "money" },
    { key: "multiple", label: "本息倍数", unit: "倍" },
  ],
  compute: (v) => {
    const P = +v.principal, r = +v.rate / 100, t = +v.years, m = +v.freq;
    const future = m > 0 ? P * Math.pow(1 + r / m, m * t) : 0;
    const interest = future - P;
    const multiple = P > 0 ? future / P : 0;
    return { future, interest, multiple };
  },
  formulas: [
    "到期本息 A = P × (1 + r/m)^(m·t)",
    "利息 = A − P；本息倍数 = A ÷ P",
  ],
  examples: [
    { label: "10万 · 4% · 10年月复", values: { principal: 100_000, rate: 4, years: 10, freq: "12" } },
    { label: "50万 · 5% · 20年年复", values: { principal: 500_000, rate: 5, years: 20, freq: "1" } },
  ],
  faqs: [
    { q: "单利与复利差多少？", a: "10万 · 5% · 20年，单利利息 10 万；月复利利息约 17.15 万，差距接近 70%。" },
    { q: "每日复利和每月复利差得多吗？", a: "在常见利率下差异 < 0.5%。银行存款一般按季或年结息，理财常按日计息。" },
  ],
};

export const FINANCE_CALCS: CalculatorConfig[] = [mortgage, compound];
