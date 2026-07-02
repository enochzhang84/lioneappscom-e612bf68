// 装修计算器：涂料 / 瓷砖 / 地板 / 壁纸
import type { CalculatorConfig } from "./types";

const paint: CalculatorConfig = {
  key: "paint",
  category: "decoration",
  title: "涂料用量计算器",
  intro: "根据涂刷面积、涂布率与损耗率，估算所需涂料升数与桶数（默认按 5L / 桶）。",
  inputs: [
    { key: "area", label: "涂刷面积", unit: "m²", defaultValue: 100, step: 1, min: 0 },
    { key: "coats", label: "涂刷遍数", unit: "遍", defaultValue: 2, step: 1, min: 1 },
    { key: "coverage", label: "涂布率", unit: "m²/L", defaultValue: 10, step: 0.5, min: 0.1, hint: "每升涂料可涂面积，通常 8~12" },
    { key: "loss", label: "损耗率", unit: "%", defaultValue: 10, step: 1, min: 0, hint: "施工损耗，通常 5%~15%" },
    { key: "bucket", label: "桶装规格", unit: "L", defaultValue: 5, step: 1, min: 0.1 },
  ],
  outputs: [
    { key: "liters", label: "所需涂料", unit: "L", primary: true },
    { key: "buckets", label: "推荐桶数", unit: "桶", format: "int" },
    { key: "netArea", label: "总涂刷面积", unit: "m²" },
  ],
  compute: (v) => {
    const area = +v.area, coats = +v.coats, coverage = +v.coverage, loss = +v.loss / 100, bucket = +v.bucket;
    const netArea = area * coats;
    const liters = coverage > 0 ? (netArea / coverage) * (1 + loss) : 0;
    const buckets = bucket > 0 ? Math.ceil(liters / bucket) : 0;
    return { liters, buckets, netArea };
  },
  formulas: [
    "总涂刷面积 = 面积 × 遍数",
    "涂料升数 = 总涂刷面积 ÷ 涂布率 × (1 + 损耗率)",
    "桶数 = 向上取整(升数 ÷ 桶容量)",
  ],
  examples: [
    { label: "100㎡ 两遍", values: { area: 100, coats: 2, coverage: 10, loss: 10, bucket: 5 } },
    { label: "200㎡ 三遍", values: { area: 200, coats: 3, coverage: 10, loss: 10, bucket: 18 } },
  ],
  faqs: [
    { q: "涂布率去哪里查？", a: "涂料罐标签一般会写 “理论涂布率” 或 “覆盖面积”，一般 8~12 m²/L；乳胶漆常见 10 m²/L，底漆 12 m²/L。" },
    { q: "损耗率怎么定？", a: "毛坯墙 10%~15%，平整成品墙 5%~8%；喷涂比滚涂多 5% 左右。" },
  ],
};

const tile: CalculatorConfig = {
  key: "tile",
  category: "decoration",
  title: "瓷砖用量计算器",
  intro: "输入房间面积和瓷砖规格，自动算出需要多少片瓷砖（含损耗）。",
  inputs: [
    { key: "area", label: "铺贴面积", unit: "m²", defaultValue: 20, step: 0.1, min: 0 },
    { key: "l", label: "瓷砖长度", unit: "mm", defaultValue: 800, step: 10, min: 1 },
    { key: "w", label: "瓷砖宽度", unit: "mm", defaultValue: 800, step: 10, min: 1 },
    { key: "loss", label: "损耗率", unit: "%", defaultValue: 8, step: 1, min: 0 },
  ],
  outputs: [
    { key: "pieces", label: "需要片数", unit: "片", primary: true, format: "int" },
    { key: "perPiece", label: "单片面积", unit: "m²" },
    { key: "totalArea", label: "含损耗铺贴面积", unit: "m²" },
  ],
  compute: (v) => {
    const area = +v.area, l = +v.l / 1000, w = +v.w / 1000, loss = +v.loss / 100;
    const perPiece = l * w;
    const totalArea = area * (1 + loss);
    const pieces = perPiece > 0 ? Math.ceil(totalArea / perPiece) : 0;
    return { pieces, perPiece, totalArea };
  },
  formulas: [
    "单片面积 = 长 × 宽 (mm → m)",
    "含损耗面积 = 铺贴面积 × (1 + 损耗率)",
    "需要片数 = 向上取整(含损耗面积 ÷ 单片面积)",
  ],
  examples: [
    { label: "20㎡ 800×800", values: { area: 20, l: 800, w: 800, loss: 8 } },
    { label: "30㎡ 600×600", values: { area: 30, l: 600, w: 600, loss: 8 } },
  ],
  faqs: [
    { q: "损耗率怎么估？", a: "客厅规则铺贴 5%~8%；斜铺、拼花、异形空间 10%~15%。" },
    { q: "要不要留缝？", a: "本工具按名义尺寸算。留缝 1~2mm 已经在 5%~8% 损耗里覆盖。" },
  ],
};

