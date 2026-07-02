import * as React from "react";
import { Copy, Check, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { ConverterConfig, UnitDef } from "@/lib/converters";

type Props = {
  config: ConverterConfig;
  units: UnitDef[];
};

// 格式化：最多 6 位有效数字，去除末尾多余 0；极小/极大用科学计数
function fmt(n: number): string {
  if (!Number.isFinite(n)) return "-";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs < 1e-6 || abs >= 1e12) return n.toExponential(4);
  const s = Number(n.toPrecision(8)).toString();
  return s;
}

export function UnitConverter({ config, units }: Props) {
  const [unitKey, setUnitKey] = React.useState(config.defaultUnit);
  const [raw, setRaw] = React.useState(String(config.defaultValue));
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const value = Number(raw);
  const currentUnit = units.find((u) => u.key === unitKey) ?? units[0];

  const results = React.useMemo(() => {
    if (!Number.isFinite(value)) return units.map((u) => ({ unit: u, val: NaN }));
    const base = currentUnit.toBase(value);
    return units.map((u) => ({ unit: u, val: u.fromBase(base) }));
  }, [value, currentUnit, units]);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
      toast.success("已复制");
    } catch {
      toast.error("复制失败");
    }
  }

  function copyAll() {
    const lines = results.map((r) => `${fmt(r.val)} ${r.unit.symbol} (${r.unit.name})`);
    copy(`${raw} ${currentUnit.symbol} =\n${lines.join("\n")}`, "__all");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10 space-y-8">
      {/* 标题区 */}
      <header>
        <div className="inline-flex items-center gap-2 text-xs text-primary font-medium mb-3">
          <ArrowLeftRight size={12} /> 单位换算
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{config.title}</h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">{config.intro}</p>
      </header>

      {/* 输入卡 */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
        <label className="text-sm font-medium text-foreground/80">输入数值</label>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <Input
            type="number"
            inputMode="decimal"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="请输入数值"
            className="text-lg h-12 flex-1"
          />
          <select
            value={unitKey}
            onChange={(e) => setUnitKey(e.target.value)}
            className="h-12 rounded-md border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring sm:w-44"
          >
            {units.map((u) => (
              <option key={u.key} value={u.key}>{u.name}（{u.symbol}）</option>
            ))}
          </select>
        </div>
      </section>

      {/* 结果表格 */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
          <div className="text-sm font-semibold">换算结果</div>
          <Button size="sm" variant="ghost" onClick={copyAll}>
            {copiedKey === "__all" ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
            复制全部
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {results.map(({ unit, val }) => {
            const isCurrent = unit.key === currentUnit.key;
            const text = fmt(val);
            return (
              <li
                key={unit.key}
                className={`flex items-center justify-between gap-3 px-5 py-3 ${isCurrent ? "bg-primary/5" : ""}`}
              >
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">
                    {unit.name} <span className="text-xs">({unit.symbol})</span>
                    {isCurrent && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">当前输入</span>}
                  </div>
                  <div className="mt-0.5 text-lg font-semibold tabular-nums break-all">
                    {text} <span className="text-sm font-normal text-muted-foreground">{unit.symbol}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copy(`${text} ${unit.symbol}`, unit.key)}
                  className="shrink-0"
                >
                  {copiedKey === unit.key ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 常用示例 */}
      {config.examples.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">常用换算示例</h2>
          <div className="grid sm:grid-cols-3 gap-2">
            {config.examples.map((ex, i) => {
              const u = units.find((x) => x.key === ex.from) ?? units[0];
              return (
                <button
                  key={i}
                  onClick={() => { setUnitKey(u.key); setRaw(String(ex.value)); }}
                  className="text-left px-4 py-3 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition"
                >
                  <div className="text-sm font-medium">{ex.value} {u.symbol}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{u.name} → 全部单位</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 公式说明 */}
      {config.formulas.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">公式说明</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {config.formulas.map((f, i) => (
              <li key={i} className="pl-3 border-l-2 border-primary/40">{f}</li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {config.faqs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">常见问题</h2>
          <div className="space-y-2">
            {config.faqs.map((f, i) => (
              <details key={i} className="rounded-lg border border-border bg-card px-4 py-3 group">
                <summary className="cursor-pointer text-sm font-medium list-none flex items-start justify-between gap-3">
                  <span>{f.q}</span>
                  <span className="text-muted-foreground text-xs mt-0.5 group-open:rotate-45 transition">＋</span>
                </summary>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// 便捷包装：通过 converter key 直接渲染
export function UnitConverterByKey({ configKey }: { configKey: string }) {
  const [state, setState] = React.useState<{ config: ConverterConfig; units: UnitDef[] } | { error: string } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const [{ getConverterConfig, getConverterUnits }] = await Promise.all([
        import("@/lib/converters"),
      ]);
      const config = getConverterConfig(configKey);
      if (!config) { if (mounted) setState({ error: `未找到换算配置：${configKey}` }); return; }
      const units = getConverterUnits(config);
      if (!units) { if (mounted) setState({ error: `未定义单位分类：${config.category}` }); return; }
      if (mounted) setState({ config, units });
    })();
    return () => { mounted = false; };
  }, [configKey]);

  if (!state) return <div className="p-10 text-center text-sm text-muted-foreground">加载中…</div>;
  if ("error" in state) return <div className="p-10 text-center text-sm text-destructive">{state.error}</div>;
  return <UnitConverter config={state.config} units={state.units} />;
}
