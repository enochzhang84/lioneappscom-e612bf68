// 开发者工具：JSON / YAML / CSV / UUID / JWT / HEX ↔ RGB / 正则 / SQL / XML / Cron / HTTP Status
import * as React from "react";
import * as yaml from "js-yaml";
import xmlFormat from "xml-formatter";
import cronstrue from "cronstrue";
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

// ---- new sub-tools ----
function JsonToYaml() {
  const [input, setInput] = React.useState('{\n  "name": "lione",\n  "tags": ["saas","tools"]\n}');
  const [output, setOutput] = React.useState("");
  function run() {
    try { setOutput(yaml.dump(JSON.parse(input), { indent: 2 })); }
    catch (e) { setOutput("解析失败：" + (e instanceof Error ? e.message : "")); }
  }
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div><div className="text-sm font-semibold mb-2">JSON 输入</div><Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[180px] font-mono text-sm" /></div>
      <div><Button onClick={run} size="sm">转 YAML</Button></div>
      <div><div className="text-sm font-semibold mb-2 flex justify-between">YAML 输出 {output && <CopyButton text={output} />}</div><Textarea readOnly value={output} className="min-h-[180px] font-mono text-sm bg-muted/30" /></div>
    </section>
  );
}

function XmlFormatter() {
  const [input, setInput] = React.useState('<root><item id="1">A</item><item id="2">B</item></root>');
  const [output, setOutput] = React.useState("");
  function run(compact = false) {
    try {
      setOutput(compact
        ? input.replace(/>\s+</g, "><").trim()
        : xmlFormat(input, { indentation: "  ", collapseContent: true, lineSeparator: "\n" }));
    } catch (e) { setOutput("解析失败：" + (e instanceof Error ? e.message : "")); }
  }
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div><div className="text-sm font-semibold mb-2">XML 输入</div><Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[180px] font-mono text-sm" /></div>
      <div className="flex gap-2"><Button onClick={() => run(false)} size="sm">格式化</Button><Button onClick={() => run(true)} size="sm" variant="outline">压缩</Button></div>
      <div><div className="text-sm font-semibold mb-2 flex justify-between">结果 {output && <CopyButton text={output} />}</div><Textarea readOnly value={output} className="min-h-[220px] font-mono text-sm bg-muted/30" /></div>
    </section>
  );
}

function SqlFormatter() {
  const [input, setInput] = React.useState("select id, name from users where age>18 order by created_at desc limit 10;");
  const [output, setOutput] = React.useState("");
  function run() {
    const kw = ["SELECT","FROM","WHERE","GROUP BY","ORDER BY","HAVING","LIMIT","OFFSET","INNER JOIN","LEFT JOIN","RIGHT JOIN","FULL JOIN","JOIN","ON","AND","OR","UNION ALL","UNION","INSERT INTO","VALUES","UPDATE","SET","DELETE FROM","CREATE TABLE","ALTER TABLE","DROP TABLE"];
    let s = input.replace(/\s+/g, " ").trim();
    for (const k of kw) {
      s = s.replace(new RegExp("\\s*\\b" + k.replace(/ /g, "\\s+") + "\\b\\s*", "gi"), "\n" + k + " ");
    }
    s = s.replace(/,\s*/g, ",\n  ");
    s = s.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
    setOutput(s.endsWith(";") ? s : s + ";");
  }
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div><div className="text-sm font-semibold mb-2">SQL 输入</div><Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[160px] font-mono text-sm" /></div>
      <div><Button onClick={run} size="sm">格式化</Button></div>
      <div><div className="text-sm font-semibold mb-2 flex justify-between">结果 {output && <CopyButton text={output} />}</div><Textarea readOnly value={output} className="min-h-[220px] font-mono text-sm bg-muted/30" /></div>
      <p className="text-xs text-muted-foreground">提示：本工具为轻量格式化，保留原始语义；不做语法校验。</p>
    </section>
  );
}

