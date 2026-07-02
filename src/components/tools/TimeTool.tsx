// 日期时间工具：世界时间、时区转换、Unix 时间戳、日期差、年龄
import * as React from "react";
import { ToolShell, CopyButton, type FaqItem } from "./ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ToolDef = { title: string; intro: string; icon?: string; render: () => React.ReactElement; faqs?: FaqItem[] };

const COMMON_TZ = [
  "UTC", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Taipei", "Asia/Tokyo", "Asia/Singapore",
  "Asia/Kolkata", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "America/Sao_Paulo", "Australia/Sydney", "Pacific/Auckland",
];
function localTZ() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; } }
function fmtIn(tz: string, d: Date) {
  try {
    return new Intl.DateTimeFormat("zh-CN", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, weekday: "short" }).format(d);
  } catch { return "-"; }
}
function tzOffset(tz: string, d = new Date()) {
  try {
    const s = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? "UTC";
    return s;
  } catch { return ""; }
}

function WorldClock() {
  const [now, setNow] = React.useState(new Date());
  const [zones, setZones] = React.useState<string[]>(() => {
    const l = localTZ();
    const set = new Set([l, "UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Shanghai", "Asia/Tokyo"]);
    return Array.from(set);
  });
  const [pick, setPick] = React.useState("");
  React.useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={pick} onChange={(e) => setPick(e.target.value)} className="h-9 rounded border border-input px-2 text-sm">
          <option value="">— 选择时区 —</option>
          {COMMON_TZ.filter((z) => !zones.includes(z)).map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <Button size="sm" onClick={() => { if (pick && !zones.includes(pick)) { setZones((s) => [...s, pick]); setPick(""); } }}>添加</Button>
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
        {zones.map((z) => (
          <li key={z} className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium">{z} <span className="ml-2 text-xs text-muted-foreground">{tzOffset(z, now)}</span></div>
              <div className="text-xl font-semibold tabular-nums">{fmtIn(z, now)}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setZones((s) => s.filter((x) => x !== z))}>移除</Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TimezoneConv() {
  const [datetime, setDatetime] = React.useState(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  });
  const [fromTZ, setFromTZ] = React.useState(localTZ());
  const [toTZ, setToTZ] = React.useState("UTC");
  // Interpret datetime string as being in fromTZ; find equivalent UTC by iterative offset.
  const utcMs = React.useMemo(() => {
    // datetime like YYYY-MM-DDTHH:mm — treat as local time in fromTZ
    const [d, t] = datetime.split("T");
    if (!d || !t) return NaN;
    const [Y, M, D] = d.split("-").map(Number);
    const [h, m] = t.split(":").map(Number);
    // Guess UTC = local minus offset. First guess assume UTC = same clock.
    let guess = Date.UTC(Y, M - 1, D, h, m);
    for (let i = 0; i < 3; i++) {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: fromTZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(guess));
      const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
      const cy = get("year"), cm = get("month"), cd = get("day"), ch = get("hour"), cmin = get("minute");
      const target = Date.UTC(Y, M - 1, D, h, m);
      const inZone = Date.UTC(cy, cm - 1, cd, ch, cmin);
      const diff = target - inZone;
      if (diff === 0) break;
      guess += diff;
    }
    return guess;
  }, [datetime, fromTZ]);
  const target = Number.isFinite(utcMs) ? new Date(utcMs) : null;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">日期时间</label>
          <Input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">源时区</label>
          <select value={fromTZ} onChange={(e) => setFromTZ(e.target.value)} className="h-9 w-full rounded border border-input px-2 text-sm">
            {COMMON_TZ.map((z) => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">目标时区</label>
          <select value={toTZ} onChange={(e) => setToTZ(e.target.value)} className="h-9 w-full rounded border border-input px-2 text-sm">
            {COMMON_TZ.map((z) => <option key={z}>{z}</option>)}
          </select>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
        <div className="text-xs text-muted-foreground">在 {toTZ} 的对应时间</div>
        <div className="text-2xl font-bold tabular-nums">{target ? fmtIn(toTZ, target) : "-"}</div>
        <div className="text-xs text-muted-foreground">UTC ISO: {target ? target.toISOString() : "-"}</div>
      </div>
    </section>
  );
}

function UnixTs() {
  const [ts, setTs] = React.useState<string>(String(Math.floor(Date.now() / 1000)));
  const [dt, setDt] = React.useState<string>("");
  const [tz, setTz] = React.useState(localTZ());
  const [now, setNow] = React.useState(() => Math.floor(Date.now() / 1000));
  React.useEffect(() => { const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000); return () => clearInterval(id); }, []);
  const n = Number(ts);
  const ms = n > 1e12 ? n : n * 1000;
  const dtParsed = Date.parse(dt);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="rounded-lg border border-border bg-muted/20 p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">当前 Unix 时间戳（秒）</div>
          <div className="text-2xl font-bold tabular-nums">{now}</div>
        </div>
        <CopyButton text={String(now)} label="复制" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold">时间戳 → 日期</div>
          <Input value={ts} onChange={(e) => setTs(e.target.value)} placeholder="秒或毫秒" />
          <select value={tz} onChange={(e) => setTz(e.target.value)} className="h-9 w-full rounded border border-input px-2 text-sm">
            {COMMON_TZ.map((z) => <option key={z}>{z}</option>)}
          </select>
          <div className="rounded border border-border bg-muted/20 p-3 text-sm space-y-1">
            <div>{tz}: <span className="font-mono">{isFinite(ms) ? fmtIn(tz, new Date(ms)) : "-"}</span></div>
            <div className="text-muted-foreground">UTC ISO: <span className="font-mono">{isFinite(ms) ? new Date(ms).toISOString() : "-"}</span></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">日期 → 时间戳</div>
          <Input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
          <div className="rounded border border-border bg-muted/20 p-3 text-sm space-y-1">
            <div>秒: <span className="font-mono">{isFinite(dtParsed) ? Math.floor(dtParsed / 1000) : "-"}</span></div>
            <div>毫秒: <span className="font-mono">{isFinite(dtParsed) ? dtParsed : "-"}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DateDiff() {
  const today = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const iso = `${today.getFullYear()}-${p(today.getMonth() + 1)}-${p(today.getDate())}`;
  const [start, setStart] = React.useState("2020-01-01");
  const [end, setEnd] = React.useState(iso);
  const s = new Date(start), e = new Date(end);
  const days = isNaN(s.getTime()) || isNaN(e.getTime()) ? NaN : Math.round((e.getTime() - s.getTime()) / 86400000);
  const yrs = e.getFullYear() - s.getFullYear();
  const mos = yrs * 12 + (e.getMonth() - s.getMonth()) - (e.getDate() < s.getDate() ? 1 : 0);
  const Y = Math.trunc(mos / 12), M = ((mos % 12) + 12) % 12;
  const anchor = new Date(s); anchor.setFullYear(s.getFullYear() + Y); anchor.setMonth(s.getMonth() + Y * 0 + M);
  const D = isNaN(anchor.getTime()) ? 0 : Math.round((e.getTime() - anchor.getTime()) / 86400000);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="text-sm font-medium mb-1 block">起始日期</label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><label className="text-sm font-medium mb-1 block">结束日期</label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="相差天数" v={isFinite(days) ? `${days}` : "-"} />
        <Stat label="相差周" v={isFinite(days) ? (days / 7).toFixed(2) : "-"} />
        <Stat label="相差月" v={isFinite(days) ? (days / 30.4375).toFixed(2) : "-"} />
        <Stat label="相差年" v={isFinite(days) ? (days / 365.25).toFixed(2) : "-"} />
      </div>
      <div className="rounded-lg border border-border bg-primary/5 p-4">
        <div className="text-xs text-muted-foreground">按自然月分解</div>
        <div className="text-xl font-bold">{Y} 年 {M} 月 {D} 天</div>
      </div>
    </section>
  );
}
function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums">{v}</div>
    </div>
  );
}

