// 日期时间计算器：日期差、年龄
import type { CalculatorConfig } from "./types";

function toDate(s: string | number): Date | null {
  if (!s) return null;
  const d = new Date(String(s));
  return isNaN(d.getTime()) ? null : d;
}
function todayISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const DATE_DIFF: CalculatorConfig = {
  key: "date-diff",
  category: "time",
  title: "日期差计算器",
  intro: "计算两个日期之间的天数、周数、月数、年数。适用于计划工期、纪念日、账期。",
  inputs: [
    { key: "start", label: "起始日期", type: "select", defaultValue: "2020-01-01",
      options: [{ value: "2020-01-01", label: "2020-01-01" }] },
    { key: "end", label: "结束日期", type: "select", defaultValue: todayISO(),
      options: [{ value: todayISO(), label: todayISO() }] },
  ],
  outputs: [
    { key: "days", label: "相差天数", unit: "天", format: "int", primary: true },
    { key: "weeks", label: "相差周", unit: "周" },
    { key: "months", label: "相差月", unit: "月" },
    { key: "years", label: "相差年", unit: "年" },
    { key: "detail", label: "分解" },
  ],
  compute: (v) => {
    const s = toDate(v.start as string), e = toDate(v.end as string);
    if (!s || !e) return { days: 0, weeks: 0, months: 0, years: 0, detail: "-" };
    const ms = e.getTime() - s.getTime();
    const days = Math.round(ms / 86400000);
    const yrs = e.getFullYear() - s.getFullYear();
    const mos = yrs * 12 + (e.getMonth() - s.getMonth()) - (e.getDate() < s.getDate() ? 1 : 0);
    const Y = Math.trunc(mos / 12);
    const M = mos % 12;
    // day-in-month
    const anchor = new Date(s);
    anchor.setFullYear(s.getFullYear() + Y);
    anchor.setMonth(s.getMonth() + Y * 0 + M);
    const D = Math.round((e.getTime() - anchor.getTime()) / 86400000);
    return {
      days,
      weeks: Math.round((days / 7) * 100) / 100,
      months: Math.round((days / 30.4375) * 100) / 100,
      years: Math.round((days / 365.25) * 100) / 100,
      detail: `${Y} 年 ${M} 月 ${D} 天`,
    };
  },
  formulas: [
    "天数 = (end − start) / 86400000",
    "分解 = 年/月/日；月份差按自然月计",
  ],
  faqs: [
    { q: "结束日期算不算？", a: "本工具计算的是两日期之间的间隔天数（差值），不含起始也不额外加 1。" },
  ],
};

// 由于计算器 UI 使用 <Input type=number/> 或 select，日期需要单独 UI。
// 但为了复用现有 CalculatorConfig，我们在 admin.tools.index 上通过特殊 link 处理。
// 简化：把 start/end 改为 number 型（Unix ms），配特殊 UI 又复杂——因此这里改用文本 input 通过 "select" 只是占位；
// 为保证真的可用，我们改成 select 并通过 examples 提供当天日期。此外把这两个 calc 用一个单独的 DateCalc 组件承接。
// 结论：这两个计算器不放入通用 Calculator，而是由单独的 TimeTool 承接。
// 因此下面导出的数组保持为空，避免 UI 报错。
export const TIME_CALCS: CalculatorConfig[] = [];
export { DATE_DIFF };
