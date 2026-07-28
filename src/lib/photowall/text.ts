// Photo Wall Studio — 文字共享模块（类型元数据 / 字体回退 / 文字模板 / 开场模板 / 开场生成）
// 编辑器面板、画布直接编辑、渲染引擎（预览 + 真实预览 + 导出）共用本文件。
import type { AspectKey, PWIntro, PWProject, PWText, TextKind } from "./types";
import { defaultIntro } from "./types";

/* --------------------------------------------------------------
 * 一、字体：始终附带中英文回退，缺字体不会导致文字消失
 * -------------------------------------------------------------- */
const CJK_SANS = `"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Source Han Sans SC","Heiti SC","WenQuanYi Micro Hei"`;
const CJK_SERIF = `"Songti SC","SimSun","Noto Serif SC","Source Han Serif SC","STSong"`;
const EMOJI = `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"`;

export const FONT_STACKS: { key: string; label: string; stack: string }[] = [
  { key: "sans", label: "现代黑体（中英通用）", stack: `"Inter","Helvetica Neue",Arial,${CJK_SANS},sans-serif,${EMOJI}` },
  { key: "sans-bold", label: "标题黑体", stack: `"Inter","Arial Black",Impact,${CJK_SANS},sans-serif,${EMOJI}` },
  { key: "serif", label: "宋体 / 衬线", stack: `Georgia,"Times New Roman",${CJK_SERIF},serif,${EMOJI}` },
  { key: "kai", label: "楷体（经文）", stack: `"Kaiti SC","STKaiti","KaiTi",${CJK_SERIF},serif,${EMOJI}` },
  { key: "mono", label: "等宽 / 科技", stack: `"JetBrains Mono","SF Mono",Menlo,Consolas,${CJK_SANS},monospace,${EMOJI}` },
  { key: "round", label: "圆体（活泼）", stack: `"Yuanti SC","Hiragino Maru Gothic ProN","Quicksand",${CJK_SANS},sans-serif,${EMOJI}` },
];

/** 把任意保存的字体名规范化为带回退的字体栈（兼容旧数据） */
export function fontStack(font: string | undefined): string {
  if (!font) return FONT_STACKS[0].stack;
  const hit = FONT_STACKS.find((f) => f.key === font || f.stack === font);
  if (hit) return hit.stack;
  // 旧数据只存了字体名 → 追加中英文回退
  if (font.includes(",")) return `${font},${CJK_SANS},sans-serif,${EMOJI}`;
  return `"${font.replace(/["']/g, "")}",${CJK_SANS},sans-serif,${EMOJI}`;
}

/* --------------------------------------------------------------
 * 二、文字类型元数据
 * -------------------------------------------------------------- */
export interface TextKindMeta {
  kind: TextKind;
  label: string;
  /** 默认字号（占画布高 %） */
  size: number;
  /** 默认纵向位置 0..1 */
  y: number;
  weight: number;
  font: string;
  color: string;
  /** 是否是开场默认勾选项 */
  introDefault?: boolean;
  sample: string;
}

