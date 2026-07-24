// BuilderShell — 3-column layout with summary, save/share/PDF/submit actions.
import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeft, Download, Save, Share2, Printer, Send, ChevronRight, AlertTriangle, Check, Info, Loader2 } from "lucide-react";
import { SB_STRINGS, bi, type Lang } from "@/lib/solution-builder/i18n";
import { formatMoney, computeTotals } from "@/lib/solution-builder/calc";
import type { LineItem, CompatWarning, SolutionState, ToolKey, SbSettings } from "@/lib/solution-builder/types";
import { sbGetSettings, sbSaveMine, sbSubmitPublic, sbShareMine } from "@/lib/solution-builder.functions";
import { supabase } from "@/integrations/supabase/client";
import { SubmitDialog } from "./SubmitDialog";
import { exportSolutionPdf } from "./pdf";
import { useI18n } from "@/lib/i18n";

type Props = {
  tool: ToolKey;
  toolTitle: { zh: string; en: string };
  toolIntro?: { zh: string; en: string };
  steps: { key: string; label: { zh: string; en: string } }[];
  activeStep?: string;
  onStepChange?: (key: string) => void;
  state: SolutionState;
  monthly?: number;
  annual?: number;
  children: React.ReactNode;
};

export function BuilderShell(props: Props) {
  const { lang } = useI18n();
  const L: Lang = lang === "en" ? "en" : "zh";
  const settingsQ = useQuery({ queryKey: ["sb-settings"], queryFn: () => sbGetSettings() });
  const settings = (settingsQ.data ?? {
    currency: "USD", tax_rate: 0, default_service_fee: 0, margin_rate: 0, discount_rate: 0,
    proposal_validity_days: 30, contact_email: "hello@lioneapps.com", contact_phone: null,
    disclaimer_zh: "", disclaimer_en: "",
  }) as SbSettings;

  const totals = useMemo(
    () => computeTotals(props.state.items, settings, { monthly: props.monthly, annual: props.annual }),
    [props.state.items, settings, props.monthly, props.annual]
  );

  const saveFn = useServerFn(sbSaveMine);
  const submitFn = useServerFn(sbSubmitPublic);
  const shareFn = useServerFn(sbShareMine);

  const [saving, setSaving] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const payload = () => ({
    id: savedId ?? undefined,
    solution_type: props.tool,
    title: props.state.title || props.toolTitle[L],
    language: L,
    currency: settings.currency,
    subtotal: totals.subtotal,
    service_fee: totals.service_fee,
    tax_rate: totals.tax_rate,
    tax_amount: totals.tax_amount,
    discount: totals.discount,
    one_time_total: totals.one_time_total,
    monthly_total: totals.monthly_total,
    annual_total: totals.annual_total,
    items: props.state.items,
    config: props.state.config,
    computed: props.state.computed,
    compat_warnings: props.state.compat_warnings,
    source: "builder" as const,
  });

  async function handleSave() {
    if (!session) {
      // save to localStorage for guests
      try {
        const key = `sb:local:${props.tool}`;
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        list.unshift({ ts: Date.now(), payload: payload() });
        localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
        toast.success(L === "zh" ? "已保存到本浏览器" : "Saved to this browser");
      } catch {
        toast.error(L === "zh" ? "本地保存失败" : "Local save failed");
      }
      return;
    }
    try {
      setSaving(true);
      const r = await saveFn({ data: payload() as never });
      setSavedId(r.id);
      toast.success(L === "zh" ? `已保存 · ${r.solution_number}` : `Saved · ${r.solution_number}`);
    } catch (e) {
      toast.error(String((e as Error).message || e));
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    if (!session || !savedId) {
      toast.info(L === "zh" ? "请先登录并保存方案后再生成分享链接" : "Sign in and save the solution first");
      return;
    }
    try {
      const r = await shareFn({ data: { id: savedId, days: 30 } });
      const url = `${window.location.origin}/tools/solution-builder/s/${r.token}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      toast.success(L === "zh" ? "分享链接已复制（30 天有效）" : "Share link copied (30 days)");
    } catch (e) {
      toast.error(String((e as Error).message || e));
    }
  }

  async function handleExport() {
    setExportBusy(true);
    try {
      await exportSolutionPdf({
        lang: L,
        settings,
        tool: props.tool,
        title: props.state.title || props.toolTitle[L],
        items: props.state.items,
        totals,
        compat: props.state.compat_warnings,
        computed: props.state.computed,
        solutionNumber: null,
      });
    } catch (e) {
      toast.error(String((e as Error).message || e));
    } finally {
      setExportBusy(false);
    }
  }

  async function handleSubmit(form: {
    customer_name: string; customer_email: string; customer_phone: string;
    organization_name: string; customer_city: string; customer_budget: string;
    customer_timeline: string; customer_notes: string;
  }) {
    try {
      const r = await submitFn({
        data: { ...(payload() as never as object), ...form, source: "submission" as const } as never,
      });
      toast.success(L === "zh" ? SB_STRINGS.submitted_zh + ` #${r.solution_number}` : SB_STRINGS.submitted_en + ` #${r.solution_number}`);
      setSubmitOpen(false);
    } catch (e) {
      toast.error(String((e as Error).message || e));
    }
  }

  const actionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="sm" className="-ml-2 shrink-0">
              <Link to="/tools/solution-builder"><ArrowLeft size={14} className="mr-1" /> {L === "zh" ? "方案配置中心" : "Solution Builder"}</Link>
            </Button>
            <span className="text-slate-300">/</span>
            <div className="truncate font-medium text-slate-900">{props.toolTitle[L]}</div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
              {bi(SB_STRINGS.save, L)}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exportBusy || props.state.items.length === 0}>
              {exportBusy ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Download size={14} className="mr-1" />}
              {bi(SB_STRINGS.export_pdf, L)}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer size={14} className="mr-1" /> {bi(SB_STRINGS.print, L)}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} disabled={!savedId}>
              <Share2 size={14} className="mr-1" /> {bi(SB_STRINGS.share, L)}
            </Button>
            <Button size="sm" onClick={() => setSubmitOpen(true)}>
              <Send size={14} className="mr-1" /> {bi(SB_STRINGS.submit, L)}
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 grid gap-6 lg:grid-cols-[220px_1fr_360px]">
        {/* Left nav */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 bg-white rounded-2xl border p-3 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1">
              {L === "zh" ? "配置步骤" : "Steps"}
            </div>
            {props.steps.map((s, i) => {
              const active = props.activeStep === s.key || (!props.activeStep && i === 0);
              return (
                <button
                  key={s.key}
                  onClick={() => props.onStepChange?.(s.key)}
                  className={`w-full text-left flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${active ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <span className={`h-5 w-5 rounded-full text-[11px] flex items-center justify-center ${active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>{i + 1}</span>
                  <span className="truncate">{s.label[L]}</span>
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </button>
              );
            })}
            <div className="border-t mt-3 pt-3 text-[11px] text-slate-400 px-2 leading-relaxed">
              {bi(SB_STRINGS.disclaimer_short, L)}
            </div>
          </div>
        </aside>

        {/* Middle content */}
        <main className="min-w-0">
          {props.toolIntro && (
            <div className="mb-4 text-sm text-slate-600">{props.toolIntro[L]}</div>
          )}
          <div className="bg-white rounded-2xl border p-5 md:p-6">
            {props.children}
          </div>
        </main>

        {/* Right summary */}
        <aside className="hidden lg:block">
          <SummaryCard L={L} totals={totals} items={props.state.items} compat={props.state.compat_warnings} settings={settings} />
        </aside>
      </div>

      {/* Mobile action bar + summary sheet */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t px-3 py-2 flex items-center gap-2" ref={actionsRef}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              {L === "zh" ? "查看摘要" : "Summary"} · {formatMoney(totals.one_time_total, settings.currency, L)}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetTitle>{bi(SB_STRINGS.summary_title, L)}</SheetTitle>
            <div className="mt-3">
              <SummaryCard L={L} totals={totals} items={props.state.items} compat={props.state.compat_warnings} settings={settings} />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>{bi(SB_STRINGS.save, L)}</Button>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={exportBusy}>{bi(SB_STRINGS.export_pdf, L)}</Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>{bi(SB_STRINGS.print, L)}</Button>
                <Button size="sm" onClick={() => setSubmitOpen(true)}>{bi(SB_STRINGS.submit, L)}</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Button size="sm" onClick={() => setSubmitOpen(true)}>{L === "zh" ? "提交" : "Submit"}</Button>
      </div>

      <SubmitDialog open={submitOpen} onOpenChange={setSubmitOpen} lang={L} onSubmit={handleSubmit} />
    </div>
  );
}

function SummaryCard({
  L, totals, items, compat, settings,
}: {
  L: Lang;
  totals: ReturnType<typeof computeTotals>;
  items: LineItem[];
  compat: CompatWarning[];
  settings: SbSettings;
}) {
  const hasErrors = compat.some((c) => c.level === "error");
  const hasNotice = compat.some((c) => c.level === "notice");
  return (
    <div className="lg:sticky lg:top-20 bg-white rounded-2xl border p-4">
      <div className="text-sm font-semibold text-slate-900 mb-3">{bi(SB_STRINGS.summary_title, L)}</div>
      {items.length === 0 ? (
        <div className="text-sm text-slate-400 py-6 text-center">{bi(SB_STRINGS.no_items, L)}</div>
      ) : (
        <ul className="space-y-1.5 max-h-[280px] overflow-y-auto text-sm">
          {items.map((i, idx) => (
            <li key={i.id + idx} className="flex items-start gap-2 py-1 border-b last:border-0 border-slate-100">
              <div className="flex-1 min-w-0">
                <div className="truncate text-slate-800">{L === "zh" ? i.name_zh : i.name_en}</div>
                <div className="text-[11px] text-slate-400">
                  {i.brand && <>{i.brand} · </>}× {i.qty}
                </div>
              </div>
              <div className="text-slate-700 tabular-nums shrink-0">{formatMoney(i.qty * i.unit_price, settings.currency, L)}</div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 border-t pt-3 text-sm space-y-1 tabular-nums">
        <Row label={bi(SB_STRINGS.subtotal, L)} value={formatMoney(totals.subtotal, settings.currency, L)} />
        {totals.service_fee > 0 && <Row label={bi(SB_STRINGS.service_fee, L)} value={formatMoney(totals.service_fee, settings.currency, L)} />}
        {totals.discount > 0 && <Row label={bi(SB_STRINGS.discount, L)} value={"− " + formatMoney(totals.discount, settings.currency, L)} />}
        {totals.tax_amount > 0 && <Row label={`${bi(SB_STRINGS.tax, L)} (${(totals.tax_rate * 100).toFixed(2)}%)`} value={formatMoney(totals.tax_amount, settings.currency, L)} />}
        <div className="flex items-baseline justify-between pt-2 border-t mt-2">
          <div className="text-[11px] uppercase tracking-wider text-slate-500">{bi(SB_STRINGS.one_time_total, L)}</div>
          <div className="text-lg font-semibold text-blue-700">{formatMoney(totals.one_time_total, settings.currency, L)}</div>
        </div>
        {totals.monthly_total > 0 && <Row label={bi(SB_STRINGS.monthly_total, L)} value={formatMoney(totals.monthly_total, settings.currency, L) + "/mo"} />}
        {totals.annual_total > 0 && <Row label={bi(SB_STRINGS.annual_total, L)} value={formatMoney(totals.annual_total, settings.currency, L) + "/yr"} />}
      </div>

      <div className={`mt-3 rounded-lg px-3 py-2 text-xs flex items-start gap-2 ${
        hasErrors ? "bg-red-50 text-red-700" : hasNotice ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
      }`}>
        {hasErrors ? <AlertTriangle size={14} className="mt-0.5" /> : hasNotice ? <Info size={14} className="mt-0.5" /> : <Check size={14} className="mt-0.5" />}
        <div className="flex-1 space-y-0.5">
          {compat.length === 0 && <div>{bi(SB_STRINGS.compat_ok, L)}</div>}
          {compat.map((c, i) => (
            <div key={i}>{L === "zh" ? c.message_zh : c.message_en}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-slate-600">
      <span>{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}
