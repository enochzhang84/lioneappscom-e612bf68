// Photo Wall Studio — 场景类型 Scene Presets & 推荐组合 Recommended Combinations
// 全部配置驱动：新增场景只需在此文件追加数据，无需改动界面组件。
import type { EasingKey } from "./animations";
import type { PWSettings } from "./types";

/* ============================== 动画分组 ============================== */
export type AnimGroupKey =
  | "combo" | "scene" | "basic" | "transition" | "camera" | "bg" | "text" | "effect" | "fav" | "recent";

export const ANIM_GROUPS: { key: AnimGroupKey; label: string; en: string; desc: string }[] = [
  { key: "combo", label: "推荐组合", en: "Recommended", desc: "按视觉风格选择的一整套动画方案" },
  { key: "scene", label: "场景类型", en: "Scene Presets", desc: "按活动用途一键配置整套动画" },
  { key: "basic", label: "基础动画", en: "Basic", desc: "淡入淡出、缩放、滑入等常用动画" },
  { key: "transition", label: "转场动画", en: "Transitions", desc: "照片之间的切换方式" },
  { key: "camera", label: "镜头动画", en: "Camera", desc: "Ken Burns、推拉摇移等运镜" },
  { key: "bg", label: "背景动画", en: "Background", desc: "虚化、遮罩、粒子、光效等背景层" },
  { key: "text", label: "文字动画", en: "Text", desc: "标题、字幕、经文的出场动画" },
  { key: "effect", label: "特效动画", en: "Effects", desc: "聚光、波纹、彩带、光束等特效" },
  { key: "fav", label: "收藏", en: "Favorites", desc: "已收藏的动画、场景与组合" },
  { key: "recent", label: "最近使用", en: "Recent", desc: "最近应用过的动画与方案" },
];

/* ============================== 动画方案 ============================== */
/** 一套完整的动画配置（场景 / 推荐组合共用） */
export interface AnimPlan {
  /** 进入动画（图片动画池，按顺序不重复分配） */
  enter: string[];
  /** 停留动画（片段中持续播放的动画，可为空） */
  hold?: string | null;
  /** 退出动画（当前渲染管线以转场承担退出，保留配置以便扩展） */
  exit?: string | null;
  /** 转场动画 ID */
  transition: string;
  /** 镜头动画 */
  camera: string;
  /** 背景动画 */
  bg?: string | null;
  /** 文字动画（入场） */
  text: string;
  /** 特效动画 */
  effect?: string | null;
  /** 推荐每张停留时间（秒） */
  perPhoto: number;
  /** 动画速度倍率 */
  speed: number;
  /** 缓动方式 */
  easing: EasingKey;
  /** 动画幅度 */
  intensity: number;
}

/** 将动画方案转换为项目设置补丁（只涉及动画相关字段） */
export function planToSettings(plan: AnimPlan): Partial<PWSettings> {
  return {
    animationId: plan.enter[0],
    transitionId: plan.transition,
    easing: plan.easing,
    animSpeed: plan.speed,
    animIntensity: plan.intensity,
    perPhoto: plan.perPhoto,
    animRandom: false,
  };
}

/** 按方案生成不连续重复的图片动画序列 */
export function planSequence(plan: AnimPlan, count: number): string[] {
  const pool = [...plan.enter, plan.camera, ...(plan.bg ? [plan.bg] : []), ...(plan.effect ? [plan.effect] : [])]
    .filter((v, i, arr) => v && arr.indexOf(v) === i);
  const out: string[] = [];
  let prev = "";
  for (let i = 0; i < Math.max(1, count); i++) {
    const avail = pool.filter((x) => x !== prev);
    const pick = (avail.length ? avail : pool)[i % (avail.length || pool.length)];
    out.push(pick);
    prev = pick;
  }
  return out;
}

/* ============================== 场景类型 ============================== */
export interface ScenePreset {
  key: string;
  name: string;
  en: string;
  emoji: string;
  /** 适用说明 */
  desc: string;
  /** 推荐节奏描述 */
  rhythm: string;
  /** 封面渐变（CSS） */
  cover: string;
  group: string;
  order: number;
  enabled: boolean;
  plan: AnimPlan;
}

