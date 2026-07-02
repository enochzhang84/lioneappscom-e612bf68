import * as React from "react";
import { PDFDocument, degrees } from "pdf-lib";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolShell, type FaqItem } from "./ToolShell";
import { FileDrop } from "./FileDrop";
import { Loader2, Download } from "lucide-react";
import { pdfjs } from "@/lib/tools/pdfjs";

export type PdfKind =
  | "merge" | "split" | "compress" | "to-jpg" | "from-jpg" | "delete-pages" | "rotate";

type Config = {
  title: string;
  intro: string;
  icon?: string;
  accept: string;
  multiple: boolean;
  hint?: string;
  formulas?: string[];
  faqs?: FaqItem[];
};

const CONFIGS: Record<PdfKind, Config> = {
  "merge": {
    title: "PDF 合并", icon: "📎",
    intro: "在线合并多个 PDF 文件为一个，全部在浏览器本地处理，文件不上传服务器。",
    accept: "application/pdf", multiple: true,
    hint: "可选择多个 PDF，支持拖拽排序（↑↓ 按钮）",
    faqs: [
      { q: "文件会上传到服务器吗？", a: "不会。所有 PDF 处理都在浏览器本地完成，文件不会离开你的设备。" },
      { q: "支持多少个文件？", a: "理论上没有硬性限制，但建议单次合并不超过 50 个大文件，以免浏览器内存不足。" },
    ],
  },
  "split": {
    title: "PDF 拆分", icon: "✂️",
    intro: "按页码范围拆分 PDF，例如 1-3,5,8-10。",
    accept: "application/pdf", multiple: false, hint: "上传单个 PDF",
    faqs: [{ q: "页码范围怎么写？", a: '用逗号分隔，例如 "1-3,5,8-10" 会导出这些页组成的新 PDF。' }],
  },
  "compress": {
    title: "PDF 压缩", icon: "🗜️",
    intro: "通过重新解析对象结构压缩 PDF。对含大量图片的 PDF 效果更好。",
    accept: "application/pdf", multiple: false,
    formulas: [
      "低：仅去除冗余对象（改动最小）",
      "中：低 + 精简元数据",
      "高：中 + 去除注释、附件等次要资源",
    ],
    faqs: [{ q: "为什么有时压缩效果不明显？", a: "如果 PDF 主要是文字，本身已经很小；含大图片的扫描 PDF 通常压缩效果更明显。" }],
  },
  "to-jpg": {
    title: "PDF 转 JPG", icon: "🖼️",
    intro: "将 PDF 每页渲染为 JPG 图片，多页自动打包为 ZIP。",
    accept: "application/pdf", multiple: false,
    faqs: [{ q: "图片质量如何？", a: "默认 2x 缩放（高清），可在导出前预览页数。" }],
  },
  "from-jpg": {
    title: "JPG 转 PDF", icon: "📄",
    intro: "把多张 JPG / PNG 图片合成一个 PDF，每张图片一页。",
    accept: "image/jpeg,image/png", multiple: true,
    hint: "可上传多张，↑↓ 调整顺序",
  },
  "delete-pages": {
    title: "PDF 删除页面", icon: "❌",
    intro: "输入要删除的页码（例如 2,4-5），导出剩余页面组成的新 PDF。",
    accept: "application/pdf", multiple: false,
  },
  "rotate": {
    title: "PDF 旋转页面", icon: "🔄",
    intro: "把整个 PDF 或指定页面旋转 90 / 180 / 270 度。",
    accept: "application/pdf", multiple: false,
  },
};

function parseRanges(input: string, max: number): number[] {
  const out = new Set<number>();
  for (const part of input.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
      if (i >= 1 && i <= max) out.add(i);
    }
  }
  return [...out].sort((x, y) => x - y);
}