export const TEXT_KINDS: TextKindMeta[] = [
  { kind: "title", label: "主标题", size: 9, y: 0.42, weight: 800, font: "sans-bold", color: "#ffffff", introDefault: true, sample: "标题文字" },
  { kind: "subtitle", label: "副标题", size: 4.6, y: 0.55, weight: 500, font: "sans", color: "#e8eefc", introDefault: true, sample: "副标题" },
  { kind: "theme", label: "活动主题", size: 5.5, y: 0.5, weight: 700, font: "sans", color: "#ffffff", sample: "活动主题" },
  { kind: "eventName", label: "活动名称", size: 5, y: 0.5, weight: 600, font: "sans", color: "#ffffff", sample: "活动名称" },
  { kind: "speaker", label: "讲员", size: 4, y: 0.66, weight: 600, font: "sans", color: "#ffe9b8", sample: "讲员：某某" },
  { kind: "date", label: "日期", size: 3.4, y: 0.74, weight: 500, font: "sans", color: "#dbe6ff", introDefault: true, sample: "2026年7月18日" },
  { kind: "time", label: "时间", size: 3.2, y: 0.79, weight: 500, font: "sans", color: "#dbe6ff", sample: "上午 10:00" },
  { kind: "place", label: "地点", size: 3.2, y: 0.8, weight: 500, font: "sans", color: "#dbe6ff", introDefault: true, sample: "教会主堂" },
  { kind: "host", label: "主办单位", size: 2.8, y: 0.88, weight: 500, font: "sans", color: "#c7d3ea", sample: "主办：某某教会" },
  { kind: "url", label: "网址", size: 2.6, y: 0.92, weight: 500, font: "mono", color: "#a9c6ff", sample: "example.org" },
  { kind: "signup", label: "报名说明", size: 2.8, y: 0.86, weight: 500, font: "sans", color: "#cfd9ea", sample: "扫码报名" },
  { kind: "verse", label: "经文", size: 4.2, y: 0.5, weight: 500, font: "kai", color: "#fdf6e3", sample: "经文内容" },
  { kind: "caption", label: "图片解说", size: 3, y: 0.88, weight: 500, font: "sans", color: "#ffffff", sample: "照片说明" },
  { kind: "outro", label: "片尾感谢", size: 6, y: 0.5, weight: 700, font: "sans", color: "#ffffff", sample: "感谢观看" },
  { kind: "body", label: "其他文字", size: 3, y: 0.6, weight: 500, font: "sans", color: "#ffffff", sample: "文字" },
];

export function kindMeta(kind: TextKind): TextKindMeta {
  return TEXT_KINDS.find((k) => k.kind === kind) ?? TEXT_KINDS[TEXT_KINDS.length - 1];
}

/** 创建一个带完整默认值的文字对象 */
export function makeText(kind: TextKind, patch: Partial<PWText> = {}): PWText {
  const m = kindMeta(kind);
  return {
    id: crypto.randomUUID(),
    kind,
    name: m.label,
    text: m.sample,
    preset: "custom",
    font: m.font,
    size: m.size,
    color: m.color,
    align: "center",
    shadow: true,
    animation: "fade",
    start: 0,
    duration: 5,
    weight: m.weight,
    italic: false,
    underline: false,
    strike: false,
    letterSpacing: 0,
    lineHeight: 1.25,
    transform: "none",
    wrap: true,
    maxWidth: 0.86,
    maxLines: 3,
    valign: "middle",
    colorTo: null,
    strokeWidth: 0,
    strokeColor: "#000000",
    shadowColor: "rgba(0,0,0,.6)",
    shadowBlur: 1.8,
    glow: 0,
    glowColor: "#ffffff",
    bgColor: null,
    bgOpacity: 0.45,
    bgRadius: 12,
    bgPad: 0.5,
    x: 0.5,
    y: m.y,
    scale: 1,
    rotate: 0,
    opacity: 1,
    z: 0,
    locked: false,
    hidden: false,
    animOut: "fade-out",
    animMotion: "none",
    animDur: 0.8,
    animDelay: 0,
    animSpeed: 1,
    animEasing: "cinematic",
    animStagger: 0.05,
    animIntensity: 1,
    animLoop: false,
    group: null,
    ...patch,
  };
}