function AgeCalc() {
  const today = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const iso = `${today.getFullYear()}-${p(today.getMonth() + 1)}-${p(today.getDate())}`;
  const [birth, setBirth] = React.useState("1995-01-01");
  const [ref, setRef] = React.useState(iso);
  const b = new Date(birth), r = new Date(ref);
  const years = r.getFullYear() - b.getFullYear() - (r.getMonth() < b.getMonth() || (r.getMonth() === b.getMonth() && r.getDate() < b.getDate()) ? 1 : 0);
  const days = isNaN(b.getTime()) || isNaN(r.getTime()) ? NaN : Math.round((r.getTime() - b.getTime()) / 86400000);
  // next birthday
  const nb = new Date(r.getFullYear(), b.getMonth(), b.getDate());
  if (nb < r) nb.setFullYear(r.getFullYear() + 1);
  const dToBirthday = Math.ceil((nb.getTime() - r.getTime()) / 86400000);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="text-sm font-medium mb-1 block">出生日期</label><Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} /></div>
        <div><label className="text-sm font-medium mb-1 block">计算日期</label><Input type="date" value={ref} onChange={(e) => setRef(e.target.value)} /></div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="周岁" v={isFinite(years) ? `${years}` : "-"} />
        <Stat label="已活天数" v={isFinite(days) ? `${days}` : "-"} />
        <Stat label="已活周数" v={isFinite(days) ? (days / 7).toFixed(1) : "-"} />
        <Stat label="距下次生日" v={isFinite(dToBirthday) ? `${dToBirthday} 天` : "-"} />
      </div>
    </section>
  );
}

