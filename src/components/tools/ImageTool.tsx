import * as React from "react";
import imageCompression from "browser-image-compression";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolShell, type FaqItem } from "./ToolShell";
import { FileDrop } from "./FileDrop";
import { Loader2, Download } from "lucide-react";
import { encodeIco } from "@/lib/tools/ico";

export type ImageKind =
  | "compress" | "resize" | "png-to-jpg" | "jpg-to-png" | "jpg-to-webp" | "webp-to-jpg"
  | "crop" | "watermark" | "ico" | "qrcode" | "id-photo" | "barcode";

type Config = {
  title: string; intro: string; icon?: string;
  accept: string; multiple: boolean; needsFile: boolean;
  formulas?: string[]; faqs?: FaqItem[]; hint?: string;
};

const CONFIGS: Record<ImageKind, Config> = {
  compress: { title: "图片压缩", icon: "🗜️", intro: "在浏览器本地压缩 JPG / PNG / WebP，不会上传到服务器。",
    accept: "image/jpeg,image/png,image/webp", multiple: false, needsFile: true,
    faqs: [{ q: "为什么压缩后画质有损？", a: "JPG / WebP 属于有损格式，画质越低文件越小；建议选 70-85 之间。" }] },
  resize: { title: "图片尺寸调整", icon: "📐", intro: "按像素调整图片宽高，可锁定比例。",
    accept: "image/jpeg,image/png,image/webp", multiple: false, needsFile: true },
  "png-to-jpg": { title: "PNG 转 JPG", icon: "🖼️", intro: "把 PNG 转成 JPG（透明区域自动填充白色）。",
    accept: "image/png", multiple: false, needsFile: true },
  "jpg-to-png": { title: "JPG 转 PNG", icon: "🖼️", intro: "把 JPG 转成 PNG。",
    accept: "image/jpeg", multiple: false, needsFile: true },
  "jpg-to-webp": { title: "JPG 转 WebP", icon: "🌐", intro: "把 JPG / PNG 转成体积更小的 WebP。",
    accept: "image/jpeg,image/png", multiple: false, needsFile: true },
  "webp-to-jpg": { title: "WebP 转 JPG", icon: "🖼️", intro: "把 WebP 转成 JPG。",
    accept: "image/webp", multiple: false, needsFile: true },
  crop: { title: "图片裁剪", icon: "✂️", intro: "输入裁剪区域（左 X、上 Y、宽、高，单位像素）导出。",
    accept: "image/jpeg,image/png,image/webp", multiple: false, needsFile: true },
  watermark: { title: "图片加水印", icon: "💧", intro: "为图片添加文字水印，支持位置、大小、透明度、颜色。",
    accept: "image/jpeg,image/png,image/webp", multiple: false, needsFile: true },
  ico: { title: "ICO 图标生成", icon: "🎯", intro: "从 PNG / JPG 生成多尺寸 favicon.ico（16 / 32 / 48）。",
    accept: "image/png,image/jpeg", multiple: false, needsFile: true },
  qrcode: { title: "二维码生成", icon: "🔳", intro: "把文字或网址生成二维码 PNG，可直接下载。",
    accept: "", multiple: false, needsFile: false },
  "id-photo": { title: "证件照尺寸调整", icon: "🪪", intro: "按常见证件照尺寸（1 寸/2 寸/护照/签证）居中裁剪并填色底。",
    accept: "image/jpeg,image/png,image/webp", multiple: false, needsFile: true,
    faqs: [{ q: "白底/蓝底/红底怎么选？", a: "选择需要的底色后，工具会用该颜色填充空白区域。" }] },
  barcode: { title: "条形码生成", icon: "📊", intro: "根据 CODE128/EAN-13/UPC 等格式生成条形码 PNG，浏览器本地生成。",
    accept: "", multiple: false, needsFile: false },
};

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally { setTimeout(() => URL.revokeObjectURL(url), 30_000); }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error("导出失败")), type, quality);
  });
}

