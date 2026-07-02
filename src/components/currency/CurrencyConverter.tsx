import * as React from "react";
import { ArrowLeftRight, Copy, Check, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// 免费实时汇率 API（USD base，不需要 key）。
// 文档：https://www.exchangerate-api.com/docs/free
const RATES_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

type RateResp = {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
};

const CURRENCIES: { code: string; label: string; flag?: string }[] = [
  { code: "USD", label: "美元 US Dollar", flag: "🇺🇸" },
  { code: "CNY", label: "人民币 Chinese Yuan", flag: "🇨🇳" },
  { code: "TWD", label: "新台币 Taiwan Dollar", flag: "🇹🇼" },
  { code: "HKD", label: "港币 HK Dollar", flag: "🇭🇰" },
  { code: "EUR", label: "欧元 Euro", flag: "🇪🇺" },
  { code: "JPY", label: "日元 Japanese Yen", flag: "🇯🇵" },
  { code: "KRW", label: "韩元 South Korean Won", flag: "🇰🇷" },
  { code: "GBP", label: "英镑 Pound", flag: "🇬🇧" },
  { code: "CAD", label: "加元 CAD", flag: "🇨🇦" },
  { code: "AUD", label: "澳元 AUD", flag: "🇦🇺" },
  { code: "SGD", label: "新加坡币 SGD", flag: "🇸🇬" },
  { code: "CHF", label: "瑞士法郎 CHF", flag: "🇨🇭" },
];

const LABELS: Record<string, string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.label]),
);

type CurrencyKey =
  | "usd-cny"
  | "usd-twd"
  | "usd-hkd"
  | "eur-usd"
  | "universal";

const PRESETS: Record<Exclude<CurrencyKey, "universal">, { from: string; to: string; title: string; intro: string }> = {
  "usd-cny": {
    from: "USD", to: "CNY",
    title: "美元 / 人民币 汇率换算",
    intro: "实时 USD ↔ CNY 汇率，数据来源 open.er-api.com，每日更新。支持双向换算。",
  },
  "usd-twd": {
    from: "USD", to: "TWD",
    title: "美元 / 新台币 汇率换算",
    intro: "实时 USD ↔ TWD 汇率，输入金额即可自动换算，支持复制结果。",
  },
  "usd-hkd": {
    from: "USD", to: "HKD",
    title: "美元 / 港币 汇率换算",
    intro: "实时 USD ↔ HKD 汇率，数据来源公开 API，非交易报价，仅供参考。",
  },
  "eur-usd": {
    from: "EUR", to: "USD",
    title: "欧元 / 美元 汇率换算",
    intro: "实时 EUR ↔ USD 汇率，支持双向换算与一键复制。",
  },
};

function useRates() {
  const [data, setData] = React.useState<RateResp | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(RATES_ENDPOINT, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as RateResp;
      if (json.result !== "success" || !json.rates?.USD) throw new Error("bad payload");
      setData(json);
    } catch (e) {
      setError("实时汇率暂时不可用，请稍后再试");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);
  return { data, loading, error, reload: load };
}

/** 用 USD 为基准计算 from→to 的汇率 */
function rateOf(rates: Record<string, number>, from: string, to: string): number | null {
  const rf = from === "USD" ? 1 : rates[from];
  const rt = to === "USD" ? 1 : rates[to];
  if (!rf || !rt) return null;
  return rt / rf;
}

function fmtMoney(n: number, code: string) {
  if (!Number.isFinite(n)) return "-";
  const digits = ["JPY", "KRW", "TWD"].includes(code) ? 2 : 4;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: digits });
}
function fmtRate(n: number) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

function Header({ data, loading, error, onReload }: {
  data: RateResp | null; loading: boolean; error: string | null; onReload: () => void;
}) {
  const updated = data?.time_last_update_utc
    ? new Date(data.time_last_update_utc).toLocaleString("zh-CN")
    : "-";
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        {loading ? <Loader2 size={14} className="animate-spin text-primary" /> : null}
        <span>数据来源：open.er-api.com（免费实时汇率，非交易报价）</span>
      </div>
      <div className="flex items-center gap-3">
        <span>更新时间：{updated}</span>
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onReload} disabled={loading}>
          <RefreshCw size={13} className="mr-1" /> 刷新
        </Button>
      </div>
      {error && (
        <div className="w-full flex items-center gap-2 text-amber-700">
          <AlertTriangle size={14} /> {error}
        </div>
      )}
    </div>
  );
}