export const SCENE_GROUPS: { key: string; label: string; en: string }[] = [
  { key: "church", label: "教会与聚会", en: "Church & Worship" },
  { key: "event", label: "活动庆典", en: "Events & Celebration" },
  { key: "business", label: "商务展示", en: "Business" },
  { key: "album", label: "摄影相册", en: "Photography" },
  { key: "signage", label: "数字展板", en: "Digital Signage" },
  { key: "style", label: "视频风格", en: "Video Style" },
];

const P = (p: Partial<AnimPlan>): AnimPlan => ({
  enter: ["b-fade-in"],
  hold: "floating",
  exit: "b-fade-out",
  transition: "cross-dissolve",
  camera: "kb-classic",
  bg: null,
  text: "fade",
  effect: null,
  perPhoto: 5,
  speed: 1,
  easing: "cinematic",
  intensity: 1,
  ...p,
});

let ord = 0;
const S = (
  group: string, key: string, name: string, en: string, emoji: string,
  desc: string, rhythm: string, cover: string, plan: AnimPlan,
): ScenePreset => ({ key, name, en, emoji, desc, rhythm, cover, group, order: ord++, enabled: true, plan });

const G = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

export const SCENE_PRESETS: ScenePreset[] = [
  /* ---------- 1. 教会与聚会 ---------- */
  S("church", "sunday-welcome", "主日欢迎", "Sunday Welcome", "⛪", "适合主日签到、欢迎照片与全会众合照", "温暖明亮", G("#2563eb", "#60a5fa"),
    P({ enter: ["b-fade-in", "hero-image", "blur-reveal"], camera: "kb-classic", hold: "floating", bg: "bg-glow", text: "title-apple", effect: "fx-soft-light", perPhoto: 5, easing: "easeInOut" })),
  S("church", "sunday-worship", "主日敬拜", "Sunday Worship", "🎵", "适合敬拜、诗歌与祷告画面", "缓慢庄重", G("#1e3a8a", "#7c3aed"),
    P({ enter: ["blur-reveal", "breathing", "soft-fade"], camera: "kb-face", hold: "breathing", bg: "bg-glow", text: "bible-verse", effect: "fx-light-beam", perPhoto: 6.5, speed: 0.85, intensity: 0.9 })),
  S("church", "communion", "圣餐聚会", "Communion", "🍞", "适合圣餐、擘饼与安静默想画面", "安静肃穆", G("#7f1d1d", "#b45309"),
    P({ enter: ["soft-fade", "focus-pull"], camera: "slow-zoom-in", hold: "breathing", bg: "bg-dark", text: "bible-verse", effect: "fx-halo", perPhoto: 7, speed: 0.8, intensity: 0.75, transition: "fade-black" })),
  S("church", "baptism", "洗礼", "Baptism", "💧", "适合受洗见证、水礼与祝福合影", "清澈庄重", G("#0e7490", "#38bdf8"),
    P({ enter: ["blur-reveal", "elegant-reveal"], camera: "slow-zoom-in", hold: "floating", bg: "bg-glow", text: "text-elegant", effect: "fx-ripple-expand", perPhoto: 7, speed: 0.85, transition: "ripple" })),
  S("church", "christmas", "圣诞节", "Christmas", "🎄", "适合圣诞崇拜、报佳音与装饰照片", "温馨节庆", G("#065f46", "#c9a227"),
    P({ enter: ["cine-zoom", "elegant-reveal", "light-sweep"], camera: "kb-cinematic", hold: "floating", bg: "bg-snow", text: "gradient-sweep", effect: "fx-sparkle", perPhoto: 6, transition: "lens-flash" })),
  S("church", "easter", "复活节", "Easter", "🌅", "适合复活节晨祷、洗礼与庆典照片", "明亮盼望", G("#b45309", "#fbbf24"),
    P({ enter: ["hero-image", "blur-reveal"], camera: "cam-drone", hold: "floating", bg: "bg-light", text: "gradient-sweep", effect: "fx-light-beam", perPhoto: 5.5, transition: "fade-white" })),
  S("church", "thanksgiving", "感恩节", "Thanksgiving", "🍁", "适合感恩聚餐、见证分享与合影", "温暖感恩", G("#92400e", "#f59e0b"),
    P({ enter: ["photo-stack", "soft-fade", "kb-classic"], camera: "kb-classic", hold: "floating", bg: "bg-leak", text: "text-elegant", effect: "fx-bloom", perPhoto: 5 })),
  S("church", "retreat", "退修会", "Retreat", "🏕️", "适合活动照片、合照、敬拜和户外场景", "温暖舒缓", G("#166534", "#65a30d"),
    P({ enter: ["kb-classic", "photo-stack", "cam-push"], camera: "cam-drone", hold: "floating", bg: "bg-dust", text: "text-elegant", effect: "fx-fog", perPhoto: 5, transition: "memory-flip" })),
  S("church", "youth", "青年团契", "Youth Fellowship", "🎸", "适合青年聚会、游戏与户外活动", "活泼明快", G("#be185d", "#f97316"),
    P({ enter: ["photo-shuffle", "happy-pop", "b-slide-left"], camera: "cam-shake", hold: "floating", bg: "bg-gradient", text: "letter-scale", effect: "fx-random-zoom", perPhoto: 3.5, speed: 1.2, easing: "spring", intensity: 1.2, transition: "shuffle-t" })),
  S("church", "sunday-school", "儿童主日学", "Sunday School", "🧒", "适合主日学、儿童游戏与手工照片", "欢快跳跃", G("#0ea5e9", "#facc15"),
    P({ enter: ["bounce", "card-drop", "photo-scatter"], camera: "kb-random", hold: "floating", bg: "bg-gradient", text: "letter-scale", effect: "fx-bubble", perPhoto: 3.5, easing: "bounce", intensity: 1.2, transition: "shuffle-t" })),

  /* ---------- 2. 活动庆典 ---------- */
  S("event", "bbq", "BBQ 聚餐", "BBQ", "🍖", "适合烧烤、聚餐与户外欢聚照片", "热闹欢乐", G("#c2410c", "#f59e0b"),
    P({ enter: ["photo-shuffle", "b-scale-up", "kb-random"], camera: "kb-random", hold: "floating", bg: "bg-leak", text: "word-slide", effect: "fx-fire", perPhoto: 4, intensity: 1.1, transition: "shuffle-t" })),
  S("event", "picnic", "Picnic 野餐", "Picnic", "🧺", "适合公园野餐、家庭出游照片", "轻松自然", G("#4d7c0f", "#a3e635"),
    P({ enter: ["b-fade-in", "photo-drop", "kb-classic"], camera: "pan-right", hold: "floating", bg: "bg-bokeh", text: "fade", effect: "fx-soft-light", perPhoto: 4.5 })),
  S("event", "family-day", "Family Day 家庭日", "Family Day", "👨‍👩‍👧", "适合家庭日、亲子活动与团体合影", "温馨活泼", G("#0d9488", "#fbbf24"),
    P({ enter: ["photo-stack", "b-scale-up", "happy-pop"], camera: "kb-face", hold: "floating", bg: "bg-bokeh", text: "word-slide", effect: "fx-heart", perPhoto: 4.5, transition: "memory-flip" })),
  S("event", "birthday", "Birthday 生日", "Birthday", "🎂", "适合生日派对、切蛋糕与祝福合影", "欢乐庆祝", G("#db2777", "#fb923c"),
    P({ enter: ["happy-pop", "photo-scatter", "b-zoom-in"], camera: "kb-random", hold: "floating", bg: "bg-gradient", text: "letter-scale", effect: "fx-confetti", perPhoto: 3.5, easing: "bounce", intensity: 1.2, transition: "camera-flash" })),
  S("event", "anniversary", "Anniversary 周年庆", "Anniversary", "🎉", "适合周年庆典、里程碑回顾", "隆重典雅", G("#7c2d12", "#eab308"),
    P({ enter: ["cine-zoom", "light-sweep", "elegant-reveal"], camera: "kb-cinematic", hold: "breathing", bg: "bg-glow", text: "gradient-sweep", effect: "fx-sparkle", perPhoto: 5.5, transition: "lens-flash" })),
  S("event", "graduation", "Graduation 毕业典礼", "Graduation", "🎓", "适合毕业照、颁奖与典礼现场", "庄重喜悦", G("#1e40af", "#f59e0b"),
    P({ enter: ["hero-image", "b-scale-up", "light-sweep"], camera: "kb-face", hold: "floating", bg: "bg-light", text: "title-cinematic", effect: "fx-confetti", perPhoto: 5, transition: "camera-flash" })),
  S("event", "conference", "Conference 会议", "Conference", "🎤", "适合会议现场、讲员与全场照片", "沉稳专业", G("#1f2937", "#3b82f6"),
    P({ enter: ["b-fade-in", "cam-dolly", "focus-zoom"], camera: "cam-dolly", hold: null, bg: "bg-dark", text: "subtitle", effect: "fx-soft-light", perPhoto: 4.5, easing: "easeInOut" })),
  S("event", "workshop", "Workshop 培训", "Workshop", "🛠️", "适合培训、工作坊与小组讨论", "清晰明快", G("#0f766e", "#22d3ee"),
    P({ enter: ["b-slide-up", "b-fade-in", "smooth-scale"], camera: "pan-left", hold: null, bg: "bg-light", text: "word-slide", effect: null, perPhoto: 4, easing: "easeOut" })),
  S("event", "ai-lecture", "AI Lecture AI 讲座", "AI Lecture", "🤖", "适合科技讲座、AI 分享与演示", "科技未来", G("#0b1120", "#4f7cff"),
    P({ enter: ["glass-morph", "hud-reveal", "liquid-morph"], camera: "cam-shake", hold: "floating", bg: "bg-particle", text: "neon", effect: "fx-light-beam", perPhoto: 4.5, easing: "easeOut", intensity: 1.1, transition: "warp" })),
  S("event", "open-house", "Open House 开放日", "Open House", "🏠", "适合开放日、参观与场地展示", "明亮友好", G("#0369a1", "#7dd3fc"),
    P({ enter: ["b-fade-in", "hero-image", "gallery-flow"], camera: "cam-drone", hold: "floating", bg: "bg-light", text: "title-apple", effect: null, perPhoto: 4.5 })),

  /* ---------- 3. 商务展示 ---------- */
  S("business", "corporate", "企业宣传", "Corporate", "🏢", "适合企业形象、团队与办公场景", "稳重大气", G("#0f172a", "#2563eb"),
    P({ enter: ["cine-zoom", "smooth-scale", "b-fade-in"], camera: "cam-push", hold: null, bg: "bg-gradient", text: "title-apple", effect: "fx-soft-light", perPhoto: 4.5, easing: "cinematic" })),
  S("business", "product-launch", "产品发布", "Product Launch", "🚀", "适合新品发布、产品特写", "干净利落", G("#111827", "#06b6d4"),
    P({ enter: ["hero-image", "glass-morph", "b-zoom-in"], camera: "cam-orbit", hold: "floating", bg: "bg-gradient", text: "title-cinematic", effect: "fx-reflection", perPhoto: 4, easing: "cinematic", transition: "glass-t" })),
  S("business", "company-intro", "公司介绍", "Company Intro", "📊", "适合公司简介、业务与数据展示", "清晰专业", G("#1e293b", "#38bdf8"),
    P({ enter: ["b-slide-up", "smooth-scale", "magazine"], camera: "pan-right", hold: null, bg: "bg-light", text: "word-slide", effect: null, perPhoto: 4, easing: "easeOut" })),
  S("business", "annual-meeting", "年会", "Annual Meeting", "🥂", "适合年会现场、颁奖与团队合影", "热烈隆重", G("#7c2d12", "#f59e0b"),
    P({ enter: ["light-sweep", "cine-zoom", "photo-stack"], camera: "kb-cinematic", hold: "floating", bg: "bg-glow", text: "gradient-sweep", effect: "fx-confetti", perPhoto: 4.5, transition: "lens-flash" })),
  S("business", "expo", "展会", "Expo", "🏬", "适合展台、参展与人流画面", "明快现代", G("#155e75", "#22d3ee"),
    P({ enter: ["gallery-flow", "b-slide-left", "focus-grid"], camera: "cam-dolly", hold: null, bg: "bg-gradient", text: "word-slide", effect: null, perPhoto: 3.5, easing: "easeOut", intensity: 1.1, transition: "push" })),
  S("business", "presentation", "商业演示", "Business Presentation", "📈", "适合商业提案、路演与汇报", "简洁克制", G("#0f172a", "#64748b"),
    P({ enter: ["minimal-fade", "smooth-scale"], camera: "cam-push", hold: null, bg: null, text: "title-apple", effect: null, perPhoto: 4, easing: "easeInOut", intensity: 0.8 })),

  /* ---------- 4. 摄影相册 ---------- */
  S("album", "wedding", "Wedding 婚礼", "Wedding", "💍", "适合婚礼纪实、婚纱照与誓约瞬间", "唯美缓慢", G("#9d174d", "#fbcfe8"),
    P({ enter: ["slow-zoom-in", "soft-blur", "elegant-reveal"], camera: "slow-zoom-in", hold: "breathing", bg: "bg-bokeh", text: "text-elegant", effect: "fx-dream", perPhoto: 7, speed: 0.85, intensity: 0.85, transition: "glass-t" })),
  S("album", "family", "Family 家庭相册", "Family Album", "🏡", "适合家庭合影与日常记录", "温暖亲切", G("#b45309", "#fcd34d"),
    P({ enter: ["photo-stack", "b-fade-in", "kb-face"], camera: "kb-face", hold: "floating", bg: "bg-leak", text: "fade", effect: "fx-bloom", perPhoto: 5, transition: "memory-flip" })),
  S("album", "travel", "Travel 旅行", "Travel", "✈️", "适合旅行风景、街拍与行程记录", "轻快流动", G("#0369a1", "#34d399"),
    P({ enter: ["pan-right", "cam-drone", "b-slide-left"], camera: "cam-drone", hold: "floating", bg: "bg-leak", text: "word-slide", effect: "fx-lens-flare", perPhoto: 4.5, transition: "push" })),
  S("album", "nature", "Nature 风景", "Nature", "🏔️", "适合自然风光与户外全景", "宽广宁静", G("#065f46", "#7dd3fc"),
    P({ enter: ["kb-classic", "pan-left", "slow-zoom-out"], camera: "cam-drone", hold: "breathing", bg: "bg-fog" as string, text: "fade", effect: "fx-fog", perPhoto: 6.5, speed: 0.85, transition: "dust" })),
  S("album", "portrait", "Portrait 人像", "Portrait", "📸", "适合人像特写与写真", "细腻聚焦", G("#3f3f46", "#a1a1aa"),
    P({ enter: ["focus-pull", "kb-face", "soft-blur"], camera: "kb-face", hold: "breathing", bg: "bg-blur", text: "text-elegant", effect: "fx-vignette", perPhoto: 5.5, intensity: 0.9 })),
  S("album", "baby", "Baby 成长记录", "Baby", "🍼", "适合宝宝成长、周岁与亲子照", "柔软可爱", G("#f472b6", "#fde68a"),
    P({ enter: ["b-scale-up", "photo-drop", "happy-pop"], camera: "kb-face", hold: "floating", bg: "bg-bokeh", text: "letter-scale", effect: "fx-heart", perPhoto: 4.5, easing: "spring", transition: "memory-flip" })),
  S("album", "memory", "Memory 回忆录", "Memory", "🎞️", "适合回顾影集、纪念视频", "怀旧沉静", G("#44403c", "#d6d3d1"),
    P({ enter: ["film-grain", "dust-reveal", "kb-classic"], camera: "kb-cinematic", hold: "floating", bg: "bg-dust", text: "title-cinematic", effect: "fx-floating-dust", perPhoto: 6, speed: 0.9, transition: "burn" })),

  /* ---------- 5. 数字展板 ---------- */
  S("signage", "welcome-screen", "Welcome 欢迎屏", "Welcome Screen", "👋", "适合入口欢迎屏、循环播放", "平稳循环", G("#1d4ed8", "#93c5fd"),
    P({ enter: ["b-fade-in", "hero-image"], camera: "kb-classic", hold: "floating", bg: "bg-gradient", text: "title-apple", effect: null, perPhoto: 6, intensity: 0.8 })),
  S("signage", "digital-signage", "Digital Signage 数字标牌", "Digital Signage", "🖥️", "适合商场、教会大厅循环轮播", "稳定清晰", G("#0f172a", "#0ea5e9"),
    P({ enter: ["b-fade-in", "smooth-scale"], camera: "cam-push", hold: null, bg: "bg-dark", text: "subtitle", effect: null, perPhoto: 7, speed: 0.9, intensity: 0.7 })),
  S("signage", "lobby", "Lobby 大厅展示", "Lobby Display", "🏛️", "适合大厅大屏、迎宾展示", "大气舒缓", G("#312e81", "#818cf8"),
    P({ enter: ["cine-zoom", "gallery-flow"], camera: "kb-cinematic", hold: "breathing", bg: "bg-glow", text: "title-apple", effect: "fx-soft-light", perPhoto: 6.5, speed: 0.85 })),
  S("signage", "information", "Information 信息发布", "Information", "📢", "适合通知、公告与信息轮播", "直接易读", G("#166534", "#4ade80"),
    P({ enter: ["b-slide-up", "b-fade-in"], camera: "none", hold: null, bg: "bg-dark", text: "subtitle", effect: null, perPhoto: 6, intensity: 0.6, easing: "easeOut" })),
  S("signage", "event-schedule", "Event Schedule 活动日程", "Event Schedule", "🗓️", "适合活动日程、聚会时间表", "整洁规律", G("#0f766e", "#5eead4"),
    P({ enter: ["b-slide-left", "magazine"], camera: "pan-right", hold: null, bg: "bg-light", text: "word-slide", effect: null, perPhoto: 5.5, intensity: 0.7, transition: "slide" })),
  S("signage", "advertisement", "Advertisement 广告轮播", "Advertisement", "📺", "适合广告位、促销与推广轮播", "抓眼明快", G("#be123c", "#fb7185"),
    P({ enter: ["b-zoom-in", "light-sweep", "photo-shuffle"], camera: "kb-random", hold: "floating", bg: "bg-gradient", text: "letter-scale", effect: "fx-highlight", perPhoto: 3.5, speed: 1.15, intensity: 1.15, transition: "push" })),

  /* ---------- 6. 视频风格 ---------- */
  S("style", "documentary", "Documentary 纪录片", "Documentary", "🎥", "适合纪实叙事、活动回顾", "克制真实", G("#292524", "#a8a29e"),
    P({ enter: ["kb-classic", "cam-push", "film-grain"], camera: "kb-cinematic", hold: null, bg: "bg-dust", text: "subtitle", effect: "fx-vignette", perPhoto: 6, speed: 0.9, intensity: 0.85, transition: "cross-dissolve" })),
  S("style", "movie", "Movie 电影", "Movie", "🎬", "适合电影感开场与主题片段", "深沉厚重", G("#0c0a09", "#c9a227"),
    P({ enter: ["cine-zoom", "film-frame", "depth-push"], camera: "kb-cinematic", hold: "breathing", bg: "bg-leak", text: "title-cinematic", effect: "fx-vignette", perPhoto: 6.5, speed: 0.85, transition: "fade-black" })),
  S("style", "modern", "Modern 现代", "Modern", "⚡", "适合现代感展示与快节奏剪辑", "明快现代", G("#1e293b", "#22d3ee"),
    P({ enter: ["smooth-scale", "b-slide-left", "parallax"], camera: "cam-dolly", hold: "floating", bg: "bg-gradient", text: "word-slide", effect: null, perPhoto: 4, speed: 1.1, easing: "easeOut", transition: "push" })),
  S("style", "minimal", "Minimal 极简", "Minimal", "◻️", "适合极简排版与留白展示", "安静克制", G("#e7e5e4", "#a8a29e"),
    P({ enter: ["minimal-fade", "smooth-scale"], camera: "b-opacity", hold: null, bg: null, text: "title-apple", effect: null, perPhoto: 5, intensity: 0.6, easing: "easeInOut" })),
  S("style", "elegant", "Elegant 典雅", "Elegant", "🕊️", "适合典雅端庄的主题相册", "优雅从容", G("#3b0764", "#e9d5ff"),
    P({ enter: ["elegant-reveal", "soft-blur", "slow-zoom-in"], camera: "slow-zoom-in", hold: "breathing", bg: "bg-glow", text: "text-elegant", effect: "fx-bloom", perPhoto: 6, speed: 0.85, intensity: 0.85, transition: "glass-t" })),
  S("style", "luxury", "Luxury 高端", "Luxury", "👑", "适合高端品牌与颁奖典礼", "奢华精致", G("#111827", "#d4af37"),
    P({ enter: ["light-sweep", "cine-zoom", "glass-morph"], camera: "cam-orbit", hold: "breathing", bg: "bg-glow", text: "gradient-sweep", effect: "fx-sparkle", perPhoto: 6, speed: 0.9, transition: "glass-t" })),
  S("style", "dynamic", "Dynamic 动感", "Dynamic", "🔥", "适合运动、青年活动与快剪", "强烈动感", G("#7f1d1d", "#f97316"),
    P({ enter: ["photo-shuffle", "b-zoom-in", "motion-blur"], camera: "cam-shake", hold: "floating", bg: "bg-gradient", text: "letter-scale", effect: "fx-random-zoom", perPhoto: 3, speed: 1.25, intensity: 1.3, easing: "easeOut", transition: "spin-zoom" })),
  S("style", "clean", "Clean 清爽", "Clean", "🫧", "适合清爽干净的日常记录", "轻盈干净", G("#0ea5e9", "#e0f2fe"),
    P({ enter: ["b-fade-in", "smooth-scale", "gallery-flow"], camera: "kb-classic", hold: "floating", bg: "bg-light", text: "fade", effect: "fx-soft-light", perPhoto: 4.5, intensity: 0.8 })),
];

