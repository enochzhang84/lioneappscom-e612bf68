// Solution Builder — M13: 客户方案详情内嵌"重跑规则"面板
// 复用 sbAdminSimulateCompat，把方案的 items/config/computed 直接送去仿真。
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { sbAdminSimulateCompat } from "@/lib/solution-builder.functions";
import type { SbSolutionRow, LineItem } from "@/lib/solution-builder/types";

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

type SimResult = {
  rule_code: string;
  rule_type: string;
  severity: string;
  status: string;
  message_zh: string | null;
  message_en: string | null;
  is_active: boolean;
};

export function SolutionCompatPanel({ row, autoRun = false }: { row: SbSolutionRow; autoRun?: boolean }) {
  const simFn = useServerFn(sbAdminSimulateCompat);
  const [filter, setFilter] = useState<"all" | "hit" | "pass" | "skipped" | "unsupported">("all");

  const payload = useMemo(() => ({
    solution_type: row.solution_type as "pc" | "nas" | "home-network" | "full-solution",
    items: (row.items as LineItem[] ?? [])
      .filter((it) => /^[0-9a-f-]{36}$/i.test(it.id))
      .map((it) => ({ id: it.id, category: it.category, qty: Number(it.qty) || 1 })),
    computed: (row.computed ?? {}) as Record<string, number>,
    config: (row.config ?? {}) as Record<string, unknown>,
  }), [row]);

  const sim = useMutation({
    mutationFn: () => simFn({ data: payload }),
    onError: (e: Error) => toast.error(e.message),
  });

  // auto-run first time when opened
  useMemo(() => { if (autoRun && !sim.data && !sim.isPending) sim.mutate(); }, [autoRun]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = (sim.data?.results ?? []) as SimResult[];
  const shown = results.filter((r) => filter === "all" ? true : r.status === filter);
  const s = sim.data?.summary;

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
        <div className="text-xs font-semibold text-slate-600">兼容性规则结果</div>
        <Button size="sm" variant="outline" onClick={() => sim.mutate()} disabled={sim.isPending}>
          <RefreshCw className={`h-3 w-3 mr-1 ${sim.isPending ? "animate-spin" : ""}`} />
          {sim.data ? "重跑规则" : "运行规则"}
        </Button>
      </div>
      {!sim.data && !sim.isPending && (
        <div className="p-4 text-xs text-slate-500">点击"运行规则"以基于当前方案的 items / config / computed 执行完整规则集。</div>
      )}
      {s && (
        <div className="flex flex-wrap gap-2 px-3 py-2 border-b text-xs">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`全部 ${s.total}`} />
          <FilterChip active={filter === "hit"} onClick={() => setFilter("hit")} label={`命中 ${s.hit}`} cls="text-red-700" />
          <FilterChip active={filter === "pass"} onClick={() => setFilter("pass")} label={`通过 ${s.pass}`} cls="text-emerald-700" />
          <FilterChip active={filter === "skipped"} onClick={() => setFilter("skipped")} label={`跳过 ${s.skipped}`} cls="text-slate-500" />
          <FilterChip active={filter === "unsupported"} onClick={() => setFilter("unsupported")} label={`未支持 ${s.unsupported}`} cls="text-amber-700" />
          <span className="ml-auto text-slate-400">已载入产品 {sim.data?.products_loaded ?? 0} 条</span>
        </div>
      )}
      {shown.length > 0 && (
        <ul className="divide-y max-h-[320px] overflow-y-auto">
          {shown.map((r) => (
            <li key={r.rule_code} className="px-3 py-2 text-xs flex items-start gap-2">
              <Badge className={STATUS_META[r.status]?.cls ?? ""} variant="secondary">{STATUS_META[r.status]?.label ?? r.status}</Badge>
              <Badge className={SEV_CLS[r.severity] ?? ""} variant="secondary">{r.severity}</Badge>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[11px] text-slate-500">{r.rule_code} · {r.rule_type}{!r.is_active && " · 已停用"}</div>
                <div className="text-slate-800">{r.message_zh || r.message_en || "—"}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {sim.data && shown.length === 0 && (
        <div className="p-4 text-xs text-slate-500">当前筛选下无结果。</div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, cls }: { active: boolean; onClick: () => void; label: string; cls?: string }) {
  return (
    <button onClick={onClick} className={`px-2 py-0.5 rounded-md border text-xs ${active ? "bg-blue-600 text-white border-blue-600" : `bg-white hover:bg-slate-50 ${cls ?? "text-slate-600"}`}`}>
      {label}
    </button>
  );
}
