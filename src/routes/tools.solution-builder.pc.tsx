import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BuilderShell } from "@/components/solution-builder/BuilderShell";
import { useProducts, productToLineItem, pickerOptions, pickById } from "@/components/solution-builder/builderHelpers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/lib/i18n";
import type { CompatWarning, LineItem } from "@/lib/solution-builder/types";
import { suggestPsu } from "@/lib/solution-builder/calc";

export const Route = createFileRoute("/tools/solution-builder/pc")({
  head: () => ({ meta: [
    { title: "电脑装机配置器 · PC Builder | Lione Apps" },
    { name: "description", content: "配置办公、游戏、剪辑与 AI 工作站电脑，实时计算预算、功耗与电源建议。" },
    { property: "og:title", content: "PC Builder | Lione Apps" },
    { property: "og:description", content: "Configure PCs for office, gaming, editing and AI workstation with real-time budget." },
  ] }),
  component: PcBuilder,
});

const CATS = ["pc-cpu","pc-mb","pc-gpu","pc-ram","pc-ssd","pc-hdd","pc-psu","pc-case","pc-cooler","pc-os","service-install"];

const USE_CASES = [
  { key: "office", zh: "家庭 / 普通办公", en: "Home / Office" },
  { key: "gaming", zh: "游戏电脑", en: "Gaming" },
  { key: "editing", zh: "视频剪辑 / 平面设计", en: "Video / Design" },
  { key: "dev", zh: "软件开发", en: "Development" },
  { key: "ai", zh: "AI 工作站", en: "AI Workstation" },
];