/** 兼容旧文字对象：补齐缺省字段（渲染与编辑统一入口） */
export function normalizeText(t: PWText): Required<Pick<PWText,
  "weight" | "lineHeight" | "letterSpacing" | "maxWidth" | "maxLines" | "wrap" | "valign" |
  "x" | "y" | "scale" | "rotate" | "opacity" | "z" | "animDur" | "animDelay" | "animSpeed" |
  "animStagger" | "animIntensity" | "shadowBlur" | "bgOpacity" | "bgRadius" | "bgPad" |
  "strokeWidth" | "glow" | "transform">> & PWText {
  const m = kindMeta(t.kind);
  return {
    ...t,
    weight: t.weight ?? m.weight,
    lineHeight: t.lineHeight ?? 1.25,
    letterSpacing: t.letterSpacing ?? 0,
    maxWidth: t.maxWidth ?? 0.86,
    maxLines: t.maxLines ?? 3,
    wrap: t.wrap ?? true,
    valign: t.valign ?? "middle",
    x: t.x ?? (t.align === "left" ? 0.07 : t.align === "right" ? 0.93 : 0.5),
    y: t.y ?? m.y,
    scale: t.scale ?? 1,
    rotate: t.rotate ?? 0,
    opacity: t.opacity ?? 1,
    z: t.z ?? 0,
    animDur: t.animDur ?? 0.8,
    animDelay: t.animDelay ?? 0,
    animSpeed: t.animSpeed ?? 1,
    animStagger: t.animStagger ?? 0.05,
    animIntensity: t.animIntensity ?? 1,
    shadowBlur: t.shadowBlur ?? 1.8,
    bgOpacity: t.bgOpacity ?? 0.45,
    bgRadius: t.bgRadius ?? 12,
    bgPad: t.bgPad ?? 0.5,
    strokeWidth: t.strokeWidth ?? 0,
    glow: t.glow ?? 0,
    transform: t.transform ?? "none",
  };
}

/* --------------------------------------------------------------
 * 三、文字模板库（只改样式与动画，不动内容与其他图层）
 * -------------------------------------------------------------- */
export interface TextTemplate {
  key: string;
  name: string;
  use: string;
  /** 预览用的 CSS 片段 */
  preview: { bg: string; color: string; font: string; weight: number; shadow?: string; letter?: string };
  animLabel: string;
  patch: Partial<PWText>;
}

