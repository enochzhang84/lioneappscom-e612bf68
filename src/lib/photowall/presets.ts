// Photo Wall Studio — 模板 / 文字预设 / 动画 / 布局 元数据
import type { AnimationKey, LayoutKey, PWSettings } from "./types";

export const ANIMATIONS: { key: AnimationKey; label: string; desc: string }[] = [
  { key: "kenburns", label: "Ken Burns", desc: "缓慢推近平移" },
  { key: "zoomRandom", label: "随机放大", desc: "每张随机方向缩放" },
  { key: "fade", label: "淡入淡出", desc: "柔和交叉淡化" },
  { key: "float", label: "漂浮", desc: "轻微上下浮动" },
  { key: "focus", label: "聚焦", desc: "由虚到实聚焦" },
  { key: "none", label: "无动画", desc: "静止展示" },
];

export const LAYOUTS: { key: LayoutKey; label: string; per: number }[] = [
  { key: "single", label: "单张轮播", per: 1 },
  { key: "grid", label: "网格", per: 4 },
  { key: "collage", label: "自动拼贴", per: 5 },
  { key: "masonry", label: "瀑布流", per: 6 },
  { key: "polaroid", label: "宝丽来", per: 3 },
  { key: "split", label: "左右分屏", per: 2 },
  { key: "free", label: "自由布局", per: 4 },
];

export function photosPerPage(layout: LayoutKey) {
  return LAYOUTS.find((l) => l.key === layout)?.per ?? 1;
}

export const TEXT_PRESETS: {
  key: string;
  label: string;
  font: string;
  color: string;
  size: number;
  shadow: boolean;
}[] = [
  { key: "church", label: "教会活动", font: "'Noto Sans SC', system-ui, sans-serif", color: "#ffffff", size: 8, shadow: true },
  { key: "verse", label: "经文", font: "Georgia, 'Noto Serif SC', serif", color: "#fdf6e3", size: 6, shadow: true },
  { key: "blackgold", label: "黑金", font: "'Noto Serif SC', Georgia, serif", color: "#e6c069", size: 8, shadow: true },
  { key: "modern", label: "现代", font: "'Inter', system-ui, sans-serif", color: "#ffffff", size: 7, shadow: false },
  { key: "glass", label: "透明玻璃", font: "'Inter', system-ui, sans-serif", color: "#eaf2ff", size: 7, shadow: true },
  { key: "cinema", label: "电影字幕", font: "'Inter', system-ui, sans-serif", color: "#f5f5f5", size: 4.5, shadow: true },
];

export interface PWTemplate {
  key: string;
  name: string;
  emoji: string;
  desc: string;
  opening: string;
  openingSub: string;
  ending: string;
  patch: Partial<PWSettings>;
}

export const TEMPLATES: PWTemplate[] = [
  {
    key: "sunday",
    name: "主日欢迎",
    emoji: "⛪",
    desc: "温暖明亮，单张轮播 + Ken Burns",
    opening: "主日欢迎",
    openingSub: "愿神赐福与你",
    ending: "下周主日再见",
    patch: { layout: "single", animation: "kenburns", perPhoto: 5, bgColor: "#0d1220", accent: "#2563eb", radius: 20 },
  },
  {
    key: "promo",
    name: "教会宣传",
    emoji: "📣",
    desc: "网格拼贴，节奏明快",
    opening: "教会生活",
    openingSub: "同心合意 兴旺福音",
    ending: "欢迎加入我们",
    patch: { layout: "grid", animation: "zoomRandom", perPhoto: 4, gap: 18, radius: 16 },
  },
  {
    key: "retreat",
    name: "退修会",
    emoji: "🏕️",
    desc: "自然柔和，瀑布流",
    opening: "退修会",
    openingSub: "安静 亲近 更新",
    ending: "感谢主的看顾",
    patch: { layout: "masonry", animation: "float", perPhoto: 5, bgColor: "#101711", accent: "#3f8f5f" },
  },
  {
    key: "bbq",
    name: "BBQ",
    emoji: "🍖",
    desc: "热闹欢乐，自动拼贴",
    opening: "教会 BBQ",
    openingSub: "一起吃饭 一起欢笑",
    ending: "下次再聚",
    patch: { layout: "collage", animation: "zoomRandom", perPhoto: 4, accent: "#d97706", bgColor: "#1a1208" },
  },
  {
    key: "christmas",
    name: "圣诞节",
    emoji: "🎄",
    desc: "黑金氛围，单张聚焦",
    opening: "圣诞快乐",
    openingSub: "道成肉身 住在我们中间",
    ending: "Merry Christmas",
    patch: { layout: "single", animation: "focus", perPhoto: 6, bgColor: "#0c1410", accent: "#c9a227" },
  },
  {
    key: "baptism",
    name: "洗礼",
    emoji: "💧",
    desc: "庄重清澈，慢节奏",
    opening: "受洗见证",
    openingSub: "旧事已过 都变成新的了",
    ending: "愿主保守",
    patch: { layout: "single", animation: "kenburns", perPhoto: 7, bgColor: "#08131c", accent: "#2ba0d0" },
  },
  {
    key: "youth",
    name: "青少年",
    emoji: "🎸",
    desc: "活泼跳跃，宝丽来",
    opening: "青少年团契",
    openingSub: "青春 · 信仰 · 同行",
    ending: "See you next time",
    patch: { layout: "polaroid", animation: "zoomRandom", perPhoto: 3.5, rotateRandom: true, accent: "#e0457b" },
  },
  {
    key: "ailecture",
    name: "AI 讲座",
    emoji: "🤖",
    desc: "科技深色，左右分屏",
    opening: "AI 讲座",
    openingSub: "科技与信仰的对话",
    ending: "谢谢参与",
    patch: { layout: "split", animation: "fade", perPhoto: 4.5, bgColor: "#080b12", accent: "#4f7cff", radius: 12 },
  },
  {
    key: "sundayschool",
    name: "主日学",
    emoji: "📚",
    desc: "明快网格，适合儿童",
    opening: "主日学",
    openingSub: "教养孩童走当行的道",
    ending: "下主日见",
    patch: { layout: "grid", animation: "float", perPhoto: 4, accent: "#f59e0b", rotateRandom: true },
  },
];