function ConverterBody({
  fromCode, toCode, allowSwap, onSwap, rates, data,
}: {
  fromCode: string; toCode: string; allowSwap?: boolean; onSwap?: () => void;
  rates: Record<string, number> | undefined; data: RateResp | null;
}) {
  const [amount, setAmount] = React.useState("100");
  const [lastEdited, setLastEdited] = React.useState<"from" | "to">("from");
  const [copied, setCopied] = React.useState(false);

  const rate = rates ? rateOf(rates, fromCode, toCode) : null;
  const inv = rate ? 1 / rate : null;

  const num = Number(amount.replace(/,/g, "")) || 0;
  const converted = rate != null ? (lastEdited === "from" ? num * rate : num / rate) : 0;
  const displayFrom = lastEdited === "from" ? amount : fmtMoney(converted, fromCode);
  const displayTo = lastEdited === "to" ? amount : fmtMoney(converted, toCode);

  async function copyResult() {
    const text = `${displayFrom} ${fromCode} = ${displayTo} ${toCode}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 1400);
      toast.success("已复制换算结果");
    } catch { toast.error("复制失败"); }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            {LABELS[fromCode] || fromCode}（{fromCode}）
          </label>
          <Input
            inputMode="decimal"
            value={displayFrom}
            onChange={(e) => { setLastEdited("from"); setAmount(e.target.value); }}
            className="mt-1 text-lg font-semibold"
          />
        </div>
        <div className="flex justify-center pb-2">
          {allowSwap ? (
            <Button size="sm" variant="outline" onClick={onSwap} title="交换币种">
              <ArrowLeftRight size={14} />
            </Button>
          ) : (
            <ArrowLeftRight size={16} className="text-muted-foreground" />
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            {LABELS[toCode] || toCode}（{toCode}）
          </label>
          <Input
            inputMode="decimal"
            value={displayTo}
            onChange={(e) => { setLastEdited("to"); setAmount(e.target.value); }}
            className="mt-1 text-lg font-semibold"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
        <div className="text-muted-foreground">
          {rate != null ? (
            <>
              <span className="font-semibold text-foreground">1 {fromCode} = {fmtRate(rate)} {toCode}</span>
              <span className="mx-2 text-xs">·</span>
              <span>1 {toCode} = {fmtRate(inv ?? 0)} {fromCode}</span>
            </>
          ) : (
            <span>暂无汇率数据</span>
          )}
        </div>
        <Button size="sm" variant="ghost" className="h-8" onClick={copyResult} disabled={rate == null}>
          {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
          复制结果
        </Button>
      </div>

      {data && (
        <div className="text-xs text-muted-foreground">
          汇率更新：{new Date(data.time_last_update_utc).toLocaleString("zh-CN")} · 基准 USD
        </div>
      )}
    </div>
  );
}

const FAQS = [
  { q: "汇率数据来自哪里？", a: "调用 open.er-api.com 的免费实时接口，每 24 小时更新一次。仅供参考，请以银行/交易所实际报价为准。" },
  { q: "为什么和银行显示的不一样？", a: "银行会加收买卖点差、手续费，实际成交价通常比中间价差 0.3%~2%。本工具展示的是市场中间价。" },
  { q: "支持输入反向金额吗？", a: "支持。任意一侧输入框都可输入，另一侧自动换算。" },
];

function Wrapper({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">{intro}</p>
      </div>
      {children}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">公式说明</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
          <li>API 以 USD 为基准返回各币种汇率 R(x)。</li>
          <li>from → to 汇率 = R(to) ÷ R(from)</li>
          <li>换算结果 = 金额 × 汇率；反向换算 = 金额 ÷ 汇率。</li>
        </ul>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">常见问题</h2>
        <div className="mt-2 divide-y divide-border">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-2">
              <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

function PairConverter({ presetKey }: { presetKey: Exclude<CurrencyKey, "universal"> }) {
  const preset = PRESETS[presetKey];
  const { data, loading, error, reload } = useRates();
  const [fromCode, setFromCode] = React.useState(preset.from);
  const [toCode, setToCode] = React.useState(preset.to);

  return (
    <Wrapper title={preset.title} intro={preset.intro}>
      <Header data={data} loading={loading} error={error} onReload={reload} />
      <ConverterBody
        fromCode={fromCode} toCode={toCode}
        allowSwap
        onSwap={() => { setFromCode(toCode); setToCode(fromCode); }}
        rates={data?.rates} data={data}
      />
    </Wrapper>
  );
}

function UniversalConverter() {
  const { data, loading, error, reload } = useRates();
  const [fromCode, setFromCode] = React.useState("USD");
  const [toCode, setToCode] = React.useState("CNY");

  return (
    <Wrapper
      title="通用汇率换算器"
      intro="支持 12 种主流货币互换（USD/CNY/TWD/HKD/EUR/JPY/KRW/GBP/CAD/AUD/SGD/CHF），实时汇率、双向换算、一键复制。"
    >
      <Header data={data} loading={loading} error={error} onReload={reload} />

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <div>
            <label className="text-xs font-medium text-muted-foreground">来源货币</label>
            <select
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} · {c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-center pb-1">
            <Button size="sm" variant="outline" onClick={() => { const a = fromCode; setFromCode(toCode); setToCode(a); }}>
              <ArrowLeftRight size={14} />
            </Button>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">目标货币</label>
            <select
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} · {c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ConverterBody fromCode={fromCode} toCode={toCode} rates={data?.rates} data={data} />
    </Wrapper>
  );
}

export function CurrencyToolByKey({ toolKey }: { toolKey: string }) {
  if (toolKey === "universal") return <UniversalConverter />;
  if (toolKey in PRESETS) return <PairConverter presetKey={toolKey as Exclude<CurrencyKey, "universal">} />;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center text-sm text-muted-foreground">
      未找到汇率工具：{toolKey}
    </div>
  );
}
