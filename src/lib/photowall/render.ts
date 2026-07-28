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

/** 兼容旧调用：委托给动画资源库 */
export function animState(kind: AnimationKey | string, p: number, seed: number, zoom: number, hold: number): AnimState {
  const a = evalAnimation(resolveAnimId(kind), p, { seed, zoom, hold, intensity: 1 });
  return { scale: a.scale, dx: a.dx, dy: a.dy, alpha: a.alpha, blur: a.blur };
}

/** 求某张照片在当前片段中的动画 ID（单张覆盖 > 随机序列 > 全局） */
export function photoAnimId(project: PWProject, photo: PWPhoto | undefined, globalIndex: number): string {
  if (photo?.animationId) return resolveAnimId(photo.animationId);
  const st = project.settings;
  if (st.animRandom) {
    const seq = randomSeqFor(project);
    if (seq.length) return seq[globalIndex % seq.length];
  }
  return resolveAnimId(st.animationId ?? st.animation);
}

const seqCache = new WeakMap<PWProject, string[]>();
function randomSeqFor(project: PWProject): string[] {
  const cached = seqCache.get(project);
  if (cached) return cached;
  const seq = randomSequence("all", Math.max(8, project.photos.length));
  seqCache.set(project, seq);
  return seq;
}

/** 求某张照片的完整动画状态（编辑器 / 预览 / 导出统一入口） */
export function photoAnimState(project: PWProject, photo: PWPhoto | undefined, p: number, seed: number, globalIndex: number): AnimEval {
  const st = project.settings;
  return evalAnimation(photoAnimId(project, photo, globalIndex), p, {
    seed,
    zoom: st.zoom,
    hold: st.hold,
    intensity: st.animIntensity ?? 1,
    easing: (st.easing as EasingKey) ?? "cinematic",
    customBezier: st.customBezier,
    speed: st.animSpeed ?? 1,
    delay: st.animDelay ?? 0,
    loop: st.animLoop ?? false,
    perf: (st.perfMode as PerfMode) ?? "quality",
  });
}


/* ------------------------------ 主图放大 Hero ------------------------------ */
export type HeroPhase = "none" | "enter" | "hold" | "exit";

export interface HeroPlan {
  /** 该片段内的主图下标，-1 表示无主图 */
  index: number;
  /** 相对片段起点的秒数 */
  start: number;
  inDur: number;
  holdDur: number;
  outDur: number;
  end: number;
  /** 全屏程度 0..1 */
  k: number;
  phase: HeroPhase;
  mode: "grid" | "fullscreen" | "overlay";
}

const heroEase = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // cinematic ease-in-out

/** 计算某片段的主图全屏计划（时间轴 / 预览 / 导出共用，保证与 currentTime 同步） */
export function heroPlan(project: PWProject, seg: Segment, timeInSeg: number): HeroPlan {
  const st = project.settings;
  const mode = st.heroMode ?? "fullscreen";
  const idx = seg.kind === "page" ? seg.photos.findIndex((x) => x.highlight) : -1;
  const d = Math.max(0.001, seg.end - seg.start);
  const empty: HeroPlan = { index: -1, start: 0, inDur: 0, holdDur: 0, outDur: 0, end: 0, k: 0, phase: "none", mode };
  if (idx < 0 || mode === "grid") return { ...empty, index: mode === "grid" ? idx : -1 };

  let inDur = Math.max(0.2, Math.min(st.heroIn ?? 1, d * 0.35));
  let outDur = Math.max(0.2, Math.min(st.heroOut ?? 1, d * 0.35));
  let holdDur = Math.max(0, Math.min(st.heroHold ?? 5, d - inDur - outDur));
  let total = inDur + holdDur + outDur;
  if (total > d) {
    const s = d / total;
    inDur *= s; holdDur *= s; outDur *= s; total = d;
  }
  const start = (d - total) / 2;
  const end = start + total;

  let k = 0;
  let phase: HeroPhase = "none";
  const t = timeInSeg;
  if (t >= start && t < start + inDur) {
    k = heroEase((t - start) / Math.max(0.001, inDur));
    phase = "enter";
  } else if (t >= start + inDur && t < start + inDur + holdDur) {
    k = 1;
    phase = "hold";
  } else if (t >= start + inDur + holdDur && t <= end) {
    k = 1 - heroEase((t - start - inDur - holdDur) / Math.max(0.001, outDur));
    phase = "exit";
  }
  return { index: idx, start, inDur, holdDur, outDur, end, k, phase, mode };
}

