// 文件哈希校验：拖入本地文件，浏览器本地计算 MD5 / SHA-1 / SHA-256
import * as React from "react";
import SparkMD5 from "spark-md5";
import { ToolShell, CopyButton } from "./ToolShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Algo = "MD5" | "SHA-1" | "SHA-256";

async function hashFile(file: File, algo: Algo, onProgress: (p: number) => void): Promise<string> {
  const chunkSize = 4 * 1024 * 1024;
  const total = file.size;
  if (algo === "MD5") {
    const spark = new SparkMD5.ArrayBuffer();
    for (let offset = 0; offset < total; offset += chunkSize) {
      const buf = await file.slice(offset, offset + chunkSize).arrayBuffer();
      spark.append(buf);
      onProgress(Math.min(1, (offset + buf.byteLength) / total));
    }
    return spark.end();
  }
  // Web Crypto: hash whole file (subtle.digest doesn't support streaming)
  const buf = await file.arrayBuffer();
  onProgress(0.5);
  const digest = await crypto.subtle.digest(algo === "SHA-1" ? "SHA-1" : "SHA-256", buf);
  onProgress(1);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function FileHashTool() {
  const [file, setFile] = React.useState<File | null>(null);
  const [algo, setAlgo] = React.useState<Algo>("SHA-256");
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState("");
  const [compare, setCompare] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);

  async function run(f = file) {
    if (!f) return;
    setBusy(true); setProgress(0); setResult("");
    try {
      const h = await hashFile(f, algo, setProgress);
      setResult(h);
    } catch (e) {
      setResult("计算失败：" + (e instanceof Error ? e.message : ""));
    } finally { setBusy(false); }
  }

  const match = compare.trim() && result && compare.trim().toLowerCase() === result.toLowerCase();
  const mismatch = compare.trim() && result && !match;

  return (
    <ToolShell
      title="文件 Hash 校验"
      intro="拖入文件即可在浏览器本地计算 MD5 / SHA-1 / SHA-256，不上传服务器。可与官方 checksum 对比验证下载完整性。"
      icon="🧪"
      faqs={[
        { q: "文件会上传吗？", a: "不会。所有哈希均在浏览器本地通过 WebCrypto / SparkMD5 计算。" },
        { q: "大文件会卡吗？", a: "MD5 支持分块流式计算，SHA-1 / SHA-256 需要一次性读入内存，建议 <1GB。" },
      ]}
    >
      <section
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) { setFile(f); run(f); }
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-primary bg-primary/5" : "border-border bg-card"}`}
      >
        <div className="text-4xl mb-2">📥</div>
        <p className="text-sm text-muted-foreground mb-3">拖入文件到此处，或点击选择文件</p>
        <input id="fh-file" type="file" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0]; if (f) { setFile(f); run(f); }
        }} />
        <label htmlFor="fh-file"><Button asChild size="sm"><span>选择文件</span></Button></label>
        {file && <div className="mt-3 text-xs text-muted-foreground">已选：<span className="font-mono">{file.name}</span> · {(file.size / 1024 / 1024).toFixed(2)} MB</div>}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium">算法：</label>
          {(["MD5", "SHA-1", "SHA-256"] as Algo[]).map((a) => (
            <label key={a} className="text-sm flex items-center gap-1">
              <input type="radio" name="algo" value={a} checked={algo === a} onChange={() => setAlgo(a)} />
              {a}
            </label>
          ))}
          <Button size="sm" onClick={() => run()} disabled={!file || busy}>{busy ? "计算中…" : "重新计算"}</Button>
        </div>

        {busy && (
          <div className="w-full h-2 rounded bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}

        <div>
          <div className="text-sm font-semibold mb-2 flex items-center justify-between">
            <span>结果 ({algo})</span>
            {result && <CopyButton text={result} />}
          </div>
          <div className="font-mono text-xs md:text-sm break-all rounded border border-border bg-muted/30 p-3 min-h-[52px]">
            {result || <span className="text-muted-foreground">— 尚无结果 —</span>}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-1 block">对比校验值（可选）</label>
          <Input value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="粘贴官方提供的 hash 校验值" className="font-mono" />
          {match && <div className="mt-2 text-sm text-emerald-600 font-medium">✓ 校验通过，文件完整。</div>}
          {mismatch && <div className="mt-2 text-sm text-destructive font-medium">✗ 不匹配，文件可能已损坏或被篡改。</div>}
        </div>
      </section>
    </ToolShell>
  );
}
