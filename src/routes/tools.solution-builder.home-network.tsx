import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BuilderShell } from "@/components/solution-builder/BuilderShell";
import { useProducts, useCompatRules, productToLineItem, pickerOptions, pickById } from "@/components/solution-builder/builderHelpers";
import { PartRow, SectionTitle } from "./tools.solution-builder.pc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/lib/i18n";
import { planNetwork } from "@/lib/solution-builder/calc";
import type { CompatWarning, LineItem } from "@/lib/solution-builder/types";
import { evaluateCompat, buildProductMap } from "@/lib/solution-builder/compat";

export const Route = createFileRoute("/tools/solution-builder/home-network")({
  head: () => ({ meta: [
    { title: "家庭网络与 Wi-Fi 规划器 | Lione Apps" },
    { name: "description", content: "根据面积、楼层与设备数量，规划 Mesh 节点、AP、交换机与安装预算。" },
    { property: "og:title", content: "Home Network Planner | Lione Apps" },
    { property: "og:description", content: "Plan Mesh, APs, switches and installation budget for your home or office." },
  ] }),
  component: NetworkBuilder,
});

const CATS = ["net-router", "net-mesh", "net-ap", "net-switch", "net-cable", "ups", "service-install"];

function NetworkBuilder() {
  const { lang } = useLang(); const L = lang === "en" ? "en" : "zh";
  const productsQ = useProducts(CATS);
  const products = productsQ.data?.products;

  const [title, setTitle] = useState(L === "zh" ? "我的家庭网络方案" : "My Home Network Plan");
  const [area, setArea] = useState(1800);
  const [floors, setFloors] = useState(2);
  const [devices, setDevices] = useState(30);
  const [heavy, setHeavy] = useState(true);
  const [outdoor, setOutdoor] = useState(false);

  const plan = useMemo(() => planNetwork({ area_sqft: area, floors, devices, heavy, outdoor }), [area, floors, devices, heavy, outdoor]);

  const [selections, setSelections] = useState<Record<string, { id: string | null; qty: number }>>({
    "net-router": { id: null, qty: 1 },
    "net-mesh": { id: null, qty: plan.mesh_nodes },
    "net-ap": { id: null, qty: 0 },
    "net-switch": { id: null, qty: 1 },
    "net-cable": { id: null, qty: 1 },
    "ups": { id: null, qty: 1 },
    "service-install": { id: null, qty: 1 },
  });

  const items = useMemo<LineItem[]>(() => {
    const out: LineItem[] = [];
    for (const [cat, s] of Object.entries(selections)) {
      const qty = cat === "net-mesh" ? Math.max(0, plan.mesh_nodes) : s.qty;
      if (!s.id || qty <= 0) continue;
      const p = pickById(products, s.id);
      if (p) out.push(productToLineItem(p, qty, cat));
    }
    return out;
  }, [selections, products, plan.mesh_nodes]);

  const rulesQ = useCompatRules();
  const warnings = useMemo<CompatWarning[]>(() => {
    const poeLoadW = plan.poe_watts;
    const engine = evaluateCompat(rulesQ.data ?? [], {
      tool: "home-network",
      items,
      productsById: buildProductMap(products),
      computed: { poeLoadW },
    });
    return [
      ...engine,
      { level: "info", message_zh: `建议 Mesh/AP 覆盖 ${plan.mesh_nodes} 节点，交换机端口 ≥ ${plan.switch_ports}`, message_en: `Suggest ${plan.mesh_nodes} Mesh/AP node(s) and switch with ≥ ${plan.switch_ports} ports` },
      { level: "info", message_zh: plan.bandwidth_zh, message_en: plan.bandwidth_en },
      { level: "info", message_zh: "该结果是初步规划建议，不等同于现场无线勘测或专业布线设计。", message_en: "This is a preliminary planning suggestion and does not replace an on-site wireless survey or professional cabling design." },
    ];
  }, [rulesQ.data, products, items, plan]);


  const computed = L === "zh"
    ? { "建议 Mesh 节点": plan.mesh_nodes, "户外 AP": plan.ap_recommended, "交换机端口": plan.switch_ports, "PoE 功率 (W)": plan.poe_watts, "宽带建议": plan.bandwidth_zh }
    : { "Mesh Nodes": plan.mesh_nodes, "Outdoor APs": plan.ap_recommended, "Switch Ports": plan.switch_ports, "PoE Watts": plan.poe_watts, "Bandwidth": plan.bandwidth_en };

  return (
    <BuilderShell
      tool="home-network"
      toolTitle={{ zh: "家庭网络与 Wi-Fi 规划器", en: "Home Network Planner" }}
      toolIntro={{ zh: "输入房屋信息，我们会推荐 Mesh 节点、交换机与安装预算。", en: "Enter your home info, we suggest Mesh nodes, switches and installation budget." }}
      steps={[
        { key: "site", label: { zh: "1. 房屋信息", en: "1. Site" } },
        { key: "usage", label: { zh: "2. 使用需求", en: "2. Usage" } },
        { key: "hw", label: { zh: "3. 设备与服务", en: "3. Equipment & Service" } },
      ]}
      state={{ tool: "home-network", title, config: { area, floors, devices, heavy, outdoor, selections }, items, computed, compat_warnings: warnings }}
    >
      <div className="space-y-8">
        <section>
          <SectionTitle L={L} zh="1. 房屋 / 场地" en="1. Site" />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>{L === "zh" ? "方案名称" : "Name"}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>{L === "zh" ? "房屋面积 (平方英尺)" : "Area (sq ft)"}</Label>
              <Input type="number" min={200} max={20000} value={area} onChange={(e) => setArea(Number(e.target.value) || 0)} className="mt-1" />
            </div>
            <div>
              <Label>{L === "zh" ? "楼层数量" : "Floors"}</Label>
              <Input type="number" min={1} max={5} value={floors} onChange={(e) => setFloors(Number(e.target.value) || 1)} className="mt-1" />
            </div>
            <div>
              <Label>{L === "zh" ? "联网设备数量" : "Connected devices"}</Label>
              <Input type="number" min={1} max={500} value={devices} onChange={(e) => setDevices(Number(e.target.value) || 1)} className="mt-1" />
            </div>
          </div>
        </section>

        <section>
          <SectionTitle L={L} zh="2. 使用需求" en="2. Usage" />
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={heavy} onChange={(e) => setHeavy(e.target.checked)} />
              {L === "zh" ? "远程办公 / 4K 视频 / 游戏" : "Remote work / 4K / gaming"}
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={outdoor} onChange={(e) => setOutdoor(e.target.checked)} />
              {L === "zh" ? "需要户外 / 车库覆盖" : "Outdoor / garage coverage"}
            </label>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div><div className="text-[11px] text-blue-700">{L === "zh" ? "Mesh 节点" : "Mesh"}</div><div className="text-xl font-semibold">{plan.mesh_nodes}</div></div>
              <div><div className="text-[11px] text-blue-700">{L === "zh" ? "户外 AP" : "Outdoor AP"}</div><div className="text-xl font-semibold">{plan.ap_recommended}</div></div>
              <div><div className="text-[11px] text-blue-700">{L === "zh" ? "交换机端口" : "Switch Ports"}</div><div className="text-xl font-semibold">{plan.switch_ports}</div></div>
              <div><div className="text-[11px] text-blue-700">PoE (W)</div><div className="text-xl font-semibold">{plan.poe_watts}</div></div>
            </div>
            <div className="mt-2 text-xs text-blue-800">{L === "zh" ? plan.bandwidth_zh : plan.bandwidth_en}</div>
          </div>
        </section>

        <section>
          <SectionTitle L={L} zh="3. 设备与安装" en="3. Equipment & Installation" />
          <div className="space-y-3">
            <PartRow L={L} label={L === "zh" ? "主路由器" : "Main Router"} products={pickerOptions(products, "net-router")} selectedId={selections["net-router"].id} qty={selections["net-router"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "net-router": { id, qty } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "Mesh 节点 (自动数量)" : "Mesh Nodes (auto qty)"} products={pickerOptions(products, "net-mesh")} selectedId={selections["net-mesh"].id} qty={plan.mesh_nodes}
              onChange={(id) => setSelections(s => ({ ...s, "net-mesh": { id, qty: plan.mesh_nodes } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "AP 无线接入点" : "Wireless AP"} products={pickerOptions(products, "net-ap")} selectedId={selections["net-ap"].id} qty={selections["net-ap"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "net-ap": { id, qty } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "交换机" : "Switch"} products={pickerOptions(products, "net-switch")} selectedId={selections["net-switch"].id} qty={selections["net-switch"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "net-switch": { id, qty } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "网线套装" : "Cable Kit"} products={pickerOptions(products, "net-cable")} selectedId={selections["net-cable"].id} qty={selections["net-cable"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "net-cable": { id, qty } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "UPS 不间断电源" : "UPS"} products={pickerOptions(products, "ups")} selectedId={selections["ups"].id} qty={selections["ups"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "ups": { id, qty } }))} loading={productsQ.isLoading} />
            <PartRow L={L} label={L === "zh" ? "安装与布线服务" : "Installation & Cabling"} products={pickerOptions(products, "service-install")} selectedId={selections["service-install"].id} qty={selections["service-install"].qty}
              onChange={(id, qty) => setSelections(s => ({ ...s, "service-install": { id, qty } }))} loading={productsQ.isLoading} />
          </div>
        </section>
      </div>
    </BuilderShell>
  );
}
