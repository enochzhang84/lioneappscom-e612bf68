import * as React from "react";
import { Copy, Check, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type FaqItem = { q: string; a: string };

export function ToolShell({
  title,
  intro,
  icon = "🧰",
  formulas,
  faqs,
  children,
}: {
  title: string;
  intro?: string;
  icon?: string;
  formulas?: string[];
  faqs?: FaqItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10 space-y-8">
      <header>
        <div className="inline-flex items-center gap-2 text-xs text-primary font-medium mb-3">
          <Wrench size={12} /> {icon} 工具
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {intro && (
          <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">{intro}</p>
        )}
      </header>

      {children}

      {formulas && formulas.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">公式 / 说明</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {formulas.map((f, i) => (
              <li key={i} className="pl-3 border-l-2 border-primary/40">{f}</li>
            ))}
          </ul>
        </section>
      )}

      {faqs && faqs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">常见问题</h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
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

export function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  async function onCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      toast.success("已复制");
    } catch {
      toast.error("复制失败");
    }
  }
  return (
    <Button size="sm" variant="outline" onClick={onCopy}>
      {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
      {copied ? "已复制" : label}
    </Button>
  );
}
