import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BuilderShell } from "@/components/solution-builder/BuilderShell";
import { useProducts, productToLineItem, pickerOptions, pickById } from "@/components/solution-builder/builderHelpers";
import { SectionTitle } from "./tools.solution-builder.pc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/lib/i18n";
import type { CompatWarning, LineItem } from "@/lib/solution-builder/types";

export const Route = createFileRoute("/tools/solution-builder/full-solution")({
  head: () => ({ meta: [
    { title: "家庭与企业完整方案组合器 | Lione Apps" },
    { name: "description", content: "将家庭网络、NAS、办公、安防、软件与长期支持组合为一份完整项目方案。" },
    { property: "og:title", content: "Complete Solution Builder | Lione Apps" },
    { property: "og:description", content: "Combine network, NAS, office, security, software and ongoing support into one project." },
  ] }),
  component: FullSolutionBuilder,
});

// Modules: pick to include, each brings a rough package price + optional monthly maintenance.
type Module = {
  key: string;
  category: string;
  emoji: string;
  zh: { name: string; desc: string };
  en: { name: string; desc: string };
  one_time: number;
  monthly: number;
};

const MODULES: Module[] = [
  { key: "home-network", category: "package-home-network", emoji: "📶",
    zh: { name: "家庭网络", desc: "Mesh + 交换机 + 布线" },
    en: { name: "Home Network", desc: "Mesh + switch + cabling" },
    one_time: 1200, monthly: 0 },
  { key: "nas", category: "package-nas", emoji: "🗄️",
    zh: { name: "NAS 与备份", desc: "NAS 主机 + 硬盘 + 云备份" },
    en: { name: "NAS & Backup", desc: "NAS + disks + cloud backup" },
    one_time: 1800, monthly: 15 },
  { key: "smart-home", category: "package-smart-home", emoji: "🏠",
    zh: { name: "智能家居", desc: "灯光 + 门锁 + 摄像头基础包" },
    en: { name: "Smart Home", desc: "Lights + lock + camera basics" },
    one_time: 2400, monthly: 0 },
  { key: "media", category: "package-media", emoji: "🎬",
    zh: { name: "家庭影音", desc: "投影 / 电视 + 影音系统" },
    en: { name: "Home Media", desc: "TV/projector + AV system" },
    one_time: 3500, monthly: 0 },
  { key: "cameras", category: "package-cameras", emoji: "🎥",
    zh: { name: "安防摄像头", desc: "4 路 PoE 摄像头 + NVR" },
    en: { name: "Security Cameras", desc: "4× PoE cameras + NVR" },
    one_time: 1400, monthly: 0 },
  { key: "biz-website", category: "package-biz-website", emoji: "🌐",
    zh: { name: "企业网站", desc: "多页面 CMS 网站 + 中英文" },
    en: { name: "Business Website", desc: "Multi-page CMS + bilingual" },
    one_time: 2800, monthly: 39 },
  { key: "biz-software", category: "package-biz-software", emoji: "🧩",
    zh: { name: "定制软件", desc: "基础管理系统起步版" },
    en: { name: "Custom Software", desc: "Starter management system" },
    one_time: 4800, monthly: 79 },
  { key: "support", category: "package-support", emoji: "🛠️",
    zh: { name: "长期技术支持", desc: "月度维护与远程支持" },
    en: { name: "Ongoing Support", desc: "Monthly maintenance & support" },
    one_time: 0, monthly: 129 },
];

function FullSolutionBuilder() {
  const { lang } = useLang(); const L = lang === "en" ? "en" : "zh";
  const productsQ = useProducts(MODULES.map((m) => m.category));
  const products = productsQ.data?.products;

  const [title, setTitle] = useState(L === "zh" ? "完整方案" : "Complete Solution");
  const [picked, setPicked] = useState<Record<string, boolean>>({ "home-network": true, "nas": true, "support": true });

  const items = useMemo<LineItem[]>(() => {
    const out: LineItem[] = [];
    for (const m of MODULES) {
      if (!picked[m.key]) continue;
      // Prefer a DB-configured package product if present
      const pkg = pickerOptions(products, m.category)[0];
      if (pkg) {
        out.push(productToLineItem(pkg, 1, m.category));
      } else {
        out.push({
          id: m.key,
          kind: "product",
          category: m.category,
          name_zh: m.zh.name,
          name_en: m.en.name,
          qty: 1,
          unit_price: m.one_time,
        });
      }
    }
    return out;
  }, [picked, products]);

  const monthly = useMemo(() => MODULES.reduce((s, m) => s + (picked[m.key] ? m.monthly : 0), 0), [picked]);
  const annual = monthly * 12;

  const warnings: CompatWarning[] = [{
    level: "notice",
    message_zh: "完整方案价格为初步组合估算，实际以详细需求为准。",
    message_en: "Complete solution pricing is a preliminary estimate; final pricing depends on detailed requirements.",
  }];

  const computed = L === "zh"
    ? { "已选模块数": Object.values(picked).filter(Boolean).length, "每月订阅 (USD)": monthly, "年度费用 (USD)": annual }
    : { "Modules Selected": Object.values(picked).filter(Boolean).length, "Monthly (USD)": monthly, "Annual (USD)": annual };

  return (
    <BuilderShell
      tool="full-solution"
      toolTitle={{ zh: "家庭与企业完整方案组合器", en: "Complete Solution Builder" }}
      toolIntro={{ zh: "勾选需要的模块，我们会汇总一次性费用与每月订阅。", en: "Pick the modules you need — we sum one-time cost and monthly subscription." }}
      steps={[
        { key: "basic", label: { zh: "1. 基本信息", en: "1. Basics" } },
        { key: "modules", label: { zh: "2. 选择模块", en: "2. Modules" } },
      ]}
      monthly={monthly}
      annual={annual}
      state={{ tool: "full-solution", title, config: { picked }, items, computed, compat_warnings: warnings }}
    >
      <div className="space-y-8">
        <section>
          <SectionTitle L={L} zh="1. 方案信息" en="1. Basics" />
          <div>
            <Label>{L === "zh" ? "方案名称" : "Name"}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 max-w-md" maxLength={100} />
          </div>
        </section>

        <section>
          <SectionTitle L={L} zh="2. 选择模块" en="2. Modules" />
          <div className="grid gap-3 md:grid-cols-2">
            {MODULES.map((m) => {
              const on = !!picked[m.key];
              const dbPkg = pickerOptions(products, m.category)[0];
              const price = dbPkg ? Number(dbPkg.list_price) : m.one_time;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setPicked((p) => ({ ...p, [m.key]: !on }))}
                  className={`text-left rounded-2xl border p-4 transition ${on ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/40" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-lg">{m.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900">{m[L].name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{m[L].desc}</div>
                    </div>
                    <div className={`h-5 w-5 rounded-full border-2 shrink-0 ${on ? "bg-blue-600 border-blue-600" : "border-slate-300"}`} />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">{L === "zh" ? "起步价" : "Starting"}</span>
                    <span className="text-slate-900 font-medium">${price.toLocaleString()}{m.monthly > 0 && <> · <span className="text-slate-500">${m.monthly}/mo</span></>}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </BuilderShell>
  );
}
