// 物流计算器：体积重 / 集装箱装载
import type { CalculatorConfig } from "./types";

const dimWeight: CalculatorConfig = {
  key: "dim-weight",
  category: "logistics",
  title: "体积重（材积）计算器",
  intro: "国际快递按 “实际重量” 和 “体积重量” 取较大者计费。填入长宽高与除数（空运通常 6000，快递 5000），即得体积重和计费重。",
  inputs: [
    { key: "l", label: "长", unit: "cm", defaultValue: 40, step: 1, min: 0 },
    { key: "w", label: "宽", unit: "cm", defaultValue: 30, step: 1, min: 0 },
    { key: "h", label: "高", unit: "cm", defaultValue: 20, step: 1, min: 0 },
    { key: "actual", label: "实际重量", unit: "kg", defaultValue: 3, step: 0.1, min: 0 },
    { key: "divisor", label: "体积重除数", type: "select", defaultValue: "5000",
      options: [
        { value: "5000", label: "国际快递 5000 (DHL/FedEx/UPS)" },
        { value: "6000", label: "空运 IATA 6000" },
        { value: "4000", label: "国内快递 4000" },
        { value: "3000", label: "冷链 / 大件 3000" },
      ] },
  ],
  outputs: [
    { key: "billable", label: "计费重量", unit: "kg", primary: true },
    { key: "dim", label: "体积重量", unit: "kg" },
    { key: "volume", label: "体积", unit: "cm³" },
  ],
  compute: (v) => {
    const l = +v.l, w = +v.w, h = +v.h, actual = +v.actual, divisor = +v.divisor;
    const volume = l * w * h;
    const dim = divisor > 0 ? volume / divisor : 0;
    const billable = Math.max(actual, dim);
    return { billable, dim, volume };
  },
  formulas: [
    "体积重 = 长 × 宽 × 高 (cm) ÷ 除数",
    "计费重 = max(实际重量, 体积重)",
  ],
  examples: [
    { label: "40×30×20cm / 3kg", values: { l: 40, w: 30, h: 20, actual: 3, divisor: "5000" } },
    { label: "60×40×40cm / 8kg", values: { l: 60, w: 40, h: 40, actual: 8, divisor: "5000" } },
  ],
  faqs: [
    { q: "为什么要按体积重？", a: "轻抛货占仓位大但很轻，承运方按体积重收费，避免大件轻货亏本。" },
    { q: "6000 和 5000 怎么选？", a: "IATA 空运通用 6000；DHL/FedEx/UPS 国际快递现行 5000（相同体积体积重更大）。" },
  ],
};

const container: CalculatorConfig = {
  key: "container",
  category: "logistics",
  title: "集装箱装载量计算器",
  intro: "根据货物外箱尺寸和集装箱内尺寸，粗略估算最多能装多少件（简单堆叠，不考虑重量与承重）。",
  inputs: [
    { key: "cl", label: "货物长", unit: "cm", defaultValue: 40, step: 1, min: 1 },
    { key: "cw", label: "货物宽", unit: "cm", defaultValue: 30, step: 1, min: 1 },
    { key: "ch", label: "货物高", unit: "cm", defaultValue: 25, step: 1, min: 1 },
    { key: "type", label: "集装箱类型", type: "select", defaultValue: "20gp",
      options: [
        { value: "20gp", label: "20GP (589×235×239 cm)" },
        { value: "40gp", label: "40GP (1203×235×239 cm)" },
        { value: "40hq", label: "40HQ (1203×235×269 cm)" },
        { value: "45hq", label: "45HQ (1358×235×269 cm)" },
      ] },
  ],
  outputs: [
    { key: "pieces", label: "最多装载", unit: "件", primary: true, format: "int" },
    { key: "volumeUsed", label: "货物总体积", unit: "m³" },
    { key: "containerVolume", label: "集装箱容积", unit: "m³" },
    { key: "utilization", label: "装载率", unit: "%" },
  ],
  compute: (v) => {
    const CONT: Record<string, [number, number, number]> = {
      "20gp": [589, 235, 239],
      "40gp": [1203, 235, 239],
      "40hq": [1203, 235, 269],
      "45hq": [1358, 235, 269],
    };
    const [CL, CW, CH] = CONT[String(v.type)] ?? CONT["20gp"];
    const cl = +v.cl, cw = +v.cw, ch = +v.ch;
    // 尝试 6 种朝向，取最大件数
    const dims = [cl, cw, ch];
    const rotations: [number, number, number][] = [
      [dims[0], dims[1], dims[2]],
      [dims[0], dims[2], dims[1]],
      [dims[1], dims[0], dims[2]],
      [dims[1], dims[2], dims[0]],
      [dims[2], dims[0], dims[1]],
      [dims[2], dims[1], dims[0]],
    ];
    let best = 0;
    for (const [a, b, c] of rotations) {
      const n = Math.floor(CL / a) * Math.floor(CW / b) * Math.floor(CH / c);
      if (n > best) best = n;
    }
    const volumeUsed = (cl * cw * ch * best) / 1_000_000;
    const containerVolume = (CL * CW * CH) / 1_000_000;
    const utilization = containerVolume > 0 ? (volumeUsed / containerVolume) * 100 : 0;
    return { pieces: best, volumeUsed, containerVolume, utilization };
  },
  formulas: [
    "件数 = ⌊柜长/箱长⌋ × ⌊柜宽/箱宽⌋ × ⌊柜高/箱高⌋（尝试 6 种朝向取最大）",
    "装载率 = 货物体积 ÷ 集装箱内容积",
  ],
  examples: [
    { label: "40×30×25 → 20GP", values: { cl: 40, cw: 30, ch: 25, type: "20gp" } },
    { label: "60×40×40 → 40HQ", values: { cl: 60, cw: 40, ch: 40, type: "40hq" } },
  ],
  faqs: [
    { q: "结果为什么偏乐观？", a: "本工具做的是 “完美堆叠”，实际会有托盘、绑扎、留缝空间损失，装载率一般再打 85%~90%。" },
    { q: "承重不用考虑吗？", a: "20GP 通常 ≤ 22 吨，40HQ ≤ 27 吨。件数超过时要以承重为准，工具不代替真实配柜。" },
  ],
};

export const LOGISTICS_CALCS: CalculatorConfig[] = [dimWeight, container];
