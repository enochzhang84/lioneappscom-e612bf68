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
  animation: "fade" | "rise" | "none";
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
  };
}