/** 主图焦点位置 → 0..1 */
export function heroFocusPoint(project: PWProject, ph: PWPhoto | undefined): { fx: number; fy: number } {
  const f = project.settings.heroFocus ?? "center";
  switch (f) {
    case "top": return { fx: 0.5, fy: 0 };
    case "bottom": return { fx: 0.5, fy: 1 };
    case "left": return { fx: 0, fy: 0.5 };
    case "right": return { fx: 1, fy: 0.5 };
    case "custom": return { fx: ph?.focusX ?? 0.5, fy: ph?.focusY ?? 0.5 };
    default: return { fx: 0.5, fy: 0.5 };
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

  const perf = (st.perfMode as PerfMode) ?? "quality";
  const trans = evalTransition(st.transitionId ?? "cross-dissolve", tIn, tOut, perf);

  if (seg.kind === "opening") {
    drawCard(ctx, W, H, st.openingText, st.openingSub, st.accent, fade);
  } else if (seg.kind === "ending") {
    drawCard(ctx, W, H, st.endingText, st.endingSub, st.accent, fade);
  } else {
    const first = seg.photos[0];
    const firstImg = first ? images.get(first.assetId) : undefined;

    // 背景：模糊铺底
    if (st.blurBg && firstImg && perf !== "smooth") {
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

    // ---- 转场：整页统一变换 / 遮罩 ----
    ctx.save();
    if (trans.clip) applyTransitionClip(ctx, trans.clip, trans.clipP ?? 1, W, H);
    ctx.translate(W / 2 + trans.dx * W, H / 2 + trans.dy * H);
    if (trans.rot) ctx.rotate(trans.rot);
    if (trans.scale !== 1) ctx.scale(trans.scale, trans.scale);
    ctx.translate(-W / 2, -H / 2);
    if (trans.blur && perf === "quality") ctx.filter = `blur(${trans.blur}px)`;

    seg.photos.forEach((ph, i) => {
      const r = rects[i] ?? rects[rects.length - 1];
      if (!r) return;
      const img = images.get(ph.assetId);
      const seed = i + seg.index * 3 + 1;
      const a = photoAnimState(project, ph, p, seed, seg.index * tl.perPage + i);
      const isPolaroid = st.layout === "polaroid";
      const frameW = isPolaroid ? Math.round(r.w * 0.045) : 0;
      const rot = (r.rot ?? 0) + (st.rotateRandom ? ((seed * 37) % 7 - 3) * 0.008 : 0) + (ph.rotate * Math.PI) / 180 + a.rot;

      ctx.save();
      ctx.globalAlpha = fade * trans.alpha * a.alpha;
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
        const fx = Math.min(1, Math.max(0, ph.focusX + a.focusDX));
        const fy = Math.min(1, Math.max(0, ph.focusY + a.focusDY));
        drawCover(ctx, img, img.naturalWidth, img.naturalHeight, 0, 0, r.w, r.h, fx, fy, a.scale);
        ctx.filter = "none";
      } else {
        ctx.fillStyle = "rgba(255,255,255,.06)";
        ctx.fillRect(0, 0, r.w, r.h);
      }

      // 动画特效叠加层
      if (a.fx) drawFx(ctx, a.fx, a.fxAmt, r.w, r.h, p, seed);

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
    ctx.filter = "none";
    ctx.restore();
  }

  // 转场闪光 / 黑白场覆盖
  if (trans.flash && trans.flash[1] > 0.001) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, trans.flash[1]);
    ctx.fillStyle = trans.flash[0];
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // 全局文字图层
  for (const tx of project.texts) {
    if (time < tx.start || time > tx.start + tx.duration) continue;
    drawText(ctx, tx, time, W, H);
  }

  ctx.restore();
}

/* ------------------------------ 文字动画 ------------------------------ */
function drawText(
  ctx: CanvasRenderingContext2D,
  tx: PWProject["texts"][number],
  time: number,
  W: number,
  H: number,
) {
  const id = TEXT_ANIM_MAP[tx.animation] ? tx.animation : tx.animation === "rise" ? "rise" : "fade";
  const def = TEXT_ANIM_MAP[id] ?? TEXT_ANIM_MAP["fade"];
  const lp = (time - tx.start) / Math.max(0.01, tx.duration);
  const inA = Math.min(1, (time - tx.start) / 0.6);
  const outA = Math.min(1, (tx.start + tx.duration - time) / 0.6);
  const fade = id === "none" ? 1 : Math.min(inA, outA);
  const enter = Math.min(1, Math.max(0, lp * 3.2)); // 进场进度

  const size = Math.round((tx.size / 100) * H);
  const weight = tx.kind === "title" ? 700 : 500;
  const yMap: Record<string, number> = { title: 0.44, subtitle: 0.56, verse: 0.5, caption: 0.88, outro: 0.5 };
  let baseY = (yMap[tx.kind] ?? 0.5) * H;
  const x = tx.align === "left" ? W * 0.07 : tx.align === "right" ? W * 0.93 : W / 2;

  ctx.save();
  ctx.textAlign = tx.align;
  ctx.font = `${weight} ${size}px ${tx.font}`;
  ctx.fillStyle = tx.color;
  ctx.globalAlpha = fade;
  if (tx.shadow) {
    ctx.shadowColor = "rgba(0,0,0,.6)";
    ctx.shadowBlur = H * 0.018;
  }

  const text = fitText(ctx, tx.text, W * 0.86);

  switch (id) {
    case "subtitle":
      baseY = H * 0.88;
      ctx.save();
      ctx.globalAlpha = fade * 0.55;
      ctx.fillStyle = "#000";
      const tw = ctx.measureText(text).width;
      ctx.fillRect(x - (tx.align === "center" ? tw / 2 : 0) - size * 0.4, baseY - size, tw + size * 0.8, size * 1.35);
      ctx.restore();
      ctx.fillStyle = tx.color;
      ctx.fillText(text, x, baseY);
      break;
    case "bible-verse":
      ctx.globalAlpha = fade * Math.min(1, enter * 1.2);
      ctx.fillText(text, x, baseY + (1 - enter) * H * 0.02);
      break;
    case "title-cinematic":
      ctx.save();
      ctx.translate(x, baseY);
      ctx.scale(1.06 - 0.06 * enter, 1.06 - 0.06 * enter);
      ctx.fillText(text, 0, 0);
      ctx.restore();
      break;
    case "title-apple":
    case "text-elegant":
      ctx.globalAlpha = fade * enter;
      ctx.fillText(text, x, baseY + (1 - enter) * H * 0.035);
      break;
    case "rise":
    case "line-reveal":
      ctx.fillText(text, x, baseY + (1 - Math.min(1, lp * 6)) * H * 0.03);
      break;
    case "glow":
      ctx.shadowColor = tx.color;
      ctx.shadowBlur = H * 0.03 * (0.6 + 0.4 * Math.sin(lp * Math.PI * 4));
      ctx.fillText(text, x, baseY);
      break;
    case "neon":
      ctx.shadowColor = "#5ac8ff";
      ctx.shadowBlur = H * 0.045;
      ctx.strokeStyle = "#9fe6ff";
      ctx.lineWidth = Math.max(1, H * 0.002);
      ctx.strokeText(text, x, baseY);
      ctx.fillText(text, x, baseY);
      break;
    case "glass":
      ctx.globalAlpha = fade * 0.85;
      ctx.fillText(text, x, baseY);
      ctx.globalAlpha = fade * 0.35;
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = Math.max(1, H * 0.0015);
      ctx.strokeText(text, x, baseY);
      break;
    case "gradient-sweep": {
      const w = ctx.measureText(text).width;
      const x0 = x - (tx.align === "center" ? w / 2 : tx.align === "right" ? w : 0);
      const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      const s = (lp * 1.3) % 1;
      g.addColorStop(Math.max(0, s - 0.25), tx.color);
      g.addColorStop(Math.min(1, s), "#ffffff");
      g.addColorStop(Math.min(1, s + 0.25), tx.color);
      ctx.fillStyle = g;
      ctx.fillText(text, x, baseY);
      break;
    }
    case "mask-reveal": {
      const w = ctx.measureText(text).width;
      const x0 = x - (tx.align === "center" ? w / 2 : tx.align === "right" ? w : 0);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, baseY - size, w * enter, size * 1.4);
      ctx.clip();
      ctx.fillText(text, x, baseY);
      ctx.restore();
      break;
    }
    case "typewriter": {
      const n = Math.max(0, Math.floor(text.length * Math.min(1, lp * 2.2)));
      ctx.fillText(text.slice(0, n) + (n < text.length && Math.floor(time * 2) % 2 === 0 ? "▍" : ""), x, baseY);
      break;
    }
    case "word-slide": {
      const words = text.split(/(\s+)/);
      const total = ctx.measureText(text).width;
      let cx = x - (tx.align === "center" ? total / 2 : tx.align === "right" ? total : 0);
      ctx.textAlign = "left";
      words.forEach((wd, i) => {
        const d = Math.min(1, Math.max(0, lp * 3 - i * 0.12));
        ctx.save();
        ctx.globalAlpha = fade * d;
        ctx.fillText(wd, cx + (1 - d) * W * 0.03, baseY);
        ctx.restore();
        cx += ctx.measureText(wd).width;
      });
      break;
    }
    case "letter-fade":
    case "letter-scale":
    case "letter-rotate": {
      const chars = [...text];
      const total = ctx.measureText(text).width;
      let cx = x - (tx.align === "center" ? total / 2 : tx.align === "right" ? total : 0);
      ctx.textAlign = "left";
      chars.forEach((ch, i) => {
        const d = Math.min(1, Math.max(0, lp * 3 - i * 0.06));
        const cw = ctx.measureText(ch).width;
        ctx.save();
        ctx.globalAlpha = fade * d;
        ctx.translate(cx + cw / 2, baseY);
        if (id === "letter-scale") ctx.scale(0.6 + 0.4 * d, 0.6 + 0.4 * d);
        if (id === "letter-rotate") ctx.rotate((1 - d) * 0.6);
        ctx.fillText(ch, -cw / 2, 0);
        ctx.restore();
        cx += cw;
      });
      break;
    }
    case "none":
    case "fade":
    default:
      ctx.fillText(text, x, baseY);
  }
  ctx.restore();
}


export function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
