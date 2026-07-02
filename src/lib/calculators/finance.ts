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

// —— 通用贷款计算器（等额本息，月数直接输入） ——
const loan: CalculatorConfig = {
  key: "loan",
  category: "finance",
  title: "贷款计算器（等额本息）",
  intro: "适用于个人消费贷款、经营贷款等。输入贷款金额、年利率和月数，计算月供、总利息和总还款额。",
  inputs: [
    { key: "principal", label: "贷款金额", unit: "元", defaultValue: 100_000, step: 1000, min: 0 },
    { key: "rate", label: "年利率", unit: "%", defaultValue: 6, step: 0.1, min: 0 },
    { key: "months", label: "还款月数", unit: "月", defaultValue: 36, step: 1, min: 1 },
  ],
  outputs: [
    { key: "monthly", label: "月供", unit: "元", primary: true, format: "money" },
    { key: "totalPay", label: "总还款", unit: "元", format: "money" },
    { key: "totalInterest", label: "总利息", unit: "元", format: "money" },
  ],
  compute: (v) => {
    const P = +v.principal, r = +v.rate / 100 / 12, n = +v.months;
    const monthly = r === 0 ? (n > 0 ? P / n : 0) : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = monthly * n;
    return { monthly, totalPay, totalInterest: totalPay - P };
  },
  formulas: [
    "月利率 i = 年利率 ÷ 12",
    "月供 M = P × i × (1+i)ⁿ ÷ ((1+i)ⁿ − 1)",
  ],
  faqs: [
    { q: "和房贷计算器有什么区别？", a: "算法一致，此工具直接以月数输入，适合任意期限的普通贷款。" },
  ],
};

// —— APR 计算器（含手续费的实际年化利率，牛顿迭代求解） ——
const apr: CalculatorConfig = {
  key: "apr",
  category: "finance",
  title: "APR 年化利率计算器",
  intro: "将贷款手续费/服务费折算进真实成本，得到实际年化利率（APR）。",
  inputs: [
    { key: "principal", label: "贷款金额", unit: "元", defaultValue: 100_000, step: 1000, min: 0 },
    { key: "rate", label: "名义年利率", unit: "%", defaultValue: 6, step: 0.1, min: 0 },
    { key: "months", label: "还款月数", unit: "月", defaultValue: 36, step: 1, min: 1 },
    { key: "fee", label: "一次性手续费", unit: "元", defaultValue: 2000, step: 100, min: 0 },
  ],
  outputs: [
    { key: "monthly", label: "月供", unit: "元", primary: true, format: "money" },
    { key: "apr", label: "实际 APR", unit: "%", primary: true },
    { key: "totalCost", label: "总成本", unit: "元", format: "money" },
  ],
  compute: (v) => {
    const P = +v.principal, r = +v.rate / 100 / 12, n = +v.months, fee = +v.fee;
    if (P <= 0 || n <= 0) return { monthly: 0, apr: 0, totalCost: 0 };
    const monthly = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const net = P - fee; // 实际到手
    // 求 i 使 net = monthly * (1-(1+i)^-n)/i
    let i = r > 0 ? r : 0.005;
    for (let k = 0; k < 60; k++) {
      const f = monthly * (1 - Math.pow(1 + i, -n)) / i - net;
      const df = monthly * (n * Math.pow(1 + i, -n - 1) / i - (1 - Math.pow(1 + i, -n)) / (i * i));
      const step = f / df;
      i -= step;
      if (!Number.isFinite(i) || i <= 0) { i = Math.max(1e-6, i + step / 2); }
      if (Math.abs(step) < 1e-10) break;
    }
    return { monthly, apr: i * 12 * 100, totalCost: monthly * n + fee };
  },
  formulas: [
    "月供 M 按名义利率 r 计算（等额本息）",
    "APR 使 (P − fee) = M × [1 − (1+i)⁻ⁿ] ÷ i，年化 APR = i × 12",
  ],
  faqs: [
    { q: "APR 和 IRR 一样吗？", a: "本质一致——把手续费视为负现金流后的内部收益率，年化即 APR。" },
  ],
};

// —— 利息计算器（单利/复利对比） ——
const interest: CalculatorConfig = {
  key: "interest",
  category: "finance",
  title: "利息计算器（单利 / 复利）",
  intro: "同时计算单利与复利收益，对比长期投资的差距。",
  inputs: [
    { key: "principal", label: "本金", unit: "元", defaultValue: 100_000, step: 1000, min: 0 },
    { key: "rate", label: "年利率", unit: "%", defaultValue: 5, step: 0.1, min: 0 },
    { key: "years", label: "年限", unit: "年", defaultValue: 10, step: 1, min: 0 },
  ],
  outputs: [
    { key: "simple", label: "单利利息", unit: "元", primary: true, format: "money" },
    { key: "compound", label: "复利利息（按年）", unit: "元", primary: true, format: "money" },
    { key: "diff", label: "差额", unit: "元", format: "money" },
  ],
  compute: (v) => {
    const P = +v.principal, r = +v.rate / 100, t = +v.years;
    const simple = P * r * t;
    const compound = P * Math.pow(1 + r, t) - P;
    return { simple, compound, diff: compound - simple };
  },
  formulas: [
    "单利：I = P × r × t",
    "复利：A = P × (1+r)^t，利息 = A − P",
  ],
};

