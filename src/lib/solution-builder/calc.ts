// Money math + shared calculators. Numbers kept to 2 decimals via cents rounding.
import type { LineItem, SbSettings, Totals } from "./types";

export function money(n: number): number {
  return Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
}

export function formatMoney(n: number, currency = "USD", lang: "zh" | "en" = "zh"): string {
  try {
    return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function computeTotals(
  items: LineItem[],
  settings: Pick<SbSettings, "tax_rate" | "default_service_fee" | "discount_rate">,
  overrides?: { service_fee?: number; discount?: number; monthly?: number; annual?: number }
): Totals {
  const subtotal = money(items.reduce((s, i) => s + i.qty * i.unit_price, 0));
  const install_fees = money(items.reduce((s, i) => s + (i.install_fee ?? 0) * i.qty, 0));
  const service_fee = money((overrides?.service_fee ?? settings.default_service_fee ?? 0) + install_fees);
  const discount = money(overrides?.discount ?? subtotal * (settings.discount_rate ?? 0));
  const taxable = money(subtotal + service_fee - discount);
  const tax_amount = money(taxable * (settings.tax_rate ?? 0));
  const one_time_total = money(taxable + tax_amount);
  const monthly_total = money(overrides?.monthly ?? 0);
  const annual_total = money(overrides?.annual ?? monthly_total * 12);
  return {
    subtotal,
    service_fee,
    tax_rate: settings.tax_rate ?? 0,
    tax_amount,
    discount,
    one_time_total,
    monthly_total,
    annual_total,
  };
}

// RAID capacity — mirrors the NAS calculator in src/lib/calculators/nas.ts
export type RaidLevel = "0" | "1" | "5" | "6" | "10" | "single";
export function raidCapacity(disks: number, sizeTb: number, level: RaidLevel): {
  usable: number; total: number; parity: number; fault: number; note_zh: string; note_en: string;
} {
  const n = Math.max(1, Math.floor(disks));
  const s = Math.max(0, sizeTb);
  const total = money(n * s);
  let usable = 0, fault = 0, note_zh = "", note_en = "";
  switch (level) {
    case "single": usable = total; fault = 0; note_zh = "单盘/JBOD，无冗余"; note_en = "Single/JBOD, no redundancy"; break;
    case "0": usable = total; fault = 0; note_zh = "无冗余，任一盘损坏数据全丢"; note_en = "No redundancy"; break;
    case "1": usable = s; fault = Math.max(0, n - 1); note_zh = "镜像，1 盘容量"; note_en = "Mirror, single-disk capacity"; break;
    case "5": usable = (n - 1) * s; fault = n >= 3 ? 1 : 0; note_zh = "至少 3 盘，可容忍 1 盘故障"; note_en = "Requires ≥3 disks, tolerates 1 failure"; break;
    case "6": usable = (n - 2) * s; fault = n >= 4 ? 2 : 0; note_zh = "至少 4 盘，可容忍 2 盘故障"; note_en = "Requires ≥4 disks, tolerates 2 failures"; break;
    case "10": {
      const pairs = Math.floor(n / 2);
      usable = pairs * s;
      fault = pairs;
      note_zh = "镜像+条带，需偶数盘";
      note_en = "Mirror + stripe, even disks required";
      break;
    }
  }
  usable = money(Math.max(0, usable));
  return { usable, total, parity: money(total - usable), fault, note_zh, note_en };
}

// Very simple home-network planning heuristics
export function planNetwork(input: {
  area_sqft: number; floors: number; devices: number; heavy: boolean; outdoor: boolean;
}): {
  mesh_nodes: number; ap_recommended: number; switch_ports: number; poe_watts: number;
  bandwidth_zh: string; bandwidth_en: string;
} {
  const areaPerNode = input.heavy ? 900 : 1400;
  const nodes = Math.max(1, Math.ceil(input.area_sqft / areaPerNode) + Math.max(0, input.floors - 1));
  const outdoorAp = input.outdoor ? 1 : 0;
  const ports = Math.max(8, Math.ceil(input.devices / 4) + nodes * 2);
  const poe = (nodes + outdoorAp) * 15 + Math.ceil(input.devices / 8) * 6;
  const bw = input.heavy ? { zh: "建议 1 Gbps+ 或更快，支持 4K 与远程办公", en: "Recommend 1 Gbps+ for 4K and remote work" }
                         : { zh: "建议 500 Mbps 或以上宽带", en: "Recommend 500 Mbps+ broadband" };
  return {
    mesh_nodes: nodes,
    ap_recommended: outdoorAp,
    switch_ports: ports,
    poe_watts: poe,
    bandwidth_zh: bw.zh,
    bandwidth_en: bw.en,
  };
}

export function suggestPsu(watts: number): number {
  const overhead = 1.4;
  const bumped = Math.ceil((watts * overhead) / 50) * 50;
  return Math.max(450, bumped);
}

export function estimateCameraStorage(input: {
  cameras: number; hours_per_day: number; retention_days: number; res: "2mp" | "4mp" | "5mp" | "8mp";
}): { total_gb: number; suggested_hdd_tb: number } {
  const gbPerHour = { "2mp": 0.8, "4mp": 1.5, "5mp": 2.0, "8mp": 3.5 }[input.res];
  const gb = input.cameras * input.hours_per_day * input.retention_days * gbPerHour;
  const suggested = Math.max(2, Math.ceil((gb / 1024) * 1.2));
  return { total_gb: money(gb), suggested_hdd_tb: suggested };
}
