// Compatibility rules engine — evaluates DB-driven rules against builder state.
import type { CompatRule, CompatWarning, LineItem, SbProduct, ToolKey } from "./types";

export type CompatContext = {
  tool: ToolKey;
  items: LineItem[];
  productsById: Map<string, SbProduct>;
  /** derived numbers exposed by each builder */
  computed?: {
    totalPowerW?: number;      // sum of TDPs (PC)
    diskCount?: number;         // nas
    raidLevel?: string;         // nas
    poeLoadW?: number;          // network total device draw
  };
};

type Handler = (rule: CompatRule, ctx: CompatContext) => CompatWarning | null;

function warn(rule: CompatRule, msg: { zh: string; en: string }): CompatWarning {
  const level = rule.severity === "error" ? "error" : rule.severity === "warning" ? "warning" : "info";
  return {
    level,
    rule_code: rule.rule_code,
    message_zh: rule.message_zh || msg.zh,
    message_en: rule.message_en || msg.en,
  };
}

function specs(p?: SbProduct): Record<string, unknown> {
  return (p?.specs as Record<string, unknown>) ?? {};
}

function findByCat(ctx: CompatContext, cat: string): SbProduct | undefined {
  for (const it of ctx.items) {
    if (it.category === cat) {
      const p = ctx.productsById.get(it.id);
      if (p) return p;
    }
  }
  return undefined;
}

function findAllByCatPrefix(ctx: CompatContext, prefix: string): SbProduct[] {
  const out: SbProduct[] = [];
  for (const it of ctx.items) {
    if (it.category.startsWith(prefix)) {
      const p = ctx.productsById.get(it.id);
      if (p) out.push(p);
    }
  }
  return out;
}

