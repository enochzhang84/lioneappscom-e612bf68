// 开发者工具：JSON / YAML / CSV / UUID / JWT / HEX ↔ RGB / 正则 / SQL / XML
import * as React from "react";
import yaml from "js-yaml";
import { ToolShell, CopyButton, type FaqItem } from "./ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ToolDef = {
  title: string;
  intro: string;
  icon?: string;
  render: () => React.ReactElement;
  faqs?: FaqItem[];
};

// --- helpers ---
function uuidV4(): string {
  const c = globalThis.crypto as Crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x: number) => x.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10, 16).join("")}`;
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  try { return decodeURIComponent(escape(atob(b64))); } catch { return atob(b64); }
}

function csvToJson(csv: string): unknown[] {
  const rows: string[][] = [];
  let cur = "", row: string[] = [], inQuote = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuote) {
      if (ch === '"' && csv[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else cur += ch;
    } else {
      if (ch === '"') inQuote = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (ch === "\r") { /* ignore */ }
      else cur += ch;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).filter(r => r.some(v => v !== "")).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } | null {
  const s = hex.trim().replace(/^#/, "");
  let m = s.match(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (m) return { r: parseInt(m[1] + m[1], 16), g: parseInt(m[2] + m[2], 16), b: parseInt(m[3] + m[3], 16), a: 1 };
  m = s.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i);
  if (m) return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16), a: m[4] ? parseInt(m[4], 16) / 255 : 1 };
  return null;
}
function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// --- subtool components ---
function JsonFormatter({ mode }: { mode: "format" | "validate" }) {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [indent, setIndent] = React.useState(2);
  function run(compact = false) {
    try {
      const v = JSON.parse(input);
      setOk(true);
      setOutput(mode === "validate" ? "✓ 合法 JSON" : JSON.stringify(v, null, compact ? 0 : indent));
    } catch (e) {
      setOk(false);
      setOutput("✗ " + (e instanceof Error ? e.message : "解析失败"));
    }
  }
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div>
        <div className="text-sm font-semibold mb-2">JSON 输入</div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder='{"name":"lione","age":26}'
          className="min-h-[180px] font-mono text-sm" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {mode === "format" && <>
          <Button onClick={() => run(false)} size="sm">格式化</Button>
          <Button onClick={() => run(true)} size="sm" variant="outline">压缩</Button>
          <label className="text-xs text-muted-foreground">缩进
            <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="ml-2 border rounded px-2 py-1">
              <option value={2}>2 空格</option><option value={4}>4 空格</option>
            </select>
          </label>
        </>}
        {mode === "validate" && <Button onClick={() => run(false)} size="sm">校验</Button>}
        <Button size="sm" variant="ghost" onClick={() => { setInput(""); setOutput(""); setOk(null); }}>清空</Button>
      </div>
      <div>
        <div className="text-sm font-semibold mb-2 flex items-center justify-between">
          <span>结果 {ok === true && <span className="ml-2 text-emerald-600">✓</span>}{ok === false && <span className="ml-2 text-destructive">✗</span>}</span>
          {output && mode === "format" && <CopyButton text={output} />}
        </div>
        <Textarea readOnly value={output} className="min-h-[180px] font-mono text-sm bg-muted/30" />
      </div>
    </section>
  );
}

function YamlToJson() {
  const [input, setInput] = React.useState("name: lione\nversion: 1.0\ntags:\n  - saas\n  - lovable");
  const [output, setOutput] = React.useState("");
  function run() {
    try {
      const v = yaml.load(input);
      setOutput(JSON.stringify(v, null, 2));
    } catch (e) { setOutput("解析失败：" + (e instanceof Error ? e.message : "")); }
  }
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div>
        <div className="text-sm font-semibold mb-2">YAML 输入</div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[180px] font-mono text-sm" />
      </div>
      <div className="flex gap-2"><Button onClick={run} size="sm">转 JSON</Button></div>
      <div>
        <div className="text-sm font-semibold mb-2 flex justify-between">JSON 输出 {output && <CopyButton text={output} />}</div>
        <Textarea readOnly value={output} className="min-h-[180px] font-mono text-sm bg-muted/30" />
      </div>
    </section>
  );
}

function CsvToJson() {
  const [input, setInput] = React.useState("name,age\nAlice,30\nBob,25");
  const [output, setOutput] = React.useState("");
  function run() {
    try {
      const v = csvToJson(input);
      setOutput(JSON.stringify(v, null, 2));
    } catch (e) { setOutput("解析失败：" + (e instanceof Error ? e.message : "")); }
  }
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div>
        <div className="text-sm font-semibold mb-2">CSV 输入（第一行为表头）</div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[180px] font-mono text-sm" />
      </div>
      <div className="flex gap-2"><Button onClick={run} size="sm">转 JSON</Button></div>
      <div>
        <div className="text-sm font-semibold mb-2 flex justify-between">JSON 输出 {output && <CopyButton text={output} />}</div>
        <Textarea readOnly value={output} className="min-h-[220px] font-mono text-sm bg-muted/30" />
      </div>
    </section>
  );
}

function UuidGen() {
  const [count, setCount] = React.useState(10);
  const [list, setList] = React.useState<string[]>([]);
  function gen() {
    const arr: string[] = [];
    for (let i = 0; i < Math.max(1, Math.min(500, count)); i++) arr.push(uuidV4());
    setList(arr);
  }
  React.useEffect(gen, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm">生成数量：</label>
        <Input type="number" value={count} min={1} max={500} onChange={(e) => setCount(Number(e.target.value))} className="w-24" />
        <Button onClick={gen} size="sm">生成</Button>
        {list.length > 0 && <CopyButton text={list.join("\n")} label="复制全部" />}
      </div>
      <Textarea readOnly value={list.join("\n")} className="min-h-[240px] font-mono text-sm bg-muted/30" />
    </section>
  );
}

function JwtDecode() {
  const [input, setInput] = React.useState("");
  const parts = input.split(".");
  const parsed = React.useMemo(() => {
    if (parts.length < 2) return null;
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      return { header, payload, sig: parts[2] ?? "" };
    } catch { return { error: true }; }
  }, [input]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div>
        <div className="text-sm font-semibold mb-2">JWT 输入</div>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="eyJhbGciOi... .eyJzdWIiOi... .signature" className="min-h-[100px] font-mono text-sm" />
      </div>
      {parsed && "error" in parsed && <div className="text-sm text-destructive">解析失败：不是合法的 JWT。</div>}
      {parsed && !("error" in parsed) && (
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-semibold mb-1">Header</div>
            <pre className="text-xs bg-muted/40 p-3 rounded overflow-auto">{JSON.stringify(parsed.header, null, 2)}</pre>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1">Payload</div>
            <pre className="text-xs bg-muted/40 p-3 rounded overflow-auto">{JSON.stringify(parsed.payload, null, 2)}</pre>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm font-semibold mb-1">Signature (未验证)</div>
            <div className="text-xs font-mono break-all bg-muted/40 p-3 rounded">{parsed.sig}</div>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">⚠️ 本工具只解码不验签。切勿在此粘贴生产 Token。</p>
    </section>
  );
}

function HexRgb() {
  const [hex, setHex] = React.useState("#2563EB");
  const rgb = hexToRgb(hex) ?? { r: 37, g: 99, b: 235, a: 1 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <input type="color" value={hex.startsWith("#") ? hex.slice(0, 7) : "#" + hex}
          onChange={(e) => setHex(e.target.value.toUpperCase())}
          className="h-12 w-16 rounded border border-border cursor-pointer" />
        <Input value={hex} onChange={(e) => setHex(e.target.value)} className="font-mono max-w-[180px]" />
        <div className="flex-1 h-12 rounded border border-border" style={{ background: hex }} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Row label="HEX" value={rgbToHex(rgb.r, rgb.g, rgb.b)} />
        <Row label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
        <Row label="RGBA" value={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`} />
        <Row label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
        <Row label="CSS var" value={`--brand: ${rgbToHex(rgb.r, rgb.g, rgb.b)};`} />
        <Row label="Tailwind" value={`bg-[${rgbToHex(rgb.r, rgb.g, rgb.b)}]`} />
      </div>
    </section>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-mono text-sm truncate">{value}</div>
      </div>
      <CopyButton text={value} label="" />
    </div>
  );
}