function Countdown() {
  const [target, setTarget] = React.useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  });
  const [label, setLabel] = React.useState("我的目标日");
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const t = Date.parse(target);
  const diff = isFinite(t) ? t - now : NaN;
  const abs = Math.abs(diff);
  const d = Math.floor(abs / 86400000);
  const h = Math.floor((abs % 86400000) / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const s = Math.floor((abs % 60000) / 1000);
  const past = diff < 0;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="text-sm font-medium mb-1 block">事件名称</label><Input value={label} onChange={(e) => setLabel(e.target.value)} /></div>
        <div><label className="text-sm font-medium mb-1 block">目标时间</label><Input type="datetime-local" value={target} onChange={(e) => setTarget(e.target.value)} /></div>
      </div>
      <div className="rounded-xl border border-border bg-primary/5 p-6 text-center">
        <div className="text-sm text-muted-foreground">距离「{label}」{past ? "已过去" : "还剩"}</div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {[["天", d], ["时", h], ["分", m], ["秒", s]].map(([k, v]) => (
            <div key={k as string} className="rounded-lg bg-white border border-border py-3">
              <div className="text-3xl md:text-4xl font-bold tabular-nums">{String(v).padStart(2, "0")}</div>
              <div className="text-xs text-muted-foreground mt-1">{k}</div>
            </div>
          ))}
        </div>
        {!isFinite(t) && <div className="mt-3 text-sm text-destructive">请选择合法的目标时间</div>}
      </div>
    </section>
  );
}

function WorkDays() {
  const today = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const iso = `${today.getFullYear()}-${p(today.getMonth() + 1)}-${p(today.getDate())}`;
  const [start, setStart] = React.useState(iso);
  const [end, setEnd] = React.useState(iso);
  const [skipSat, setSkipSat] = React.useState(true);
  const [skipSun, setSkipSun] = React.useState(true);
  const [holidays, setHolidays] = React.useState("");
  const stats = React.useMemo(() => {
    const s = new Date(start), e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return null;
    const hset = new Set(holidays.split(/\r?\n|,|;|\s+/).map((x) => x.trim()).filter(Boolean));
    let total = 0, work = 0, weekend = 0, holi = 0;
    const cur = new Date(s);
    while (cur <= e) {
      total++;
      const dw = cur.getDay();
      const key = `${cur.getFullYear()}-${p(cur.getMonth() + 1)}-${p(cur.getDate())}`;
      const isWknd = (skipSat && dw === 6) || (skipSun && dw === 0);
      const isHoli = hset.has(key);
      if (isWknd) weekend++;
      if (isHoli) holi++;
      if (!isWknd && !isHoli) work++;
      cur.setDate(cur.getDate() + 1);
    }
    return { total, work, weekend, holi };
  }, [start, end, skipSat, skipSun, holidays]);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="text-sm font-medium mb-1 block">起始日期</label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><label className="text-sm font-medium mb-1 block">结束日期</label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-1"><input type="checkbox" checked={skipSat} onChange={(e) => setSkipSat(e.target.checked)} /> 跳过周六</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={skipSun} onChange={(e) => setSkipSun(e.target.checked)} /> 跳过周日</label>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">额外假日（YYYY-MM-DD，逗号或换行分隔）</label>
        <Input value={holidays} onChange={(e) => setHolidays(e.target.value)} placeholder="2026-01-01, 2026-05-01" />
      </div>
      {stats && (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="总天数" v={String(stats.total)} />
          <Stat label="工作日" v={String(stats.work)} />
          <Stat label="周末天数" v={String(stats.weekend)} />
          <Stat label="节假日" v={String(stats.holi)} />
        </div>
      )}
    </section>
  );
}

const TOOLS: Record<string, ToolDef> = {
  "time-world-clock": { title: "世界时间", intro: "全球主要城市实时时间，可自定义添加/移除时区。", icon: "🌍", render: () => <WorldClock /> },
  "time-timezone": { title: "时区转换器", intro: "任意时区的日期时间互相换算，自动处理夏令时。", icon: "🕓", render: () => <TimezoneConv /> },
  "time-unix": { title: "Unix 时间戳转换", intro: "实时显示当前时间戳，支持秒/毫秒双向转换。", icon: "⏱️", render: () => <UnixTs /> },
  "time-date-diff": { title: "日期差计算", intro: "两个日期之间相差多少天/周/月/年，含自然月分解。", icon: "📅", render: () => <DateDiff /> },
  "time-age": { title: "年龄计算器", intro: "根据出生日期计算周岁、已活天数、距下次生日。", icon: "🎂", render: () => <AgeCalc /> },
  "time-countdown": { title: "倒计时计算", intro: "为任意目标日设置倒计时，实时显示剩余天/时/分/秒。", icon: "⏳", render: () => <Countdown /> },
  "time-workdays": { title: "工作日计算", intro: "计算两个日期之间的工作日数量，支持自定义假日。", icon: "🗓️", render: () => <WorkDays /> },
};

export function TimeToolByKey({ toolKey }: { toolKey: string }) {
  const tool = TOOLS[toolKey];
  if (!tool) return <div className="p-10 text-center text-sm text-destructive">未找到工具：{toolKey}</div>;
  return <ToolShell title={tool.title} intro={tool.intro} icon={tool.icon} faqs={tool.faqs}>{tool.render()}</ToolShell>;
}

export const TIME_TOOL_KEYS = Object.keys(TOOLS);
