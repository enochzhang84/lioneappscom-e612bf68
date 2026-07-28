// Photo Wall Studio — 时间轴与渲染引擎（编辑器预览与 MP4 导出共用）
import type { AnimationKey, LayoutKey, PWPhoto, PWProject } from "./types";
import { photosPerPage } from "./presets";
import {
  evalAnimation, evalTransition, randomSequence, resolveAnimId, TEXT_ANIM_MAP,
  type AnimEval, type EasingKey, type PerfMode,
} from "./animations";
import { drawFx, applyTransitionClip } from "./fx";


export type SegmentKind = "opening" | "page" | "ending";

export interface Segment {
  kind: SegmentKind;
  start: number;
  end: number;
  photos: PWPhoto[];
  index: number;
}

export interface Timeline {
  segments: Segment[];
  total: number;
  pageCount: number;
  perPage: number;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildTimeline(p: PWProject): Timeline {
  const st = p.settings;
  const per = photosPerPage(st.layout);
  const list = st.random ? seededShuffle(p.photos, p.photos.length * 7 + 13) : p.photos;
  const pages: PWPhoto[][] = [];
  for (let i = 0; i < list.length; i += per) pages.push(list.slice(i, i + per));

  const opening = st.openingText.trim() ? st.openingDuration : 0;
  const ending = st.endingText.trim() ? st.endingDuration : 0;

  let base = st.perPhoto;
  if (st.timingMode === "total" && pages.length > 0) {
    const body = Math.max(1, st.totalTarget - opening - ending);
    base = body / pages.length;
  }

  const segments: Segment[] = [];
  let t = 0;
  if (opening > 0) {
    segments.push({ kind: "opening", start: 0, end: opening, photos: [], index: 0 });
    t = opening;
  }
  pages.forEach((photos, i) => {
    const override = photos[0]?.duration;
    const d = override && override > 0 ? override : base;
    segments.push({ kind: "page", start: t, end: t + d, photos, index: i });
    t += d;
  });
  if (ending > 0) {
    segments.push({ kind: "ending", start: t, end: t + ending, photos: [], index: 0 });
    t += ending;
  }
  return { segments, total: Math.max(t, 0.1), pageCount: pages.length, perPage: per };
}

export function segmentAt(tl: Timeline, t: number): Segment | null {
  for (const s of tl.segments) if (t >= s.start && t < s.end) return s;
  return tl.segments[tl.segments.length - 1] ?? null;
}

/* ------------------------------ 布局矩形 ------------------------------ */
export interface Rect { x: number; y: number; w: number; h: number; rot?: number }

export function layoutRects(layout: LayoutKey, count: number, W: number, H: number, gap: number): Rect[] {
  const pad = Math.round(Math.min(W, H) * 0.055);
  const iw = W - pad * 2;
  const ih = H - pad * 2;
  const g = gap;
  const grid = (cols: number, rows: number): Rect[] => {
    const cw = (iw - g * (cols - 1)) / cols;
    const ch = (ih - g * (rows - 1)) / rows;
    const out: Rect[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) out.push({ x: pad + c * (cw + g), y: pad + r * (ch + g), w: cw, h: ch });
    return out.slice(0, count);
  };

  switch (layout) {
    case "single":
      return [{ x: pad, y: pad, w: iw, h: ih }];
    case "split": {
      const cw = (iw - g) / 2;
      return [
        { x: pad, y: pad, w: cw, h: ih },
        { x: pad + cw + g, y: pad, w: cw, h: ih },
      ].slice(0, Math.max(1, count));
    }
    case "grid":
      return grid(2, 2);
    case "masonry": {
      const cols = 3;
      const cw = (iw - g * (cols - 1)) / cols;
      const out: Rect[] = [];
      const heights = [ih * 0.56, ih * 0.42, ih * 0.5];
      for (let c = 0; c < cols; c++) {
        const h1 = heights[c];
        const h2 = ih - h1 - g;
        out.push({ x: pad + c * (cw + g), y: pad, w: cw, h: h1 });
        out.push({ x: pad + c * (cw + g), y: pad + h1 + g, w: cw, h: h2 });
      }
      return out.slice(0, count);
    }
    case "collage": {
      const bigW = iw * 0.58;
      const smW = iw - bigW - g;
      const smH = (ih - g * 3) / 4;
      const out: Rect[] = [{ x: pad, y: pad, w: bigW, h: ih }];
      for (let i = 0; i < 4; i++) out.push({ x: pad + bigW + g, y: pad + i * (smH + g), w: smW, h: smH });
      return out.slice(0, count);
    }
    case "polaroid": {
      const cw = (iw - g * 2) / 3;
      const ch = Math.min(ih * 0.8, cw * 1.15);
      const y = pad + (ih - ch) / 2;
      return [0, 1, 2].map((i) => ({ x: pad + i * (cw + g), y, w: cw, h: ch, rot: (i - 1) * 0.045 })).slice(0, count);
    }
    case "free":
    default: {
      const base = grid(2, 2);
      return base.map((r, i) => ({ ...r, rot: (i % 2 === 0 ? -1 : 1) * 0.02 }));
    }
  }
}

/* ------------------------------ 绘制工具 ------------------------------ */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  iw: number,
  ih: number,
  x: number,
  y: number,
  w: number,
  h: number,
  focusX: number,
  focusY: number,
  scale: number,
) {
  const s = Math.max(w / iw, h / ih) * scale;
  const dw = iw * s;
  const dh = ih * s;
  const dx = x + (w - dw) * focusX;
  const dy = y + (h - dh) * focusY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

export interface AnimState { scale: number; dx: number; dy: number; alpha: number; blur: number }

export function animState(kind: AnimationKey, p: number, seed: number, zoom: number, hold: number): AnimState {
  const e = p * p * (3 - 2 * p); // smoothstep
  const holdP = Math.min(1, p / Math.max(0.01, 1 - hold * 0.5));
  switch (kind) {
    case "kenburns":
      return { scale: 1 + (zoom - 1) * e, dx: (seed % 2 ? 1 : -1) * e * 0.02, dy: (seed % 3 ? -1 : 1) * e * 0.015, alpha: 1, blur: 0 };
    case "zoomRandom": {
      const dir = seed % 2 === 0 ? 1 : -1;
      return { scale: dir > 0 ? 1 + (zoom - 1) * e : zoom - (zoom - 1) * e, dx: 0, dy: 0, alpha: 1, blur: 0 };
    }
    case "float":
      return { scale: 1.02, dx: Math.sin(p * Math.PI * 2 + seed) * 0.006, dy: Math.cos(p * Math.PI * 2 + seed) * 0.01, alpha: 1, blur: 0 };
    case "focus":
      return { scale: 1 + (zoom - 1) * (1 - holdP) * 0.6, dx: 0, dy: 0, alpha: 1, blur: (1 - Math.min(1, p * 4)) * 14 };
    case "fade":
      return { scale: 1.01, dx: 0, dy: 0, alpha: 1, blur: 0 };
    default:
      return { scale: 1, dx: 0, dy: 0, alpha: 1, blur: 0 };
  }
}

export type ImageMap = Map<string, HTMLImageElement>;

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  let t = text;
  while (t.length > 4 && ctx.measureText(t).width > maxW) t = t.slice(0, -2);
  return t === text ? text : t + "…";
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  title: string,
  sub: string,
  accent: string,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const grd = ctx.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.5, Math.max(W, H) * 0.75);
  grd.addColorStop(0, accent + "44");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.round(H * 0.095)}px 'Noto Sans SC', system-ui, sans-serif`;
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = H * 0.02;
  ctx.fillText(fitText(ctx, title, W * 0.86), W / 2, H * 0.5);
  if (sub) {
    ctx.font = `400 ${Math.round(H * 0.038)}px 'Noto Sans SC', system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,.82)";
    ctx.fillText(fitText(ctx, sub, W * 0.8), W / 2, H * 0.5 + H * 0.085);
  }
  ctx.restore();
}

