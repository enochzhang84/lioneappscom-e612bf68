// 汽车相关计算器
import type { CalculatorConfig } from "./types";

const num = (v: number | string) => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

const FUEL_COST: CalculatorConfig = {
  key: "auto-fuel-cost",
  category: "automotive",
  title: "油费计算器",
  intro: "输入行驶里程、车辆油耗与当前油价，一键估算本次行程需要多少升油、总油费是多少。",
  inputs: [
    { key: "distance", label: "行驶里程", unit: "公里 (km)", defaultValue: 500, step: 1, min: 0, hint: "本次行程总公里数" },
    { key: "consumption", label: "车辆油耗", unit: "L / 100km", defaultValue: 8, step: 0.1, min: 0, hint: "百公里油耗，可查油表或车辆说明书" },
    { key: "price", label: "当前油价", unit: "元 / 升", defaultValue: 7.8, step: 0.01, min: 0, hint: "加油站现价（人民币或本地货币）" },
  ],
  outputs: [
    { key: "liters", label: "预计用油量", unit: "升 (L)", primary: true, format: "auto" },
    { key: "cost", label: "预计油费", unit: "元", primary: true, format: "money" },
    { key: "costPerKm", label: "每公里成本", unit: "元/km", format: "auto" },
  ],
  compute: (v) => {
    const distance = num(v.distance);
    const consumption = num(v.consumption);
    const price = num(v.price);
    const liters = (distance * consumption) / 100;
    const cost = liters * price;
    const costPerKm = distance > 0 ? cost / distance : 0;
    return { liters, cost, costPerKm };
  },
  formulas: [
    "预计用油量 (L) = 里程 (km) × 油耗 (L/100km) ÷ 100",
    "预计油费 = 用油量 (L) × 油价 (元/L)",
    "每公里成本 = 总油费 ÷ 里程",
  ],
  examples: [
    { label: "上海 → 苏州（约 100 km，油耗 7L）", values: { distance: 100, consumption: 7, price: 7.8 } },
    { label: "长途 1000 km，SUV 油耗 10L", values: { distance: 1000, consumption: 10, price: 8.2 } },
  ],
  faqs: [
    { q: "油耗怎么估算？", a: "看仪表盘平均油耗，或用两次加油法：跑一箱油记录里程 (km) ÷ 加油量 (L) × 100 = L/100km。" },
    { q: "美制 MPG 车怎么用？", a: "先用【油耗换算器】把 MPG 转成 L/100km（235.2 ÷ mpg），再填入本工具即可。" },
    { q: "油价单位可以换成美元/加仑吗？", a: "可以，但请先自行换算：1 美制加仑 = 3.7854 L；例如 4 USD/gal ÷ 3.7854 ≈ 1.06 USD/L。" },
  ],
};

export const AUTOMOTIVE_CALCS: CalculatorConfig[] = [FUEL_COST];