export function PdfTool({ kind }: { kind: PdfKind }) {
  const cfg = CONFIGS[kind];
  const [files, setFiles] = React.useState<File[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [pageCount, setPageCount] = React.useState<number | null>(null);
  const [ranges, setRanges] = React.useState("");
  const [rotation, setRotation] = React.useState<90 | 180 | 270>(90);
  const [rotateRanges, setRotateRanges] = React.useState("");
  const [level, setLevel] = React.useState<"low" | "medium" | "high">("medium");

  // Detect page count when single-file kinds get a file
  React.useEffect(() => {
    if (cfg.multiple || files.length === 0) { setPageCount(null); return; }
    (async () => {
      try {
        const bytes = new Uint8Array(await files[0].arrayBuffer());
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        setPageCount(doc.getPageCount());
      } catch { setPageCount(null); }
    })();
  }, [files, cfg.multiple]);

  async function run() {
    if (files.length === 0) { toast.error("请先上传文件"); return; }
    setBusy(true);
    try {
      switch (kind) {
        case "merge": await runMerge(files); break;
        case "split": await runSplit(files[0], ranges); break;
        case "compress": await runCompress(files[0], level); break;
        case "to-jpg": await runToJpg(files[0]); break;
        case "from-jpg": await runFromJpg(files); break;
        case "delete-pages": await runDelete(files[0], ranges); break;
        case "rotate": await runRotate(files[0], rotation, rotateRanges); break;
      }
      toast.success("处理完成，已开始下载");
    } catch (e) {
      console.error(e);
      toast.error(`处理失败：${e instanceof Error ? e.message : "未知错误"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell title={cfg.title} intro={cfg.intro} icon={cfg.icon} formulas={cfg.formulas} faqs={cfg.faqs}>
      <section className="space-y-4">
        <FileDrop
          accept={cfg.accept} multiple={cfg.multiple} files={files}
          onChange={setFiles} hint={cfg.hint}
        />

        {/* Kind-specific controls */}
        {(kind === "split" || kind === "delete-pages") && (
          <RangeInput
            label={kind === "split" ? "要保留的页码" : "要删除的页码"}
            value={ranges} onChange={setRanges} pageCount={pageCount}
          />
        )}

        {kind === "compress" && (
          <SelectRow label="压缩等级" value={level} onChange={(v) => setLevel(v as typeof level)}
            options={[["low", "低（安全）"], ["medium", "中（推荐）"], ["high", "高（激进）"]]} />
        )}

        {kind === "rotate" && (
          <>
            <SelectRow label="旋转角度" value={String(rotation)}
              onChange={(v) => setRotation(Number(v) as 90 | 180 | 270)}
              options={[["90", "90° 顺时针"], ["180", "180°"], ["270", "270° 顺时针"]]} />
            <RangeInput
              label="要旋转的页码（留空 = 全部）"
              value={rotateRanges} onChange={setRotateRanges} pageCount={pageCount}
            />
          </>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={run} disabled={busy || files.length === 0}>
            {busy ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Download size={14} className="mr-1.5" />}
            {busy ? "处理中…" : "开始处理并下载"}
          </Button>
          {pageCount != null && <span className="text-xs text-muted-foreground">共 {pageCount} 页</span>}
        </div>
      </section>
    </ToolShell>
  );
}

function SelectRow({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full md:w-64 h-10 px-3 rounded-lg border border-border bg-card text-sm">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function RangeInput({ label, value, onChange, pageCount }: {
  label: string; value: string; onChange: (v: string) => void; pageCount: number | null;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={pageCount ? `例如 1-3,5,${pageCount}` : "例如 1-3,5,8"}
        className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground/60" />
      <p className="mt-1 text-xs text-muted-foreground">
        用逗号分隔多个页码或范围{pageCount ? ` · 共 ${pageCount} 页` : ""}
      </p>
    </div>
  );
}

// -------- operations --------

async function runMerge(files: File[]) {
  const out = await PDFDocument.create();
  for (const f of files) {
    const src = await PDFDocument.load(new Uint8Array(await f.arrayBuffer()), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save();
  saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), "merged.pdf");
}

async function runSplit(file: File, ranges: string) {
  const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
  const pages = parseRanges(ranges, src.getPageCount());
  if (pages.length === 0) throw new Error("请输入有效的页码范围");
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, pages.map((n) => n - 1));
  copied.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), file.name.replace(/\.pdf$/i, "") + "-split.pdf");
}

async function runCompress(file: File, level: "low" | "medium" | "high") {
  const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
  if (level !== "low") {
    src.setTitle(""); src.setAuthor(""); src.setSubject(""); src.setKeywords([]);
    src.setProducer(""); src.setCreator("");
  }
  if (level === "high") {
    // Drop annotations & non-essential resources
    for (const page of src.getPages()) {
      const dict = page.node;
      try { dict.delete(dict.context.obj("Annots").asPDFName ? dict.context.obj("Annots").asPDFName() : (dict as unknown as { context: { obj: (n: string) => unknown } }).context.obj("Annots") as never); } catch { /* noop */ }
    }
  }
  const bytes = await src.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: level === "high" ? 200 : 50,
  });
  saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }),
    file.name.replace(/\.pdf$/i, "") + "-compressed.pdf");
}

async function runToJpg(file: File) {
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const zip = new JSZip();
  const scale = 2;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width; canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
    if (blob) zip.file(`page-${String(i).padStart(3, "0")}.jpg`, blob);
  }
  const base = file.name.replace(/\.pdf$/i, "");
  if (doc.numPages === 1) {
    const blob = await zip.file(`page-001.jpg`)!.async("blob");
    saveAs(blob, `${base}.jpg`);
  } else {
    saveAs(await zip.generateAsync({ type: "blob" }), `${base}.zip`);
  }
}

async function runFromJpg(files: File[]) {
  const out = await PDFDocument.create();
  for (const f of files) {
    const bytes = new Uint8Array(await f.arrayBuffer());
    const img = /png$/i.test(f.type) || /\.png$/i.test(f.name)
      ? await out.embedPng(bytes)
      : await out.embedJpg(bytes);
    const page = out.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await out.save();
  saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }), "images.pdf");
}

async function runDelete(file: File, ranges: string) {
  const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
  const toDelete = new Set(parseRanges(ranges, src.getPageCount()).map((n) => n - 1));
  if (toDelete.size === 0) throw new Error("请输入要删除的页码");
  const keep = src.getPageIndices().filter((i) => !toDelete.has(i));
  if (keep.length === 0) throw new Error("不能删除全部页面");
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, keep);
  copied.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }),
    file.name.replace(/\.pdf$/i, "") + "-trimmed.pdf");
}

async function runRotate(file: File, deg: 90 | 180 | 270, rangesStr: string) {
  const src = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), { ignoreEncryption: true });
  const target = rangesStr.trim()
    ? new Set(parseRanges(rangesStr, src.getPageCount()).map((n) => n - 1))
    : null;
  src.getPages().forEach((page, idx) => {
    if (!target || target.has(idx)) {
      const cur = page.getRotation().angle;
      page.setRotation(degrees((cur + deg) % 360));
    }
  });
  const bytes = await src.save();
  saveAs(new Blob([bytes as BlobPart], { type: "application/pdf" }),
    file.name.replace(/\.pdf$/i, "") + "-rotated.pdf");
}