// —— 投资收益计算（含每月定投） ——
const investment: CalculatorConfig = {
  key: "investment",
  category: "finance",
  title: "投资收益计算器（含定投）",
  intro: "计算一次性投入 + 每月追加定投在给定年化收益率下的终值与总收益。",
  inputs: [
    { key: "principal", label: "初始投入", unit: "元", defaultValue: 50_000, step: 1000, min: 0 },
    { key: "monthly", label: "每月定投", unit: "元", defaultValue: 3000, step: 100, min: 0 },
    { key: "rate", label: "预期年化收益", unit: "%", defaultValue: 8, step: 0.1, min: 0 },
    { key: "years", label: "投资年限", unit: "年", defaultValue: 10, step: 1, min: 0 },
  ],
  outputs: [
    { key: "future", label: "到期总值", unit: "元", primary: true, format: "money" },
    { key: "totalIn", label: "累计投入", unit: "元", format: "money" },
    { key: "gain", label: "累计收益", unit: "元", format: "money" },
    { key: "multiple", label: "收益倍数", unit: "倍" },
  ],
  compute: (v) => {
    const P = +v.principal, PMT = +v.monthly, r = +v.rate / 100 / 12, n = +v.years * 12;
    const fvP = P * Math.pow(1 + r, n);
    const fvA = r === 0 ? PMT * n : PMT * ((Math.pow(1 + r, n) - 1) / r);
    const future = fvP + fvA;
    const totalIn = P + PMT * n;
    return { future, totalIn, gain: future - totalIn, multiple: totalIn > 0 ? future / totalIn : 0 };
  },
  formulas: [
    "初投终值 = P × (1+i)ⁿ",
    "定投终值 = PMT × [(1+i)ⁿ − 1] ÷ i（期末定投）",
  ],
};

// —— PayPal 手续费（美国国内标准商用 2.9% + $0.30） ——
const paypalFee: CalculatorConfig = {
  key: "paypal-fee",
  category: "finance",
  title: "PayPal 手续费计算器",
  intro: "按当前 PayPal 商用标准费率计算收款到账金额、手续费；支持反推「想到账 X，应收多少」。",
  inputs: [
    { key: "mode", label: "计算方向", type: "select", defaultValue: "gross",
      options: [
        { value: "gross", label: "输入收款金额 → 计算到账" },
        { value: "net", label: "希望到账金额 → 反算应收" },
      ] },
    { key: "amount", label: "金额", unit: "USD", defaultValue: 100, step: 1, min: 0 },
    { key: "percent", label: "费率", unit: "%", defaultValue: 2.9, step: 0.1, min: 0 },
    { key: "fixed", label: "固定费", unit: "USD", defaultValue: 0.3, step: 0.1, min: 0 },
  ],
  outputs: [
    { key: "gross", label: "收款金额", unit: "USD", primary: true, format: "money" },
    { key: "fee", label: "手续费", unit: "USD", primary: true, format: "money" },
    { key: "net", label: "实际到账", unit: "USD", primary: true, format: "money" },
  ],
  compute: (v) => {
    const p = +v.percent / 100, fx = +v.fixed, amt = +v.amount;
    if (v.mode === "net") {
      const gross = (amt + fx) / (1 - p);
      const fee = gross - amt;
      return { gross, fee, net: amt };
    }
    const fee = amt * p + fx;
    return { gross: amt, fee, net: amt - fee };
  },
  formulas: [
    "手续费 = 金额 × 费率 + 固定费",
    "反算：应收金额 = (到账 + 固定费) ÷ (1 − 费率)",
  ],
  faqs: [
    { q: "费率是多少？", a: "美国境内商品/服务标准费率约为 2.9% + $0.30，跨境和币种转换会更高。请以 PayPal 最新政策为准。" },
  ],
};

// —— Stripe 手续费（美国 2.9% + $0.30） ——
const stripeFee: CalculatorConfig = {
  key: "stripe-fee",
  category: "finance",
  title: "Stripe 手续费计算器",
  intro: "按 Stripe 美国信用卡标准费率计算手续费与实际到账，支持反算「想到账 X」的应收金额。",
  inputs: [
    { key: "mode", label: "计算方向", type: "select", defaultValue: "gross",
      options: [
        { value: "gross", label: "输入收款金额 → 计算到账" },
        { value: "net", label: "希望到账金额 → 反算应收" },
      ] },
    { key: "amount", label: "金额", unit: "USD", defaultValue: 100, step: 1, min: 0 },
    { key: "percent", label: "费率", unit: "%", defaultValue: 2.9, step: 0.1, min: 0 },
    { key: "fixed", label: "固定费", unit: "USD", defaultValue: 0.3, step: 0.1, min: 0 },
  ],
  outputs: [
    { key: "gross", label: "收款金额", unit: "USD", primary: true, format: "money" },
    { key: "fee", label: "手续费", unit: "USD", primary: true, format: "money" },
    { key: "net", label: "实际到账", unit: "USD", primary: true, format: "money" },
  ],
  compute: (v) => {
    const p = +v.percent / 100, fx = +v.fixed, amt = +v.amount;
    if (v.mode === "net") {
      const gross = (amt + fx) / (1 - p);
      return { gross, fee: gross - amt, net: amt };
    }
    const fee = amt * p + fx;
    return { gross: amt, fee, net: amt - fee };
  },
  formulas: [
    "手续费 = 金额 × 费率 + 固定费",
    "反算：应收 = (到账 + 固定费) ÷ (1 − 费率)",
  ],
  faqs: [
    { q: "国际卡费率呢？", a: "国际卡通常 +1.5%，货币转换 +1%。请以 Stripe 最新政策为准。" },
  ],
};

export const FINANCE_CALCS: CalculatorConfig[] = [
  mortgage, compound, loan, apr, interest, investment, paypalFee, stripeFee,
];
