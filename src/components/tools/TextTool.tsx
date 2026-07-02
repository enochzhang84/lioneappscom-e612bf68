// 文本类工具：字数统计、大小写、繁简、去重、Base64、URL、MD5、SHA256、HTML entity、排序、比较、Markdown 转 HTML
import * as React from "react";
import SparkMD5 from "spark-md5";
import { Converter as OpenCCConverter } from "opencc-js";
import { marked } from "marked";
import { diffLines } from "diff";
import { ToolShell, CopyButton, type FaqItem } from "./ToolShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Op = { label: string; run: (s: string) => Promise<string> | string };

async function sha256(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function htmlEncode(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
function htmlDecode(s: string) {
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
}

let s2t: ((s: string) => string) | null = null;
let t2s: ((s: string) => string) | null = null;
function getOpenCC(dir: "s2t" | "t2s") {
  if (dir === "s2t") {
    if (!s2t) s2t = OpenCCConverter({ from: "cn", to: "twp" });
    return s2t;
  }
  if (!t2s) t2s = OpenCCConverter({ from: "twp", to: "cn" });
  return t2s;
}

type ToolDef = {
  title: string;
  intro: string;
  icon?: string;
  placeholder?: string;
  ops: Op[];
  formulas?: string[];
  faqs?: FaqItem[];
  stats?: boolean; // 字数统计模式
};

const TOOLS: Record<string, ToolDef> = {
  "text-word-count": {
    title: "字数统计工具",
    intro: "统计中英文字符、单词、汉字、空格、行数，实时更新，无需上传。",
    icon: "📝",
    stats: true,
    ops: [],
    placeholder: "在此粘贴或输入文本…",
    faqs: [
      { q: "汉字与英文单词怎么区分？", a: "本工具按 Unicode 范围识别 CJK 汉字，用空白/标点切分英文单词。" },
    ],
  },
  "text-case": {
    title: "大小写转换工具",
    intro: "英文大小写、标题式、驼峰、蛇形、短横线格式一键互转。",
    icon: "🔤",
    placeholder: "Hello world example…",
    ops: [
      { label: "全部大写 UPPER", run: (s) => s.toUpperCase() },
      { label: "全部小写 lower", run: (s) => s.toLowerCase() },
      { label: "首字母大写 Title", run: (s) => s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase()) },
      { label: "句首大写 Sentence", run: (s) => s.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase()) },
      { label: "驼峰 camelCase", run: (s) => s.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
      { label: "蛇形 snake_case", run: (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") },
      { label: "短横线 kebab-case", run: (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
      { label: "常量 UPPER_SNAKE", run: (s) => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "") },
    ],
  },
  "text-tw-cn": {
    title: "繁体简体中文互转",
    intro: "基于 OpenCC 词典库，支持简体 ↔ 繁体（台湾常用词）互转。",
    icon: "🀄",
    placeholder: "输入或粘贴中文…",
    ops: [
      { label: "简体 → 繁体 (台湾)", run: (s) => getOpenCC("s2t")(s) },
      { label: "繁体 → 简体", run: (s) => getOpenCC("t2s")(s) },
    ],
    faqs: [
      { q: "为什么『面』翻译成『麵』而不是『面』？", a: "OpenCC 使用台湾常用词典 (twp)，考虑词组语义，比字对字更自然。" },
    ],
  },
  "text-dedupe": {
    title: "文本去重工具",
    intro: "按行去重，保留原顺序或按字母排序，去除空行。",
    icon: "🧹",
    placeholder: "每行一条数据…",
    ops: [
      { label: "去重 (保序)", run: (s) => Array.from(new Set(s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))).join("\n") },
      { label: "去重 + 排序", run: (s) => Array.from(new Set(s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))).sort().join("\n") },
      { label: "统计每行出现次数", run: (s) => {
        const m = new Map<string, number>();
        for (const l of s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) m.set(l, (m.get(l) ?? 0) + 1);
        return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}\t${k}`).join("\n");
      } },
    ],
  },
  "text-base64": {
    title: "Base64 编码 / 解码",
    intro: "支持中文 UTF-8 Base64 编解码，浏览器本地运行，不上传数据。",
    icon: "🔐",
    placeholder: "输入文本或 Base64 字符串…",
    ops: [
      { label: "编码 → Base64", run: (s) => btoa(unescape(encodeURIComponent(s))) },
      { label: "解码 → 原文", run: (s) => {
        try { return decodeURIComponent(escape(atob(s.trim()))); } catch { return "解码失败：不是合法的 Base64 字符串"; }
      } },
    ],
  },
  "text-url": {
    title: "URL 编码 / 解码",
    intro: "对 URL 参数进行 encodeURIComponent / decodeURIComponent 编解码。",
    icon: "🔗",
    placeholder: "输入 URL 或参数…",
    ops: [
      { label: "编码 encodeURIComponent", run: (s) => encodeURIComponent(s) },
      { label: "解码 decodeURIComponent", run: (s) => { try { return decodeURIComponent(s); } catch { return "解码失败"; } } },
      { label: "整段 URL 编码", run: (s) => encodeURI(s) },
      { label: "整段 URL 解码", run: (s) => { try { return decodeURI(s); } catch { return "解码失败"; } } },
    ],
  },
  "text-html": {
    title: "HTML 实体编码 / 解码",
    intro: "将 <、>、& 等特殊字符转换为 HTML entity，避免 XSS。",
    icon: "🧾",
    placeholder: "<div>hello</div>",
    ops: [
      { label: "编码 → HTML entity", run: htmlEncode },
      { label: "解码 → 原文", run: htmlDecode },
    ],
  },
  "text-md5": {
    title: "MD5 生成器",
    intro: "对输入文本生成 32 位 MD5 哈希。浏览器本地运行，不上传数据。",
    icon: "🔑",
    placeholder: "输入需要计算 MD5 的文本…",
    ops: [
      { label: "生成 MD5 (小写)", run: (s) => SparkMD5.hash(s) },
      { label: "生成 MD5 (大写)", run: (s) => SparkMD5.hash(s).toUpperCase() },
    ],
    faqs: [
      { q: "MD5 还能用来存密码吗？", a: "不安全。MD5 已被证明可碰撞，密码存储应使用 bcrypt/argon2。" },
    ],
  },
  "text-sha256": {
    title: "SHA-256 生成器",
    intro: "对输入文本生成 64 位 SHA-256 哈希。浏览器本地运行，不上传数据。",
    icon: "🛡️",
    placeholder: "输入文本…",
    ops: [
      { label: "生成 SHA-256", run: (s) => sha256(s) },
      { label: "生成 SHA-256 (大写)", run: async (s) => (await sha256(s)).toUpperCase() },
    ],
  },
};

function wordStats(s: string) {
  const chars = s.length;
  const charsNoSpace = s.replace(/\s/g, "").length;
  const cjk = (s.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (s.trim().match(/[A-Za-z0-9]+/g) ?? []).length;
  const lines = s === "" ? 0 : s.split(/\r?\n/).length;
  const bytes = new Blob([s]).size;
  return { chars, charsNoSpace, cjk, words, lines, bytes };
}

export function TextToolByKey({ toolKey }: { toolKey: string }) {
  // Custom-UI tools
  if (toolKey === "text-sort") return <TextSortView />;
  if (toolKey === "text-compare") return <TextCompareView />;
  if (toolKey === "text-md-to-html") return <MarkdownToHtmlView />;

  const tool = TOOLS[toolKey];
  const [text, setText] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [running, setRunning] = React.useState<string | null>(null);

  if (!tool) return <div className="p-10 text-center text-sm text-destructive">未找到工具：{toolKey}</div>;


  async function run(op: Op) {
    setRunning(op.label);
    try {
      const r = await op.run(text);
      setOutput(String(r));
    } catch (e) {
      setOutput("处理失败：" + (e instanceof Error ? e.message : String(e)));
    } finally {
      setRunning(null);
    }
  }

  return (
    <ToolShell title={tool.title} intro={tool.intro} icon={tool.icon} faqs={tool.faqs}>
      <section className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
        <div>
          <div className="text-sm font-semibold mb-2">输入</div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tool.placeholder}
            className="min-h-[160px] font-mono text-sm"
          />
        </div>

        {tool.stats ? (
          <StatsPanel stats={wordStats(text)} />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {tool.ops.map((op) => (
                <Button key={op.label} onClick={() => run(op)} disabled={running !== null} size="sm">
                  {running === op.label ? "处理中…" : op.label}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => { setText(""); setOutput(""); }}>清空</Button>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2 flex items-center justify-between">
                <span>输出</span>
                {output && <CopyButton text={output} />}
              </div>
              <Textarea readOnly value={output} placeholder="点击上方按钮生成结果…"
                className="min-h-[140px] font-mono text-sm bg-muted/30" />
            </div>
          </>
        )}
      </section>
    </ToolShell>
  );
}

function StatsPanel({ stats }: { stats: ReturnType<typeof wordStats> }) {
  const items = [
    { label: "总字符数", value: stats.chars },
    { label: "不含空白字符", value: stats.charsNoSpace },
    { label: "汉字数", value: stats.cjk },
    { label: "英文单词", value: stats.words },
    { label: "行数", value: stats.lines },
    { label: "字节数 (UTF-8)", value: stats.bytes },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div className="text-2xl font-bold tabular-nums mt-1">{it.value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

export const TEXT_TOOL_KEYS = Object.keys(TOOLS);
