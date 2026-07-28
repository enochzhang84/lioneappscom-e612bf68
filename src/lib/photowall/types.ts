// Photo Wall Studio — 数据模型（第一期：本地 IndexedDB 存储，不改动现有数据库）
export type AspectKey = "16:9" | "9:16" | "4:3";
export type AnimationKey = "none" | "kenburns" | "zoomRandom" | "fade" | "float" | "focus";
export type LayoutKey = "single" | "grid" | "collage" | "masonry" | "polaroid" | "split" | "free";
export type TimingMode = "perPhoto" | "total";

export interface PWPhoto {
  id: string;
  assetId: string;
  name: string;
  w: number;
  h: number;
  size: number;
  hash: string;
  title?: string;
  caption?: string;
  rotate: number;
  radius: number;
  border: number;
  shadow: boolean;
  focusX: number; // 0..1
  focusY: number; // 0..1
  highlight: boolean;
  cover: boolean;
  duration?: number | null; // 秒，单张覆盖
  /** 单张动画覆盖（动画资源库 ID） */
  animationId?: string | null;
  /** 是否加入画面轨（时间轴）。undefined / true = 已加入；false = 仅在素材库 */
  inTimeline?: boolean;

}


/** 文字类型：与海报提取的分类一一对应 */
export type TextKind =
  | "title" | "subtitle" | "theme" | "eventName"
  | "speaker" | "date" | "time" | "place"
  | "host" | "url" | "signup" | "verse"
  | "caption" | "outro" | "body";

export interface PWText {
  id: string;
  kind: TextKind;
  /** 图层名称（时间轴 / 图层列表显示） */
  name?: string;
  text: string;
  preset: string;
  font: string;
  size: number; // 相对画布高度百分比
  color: string;
  align: "left" | "center" | "right";
  shadow: boolean;
  /** 文字动画 ID（动画资源库 · 文字动画），兼容旧值 fade / rise / none。作为入场动画 */
  animation: string;

  start: number; // 秒
  duration: number; // 秒

  /* ---------- 排版 ---------- */
  /** 字重 100-900 */
  weight?: number;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  /** 字间距（em） */
  letterSpacing?: number;
  /** 行间距倍数 */
  lineHeight?: number;
  /** 大小写转换 */
  transform?: "none" | "upper" | "lower";
  /** 自动换行 */
  wrap?: boolean;
  /** 最大宽度（占画布宽 0.1..1） */
  maxWidth?: number;
  /** 最大行数，超出省略 */
  maxLines?: number;
  /** 垂直对齐（相对 y 锚点） */
  valign?: "top" | "middle" | "bottom";

  /* ---------- 颜色与样式 ---------- */
  /** 渐变文字的第二色，留空 = 纯色 */
  colorTo?: string | null;
  strokeWidth?: number;
  strokeColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  /** 发光强度 0..1 */
  glow?: number;
  glowColor?: string;
  /** 文字背景 */
  bgColor?: string | null;
  bgOpacity?: number;
  bgRadius?: number;
  bgPad?: number;

  /* ---------- 位置与变换 ---------- */
  /** 锚点 X（0..1 画布宽），缺省按 align 推导 */
  x?: number;
  /** 锚点 Y（0..1 画布高），缺省按 kind 推导 */
  y?: number;
  scale?: number;
  rotate?: number; // 角度
  opacity?: number; // 0..1
  /** 图层顺序，越大越靠上 */
  z?: number;
  locked?: boolean;
  hidden?: boolean;

  /* ---------- 动画 ---------- */
  /** 退场动画 ID */
  animOut?: string;
  /** 持续动画（漂浮 / 呼吸 / 扫光…） */
  animMotion?: string;
  /** 入场 / 退场时长（秒） */
  animDur?: number;
  /** 入场延迟（秒） */
  animDelay?: number;
  animSpeed?: number;
  animEasing?: string;
  /** 逐字 / 逐行间隔（秒） */
  animStagger?: number;
  animIntensity?: number;
  animLoop?: boolean;

  /** 所属分组：intro = 开场场景文字 */
  group?: "intro" | null;
}

/* ---------------- 开场场景 Opening Scene ---------------- */
export type IntroBgKind =
  | "color" | "gradient" | "posterBlur" | "poster" | "cover" | "firstPhoto" | "custom";

export interface PWIntro {
  enabled: boolean;
  /** 开场总时长（秒） */
  duration: number;
  /** 开场模板 key */
  template: string;
  bg: IntroBgKind;
  /** 背景图片 assetId（海报 / 自定义） */
  bgAssetId?: string | null;
  blur: number; // px @1080p
  scale: number; // 1.0 - 1.3
  dim: number; // 0..1 黑色遮罩
  bgColor: string;
  bgColor2?: string;
  /** 与正文照片墙之间的衔接方式 */
  outro: "fade" | "zoom" | "slide" | "cut";
  /** 原海报与正文的关系（仅记录用户选择，不删除任何素材） */
  posterUse?: "textOnly" | "bgOnly" | "keepInBody" | "coverOnly";
}

export function defaultIntro(): PWIntro {
  return {
    enabled: false,
    duration: 7,
    template: "church",
    bg: "posterBlur",
    bgAssetId: null,
    blur: 24,
    scale: 1.1,
    dim: 0.45,
    bgColor: "#0b0d12",
    bgColor2: "#1b2436",
    outro: "fade",
    posterUse: "keepInBody",
  };
}


