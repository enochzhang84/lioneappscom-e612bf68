// 存储容量换算：Bit/Byte/KB/MB/GB/TB/PB（十进制 & 二进制）
import type { ConverterConfig } from "./types";

const FORMULAS = [
  "十进制（磁盘厂商）：1 KB = 1,000 B；1 MB = 1,000 KB；1 GB = 1,000 MB",
  "二进制（操作系统）：1 KiB = 1,024 B；1 MiB = 1,024 KiB；1 GiB = 1,024 MiB",
  "1 Byte = 8 bit",
  "所谓「4TB 硬盘只有 3.63TB 可用」= 4×10¹² Byte ÷ 1024³ ≈ 3725 GiB",
];

const FAQS = [
  { q: "为什么买的 1TB 硬盘只显示 931 GB？", a: "硬盘厂商按 10 进制 1TB=10¹² Byte 计算，Windows 按 2 进制 GiB 显示，1TB ≈ 931.32 GiB。" },
  { q: "MB 和 MiB 有什么区别？", a: "MB=1,000,000 B（十进制），MiB=1,048,576 B（二进制）。日常混用，严格场合请区分。" },
  { q: "百兆宽带能下载多快？", a: "100 Mbps ÷ 8 = 12.5 MB/s，理想满速，实际约 10 MB/s。" },
];

function make(key: string, name: string, defaultValue: number): ConverterConfig {
  return {
    key: `storage-${key}`,
    category: "storage",
    title: `${name}容量换算器`,
    intro: `Bit、Byte、KB、MB、GB、TB、PB 一键互换，同时给出十进制 (KB) 与二进制 (KiB) 两种口径。`,
    defaultUnit: key,
    defaultValue,
    examples: [
      { from: key, value: 1 },
      { from: key, value: 100 },
      { from: key, value: 1024 },
    ],
    formulas: FORMULAS,
    faqs: FAQS,
    seo: {
      title: `${name}换算 - Bit/Byte/KB/MB/GB/TB/PB 在线容量换算`,
      description: `免费在线存储容量换算工具，支持 Bit、Byte、KB、MB、GB、TB、PB 及 KiB/MiB/GiB/TiB 十进制与二进制换算。`,
      keywords: `硬盘容量换算, MB 转 GB, GB 转 TB, KiB, MiB, 存储换算`,
    },
  };
}

export const STORAGE_CONFIGS: ConverterConfig[] = [
  make("GB", "GB", 1),
  make("MB", "MB", 100),
  make("TB", "TB", 1),
  make("GiB", "GiB", 1),
];