export const TEXT_TEMPLATES: TextTemplate[] = [
  {
    key: "cinema-title", name: "电影主标题", use: "开场大标题", animLabel: "电影标题",
    preview: { bg: "linear-gradient(180deg,#0a0a0c,#1a1d24)", color: "#fff", font: "serif", weight: 800, letter: "0.12em" },
    patch: { font: "sans-bold", weight: 800, size: 9, letterSpacing: 0.12, color: "#ffffff", colorTo: null, animation: "title-cinematic", animOut: "fade-out", animMotion: "slow-zoom", shadow: true, shadowBlur: 2.4 },
  },
  {
    key: "event-open", name: "活动开场", use: "活动名称 / 主题", animLabel: "遮罩揭示",
    preview: { bg: "linear-gradient(135deg,#12305e,#2563eb)", color: "#fff", font: "sans-serif", weight: 700 },
    patch: { font: "sans-bold", weight: 700, size: 8, color: "#ffffff", animation: "mask-reveal", animOut: "fade-out", animMotion: "none" },
  },
  {
    key: "retreat", name: "退修会主题", use: "退修会 / 特会", animLabel: "优雅显现",
    preview: { bg: "linear-gradient(160deg,#102418,#28503a)", color: "#f2ffe9", font: "serif", weight: 700 },
    patch: { font: "serif", weight: 700, size: 8.5, color: "#f4fff2", animation: "text-elegant", animOut: "blur-out", animMotion: "breath", shadow: true },
  },
  {
    key: "sunday", name: "主日敬拜", use: "主日welcome", animLabel: "上滑",
    preview: { bg: "linear-gradient(160deg,#0d1220,#1e3a8a)", color: "#fff", font: "sans-serif", weight: 700 },
    patch: { font: "sans", weight: 700, size: 7.5, color: "#ffffff", animation: "rise", animOut: "fade-out", animMotion: "float" },
  },
  {
    key: "verse", name: "经文展示", use: "金句 / 经文", animLabel: "经文优雅显现",
    preview: { bg: "linear-gradient(160deg,#1a1508,#3a2c10)", color: "#fdf6e3", font: "serif", weight: 500 },
    patch: { font: "kai", weight: 500, size: 4.6, color: "#fdf6e3", lineHeight: 1.5, maxLines: 4, animation: "bible-verse", animOut: "fade-out", animMotion: "breath" },
  },
  {
    key: "speaker", name: "讲员介绍", use: "讲员 / 主领", animLabel: "逐字出现",
    preview: { bg: "linear-gradient(135deg,#1b1206,#4a3312)", color: "#ffe9b8", font: "sans-serif", weight: 600 },
    patch: { font: "sans", weight: 600, size: 4.2, color: "#ffe9b8", animation: "letter-fade", animOut: "fade-out" },
  },
  {
    key: "datetime", name: "日期地点", use: "时间 / 地点信息", animLabel: "淡入",
    preview: { bg: "linear-gradient(135deg,#101623,#243247)", color: "#dbe6ff", font: "sans-serif", weight: 500 },
    patch: { font: "sans", weight: 500, size: 3.2, color: "#dbe6ff", letterSpacing: 0.04, animation: "fade", animOut: "fade-out" },
  },
  {
    key: "photo-caption", name: "照片说明", use: "照片下方说明", animLabel: "下方字幕",
    preview: { bg: "linear-gradient(0deg,#000,#333)", color: "#fff", font: "sans-serif", weight: 500 },
    patch: { font: "sans", weight: 500, size: 2.8, color: "#ffffff", y: 0.9, bgColor: "#000000", bgOpacity: 0.45, animation: "subtitle", animOut: "fade-out" },
  },
  {
    key: "nametag", name: "人名字幕", use: "人物下方名条", animLabel: "左滑进入",
    preview: { bg: "linear-gradient(90deg,#0b1a2b,#155e91)", color: "#fff", font: "sans-serif", weight: 600 },
    patch: { font: "sans", weight: 600, size: 3, color: "#ffffff", align: "left", x: 0.08, y: 0.84, bgColor: "#0b1a2b", bgOpacity: 0.6, animation: "slide-left", animOut: "slide-out-left" },
  },
  {
    key: "thanks", name: "片尾感谢", use: "结束语", animLabel: "缩放进入",
    preview: { bg: "linear-gradient(160deg,#0a0c11,#232a3a)", color: "#fff", font: "sans-serif", weight: 700 },
    patch: { font: "sans", weight: 700, size: 6, color: "#ffffff", animation: "zoom-in", animOut: "zoom-out", animMotion: "none" },
  },
  {
    key: "gold", name: "金色典雅", use: "节庆 / 典礼", animLabel: "金色扫光",
    preview: { bg: "linear-gradient(160deg,#0c0a05,#2c220c)", color: "#e6c069", font: "serif", weight: 700 },
    patch: { font: "serif", weight: 700, size: 8, color: "#e6c069", colorTo: "#fff3c4", animation: "gradient-sweep", animOut: "fade-out", animMotion: "sweep", strokeWidth: 0 },
  },
  {
    key: "apple", name: "Apple 简约", use: "简洁标题", animLabel: "Apple 简约显现",
    preview: { bg: "linear-gradient(160deg,#0b0b0d,#1c1c1f)", color: "#f5f5f7", font: "sans-serif", weight: 600, letter: "-0.02em" },
    patch: { font: "sans", weight: 600, size: 7.5, letterSpacing: -0.02, color: "#f5f5f7", shadow: false, animation: "title-apple", animOut: "blur-out", animMotion: "none" },
  },
  {
    key: "tech", name: "科技标题", use: "讲座 / 科技主题", animLabel: "发光显现",
    preview: { bg: "linear-gradient(135deg,#04070f,#0b2b4a)", color: "#9fe6ff", font: "monospace", weight: 700 },
    patch: { font: "mono", weight: 700, size: 7, color: "#bff0ff", glow: 0.8, glowColor: "#4fc3ff", animation: "neon", animOut: "fade-out", animMotion: "glow-breath" },
  },
  {
    key: "kids", name: "儿童欢乐", use: "主日学 / 儿童", animLabel: "弹跳缩放",
    preview: { bg: "linear-gradient(135deg,#2b1a00,#f59e0b)", color: "#fff7e0", font: "sans-serif", weight: 800 },
    patch: { font: "round", weight: 800, size: 8, color: "#fff7e0", strokeWidth: 0.06, strokeColor: "#e0457b", animation: "letter-scale", animOut: "zoom-out", animMotion: "float" },
  },
];

