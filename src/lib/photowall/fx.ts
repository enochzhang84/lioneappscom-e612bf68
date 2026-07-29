// Photo Wall Studio — 特效叠加层（Canvas 2D 实现，编辑器 / 预览 / 导出共用）
import type { FxKind } from "./animations";

/** 在已裁切的图片区域内绘制特效。w/h 为该图片矩形尺寸，p 为片段进度 0..1 */
export function drawFx(
  ctx: CanvasRenderingContext2D,
  kind: FxKind,
  amt: number,
  w: number,
  h: number,
  p: number,
  seed: number,
) {
  if (!kind || amt <= 0.001) return;
  const a = Math.min(1, Math.max(0, amt));
  if (EXTRA_FX.has(kind)) {
    ctx.save();
    drawExtraFx(ctx, kind, a, w, h, p, seed);
    ctx.restore();
    return;
  }
  ctx.save();

  switch (kind) {
    case "vignette": {
      const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${0.65 * a})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "grain": {
      ctx.globalAlpha = 0.13 * a;
      const step = Math.max(2, Math.round(Math.min(w, h) / 180));
      for (let i = 0; i < 900; i++) {
        const x = ((Math.sin((i + seed) * 12.9898 + p * 7) * 43758.5453) % 1 + 1) % 1;
        const y = ((Math.sin((i + seed) * 78.233 + p * 11) * 43758.5453) % 1 + 1) % 1;
        ctx.fillStyle = i % 2 ? "#ffffff" : "#000000";
        ctx.fillRect(x * w, y * h, step, step);
      }
      break;
    }
    case "flare": {
      const cx = w * (0.2 + p * 0.6);
      const cy = h * 0.28;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.55);
      g.addColorStop(0, `rgba(255,246,214,${0.85 * a})`);
      g.addColorStop(0.35, `rgba(255,214,140,${0.28 * a})`);
      g.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "leak": {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, `rgba(255,120,60,${0.35 * a})`);
      g.addColorStop(0.5, "rgba(255,180,80,0)");
      g.addColorStop(1, `rgba(255,90,150,${0.22 * a})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "burn": {
      const r = Math.max(w, h) * (0.15 + (1 - a) * 1.1);
      const g = ctx.createRadialGradient(w * 0.5, h * 0.5, r * 0.55, w * 0.5, h * 0.5, r);
      g.addColorStop(0, "rgba(255,140,20,0)");
      g.addColorStop(0.7, `rgba(255,120,20,${0.55 * a})`);
      g.addColorStop(1, `rgba(60,20,0,${0.8 * a})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "dust": {
      ctx.globalAlpha = 0.5 * a;
      for (let i = 0; i < 90; i++) {
        const x = ((Math.sin((i + seed) * 3.3) * 43758.5) % 1 + 1) % 1;
        const y = (((Math.cos((i + seed) * 7.7) * 43758.5) % 1 + 1) % 1 + p * 0.3) % 1;
        const r = Math.min(w, h) * (0.002 + (i % 5) * 0.001);
        ctx.fillStyle = "rgba(255,245,220,0.9)";
        ctx.beginPath();
        ctx.arc(x * w, y * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "frame": {
      const bar = h * 0.075 * a;
      ctx.fillStyle = "rgba(0,0,0,0.92)";
      ctx.fillRect(0, 0, w, bar);
      ctx.fillRect(0, h - bar, w, bar);
      break;
    }
    case "rgb": {
      ctx.globalCompositeOperation = "screen";
      const off = Math.min(w, h) * 0.012 * a;
      ctx.globalAlpha = 0.35 * a;
      ctx.fillStyle = "#ff0040";
      ctx.fillRect(-off, 0, w, h);
      ctx.fillStyle = "#00ffe0";
      ctx.fillRect(off, 0, w, h);
      break;
    }
    case "glitch": {
      const bands = 7;
      for (let i = 0; i < bands; i++) {
        const y = ((Math.sin((i + seed + Math.floor(p * 20)) * 91.7) * 43758.5) % 1 + 1) % 1 * h;
        const bh = h * 0.02;
        const dx = (((Math.cos((i + seed + Math.floor(p * 20)) * 13.1) * 43758.5) % 1 + 1) % 1 - 0.5) * w * 0.06 * a;
        ctx.globalAlpha = 0.5 * a;
        ctx.fillStyle = i % 2 ? "rgba(0,255,224,.45)" : "rgba(255,0,80,.45)";
        ctx.fillRect(dx, y, w, bh);
      }
      break;
    }
    case "scan": {
      const y = ((p * 1.2) % 1) * h;
      const g = ctx.createLinearGradient(0, y - h * 0.08, 0, y + h * 0.08);
      g.addColorStop(0, "rgba(80,220,255,0)");
      g.addColorStop(0.5, `rgba(120,235,255,${0.5 * a})`);
      g.addColorStop(1, "rgba(80,220,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, y - h * 0.08, w, h * 0.16);
      ctx.globalAlpha = 0.12 * a;
      ctx.fillStyle = "#7ce7ff";
      for (let i = 0; i < h; i += 4) ctx.fillRect(0, i, w, 1);
      break;
    }
    case "grid": {
      ctx.globalAlpha = 0.35 * a;
      ctx.strokeStyle = "rgba(90,200,255,.55)";
      ctx.lineWidth = Math.max(1, w / 900);
      const n = 12;
      for (let i = 1; i < n; i++) {
        ctx.beginPath(); ctx.moveTo((w / n) * i, 0); ctx.lineTo((w / n) * i, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, (h / n) * i); ctx.lineTo(w, (h / n) * i); ctx.stroke();
      }
      break;
    }
    case "hud": {
      ctx.globalAlpha = a;
      ctx.strokeStyle = "rgba(120,235,255,.85)";
      ctx.lineWidth = Math.max(1.5, w / 500);
      const c = Math.min(w, h) * 0.12;
      const pad = Math.min(w, h) * 0.04;
      const corners: [number, number, number, number][] = [
        [pad, pad, 1, 1], [w - pad, pad, -1, 1], [pad, h - pad, 1, -1], [w - pad, h - pad, -1, -1],
      ];
      for (const [x, y, sx, sy] of corners) {
        ctx.beginPath();
        ctx.moveTo(x + sx * c, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + sy * c);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.5 * a;
      ctx.fillStyle = "rgba(120,235,255,.9)";
      ctx.fillRect(pad, h * 0.5 - 1, w * 0.06, 2);
      break;
    }
    case "neon": {
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = `rgba(90,180,255,${0.9 * a})`;
      ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.012);
      ctx.shadowColor = "rgba(90,180,255,.9)";
      ctx.shadowBlur = Math.min(w, h) * 0.06 * a;
      ctx.strokeRect(2, 2, w - 4, h - 4);
      break;
    }
    case "hologram": {
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.2 * a;
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#22d3ee");
      g.addColorStop(0.5, "#818cf8");
      g.addColorStop(1, "#22d3ee");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.14 * a;
      ctx.fillStyle = "#ffffff";
      for (let i = (p * 8) % 6; i < h; i += 6) ctx.fillRect(0, i, w, 1.5);
      break;
    }
    case "matrix": {
      ctx.globalAlpha = 0.5 * a;
      ctx.fillStyle = "rgba(0,255,120,.75)";
      const cols = 26;
      const cw = w / cols;
      for (let i = 0; i < cols; i++) {
        const off = ((Math.sin(i * 33.3 + seed) * 43758.5) % 1 + 1) % 1;
        const y = ((p * 1.5 + off) % 1) * h;
        ctx.fillRect(i * cw + cw * 0.35, y, Math.max(1, cw * 0.18), h * 0.06);
      }
      break;
    }
    case "particle": {
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 140; i++) {
        const rx = ((Math.sin((i + seed) * 5.1) * 43758.5) % 1 + 1) % 1;
        const ry = ((Math.cos((i + seed) * 9.7) * 43758.5) % 1 + 1) % 1;
        const d = a;
        ctx.globalAlpha = 0.7 * a;
        ctx.fillStyle = "rgba(200,230,255,.95)";
        ctx.beginPath();
        ctx.arc((rx * 1.2 - 0.1) * w + (rx - 0.5) * w * 0.3 * d, (ry * 1.2 - 0.1) * h + (ry - 0.5) * h * 0.3 * d, Math.min(w, h) * 0.004, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "spotlight": {
      const g = ctx.createRadialGradient(w / 2, h * 0.42, Math.min(w, h) * 0.12, w / 2, h * 0.45, Math.max(w, h) * 0.62);
      g.addColorStop(0, "rgba(255,255,255,0.16)");
      g.addColorStop(0.45, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${0.72 * a})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "sweep": {
      const x = (p * 1.4 - 0.2) * w;
      const g = ctx.createLinearGradient(x - w * 0.22, 0, x + w * 0.22, h);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, `rgba(255,255,255,${0.42 * a})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "glass": {
      ctx.globalAlpha = 0.16 * a;
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "rgba(255,255,255,.9)");
      g.addColorStop(0.45, "rgba(255,255,255,.05)");
      g.addColorStop(1, "rgba(180,210,255,.5)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.5 * a;
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.lineWidth = Math.max(1, w / 700);
      ctx.strokeRect(1, 1, w - 2, h - 2);
      break;
    }
    case "circuit": {
      ctx.globalAlpha = 0.6 * a;
      ctx.strokeStyle = "rgba(90,220,255,.8)";
      ctx.lineWidth = Math.max(1.2, w / 800);
      for (let i = 0; i < 6; i++) {
        const y = (h / 7) * (i + 1);
        const off = ((p * 1.6 + i * 0.17) % 1) * w;
        ctx.beginPath();
        ctx.moveTo(off - w * 0.25, y);
        ctx.lineTo(off, y);
        ctx.lineTo(off + w * 0.05, y + h * 0.05);
        ctx.stroke();
      }
      break;
    }
    case "pulse": {
      const r = ((p * 1.2) % 1) * Math.max(w, h) * 0.7;
      ctx.globalAlpha = (1 - ((p * 1.2) % 1)) * a;
      ctx.strokeStyle = "rgba(140,200,255,.8)";
      ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.006);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "rainbow": {
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.35 * a;
      const g = ctx.createLinearGradient(0, 0, w, h);
      ["#ff4d4d", "#ffb84d", "#ffe74d", "#4dff88", "#4dd2ff", "#a24dff"].forEach((c, i, arr) =>
        g.addColorStop(i / (arr.length - 1), c),
      );
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

/** 转场遮罩裁切路径 */
export function applyTransitionClip(
  ctx: CanvasRenderingContext2D,
  clip: NonNullable<import("./animations").TransitionState["clip"]>,
  t: number,
  W: number,
  H: number,
) {
  const p = Math.min(1, Math.max(0, t));
  ctx.beginPath();
  switch (clip) {
    case "circleIn":
      ctx.arc(W / 2, H / 2, Math.hypot(W, H) * 0.55 * p, 0, Math.PI * 2);
      break;
    case "circleOut":
      ctx.arc(W / 2, H / 2, Math.hypot(W, H) * 0.55 * p, 0, Math.PI * 2);
      break;
    case "wipeL":
      ctx.rect(0, 0, W * p, H);
      break;
    case "wipeR":
      ctx.rect(W * (1 - p), 0, W * p, H);
      break;
    case "wipeU":
      ctx.rect(0, 0, W, H * p);
      break;
    case "wipeD":
      ctx.rect(0, H * (1 - p), W, H * p);
      break;
    case "splitH":
      ctx.rect(0, H / 2 - (H / 2) * p, W, H * p);
      break;
    case "splitV":
      ctx.rect(W / 2 - (W / 2) * p, 0, W * p, H);
      break;
    case "doorH":
      ctx.rect(0, 0, (W / 2) * p, H);
      ctx.rect(W - (W / 2) * p, 0, (W / 2) * p, H);
      break;
    case "doorV":
      ctx.rect(0, 0, W, (H / 2) * p);
      ctx.rect(0, H - (H / 2) * p, W, (H / 2) * p);
      break;
    case "tear": {
      ctx.moveTo(0, 0);
      ctx.lineTo(W, 0);
      const y = H * p;
      ctx.lineTo(W, y);
      for (let x = W; x >= 0; x -= W / 14) ctx.lineTo(x, y + Math.sin(x / (W / 7)) * H * 0.03);
      ctx.lineTo(0, 0);
      break;
    }
    case "ripple": {
      const r = Math.hypot(W, H) * 0.55 * p;
      for (let i = 0; i < 40; i++) {
        const a0 = (i / 40) * Math.PI * 2;
        const rr = r * (1 + Math.sin(a0 * 8 + p * 10) * 0.06);
        const x = W / 2 + Math.cos(a0) * rr;
        const y = H / 2 + Math.sin(a0) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    default:
      ctx.rect(0, 0, W, H);
  }
  ctx.clip();
}

/* ==================== 扩展特效：背景动画 / 特效动画 ==================== */
export const EXTRA_FX = new Set<string>([
  "snow", "rain", "bokeh", "sparkle", "confetti", "heart", "bubble", "floatdust",
  "fire", "smoke", "fog", "aurora", "gradmove", "glowpulse", "beam", "halo",
  "softlight", "dark", "light", "bloom", "ripplefx", "reflect", "dream", "highlight", "blurbg",
]);

const h01 = (i: number, s: number) => ((Math.sin((i + 1) * 127.1 + s * 311.7) * 43758.5453) % 1 + 1) % 1;

/** 通用粒子绘制 */
function particles(
  ctx: CanvasRenderingContext2D, n: number, w: number, h: number, p: number, seed: number,
  draw: (x: number, y: number, r: number, i: number) => void,
  fall = 1, drift = 0.15,
) {
  for (let i = 0; i < n; i++) {
    const rx = h01(i, seed), ry = h01(i + 91, seed), rr = h01(i + 37, seed);
    const y = ((ry + p * fall * (0.4 + rr * 0.8)) % 1) * h;
    const x = ((rx + Math.sin(p * Math.PI * 2 + i) * drift) % 1 + 1) % 1 * w;
    draw(x, y, (0.4 + rr) * Math.min(w, h) * 0.012, i);
  }
}

export function drawExtraFx(
  ctx: CanvasRenderingContext2D, kind: string, a: number, w: number, h: number, p: number, seed: number,
) {
  const m = Math.min(w, h);
  switch (kind) {
    case "dark":
      ctx.fillStyle = `rgba(0,0,0,${0.5 * a})`;
      ctx.fillRect(0, 0, w, h);
      break;
    case "light":
      ctx.fillStyle = `rgba(255,255,255,${0.32 * a})`;
      ctx.fillRect(0, 0, w, h);
      break;
    case "softlight": {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, `rgba(255,255,255,${0.28 * a})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "blurbg": {
      const g = ctx.createRadialGradient(w / 2, h / 2, m * 0.3, w / 2, h / 2, m * 0.85);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(10,12,20,${0.55 * a})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "glowpulse":
    case "bloom": {
      const k = 0.5 + Math.sin(p * Math.PI * 2) * 0.5;
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, m * 0.75);
      g.addColorStop(0, `rgba(255,244,214,${(kind === "bloom" ? 0.3 : 0.22) * a * (0.5 + k * 0.5)})`);
      g.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "halo": {
      ctx.strokeStyle = `rgba(255,236,190,${0.5 * a})`;
      ctx.lineWidth = m * 0.012;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.42, m * (0.24 + p * 0.05), 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "beam": {
      ctx.globalAlpha = 0.5 * a;
      const g = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, h);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(Math.min(0.95, 0.15 + p * 0.7), "rgba(255,250,230,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "highlight": {
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * a})`;
      ctx.lineWidth = m * 0.008;
      const inset = m * 0.03;
      ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
      break;
    }
    case "reflect": {
      const g = ctx.createLinearGradient(0, h * 0.72, 0, h);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(1, `rgba(255,255,255,${0.18 * a})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
      break;
    }
    case "dream": {
      ctx.globalAlpha = 0.35 * a;
      const g = ctx.createRadialGradient(w * 0.4, h * 0.35, 0, w * 0.4, h * 0.35, m);
      g.addColorStop(0, "rgba(255,220,245,0.55)");
      g.addColorStop(0.6, "rgba(190,215,255,0.25)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "aurora": {
      ctx.globalAlpha = 0.4 * a;
      for (let i = 0; i < 3; i++) {
        const g = ctx.createLinearGradient(0, h * (0.1 + i * 0.12), w, h * (0.4 + i * 0.12));
        g.addColorStop(0, i === 0 ? "rgba(80,220,190,0)" : "rgba(120,150,255,0)");
        g.addColorStop(0.5, i === 0 ? "rgba(80,220,190,0.5)" : i === 1 ? "rgba(140,120,255,0.45)" : "rgba(255,140,210,0.35)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.save();
        ctx.translate(0, Math.sin(p * Math.PI * 2 + i) * h * 0.05);
        ctx.fillRect(0, h * (0.05 + i * 0.14), w, h * 0.22);
        ctx.restore();
      }
      break;
    }
    case "gradmove": {
      ctx.globalAlpha = 0.35 * a;
      const off = (p % 1) * w;
      const g = ctx.createLinearGradient(-w + off, 0, off, h);
      g.addColorStop(0, "rgba(37,99,235,0.5)");
      g.addColorStop(0.5, "rgba(14,165,233,0.25)");
      g.addColorStop(1, "rgba(217,119,6,0.35)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "fog":
    case "smoke": {
      ctx.globalAlpha = (kind === "fog" ? 0.32 : 0.26) * a;
      for (let i = 0; i < 5; i++) {
        const cx = ((h01(i, seed) + p * 0.15) % 1) * w;
        const cy = h * (0.3 + h01(i + 5, seed) * 0.6) - (kind === "smoke" ? p * h * 0.3 : 0);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, m * 0.5);
        g.addColorStop(0, kind === "fog" ? "rgba(230,235,245,0.6)" : "rgba(120,120,130,0.6)");
        g.addColorStop(1, "rgba(200,200,210,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      break;
    }
    case "fire": {
      ctx.globalAlpha = 0.5 * a;
      particles(ctx, 40, w, h, p, seed, (x, y, r) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        g.addColorStop(0, "rgba(255,220,120,0.9)");
        g.addColorStop(0.5, "rgba(255,120,30,0.5)");
        g.addColorStop(1, "rgba(255,60,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }, -1.2, 0.05);
      break;
    }
    case "snow":
      ctx.globalAlpha = 0.85 * a;
      particles(ctx, 70, w, h, p, seed, (x, y, r) => {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }, 1, 0.1);
      break;
    case "rain":
      ctx.globalAlpha = 0.5 * a;
      ctx.strokeStyle = "rgba(200,220,255,0.7)";
      ctx.lineWidth = Math.max(1, m * 0.002);
      particles(ctx, 80, w, h, p, seed, (x, y, r) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - r * 0.4, y + r * 4);
        ctx.stroke();
      }, 3.2, 0.02);
      break;
    case "bokeh":
      ctx.globalAlpha = 0.5 * a;
      particles(ctx, 26, w, h, p, seed, (x, y, r, i) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, i % 3 === 0 ? "rgba(255,225,170,0.55)" : "rgba(255,255,255,0.42)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }, -0.4, 0.2);
      break;
    case "floatdust":
    case "sparkle":
      ctx.globalAlpha = (kind === "sparkle" ? 0.9 : 0.55) * a;
      particles(ctx, kind === "sparkle" ? 44 : 60, w, h, p, seed, (x, y, r, i) => {
        const tw = kind === "sparkle" ? 0.35 + 0.65 * Math.abs(Math.sin(p * Math.PI * 4 + i)) : 1;
        ctx.fillStyle = `rgba(255,252,230,${0.8 * tw})`;
        ctx.beginPath();
        ctx.arc(x, y, r * (kind === "sparkle" ? 0.5 : 0.35), 0, Math.PI * 2);
        ctx.fill();
      }, kind === "sparkle" ? -0.3 : -0.5, 0.12);
      break;
    case "bubble":
      ctx.globalAlpha = 0.55 * a;
      ctx.strokeStyle = "rgba(220,240,255,0.8)";
      ctx.lineWidth = Math.max(1, m * 0.0018);
      particles(ctx, 30, w, h, p, seed, (x, y, r) => {
        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, Math.PI * 2);
        ctx.stroke();
      }, -0.8, 0.14);
      break;
    case "confetti":
      ctx.globalAlpha = 0.85 * a;
      particles(ctx, 50, w, h, p, seed, (x, y, r, i) => {
        const cols = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"];
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p * 6 + i);
        ctx.fillStyle = cols[i % cols.length];
        ctx.fillRect(-r * 0.5, -r, r, r * 2);
        ctx.restore();
      }, 1.4, 0.18);
      break;
    case "heart":
      ctx.globalAlpha = 0.7 * a;
      particles(ctx, 22, w, h, p, seed, (x, y, r) => {
        ctx.fillStyle = "rgba(255,120,160,0.85)";
        ctx.beginPath();
        const s = r * 1.4;
        ctx.moveTo(x, y + s * 0.6);
        ctx.bezierCurveTo(x + s, y - s * 0.3, x + s * 0.4, y - s, x, y - s * 0.3);
        ctx.bezierCurveTo(x - s * 0.4, y - s, x - s, y - s * 0.3, x, y + s * 0.6);
        ctx.fill();
      }, -0.9, 0.16);
      break;
    case "ripplefx": {
      ctx.globalAlpha = 0.5 * a;
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      for (let i = 0; i < 3; i++) {
        const t = (p + i / 3) % 1;
        ctx.globalAlpha = 0.5 * a * (1 - t);
        ctx.lineWidth = m * 0.006;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, m * 0.1 + t * m * 0.55, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    default:
      break;
  }
}
