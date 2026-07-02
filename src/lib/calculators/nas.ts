// NAS / 存储相关计算器：RAID 容量、传输时间
import type { CalculatorConfig } from "./types";

const RAID: CalculatorConfig = {
  key: "raid-capacity",
  category: "nas",
  title: "RAID 容量计算器",
  intro: "计算不同 RAID 级别下的可用容量、冗余空间及最多可容忍损坏的硬盘数。支持 RAID 0/1/5/6/10。",
  inputs: [
    { key: "disks", label: "硬盘数量", defaultValue: 4, min: 1, max: 64, step: 1 },
    { key: "size", label: "单盘容量", unit: "TB", defaultValue: 4, min: 0.1, step: 0.1 },
    { key: "level", label: "RAID 级别", type: "select", defaultValue: "5", options: [
      { value: "0", label: "RAID 0 (条带、无冗余)" },
      { value: "1", label: "RAID 1 (镜像)" },
      { value: "5", label: "RAID 5 (1 盘奇偶)" },
      { value: "6", label: "RAID 6 (2 盘奇偶)" },
      { value: "10", label: "RAID 10 (镜像+条带)" },
    ] },
  ],
  outputs: [
    { key: "usable", label: "可用容量", unit: "TB", primary: true },
    { key: "total", label: "总物理容量", unit: "TB" },
    { key: "parity", label: "冗余占用", unit: "TB" },
    { key: "fault", label: "可容忍损坏盘数", unit: "盘", format: "int" },
    { key: "note", label: "说明" },
  ],
  compute: (v) => {
    const n = Math.max(1, Math.floor(Number(v.disks) || 0));
    const s = Number(v.size) || 0;
    const total = n * s;
    const level = String(v.level);
    let usable = 0, fault = 0, note = "";
    switch (level) {
      case "0": usable = total; fault = 0; note = "无冗余，任一盘坏数据全丢。"; break;
      case "1": usable = s; fault = n - 1; note = "所有盘镜像，1 盘可用容量。"; break;
      case "5": usable = (n - 1) * s; fault = n >= 3 ? 1 : 0; note = "至少 3 盘。可容忍 1 盘故障。"; break;
      case "6": usable = (n - 2) * s; fault = n >= 4 ? 2 : 0; note = "至少 4 盘。可容忍 2 盘故障。"; break;
      case "10": {
        const pairs = Math.floor(n / 2);
        usable = pairs * s;
        fault = pairs;
        note = "需偶数盘，每对镜像后条带；每对最多坏 1 盘。";
        break;
      }
    }
    return { usable, total, parity: total - usable, fault, note };
  },
  formulas: [
    "RAID 0：容量 = N × S",
    "RAID 1：容量 = S",
    "RAID 5：容量 = (N−1) × S",
    "RAID 6：容量 = (N−2) × S",
    "RAID 10：容量 = (N/2) × S，需偶数盘",
  ],
  examples: [
    { label: "4 × 4TB RAID 5", values: { disks: 4, size: 4, level: "5" } },
    { label: "6 × 8TB RAID 6", values: { disks: 6, size: 8, level: "6" } },
    { label: "4 × 2TB RAID 10", values: { disks: 4, size: 2, level: "10" } },
  ],
  faqs: [
    { q: "RAID 能替代备份吗？", a: "不能。RAID 只防硬盘故障，无法防误删、勒索软件、火灾。备份必须独立。" },
    { q: "为什么可用容量比总容量小？", a: "冗余数据占用了额外空间，用来支持故障恢复。" },
  ],
};

const TRANSFER: CalculatorConfig = {
  key: "transfer-time",
  category: "nas",
  title: "文件传输速度 / 时间计算器",
  intro: "根据文件大小和传输速度，计算完成时间。支持 KB/s、MB/s、Gbps 等常见单位。",
  inputs: [
    { key: "size", label: "文件大小", defaultValue: 100, min: 0, step: 0.01 },
    { key: "sizeUnit", label: "大小单位", type: "select", defaultValue: "GB", options: [
      { value: "MB", label: "MB" }, { value: "GB", label: "GB" }, { value: "TB", label: "TB" },
    ] },
    { key: "speed", label: "传输速度", defaultValue: 100, min: 0.01, step: 0.01 },
    { key: "speedUnit", label: "速度单位", type: "select", defaultValue: "MBps", options: [
      { value: "KBps", label: "KB/s" },
      { value: "MBps", label: "MB/s" },
      { value: "Mbps", label: "Mbps (兆比特/秒)" },
      { value: "Gbps", label: "Gbps (千兆比特/秒)" },
    ] },
  ],
  outputs: [
    { key: "seconds", label: "预计耗时", unit: "秒" },
    { key: "readable", label: "耗时 (可读)", primary: true },
    { key: "mbps", label: "换算带宽", unit: "MB/s" },
  ],
  compute: (v) => {
    const sMul: Record<string, number> = { MB: 1, GB: 1024, TB: 1024 * 1024 };
    const sizeMB = (Number(v.size) || 0) * (sMul[String(v.sizeUnit)] ?? 1);
    const sp = Number(v.speed) || 0;
    // convert speed to MB/s
    let mbps = 0;
    switch (v.speedUnit) {
      case "KBps": mbps = sp / 1024; break;
      case "MBps": mbps = sp; break;
      case "Mbps": mbps = sp / 8; break;
      case "Gbps": mbps = (sp * 1000) / 8; break;
      default: mbps = sp;
    }
    if (mbps <= 0) return { seconds: 0, readable: "-", mbps: 0 };
    const seconds = sizeMB / mbps;
    return { seconds, readable: humanTime(seconds), mbps: Math.round(mbps * 100) / 100 };
  },
  formulas: [
    "秒 = 文件大小 (MB) ÷ 传输速度 (MB/s)",
    "1 MB/s = 8 Mbps；1 Gbps = 125 MB/s（理想）",
  ],
  examples: [
    { label: "10 GB @ 1 Gbps", values: { size: 10, sizeUnit: "GB", speed: 1, speedUnit: "Gbps" } },
    { label: "100 MB @ 10 MB/s", values: { size: 100, sizeUnit: "MB", speed: 10, speedUnit: "MBps" } },
    { label: "1 TB @ 100 MB/s", values: { size: 1, sizeUnit: "TB", speed: 100, speedUnit: "MBps" } },
  ],
  faqs: [
    { q: "为什么实际比理论慢？", a: "网络开销、协议、SSD/HDD 随机 IO、SMB/NFS 元数据都会降低实际速度，约达到理论 60-80%。" },
  ],
};

function humanTime(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "-";
  if (s < 60) return `${Math.round(s * 10) / 10} 秒`;
  const m = s / 60;
  if (m < 60) return `${Math.round(m * 10) / 10} 分钟`;
  const h = m / 60;
  if (h < 48) return `${Math.round(h * 10) / 10} 小时`;
  return `${Math.round((h / 24) * 10) / 10} 天`;
}

export const NAS_CALCS: CalculatorConfig[] = [RAID, TRANSFER];
