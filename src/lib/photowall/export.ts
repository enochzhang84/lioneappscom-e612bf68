// Photo Wall Studio — 视频导出（Canvas + MediaRecorder，优先 H.264/AAC MP4）
import type { PWProject } from "./types";
import { buildTimeline, drawFrame, type ImageMap } from "./render";
import { getAsset } from "./store";

export interface ExportOptions {
  project: PWProject;
  images: ImageMap;
  width: number;
  height: number;
  fps?: number;
  /** 目标容器：auto 时自动挑选浏览器支持的最佳格式 */
  format?: "auto" | "mp4" | "webm";
  /** 视频码率（bps）；不传按分辨率自动估算 */
  videoBitrate?: number;
  includeMusic?: boolean;
  includeText?: boolean;
  /** 导出范围（秒），不传则导出完整时间轴 */
  rangeStart?: number;
  rangeEnd?: number;
  onProgress?: (p: { percent: number; elapsed: number; remaining: number; bytes: number }) => void;
  signal?: { cancelled: boolean };
}

const MIME_CANDIDATES = [
  'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
  "video/mp4",
  'video/webm;codecs="vp9,opus"',
  "video/webm",
];

export function pickMime(prefer: "auto" | "mp4" | "webm" = "auto"): { mime: string; ext: string } {
  const list =
    prefer === "auto"
      ? MIME_CANDIDATES
      : MIME_CANDIDATES.filter((m) => (prefer === "mp4" ? m.startsWith("video/mp4") : m.startsWith("video/webm")));
  for (const m of list) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
      return { mime: m, ext: m.startsWith("video/mp4") ? "mp4" : "webm" };
    }
  }
  return { mime: "", ext: prefer === "mp4" ? "mp4" : "webm" };
}

export async function exportVideo(opts: ExportOptions): Promise<{ blob: Blob; ext: string }> {
  const { images, width, height } = opts;
  const fps = opts.fps ?? 30;
  const includeMusic = opts.includeMusic !== false;
  const includeText = opts.includeText !== false;
  const project = includeText ? opts.project : { ...opts.project, texts: [] };
  const tl = buildTimeline(project);
  const from = Math.max(0, opts.rangeStart ?? 0);
  const to = Math.min(tl.total, opts.rangeEnd && opts.rangeEnd > from ? opts.rangeEnd : tl.total);
  const total = Math.max(0.1, to - from);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(fps);

  // 音轨
  let audioCtx: AudioContext | null = null;
  const sources: AudioBufferSourceNode[] = [];
  if (includeMusic && project.music.length > 0) {
    try {
      audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      for (const m of project.music) {
        if (m.muted) continue;
        const blob = await getAsset(m.assetId);
        if (!blob) continue;
        const buf = await audioCtx.decodeAudioData(await blob.arrayBuffer());
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        src.loop = m.loop;
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;
        const offset = Math.max(0, (m.startTime ?? 0) - from);
        gain.gain.setValueAtTime(m.fadeIn > 0 ? 0.0001 : m.volume, now + offset);
        if (m.fadeIn > 0) gain.gain.linearRampToValueAtTime(m.volume, now + offset + m.fadeIn);
        if (m.fadeOut > 0) {
          gain.gain.setValueAtTime(m.volume, now + Math.max(0, total - m.fadeOut));
          gain.gain.linearRampToValueAtTime(0.0001, now + total);
        }
        src.connect(gain).connect(dest);
        src.start(now + offset, m.trimStart || 0);
        src.stop(now + total);
        sources.push(src);
      }
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      audioCtx = null;
    }
  }

  const { mime, ext } = pickMime(opts.format ?? "auto");
  const rec = new MediaRecorder(stream, {
    ...(mime ? { mimeType: mime } : {}),
    videoBitsPerSecond: opts.videoBitrate ?? Math.round(width * height * fps * 0.09),
    audioBitsPerSecond: 128000,
  });
  const chunks: Blob[] = [];
  let bytes = 0;
  rec.ondataavailable = (e) => {
    if (e.data.size) {
      chunks.push(e.data);
      bytes += e.data.size;
    }
  };

  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: mime || "video/webm" }));
  });

  rec.start(1000);
  const startWall = performance.now();

  await new Promise<void>((resolve) => {
    const tick = () => {
      const elapsed = (performance.now() - startWall) / 1000;
      const t = Math.min(elapsed, total);
      drawFrame(ctx, project, tl, images, from + t, width, height);
      const percent = Math.min(100, (t / total) * 100);
      opts.onProgress?.({
        percent,
        elapsed,
        remaining: Math.max(0, total - elapsed),
        bytes,
      });
      if (opts.signal?.cancelled || elapsed >= total) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  rec.stop();
  sources.forEach((s) => {
    try {
      s.stop();
    } catch {
      /* noop */
    }
  });
  audioCtx?.close();
  const blob = await done;
  return { blob, ext };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