/* --------------------------------------------------------------
 * 四、开场模板
 * -------------------------------------------------------------- */
export interface OpeningTemplate {
  key: string;
  name: string;
  emoji: string;
  desc: string;
  duration: number;
  intro: Partial<PWIntro>;
  /** 每种文字类型的样式覆盖 */
  style: Partial<Record<TextKind | "default", Partial<PWText>>>;
}

export const OPENING_TEMPLATES: OpeningTemplate[] = [
  {
    key: "cinema", name: "电影标题", emoji: "🎬", desc: "黑场 + 缓推大字，庄重有仪式感", duration: 8,
    intro: { bg: "posterBlur", blur: 30, scale: 1.14, dim: 0.62, bgColor: "#050608", outro: "fade" },
    style: {
      default: { font: "sans", color: "#e9ecf3", animation: "fade", animOut: "fade-out" },
      title: { font: "sans-bold", weight: 800, size: 9.5, letterSpacing: 0.1, color: "#ffffff", animation: "title-cinematic", animMotion: "slow-zoom", animOut: "blur-out" },
      subtitle: { size: 4, letterSpacing: 0.16, color: "#cfd6e6", animation: "mask-reveal" },
    },
  },
  {
    key: "apple", name: "Apple 简约", emoji: "🍎", desc: "纯净背景，轻盈上浮与模糊消散", duration: 6.5,
    intro: { bg: "gradient", bgColor: "#0b0b0d", bgColor2: "#26272b", blur: 0, dim: 0.1, outro: "zoom" },
    style: {
      default: { font: "sans", color: "#f5f5f7", shadow: false, animation: "title-apple", animOut: "blur-out" },
      title: { weight: 600, size: 8.4, letterSpacing: -0.02, animation: "title-apple", animMotion: "none" },
      subtitle: { weight: 400, size: 3.8, color: "#a9abb3" },
    },
  },
  {
    key: "memory", name: "温馨回忆", emoji: "🧡", desc: "暖色柔光，缓慢呼吸", duration: 7.5,
    intro: { bg: "posterBlur", blur: 26, scale: 1.12, dim: 0.4, bgColor: "#1a1109", outro: "fade" },
    style: {
      default: { font: "serif", color: "#ffeede", animation: "text-elegant", animMotion: "breath", animOut: "fade-out" },
      title: { size: 8.6, weight: 700, color: "#fff4e3" },
      subtitle: { size: 3.9, color: "#f0d7bd" },
    },
  },
  {
    key: "church", name: "教会敬拜", emoji: "⛪", desc: "深蓝圣洁光晕，推荐教会活动", duration: 7,
    intro: { bg: "posterBlur", blur: 24, scale: 1.1, dim: 0.5, bgColor: "#070d1a", outro: "fade" },
    style: {
      default: { font: "sans", color: "#e6efff", animation: "rise", animOut: "fade-out" },
      title: { font: "sans-bold", weight: 700, size: 8.8, color: "#ffffff", animation: "mask-reveal", animMotion: "breath", glow: 0.35, glowColor: "#7fb2ff" },
      subtitle: { size: 4.2, color: "#bcd4ff" },
      verse: { font: "kai", size: 3.6, color: "#f5e9cf" },
    },
  },
  {
    key: "retreat", name: "退修会主题", emoji: "🏕️", desc: "自然绿意，主题口号突出", duration: 8,
    intro: { bg: "posterBlur", blur: 22, scale: 1.12, dim: 0.46, bgColor: "#0b1710", outro: "slide" },
    style: {
      default: { font: "sans", color: "#e8f6ea", animation: "fade", animOut: "fade-out" },
      title: { font: "serif", weight: 700, size: 9, color: "#ffffff", animation: "text-elegant", animMotion: "slow-zoom" },
      subtitle: { size: 4.2, color: "#c8e6cf", animation: "line-reveal" },
      speaker: { size: 3.8, color: "#ffe9b8" },
    },
  },
  {
    key: "gold", name: "金色典雅", emoji: "✨", desc: "黑金扫光，适合典礼与庆典", duration: 7.5,
    intro: { bg: "posterBlur", blur: 28, scale: 1.1, dim: 0.6, bgColor: "#0b0904", outro: "fade" },
    style: {
      default: { font: "serif", color: "#e9d6a8", animation: "fade", animOut: "fade-out" },
      title: { weight: 700, size: 9, color: "#e6c069", colorTo: "#fff3c4", animation: "gradient-sweep", animMotion: "sweep" },
      subtitle: { size: 3.8, color: "#d8c69a", letterSpacing: 0.14 },
    },
  },
  {
    key: "tech", name: "科技现代", emoji: "🛰️", desc: "冷光霓虹，适合讲座与发布", duration: 6.5,
    intro: { bg: "gradient", bgColor: "#04070f", bgColor2: "#0b2b4a", blur: 0, dim: 0.2, outro: "zoom" },
    style: {
      default: { font: "mono", color: "#bff0ff", animation: "fade", animOut: "fade-out" },
      title: { weight: 700, size: 8, color: "#e6faff", glow: 0.9, glowColor: "#4fc3ff", animation: "neon", animMotion: "glow-breath" },
      subtitle: { size: 3.4, color: "#7fd4ff", letterSpacing: 0.1, animation: "typewriter" },
    },
  },
  {
    key: "polaroid", name: "拍立得相册", emoji: "📷", desc: "手账质感，轻微倾斜", duration: 7,
    intro: { bg: "posterBlur", blur: 18, scale: 1.08, dim: 0.35, bgColor: "#12100c", outro: "slide" },
    style: {
      default: { font: "round", color: "#fff8ee", animation: "letter-fade", animOut: "fade-out" },
      title: { weight: 800, size: 8.2, rotate: -2, color: "#ffffff", bgColor: "#000000", bgOpacity: 0.25 },
      subtitle: { size: 3.6, rotate: -1 },
    },
  },
  {
    key: "verse", name: "经文开场", emoji: "📖", desc: "以经文引入，安静庄重", duration: 8,
    intro: { bg: "posterBlur", blur: 30, scale: 1.06, dim: 0.55, bgColor: "#0a0f14", outro: "fade" },
    style: {
      default: { font: "kai", color: "#f7efdd", animation: "bible-verse", animOut: "fade-out" },
      title: { font: "serif", weight: 700, size: 8, color: "#ffffff" },
      verse: { size: 4, lineHeight: 1.5, color: "#f5e9cf", animMotion: "breath" },
    },
  },
  {
    key: "custom", name: "自定义", emoji: "🎛️", desc: "沿用当前样式，全部手动调整", duration: 7,
    intro: {},
    style: {},
  },
];