export function ImageTool({ kind }: { kind: ImageKind }) {
  const cfg = CONFIGS[kind];
  const [files, setFiles] = React.useState<File[]>([]);
  const [busy, setBusy] = React.useState(false);

  // compress
  const [quality, setQuality] = React.useState(80);
  // resize
  const [dims, setDims] = React.useState({ w: 0, h: 0, keepRatio: true });
  const [natural, setNatural] = React.useState<{ w: number; h: number } | null>(null);
  // crop
  const [crop, setCrop] = React.useState({ x: 0, y: 0, w: 0, h: 0 });
  // watermark
  const [wm, setWm] = React.useState({
    text: "© Lione Apps", size: 32, opacity: 0.4, color: "#ffffff",
    position: "br" as "tl" | "tr" | "bl" | "br" | "center",
  });
  // qrcode
  const [qrText, setQrText] = React.useState("https://lioneapps.com");
  const [qrPreview, setQrPreview] = React.useState<string>("");
  // id-photo
  const idPresets = React.useMemo(() => ({
    "1inch": { name: "1 寸", w: 295, h: 413 },
    "2inch": { name: "2 寸", w: 413, h: 626 },
    "small2": { name: "小 2 寸", w: 413, h: 531 },
    "passport": { name: "护照 (33×48mm)", w: 390, h: 567 },
    "visa": { name: "美国签证 (2×2 in)", w: 600, h: 600 },
  }), []);
  const [idPreset, setIdPreset] = React.useState<keyof typeof idPresets>("1inch");
  const [idBg, setIdBg] = React.useState("#ffffff");
  // barcode
  const [bcText, setBcText] = React.useState("LIONEAPPS-2026");
  const [bcFormat, setBcFormat] = React.useState<"CODE128" | "CODE39" | "EAN13" | "EAN8" | "UPC" | "ITF14">("CODE128");
  const bcPreviewRef = React.useRef<HTMLCanvasElement | null>(null);

  // Load natural size when a file is present (for resize/crop defaults)
  React.useEffect(() => {
    if (!cfg.needsFile || files.length === 0) { setNatural(null); return; }
    (async () => {
      try {
        const img = await loadImage(files[0]);
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
        setDims((d) => (d.w === 0 && d.h === 0 ? { ...d, w: img.naturalWidth, h: img.naturalHeight } : d));
        setCrop((c) => (c.w === 0 && c.h === 0
          ? { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight } : c));
      } catch { /* noop */ }
    })();
  }, [files, cfg.needsFile]);

  // Live QR preview
  React.useEffect(() => {
    if (kind !== "qrcode") return;
    if (!qrText.trim()) { setQrPreview(""); return; }
    QRCode.toDataURL(qrText, { width: 320, margin: 2 }).then(setQrPreview).catch(() => setQrPreview(""));
  }, [kind, qrText]);

  // Live barcode preview
  React.useEffect(() => {
    if (kind !== "barcode" || !bcPreviewRef.current) return;
    try { JsBarcode(bcPreviewRef.current, bcText || " ", { format: bcFormat, width: 2, height: 90, displayValue: true }); }
    catch { /* invalid code for chosen format */ }
  }, [kind, bcText, bcFormat]);

  async function run() {
    if (cfg.needsFile && files.length === 0) { toast.error("请先上传图片"); return; }
    setBusy(true);
    try {
      switch (kind) {
        case "compress": await opCompress(files[0], quality); break;
        case "resize": await opResize(files[0], dims); break;
        case "png-to-jpg": await opConvert(files[0], "image/jpeg", 0.92, true); break;
        case "jpg-to-png": await opConvert(files[0], "image/png"); break;
        case "jpg-to-webp": await opConvert(files[0], "image/webp", 0.85); break;
        case "webp-to-jpg": await opConvert(files[0], "image/jpeg", 0.92, true); break;
        case "crop": await opCrop(files[0], crop); break;
        case "watermark": await opWatermark(files[0], wm); break;
        case "ico": await opIco(files[0]); break;
        case "qrcode": await opQr(qrText); break;
        case "id-photo": await opIdPhoto(files[0], idPresets[idPreset], idBg); break;
        case "barcode": await opBarcode(bcText, bcFormat); break;
      }
      toast.success("处理完成，已开始下载");
    } catch (e) {
      console.error(e);
      toast.error(`处理失败：${e instanceof Error ? e.message : "未知错误"}`);
    } finally { setBusy(false); }
  }

  return (
    <ToolShell title={cfg.title} intro={cfg.intro} icon={cfg.icon} formulas={cfg.formulas} faqs={cfg.faqs}>
      <section className="space-y-4">
        {cfg.needsFile && (
          <FileDrop accept={cfg.accept} multiple={cfg.multiple} files={files} onChange={setFiles} hint={cfg.hint} />
        )}

        {kind === "compress" && (
          <SliderRow label={`压缩质量：${quality}`} min={30} max={95} value={quality} onChange={setQuality} />
        )}

        {kind === "resize" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumField label="宽度 (px)" value={dims.w} onChange={(w) => setDims((d) => {
              if (d.keepRatio && natural) return { ...d, w, h: Math.round(w * natural.h / natural.w) };
              return { ...d, w };
            })} />
            <NumField label="高度 (px)" value={dims.h} onChange={(h) => setDims((d) => {
              if (d.keepRatio && natural) return { ...d, h, w: Math.round(h * natural.w / natural.h) };
              return { ...d, h };
            })} />
            <label className="col-span-full inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={dims.keepRatio}
                onChange={(e) => setDims((d) => ({ ...d, keepRatio: e.target.checked }))} />
              保持宽高比{natural ? `（原图 ${natural.w}×${natural.h}）` : ""}
            </label>
          </div>
        )}

        {kind === "crop" && (
          <div className="grid gap-3 sm:grid-cols-4">
            <NumField label="X" value={crop.x} onChange={(x) => setCrop({ ...crop, x })} />
            <NumField label="Y" value={crop.y} onChange={(y) => setCrop({ ...crop, y })} />
            <NumField label="宽" value={crop.w} onChange={(w) => setCrop({ ...crop, w })} />
            <NumField label="高" value={crop.h} onChange={(h) => setCrop({ ...crop, h })} />
            {natural && <p className="col-span-full text-xs text-muted-foreground">原图 {natural.w}×{natural.h} px</p>}
          </div>
        )}

        {kind === "watermark" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="水印文字" value={wm.text} onChange={(text) => setWm({ ...wm, text })} className="sm:col-span-2" />
            <NumField label="字号 (px)" value={wm.size} onChange={(size) => setWm({ ...wm, size })} />
            <SliderRow label={`不透明度：${wm.opacity.toFixed(2)}`} min={5} max={100} value={Math.round(wm.opacity * 100)}
              onChange={(v) => setWm({ ...wm, opacity: v / 100 })} />
            <div>
              <label className="block text-sm font-medium mb-1.5">颜色</label>
              <input type="color" value={wm.color} onChange={(e) => setWm({ ...wm, color: e.target.value })}
                className="h-10 w-20 rounded border border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">位置</label>
              <select value={wm.position} onChange={(e) => setWm({ ...wm, position: e.target.value as typeof wm.position })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm">
                <option value="tl">左上</option><option value="tr">右上</option>
                <option value="bl">左下</option><option value="br">右下</option>
                <option value="center">居中</option>
              </select>
            </div>
          </div>
        )}

        {kind === "qrcode" && (
          <div className="space-y-3">
            <TextField label="二维码内容（文字或网址）" value={qrText} onChange={setQrText} />
            {qrPreview && (
              <div className="rounded-lg border border-border bg-card p-4 flex justify-center">
                <img src={qrPreview} alt="QR" className="w-56 h-56" />
              </div>
            )}
          </div>
        )}

        {kind === "id-photo" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">尺寸</label>
              <select value={idPreset} onChange={(e) => setIdPreset(e.target.value as keyof typeof idPresets)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm">
                {Object.entries(idPresets).map(([k, v]) => <option key={k} value={k}>{v.name} · {v.w}×{v.h}px</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">底色</label>
              <div className="flex items-center gap-2">
                <input type="color" value={idBg} onChange={(e) => setIdBg(e.target.value)} className="h-10 w-16 rounded border border-border" />
                {["#ffffff", "#438edb", "#dc2626"].map((c) => (
                  <button key={c} type="button" onClick={() => setIdBg(c)} className="h-8 w-8 rounded border border-border" style={{ background: c }} title={c} />
                ))}
              </div>
            </div>
            <p className="col-span-full text-xs text-muted-foreground">工具会按所选尺寸居中裁剪原图，并用底色填充空白区域。</p>
          </div>
        )}

        {kind === "barcode" && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="内容" value={bcText} onChange={setBcText} />
              <div>
                <label className="block text-sm font-medium mb-1.5">格式</label>
                <select value={bcFormat} onChange={(e) => setBcFormat(e.target.value as typeof bcFormat)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm">
                  <option value="CODE128">CODE128（推荐）</option>
                  <option value="CODE39">CODE39</option>
                  <option value="EAN13">EAN-13（13 位数字）</option>
                  <option value="EAN8">EAN-8（8 位数字）</option>
                  <option value="UPC">UPC-A（12 位数字）</option>
                  <option value="ITF14">ITF-14（14 位数字）</option>
                </select>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-white p-4 flex justify-center">
              <canvas ref={bcPreviewRef} />
            </div>
          </div>
        )}



        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={run} disabled={busy || (cfg.needsFile && files.length === 0)}>
            {busy ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Download size={14} className="mr-1.5" />}
            {busy ? "处理中…" : "开始处理并下载"}
          </Button>
        </div>
      </section>
    </ToolShell>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input type="number" value={value || ""} onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm" />
    </div>
  );
}
function TextField({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm" />
    </div>
  );
}
function SliderRow({ label, min, max, value, onChange }: {
  label: string; min: number; max: number; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}

// -------- operations --------

async function opCompress(file: File, quality: number) {
  const compressed = await imageCompression(file, {
    maxSizeMB: 20, useWebWorker: true, initialQuality: quality / 100,
  });
  saveAs(compressed, `compressed-${file.name}`);
}

async function opResize(file: File, dims: { w: number; h: number }) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = dims.w || img.naturalWidth;
  canvas.height = dims.h || img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const type = file.type || "image/png";
  const blob = await canvasToBlob(canvas, type, type === "image/png" ? undefined : 0.92);
  saveAs(blob, `resized-${file.name}`);
}

async function opConvert(file: File, type: string, quality?: number, fillWhite = false) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  if (fillWhite) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(img, 0, 0);
  const blob = await canvasToBlob(canvas, type, quality);
  const ext = type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
  saveAs(blob, file.name.replace(/\.[^.]+$/, "") + "." + ext);
}

