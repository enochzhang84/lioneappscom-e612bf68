// Photo Wall Studio — 时间轴与渲染引擎（编辑器预览与 MP4 导出共用）
import type { AnimationKey, LayoutKey, PWPhoto, PWProject } from "./types";
import { photosPerPage } from "./presets";
import {
  evalAnimation, evalTransition, randomSequence, resolveAnimId, TEXT_ANIM_MAP,
  type AnimEval, type EasingKey, type PerfMode,
} from "./animations";
import { drawFx, applyTransitionClip } from "./fx";
import { fontStack, normalizeText } from "./text";
import type { PWText } from "./types";


export type SegmentKind = "intro" | "opening" | "page" | "ending";

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
  const inTl = p.photos.filter((x) => x.inTimeline !== false);
  const list = st.random ? seededShuffle(inTl, inTl.length * 7 + 13) : inTl;
  const pages: PWPhoto[][] = [];
  for (let i = 0; i < list.length; i += per) pages.push(list.slice(i, i + per));

  const intro = p.intro?.enabled ? Math.max(1, p.intro.duration) : 0;
  const opening = st.openingText.trim() ? st.openingDuration : 0;
  const ending = st.endingText.trim() ? st.endingDuration : 0;

  let base = st.perPhoto;
  if (st.timingMode === "total" && pages.length > 0) {
    const body = Math.max(1, st.totalTarget - intro - opening - ending);
    base = body / pages.length;
  }

  const segments: Segment[] = [];
  let t = 0;
  if (intro > 0) {
    segments.push({ kind: "intro", start: 0, end: intro, photos: [], index: 0 });
    t = intro;
  }
  if (opening > 0) {
    segments.push({ kind: "opening", start: t, end: t + opening, photos: [], index: 0 });
    t += opening;
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

  if (seg.kind === "intro") {
    drawIntroBg(ctx, project, images, time, seg, W, H);
  } else if (seg.kind === "opening") {
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

    const hero = heroPlan(project, seg, time - seg.start);
    const heroK = hero.index >= 0 ? hero.k : 0;

    const drawPhoto = (ph: PWPhoto, i: number, k: number) => {
      const r0 = rects[i] ?? rects[rects.length - 1];
      if (!r0) return;
      // 主图全屏：网格矩形 → 整幅画布（overlay 模式保留少量边距）
      const inset = hero.mode === "overlay" ? Math.min(W, H) * 0.045 : 0;
      const target = { x: inset, y: inset, w: W - inset * 2, h: H - inset * 2 };
      const r = k > 0
        ? {
            x: r0.x + (target.x - r0.x) * k,
            y: r0.y + (target.y - r0.y) * k,
            w: r0.w + (target.w - r0.w) * k,
            h: r0.h + (target.h - r0.h) * k,
            rot: (r0.rot ?? 0) * (1 - k),
          }
        : r0;
      const img = images.get(ph.assetId);
      const seed = i + seg.index * 3 + 1;
      const a = photoAnimState(project, ph, p, seed, seg.index * tl.perPage + i);
      const isPolaroid = st.layout === "polaroid" && k < 0.5;
      const frameW = isPolaroid ? Math.round(r.w * 0.045) : 0;
      const rot =
        ((r.rot ?? 0) +
          (st.rotateRandom ? ((seed * 37) % 7 - 3) * 0.008 : 0) +
          (ph.rotate * Math.PI) / 180 +
          a.rot) *
        (1 - k);

      // 其他缩略图在主图全屏时变暗 / 隐藏
      let dim = 1;
      if (heroK > 0 && i !== hero.index) dim = Math.max(0, 1 - heroK * (st.heroDim ?? 0.9));

      ctx.save();
      ctx.globalAlpha = fade * trans.alpha * a.alpha * dim;
      ctx.translate(r.x + r.w / 2 + a.dx * W * (1 - k), r.y + r.h / 2 + a.dy * H * (1 - k));
      if (rot) ctx.rotate(rot);
      ctx.translate(-r.w / 2, -r.h / 2);

      const radius = (ph.radius || st.radius) * (W / 1920) * 1.4 * (1 - k);

      if (st.shadow && k < 1) {
        ctx.shadowColor = `rgba(0,0,0,${0.45 * (1 - k)})`;
        ctx.shadowBlur = 40 * (W / 1920) * (1 - k);
        ctx.shadowOffsetY = 14 * (W / 1920) * (1 - k);
      }
      if (isPolaroid) {
        ctx.fillStyle = "#fdfdfb";
        roundRect(ctx, -frameW, -frameW, r.w + frameW * 2, r.h + frameW * 4.5, radius * 0.5);
        ctx.fill();
      } else if (ph.highlight && k < 0.15) {
        ctx.globalAlpha *= 1 - k / 0.15;
        ctx.fillStyle = st.accent;
        roundRect(ctx, -4, -4, r.w + 8, r.h + 8, radius + 4);
        ctx.fill();
        ctx.globalAlpha = fade * trans.alpha * a.alpha * dim;
      }
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      roundRect(ctx, 0, 0, r.w, r.h, radius);
      ctx.save();
      ctx.clip();
      const fitContain = k > 0 && (st.heroFit ?? "cover") === "contain";
      if (img && img.complete && img.naturalWidth) {
        if (a.blur > 0) ctx.filter = `blur(${a.blur}px)`;
        const hf = heroFocusPoint(project, ph);
        const fx = Math.min(1, Math.max(0, (k > 0 ? hf.fx : ph.focusX) + a.focusDX));
        const fy = Math.min(1, Math.max(0, (k > 0 ? hf.fy : ph.focusY) + a.focusDY));
        if (fitContain) {
          // 背景填充：同图放大模糊 / 纯色 / 变暗
          const bg = st.heroBg ?? "blur";
          ctx.save();
          if (bg === "blur" && perf !== "smooth") {
            ctx.filter = "blur(24px) saturate(1.15)";
            drawCover(ctx, img, img.naturalWidth, img.naturalHeight, -r.w * 0.06, -r.h * 0.06, r.w * 1.12, r.h * 1.12, 0.5, 0.5, 1.1);
            ctx.filter = "none";
            ctx.fillStyle = "rgba(0,0,0,.25)";
          } else if (bg === "color") {
            ctx.fillStyle = st.accent + "33";
          } else {
            ctx.fillStyle = bg === "dim" ? "rgba(0,0,0,.55)" : st.bgColor;
          }
          ctx.fillRect(0, 0, r.w, r.h);
          ctx.restore();
          // 前景：完整显示（contain）
          const cs = Math.min(r.w / img.naturalWidth, r.h / img.naturalHeight) * a.scale;
          const dw = img.naturalWidth * cs;
          const dh = img.naturalHeight * cs;
          ctx.drawImage(img, (r.w - dw) / 2, (r.h - dh) / 2, dw, dh);
        } else {
          drawCover(ctx, img, img.naturalWidth, img.naturalHeight, 0, 0, r.w, r.h, fx, fy, a.scale);
        }
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
        const fs = Math.max(H * 0.026, k > 0 ? H * 0.04 : r.h * 0.058);
        ctx.font = `600 ${Math.round(fs)}px 'Noto Sans SC', system-ui, sans-serif`;
        ctx.fillText(fitText(ctx, cap, r.w * 0.9), r.w * 0.05, r.h - barH * 0.32);
      }
      ctx.restore();

      const bw = (ph.border || st.border) * (1 - k);
      if (bw > 0.01) {
        ctx.strokeStyle = "rgba(255,255,255,.9)";
        ctx.lineWidth = bw * (W / 1920) * 1.4;
        roundRect(ctx, 0, 0, r.w, r.h, radius);
        ctx.stroke();
      }
      ctx.restore();
    };

    // 先画其他缩略图，主图最后绘制（保证全屏时层级最高）
    seg.photos.forEach((ph, i) => {
      if (i === hero.index && heroK > 0) return;
      drawPhoto(ph, i, 0);
    });
    if (hero.index >= 0 && heroK > 0) {
      const hp = seg.photos[hero.index];
      if (hp) drawPhoto(hp, hero.index, heroK);
    }
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

/* ------------------------------ 开场背景 ------------------------------ */
function drawIntroBg(
  ctx: CanvasRenderingContext2D,
  project: PWProject,
  images: ImageMap,
  time: number,
  seg: Segment,
  W: number,
  H: number,
) {
  const intro = project.intro;
  if (!intro) return;
  const dur = Math.max(0.001, seg.end - seg.start);
  const lp = Math.min(1, Math.max(0, (time - seg.start) / dur));
  const fadeIn = Math.min(1, lp / (0.8 / dur));           // 0–0.8s 背景渐入
  const fadeOut = Math.min(1, (1 - lp) / (1 / dur));       // 最后 1s 整体淡出
  const alpha = Math.min(fadeIn, fadeOut);

  ctx.save();
  ctx.globalAlpha = alpha;

  // 底色 / 渐变
  if (intro.bg === "gradient") {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, intro.bgColor);
    g.addColorStop(1, intro.bgColor2 || intro.bgColor);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = intro.bgColor;
  }
  ctx.fillRect(0, 0, W, H);

  // 图片背景
  const assetId =
    intro.bg === "posterBlur" || intro.bg === "poster" || intro.bg === "custom"
      ? intro.bgAssetId
      : intro.bg === "cover"
        ? (project.photos.find((p) => p.cover) ?? project.photos[0])?.assetId
        : intro.bg === "firstPhoto"
          ? project.photos[0]?.assetId
          : null;
  const img = assetId ? images.get(assetId) : undefined;
  if (img && img.complete && img.naturalWidth) {
    const scale = intro.scale + lp * 0.05; // 缓慢推近
    ctx.save();
    if (intro.bg === "posterBlur" && intro.blur > 0) {
      ctx.filter = `blur(${(intro.blur * H) / 1080}px) saturate(1.15)`;
    }
    drawCover(ctx, img, img.naturalWidth, img.naturalHeight, -W * 0.08, -H * 0.08, W * 1.16, H * 1.16, 0.5, 0.5, scale);
    ctx.filter = "none";
    ctx.restore();
    if (intro.dim > 0) {
      ctx.fillStyle = `rgba(0,0,0,${intro.dim})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
  ctx.restore();
}

/* ------------------------------ 文字渲染与动画 ------------------------------ */
type EvalText = {
  alpha: number;
  dx: number;
  dy: number;
  scale: number;
  blur: number;
  reveal: number; // 0..1 遮罩揭示进度
  glowBoost: number;
  stage: "in" | "hold" | "out";
  progress: number; // 当前阶段进度
};

function easeOut(t: number) { return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3); }

function evalTextAnim(tx: PWText, time: number, H: number): EvalText {
  const n = normalizeText(tx);
  const speed = Math.max(0.2, n.animSpeed);
  const d = Math.max(0.05, n.animDur / speed);
  const t0 = tx.start + n.animDelay;
  const tEnd = tx.start + tx.duration;
  const inP = easeOut((time - t0) / d);
  const outRaw = (tEnd - time) / d;
  const outP = easeOut(outRaw);
  const stage: EvalText["stage"] = time < t0 + d ? "in" : outRaw < 1 ? "out" : "hold";
  const K = n.animIntensity;

  const out: EvalText = { alpha: 1, dx: 0, dy: 0, scale: 1, blur: 0, reveal: 1, glowBoost: 0, stage, progress: stage === "in" ? inP : stage === "out" ? 1 - outP : 1 };

  const applyIn = (id: string, p: number) => {
    const inv = 1 - p;
    switch (id) {
      case "none": break;
      case "rise": out.alpha = p; out.dy = inv * H * 0.05 * K; break;
      case "slide-down": out.alpha = p; out.dy = -inv * H * 0.05 * K; break;
      case "slide-left": out.alpha = p; out.dx = inv * H * 0.09 * K; break;
      case "slide-right": out.alpha = p; out.dx = -inv * H * 0.09 * K; break;
      case "zoom-in": out.alpha = p; out.scale = 0.7 + 0.3 * p; break;
      case "blur-in": out.alpha = p; out.blur = inv * 16 * K; break;
      case "title-cinematic": out.alpha = p; out.scale = 1 + 0.08 * inv * K; break;
      case "title-apple": case "text-elegant": out.alpha = p; out.dy = inv * H * 0.03 * K; break;
      case "bible-verse": out.alpha = p * p; out.dy = inv * H * 0.018; break;
      case "mask-reveal": out.reveal = p; break;
      case "glow": out.alpha = p; out.glowBoost = inv; break;
      default: out.alpha = p;
    }
  };
  const applyOut = (id: string, p: number) => {
    const inv = 1 - p; // inv: 退场进度
    switch (id) {
      case "none": break;
      case "blur-out": out.alpha = p; out.blur = inv * 20; break;
      case "slide-out-up": out.alpha = p; out.dy = -inv * H * 0.06; break;
      case "slide-out-down": out.alpha = p; out.dy = inv * H * 0.06; break;
      case "slide-out-left": out.alpha = p; out.dx = -inv * H * 0.1; break;
      case "zoom-out": out.alpha = p; out.scale = 1 - 0.25 * inv; break;
      case "mask-close": out.reveal = p; break;
      case "cinema-out": out.alpha = p * p; out.scale = 1 + 0.04 * inv; break;
      default: out.alpha = p;
    }
  };

  if (stage === "in") applyIn(tx.animation || "fade", inP);
  else if (stage === "out") applyOut(tx.animOut || "fade-out", outP);

  // 持续动画（整个存在期间叠加）
  const life = time - tx.start;
  switch (n.animMotion ?? "none") {
    case "float": out.dy += Math.sin(life * 1.6) * H * 0.006 * K; break;
    case "breath": out.alpha *= 0.88 + 0.12 * (0.5 + 0.5 * Math.sin(life * 1.4)); break;
    case "slow-zoom": out.scale *= 1 + Math.min(0.08, life * 0.006) * K; break;
    case "glow-breath": out.glowBoost = Math.max(out.glowBoost, 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(life * 2))); break;
    case "parallax": out.dx += Math.sin(life * 0.7) * H * 0.008 * K; break;
    default: break;
  }
  if (n.animLoop && stage === "hold") {
    const cyc = (life % Math.max(1, n.animDur * 4)) / Math.max(1, n.animDur * 4);
    if (cyc < 0.25) applyIn(tx.animation || "fade", easeOut(cyc / 0.25));
  }
  out.alpha = Math.min(1, Math.max(0, out.alpha)) * (n.opacity ?? 1);
  return out;
}

function transformText(t: PWText): string {
  const raw = t.text ?? "";
  if (t.transform === "upper") return raw.toUpperCase();
  if (t.transform === "lower") return raw.toLowerCase();
  return raw;
}

/** 中英文混排换行：优先按空格断词，CJK 逐字断行 */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number, wrap: boolean): string[] {
  const manual = text.split("\n");
  if (!wrap) return manual.slice(0, Math.max(1, maxLines));
  const lines: string[] = [];
  for (const para of manual) {
    let cur = "";
    const tokens = para.match(/[A-Za-z0-9@._'’-]+|\s+|[^\s]/g) ?? [];
    for (const tk of tokens) {
      const next = cur + tk;
      if (ctx.measureText(next).width > maxW && cur.trim()) {
        lines.push(cur.trimEnd());
        cur = tk.trim() ? tk : "";
      } else cur = next;
    }
    if (cur.trim() || !lines.length) lines.push(cur.trimEnd());
  }
  if (lines.length <= maxLines) return lines;
  const cut = lines.slice(0, maxLines);
  cut[maxLines - 1] = cut[maxLines - 1].replace(/.$/, "…");
  return cut;
}

function measureBlock(ctx: CanvasRenderingContext2D, lines: string[], letterSpacing: number, size: number) {
  const ls = letterSpacing * size;
  return Math.max(
    ...lines.map((l) => ctx.measureText(l).width + Math.max(0, [...l].length - 1) * ls),
    1,
  );
}

function fillLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  cx: number,
  y: number,
  align: CanvasTextAlign,
  letterSpacing: number,
  size: number,
  stroke: boolean,
) {
  const ls = letterSpacing * size;
  if (!ls) {
    if (stroke) ctx.strokeText(line, cx, y);
    ctx.fillText(line, cx, y);
    return;
  }
  const chars = [...line];
  const w = ctx.measureText(line).width + Math.max(0, chars.length - 1) * ls;
  let x = align === "center" ? cx - w / 2 : align === "right" ? cx - w : cx;
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  for (const ch of chars) {
    if (stroke) ctx.strokeText(ch, x, y);
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + ls;
  }
  ctx.textAlign = prev;
}

/** 文字包围盒（画布像素），供画布直接编辑复用 */
export function textBox(ctx: CanvasRenderingContext2D, tx: PWText, W: number, H: number) {
  const n = normalizeText(tx);
  const size = (n.size / 100) * H * n.scale;
  ctx.save();
  ctx.font = `${n.italic ? "italic " : ""}${n.weight} ${Math.max(4, size)}px ${fontStack(n.font)}`;
  const maxW = n.maxWidth * W;
  const lines = wrapLines(ctx, transformText(n), maxW, n.maxLines, n.wrap);
  const w = Math.min(maxW, measureBlock(ctx, lines, n.letterSpacing, size));
  ctx.restore();
  const lh = size * n.lineHeight;
  const h = lines.length * lh;
  const cx = n.x * W;
  const cy = n.y * H;
  const left = n.align === "center" ? cx - w / 2 : n.align === "right" ? cx - w : cx;
  const top = n.valign === "top" ? cy : n.valign === "bottom" ? cy - h : cy - h / 2;
  return { x: left, y: top, w, h, lines, size, lh, cx, cy };
}

function drawText(
  ctx: CanvasRenderingContext2D,
  tx: PWText,
  time: number,
  W: number,
  H: number,
) {
  if (tx.hidden) return;
  const n = normalizeText(tx);
  const ev = evalTextAnim(tx, time, H);
  if (ev.alpha <= 0.001) return;

  const size = (n.size / 100) * H * n.scale;
  const font = `${n.italic ? "italic " : ""}${n.weight} ${Math.max(4, Math.round(size))}px ${fontStack(n.font)}`;

  ctx.save();
  ctx.font = font;
  ctx.textAlign = n.align as CanvasTextAlign;
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = ev.alpha;

  const maxW = n.maxWidth * W;
  const text = transformText(n);
  const lines = wrapLines(ctx, text, maxW, n.maxLines, n.wrap);
  const lh = size * n.lineHeight;
  const blockW = Math.min(maxW, measureBlock(ctx, lines, n.letterSpacing, size));
  const blockH = lines.length * lh;

  const cx = n.x * W + ev.dx;
  const cyRaw = n.y * H + ev.dy;
  const top = n.valign === "top" ? cyRaw : n.valign === "bottom" ? cyRaw - blockH : cyRaw - blockH / 2;

  ctx.translate(cx, top + blockH / 2);
  if (n.rotate) ctx.rotate((n.rotate * Math.PI) / 180);
  if (ev.scale !== 1) ctx.scale(ev.scale, ev.scale);
  ctx.translate(-cx, -(top + blockH / 2));

  if (ev.blur > 0) ctx.filter = `blur(${ev.blur}px)`;

  const left = n.align === "center" ? cx - blockW / 2 : n.align === "right" ? cx - blockW : cx;

  // 文字背景板
  if (n.bgColor) {
    const pad = n.bgPad * size;
    ctx.save();
    ctx.globalAlpha = ev.alpha * n.bgOpacity;
    ctx.fillStyle = n.bgColor;
    roundRect(ctx, left - pad, top - pad * 0.5, blockW + pad * 2, blockH + pad, (n.bgRadius / 100) * H * 0.5);
    ctx.fill();
    ctx.restore();
  }

  // 遮罩揭示
  if (ev.reveal < 1) {
    ctx.beginPath();
    ctx.rect(left - size * 0.2, top - size * 0.4, (blockW + size * 0.4) * ev.reveal, blockH + size * 0.8);
    ctx.clip();
  }

  // 颜色 / 渐变
  if (n.colorTo) {
    const g = ctx.createLinearGradient(left, top, left + blockW, top + blockH);
    g.addColorStop(0, n.color);
    g.addColorStop(1, n.colorTo);
    ctx.fillStyle = g;
  } else if ((n.animation === "gradient-sweep" || n.animMotion === "sweep") && ev.stage !== "out") {
    const sPos = ((time - tx.start) * 0.5) % 1;
    const g = ctx.createLinearGradient(left, 0, left + blockW, 0);
    g.addColorStop(Math.max(0, sPos - 0.22), n.color);
    g.addColorStop(Math.min(1, sPos), "#ffffff");
    g.addColorStop(Math.min(1, sPos + 0.22), n.color);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = n.color;
  }

  if (n.shadow) {
    ctx.shadowColor = n.shadowColor || "rgba(0,0,0,.6)";
    ctx.shadowBlur = (n.shadowBlur / 100) * H;
  }
  const glow = Math.max(n.glow, ev.glowBoost * (n.glow || 0.5));
  if (glow > 0.01) {
    ctx.shadowColor = n.glowColor || n.color;
    ctx.shadowBlur = H * 0.035 * glow;
  }
  const strokeOn = n.strokeWidth > 0.001;
  if (strokeOn) {
    ctx.strokeStyle = n.strokeColor || "#000";
    ctx.lineWidth = n.strokeWidth * size;
    ctx.lineJoin = "round";
  }

  const anim = ev.stage === "in" ? tx.animation : ev.stage === "out" ? tx.animOut : "";
  const staggerMode =
    anim === "typewriter" ? "type" :
    anim === "letter-fade" || anim === "letter-scale" || anim === "letter-rotate" || anim === "letter-out" ? "letters" :
    anim === "word-slide" ? "words" :
    anim === "line-reveal" ? "lines" : "block";

  const drawPlain = () => {
    lines.forEach((ln, i) => {
      const y = top + lh * (i + 0.82);
      fillLine(ctx, ln, cx, y, n.align as CanvasTextAlign, n.letterSpacing, size, strokeOn);
    });
  };

  const stag = Math.max(0.008, n.animStagger);
  const elapsed = time - (tx.start + n.animDelay);

  if (staggerMode === "block") {
    drawPlain();
  } else if (staggerMode === "type") {
    const total = [...text].length;
    const shown = Math.max(0, Math.floor(elapsed / stag));
    let left2 = shown;
    lines.forEach((ln, i) => {
      const chars = [...ln];
      const take = Math.max(0, Math.min(chars.length, left2));
      left2 -= chars.length;
      const partial = chars.slice(0, take).join("");
      const caret = shown < total && take === chars.length - 0 && Math.floor(time * 2) % 2 === 0 && left2 < 0 ? "▍" : "";
      if (partial) fillLine(ctx, partial + caret, cx, top + lh * (i + 0.82), n.align as CanvasTextAlign, n.letterSpacing, size, strokeOn);
    });
  } else if (staggerMode === "lines") {
    lines.forEach((ln, i) => {
      const p = easeOut((elapsed - i * stag * 4) / Math.max(0.1, n.animDur));
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha = ev.alpha * p;
      fillLine(ctx, ln, cx, top + lh * (i + 0.82) + (1 - p) * size * 0.4, n.align as CanvasTextAlign, n.letterSpacing, size, strokeOn);
      ctx.restore();
    });
  } else if (staggerMode === "words") {
    lines.forEach((ln, li) => {
      const words = ln.split(/(\s+)/);
      const lw = ctx.measureText(ln).width;
      let x = n.align === "center" ? cx - lw / 2 : n.align === "right" ? cx - lw : cx;
      const prevAlign = ctx.textAlign;
      ctx.textAlign = "left";
      words.forEach((wd, i) => {
        const p = easeOut((elapsed - (li * 3 + i) * stag * 2) / Math.max(0.1, n.animDur));
        if (p > 0) {
          ctx.save();
          ctx.globalAlpha = ev.alpha * p;
          if (strokeOn) ctx.strokeText(wd, x + (1 - p) * W * 0.025, top + lh * (li + 0.82));
          ctx.fillText(wd, x + (1 - p) * W * 0.025, top + lh * (li + 0.82));
          ctx.restore();
        }
        x += ctx.measureText(wd).width;
      });
      ctx.textAlign = prevAlign;
    });
  } else {
    // 逐字
    let index = 0;
    const outMode = anim === "letter-out";
    lines.forEach((ln, li) => {
      const chars = [...ln];
      const lw = ctx.measureText(ln).width + Math.max(0, chars.length - 1) * n.letterSpacing * size;
      let x = n.align === "center" ? cx - lw / 2 : n.align === "right" ? cx - lw : cx;
      const prevAlign = ctx.textAlign;
      ctx.textAlign = "left";
      for (const ch of chars) {
        const p = easeOut((elapsed - index * stag) / Math.max(0.08, n.animDur * 0.6));
        const cw = ctx.measureText(ch).width;
        const pp = outMode ? 1 - p : p;
        if (pp > 0.001) {
          ctx.save();
          ctx.globalAlpha = ev.alpha * Math.min(1, pp);
          ctx.translate(x + cw / 2, top + lh * (li + 0.82));
          if (anim === "letter-scale") ctx.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p);
          if (anim === "letter-rotate") ctx.rotate((1 - p) * 0.55);
          if (strokeOn) ctx.strokeText(ch, -cw / 2, 0);
          ctx.fillText(ch, -cw / 2, 0);
          ctx.restore();
        }
        x += cw + n.letterSpacing * size;
        index++;
      }
      ctx.textAlign = prevAlign;
    });
  }

  // 装饰性变体
  if (n.animation === "neon" || n.animMotion === "glow-breath") {
    ctx.save();
    ctx.globalAlpha = ev.alpha * 0.5;
    ctx.strokeStyle = n.glowColor || "#9fe6ff";
    ctx.lineWidth = Math.max(1, size * 0.02);
    lines.forEach((ln, i) => ctx.strokeText(ln, cx, top + lh * (i + 0.82)));
    ctx.restore();
  }
  if (n.underline || n.strike) {
    ctx.save();
    ctx.globalAlpha = ev.alpha;
    ctx.fillStyle = n.color;
    lines.forEach((ln, i) => {
      const w = ctx.measureText(ln).width;
      const lx = n.align === "center" ? cx - w / 2 : n.align === "right" ? cx - w : cx;
      const y = top + lh * (i + 0.82);
      if (n.underline) ctx.fillRect(lx, y + size * 0.14, w, Math.max(1, size * 0.05));
      if (n.strike) ctx.fillRect(lx, y - size * 0.28, w, Math.max(1, size * 0.05));
    });
    ctx.restore();
  }

  ctx.filter = "none";
  ctx.restore();
}



export function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
