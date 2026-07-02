// A generic template for small calculators / lookups (USA life, NAS, Sports).
import * as React from "react";
import { ToolShell, CopyButton, type FaqItem } from "./ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ToolDef = { title: string; intro: string; icon?: string; render: () => React.ReactElement; faqs?: FaqItem[] };

function Stat({ label, v }: { label: string; v: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums mt-0.5">{v}</div>
    </div>
  );
}

/* ============ USA: Payroll (Federal) — 2024 single filer rough estimator ============ */
const FED_BRACKETS_SINGLE_2024 = [
  { upto: 11600, rate: 0.10 },
  { upto: 47150, rate: 0.12 },
  { upto: 100525, rate: 0.22 },
  { upto: 191950, rate: 0.24 },
  { upto: 243725, rate: 0.32 },
  { upto: 609350, rate: 0.35 },
  { upto: Infinity, rate: 0.37 },
];
const FED_BRACKETS_MFJ_2024 = [
  { upto: 23200, rate: 0.10 },
  { upto: 94300, rate: 0.12 },
  { upto: 201050, rate: 0.22 },
  { upto: 383900, rate: 0.24 },
  { upto: 487450, rate: 0.32 },
  { upto: 731200, rate: 0.35 },
  { upto: Infinity, rate: 0.37 },
];
const STD_DEDUCTION = { single: 14600, mfj: 29200 };
function calcBracket(taxable: number, brackets: typeof FED_BRACKETS_SINGLE_2024) {
  let tax = 0, prev = 0;
  for (const b of brackets) {
    if (taxable > b.upto) { tax += (b.upto - prev) * b.rate; prev = b.upto; }
    else { tax += (taxable - prev) * b.rate; break; }
  }
  return Math.max(0, tax);
}
function PayrollTax() {
  const [gross, setGross] = React.useState(80000);
  const [filing, setFiling] = React.useState<"single" | "mfj">("single");
  const brackets = filing === "single" ? FED_BRACKETS_SINGLE_2024 : FED_BRACKETS_MFJ_2024;
  const stdDed = filing === "single" ? STD_DEDUCTION.single : STD_DEDUCTION.mfj;
  const taxable = Math.max(0, gross - stdDed);
  const fed = calcBracket(taxable, brackets);
  const ss = Math.min(gross, 168600) * 0.062;
  const medicare = gross * 0.0145 + Math.max(0, gross - 200000) * 0.009;
  const total = fed + ss + medicare;
  const net = gross - total;
  const eff = gross > 0 ? (total / gross) * 100 : 0;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="text-sm font-medium mb-1 block">年度总收入 (Gross, USD)</label>
          <Input type="number" value={gross} onChange={(e) => setGross(Number(e.target.value) || 0)} /></div>
        <div><label className="text-sm font-medium mb-1 block">申报状态</label>
          <select value={filing} onChange={(e) => setFiling(e.target.value as "single" | "mfj")} className="h-10 w-full rounded border border-input px-3 text-sm">
            <option value="single">Single 单身</option><option value="mfj">Married Filing Jointly 夫妻合报</option>
          </select></div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="联邦所得税" v={`$${fed.toFixed(0)}`} />
        <Stat label="社安税 (SS 6.2%)" v={`$${ss.toFixed(0)}`} />
        <Stat label="医疗保险 (Medicare)" v={`$${medicare.toFixed(0)}`} />
        <Stat label="合计税负" v={`$${total.toFixed(0)}`} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Stat label="税后年收入 (Net)" v={`$${net.toFixed(0)}`} />
        <Stat label="有效税率 (Effective)" v={`${eff.toFixed(2)}%`} />
      </div>
      <p className="text-xs text-muted-foreground">数据基于 2024 年联邦税表，只做估算，未含州税、401(k)、HSA、抵扣项。请以专业税务顾问结果为准。</p>
    </section>
  );
}