async function opCrop(file: File, c: { x: number; y: number; w: number; h: number }) {
  if (c.w <= 0 || c.h <= 0) throw new Error("请设置有效的裁剪宽高");
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = c.w; canvas.height = c.h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
  const type = file.type || "image/png";
  const blob = await canvasToBlob(canvas, type, type === "image/png" ? undefined : 0.92);
  saveAs(blob, `cropped-${file.name}`);
}

async function opWatermark(file: File, w: {
  text: string; size: number; opacity: number; color: string;
  position: "tl" | "tr" | "bl" | "br" | "center";
}) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  ctx.font = `${w.size}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = w.color;
  ctx.globalAlpha = w.opacity;
  const metrics = ctx.measureText(w.text);
  const pad = Math.round(w.size * 0.6);
  let x = pad, y = w.size + pad;
  if (w.position === "tr") x = canvas.width - metrics.width - pad;
  if (w.position === "bl") y = canvas.height - pad;
  if (w.position === "br") { x = canvas.width - metrics.width - pad; y = canvas.height - pad; }
  if (w.position === "center") { x = (canvas.width - metrics.width) / 2; y = canvas.height / 2; }
  ctx.fillText(w.text, x, y);
  ctx.globalAlpha = 1;
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await canvasToBlob(canvas, type, 0.92);
  saveAs(blob, `watermark-${file.name.replace(/\.[^.]+$/, "")}.${type === "image/png" ? "png" : "jpg"}`);
}

async function opIco(file: File) {
  const img = await loadImage(file);
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map(async (size) => {
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, size, size);
    const blob = await canvasToBlob(canvas, "image/png");
    return { size, data: new Uint8Array(await blob.arrayBuffer()) };
  }));
  const ico = encodeIco(pngs);
  saveAs(new Blob([ico as BlobPart], { type: "image/x-icon" }), "favicon.ico");
}

async function opQr(text: string) {
  if (!text.trim()) throw new Error("请输入二维码内容");
  const dataUrl = await QRCode.toDataURL(text, { width: 1024, margin: 2 });
  const res = await fetch(dataUrl);
  saveAs(await res.blob(), "qrcode.png");
}

async function opIdPhoto(file: File, target: { w: number; h: number; name: string }, bg: string) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = target.w; canvas.height = target.h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, target.w, target.h);
  // cover-fit: scale so image fully covers, center-crop
  const scale = Math.max(target.w / img.naturalWidth, target.h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (target.w - dw) / 2;
  const dy = (target.h - dh) / 2;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, dx, dy, dw, dh);
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
  saveAs(blob, `id-photo-${target.w}x${target.h}.jpg`);
}

async function opBarcode(text: string, format: string) {
  if (!text.trim()) throw new Error("请输入条形码内容");
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, { format, width: 3, height: 140, displayValue: true, margin: 20 });
  const blob = await canvasToBlob(canvas, "image/png");
  saveAs(blob, `barcode-${format.toLowerCase()}.png`);
}
