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
}


export type TextKind = "title" | "subtitle" | "caption" | "verse" | "outro";

export interface PWText {
  id: string;
  kind: TextKind;
  text: string;
  preset: string;
  font: string;
  size: number; // 相对画布高度百分比
  color: string;
  align: "left" | "center" | "right";
  shadow: boolean;
  /** 文字动画 ID（动画资源库 · 文字动画），兼容旧值 fade / rise / none */
  animation: string;

  start: number; // 秒
  duration: number; // 秒
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
    publishedSnapshot: null,
    publishedAt: null,
  };
}