export interface PWMusic {
  id: string;
  assetId: string;
  name: string;
  volume: number; // 0..1
  fadeIn: number; // 秒
  fadeOut: number;
  loop: boolean;
  trimStart: number;
  trimEnd: number; // 0 = 到结尾
  duration: number; // 原始时长
  startTime?: number; // 在时间轴中的起始位置（秒）
  muted?: boolean;
  waveform?: number[] | null; // 预留真实波形数据
}

/** 时间轴编辑状态（随项目持久化） */
export interface PWTimelineState {
  currentTime: number;
  timelineScale: number; // 每秒像素
  snap: boolean;
  height: number;
  collapsed: boolean;
}

export interface PWSettings {
  layout: LayoutKey;
  animation: AnimationKey;
  zoom: number; // 放大比例 1.0 - 1.5
  hold: number; // 停留时间比例 0..1
  transition: number; // 转场时间 秒
  blurBg: boolean;
  dimBg: number; // 0..1
  random: boolean;
  noRepeat: boolean;
  gap: number;
  radius: number;
  border: number;
  shadow: boolean;
  rotateRandom: boolean;
  timingMode: TimingMode;
  perPhoto: number; // 秒
  totalTarget: number; // 秒
  openingText: string;
  openingSub: string;
  openingDuration: number;
  endingText: string;
  endingSub: string;
  endingDuration: number;
  loop: boolean;
  bgColor: string;
  accent: string;
  /* ---------- 动画资源库 Animation Library ---------- */
  /** 全局图片动画 ID（优先于旧版 animation 字段） */
  animationId?: string;
  /** 转场动画 ID */
  transitionId?: string;
  /** 缓动方式 */
  easing?: string;
  /** 自定义贝塞尔曲线 */
  customBezier?: [number, number, number, number];
  /** 动画速度倍率 */
  animSpeed?: number;
  /** 动画延迟（占片段比例 0..0.8） */
  animDelay?: number;
  /** 片段内循环播放动画 */
  animLoop?: boolean;
  /** 动画幅度 0..2 */
  animIntensity?: number;
  /** 性能模式 */
  perfMode?: "smooth" | "balanced" | "quality";
  /** 每张随机动画（不连续重复） */
  animRandom?: boolean;
  /** 当前套用的动画组合 key */
  animCombo?: string | null;
  /* ---------- 主图放大 Hero ---------- */
  /** 主图展示方式：网格内放大 / 全屏覆盖 / 全屏浮层 */
  heroMode?: "grid" | "fullscreen" | "overlay";
  /** 主图全屏适配：铺满屏幕 / 完整显示 */
  heroFit?: "cover" | "contain";
  /** 主图焦点位置 */
  heroFocus?: "center" | "top" | "bottom" | "left" | "right" | "custom";
  /** contain 模式下的背景处理 */
  heroBg?: "black" | "blur" | "color" | "dim";
  /** 进入全屏时长（秒） */
  heroIn?: number;
  /** 全屏停留时长（秒） */
  heroHold?: number;
  /** 退出全屏时长（秒） */
  heroOut?: number;
  /** 全屏时其他缩略图变暗程度 0..1（1 = 完全隐藏） */
  heroDim?: number;

}


export interface PWProject {
  id: string;
  name: string;
  aspect: AspectKey;
  status: "draft" | "published";
  createdAt: number;
  updatedAt: number;
  photos: PWPhoto[];
  texts: PWText[];
  music: PWMusic[];
  settings: PWSettings;
  timeline?: PWTimelineState;
  /** 开场场景（从海报提取主题后生成） */
  intro?: PWIntro | null;
  /** 发布快照：真实预览与「已发布版」导出读取此版本 */
  publishedSnapshot?: Omit<PWProject, "publishedSnapshot"> | null;
  publishedAt?: number | null;
}

export function defaultTimelineState(): PWTimelineState {
  return { currentTime: 0, timelineScale: 24, snap: true, height: 240, collapsed: false };
}

export const ASPECTS: Record<AspectKey, { w: number; h: number; label: string }> = {
  "16:9": { w: 1920, h: 1080, label: "16:9 横屏" },
  "9:16": { w: 1080, h: 1920, label: "9:16 竖屏" },
  "4:3": { w: 1440, h: 1080, label: "4:3 经典" },
};

export function defaultSettings(): PWSettings {
  return {
    layout: "single",
    animation: "kenburns",
    zoom: 1.15,
    hold: 0.6,
    transition: 0.8,
    blurBg: true,
    dimBg: 0.25,
    random: false,
    noRepeat: true,
    gap: 16,
    radius: 18,
    border: 0,
    shadow: true,
    rotateRandom: false,
    timingMode: "perPhoto",
    perPhoto: 5,
    totalTarget: 300,
    openingText: "",
    openingSub: "",
    openingDuration: 3,
    endingText: "",
    endingSub: "",
    endingDuration: 3,
    loop: false,
    bgColor: "#0b0d12",
    accent: "#2563eb",
    animationId: "kb-classic",
    transitionId: "cross-dissolve",
    easing: "cinematic",
    animSpeed: 1,
    animDelay: 0,
    animLoop: false,
    animIntensity: 1,
    perfMode: "balanced",
    animRandom: false,
    animCombo: null,
    heroMode: "fullscreen",
    heroFit: "cover",
    heroFocus: "center",
    heroBg: "blur",
    heroIn: 1,
    heroHold: 5,
    heroOut: 1,
    heroDim: 0.9,

  };
}


export function newProject(name = "未命名照片墙", aspect: AspectKey = "16:9"): PWProject {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    aspect,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    photos: [],
    texts: [],
    music: [],
    settings: defaultSettings(),
    timeline: defaultTimelineState(),
    intro: null,
    publishedSnapshot: null,
    publishedAt: null,
  };
}