const floor: CalculatorConfig = {
  key: "floor",
  category: "decoration",
  title: "地板用量计算器",
  intro: "输入房间面积和地板规格，估算需要多少片地板（含损耗）。",
  inputs: [
    { key: "area", label: "铺贴面积", unit: "m²", defaultValue: 30, step: 0.1, min: 0 },
    { key: "l", label: "地板长度", unit: "mm", defaultValue: 1200, step: 10, min: 1 },
    { key: "w", label: "地板宽度", unit: "mm", defaultValue: 190, step: 10, min: 1 },
    { key: "loss", label: "损耗率", unit: "%", defaultValue: 8, step: 1, min: 0 },
  ],
  outputs: [
    { key: "pieces", label: "需要片数", unit: "片", primary: true, format: "int" },
    { key: "perPiece", label: "单片面积", unit: "m²" },
    { key: "totalArea", label: "含损耗铺贴面积", unit: "m²" },
  ],
  compute: (v) => {
    const area = +v.area, l = +v.l / 1000, w = +v.w / 1000, loss = +v.loss / 100;
    const perPiece = l * w;
    const totalArea = area * (1 + loss);
    const pieces = perPiece > 0 ? Math.ceil(totalArea / perPiece) : 0;
    return { pieces, perPiece, totalArea };
  },
  formulas: [
    "单片面积 = 长 × 宽 (mm → m)",
    "含损耗面积 = 铺贴面积 × (1 + 损耗率)",
    "需要片数 = 向上取整(含损耗面积 ÷ 单片面积)",
  ],
  examples: [
    { label: "30㎡ 1200×190", values: { area: 30, l: 1200, w: 190, loss: 8 } },
  ],
  faqs: [
    { q: "工字铺 / 人字铺损耗多少？", a: "工字铺约 5%~8%；人字拼、鱼骨拼常见 12%~18%。" },
  ],
};

const wallpaper: CalculatorConfig = {
  key: "wallpaper",
  category: "decoration",
  title: "壁纸用量计算器",
  intro: "根据墙面周长、层高和壁纸卷的规格，估算需要几卷壁纸（含损耗）。",
  inputs: [
    { key: "perimeter", label: "墙面总周长", unit: "m", defaultValue: 20, step: 0.1, min: 0, hint: "四面墙的长度相加，减去门窗宽度" },
    { key: "height", label: "层高", unit: "m", defaultValue: 2.8, step: 0.1, min: 0.1 },
    { key: "rollWidth", label: "卷宽", unit: "m", defaultValue: 0.53, step: 0.01, min: 0.1 },
    { key: "rollLength", label: "卷长", unit: "m", defaultValue: 10, step: 0.5, min: 0.1 },
    { key: "loss", label: "损耗率", unit: "%", defaultValue: 15, step: 1, min: 0, hint: "对花壁纸建议 15%~25%" },
  ],
  outputs: [
    { key: "rolls", label: "需要卷数", unit: "卷", primary: true, format: "int" },
    { key: "strips", label: "所需竖幅数量", unit: "幅", format: "int" },
    { key: "stripsPerRoll", label: "每卷可裁竖幅", unit: "幅", format: "int" },
  ],
  compute: (v) => {
    const perimeter = +v.perimeter, height = +v.height, rw = +v.rollWidth, rl = +v.rollLength, loss = +v.loss / 100;
    const strips = rw > 0 ? Math.ceil((perimeter / rw) * (1 + loss)) : 0;
    const stripsPerRoll = height > 0 ? Math.floor(rl / height) : 0;
    const rolls = stripsPerRoll > 0 ? Math.ceil(strips / stripsPerRoll) : 0;
    return { rolls, strips, stripsPerRoll };
  },
  formulas: [
    "所需竖幅 = 向上取整(墙面周长 ÷ 卷宽 × (1 + 损耗率))",
    "每卷可裁竖幅 = 向下取整(卷长 ÷ 层高)",
    "需要卷数 = 向上取整(所需竖幅 ÷ 每卷竖幅)",
  ],
  examples: [
    { label: "20m × 2.8m 房间", values: { perimeter: 20, height: 2.8, rollWidth: 0.53, rollLength: 10, loss: 15 } },
  ],
  faqs: [
    { q: "为什么向下取整每卷竖幅？", a: "每卷剩下不够一整个层高的边角料一般不能拼在主墙面上，所以按整幅算。" },
  ],
};

export const DECORATION_CALCS: CalculatorConfig[] = [paint, tile, floor, wallpaper];