/* ============ USA: ZIP lookup via zippopotam.us ============ */
function ZipLookup() {
  const [zip, setZip] = React.useState("10001");
  const [country, setCountry] = React.useState("US");
  const [busy, setBusy] = React.useState(false);
  const [data, setData] = React.useState<{ places?: { "place name": string; state: string; "state abbreviation": string; longitude: string; latitude: string }[] } & { country?: string } | null>(null);
  const [err, setErr] = React.useState("");
  async function run() {
    setErr(""); setData(null); setBusy(true);
    try {
      const r = await fetch(`https://api.zippopotam.us/${country}/${encodeURIComponent(zip.trim())}`);
      if (!r.ok) throw new Error("未找到该邮编");
      setData(await r.json());
    } catch (e) { setErr(e instanceof Error ? e.message : "查询失败"); }
    finally { setBusy(false); }
  }
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2"><label className="text-sm font-medium mb-1 block">邮编 ZIP</label>
          <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="10001" /></div>
        <div><label className="text-sm font-medium mb-1 block">国家</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-10 w-full rounded border border-input px-3 text-sm">
            <option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="DE">Germany</option><option value="FR">France</option><option value="JP">Japan</option><option value="AU">Australia</option>
          </select></div>
      </div>
      <Button onClick={run} disabled={busy || !zip.trim()} size="sm">{busy ? "查询中…" : "查询"}</Button>
      {err && <div className="text-sm text-destructive">✗ {err}</div>}
      {data?.places && (
        <div className="space-y-2">
          {data.places.map((p, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-lg font-semibold">{p["place name"]}, {p["state abbreviation"]} ({p.state})</div>
              <div className="text-xs text-muted-foreground mt-1">经纬度：{p.latitude}, {p.longitude}</div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">数据来源：zippopotam.us（免费公共 API）</p>
    </section>
  );
}

/* ============ USA: state abbreviation ============ */
const US_STATES: { abbr: string; name: string; capital: string; region: string }[] = [
  { abbr: "AL", name: "Alabama", capital: "Montgomery", region: "South" },
  { abbr: "AK", name: "Alaska", capital: "Juneau", region: "West" },
  { abbr: "AZ", name: "Arizona", capital: "Phoenix", region: "West" },
  { abbr: "AR", name: "Arkansas", capital: "Little Rock", region: "South" },
  { abbr: "CA", name: "California", capital: "Sacramento", region: "West" },
  { abbr: "CO", name: "Colorado", capital: "Denver", region: "West" },
  { abbr: "CT", name: "Connecticut", capital: "Hartford", region: "Northeast" },
  { abbr: "DE", name: "Delaware", capital: "Dover", region: "South" },
  { abbr: "FL", name: "Florida", capital: "Tallahassee", region: "South" },
  { abbr: "GA", name: "Georgia", capital: "Atlanta", region: "South" },
  { abbr: "HI", name: "Hawaii", capital: "Honolulu", region: "West" },
  { abbr: "ID", name: "Idaho", capital: "Boise", region: "West" },
  { abbr: "IL", name: "Illinois", capital: "Springfield", region: "Midwest" },
  { abbr: "IN", name: "Indiana", capital: "Indianapolis", region: "Midwest" },
  { abbr: "IA", name: "Iowa", capital: "Des Moines", region: "Midwest" },
  { abbr: "KS", name: "Kansas", capital: "Topeka", region: "Midwest" },
  { abbr: "KY", name: "Kentucky", capital: "Frankfort", region: "South" },
  { abbr: "LA", name: "Louisiana", capital: "Baton Rouge", region: "South" },
  { abbr: "ME", name: "Maine", capital: "Augusta", region: "Northeast" },
  { abbr: "MD", name: "Maryland", capital: "Annapolis", region: "South" },
  { abbr: "MA", name: "Massachusetts", capital: "Boston", region: "Northeast" },
  { abbr: "MI", name: "Michigan", capital: "Lansing", region: "Midwest" },
  { abbr: "MN", name: "Minnesota", capital: "Saint Paul", region: "Midwest" },
  { abbr: "MS", name: "Mississippi", capital: "Jackson", region: "South" },
  { abbr: "MO", name: "Missouri", capital: "Jefferson City", region: "Midwest" },
  { abbr: "MT", name: "Montana", capital: "Helena", region: "West" },
  { abbr: "NE", name: "Nebraska", capital: "Lincoln", region: "Midwest" },
  { abbr: "NV", name: "Nevada", capital: "Carson City", region: "West" },
  { abbr: "NH", name: "New Hampshire", capital: "Concord", region: "Northeast" },
  { abbr: "NJ", name: "New Jersey", capital: "Trenton", region: "Northeast" },
  { abbr: "NM", name: "New Mexico", capital: "Santa Fe", region: "West" },
  { abbr: "NY", name: "New York", capital: "Albany", region: "Northeast" },
  { abbr: "NC", name: "North Carolina", capital: "Raleigh", region: "South" },
  { abbr: "ND", name: "North Dakota", capital: "Bismarck", region: "Midwest" },
  { abbr: "OH", name: "Ohio", capital: "Columbus", region: "Midwest" },
  { abbr: "OK", name: "Oklahoma", capital: "Oklahoma City", region: "South" },
  { abbr: "OR", name: "Oregon", capital: "Salem", region: "West" },
  { abbr: "PA", name: "Pennsylvania", capital: "Harrisburg", region: "Northeast" },
  { abbr: "RI", name: "Rhode Island", capital: "Providence", region: "Northeast" },
  { abbr: "SC", name: "South Carolina", capital: "Columbia", region: "South" },
  { abbr: "SD", name: "South Dakota", capital: "Pierre", region: "Midwest" },
  { abbr: "TN", name: "Tennessee", capital: "Nashville", region: "South" },
  { abbr: "TX", name: "Texas", capital: "Austin", region: "South" },
  { abbr: "UT", name: "Utah", capital: "Salt Lake City", region: "West" },
  { abbr: "VT", name: "Vermont", capital: "Montpelier", region: "Northeast" },
  { abbr: "VA", name: "Virginia", capital: "Richmond", region: "South" },
  { abbr: "WA", name: "Washington", capital: "Olympia", region: "West" },
  { abbr: "WV", name: "West Virginia", capital: "Charleston", region: "South" },
  { abbr: "WI", name: "Wisconsin", capital: "Madison", region: "Midwest" },
  { abbr: "WY", name: "Wyoming", capital: "Cheyenne", region: "West" },
  { abbr: "DC", name: "District of Columbia", capital: "Washington", region: "South" },
];
function StateAbbr() {
  const [q, setQ] = React.useState("");
  const list = US_STATES.filter((s) => !q || s.abbr.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase()) || s.capital.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索缩写、州名或首府" />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr><th className="text-left px-3 py-2">缩写</th><th className="text-left px-3 py-2">州名</th><th className="text-left px-3 py-2">首府</th><th className="text-left px-3 py-2">地区</th></tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.abbr} className="border-t border-border">
                <td className="px-3 py-2 font-mono font-semibold">{s.abbr}</td>
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2">{s.capital}</td>
                <td className="px-3 py-2 text-muted-foreground">{s.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ============ NAS: backup schedule ============ */
function BackupSchedule() {
  const [size, setSize] = React.useState(500); // GB
  const [growth, setGrowth] = React.useState(10); // % per month
  const [retain, setRetain] = React.useState(90); // days
  const [changeRate, setChangeRate] = React.useState(5); // % per day
  const [bandwidth, setBandwidth] = React.useState(100); // Mbps
  // full backup transfer time (seconds) = size(GB)*8000 / bandwidth(Mbps)
  const fullSec = (size * 8000) / Math.max(bandwidth, 1);
  const fullTime = fullSec / 3600; // hours
  const dailyDelta = size * (changeRate / 100);
  const dailySec = (dailyDelta * 8000) / Math.max(bandwidth, 1);
  // storage over 90 days with monthly growth
  const months = retain / 30;
  const projected = size * Math.pow(1 + growth / 100, months);
  const totalStore = projected + dailyDelta * retain;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div><label className="text-sm font-medium mb-1 block">当前数据总量 (GB)</label><Input type="number" value={size} onChange={(e) => setSize(Number(e.target.value) || 0)} /></div>
        <div><label className="text-sm font-medium mb-1 block">月增长率 (%)</label><Input type="number" value={growth} onChange={(e) => setGrowth(Number(e.target.value) || 0)} /></div>
        <div><label className="text-sm font-medium mb-1 block">保留天数</label><Input type="number" value={retain} onChange={(e) => setRetain(Number(e.target.value) || 0)} /></div>
        <div><label className="text-sm font-medium mb-1 block">每日变更率 (%)</label><Input type="number" value={changeRate} onChange={(e) => setChangeRate(Number(e.target.value) || 0)} /></div>
        <div><label className="text-sm font-medium mb-1 block">备份带宽 (Mbps)</label><Input type="number" value={bandwidth} onChange={(e) => setBandwidth(Number(e.target.value) || 0)} /></div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="全量备份耗时" v={`${fullTime.toFixed(1)} 小时`} />
        <Stat label="每日增量" v={`${dailyDelta.toFixed(1)} GB`} />
        <Stat label="每日增量耗时" v={`${(dailySec / 60).toFixed(1)} 分`} />
        <Stat label={`${retain} 天所需容量`} v={`${totalStore.toFixed(0)} GB`} />
      </div>
      <p className="text-xs text-muted-foreground">建议 3-2-1 备份策略：3 份数据、2 种介质、1 份异地。</p>
    </section>
  );
}

/* ============ Sports: steps → distance ============ */
function StepsDistance() {
  const [steps, setSteps] = React.useState(8000);
  const [height, setHeight] = React.useState(170); // cm
  const [mode, setMode] = React.useState<"walk" | "run">("walk");
  const [weight, setWeight] = React.useState(65); // kg
  // stride length ≈ height * factor (walk 0.415, run 0.500)
  const factor = mode === "walk" ? 0.415 : 0.500;
  const strideM = (height * factor) / 100;
  const distanceM = steps * strideM;
  const km = distanceM / 1000;
  const mi = km * 0.621371;
  // rough calories: walk ~0.04 * weight * steps/1000 * (stride/0.7); approximate simplified
  const calories = mode === "walk" ? 0.045 * weight * steps / 100 : 0.075 * weight * steps / 100;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div><label className="text-sm font-medium mb-1 block">步数</label><Input type="number" value={steps} onChange={(e) => setSteps(Number(e.target.value) || 0)} /></div>
        <div><label className="text-sm font-medium mb-1 block">身高 (cm)</label><Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)} /></div>
        <div><label className="text-sm font-medium mb-1 block">体重 (kg)</label><Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value) || 0)} /></div>
        <div><label className="text-sm font-medium mb-1 block">运动类型</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as "walk" | "run")} className="h-10 w-full rounded border border-input px-3 text-sm">
            <option value="walk">步行</option><option value="run">跑步</option>
          </select></div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="单步距离" v={`${(strideM * 100).toFixed(1)} cm`} />
        <Stat label="总距离" v={`${km.toFixed(2)} km`} />
        <Stat label="英里" v={`${mi.toFixed(2)} mi`} />
        <Stat label="估算消耗" v={`${calories.toFixed(0)} kcal`} />
      </div>
      <p className="text-xs text-muted-foreground">公式：步幅 = 身高 × 系数（步行 0.415 / 跑步 0.500）</p>
    </section>
  );
}

