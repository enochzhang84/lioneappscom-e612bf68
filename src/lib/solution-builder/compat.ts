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
  "nas.ram_ecc": (rule, ctx) => {
    const rams = findAllByCatPrefix(ctx, "nas-ram");
    if (rams.length === 0) return null;
    const nonEcc = rams.filter((r) => !/ecc/i.test(String(specs(r).type ?? specs(r).memory_type ?? "")));
    if (nonEcc.length > 0) {
      return warn(rule, { zh: "NAS 建议使用 ECC 内存以提升数据完整性", en: "ECC memory is recommended for NAS reliability" });
    }
    return null;
  },
  "pc.case_form_factor": (rule, ctx) => {
    const mb = findByCat(ctx, "pc-mb");
    const cs = findByCat(ctx, "pc-case");
    if (!mb || !cs) return null;
    const mbFF = String(specs(mb).form_factor ?? "").toUpperCase();
    const supportRaw = specs(cs).mb_support ?? specs(cs).form_factors ?? specs(cs).supported_form_factors;
    const supports = Array.isArray(supportRaw)
      ? supportRaw.map((x) => String(x).toUpperCase())
      : String(supportRaw ?? "").toUpperCase().split(/[,\s/]+/).filter(Boolean);
    if (mbFF && supports.length > 0 && !supports.includes(mbFF)) {
      return warn(rule, {
        zh: `机箱不支持 ${mbFF} 板型（支持: ${supports.join("/")}）`,
        en: `Case does not support ${mbFF} (supports: ${supports.join("/")})`,
      });
    }
    return null;
  },
  "pc.m2_slot_count": (rule, ctx) => {
    const mb = findByCat(ctx, "pc-mb");
    if (!mb) return null;
    const slots = Number(specs(mb).m2_slots ?? specs(mb).nvme_slots ?? 0);
    const m2s = findAllByCatPrefix(ctx, "pc-ssd-m2").concat(findAllByCatPrefix(ctx, "pc-nvme"));
    const count = m2s.reduce((s, p) => {
      const it = ctx.items.find((i) => i.id === p.id);
      return s + (it?.qty ?? 1);
    }, 0);
    if (slots > 0 && count > slots) {
      return warn(rule, {
        zh: `M.2 硬盘 ${count} 块超过主板 ${slots} 个 M.2 插槽`,
        en: `${count} M.2 SSDs exceed motherboard's ${slots} M.2 slots`,
      });
    }
    return null;
  },
  "pc.gpu_length": (rule, ctx) => {
    const gpu = findByCat(ctx, "pc-gpu");
    const cs = findByCat(ctx, "pc-case");
    if (!gpu || !cs) return null;
    const glen = Number(specs(gpu).length_mm) || 0;
    const cmax = Number(specs(cs).max_gpu_length_mm ?? specs(cs).gpu_max_mm) || 0;
    if (glen && cmax && glen > cmax) {
      return warn(rule, {
        zh: `显卡长度 ${glen}mm 超过机箱允许 ${cmax}mm`,
        en: `GPU ${glen}mm exceeds case max ${cmax}mm`,
      });
    }
    return null;
  },
  "nas.bay_capacity": (rule, ctx) => {
    const host = findByCat(ctx, "nas-host");
    const disks = ctx.computed?.diskCount ?? 0;
    if (!host || !disks) return null;
    const bays = Number(specs(host).drive_bays ?? specs(host).bays) || 0;
    if (bays > 0 && disks > bays) {
      return warn(rule, {
        zh: `硬盘 ${disks} 块超过机身 ${bays} 盘位`,
        en: `${disks} disks exceed the ${bays}-bay chassis`,
      });
    }
    return null;
  },
  "net.ap_coverage": (rule, ctx) => {
    const cfg = (ctx as unknown as { config?: Record<string, unknown> }).config ?? {};
    const area = Number(cfg.coverage_sqft ?? cfg.area_sqft ?? 0);
    if (!area) return null;
    const aps = findAllByCatPrefix(ctx, "net-ap");
    const per = Number(rule.params.sqft_per_ap) || 1500;
    const need = Math.ceil(area / per);
    const have = aps.reduce((s, p) => {
      const it = ctx.items.find((i) => i.id === p.id);
      return s + (it?.qty ?? 1);
    }, 0);
    if (need > have) {
      return warn(rule, {
        zh: `${area} 平方英尺覆盖建议 ${need} 个 AP，当前 ${have}`,
        en: `${area} sqft coverage suggests ${need} APs (current ${have})`,
      });
    }
    return null;
  },
  "net.wifi_gen_for_10g": (rule, ctx) => {
    const has10g = findAllByCatPrefix(ctx, "nas-10gbe").length > 0;
    if (!has10g) return null;
    const routers = [...findAllByCatPrefix(ctx, "net-router"), ...findAllByCatPrefix(ctx, "net-mesh")];
    if (routers.length === 0) return null;
    const minGen = Number(rule.params.min_gen) || 6;
    const ok = routers.some((r) => Number(specs(r).wifi_generation ?? specs(r).wifi_gen ?? 0) >= minGen);
    if (!ok) return warn(rule, {
      zh: `已配置 10GbE，建议 Wi-Fi ${minGen} 及以上路由器`,
      en: `10GbE detected — use Wi-Fi ${minGen}+ routers`,
    });
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

export type CompatRuleResult = {
  rule: CompatRule;
  status: "hit" | "pass" | "skipped" | "unsupported";
  warning: CompatWarning | null;
};

export function evaluateCompatDetailed(rules: CompatRule[], ctx: CompatContext): CompatRuleResult[] {
  const out: CompatRuleResult[] = [];
  for (const r of rules) {
    if (!r.is_active) {
      out.push({ rule: r, status: "skipped", warning: null });
      continue;
    }
    const h = HANDLERS[r.rule_type];
    if (!h) {
      out.push({ rule: r, status: "unsupported", warning: null });
      continue;
    }
    try {
      const w = h(r, ctx);
      out.push({ rule: r, status: w ? "hit" : "pass", warning: w });
    } catch {
      out.push({ rule: r, status: "skipped", warning: null });
    }
  }
  return out;
}

export function buildProductMap(products: SbProduct[] | undefined): Map<string, SbProduct> {
  const m = new Map<string, SbProduct>();
  for (const p of products ?? []) m.set(p.id, p);
  return m;
}
