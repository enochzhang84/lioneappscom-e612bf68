import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BuilderShell } from "@/components/solution-builder/BuilderShell";
import { useProducts, productToLineItem, pickerOptions, pickById } from "@/components/solution-builder/builderHelpers";
import { PartRow, SectionTitle } from "./tools.solution-builder.pc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/lib/i18n";
import { raidCapacity, type RaidLevel } from "@/lib/solution-builder/calc";
import type { CompatWarning, LineItem } from "@/lib/solution-builder/types";

export const Route = createFileRoute("/tools/solution-builder/nas")({
  head: () => ({ meta: [
    { title: "NAS 与私有云配置器 | Lione Apps" },
    { name: "description", content: "为家庭与小型企业配置 NAS，实时计算 RAID 可用容量、备份预算与网络需求。" },
    { property: "og:title", content: "NAS Builder | Lione Apps" },
    { property: "og:description", content: "Configure a NAS with real-time RAID capacity, backup budget and network needs." },
  ] }),
  component: NasBuilder,
});

const CATS = ["nas-chassis", "nas-drive", "nas-ssd-cache", "nas-ups", "net-switch", "service-install", "service-config"];

const RAID_OPTS: { v: RaidLevel; zh: string; en: string }[] = [
  { v: "single", zh: "单盘 / JBOD", en: "Single / JBOD" },
  { v: "1", zh: "RAID 1 镜像", en: "RAID 1 Mirror" },
  { v: "5", zh: "RAID 5", en: "RAID 5" },
  { v: "6", zh: "RAID 6", en: "RAID 6" },
  { v: "10", zh: "RAID 10", en: "RAID 10" },
];