/* ============ Sports: badminton scoreboard ============ */
function ScoreBoard({ maxScore, minLead, title, teamAName = "A 队", teamBName = "B 队" }: { maxScore: number; minLead?: number; title: string; teamAName?: string; teamBName?: string }) {
  const [a, setA] = React.useState(0);
  const [b, setB] = React.useState(0);
  const [nameA, setNameA] = React.useState(teamAName);
  const [nameB, setNameB] = React.useState(teamBName);
  const winner = (() => {
    if (minLead) {
      // e.g. badminton 21, lead 2, cap 30
      const cap = 30;
      if (a >= cap && a > b) return nameA;
      if (b >= cap && b > a) return nameB;
      if (a >= maxScore && a - b >= minLead) return nameA;
      if (b >= maxScore && b - a >= minLead) return nameB;
    } else if (a >= maxScore || b >= maxScore) {
      return a > b ? nameA : nameB;
    }
    return null;
  })();
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-4">
        {[[nameA, a, setA, setNameA] as const, [nameB, b, setB, setNameB] as const].map(([n, sc, setSc, setNm], i) => (
          <div key={i} className="rounded-xl border border-border bg-muted/20 p-4 text-center">
            <Input value={n} onChange={(e) => setNm(e.target.value)} className="text-center font-semibold mb-3" />
            <div className="text-6xl font-bold tabular-nums">{sc}</div>
            <div className="mt-3 flex justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setSc(Math.max(0, sc - 1))}>-1</Button>
              <Button size="sm" onClick={() => setSc(sc + 1)}>+1</Button>
            </div>
          </div>
        ))}
      </div>
      {winner && <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center font-semibold text-primary">🏆 {winner} 获胜！</div>}
      <div className="text-center"><Button variant="ghost" size="sm" onClick={() => { setA(0); setB(0); }}>重置比分</Button></div>
    </section>
  );
}

