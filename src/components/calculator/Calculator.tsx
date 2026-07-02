import * as React from "react";
import { Copy, Check, Calculator as CalcIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { CalculatorConfig, CalcOutput } from "@/lib/calculators/types";

function fmt(n: number, out: CalcOutput): string {
  if (!Number.isFinite(n)) return "-";
  if (out.format === "int") return Math.round(n).toLocaleString("zh-CN");
  if (out.format === "money") {
    return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-4 || abs >= 1e12)) return n.toExponential(4);
  const rounded = Math.round(n * 10000) / 10000;
  return rounded.toLocaleString("zh-CN", { maximumFractionDigits: 4 });
}

function defaultsOf(config: CalculatorConfig) {
  const v: Record<string, number | string> = {};
  for (const f of config.inputs) v[f.key] = f.defaultValue ?? (f.type === "select" ? (f.options?.[0]?.value ?? "") : 0);
  return v;
}

export function Calculator({ config }: { config: CalculatorConfig }) {
  const [values, setValues] = React.useState<Record<string, number | string>>(() => defaultsOf(config));
  const [copied, setCopied] = React.useState<string | null>(null);

  const results = React.useMemo(() => {
    try { return config.compute(values); } catch { return {} as Record<string, number | string>; }
  }, [config, values]);

  function set(key: string, val: string) {
    setValues((s) => ({ ...s, [key]: val }));
  }
  function reset() { setValues(defaultsOf(config)); }
  function loadExample(vs: Record<string, number | string>) { setValues({ ...defaultsOf(config), ...vs }); }

  async function copy(text: string, tag: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied((k) => (k === tag ? null : k)), 1200);
      toast.success("已复制");
    } catch { toast.error("复制失败"); }
  }

  function copyAll() {
    const lines = config.outputs.map((o) => {
      const raw = results[o.key];
      const val = typeof raw === "number" ? fmt(raw, o) : String(raw ?? "-");
      return `${o.label}：${val}${o.unit ? " " + o.unit : ""}`;
    });
    copy(lines.join("\n"), "__all");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10 space-y-8">
      <header>
        <div className="inline-flex items-center gap-2 text-xs text-primary font-medium mb-3">
          <CalcIcon size={12} /> 计算器
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{config.title}</h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">{config.intro}</p>
      </header>

      {/* 输入卡 */}
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">输入参数</div>
          <Button size="sm" variant="ghost" onClick={reset}><RotateCcw size={14} className="mr-1" />重置</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {config.inputs.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">
                {f.label}
                {f.unit && <span className="ml-1 text-xs text-muted-foreground">({f.unit})</span>}
              </label>
              {f.type === "select" && f.options ? (
                <select
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <Input
                  type="number"
                  inputMode="decimal"
                  step={f.step ?? "any"}
                  min={f.min}
                  max={f.max}
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="h-11"
                />
              )}
              {f.hint && <div className="text-xs text-muted-foreground">{f.hint}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* 结果卡 */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
          <div className="text-sm font-semibold">计算结果</div>
          <Button size="sm" variant="ghost" onClick={copyAll}>
            {copied === "__all" ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
            复制全部
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {config.outputs.map((o) => {
            const raw = results[o.key];
            const val = typeof raw === "number" ? fmt(raw, o) : String(raw ?? "-");
            const copyText = `${val}${o.unit ? " " + o.unit : ""}`;
            return (
              <li key={o.key} className={`flex items-center justify-between gap-3 px-5 py-3 ${o.primary ? "bg-primary/5" : ""}`}>
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">
                    {o.label}
                    {o.primary && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">主要结果</span>}
                  </div>
                  <div className="mt-0.5 text-lg font-semibold tabular-nums break-all">
                    {val} {o.unit && <span className="text-sm font-normal text-muted-foreground">{o.unit}</span>}
                  </div>
                  {o.hint && <div className="text-xs text-muted-foreground mt-0.5">{o.hint}</div>}
                </div>
                <Button size="sm" variant="ghost" className="shrink-0" onClick={() => copy(copyText, o.key)}>
                  {copied === o.key ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 示例 */}
      {config.examples && config.examples.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">常用示例</h2>
          <div className="grid sm:grid-cols-3 gap-2">
            {config.examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => loadExample(ex.values)}
                className="text-left px-4 py-3 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition"
              >
                <div className="text-sm font-medium">{ex.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">一键填入参数</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 公式 */}
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
      {config.faqs && config.faqs.length > 0 && (
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

// 便捷包装：通过 calculator key 直接渲染
export function CalculatorByKey({ configKey }: { configKey: string }) {
  const [state, setState] = React.useState<{ config: CalculatorConfig } | { error: string } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { getCalculatorConfig } = await import("@/lib/calculators");
      const config = getCalculatorConfig(configKey);
      if (!config) { if (mounted) setState({ error: `未找到计算器配置：${configKey}` }); return; }
      if (mounted) setState({ config });
    })();
    return () => { mounted = false; };
  }, [configKey]);

  if (!state) return <div className="p-10 text-center text-sm text-muted-foreground">加载中…</div>;
  if ("error" in state) return <div className="p-10 text-center text-sm text-destructive">{state.error}</div>;
  return <Calculator config={state.config} />;
}
