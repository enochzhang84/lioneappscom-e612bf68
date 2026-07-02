// 长度换算 —— 8 个单位各一份 ConverterConfig。
// 新单位：只需加一条 config，无需改组件。
import type { ConverterConfig } from "./types";

const COMMON_FAQS = [
  { q: "换算结果保留几位小数？", a: "默认最多显示 6 位有效数字，尾部多余的 0 会自动去掉；结果表格里可直接复制。" },
  { q: "为什么英尺、英寸的结果是无限小数？", a: "英制与公制之间不是整数倍关系（1 英尺 = 0.3048 米），因此换算结果常常是无限小数，我们按国际标准四舍五入显示。" },
  { q: "可以离线使用吗？", a: "本工具全部在浏览器本地计算，不需要网络请求，输入即换算。" },
];

const COMMON_FORMULAS = [
  "1 米 (m) = 100 厘米 = 1000 毫米 = 0.001 公里",
  "1 英尺 (ft) = 0.3048 米 = 12 英寸",
  "1 英寸 (in) = 2.54 厘米",
  "1 码 (yd) = 0.9144 米 = 3 英尺",
  "1 英里 (mile) = 1609.344 米 = 5280 英尺",
];

function make(
  key: string,
  unitName: string,
  unitSymbol: string,
  defaultValue: number,
  extraFaqs: { q: string; a: string }[] = [],
): ConverterConfig {
  const displayUnit = `${unitName}（${unitSymbol}）`;
  return {
    key: `length-${key}`,
    category: "length",
    title: `${unitName}换算器`,
    intro: `支持 ${unitName}、米、英尺、英寸、厘米、毫米、公里、英里、码 之间快速换算。输入任意数值，立即得到全部单位结果。`,
    defaultUnit: key,
    defaultValue,
    examples: [
      { from: key, value: 1 },
      { from: key, value: 10 },
      { from: key, value: 100 },
    ],
    formulas: COMMON_FORMULAS,
    faqs: [...extraFaqs, ...COMMON_FAQS],
    seo: {
      title: `${unitName}换算器 - ${unitName}、米、英尺、英寸、厘米在线换算`,
      description: `免费在线${unitName}换算工具，支持 ${unitName}、米、英尺、英寸、厘米、毫米、公里、英里、码 之间快速换算，输入即结果，一键复制。`,
      keywords: `${unitName}换算, ${unitName}转米, ${unitName}转英尺, 长度换算, 单位换算, ${unitSymbol} converter`,
    },
  };
}

export const LENGTH_CONFIGS: ConverterConfig[] = [
  make("m",    "米",   "m",   1),
  make("ft",   "英尺", "ft",  1, [
    { q: "1 英尺等于多少米？", a: "1 英尺 = 0.3048 米，等于 30.48 厘米，也等于 12 英寸。" },
  ]),
  make("in",   "英寸", "in",  1, [
    { q: "1 英寸等于多少厘米？", a: "1 英寸精确等于 2.54 厘米，这是国际标准定义。" },
  ]),
  make("cm",   "厘米", "cm", 100),
  make("mm",   "毫米", "mm", 1000),
  make("km",   "公里", "km", 1, [
    { q: "1 公里等于多少英里？", a: "1 公里 ≈ 0.621371 英里；反过来 1 英里 ≈ 1.609344 公里。" },
  ]),
  make("mile", "英里", "mile", 1, [
    { q: "1 英里等于多少公里？", a: "1 英里精确等于 1.609344 公里，等于 5280 英尺。" },
  ]),
  make("yd",   "码",   "yd", 1, [
    { q: "1 码等于多少米？", a: "1 码 = 0.9144 米 = 3 英尺，常见于英式测量和布料尺寸。" },
  ]),
];
