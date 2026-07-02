import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { ToolShell, type FaqItem } from "./ToolShell";

export type LookupField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number";
  optional?: boolean;
  hint?: string;
  defaultValue?: string | number;
};

export function LookupTool<T>({
  title, intro, icon, fields, run, render,
  actionLabel = "查询", faqs, howto,
}: {
  title: string;
  intro?: string;
  icon?: string;
  fields: LookupField[];
  run: (values: Record<string, string>) => Promise<T>;
  render: (result: T) => React.ReactNode;
  actionLabel?: string;
  faqs?: FaqItem[];
  howto?: string[];
}) {
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) init[f.key] = f.defaultValue != null ? String(f.defaultValue) : "";
    return init;
  });
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    setLoading(true); setError(null);
    try {
      const r = await run(values);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "查询失败");
      setResult(null);
    } finally { setLoading(false); }
  }

  function copyResult() {
    if (!result) return;
    try {
      const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
      navigator.clipboard.writeText(text);
      toast.success("已复制结果");
    } catch { toast.error("复制失败"); }
  }

  return (
    <ToolShell title={title} intro={intro} icon={icon} faqs={faqs}>
      <section className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={fields.length === 1 ? "sm:col-span-2" : undefined}>
              <label className="block text-sm font-medium mb-1.5">
                {f.label}{f.optional && <span className="ml-1 text-xs text-muted-foreground">（可选）</span>}
              </label>
              <input
                type={f.type ?? "text"}
                value={values[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm"
              />
              {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={submit} disabled={loading}>
            {loading ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Search size={14} className="mr-1.5" />}
            {loading ? "查询中…" : actionLabel}
          </Button>
          {result != null && (
            <Button variant="outline" onClick={copyResult}><Copy size={14} className="mr-1.5" />复制结果</Button>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result != null && (
        <section className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">查询结果</h2>
          {render(result)}
        </section>
      )}

      {howto && howto.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">使用说明</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {howto.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </section>
      )}
    </ToolShell>
  );
}

// ----- shared render helpers -----

export function KV({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr] text-sm">
      {items.filter(([, v]) => v !== undefined && v !== null && v !== "").map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="font-medium break-all">{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

export function CopyIconBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }}
      className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-muted text-muted-foreground"
      aria-label="复制"
    >
      {ok ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}