const TOOLS: Record<string, ToolDef> = {
  "dev-json-format": { title: "JSON 格式化 / 压缩", intro: "支持格式化、压缩、缩进选择，浏览器本地运行。", icon: "🧩", render: () => <JsonFormatter mode="format" /> },
  "dev-json-validate": { title: "JSON 校验", intro: "一键检查 JSON 是否合法，并给出错误位置。", icon: "✅", render: () => <JsonFormatter mode="validate" /> },
  "dev-yaml-to-json": { title: "YAML → JSON 转换", intro: "解析 YAML 并转成 JSON，方便配置迁移。", icon: "🧾", render: () => <YamlToJson /> },
  "dev-csv-to-json": { title: "CSV → JSON 转换", intro: "第一行为表头，将 CSV 表格转为 JSON 数组。", icon: "📊", render: () => <CsvToJson /> },
  "dev-uuid": { title: "UUID v4 生成器", intro: "批量生成 UUID v4，可复制到剪贴板。", icon: "🆔", render: () => <UuidGen /> },
  "dev-jwt-decode": { title: "JWT 解码器", intro: "解析 JWT header / payload / signature。仅解码不验签。", icon: "🔓", render: () => <JwtDecode /> },
  "dev-hex-rgb": { title: "颜色 HEX / RGB / HSL 转换", intro: "输入 HEX 或使用取色器，一键得到 RGB / RGBA / HSL / CSS。", icon: "🎨", render: () => <HexRgb /> },
};

export function DevToolByKey({ toolKey }: { toolKey: string }) {
  const tool = TOOLS[toolKey];
  if (!tool) return <div className="p-10 text-center text-sm text-destructive">未找到工具：{toolKey}</div>;
  return (
    <ToolShell title={tool.title} intro={tool.intro} icon={tool.icon} faqs={tool.faqs}>
      {tool.render()}
    </ToolShell>
  );
}

export const DEV_TOOL_KEYS = Object.keys(TOOLS);