const HANDLERS: Record<string, Handler> = {
  "pc.socket_match": (rule, ctx) => {
    const cpu = findByCat(ctx, "pc-cpu");
    const mb = findByCat(ctx, "pc-mb");
    if (!cpu || !mb) return null;
    const a = String(specs(cpu).socket ?? "");
    const b = String(specs(mb).socket ?? "");
    if (a && b && a !== b) {
      return warn(rule, {
        zh: `CPU 插槽 ${a} 与主板 ${b} 不匹配`,
        en: `CPU socket ${a} does not match motherboard ${b}`,
      });
    }
    return null;
  },
  "pc.ram_type_match": (rule, ctx) => {
    const mb = findByCat(ctx, "pc-mb");
    const rams = findAllByCatPrefix(ctx, "pc-ram");
    if (!mb || rams.length === 0) return null;
    const mbType = String(specs(mb).memory_type ?? "").toUpperCase();
    for (const r of rams) {
      const rt = String(specs(r).type ?? specs(r).memory_type ?? "").toUpperCase();
      if (mbType && rt && !rt.startsWith(mbType) && !mbType.startsWith(rt)) {
        return warn(rule, {
          zh: `内存 ${rt} 与主板 ${mbType} 不匹配`,
          en: `Memory ${rt} does not match motherboard ${mbType}`,
        });
      }
    }
    return null;
  },
  "pc.psu_headroom": (rule, ctx) => {
    const psu = findByCat(ctx, "pc-psu");
    const load = ctx.computed?.totalPowerW ?? 0;
    if (!psu || load <= 0) return null;
    const w = Number(specs(psu).wattage) || 0;
    const headroom = Number(rule.params.headroom_pct) || 20;
    const need = Math.ceil(load * (1 + headroom / 100));
    if (w && w < need) {
      return warn(rule, {
        zh: `电源 ${w}W 低于建议值 ${need}W（含 ${headroom}% 余量）`,
        en: `PSU ${w}W is below recommended ${need}W (${headroom}% headroom)`,
      });
    }
    return null;
  },
  "pc.gpu_slot": (rule, ctx) => {
    const gpu = findByCat(ctx, "pc-gpu");
    const mb = findByCat(ctx, "pc-mb");
    if (!gpu || !mb) return null;
    const slots = Number(specs(mb).pcie_x16_slots ?? specs(mb).pcie_slots ?? 1);
    if (slots < 1) {
      return warn(rule, {
        zh: `所选主板不具备 PCIe x16 插槽，无法安装独立显卡`,
        en: `Selected motherboard has no PCIe x16 slot for the GPU`,
      });
    }
    return null;
  },
  "pc.cooler_tdp": (rule, ctx) => {
    const cpu = findByCat(ctx, "pc-cpu");
    const cooler = findByCat(ctx, "pc-cooler") ?? findByCat(ctx, "pc-cooler-air") ?? findByCat(ctx, "pc-cooler-aio");
    if (!cpu || !cooler) return null;
    const cpuTdp = Number(specs(cpu).tdp_w) || 0;
    const coolerTdp = Number(specs(cooler).tdp_w) || 0;
    const headroom = Number(rule.params.headroom_w) || 15;
    if (cpuTdp && coolerTdp && coolerTdp < cpuTdp + headroom) {
      return warn(rule, {
        zh: `散热器 ${coolerTdp}W 低于 CPU ${cpuTdp}W + ${headroom}W 建议余量`,
        en: `Cooler ${coolerTdp}W is below CPU ${cpuTdp}W + ${headroom}W headroom`,
      });
    }
    return null;
  },
  "nas.raid_min_bays": (rule, ctx) => {
    const level = String(ctx.computed?.raidLevel ?? "").toUpperCase();
    const disks = ctx.computed?.diskCount ?? 0;
    if (!level || !disks) return null;
    const map = rule.params as Record<string, number>;
    const key = `RAID${level.replace(/[^0-9]/g, "")}` in map ? `RAID${level.replace(/[^0-9]/g, "")}` : level;
    const min = Number(map[key] ?? map[level] ?? 0);
    if (min && disks < min) {
      return warn(rule, {
        zh: `${level} 至少需要 ${min} 块硬盘，当前 ${disks}`,
        en: `${level} requires at least ${min} disks (current ${disks})`,
      });
    }
    return null;
  },
  "nas.recording_cmr": (rule, ctx) => {
    const hdds = findAllByCatPrefix(ctx, "nas-hdd");
    const smr = hdds.filter((h) => String(specs(h).recording ?? "").toUpperCase() === "SMR");
    if (smr.length > 0) {
      return warn(rule, {
        zh: `检测到 ${smr.length} 块 SMR 硬盘，NAS 建议使用 CMR`,
        en: `${smr.length} SMR drive(s) detected; NAS should use CMR`,
      });
    }
    return null;
  },
  "nas.nic_switch_match": (rule, ctx) => {
    const nics = findAllByCatPrefix(ctx, "nas-10gbe");
    if (nics.length === 0) return null;
    const switches = [...findAllByCatPrefix(ctx, "net-switch"), ...findAllByCatPrefix(ctx, "net-poe")];
    const has10g = switches.some((s) => {
      const sp = specs(s);
      return Number(sp.sfp_plus_speed_gbps) >= 10 || Number(sp.port_speed_gbps) >= 10;
    });
    if (!has10g) return warn(rule, { zh: "已配置 10GbE 网卡，但未选择支持 10G 的交换机", en: "10GbE NIC selected but no 10G-capable switch chosen" });
    return null;
  },
  "net.poe_budget": (rule, ctx) => {
    const poeSwitches = findAllByCatPrefix(ctx, "net-poe");
    if (poeSwitches.length === 0) return null;
    const budget = poeSwitches.reduce((s, sw) => s + (Number(specs(sw).poe_budget_w) || 0), 0);
    const load = ctx.computed?.poeLoadW ?? 0;
    const headroom = Number(rule.params.headroom_pct) || 15;
    if (budget > 0 && load > budget * (1 - headroom / 100)) {
      return warn(rule, {
        zh: `PoE 负载 ${Math.round(load)}W 接近或超过预算 ${budget}W`,
        en: `PoE load ${Math.round(load)}W is near or exceeds budget ${budget}W`,
      });
    }
    return null;
  },
  "net.mesh_backhaul": (rule, ctx) => {
    const hasMesh = findByCat(ctx, "net-mesh") || findByCat(ctx, "net-mesh-node");
    const hasSwitch = findByCat(ctx, "net-switch") || findByCat(ctx, "net-poe");
    if (hasMesh && !hasSwitch) return warn(rule, { zh: "已选 Mesh，建议增加交换机以启用有线回程", en: "Mesh selected — add a switch to enable wired backhaul" });
    return null;
  },
  "net.cable_cat": (rule, ctx) => {
    const nics = findAllByCatPrefix(ctx, "nas-10gbe");
    const cables = findAllByCatPrefix(ctx, "net-cable");
    if (nics.length === 0 || cables.length === 0) return null;
    const min = String(rule.params.min_category ?? "Cat6A").toUpperCase();
    const bad = cables.filter((c) => {
      const cat = String(specs(c).category ?? "").toUpperCase();
      return cat && cat < min;
    });
    if (bad.length) return warn(rule, { zh: `10GbE 建议使用 ${min} 及以上网线`, en: `Use ${min} or higher cabling for 10GbE` });
    return null;
  },
};

export function evaluateCompat(rules: CompatRule[], ctx: CompatContext): CompatWarning[] {
  const out: CompatWarning[] = [];
  for (const r of rules) {
    if (!r.is_active) continue;
    const h = HANDLERS[r.rule_type];
    if (!h) continue;
    try {
      const w = h(r, ctx);
      if (w) out.push(w);
    } catch {
      // never let a broken rule crash the builder
    }
  }
  return out;
}

export function buildProductMap(products: SbProduct[] | undefined): Map<string, SbProduct> {
  const m = new Map<string, SbProduct>();
  for (const p of products ?? []) m.set(p.id, p);
  return m;
}