const TOOLS: Record<string, ToolDef> = {
  "usa-payroll-tax": { title: "美国工资税估算 2024", intro: "根据 2024 联邦税表，估算年度联邦所得税、社安税、Medicare 与到手收入。", icon: "💵", render: () => <PayrollTax /> },
  "usa-zip": { title: "美国 ZIP Code 查询", intro: "根据邮编查询城市、州与经纬度，支持多国邮编。", icon: "📮", render: () => <ZipLookup /> },
  "usa-state-abbr": { title: "美国州缩写查询", intro: "美国 50 州 + DC 的两字母缩写、州名、首府、地区速查表。", icon: "🗽", render: () => <StateAbbr /> },
  "nas-backup-plan": { title: "备份计划计算", intro: "根据数据量、增长率、变更率与带宽，估算备份耗时和所需容量。", icon: "💾", render: () => <BackupSchedule /> },
  "sp-steps-distance": { title: "步数距离计算", intro: "根据身高与步数换算实际步行/跑步距离，并估算消耗热量。", icon: "🚶", render: () => <StepsDistance /> },
  "sp-badminton": { title: "羽毛球比分工具", intro: "在线羽毛球比分板，21 分制，领先 2 分获胜（30 分封顶）。", icon: "🏸", render: () => <ScoreBoard title="21 分制，领先 2 分获胜（30 分封顶）" maxScore={21} minLead={2} /> },
  "sp-tennis": { title: "网球比分工具", intro: "简化版网球比分板，先赢 6 局，领先 2 局获胜。", icon: "🎾", render: () => <ScoreBoard title="先赢 6 局，领先 2 局获胜" maxScore={6} minLead={2} /> },
};

export function SimpleToolByKey({ toolKey }: { toolKey: string }) {
  const tool = TOOLS[toolKey];
  if (!tool) return <div className="p-10 text-center text-sm text-destructive">未找到工具：{toolKey}</div>;
  return <ToolShell title={tool.title} intro={tool.intro} icon={tool.icon} faqs={tool.faqs}>{tool.render()}</ToolShell>;
}

export const SIMPLE_TOOL_KEYS = Object.keys(TOOLS);