export const SCENE_MAP: Record<string, ScenePreset> = Object.fromEntries(SCENE_PRESETS.map((s) => [s.key, s]));

/* ============================== 推荐组合 ============================== */
export interface RecommendedCombo {
  key: string;
  name: string;
  en: string;
  emoji: string;
  desc: string;
  cover: string;
  plan: AnimPlan;
}

export const RECOMMENDED_COMBOS: RecommendedCombo[] = [
  { key: "church-elegant", name: "Church Elegant", en: "教会典雅", emoji: "⛪", desc: "柔和辉光 + 缓慢运镜 + 经文文字，适合主日与敬拜", cover: G("#1e3a8a", "#a5b4fc"),
    plan: P({ enter: ["blur-reveal", "floating", "soft-fade"], camera: "kb-face", hold: "breathing", bg: "bg-glow", text: "bible-verse", effect: "fx-light-beam", perPhoto: 6, speed: 0.9, intensity: 0.9 }) },
  { key: "modern-presentation", name: "Modern Presentation", en: "现代演示", emoji: "📐", desc: "干净推进 + 渐变背景 + 词组滑入，适合演示与汇报", cover: G("#0f172a", "#38bdf8"),
    plan: P({ enter: ["smooth-scale", "b-slide-up", "parallax"], camera: "cam-push", hold: null, bg: "bg-gradient", text: "word-slide", effect: null, perPhoto: 4, easing: "easeOut", transition: "push" }) },
  { key: "retreat-memory", name: "Retreat Memory", en: "退修回忆", emoji: "🏕️", desc: "Ken Burns + 微尘 + 温柔翻页，适合活动回顾", cover: G("#166534", "#bef264"),
    plan: P({ enter: ["kb-classic", "photo-stack", "cam-push"], camera: "cam-drone", hold: "floating", bg: "bg-dust", text: "text-elegant", effect: "fx-fog", perPhoto: 5.5, transition: "memory-flip" }) },
  { key: "family-album", name: "Family Album", en: "家庭相册", emoji: "🏡", desc: "叠层照片 + 漏光 + 柔和淡化，温暖亲切", cover: G("#b45309", "#fde68a"),
    plan: P({ enter: ["photo-stack", "b-fade-in", "kb-face"], camera: "kb-face", hold: "floating", bg: "bg-leak", text: "fade", effect: "fx-bloom", perPhoto: 5, transition: "memory-flip" }) },
  { key: "conference", name: "Conference", en: "会议现场", emoji: "🎤", desc: "轨道运镜 + 暗色遮罩 + 字幕条，专业沉稳", cover: G("#1f2937", "#60a5fa"),
    plan: P({ enter: ["b-fade-in", "cam-dolly", "focus-zoom"], camera: "cam-dolly", hold: null, bg: "bg-dark", text: "subtitle", effect: "fx-soft-light", perPhoto: 4.5, easing: "easeInOut" }) },
  { key: "cinematic", name: "Cinematic", en: "电影感", emoji: "🎬", desc: "电影推近 + 画框 + 黑场转场，深沉大气", cover: G("#0c0a09", "#eab308"),
    plan: P({ enter: ["cine-zoom", "film-frame", "depth-push"], camera: "kb-cinematic", hold: "breathing", bg: "bg-leak", text: "title-cinematic", effect: "fx-vignette", perPhoto: 6.5, speed: 0.85, transition: "fade-black" }) },
  { key: "clean-minimal", name: "Clean Minimal", en: "清爽极简", emoji: "◻️", desc: "极简淡入 + 平滑缩放，克制干净", cover: G("#e2e8f0", "#94a3b8"),
    plan: P({ enter: ["minimal-fade", "smooth-scale"], camera: "kb-classic", hold: null, bg: null, text: "title-apple", effect: null, perPhoto: 5, intensity: 0.7, easing: "easeInOut" }) },
  { key: "warm-memory", name: "Warm Memory", en: "温暖回忆", emoji: "🎞️", desc: "胶片颗粒 + 浮尘 + 灼烧转场，怀旧温暖", cover: G("#78350f", "#fbbf24"),
    plan: P({ enter: ["film-grain", "dust-reveal", "kb-classic"], camera: "kb-cinematic", hold: "floating", bg: "bg-dust", text: "text-elegant", effect: "fx-floating-dust", perPhoto: 6, speed: 0.9, transition: "burn" }) },
  { key: "dynamic-show", name: "Dynamic Show", en: "动感秀", emoji: "🔥", desc: "洗牌 + 随机放大 + 旋转缩放转场，节奏强烈", cover: G("#7f1d1d", "#fb923c"),
    plan: P({ enter: ["photo-shuffle", "b-zoom-in", "motion-blur"], camera: "cam-shake", hold: "floating", bg: "bg-gradient", text: "letter-scale", effect: "fx-random-zoom", perPhoto: 3, speed: 1.25, intensity: 1.3, transition: "spin-zoom" }) },
  { key: "elegant-gallery", name: "Elegant Gallery", en: "典雅画廊", emoji: "🖼️", desc: "画廊流动 + 光扫 + 玻璃转场，精致优雅", cover: G("#3b0764", "#f5d0fe"),
    plan: P({ enter: ["gallery-flow", "light-sweep", "elegant-reveal"], camera: "slow-zoom-in", hold: "breathing", bg: "bg-glow", text: "gradient-sweep", effect: "fx-bloom", perPhoto: 6, speed: 0.9, transition: "glass-t" }) },
];

export const COMBO_MAP: Record<string, RecommendedCombo> = Object.fromEntries(RECOMMENDED_COMBOS.map((c) => [c.key, c]));

export const SCENE_STATS = {
  scenes: SCENE_PRESETS.length,
  groups: SCENE_GROUPS.length,
  combos: RECOMMENDED_COMBOS.length,
};