function RegexTester() {
  const [pattern, setPattern] = React.useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = React.useState("g");
  const [text, setText] = React.useState("联系我们 hello@lioneapps.com 或 team@example.com，谢谢。");
  const [replace, setReplace] = React.useState("[email]");
  const result = React.useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const matches: { match: string; index: number; groups: string[] }[] = [];
      if (flags.includes("g")) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        const m = re.exec(text);
        if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      const replaced = text.replace(new RegExp(pattern, flags), replace);
      return { ok: true, matches, replaced };
    } catch (e) { return { ok: false, err: e instanceof Error ? e.message : "非法正则" }; }
  }, [pattern, flags, text, replace]);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">/</span>
        <Input value={pattern} onChange={(e) => setPattern(e.target.value)} className="font-mono" />
        <span className="text-sm text-muted-foreground">/</span>
        <Input value={flags} onChange={(e) => setFlags(e.target.value)} className="font-mono w-20" placeholder="gimsuy" />
      </div>
      <div><div className="text-sm font-semibold mb-2">测试文本</div><Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[120px] font-mono text-sm" /></div>
      <div><div className="text-sm font-semibold mb-2">替换为</div><Input value={replace} onChange={(e) => setReplace(e.target.value)} className="font-mono" /></div>
      {!result.ok && <div className="text-sm text-destructive">✗ {result.err}</div>}
      {result.ok && result.matches && (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="text-sm font-semibold mb-2">匹配（共 {result.matches.length} 项）</div>
            <ul className="text-sm font-mono space-y-1 max-h-48 overflow-auto">
              {result.matches.map((m, i) => (<li key={i}>#{i + 1} @{m.index}: <span className="text-primary">{m.match}</span>{m.groups.length > 0 && <span className="text-muted-foreground"> · groups={JSON.stringify(m.groups)}</span>}</li>))}
              {result.matches.length === 0 && <li className="text-muted-foreground">无匹配</li>}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="text-sm font-semibold mb-2 flex items-center justify-between"><span>替换结果</span><CopyButton text={result.replaced ?? ""} /></div>
            <Textarea readOnly value={result.replaced ?? ""} className="min-h-[120px] font-mono text-sm bg-white" />
          </div>
        </div>
      )}
    </section>
  );
}

function CronParser() {
  const [expr, setExpr] = React.useState("0 9 * * 1-5");
  const [locale, setLocale] = React.useState<"zh_CN" | "en">("zh_CN");
  const parsed = React.useMemo(() => {
    try { return { ok: true, text: cronstrue.toString(expr, { locale, use24HourTimeFormat: true }) }; }
    catch (e) { return { ok: false, err: e instanceof Error ? e.message : "非法 Cron 表达式" }; }
  }, [expr, locale]);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input value={expr} onChange={(e) => setExpr(e.target.value)} className="font-mono flex-1 min-w-[240px]" placeholder="* * * * *" />
        <select value={locale} onChange={(e) => setLocale(e.target.value as "zh_CN" | "en")} className="h-9 rounded border border-input px-2 text-sm">
          <option value="zh_CN">中文</option><option value="en">English</option>
        </select>
      </div>
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <div className="text-xs text-muted-foreground mb-1">表达式含义</div>
        <div className={"text-lg font-semibold " + (parsed.ok ? "" : "text-destructive")}>{parsed.ok ? parsed.text : "✗ " + parsed.err}</div>
      </div>
      <details className="rounded-lg border border-border bg-muted/20 p-3">
        <summary className="cursor-pointer text-sm font-semibold">常用示例</summary>
        <ul className="mt-2 text-sm space-y-1">
          <li><code className="text-primary">* * * * *</code> — 每分钟</li>
          <li><code className="text-primary">*/5 * * * *</code> — 每 5 分钟</li>
          <li><code className="text-primary">0 * * * *</code> — 每小时整点</li>
          <li><code className="text-primary">0 0 * * *</code> — 每天 0 点</li>
          <li><code className="text-primary">0 9 * * 1-5</code> — 工作日 9:00</li>
          <li><code className="text-primary">0 0 1 * *</code> — 每月 1 日 0 点</li>
        </ul>
      </details>
    </section>
  );
}