function PcBuilder() {
  const { lang } = useLang(); const L = lang === "en" ? "en" : "zh";
  const productsQ = useProducts(CATS, "pc");
  const products = productsQ.data?.products;

  const [useCase, setUseCase] = useState("office");
  const [title, setTitle] = useState(L === "zh" ? "我的电脑方案" : "My PC Build");
  const [selections, setSelections] = useState<Record<string, { id: string | null; qty: number }>>({
    "pc-cpu": { id: null, qty: 1 },
    "pc-mb": { id: null, qty: 1 },
    "pc-gpu": { id: null, qty: 1 },
    "pc-ram": { id: null, qty: 1 },
    "pc-ssd": { id: null, qty: 1 },
    "pc-hdd": { id: null, qty: 0 },
    "pc-psu": { id: null, qty: 1 },
    "pc-case": { id: null, qty: 1 },
    "pc-cooler": { id: null, qty: 1 },
    "pc-os": { id: null, qty: 1 },
    "service-install": { id: null, qty: 1 },
  });


  const items = useMemo<LineItem[]>(() => {
    const out: LineItem[] = [];
    for (const [cat, s] of Object.entries(selections)) {
      if (!s.id || s.qty <= 0) continue;
      const p = pickById(products, s.id);
      if (p) out.push(productToLineItem(p, s.qty, cat));
    }
    return out;
  }, [selections, products]);

  const { totalPower, suggestedPsu, ramTotal, storageTotal } = useMemo(() => {
    let power = 0, ram = 0, storage = 0;
    for (const [cat, s] of Object.entries(selections)) {
      if (!s.id || s.qty <= 0) continue;
      const p = pickById(products, s.id);
      if (!p) continue;
      const specs = p.specs as Record<string, any>;
      const tdp = Number(specs.tdp_w) || 0;
      power += tdp * s.qty;
      if (cat === "pc-ram") ram += (Number(specs.capacity_gb) || 0) * s.qty;
      if (cat === "pc-ssd" || cat === "pc-hdd") storage += (Number(specs.capacity_tb) || 0) * s.qty;
    }
    return { totalPower: power, suggestedPsu: suggestPsu(power), ramTotal: ram, storageTotal: storage };
  }, [selections, products]);

  const warnings = useMemo<CompatWarning[]>(() => {
    const w: CompatWarning[] = [];
    const cpu = pickById(products, selections["pc-cpu"].id);
    const mb = pickById(products, selections["pc-motherboard"].id);
    const psu = pickById(products, selections["pc-psu"].id);
    if (cpu && mb) {
      const cpuSocket = (cpu.specs as any).socket;
      const mbSocket = (mb.specs as any).socket;
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        w.push({ level: "error", message_zh: `CPU 接口 ${cpuSocket} 与主板 ${mbSocket} 不兼容`, message_en: `CPU socket ${cpuSocket} does not match motherboard ${mbSocket}` });
      }
    }
    if (psu) {
      const w1 = Number((psu.specs as any).wattage) || 0;
      if (w1 && w1 < suggestedPsu) {
        w.push({ level: "notice", message_zh: `建议电源 ≥ ${suggestedPsu}W，当前 ${w1}W`, message_en: `Recommended PSU ≥ ${suggestedPsu}W, current ${w1}W` });
      }
    }
    if (!cpu || !mb || !psu) {
      w.push({ level: "notice", message_zh: "信息不足，需要采购前再次确认。", message_en: "Insufficient information. Final compatibility must be confirmed before purchase." });
    }

    return w;
  }, [selections, products, suggestedPsu]);

  const computed = {
    ...(L === "zh"
      ? { "使用场景": USE_CASES.find(u => u.key === useCase)?.zh, "预计功耗 (W)": totalPower, "建议电源 (W)": suggestedPsu, "内存总量 (GB)": ramTotal, "存储总量 (TB)": storageTotal }
      : { "Use Case": USE_CASES.find(u => u.key === useCase)?.en, "Estimated Power (W)": totalPower, "Suggested PSU (W)": suggestedPsu, "RAM Total (GB)": ramTotal, "Storage Total (TB)": storageTotal }),
  };

  return (
    <BuilderShell
      tool="pc"
      toolTitle={{ zh: "电脑装机配置器", en: "PC Builder" }}
      toolIntro={{ zh: "选择用途和硬件，实时计算预算、功耗与建议电源。", en: "Pick use case and components; see live budget, power draw and PSU recommendation." }}
      steps={[
        { key: "usage", label: { zh: "1. 使用场景", en: "1. Use Case" } },
        { key: "hardware", label: { zh: "2. 硬件配置", en: "2. Hardware" } },
        { key: "service", label: { zh: "3. 服务", en: "3. Service" } },
      ]}
      state={{ tool: "pc", title, config: { useCase, selections }, items, computed, compat_warnings: warnings }}
    >
      <div className="space-y-8">
        <section>
          <SectionTitle L={L} zh="1. 使用场景与名称" en="1. Use Case & Name" />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{L === "zh" ? "方案名称" : "Solution name"}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className="mt-1" />
            </div>
            <div>
              <Label>{L === "zh" ? "使用场景" : "Use case"}</Label>
              <select
                className="mt-1 w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
              >
                {USE_CASES.map((u) => <option key={u.key} value={u.key}>{L === "zh" ? u.zh : u.en}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle L={L} zh="2. 硬件配置" en="2. Hardware" />
          <div className="space-y-3">
            {CATS.filter(c => c !== "service-install").map((cat) => (
              <PartRow
                key={cat}
                L={L}
                label={CAT_LABEL[cat][L]}
                products={pickerOptions(products, cat)}
                selectedId={selections[cat].id}
                qty={selections[cat].qty}
                onChange={(id, qty) => setSelections((s) => ({ ...s, [cat]: { id, qty } }))}
                loading={productsQ.isLoading}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle L={L} zh="3. 组装与安装服务" en="3. Assembly & Installation" />
          <PartRow
            L={L}
            label={{ zh: "组装与系统安装服务", en: "Assembly & OS Installation" }[L]}
            products={pickerOptions(products, "service-install")}
            selectedId={selections["service-install"].id}
            qty={selections["service-install"].qty}
            onChange={(id, qty) => setSelections((s) => ({ ...s, "service-install": { id, qty } }))}
            loading={productsQ.isLoading}
          />
        </section>
      </div>
    </BuilderShell>
  );
}

const CAT_LABEL: Record<string, { zh: string; en: string }> = {
  "pc-cpu": { zh: "CPU 处理器", en: "CPU" },
  "pc-motherboard": { zh: "主板", en: "Motherboard" },
  "pc-gpu": { zh: "显卡", en: "GPU" },
  "pc-ram": { zh: "内存", en: "RAM" },
  "pc-ssd": { zh: "SSD 固态硬盘", en: "SSD" },
  "pc-hdd": { zh: "机械硬盘 (可选)", en: "HDD (optional)" },
  "pc-psu": { zh: "电源", en: "PSU" },
  "pc-case": { zh: "机箱", en: "Case" },
  "pc-cooler": { zh: "CPU 散热", en: "CPU Cooler" },
  "pc-os": { zh: "操作系统", en: "OS" },
};

export function SectionTitle({ L, zh, en }: { L: "zh" | "en"; zh: string; en: string }) {
  return <h3 className="text-sm font-semibold text-slate-900 mb-3 pb-1 border-b">{L === "zh" ? zh : en}</h3>;
}

export function PartRow({
  L, label, products, selectedId, qty, onChange, loading,
}: {
  L: "zh" | "en";
  label: string;
  products: import("@/lib/solution-builder/types").SbProduct[];
  selectedId: string | null;
  qty: number;
  onChange: (id: string | null, qty: number) => void;
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_100px] gap-2 items-start md:items-center">
      <Label className="text-slate-700">{label}</Label>
      <select
        className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
        value={selectedId ?? ""}
        onChange={(e) => onChange(e.target.value || null, qty > 0 ? qty : 1)}
        disabled={loading}
      >
        <option value="">{L === "zh" ? (loading ? "载入中…" : "不选择") : (loading ? "Loading…" : "None")}</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {(L === "zh" ? p.name_zh : p.name_en) + " · " + new Intl.NumberFormat(L === "zh" ? "zh-CN" : "en-US", { style: "currency", currency: p.currency }).format(Number(p.list_price))}
          </option>
        ))}
      </select>
      <Input type="number" min={0} max={16} value={qty} onChange={(e) => onChange(selectedId, Math.max(0, Math.min(16, Number(e.target.value) || 0)))} className="w-full" />
    </div>
  );
}
