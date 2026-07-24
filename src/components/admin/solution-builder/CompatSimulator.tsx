// Solution Builder — Compatibility Rules Simulator (M12)
// 从已有方案或手工输入 items 出发，跑完整/前缀过滤的规则并显示每条命中/通过状态。
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin";
import { toast } from "sonner";
import { Play, Beaker } from "lucide-react";
import {
  sbAdminListSolutions,
  sbAdminGetSolution,
  sbAdminSimulateCompat,
} from "@/lib/solution-builder.functions";
import type { LineItem } from "@/lib/solution-builder/types";

type SimItem = { id: string; category: string; qty: number };

const PREFIXES = [
  { value: "", label: "全部规则" },
  { value: "pc.", label: "仅 PC" },
  { value: "nas.", label: "仅 NAS" },
  { value: "net.", label: "仅 网络" },
];

const STATUS_META: Record<string, { label: string; cls: string }> = {
  hit: { label: "HIT", cls: "bg-red-100 text-red-700" },
  pass: { label: "PASS", cls: "bg-emerald-100 text-emerald-700" },
  skipped: { label: "SKIPPED", cls: "bg-slate-100 text-slate-500" },
  unsupported: { label: "UNSUPPORTED", cls: "bg-amber-100 text-amber-700" },
};

const SEV_CLS: Record<string, string> = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
};