const HTTP_STATUS: { code: number; name: string; desc: string }[] = [
  { code: 100, name: "Continue", desc: "继续 · 客户端应继续发送请求剩余部分。" },
  { code: 101, name: "Switching Protocols", desc: "切换协议 · 服务器同意升级到指定协议。" },
  { code: 200, name: "OK", desc: "成功 · 请求已成功处理。" },
  { code: 201, name: "Created", desc: "已创建 · 请求已实现，通常返回新资源。" },
  { code: 204, name: "No Content", desc: "无内容 · 成功但无返回体。" },
  { code: 206, name: "Partial Content", desc: "部分内容 · Range 请求返回。" },
  { code: 301, name: "Moved Permanently", desc: "永久重定向。" },
  { code: 302, name: "Found", desc: "临时重定向。" },
  { code: 304, name: "Not Modified", desc: "未修改 · 使用缓存。" },
  { code: 307, name: "Temporary Redirect", desc: "临时重定向 · 保持原方法。" },
  { code: 308, name: "Permanent Redirect", desc: "永久重定向 · 保持原方法。" },
  { code: 400, name: "Bad Request", desc: "请求语法错误。" },
  { code: 401, name: "Unauthorized", desc: "未认证 · 缺少或无效凭证。" },
  { code: 403, name: "Forbidden", desc: "禁止访问 · 无权限。" },
  { code: 404, name: "Not Found", desc: "未找到资源。" },
  { code: 405, name: "Method Not Allowed", desc: "方法不允许。" },
  { code: 409, name: "Conflict", desc: "冲突 · 例如版本冲突。" },
  { code: 410, name: "Gone", desc: "资源已被永久删除。" },
  { code: 413, name: "Payload Too Large", desc: "请求实体过大。" },
  { code: 415, name: "Unsupported Media Type", desc: "不支持的媒体类型。" },
  { code: 418, name: "I'm a teapot", desc: "我是茶壶 · 愚人节彩蛋。" },
  { code: 422, name: "Unprocessable Entity", desc: "语义错误 · 常用于表单校验失败。" },
  { code: 429, name: "Too Many Requests", desc: "请求过多 · 触发限流。" },
  { code: 500, name: "Internal Server Error", desc: "服务器内部错误。" },
  { code: 501, name: "Not Implemented", desc: "未实现。" },
  { code: 502, name: "Bad Gateway", desc: "网关错误 · 上游返回无效响应。" },
  { code: 503, name: "Service Unavailable", desc: "服务不可用 · 通常临时维护。" },
  { code: 504, name: "Gateway Timeout", desc: "网关超时。" },
];
function HttpStatusLookup() {
  const [q, setQ] = React.useState("");
  const list = HTTP_STATUS.filter((s) => !q || String(s.code).includes(q) || s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索状态码或名称，例如 404、Timeout" />
      <div className="grid md:grid-cols-2 gap-3">
        {list.map((s) => (
          <div key={s.code} className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tabular-nums">{s.code}</div>
              <div className="text-sm font-medium">{s.name}</div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted-foreground">未找到匹配的状态码。</div>}
      </div>
    </section>
  );
}

const TOOLS: Record<string, ToolDef> = {
  "dev-json-format": { title: "JSON 格式化 / 压缩", intro: "支持格式化、压缩、缩进选择，浏览器本地运行。", icon: "🧩", render: () => <JsonFormatter mode="format" /> },
  "dev-json-validate": { title: "JSON 校验", intro: "一键检查 JSON 是否合法，并给出错误位置。", icon: "✅", render: () => <JsonFormatter mode="validate" /> },
  "dev-yaml-to-json": { title: "YAML → JSON 转换", intro: "解析 YAML 并转成 JSON，方便配置迁移。", icon: "🧾", render: () => <YamlToJson /> },
  "dev-json-to-yaml": { title: "JSON → YAML 转换", intro: "将 JSON 转成缩进整洁的 YAML，方便写配置文件。", icon: "🧾", render: () => <JsonToYaml /> },
  "dev-csv-to-json": { title: "CSV → JSON 转换", intro: "第一行为表头，将 CSV 表格转为 JSON 数组。", icon: "📊", render: () => <CsvToJson /> },
  "dev-xml-format": { title: "XML 格式化 / 压缩", intro: "将紧凑 XML 格式化为易读结构，或压缩去空白。", icon: "🗂️", render: () => <XmlFormatter /> },
  "dev-sql-format": { title: "SQL 格式化", intro: "自动为 SQL 关键字换行缩进，快速美化查询语句。", icon: "🗄️", render: () => <SqlFormatter /> },
  "dev-regex-test": { title: "正则表达式测试", intro: "实时测试 JavaScript 正则表达式，显示匹配、分组和替换结果。", icon: "🔎", render: () => <RegexTester /> },
  "dev-cron-parse": { title: "Cron 表达式解析", intro: "把 Cron 表达式翻译成中英文自然语言，附常用示例。", icon: "🕒", render: () => <CronParser /> },
  "dev-http-status": { title: "HTTP 状态码查询", intro: "常见 HTTP 状态码含义速查表，支持关键词搜索。", icon: "🌐", render: () => <HttpStatusLookup /> },
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