export function openingTemplate(key: string): OpeningTemplate {
  return OPENING_TEMPLATES.find((t) => t.key === key) ?? OPENING_TEMPLATES[3];
}

/* --------------------------------------------------------------
 * 五、开场文字生成（分阶段时间轴）
 * -------------------------------------------------------------- */
export interface IntroField {
  kind: TextKind;
  text: string;
}

/**
 * 依据模板生成开场文字图层。
 * 阶段：0-1s 背景渐入 → 主标题 → 副标题 → 信息 → 停留 → 整体淡出。
 */
export function buildIntroTexts(fields: IntroField[], templateKey: string, duration: number, aspect: AspectKey = "16:9"): PWText[] {
  const tpl = openingTemplate(templateKey);
  const clean = fields.filter((f) => f.text.trim());
  if (!clean.length) return [];

  const order: TextKind[] = ["title", "theme", "eventName", "subtitle", "verse", "speaker", "date", "time", "place", "host", "signup", "url", "body"];
  const sorted = [...clean].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));

  const D = Math.max(4, duration);
  const fadeOut = 1;
  const bgIn = 0.8;
  const infoKinds: TextKind[] = ["speaker", "date", "time", "place", "host", "signup", "url"];

  // 纵向布局：主区（标题/副标题/主题）+ 信息区
  const heads = sorted.filter((f) => !infoKinds.includes(f.kind));
  const infos = sorted.filter((f) => infoKinds.includes(f.kind));
  const narrow = aspect === "9:16";

  const out: PWText[] = [];
  // 头部块整体垂直居中
  const headSizes = heads.map((f) => {
    const st = { ...(tpl.style.default ?? {}), ...(tpl.style[f.kind] ?? {}) };
    return (st.size ?? kindMeta(f.kind).size) * (narrow ? 1.15 : 1);
  });
  const gap = 1.6; // 行间空隙（% 画布高）
  const headH = headSizes.reduce((a, s) => a + s * 1.25 + gap, 0);
  const infoH = infos.length * 4.2;
  let cursor = 0.5 - (headH + (infos.length ? infoH + 4 : 0)) / 200; // 转成 0..1

  heads.forEach((f, i) => {
    const st = { ...(tpl.style.default ?? {}), ...(tpl.style[f.kind] ?? {}) };
    const size = headSizes[i];
    const start = bgIn + i * 0.7;
    cursor += (size * 1.25) / 200 + gap / 200;
    out.push(
      makeText(f.kind, {
        ...st,
        text: f.text.trim(),
        size,
        y: Number(cursor.toFixed(4)),
        start: Number(start.toFixed(2)),
        duration: Number(Math.max(1.5, D - start).toFixed(2)),
        animDelay: 0,
        animDur: 0.9,
        group: "intro",
        name: `${kindMeta(f.kind).label}（开场）`,
      }),
    );
    cursor += (size * 0.25) / 200;
  });

  const infoStart = bgIn + heads.length * 0.7 + 0.4;
  infos.forEach((f, i) => {
    const st = { ...(tpl.style.default ?? {}), ...(tpl.style[f.kind] ?? {}) };
    const size = (st.size ?? kindMeta(f.kind).size) * (narrow ? 1.1 : 1);
    const y = 0.5 + (headH + 4) / 200 + (i * 4.6) / 100;
    const start = infoStart + i * 0.35;
    out.push(
      makeText(f.kind, {
        ...st,
        text: f.text.trim(),
        size,
        y: Number(Math.min(0.95, y).toFixed(4)),
        start: Number(start.toFixed(2)),
        duration: Number(Math.max(1.2, D - start).toFixed(2)),
        animDur: 0.7,
        animation: st.animation ?? "rise",
        group: "intro",
        name: `${kindMeta(f.kind).label}（开场）`,
      }),
    );
  });

  // 统一在结尾淡出
  return out.map((t) => ({ ...t, duration: Math.max(1, D - t.start), animOut: t.animOut ?? "fade-out", animDur: t.animDur ?? 0.8, ...(fadeOut ? {} : {}) }));
}