export function CompatSimulator() {
  const listFn = useServerFn(sbAdminListSolutions);
  const getFn = useServerFn(sbAdminGetSolution);
  const simFn = useServerFn(sbAdminSimulateCompat);

  const [solutionType, setSolutionType] = useState<"pc" | "nas" | "home-network" | "full-solution">("pc");
  const [prefix, setPrefix] = useState<string>("");
  const [items, setItems] = useState<SimItem[]>([]);
  const [computedText, setComputedText] = useState<string>("{}");
  const [configText, setConfigText] = useState<string>("{}");
  const [selectedSolutionId, setSelectedSolutionId] = useState<string>("");

  const solutionsQ = useQuery({
    queryKey: ["admin-sb-solutions", "sim"],
    queryFn: () => listFn({ data: {} }),
  });

  async function loadFromSolution(id: string) {
    if (!id) return;
    try {
      const { row } = await getFn({ data: { id } });
      if (!row) { toast.error("方案不存在"); return; }
      setSolutionType(row.solution_type as typeof solutionType);
      setItems((row.items as LineItem[] ?? []).map((it) => ({
        id: it.id, category: it.category, qty: Number(it.qty) || 1,
      })));
      setComputedText(JSON.stringify(row.computed ?? {}, null, 2));
      setConfigText(JSON.stringify(row.config ?? {}, null, 2));
      toast.success(`已载入 ${row.items?.length ?? 0} 项`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const simM = useMutation({
    mutationFn: async () => {
      let computed: Record<string, unknown> = {};
      let config: Record<string, unknown> = {};
      try { computed = computedText.trim() ? JSON.parse(computedText) : {}; }
      catch { throw new Error("computed JSON 解析失败"); }
      try { config = configText.trim() ? JSON.parse(configText) : {}; }
      catch { throw new Error("config JSON 解析失败"); }
      return simFn({ data: {
        solution_type: solutionType,
        items,
        computed: computed as never,
        config,
        rule_prefix: prefix || undefined,
      } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const results = simM.data?.results ?? [];
  const summary = simM.data?.summary;
  const grouped = useMemo(() => {
    const g: Record<string, typeof results> = { hit: [], pass: [], skipped: [], unsupported: [] };
    for (const r of results) (g[r.status] ??= []).push(r);
    return g;
  }, [results]);

  function updateItem(i: number, patch: Partial<SimItem>) {
    setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, ...patch } : it));
  }
  function removeItem(i: number) {
    setItems((arr) => arr.filter((_, idx) => idx !== i));
  }
  function addItem() {
    setItems((arr) => [...arr, { id: "", category: "", qty: 1 }]);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Beaker className="h-4 w-4 text-blue-600" />
          规则模拟测试台
          <span className="text-xs font-normal text-slate-500">选择已有方案或手动输入 items，测试规则命中情况。</span>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label className="text-xs">方案类型</Label>
            <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[140px]" value={solutionType} onChange={(e) => setSolutionType(e.target.value as typeof solutionType)}>
              <option value="pc">pc</option>
              <option value="nas">nas</option>
              <option value="home-network">home-network</option>
              <option value="full-solution">full-solution</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">规则前缀</Label>
            <select className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm" value={prefix} onChange={(e) => setPrefix(e.target.value)}>
              {PREFIXES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[240px]">
            <Label className="text-xs">从已有方案载入</Label>
            <div className="flex gap-1">
              <select className="h-9 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm" value={selectedSolutionId} onChange={(e) => setSelectedSolutionId(e.target.value)}>
                <option value="">— 选择方案 —</option>
                {(solutionsQ.data?.rows ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.solution_number} · {s.title} ({s.solution_type})</option>
                ))}
              </select>
              <Button size="sm" variant="outline" disabled={!selectedSolutionId} onClick={() => loadFromSolution(selectedSolutionId)}>载入</Button>
            </div>
          </div>
          <Button onClick={() => simM.mutate()} disabled={simM.isPending || items.length === 0}>
            <Play className="h-4 w-4 mr-1" />{simM.isPending ? "运行中…" : "运行规则"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700">Items（{items.length}）</div>
            <Button size="sm" variant="ghost" onClick={addItem}>+ 添加一行</Button>
          </div>
          {items.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">从上方载入方案，或点击「添加一行」手动输入。</div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_140px_70px_auto] gap-1 items-center">
                  <Input className="h-8 text-xs font-mono" placeholder="product id (uuid)" value={it.id} onChange={(e) => updateItem(i, { id: e.target.value })} />
                  <Input className="h-8 text-xs" placeholder="category" value={it.category} onChange={(e) => updateItem(i, { category: e.target.value })} />
                  <Input className="h-8 text-xs" type="number" min={1} value={it.qty} onChange={(e) => updateItem(i, { qty: Number(e.target.value) || 1 })} />
                  <Button size="sm" variant="ghost" className="text-red-500 h-8" onClick={() => removeItem(i)}>×</Button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div>
              <Label className="text-xs">computed (JSON)</Label>
              <Textarea rows={4} className="font-mono text-xs" value={computedText} onChange={(e) => setComputedText(e.target.value)} placeholder='{"totalPowerW": 350}' />
            </div>
            <div>
              <Label className="text-xs">config (JSON)</Label>
              <Textarea rows={4} className="font-mono text-xs" value={configText} onChange={(e) => setConfigText(e.target.value)} placeholder='{"coverage_sqft": 2000}' />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 space-y-3">
          <div className="text-sm font-medium text-slate-700">运行结果</div>
          {!summary ? (
            <EmptyState title="尚未运行" description="填入 items 后点击「运行规则」。" />
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2 text-center">
                {(["hit","pass","skipped","unsupported"] as const).map((k) => (
                  <div key={k} className="rounded-md border py-2">
                    <div className="text-lg font-semibold">{summary[k]}</div>
                    <Badge className={STATUS_META[k].cls + " text-[10px]"}>{STATUS_META[k].label}</Badge>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-slate-500">共 {summary.total} 条规则；产品加载 {simM.data?.products_loaded ?? 0} 个。</div>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {(["hit","unsupported","pass","skipped"] as const).flatMap((section) => grouped[section].map((r, i) => (
                  <div key={`${section}-${i}`} className="rounded-md border p-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={STATUS_META[r.status].cls + " text-[10px]"}>{STATUS_META[r.status].label}</Badge>
                      <Badge className={(SEV_CLS[r.severity] ?? "bg-slate-100 text-slate-500") + " text-[10px]"}>{r.severity}</Badge>
                      <code className="text-[11px] text-slate-600">{r.rule_code}</code>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{r.rule_type}</span>
                      {!r.is_active && <span className="text-[10px] text-slate-400">(已停用)</span>}
                    </div>
                    {(r.message_zh || r.message_en) && (
                      <div className="mt-1 text-slate-600">
                        {r.message_zh && <div>{r.message_zh}</div>}
                        {r.message_en && <div className="text-slate-400">{r.message_en}</div>}
                      </div>
                    )}
                  </div>
                )))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
