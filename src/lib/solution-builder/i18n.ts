// Bilingual strings for Solution Builder
import type { ToolKey } from "./types";

export type Lang = "zh" | "en";

export const SB_STRINGS = {
  brand: { zh: "方案配置中心", en: "Solution Builder" },
  hero_title: {
    zh: "为您的家庭或企业配置完整的 IT 解决方案",
    en: "Build the Right IT Solution for Your Home or Business",
  },
  hero_sub: {
    zh: "选择设备、功能和服务，实时查看预算、兼容性与实施建议，并生成可以保存、打印和分享的专业方案。",
    en: "Select equipment, features and services, calculate the budget in real time, review compatibility and export a professional proposal.",
  },
  cta_start: { zh: "开始配置", en: "Start Building" },
  cta_saved: { zh: "查看已保存方案", en: "View Saved Solutions" },
  summary_title: { zh: "方案摘要", en: "Solution Summary" },
  subtotal: { zh: "设备小计", en: "Subtotal" },
  service_fee: { zh: "服务费", en: "Service Fee" },
  tax: { zh: "税费", en: "Tax" },
  discount: { zh: "折扣", en: "Discount" },
  one_time_total: { zh: "一次性总价", en: "One-time Total" },
  monthly_total: { zh: "每月费用", en: "Monthly" },
  annual_total: { zh: "年度费用", en: "Annual" },
  export_pdf: { zh: "导出 PDF", en: "Export PDF" },
  print: { zh: "打印", en: "Print" },
  save: { zh: "保存方案", en: "Save Solution" },
  copy: { zh: "复制方案", en: "Duplicate" },
  share: { zh: "分享链接", en: "Share Link" },
  submit: { zh: "提交方案并咨询", en: "Submit for Consultation" },
  no_items: { zh: "尚未选择任何设备或服务", en: "No items selected yet" },
  compat_ok: { zh: "配置正常", en: "All checks passed" },
  compat_notice: { zh: "建议注意", en: "Notice" },
  compat_error: { zh: "存在冲突", en: "Not compatible" },
  disclaimer_short: {
    zh: "配置建议仅供预算和初步规划参考，最终兼容性应在采购前再次确认。",
    en: "Configuration is for budgeting and planning reference only; verify compatibility before purchase.",
  },
  qty: { zh: "数量", en: "Qty" },
  unit_price: { zh: "单价", en: "Unit" },
  amount: { zh: "小计", en: "Amount" },
  price_updated: { zh: "价格更新于", en: "Pricing updated" },
  submitted_zh: "您的方案已提交，我们会在确认需求后与您联系。",
  submitted_en: "Your solution has been submitted. We will contact you after reviewing the requirements.",
} as const;

export function bi<T extends { zh: string; en: string }>(x: T, lang: Lang): string {
  return x[lang];
}

export const TOOL_META: Record<ToolKey, {
  title: { zh: string; en: string };
  intro: { zh: string; en: string };
  audience: { zh: string; en: string };
  emoji: string;
  path: string;
}> = {
  pc: {
    title: { zh: "电脑装机配置器", en: "PC Builder" },
    intro: { zh: "配置办公、游戏、剪辑、AI 工作站等多种用途的电脑，实时计算预算与建议。", en: "Configure PCs for office, gaming, editing, AI workstation and more with real-time budget." },
    audience: { zh: "家庭 · 办公 · 创作者", en: "Home · Office · Creators" },
    emoji: "🖥️",
    path: "/tools/solution-builder/pc",
  },
  nas: {
    title: { zh: "NAS 与私有云配置器", en: "NAS & Private Cloud Builder" },
    intro: { zh: "计算 RAID 可用容量、备份预算与网络需求，适合家庭与小型企业。", en: "Compute RAID usable capacity, backup budget and networking needs." },
    audience: { zh: "家庭 · 小型企业", en: "Home · Small Business" },
    emoji: "🗄️",
    path: "/tools/solution-builder/nas",
  },
  "home-network": {
    title: { zh: "家庭网络与 Wi-Fi 规划器", en: "Home Network Planner" },
    intro: { zh: "根据面积、楼层、设备数量推荐 Mesh 节点、AP、交换机与安装预算。", en: "Recommend Mesh, APs, switches and installation budget based on home layout." },
    audience: { zh: "家庭 · 别墅 · 办公室", en: "Home · Villa · Office" },
    emoji: "📶",
    path: "/tools/solution-builder/home-network",
  },
  "full-solution": {
    title: { zh: "家庭与企业完整方案组合器", en: "Complete Solution Builder" },
    intro: { zh: "将网络、NAS、办公、安防等多个模块合并为一份完整项目方案。", en: "Combine network, NAS, office and security modules into one complete project." },
    audience: { zh: "全套项目", en: "End-to-end Project" },
    emoji: "🧩",
    path: "/tools/solution-builder/full-solution",
  },
};