/** 生成开场并插入时间轴最前方：原有文字、音乐整体后移，图片片段不变 */
export function insertIntro(p: PWProject, intro: PWIntro, introTexts: PWText[]): PWProject {
  const prev = p.intro?.enabled ? p.intro.duration : 0;
  const shift = intro.duration - prev;
  const keep = p.texts.filter((t) => t.group !== "intro");
  return {
    ...p,
    intro: { ...intro, enabled: true },
    texts: [
      ...introTexts,
      ...keep.map((t) => ({ ...t, start: Math.max(0, t.start + shift) })),
    ],
    music: p.music.map((m) => ({ ...m, startTime: Math.max(0, (m.startTime ?? 0) + shift) })),
  };
}

/** 移除开场：文字与音乐整体前移 */
export function removeIntro(p: PWProject): PWProject {
  const shift = p.intro?.enabled ? p.intro.duration : 0;
  return {
    ...p,
    intro: p.intro ? { ...p.intro, enabled: false } : null,
    texts: p.texts.filter((t) => t.group !== "intro").map((t) => ({ ...t, start: Math.max(0, t.start - shift) })),
    music: p.music.map((m) => ({ ...m, startTime: Math.max(0, (m.startTime ?? 0) - shift) })),
  };
}

export { defaultIntro };