function NasBuilder() {
  const { lang } = useLang(); const L = lang === "en" ? "en" : "zh";
  const productsQ = useProducts(CATS);
  const products = productsQ.data?.products;

  const [title, setTitle] = useState(L === "zh" ? "我的 NAS 方案" : "My NAS Solution");
  const [diskCount, setDiskCount] = useState(4);
  const [level, setLevel] = useState<RaidLevel>("5");
  const [selections, setSelections] = useState<Record<string, { id: string | null; qty: number }>>({
    "nas-chassis": { id: null, qty: 1 },
    "nas-drive": { id: null, qty: diskCount },
    "nas-ssd-cache": { id: null, qty: 0 },
    "nas-ups": { id: null, qty: 1 },
    "net-switch": { id: null, qty: 0 },
    "service-install": { id: null, qty: 1 },
    "service-config": { id: null, qty: 1 },
  });

  const drive = pickById(products, selections["nas-drive"].id);
  const driveSize = Number((drive?.specs as any)?.capacity_tb) || 4;
  const raid = useMemo(() => raidCapacity(diskCount, driveSize, level), [diskCount, driveSize, level]);

  const items = useMemo<LineItem[]>(() => {
    const out: LineItem[] = [];
    for (const [cat, s] of Object.entries(selections)) {
      const qty = cat === "nas-drive" ? diskCount : s.qty;
      if (!s.id || qty <= 0) continue;
      const p = pickById(products, s.id);
      if (p) out.push(productToLineItem(p, qty, cat));
    }
    return out;
  }, [selections, products, diskCount]);

  const warnings: CompatWarning[] = [];
  if (level === "5" && diskCount < 3) warnings.push({ level: "error", message_zh: "RAID 5 至少需要 3 块硬盘", message_en: "RAID 5 requires at least 3 disks" });
  if (level === "6" && diskCount < 4) warnings.push({ level: "error", message_zh: "RAID 6 至少需要 4 块硬盘", message_en: "RAID 6 requires at least 4 disks" });
  if (level === "10" && diskCount % 2 !== 0) warnings.push({ level: "error", message_zh: "RAID 10 需要偶数硬盘", message_en: "RAID 10 requires an even number of disks" });
  warnings.push({ level: "notice", message_zh: "RAID 不是备份，重要数据仍需建立独立备份。", message_en: "RAID is not a backup. Important data still requires an independent backup." });
  warnings.push({ level: "notice", message_zh: "容量为估算值，实际可用容量因文件系统开销可能略有不同。", message_en: "Capacity is an estimate; actual usable capacity may vary due to filesystem overhead." });


  const computed = L === "zh"
    ? { "RAID 级别": level, "硬盘数量": diskCount, "单盘容量 (TB)": driveSize, "原始总容量 (TB)": raid.total, "可用容量 (TB)": raid.usable, "冗余容量 (TB)": raid.parity, "可容忍损坏盘数": raid.fault, "说明": raid.note_zh }
    : { "RAID Level": level, "Disks": diskCount, "Disk Size (TB)": driveSize, "Total Raw (TB)": raid.total, "Usable (TB)": raid.usable, "Parity (TB)": raid.parity, "Fault Tolerance": raid.fault, "Note": raid.note_en };

  return (
    <BuilderShell
      tool="nas"
      toolTitle={{ zh: "NAS 与私有云配置器", en: "NAS & Private Cloud Builder" }}
      toolIntro={{ zh: "配置 NAS 主机、硬盘和 RAID 级别，自动计算可用容量与预算。", en: "Configure NAS host, disks and RAID level with automatic usable capacity and budget." }}
      steps={[
        { key: "hw", label: { zh: "1. NAS 硬件", en: "1. Hardware" } },
        { key: "raid", label: { zh: "2. RAID 与容量", en: "2. RAID & Capacity" } },
        { key: "svc", label: { zh: "3. 服务", en: "3. Service" } },
      ]}
      state={{ tool: "nas", title, config: { diskCount, level, selections }, items, computed, compat_warnings: warnings }}
    >
      <div className="space-y-8">
        <section>
          <SectionTitle L={L} zh="1. 基本信息" en="1. Basics" />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{L === "zh" ? "方案名称" : "Name"}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" maxLength={100} />
            </div>
          </div>
        </section>

        <section>
          <SectionTitle L={L} zh="2. NAS 硬件" en="2. NAS Hardware" />
          <div className="space-y-3">
            <PartRow L={L} label={L === "zh" ? "NAS 主机 / 机箱" : "NAS Host / Chassis"}
              products={pickerOptions(products, "nas-chassis")} selectedId={selections["nas-chassis"].id} qty={selections["nas-chassis"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "nas-chassis": { id, qty } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "机械硬盘 (单盘)" : "HDD (per disk)"}
              products={pickerOptions(products, "nas-drive")} selectedId={selections["nas-drive"].id} qty={diskCount}
              onChange={(id, qty) => { setSelections(s => ({ ...s, "nas-drive": { id, qty } })); setDiskCount(Math.max(1, qty)); }} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "SSD 缓存 (可选)" : "SSD Cache (optional)"}
              products={pickerOptions(products, "nas-ssd-cache")} selectedId={selections["nas-ssd-cache"].id} qty={selections["nas-ssd-cache"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "nas-ssd-cache": { id, qty } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "UPS 不间断电源" : "UPS"}
              products={pickerOptions(products, "nas-ups")} selectedId={selections["nas-ups"].id} qty={selections["nas-ups"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "nas-ups": { id, qty } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "配套交换机 (可选)" : "Switch (optional)"}
              products={pickerOptions(products, "net-switch")} selectedId={selections["net-switch"].id} qty={selections["net-switch"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "net-switch": { id, qty } }))} loading={productsQ.isLoading} />
          </div>
        </section>

        <section>
          <SectionTitle L={L} zh="3. RAID 与容量" en="3. RAID & Capacity" />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{L === "zh" ? "RAID 级别" : "RAID Level"}</Label>
              <select className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={level} onChange={(e) => setLevel(e.target.value as RaidLevel)}>
                {RAID_OPTS.map((o) => <option key={o.v} value={o.v}>{L === "zh" ? o.zh : o.en}</option>)}
              </select>
            </div>
            <div>
              <Label>{L === "zh" ? "硬盘数量" : "Disk Count"}</Label>
              <Input type="number" min={1} max={24} value={diskCount}
                onChange={(e) => setDiskCount(Math.max(1, Math.min(24, Number(e.target.value) || 1)))} className="mt-1" />
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div><div className="text-[11px] text-blue-700">{L === "zh" ? "原始总容量" : "Total"}</div><div className="text-xl font-semibold">{raid.total} TB</div></div>
              <div><div className="text-[11px] text-blue-700">{L === "zh" ? "可用容量" : "Usable"}</div><div className="text-xl font-semibold">{raid.usable} TB</div></div>
              <div><div className="text-[11px] text-blue-700">{L === "zh" ? "冗余" : "Parity"}</div><div className="text-xl font-semibold">{raid.parity} TB</div></div>
              <div><div className="text-[11px] text-blue-700">{L === "zh" ? "容忍损坏" : "Tolerance"}</div><div className="text-xl font-semibold">{raid.fault}</div></div>
            </div>
            <div className="mt-2 text-xs text-blue-800">{L === "zh" ? raid.note_zh : raid.note_en}</div>
          </div>
        </section>

        <section>
          <SectionTitle L={L} zh="4. 服务" en="4. Service" />
          <div className="space-y-3">
            <PartRow L={L} label={L === "zh" ? "安装配置服务" : "Installation"}
              products={pickerOptions(products, "service-install")} selectedId={selections["service-install"].id} qty={selections["service-install"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "service-install": { id, qty } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "远程访问设置" : "Remote Access Setup"}
              products={pickerOptions(products, "service-config")} selectedId={selections["service-config"].id} qty={selections["service-config"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "service-config": { id, qty } }))} loading={productsQ.isLoading} />
          </div>
        </section>
      </div>
    </BuilderShell>
  );
}