/* ------------------------------ 主绘制 ------------------------------ */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  project: PWProject,
  tl: Timeline,
  images: ImageMap,
  time: number,
  W: number,
  H: number,
) {
  const st = project.settings;
  ctx.save();
  ctx.fillStyle = st.bgColor;
  ctx.fillRect(0, 0, W, H);

  const seg = segmentAt(tl, time);
  if (!seg) {
    ctx.restore();
    return;
  }
  const dur = Math.max(0.001, seg.end - seg.start);
  const p = Math.min(1, Math.max(0, (time - seg.start) / dur));
  const tIn = Math.min(1, (time - seg.start) / Math.max(0.05, st.transition));
  const tOut = Math.min(1, (seg.end - time) / Math.max(0.05, st.transition));
  const fade = Math.min(tIn, tOut);

  if (seg.kind === "opening") {
    drawCard(ctx, W, H, st.openingText, st.openingSub, st.accent, fade);
  } else if (seg.kind === "ending") {
    drawCard(ctx, W, H, st.endingText, st.endingSub, st.accent, fade);
  } else {
    const first = seg.photos[0];
    const firstImg = first ? images.get(first.assetId) : undefined;

    // 背景：模糊铺底
    if (st.blurBg && firstImg) {
      ctx.save();
      ctx.filter = "blur(48px) saturate(1.2)";
      ctx.globalAlpha = 0.75;
      drawCover(ctx, firstImg, firstImg.naturalWidth, firstImg.naturalHeight, -W * 0.06, -H * 0.06, W * 1.12, H * 1.12, 0.5, 0.5, 1.1);
      ctx.restore();
      if (st.dimBg > 0) {
        ctx.fillStyle = `rgba(0,0,0,${st.dimBg})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    const rects = layoutRects(st.layout, seg.photos.length, W, H, st.gap * (W / 1920) * 1.6);

    seg.photos.forEach((ph, i) => {
      const r = rects[i] ?? rects[rects.length - 1];
      if (!r) return;
      const img = images.get(ph.assetId);
      const seed = i + seg.index * 3 + 1;
      const a = animState(st.animation, p, seed, st.zoom, st.hold);
      const isPolaroid = st.layout === "polaroid";
      const frameW = isPolaroid ? Math.round(r.w * 0.045) : 0;
      const rot = (r.rot ?? 0) + (st.rotateRandom ? ((seed * 37) % 7 - 3) * 0.008 : 0) + (ph.rotate * Math.PI) / 180;

      ctx.save();
      ctx.globalAlpha = fade * a.alpha;
      ctx.translate(r.x + r.w / 2 + a.dx * W, r.y + r.h / 2 + a.dy * H);
      if (rot) ctx.rotate(rot);
      ctx.translate(-r.w / 2, -r.h / 2);

      const radius = (ph.radius || st.radius) * (W / 1920) * 1.4;

      if (st.shadow) {
        ctx.shadowColor = "rgba(0,0,0,.45)";
        ctx.shadowBlur = 40 * (W / 1920);
        ctx.shadowOffsetY = 14 * (W / 1920);
      }
      if (isPolaroid) {
        ctx.fillStyle = "#fdfdfb";
        roundRect(ctx, -frameW, -frameW, r.w + frameW * 2, r.h + frameW * 4.5, radius * 0.5);
        ctx.fill();
      } else if (ph.highlight) {
        ctx.fillStyle = st.accent;
        roundRect(ctx, -4, -4, r.w + 8, r.h + 8, radius + 4);
        ctx.fill();
      }
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      roundRect(ctx, 0, 0, r.w, r.h, radius);
      ctx.save();
      ctx.clip();
      if (img && img.complete && img.naturalWidth) {
        if (a.blur > 0) ctx.filter = `blur(${a.blur}px)`;
        drawCover(ctx, img, img.naturalWidth, img.naturalHeight, 0, 0, r.w, r.h, ph.focusX, ph.focusY, a.scale);
        ctx.filter = "none";
      } else {
        ctx.fillStyle = "rgba(255,255,255,.06)";
        ctx.fillRect(0, 0, r.w, r.h);
      }

      // 图片解说
      const cap = ph.caption || ph.title;
      if (cap) {
        const barH = Math.max(r.h * 0.16, H * 0.06);
        const g2 = ctx.createLinearGradient(0, r.h - barH, 0, r.h);
        g2.addColorStop(0, "rgba(0,0,0,0)");
        g2.addColorStop(1, "rgba(0,0,0,.72)");
        ctx.fillStyle = g2;
        ctx.fillRect(0, r.h - barH, r.w, barH);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        const fs = Math.max(H * 0.026, r.h * 0.058);
        ctx.font = `600 ${Math.round(fs)}px 'Noto Sans SC', system-ui, sans-serif`;
        ctx.fillText(fitText(ctx, cap, r.w * 0.9), r.w * 0.05, r.h - barH * 0.32);
      }
      ctx.restore();

      const bw = ph.border || st.border;
      if (bw > 0) {
        ctx.strokeStyle = "rgba(255,255,255,.9)";
        ctx.lineWidth = bw * (W / 1920) * 1.4;
        roundRect(ctx, 0, 0, r.w, r.h, radius);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // 全局文字图层
  for (const tx of project.texts) {
    if (time < tx.start || time > tx.start + tx.duration) continue;
    const lp = (time - tx.start) / Math.max(0.01, tx.duration);
    const inA = Math.min(1, (time - tx.start) / 0.6);
    const outA = Math.min(1, (tx.start + tx.duration - time) / 0.6);
    const alpha = tx.animation === "none" ? 1 : Math.min(inA, outA);
    const rise = tx.animation === "rise" ? (1 - Math.min(1, lp * 6)) * H * 0.03 : 0;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = tx.align;
    ctx.fillStyle = tx.color;
    ctx.font = `${tx.kind === "title" ? 700 : 500} ${Math.round((tx.size / 100) * H)}px ${tx.font}`;
    if (tx.shadow) {
      ctx.shadowColor = "rgba(0,0,0,.6)";
      ctx.shadowBlur = H * 0.018;
    }
    const x = tx.align === "left" ? W * 0.07 : tx.align === "right" ? W * 0.93 : W / 2;
    const yMap: Record<string, number> = { title: 0.44, subtitle: 0.56, verse: 0.5, caption: 0.88, outro: 0.5 };
    ctx.fillText(fitText(ctx, tx.text, W * 0.86), x, (yMap[tx.kind] ?? 0.5) * H + rise);
    ctx.restore();
  }

  ctx.restore();
}

export function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
