// Photo Wall Studio — 动画资源库 Animation Library
// 编辑器预览 / 真实预览 / MP4 导出 共用同一套纯函数求值器，保证三者效果完全一致。

/* ============================== 缓动 Easing ============================== */
export type EasingKey =
  | "linear" | "ease" | "easeIn" | "easeOut" | "easeInOut"
  | "spring" | "bounce" | "elastic" | "cinematic" | "custom";

export const EASINGS: { key: EasingKey; label: string; bezier?: [number, number, number, number] }[] = [
  { key: "linear", label: "Linear 线性", bezier: [0, 0, 1, 1] },
  { key: "ease", label: "Ease 标准", bezier: [0.25, 0.1, 0.25, 1] },
  { key: "easeIn", label: "Ease In 渐快", bezier: [0.42, 0, 1, 1] },
  { key: "easeOut", label: "Ease Out 渐慢", bezier: [0, 0, 0.58, 1] },
  { key: "easeInOut", label: "Ease In Out 平滑", bezier: [0.42, 0, 0.58, 1] },
  { key: "spring", label: "Spring 弹簧" },
  { key: "bounce", label: "Bounce 弹跳" },
  { key: "elastic", label: "Elastic 橡皮" },
  { key: "cinematic", label: "Cinematic 电影感", bezier: [0.16, 1, 0.3, 1] },
  { key: "custom", label: "Custom Bezier 自定义" },
];

function bezier(x1: number, y1: number, x2: number, y2: number, t: number) {
  // 牛顿迭代求解 cubic-bezier
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const dfx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  let u = t;
  for (let i = 0; i < 6; i++) {
    const d = fx(u) - t;
    if (Math.abs(d) < 1e-5) break;
    const dd = dfx(u);
    if (Math.abs(dd) < 1e-6) break;
    u -= d / dd;
  }
  return ((ay * u + by) * u + cy) * u;
}

export function ease(key: EasingKey, t: number, custom?: [number, number, number, number]): number {
  const p = Math.min(1, Math.max(0, t));
  switch (key) {
    case "linear": return p;
    case "spring": return 1 - Math.cos(p * Math.PI * 1.5) * Math.exp(-p * 4);
    case "bounce": {
      const n = 7.5625, d = 2.75;
      let x = p;
      if (x < 1 / d) return n * x * x;
      if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
      if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
      return n * (x -= 2.625 / d) * x + 0.984375;
    }
    case "elastic":
      return p === 0 || p === 1 ? p : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    case "custom": {
      const c = custom ?? [0.25, 0.1, 0.25, 1];
      return bezier(c[0], c[1], c[2], c[3], p);
    }
    default: {
      const b = EASINGS.find((e) => e.key === key)?.bezier ?? [0.25, 0.1, 0.25, 1];
      return bezier(b[0], b[1], b[2], b[3], p);
    }
  }
}

/* ============================== 分类 ============================== */
export type CatKey =
  | "all" | "featured" | "cinematic" | "apple" | "minimal" | "wall" | "church"
  | "wedding" | "kids" | "tech" | "text" | "photo" | "transition" | "template";

export const CATEGORIES: { key: CatKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "featured", label: "推荐" },
  { key: "cinematic", label: "电影感" },
  { key: "apple", label: "Apple 风格" },
  { key: "minimal", label: "现代简约" },
  { key: "wall", label: "照片墙" },
  { key: "church", label: "教会活动" },
  { key: "wedding", label: "婚礼" },
  { key: "kids", label: "儿童" },
  { key: "tech", label: "科技" },
  { key: "text", label: "文字动画" },
  { key: "photo", label: "图片动画" },
  { key: "transition", label: "转场动画" },
  { key: "template", label: "模板动画" },
];

/* ============================== 求值结果 ============================== */
export type FxKind =
  | null | "grain" | "flare" | "leak" | "burn" | "dust" | "frame" | "vignette"
  | "rgb" | "glitch" | "scan" | "grid" | "hud" | "neon" | "hologram" | "matrix"
  | "particle" | "spotlight" | "sweep" | "glass" | "circuit" | "pulse" | "rainbow";

export interface AnimEval {
  scale: number;
  dx: number;      // 相对画布宽度
  dy: number;      // 相对画布高度
  rot: number;     // 弧度
  alpha: number;
  blur: number;    // px
  fx: FxKind;
  fxAmt: number;   // 0..1
  focusDX: number; // 额外裁切焦点偏移 -0.5..0.5
  focusDY: number;
}

export interface AnimCtx {
  seed: number;
  zoom: number;
  hold: number;
  intensity: number; // 0..2 动画幅度
}

export type PerfLevel = 1 | 2 | 3; // 1 轻量 2 中等 3 重度

export interface AnimDef {
  id: string;
  name: string;
  en: string;
  cats: CatKey[];
  desc: string;   // 推荐用途
  scene: string;  // 推荐场景
  dur: number;    // 建议时长（秒）
  perf: PerfLevel;
  gpu: boolean;   // 是否可 GPU 合成加速（仅 transform/opacity）
  fn: (p: number, c: AnimCtx) => Partial<AnimEval>;
}

const BASE: AnimEval = { scale: 1, dx: 0, dy: 0, rot: 0, alpha: 1, blur: 0, fx: null, fxAmt: 0, focusDX: 0, focusDY: 0 };

const smooth = (p: number) => p * p * (3 - 2 * p);
const wave = (p: number, n = 1, ph = 0) => Math.sin(p * Math.PI * 2 * n + ph);
const rnd = (seed: number) => ((Math.sin(seed * 127.1) * 43758.5453) % 1 + 1) % 1;

function mk(
  id: string, name: string, en: string, cats: CatKey[], desc: string, scene: string,
  dur: number, perf: PerfLevel, gpu: boolean, fn: AnimDef["fn"],
): AnimDef {
  return { id, name, en, cats, desc, scene, dur, perf, gpu, fn };
}

/* ---------------------------- 三、电影感动画 ---------------------------- */
const CINEMATIC: AnimDef[] = [
  mk("cine-zoom", "电影推近", "Cinematic Zoom", ["cinematic", "featured", "photo"], "缓慢推近，制造沉浸感", "开场、主题照片", 6, 1, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1) * smooth(p) * c.intensity, fx: "vignette", fxAmt: 0.35 })),
  mk("cam-push", "镜头推进", "Camera Push", ["cinematic", "photo"], "镜头向前推进", "叙事段落", 5, 1, true,
    (p, c) => ({ scale: 1 + 0.18 * smooth(p) * c.intensity, dy: -0.008 * smooth(p) })),
  mk("cam-pull", "镜头拉远", "Camera Pull", ["cinematic", "photo"], "由近及远揭示全景", "结尾、全景照", 5, 1, true,
    (p, c) => ({ scale: 1 + 0.18 * (1 - smooth(p)) * c.intensity })),
  mk("cam-dolly", "轨道移动", "Camera Dolly", ["cinematic", "photo"], "横向轨道跟随", "人群、合影", 6, 1, true,
    (p, c) => ({ scale: 1.12, dx: (smooth(p) - 0.5) * 0.05 * c.intensity })),
  mk("cam-orbit", "环绕运镜", "Camera Orbit", ["cinematic", "photo"], "轻微环绕旋转", "重点照片", 7, 2, true,
    (p, c) => ({ scale: 1.14, dx: wave(p) * 0.02 * c.intensity, dy: wave(p, 1, Math.PI / 2) * 0.014, rot: wave(p) * 0.012 })),
  mk("focus-pull", "焦点转移", "Focus Pull", ["cinematic", "featured", "photo"], "由虚到实的对焦", "人物特写", 5, 2, false,
    (p, c) => ({ scale: 1 + 0.06 * smooth(p), blur: (1 - Math.min(1, p * 3)) * 18 * c.intensity })),
  mk("slow-zoom-in", "慢速放大", "Slow Zoom In", ["cinematic", "wedding", "photo"], "极慢推近", "婚礼、诗歌", 8, 1, true,
    (p, c) => ({ scale: 1 + 0.1 * p * c.intensity })),
  mk("slow-zoom-out", "慢速缩小", "Slow Zoom Out", ["cinematic", "wedding", "photo"], "极慢拉远", "结束页", 8, 1, true,
    (p, c) => ({ scale: 1.1 - 0.1 * p * c.intensity })),
  mk("pan-left", "慢速左移", "Slow Pan Left", ["cinematic", "photo"], "水平向左平移", "横幅风景", 6, 1, true,
    (p, c) => ({ scale: 1.14, dx: -smooth(p) * 0.035 * c.intensity })),
  mk("pan-right", "慢速右移", "Slow Pan Right", ["cinematic", "photo"], "水平向右平移", "横幅风景", 6, 1, true,
    (p, c) => ({ scale: 1.14, dx: smooth(p) * 0.035 * c.intensity })),
  mk("pan-up", "慢速上移", "Slow Pan Up", ["cinematic", "photo"], "垂直向上平移", "竖构图建筑", 6, 1, true,
    (p, c) => ({ scale: 1.14, dy: -smooth(p) * 0.035 * c.intensity })),
  mk("pan-down", "慢速下移", "Slow Pan Down", ["cinematic", "photo"], "垂直向下平移", "竖构图人像", 6, 1, true,
    (p, c) => ({ scale: 1.14, dy: smooth(p) * 0.035 * c.intensity })),
  mk("soft-fade", "柔和淡化", "Soft Fade", ["cinematic", "featured", "minimal", "photo"], "轻柔淡入淡出", "通用", 4, 1, true,
    (p) => ({ scale: 1.01, alpha: Math.min(1, Math.min(p, 1 - p) * 6 + 0.15) })),
  mk("film-burn", "胶片灼烧", "Film Burn", ["cinematic", "photo"], "胶片燃烧质感", "怀旧回忆", 5, 3, false,
    (p, c) => ({ scale: 1.06, fx: "burn", fxAmt: Math.max(0, 1 - p * 3) * c.intensity })),
  mk("lens-flare", "镜头光晕", "Lens Flare", ["cinematic", "wedding", "photo"], "阳光耀斑掠过", "户外、婚礼", 5, 2, false,
    (p, c) => ({ scale: 1.05, fx: "flare", fxAmt: Math.sin(p * Math.PI) * c.intensity })),
  mk("depth-push", "景深推进", "Depth Push", ["cinematic", "photo"], "前景推进 + 背景虚化", "人物", 6, 2, false,
    (p, c) => ({ scale: 1 + 0.16 * smooth(p) * c.intensity, blur: (1 - p) * 4 })),
  mk("depth-pull", "景深拉远", "Depth Pull", ["cinematic", "photo"], "由虚化到清晰拉远", "环境照", 6, 2, false,
    (p, c) => ({ scale: 1.16 - 0.16 * smooth(p) * c.intensity, blur: p * 3 })),
  mk("light-leak", "漏光", "Light Leak", ["cinematic", "wedding", "photo"], "复古漏光", "婚礼、旅拍", 5, 2, false,
    (p, c) => ({ scale: 1.05, fx: "leak", fxAmt: Math.sin(p * Math.PI) * 0.9 * c.intensity })),
  mk("film-grain", "胶片颗粒", "Film Grain", ["cinematic", "photo"], "细腻噪点质感", "纪实", 5, 3, false,
    (p, c) => ({ scale: 1.04, fx: "grain", fxAmt: 0.5 * c.intensity })),
  mk("dust-reveal", "微尘显影", "Dust Reveal", ["cinematic", "photo"], "微尘中浮现", "回忆片段", 5, 3, false,
    (p, c) => ({ scale: 1.05, alpha: Math.min(1, p * 2.2), fx: "dust", fxAmt: (1 - p) * c.intensity })),
  mk("film-frame", "胶片画框", "Film Frame", ["cinematic", "photo"], "电影黑边画框", "开场", 5, 1, false,
    (p, c) => ({ scale: 1 + 0.05 * p * c.intensity, fx: "frame", fxAmt: 1 })),
];

/* ---------------------------- 四、Apple 风格 ---------------------------- */
const APPLE: AnimDef[] = [
  mk("floating", "漂浮", "Floating", ["apple", "featured", "minimal", "photo"], "轻盈上下浮动", "主日、通用", 5, 1, true,
    (p, c) => ({ scale: 1.03, dx: wave(p, 1, c.seed) * 0.006 * c.intensity, dy: wave(p, 1, c.seed + 1.6) * 0.01 * c.intensity })),
  mk("breathing", "呼吸", "Breathing", ["apple", "minimal", "church", "photo"], "缓慢呼吸缩放", "祷告、诗歌", 6, 1, true,
    (p, c) => ({ scale: 1.02 + Math.sin(p * Math.PI * 2) * 0.02 * c.intensity })),
  mk("glass-morph", "玻璃质感", "Glass Morph", ["apple", "tech", "photo"], "毛玻璃过渡", "科技、现代", 5, 3, false,
    (p, c) => ({ scale: 1.05, blur: (1 - smooth(p)) * 10 * c.intensity, fx: "glass", fxAmt: 0.6 })),
  mk("parallax", "视差", "Parallax", ["apple", "featured", "photo"], "多层视差位移", "开场", 6, 2, true,
    (p, c) => ({ scale: 1.1, dx: (p - 0.5) * 0.03 * c.intensity, dy: (0.5 - p) * 0.012 })),
  mk("perspective-tilt", "透视倾斜", "Perspective Tilt", ["apple", "photo"], "轻微透视旋转", "产品、展示", 5, 2, true,
    (p, c) => ({ scale: 1.06, rot: (0.5 - p) * 0.03 * c.intensity, dx: (p - 0.5) * 0.01 })),
  mk("focus-zoom", "聚焦放大", "Focus Zoom", ["apple", "photo"], "聚焦并放大主体", "人物", 5, 2, false,
    (p, c) => ({ scale: 1 + 0.12 * smooth(p) * c.intensity, blur: (1 - Math.min(1, p * 4)) * 8 })),
  mk("hero-image", "主视觉", "Hero Image", ["apple", "featured", "photo"], "大图英雄式登场", "封面照", 5, 1, true,
    (p, c) => ({ scale: 1.12 - 0.1 * smooth(p) * c.intensity, alpha: Math.min(1, p * 3) })),
  mk("smooth-scale", "平滑缩放", "Smooth Scale", ["apple", "minimal", "photo"], "极简平滑放大", "通用", 4, 1, true,
    (p, c) => ({ scale: 1 + 0.07 * ease("cinematic", p) * c.intensity })),
  mk("minimal-fade", "极简淡入", "Minimal Fade", ["apple", "minimal", "photo"], "纯净淡入", "通用", 3.5, 1, true,
    (p) => ({ alpha: Math.min(1, p * 4) })),
  mk("elegant-reveal", "优雅揭示", "Elegant Reveal", ["apple", "wedding", "featured", "photo"], "由下缓缓浮现", "婚礼、致谢", 5, 1, true,
    (p, c) => ({ scale: 1.04, dy: (1 - ease("cinematic", p)) * 0.05 * c.intensity, alpha: Math.min(1, p * 3) })),
  mk("soft-blur", "柔焦", "Soft Blur", ["apple", "wedding", "photo"], "柔化边缘的梦幻感", "婚礼", 5, 2, false,
    (p, c) => ({ scale: 1.05, blur: (1 - smooth(Math.min(1, p * 1.6))) * 12 * c.intensity })),
  mk("blur-reveal", "模糊显影", "Blur Reveal", ["apple", "church", "featured", "photo"], "由模糊到清晰", "主日敬拜", 5, 2, false,
    (p, c) => ({ scale: 1.06, blur: Math.max(0, 1 - p * 2.5) * 20 * c.intensity, alpha: Math.min(1, p * 3) })),
  mk("liquid-morph", "液态变形", "Liquid Morph", ["apple", "tech", "photo"], "流体形变过渡", "AI、科技", 5, 3, false,
    (p, c) => ({ scale: 1.05 + wave(p, 2) * 0.012 * c.intensity, rot: wave(p, 2, 1) * 0.008, blur: (1 - p) * 4 })),
  mk("spotlight", "聚光灯", "Spotlight", ["apple", "church", "photo"], "光束聚焦主体", "见证、讲道", 5, 2, false,
    (p, c) => ({ scale: 1.05, fx: "spotlight", fxAmt: 0.8 * c.intensity })),
  mk("light-sweep", "光扫", "Light Sweep", ["apple", "wedding", "featured", "photo"], "高光扫过画面", "婚礼、颁奖", 4, 2, false,
    (p, c) => ({ scale: 1.04, fx: "sweep", fxAmt: c.intensity })),
  mk("vision-pro", "空间感", "Vision Pro Style", ["apple", "tech", "photo"], "空间浮层玻璃质感", "科技发布", 6, 3, false,
    (p, c) => ({ scale: 1.03 + smooth(p) * 0.05, rot: (0.5 - p) * 0.02, blur: (1 - Math.min(1, p * 3)) * 6 * c.intensity, fx: "glass", fxAmt: 0.5 })),
];

/* ---------------------------- 五、Canva 风格 ---------------------------- */
const CANVA: AnimDef[] = [
  mk("photo-drop", "照片落下", "Photo Drop", ["minimal", "kids", "photo"], "从上方落入", "主日学、活动", 4, 1, true,
    (p, c) => ({ dy: -(1 - ease("bounce", Math.min(1, p * 2))) * 0.25 * c.intensity, scale: 1.02 })),
  mk("card-stack", "卡片堆叠", "Card Stack", ["minimal", "wall", "photo"], "卡片依次堆叠", "照片墙", 5, 2, true,
    (p, c) => ({ scale: 0.94 + 0.08 * ease("spring", p) * c.intensity, rot: (rnd(c.seed) - 0.5) * 0.06 * (1 - p) })),
  mk("card-flip", "卡片翻转", "Card Flip", ["minimal", "photo"], "水平翻牌", "揭晓效果", 4, 2, true,
    (p, c) => ({ scale: 1 - Math.abs(Math.cos(Math.min(1, p * 2) * Math.PI)) * 0 + 0.02, dx: Math.cos(Math.min(1, p * 2) * Math.PI) * 0.02 * c.intensity, rot: (1 - Math.min(1, p * 2)) * 0.25 })),
  mk("photo-shuffle", "照片洗牌", "Photo Shuffle", ["wall", "kids", "photo"], "像洗牌一样切换", "回顾集锦", 4, 2, true,
    (p, c) => ({ dx: (rnd(c.seed) - 0.5) * 0.12 * (1 - ease("easeOut", p)) * c.intensity, dy: (rnd(c.seed + 3) - 0.5) * 0.08 * (1 - ease("easeOut", p)), rot: (rnd(c.seed + 7) - 0.5) * 0.2 * (1 - p) })),
  mk("photo-scatter", "照片散开", "Photo Scatter", ["kids", "wall", "photo"], "四散飞出", "儿童、欢乐", 4, 2, true,
    (p, c) => ({ dx: (rnd(c.seed) - 0.5) * 0.2 * ease("easeIn", p) * c.intensity, dy: (rnd(c.seed + 2) - 0.5) * 0.16 * ease("easeIn", p), rot: (rnd(c.seed + 5) - 0.5) * 0.4 * p, alpha: 1 - p * 0.15 })),
  mk("photo-fly-in", "照片飞入", "Photo Fly In", ["kids", "photo"], "从侧边飞入", "活动集锦", 4, 1, true,
    (p, c) => ({ dx: (c.seed % 2 ? 1 : -1) * (1 - ease("cinematic", p)) * 0.35 * c.intensity })),
  mk("photo-wall", "照片墙组合", "Photo Wall", ["wall", "featured", "photo"], "整墙同步呼吸", "多图墙", 6, 2, true,
    (p, c) => ({ scale: 1 + 0.04 * Math.sin((p + rnd(c.seed)) * Math.PI * 2) * c.intensity })),
  mk("photo-expand", "照片展开", "Photo Expand", ["wall", "photo"], "由小放大展开", "分组开始", 4, 1, true,
    (p, c) => ({ scale: 0.9 + 0.14 * ease("cinematic", p) * c.intensity })),
  mk("photo-collapse", "照片收拢", "Photo Collapse", ["wall", "photo"], "由大收拢", "分组结束", 4, 1, true,
    (p, c) => ({ scale: 1.08 - 0.14 * ease("cinematic", p) * c.intensity })),
  mk("grid-expand", "网格展开", "Grid Expand", ["wall", "photo"], "网格逐格展开", "网格布局", 5, 2, true,
    (p, c) => { const d = Math.min(1, Math.max(0, p * 1.6 - rnd(c.seed) * 0.5)); return { scale: 0.88 + 0.16 * ease("spring", d), alpha: Math.min(1, d * 2) }; }),
  mk("grid-collapse", "网格收拢", "Grid Collapse", ["wall", "photo"], "网格逐格收起", "网格结束", 5, 2, true,
    (p, c) => { const d = Math.min(1, Math.max(0, p * 1.6 - rnd(c.seed) * 0.5)); return { scale: 1.04 - 0.16 * d, alpha: 1 - d * 0.2 }; }),
  mk("gallery-flow", "画廊流动", "Gallery Flow", ["wall", "minimal", "photo"], "横向流动展示", "长廊式", 6, 1, true,
    (p, c) => ({ scale: 1.08, dx: (p - 0.5) * 0.06 * c.intensity })),
  mk("magazine", "杂志排版", "Magazine Layout", ["minimal", "wall", "photo"], "杂志式定格", "宣传册", 5, 1, true,
    (p, c) => ({ scale: 1.02 + 0.03 * smooth(p) * c.intensity, dy: (1 - smooth(p)) * 0.012 })),
  mk("album-flip", "相册翻页", "Album Flip", ["wall", "wedding", "photo"], "相册翻页感", "婚礼相册", 5, 2, true,
    (p, c) => ({ rot: (1 - ease("cinematic", p)) * 0.12 * c.intensity, dx: (1 - ease("cinematic", p)) * 0.06, scale: 1.02 })),
  mk("photo-ribbon", "照片飘带", "Photo Ribbon", ["wall", "photo"], "波浪飘带排列", "长条照片墙", 6, 2, true,
    (p, c) => ({ dy: wave(p, 1, c.seed) * 0.02 * c.intensity, rot: wave(p, 1, c.seed + 1) * 0.02, scale: 1.03 })),
];

/* ---------------------------- 六、现代科技 ---------------------------- */
const TECH: AnimDef[] = [
  mk("neon-glow", "霓虹辉光", "Neon Glow", ["tech", "photo"], "霓虹发光边缘", "科技讲座", 5, 2, false,
    (p, c) => ({ scale: 1.04, fx: "neon", fxAmt: (0.6 + 0.4 * Math.sin(p * Math.PI * 4)) * c.intensity })),
  mk("hologram", "全息", "Hologram", ["tech", "photo"], "全息投影质感", "AI 主题", 5, 3, false,
    (p, c) => ({ scale: 1.04, fx: "hologram", fxAmt: c.intensity, alpha: 0.94 })),
  mk("digital-scan", "数字扫描", "Digital Scan", ["tech", "photo"], "扫描线掠过", "科技展示", 4, 2, false,
    (p, c) => ({ scale: 1.03, fx: "scan", fxAmt: c.intensity })),
  mk("cyber-grid", "赛博网格", "Cyber Grid", ["tech", "photo"], "网格叠加", "科技背景", 5, 2, false,
    (p, c) => ({ scale: 1.04, fx: "grid", fxAmt: 0.5 * c.intensity })),
  mk("rgb-split", "RGB 分离", "RGB Split", ["tech", "photo"], "色彩通道错位", "潮流剪辑", 4, 3, false,
    (p, c) => ({ scale: 1.03, fx: "rgb", fxAmt: Math.max(0, 1 - p * 2) * c.intensity })),
  mk("glitch", "故障", "Glitch", ["tech", "kids", "photo"], "数字故障抖动", "潮流片头", 3.5, 3, false,
    (p, c) => ({ dx: (rnd(Math.floor(p * 24) + c.seed) - 0.5) * 0.012 * c.intensity, fx: "glitch", fxAmt: Math.max(0, 1 - p * 2.5) })),
  mk("motion-blur", "运动模糊", "Motion Blur", ["tech", "cinematic", "photo"], "高速运动残影", "运动、体育", 4, 3, false,
    (p, c) => ({ scale: 1.08, dx: (p - 0.5) * 0.05, blur: Math.max(0, 1 - p * 3) * 12 * c.intensity })),
  mk("energy-line", "能量线", "Energy Line", ["tech", "photo"], "能量流光线条", "科技", 4, 2, false,
    (p, c) => ({ scale: 1.03, fx: "circuit", fxAmt: c.intensity })),
  mk("particle-reveal", "粒子显影", "Particle Reveal", ["tech", "photo"], "粒子聚合成像", "开场", 5, 3, false,
    (p, c) => ({ scale: 1.04, alpha: Math.min(1, p * 2), fx: "particle", fxAmt: Math.max(0, 1 - p * 1.6) * c.intensity })),
  mk("light-grid", "光网格", "Light Grid", ["tech", "photo"], "发光网格铺开", "数据展示", 5, 2, false,
    (p, c) => ({ scale: 1.03, fx: "grid", fxAmt: Math.sin(p * Math.PI) * c.intensity })),
  mk("matrix", "矩阵", "Matrix", ["tech", "photo"], "数字雨叠加", "极客风", 5, 3, false,
    (p, c) => ({ scale: 1.03, fx: "matrix", fxAmt: c.intensity })),
  mk("tech-pulse", "科技脉冲", "Tech Pulse", ["tech", "photo"], "脉冲呼吸光", "AI 讲座", 4, 2, false,
    (p, c) => ({ scale: 1.02 + Math.abs(Math.sin(p * Math.PI * 3)) * 0.02 * c.intensity, fx: "pulse", fxAmt: 0.7 })),
  mk("circuit-flow", "电路流动", "Circuit Flow", ["tech", "photo"], "电路光流", "科技", 5, 2, false,
    (p, c) => ({ scale: 1.03, fx: "circuit", fxAmt: 0.8 * c.intensity })),
  mk("hud-reveal", "HUD 显示", "HUD Reveal", ["tech", "featured", "photo"], "HUD 界面框显影", "AI Modern", 4, 2, false,
    (p, c) => ({ scale: 1.03, fx: "hud", fxAmt: Math.min(1, p * 3) * c.intensity })),
];

/* ---------------------------- 七、照片墙专属 ---------------------------- */
const WALL: AnimDef[] = [
  mk("focus-grid", "网格聚焦", "Focus Grid", ["wall", "featured", "photo"], "网格中逐个聚焦", "多图墙", 6, 2, true,
    (p, c) => { const k = (p * 4 + rnd(c.seed)) % 1; return { scale: 1 + 0.08 * Math.sin(k * Math.PI), alpha: 0.82 + 0.18 * Math.sin(k * Math.PI) }; }),
  mk("center-hero", "中心主图", "Center Hero", ["wall", "photo"], "中心图突出", "重点照片", 5, 1, true,
    (p, c) => ({ scale: (c.seed % 4 === 1 ? 1.06 : 0.97) + 0.03 * smooth(p) * c.intensity })),
  mk("photo-stack", "照片叠层", "Photo Stack", ["wall", "church", "featured", "photo"], "堆叠展开", "退修会回顾", 5, 2, true,
    (p, c) => ({ scale: 0.92 + 0.12 * ease("cinematic", p) * c.intensity, rot: (rnd(c.seed) - 0.5) * 0.08 * (1 - p), dy: (1 - p) * 0.02 })),
  mk("memory-wall", "回忆墙", "Memory Wall", ["wall", "church", "photo"], "温柔浮现的回忆墙", "年度回顾", 6, 2, true,
    (p, c) => { const d = Math.min(1, Math.max(0, p * 2 - rnd(c.seed))); return { alpha: 0.2 + 0.8 * d, scale: 0.96 + 0.06 * d * c.intensity }; }),
  mk("mosaic-assemble", "马赛克聚合", "Mosaic Assemble", ["wall", "photo"], "碎片聚合成图", "开场", 5, 3, true,
    (p, c) => ({ scale: 0.8 + 0.24 * ease("cinematic", p) * c.intensity, dx: (rnd(c.seed) - 0.5) * 0.2 * (1 - p), dy: (rnd(c.seed + 1) - 0.5) * 0.2 * (1 - p), alpha: Math.min(1, p * 2) })),
  mk("mosaic-break", "马赛克散开", "Mosaic Break", ["wall", "photo"], "碎片散开", "结束", 5, 3, true,
    (p, c) => ({ scale: 1.04 - 0.2 * p, dx: (rnd(c.seed) - 0.5) * 0.2 * p, dy: (rnd(c.seed + 1) - 0.5) * 0.2 * p, alpha: 1 - p * 0.5 })),
  mk("puzzle-assemble", "拼图组合", "Puzzle Assemble", ["wall", "kids", "photo"], "拼图归位", "主日学", 5, 2, true,
    (p, c) => { const d = ease("spring", Math.min(1, p * 1.5)); return { dx: (rnd(c.seed) - 0.5) * 0.25 * (1 - d), dy: (rnd(c.seed + 4) - 0.5) * 0.25 * (1 - d), rot: (rnd(c.seed + 8) - 0.5) * 0.3 * (1 - d) }; }),
  mk("photo-explosion", "照片爆发", "Photo Explosion", ["wall", "kids", "photo"], "由中心爆发", "高潮", 4, 3, true,
    (p, c) => { const a = rnd(c.seed) * Math.PI * 2, d = ease("easeOut", p); return { dx: Math.cos(a) * 0.18 * d * c.intensity, dy: Math.sin(a) * 0.18 * d, scale: 1 + 0.1 * d, alpha: 1 - d * 0.3 }; }),
  mk("photo-rain", "照片雨", "Photo Rain", ["wall", "kids", "photo"], "自上而下落雨", "欢乐场景", 5, 2, true,
    (p, c) => ({ dy: -0.3 + (p + rnd(c.seed)) % 1 * 0.6, alpha: 0.9 })),
  mk("photo-carousel", "照片旋转木马", "Photo Carousel", ["wall", "kids", "photo"], "轮转展示", "多图轮播", 6, 2, true,
    (p, c) => { const a = p * Math.PI * 2 + rnd(c.seed) * 6.28; return { dx: Math.cos(a) * 0.06, scale: 1 + Math.sin(a) * 0.05 }; }),
  mk("photo-spiral", "照片螺旋", "Photo Spiral", ["wall", "photo"], "螺旋进入", "创意开场", 5, 3, true,
    (p, c) => { const d = 1 - ease("cinematic", p), a = p * Math.PI * 3 + rnd(c.seed) * 6.28; return { dx: Math.cos(a) * 0.2 * d, dy: Math.sin(a) * 0.2 * d, rot: d * 0.5, scale: 1 - d * 0.3 }; }),
  mk("photo-orbit", "照片环绕", "Photo Orbit", ["wall", "photo"], "环绕轨道运动", "创意墙", 6, 2, true,
    (p, c) => { const a = p * Math.PI * 2 + rnd(c.seed) * 6.28; return { dx: Math.cos(a) * 0.03, dy: Math.sin(a) * 0.025, scale: 1.02 }; }),
  mk("photo-cloud", "照片云", "Photo Cloud", ["wall", "photo"], "云状漂浮", "自由布局", 7, 2, true,
    (p, c) => ({ dx: wave(p, 1, rnd(c.seed) * 6.28) * 0.02, dy: wave(p, 1, rnd(c.seed + 2) * 6.28) * 0.02, scale: 1.02 })),
  mk("photo-ribbon-wall", "飘带墙", "Photo Ribbon Wall", ["wall", "photo"], "波浪式飘带墙", "长条墙", 6, 2, true,
    (p, c) => ({ dy: Math.sin(p * Math.PI * 2 + c.seed) * 0.025 * c.intensity, rot: Math.cos(p * Math.PI * 2 + c.seed) * 0.02 })),
  mk("wall-rotate", "整墙旋转", "Wall Rotate", ["wall", "photo"], "整墙轻微旋转", "创意展示", 6, 2, true,
    (p, c) => ({ rot: (p - 0.5) * 0.06 * c.intensity, scale: 1.05 })),
];

/* ---------------------------- 八、Ken Burns 专业版 ---------------------------- */
const KENBURNS: AnimDef[] = [
  mk("kb-classic", "Ken Burns 经典", "Ken Burns", ["cinematic", "featured", "photo", "church"], "经典缓慢推近平移", "通用", 6, 1, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1) * smooth(p), dx: (c.seed % 2 ? 1 : -1) * smooth(p) * 0.02, dy: (c.seed % 3 ? -1 : 1) * smooth(p) * 0.015 })),
  mk("kb-random", "随机 Ken Burns", "Random Ken Burns", ["cinematic", "photo"], "每张随机方向与幅度", "大批量照片", 6, 1, true,
    (p, c) => { const a = rnd(c.seed) * Math.PI * 2, z = rnd(c.seed + 1) > 0.5 ? 1 : -1; return { scale: z > 0 ? 1 + (c.zoom - 1) * smooth(p) : c.zoom - (c.zoom - 1) * smooth(p), dx: Math.cos(a) * 0.025 * smooth(p), dy: Math.sin(a) * 0.02 * smooth(p) }; }),
  mk("kb-left", "左侧聚焦", "Left Focus", ["photo", "cinematic"], "焦点偏向左侧", "左构图", 6, 1, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1) * smooth(p), focusDX: -0.25, dx: -smooth(p) * 0.02 })),
  mk("kb-right", "右侧聚焦", "Right Focus", ["photo", "cinematic"], "焦点偏向右侧", "右构图", 6, 1, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1) * smooth(p), focusDX: 0.25, dx: smooth(p) * 0.02 })),
  mk("kb-top", "顶部聚焦", "Top Focus", ["photo", "cinematic"], "焦点偏向上方", "天空、建筑", 6, 1, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1) * smooth(p), focusDY: -0.25, dy: -smooth(p) * 0.02 })),
  mk("kb-bottom", "底部聚焦", "Bottom Focus", ["photo", "cinematic"], "焦点偏向下方", "地面、人群", 6, 1, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1) * smooth(p), focusDY: 0.25, dy: smooth(p) * 0.02 })),
  mk("kb-face", "人脸聚焦", "Face Focus", ["photo", "church", "featured"], "推向画面上部人脸位置", "合影、人物", 6, 1, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1 + 0.1) * smooth(p), focusDY: -0.18 })),
  mk("kb-object", "主体聚焦", "Object Focus", ["photo"], "推向画面中心主体", "静物、细节", 6, 1, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1 + 0.08) * smooth(p) })),
  mk("kb-diagonal", "对角移动", "Diagonal Move", ["photo", "cinematic"], "沿对角线缓慢移动", "风景", 6, 1, true,
    (p, c) => ({ scale: 1.16, dx: (smooth(p) - 0.5) * 0.04 * c.intensity, dy: (smooth(p) - 0.5) * 0.03 })),
  mk("kb-cinematic", "电影运镜", "Cinematic Move", ["photo", "cinematic", "featured"], "推近 + 缓慢横移 + 暗角", "主题段落", 7, 2, false,
    (p, c) => ({ scale: 1 + (c.zoom - 1) * ease("cinematic", p), dx: (ease("cinematic", p) - 0.3) * 0.03, fx: "vignette", fxAmt: 0.4 })),
  mk("kb-zoom-pan", "缩放 + 平移", "Zoom + Pan", ["photo"], "同时缩放与平移", "通用", 6, 1, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1) * p, dx: (p - 0.5) * 0.04 * c.intensity, dy: (0.5 - p) * 0.02 })),
  mk("kb-zoom-rot", "缩放 + 旋转", "Zoom + Rotate", ["photo"], "同时缩放与轻微旋转", "创意", 6, 2, true,
    (p, c) => ({ scale: 1 + (c.zoom - 1) * p, rot: (p - 0.5) * 0.04 * c.intensity })),
];

/* ---------------------------- 基础 ---------------------------- */
const BASIC: AnimDef[] = [
  mk("none", "无动画", "None", ["minimal", "photo"], "完全静止", "静态展示 / 低性能设备", 4, 1, true, () => ({})),
  mk("bounce", "弹跳", "Bounce", ["kids", "photo"], "弹跳进入", "儿童、主日学", 4, 1, true,
    (p, c) => ({ dy: -(1 - ease("bounce", Math.min(1, p * 1.8))) * 0.12 * c.intensity, scale: 1.02 })),
  mk("happy-pop", "欢乐弹出", "Happy Pop", ["kids", "featured", "photo"], "俏皮弹出放大", "儿童", 3.5, 1, true,
    (p, c) => ({ scale: 0.9 + 0.16 * ease("elastic", Math.min(1, p * 1.6)) * c.intensity })),
  mk("rainbow", "彩虹光", "Rainbow", ["kids", "photo"], "彩虹渐变光晕", "儿童活动", 5, 2, false,
    (p, c) => ({ scale: 1.03, fx: "rainbow", fxAmt: 0.6 * c.intensity })),
  mk("card-drop", "卡片掉落", "Card Drop", ["kids", "photo"], "卡片带旋转落下", "儿童", 4, 1, true,
    (p, c) => { const d = ease("bounce", Math.min(1, p * 1.6)); return { dy: -(1 - d) * 0.2 * c.intensity, rot: (1 - d) * 0.15 }; }),
];

export const ANIMATION_LIBRARY: AnimDef[] = [...CINEMATIC, ...APPLE, ...CANVA, ...TECH, ...WALL, ...KENBURNS, ...BASIC];

export const ANIM_MAP: Record<string, AnimDef> = Object.fromEntries(ANIMATION_LIBRARY.map((a) => [a.id, a]));

/** 旧版 AnimationKey → 新版动画 ID */
export const LEGACY_ANIM: Record<string, string> = {
  kenburns: "kb-classic", zoomRandom: "kb-random", fade: "soft-fade",
  float: "floating", focus: "focus-pull", none: "none",
};

export function resolveAnimId(id: string | undefined | null): string {
  if (!id) return "kb-classic";
  return ANIM_MAP[id] ? id : (LEGACY_ANIM[id] ?? "kb-classic");
}

/* ============================== 性能模式 ============================== */
export type PerfMode = "smooth" | "balanced" | "quality";

export const PERF_MODES: { key: PerfMode; label: string; desc: string; maxPerf: PerfLevel }[] = [
  { key: "smooth", label: "流畅优先", desc: "关闭 3D / 模糊 / 粒子 / 玻璃等重度特效", maxPerf: 1 },
  { key: "balanced", label: "平衡", desc: "保留中等特效，关闭最重的粒子与噪点", maxPerf: 2 },
  { key: "quality", label: "高画质", desc: "全部特效开启", maxPerf: 3 },
];

const HEAVY_FX: FxKind[] = ["particle", "grain", "matrix", "glass", "hologram", "dust", "glitch", "rgb"];

/** 自动检测 GPU 能力，返回建议性能模式 */
export function detectPerfMode(): PerfMode {
  if (typeof document === "undefined") return "balanced";
  try {
    const cv = document.createElement("canvas");
    const gl = (cv.getContext("webgl") ?? cv.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
    if (!gl) return "smooth";
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const r = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "").toLowerCase();
    const weak = /swiftshader|software|llvmpipe|intel\(r\) hd graphics [2-5]/.test(r);
    if (weak || cores <= 2 || mem <= 2) return "smooth";
    if (cores <= 4 || mem <= 4) return "balanced";
    return "quality";
  } catch {
    return "balanced";
  }
}

/* ============================== 求值 ============================== */
export interface EvalOptions extends AnimCtx {
  easing?: EasingKey;
  customBezier?: [number, number, number, number];
  speed?: number;   // 播放速度倍率
  delay?: number;   // 0..1 起始延迟占比
  loop?: boolean;   // 片段内循环
  perf?: PerfMode;
}

export function evalAnimation(id: string, progress: number, o: EvalOptions): AnimEval {
  const def = ANIM_MAP[resolveAnimId(id)];
  const speed = o.speed && o.speed > 0 ? o.speed : 1;
  let p = (progress - (o.delay ?? 0)) * speed;
  p = o.loop ? ((p % 1) + 1) % 1 : Math.min(1, Math.max(0, p));
  const eased = o.easing && o.easing !== "linear" ? ease(o.easing, p, o.customBezier) : p;
  const partial = def.fn(eased, { seed: o.seed, zoom: o.zoom, hold: o.hold, intensity: o.intensity });
  const out: AnimEval = { ...BASE, ...partial };

  const mode = o.perf ?? "quality";
  const cap = PERF_MODES.find((m) => m.key === mode)!.maxPerf;
  if (def.perf > cap) {
    if (out.fx && (cap === 1 || HEAVY_FX.includes(out.fx))) out.fx = null;
    if (cap === 1) out.blur = 0;
    else out.blur = Math.min(out.blur, 8);
  }
  if (cap === 1) out.rot = out.rot * 0.5;
  return out;
}

/* ============================== 九、转场动画 ============================== */
export interface TransitionState {
  alpha: number;
  scale: number;
  dx: number;
  dy: number;
  rot: number;
  /** 覆盖色（闪白/闪黑/墨水等），[color, alpha] */
  flash?: [string, number];
  /** 裁切遮罩：绘制路径后 clip */
  clip?: "circleIn" | "circleOut" | "wipeL" | "wipeR" | "wipeU" | "wipeD" | "splitH" | "splitV" | "doorH" | "doorV" | "tear" | "ripple";
  clipP?: number;
  blur?: number;
}

export interface TransDef {
  id: string;
  name: string;
  en: string;
  desc: string;
  perf: PerfLevel;
  gpu: boolean;
  /** tIn: 入场进度 0..1，tOut: 出场剩余 0..1 */
  fn: (tIn: number, tOut: number) => Partial<TransitionState>;
}

const T = (id: string, name: string, en: string, desc: string, perf: PerfLevel, gpu: boolean, fn: TransDef["fn"]): TransDef =>
  ({ id, name, en, desc, perf, gpu, fn });

export const TRANSITIONS: TransDef[] = [
  T("cross-dissolve", "交叉溶解", "Cross Dissolve", "最通用的柔和溶解", 1, true, (i, o) => ({ alpha: Math.min(i, o) })),
  T("fade-black", "黑场淡入", "Fade Through Black", "经过黑场的段落切换", 1, true, (i, o) => ({ alpha: 1, flash: ["#000000", 1 - Math.min(i, o)] })),
  T("fade-white", "白场淡入", "Fade Through White", "经过白场的明亮切换", 1, true, (i, o) => ({ alpha: 1, flash: ["#ffffff", 1 - Math.min(i, o)] })),
  T("push", "推移", "Push", "整屏推入推出", 1, true, (i, o) => ({ alpha: 1, dx: (1 - i) * 1 - (1 - o) * 1 })),
  T("slide", "滑动", "Slide", "由侧边滑入", 1, true, (i, o) => ({ alpha: Math.min(1, i * 2), dx: (1 - i) * 0.6 - (1 - o) * 0.6 })),
  T("wipe", "擦除", "Wipe", "线性擦除显示", 1, true, (i) => ({ alpha: 1, clip: "wipeL", clipP: i })),
  T("split", "对开", "Split", "中缝分开显示", 2, true, (i) => ({ alpha: 1, clip: "splitH", clipP: i })),
  T("zoom-trans", "缩放转场", "Zoom Transition", "放大切换", 1, true, (i, o) => ({ alpha: Math.min(i, o), scale: 1 + (1 - i) * 0.25 })),
  T("spin-zoom", "旋转缩放", "Spin Zoom", "旋转同时放大", 2, true, (i, o) => ({ alpha: Math.min(i, o), scale: 1 + (1 - i) * 0.3, rot: (1 - i) * 0.5 })),
  T("rotate", "旋转", "Rotate", "整屏旋转进入", 2, true, (i, o) => ({ alpha: Math.min(i, o), rot: (1 - i) * 0.35 })),
  T("cube", "立方体旋转", "Cube Rotate", "伪 3D 立方体翻转", 2, true, (i, o) => ({ alpha: Math.min(i, o), scale: 0.85 + 0.15 * i, dx: (1 - i) * 0.5, rot: (1 - i) * 0.12 })),
  T("page-flip", "翻页", "Page Flip", "书页翻动", 2, true, (i, o) => ({ alpha: Math.min(1, i * 1.5), dx: (1 - i) * 0.35, rot: (1 - i) * 0.18, scale: 0.9 + 0.1 * i })),
  T("book-flip", "书本翻页", "Book Flip", "相册式翻页", 2, true, (i, o) => ({ alpha: Math.min(1, i * 1.5), dx: -(1 - i) * 0.3, rot: -(1 - i) * 0.16, scale: 0.92 + 0.08 * i })),
  T("card-flip-t", "卡片翻转", "Card Flip", "卡片翻面切换", 2, true, (i, o) => ({ alpha: Math.min(i, o), scale: 0.8 + 0.2 * Math.min(i, o), rot: (1 - i) * 0.25 })),
  T("door-open", "开门", "Door Open", "左右开门显示", 2, true, (i) => ({ alpha: 1, clip: "doorH", clipP: i })),
  T("window-open", "开窗", "Window Open", "上下开窗显示", 2, true, (i) => ({ alpha: 1, clip: "doorV", clipP: i })),
  T("camera-flash", "相机闪光", "Camera Flash", "闪光灯切换", 1, true, (i, o) => ({ alpha: 1, flash: ["#ffffff", Math.max(0, 1 - i * 3) * 0.9] })),
  T("lens-flash", "镜头闪耀", "Lens Flash", "暖色镜头闪耀", 2, false, (i) => ({ alpha: 1, flash: ["#ffe9c0", Math.max(0, 1 - i * 2.5) * 0.8] })),
  T("burn", "胶片灼烧", "Film Burn", "胶片烧穿切换", 3, false, (i) => ({ alpha: 1, flash: ["#ff7a18", Math.max(0, 1 - i * 2.2) * 0.7] })),
  T("ink", "墨水晕染", "Ink Reveal", "水墨晕开", 3, false, (i) => ({ alpha: 1, clip: "circleIn", clipP: i, flash: ["#0b0b0b", Math.max(0, 1 - i * 2) * 0.5] })),
  T("dust", "微尘显影", "Dust Reveal", "尘埃中浮现", 3, false, (i) => ({ alpha: Math.min(1, i * 1.6), scale: 1.03 - 0.03 * i, blur: (1 - i) * 6 })),
  T("particle-t", "粒子显影", "Particle Reveal", "粒子聚合切换", 3, false, (i) => ({ alpha: Math.min(1, i * 1.8), scale: 1.04 - 0.04 * i })),
  T("liquid", "液态转场", "Liquid Transition", "流体形变切换", 3, false, (i, o) => ({ alpha: Math.min(i, o), scale: 1 + Math.sin(i * Math.PI) * 0.05, blur: Math.sin(i * Math.PI) * 6 })),
  T("glass-t", "玻璃转场", "Glass Transition", "毛玻璃过渡", 3, false, (i, o) => ({ alpha: Math.min(i, o), blur: (1 - i) * 14 })),
  T("paper-tear", "撕纸", "Paper Tear", "撕纸显示", 2, true, (i) => ({ alpha: 1, clip: "tear", clipP: i })),
  T("circle-reveal", "圆形展开", "Circle Reveal", "圆形由中心展开", 1, true, (i) => ({ alpha: 1, clip: "circleIn", clipP: i })),
  T("circle-close", "圆形收拢", "Circle Close", "圆形收拢结束", 1, true, (i, o) => ({ alpha: 1, clip: "circleOut", clipP: o })),
  T("ripple", "波纹", "Ripple", "水波纹扩散", 3, false, (i) => ({ alpha: Math.min(1, i * 1.5), clip: "ripple", clipP: i })),
  T("warp", "扭曲", "Warp", "空间扭曲切换", 3, false, (i, o) => ({ alpha: Math.min(i, o), scale: 1 + (1 - i) * 0.4, blur: (1 - i) * 10 })),
  T("morph", "形变", "Morph", "形状渐变过渡", 2, true, (i, o) => ({ alpha: Math.min(i, o), scale: 0.94 + 0.06 * i, rot: (1 - i) * 0.06 })),
  T("shuffle-t", "照片洗牌", "Photo Shuffle", "洗牌式切换", 2, true, (i, o) => ({ alpha: Math.min(i, o), dx: (1 - i) * 0.15, rot: (1 - i) * 0.1 })),
  T("memory-flip", "回忆翻转", "Memory Flip", "温柔的回忆翻页", 2, true, (i, o) => ({ alpha: Math.min(i, o), scale: 0.96 + 0.04 * i, dy: (1 - i) * 0.06 })),
];

export const TRANS_MAP: Record<string, TransDef> = Object.fromEntries(TRANSITIONS.map((t) => [t.id, t]));

export function evalTransition(id: string, tIn: number, tOut: number, perf: PerfMode = "quality"): TransitionState {
  const def = TRANS_MAP[id] ?? TRANS_MAP["cross-dissolve"];
  const cap = PERF_MODES.find((m) => m.key === perf)!.maxPerf;
  const use = def.perf > cap ? TRANS_MAP["cross-dissolve"] : def;
  const base: TransitionState = { alpha: 1, scale: 1, dx: 0, dy: 0, rot: 0 };
  return { ...base, ...use.fn(Math.min(1, Math.max(0, tIn)), Math.min(1, Math.max(0, tOut))) };
}

/* ============================== 十、文字动画 ============================== */
export interface TextAnimDef {
  id: string;
  name: string;
  en: string;
  desc: string;
  perf: PerfLevel;
  /** 逐字模式：letters = 按字符错开 */
  mode: "block" | "letters" | "words" | "mask";
}

export const TEXT_ANIMS: TextAnimDef[] = [
  { id: "typewriter", name: "打字机", en: "Typewriter", desc: "逐字出现", perf: 1, mode: "letters" },
  { id: "letter-fade", name: "逐字淡入", en: "Letter Fade", desc: "字符依次淡入", perf: 1, mode: "letters" },
  { id: "letter-scale", name: "逐字缩放", en: "Letter Scale", desc: "字符依次弹出", perf: 2, mode: "letters" },
  { id: "letter-rotate", name: "逐字旋转", en: "Letter Rotate", desc: "字符依次旋转出现", perf: 2, mode: "letters" },
  { id: "word-slide", name: "词组滑入", en: "Word Slide", desc: "按词滑入", perf: 1, mode: "words" },
  { id: "line-reveal", name: "整行揭示", en: "Line Reveal", desc: "整行上移揭示", perf: 1, mode: "block" },
  { id: "mask-reveal", name: "遮罩揭示", en: "Mask Reveal", desc: "遮罩横向揭示", perf: 2, mode: "mask" },
  { id: "gradient-sweep", name: "渐变扫光", en: "Gradient Sweep", desc: "渐变高光扫过", perf: 2, mode: "block" },
  { id: "glow", name: "辉光", en: "Glow", desc: "柔光呼吸", perf: 2, mode: "block" },
  { id: "neon", name: "霓虹", en: "Neon", desc: "霓虹描边发光", perf: 2, mode: "block" },
  { id: "glass", name: "玻璃", en: "Glass", desc: "半透明玻璃文字", perf: 2, mode: "block" },
  { id: "subtitle", name: "字幕", en: "Subtitle", desc: "底部电影字幕", perf: 1, mode: "block" },
  { id: "bible-verse", name: "经文", en: "Bible Verse", desc: "经文缓慢浮现", perf: 1, mode: "block" },
  { id: "title-cinematic", name: "电影标题", en: "Title Cinematic", desc: "电影级标题推近", perf: 2, mode: "block" },
  { id: "title-apple", name: "Apple 标题", en: "Title Apple", desc: "克制优雅的标题", perf: 1, mode: "block" },
  { id: "text-elegant", name: "优雅揭示", en: "Elegant Reveal", desc: "优雅上浮出现", perf: 1, mode: "block" },
  { id: "fade", name: "淡入淡出", en: "Fade", desc: "基础淡入淡出", perf: 1, mode: "block" },
  { id: "rise", name: "上升出现", en: "Rise", desc: "基础上升", perf: 1, mode: "block" },
  { id: "none", name: "无动画", en: "None", desc: "静止", perf: 1, mode: "block" },
];

export const TEXT_ANIM_MAP: Record<string, TextAnimDef> = Object.fromEntries(TEXT_ANIMS.map((t) => [t.id, t]));

/* ============================== 十四、推荐组合 ============================== */
export interface AnimCombo {
  key: string;
  name: string;
  emoji: string;
  desc: string;
  anims: string[];       // 图片动画池（随机分配）
  transition: string;
  easing: EasingKey;
  textAnim: string;
  intensity: number;
  perPhoto?: number;
}

export const ANIM_COMBOS: AnimCombo[] = [
  { key: "apple-cinematic", name: "Apple Cinematic", emoji: "🍎", desc: "电影推近 + 柔和淡化 + 视差 + 交叉溶解 + 漂浮",
    anims: ["cine-zoom", "soft-fade", "parallax", "floating", "kb-cinematic"], transition: "cross-dissolve", easing: "cinematic", textAnim: "title-apple", intensity: 1, perPhoto: 6 },
  { key: "retreat-memory", name: "Retreat Memory", emoji: "🏕️", desc: "Ken Burns + 照片叠层 + 镜头推进 + 胶片灼烧 + 柔和淡化",
    anims: ["kb-classic", "photo-stack", "cam-push", "film-burn", "soft-fade"], transition: "burn", easing: "easeInOut", textAnim: "text-elegant", intensity: 1, perPhoto: 5.5 },
  { key: "sunday-worship", name: "Sunday Worship", emoji: "⛪", desc: "漂浮 + 焦点转移 + 模糊显影 + 交叉溶解 + 经文",
    anims: ["floating", "focus-pull", "blur-reveal", "breathing", "kb-face"], transition: "cross-dissolve", easing: "easeInOut", textAnim: "bible-verse", intensity: 0.9, perPhoto: 6 },
  { key: "wedding", name: "Wedding", emoji: "💍", desc: "慢速放大 + 光扫 + 柔焦 + 玻璃质感 + 优雅揭示",
    anims: ["slow-zoom-in", "light-sweep", "soft-blur", "glass-morph", "elegant-reveal"], transition: "glass-t", easing: "cinematic", textAnim: "text-elegant", intensity: 0.85, perPhoto: 7 },
  { key: "children", name: "Children", emoji: "🧒", desc: "弹跳 + 卡片掉落 + 照片散开 + 彩虹 + 欢乐弹出",
    anims: ["bounce", "card-drop", "photo-scatter", "rainbow", "happy-pop"], transition: "shuffle-t", easing: "bounce", textAnim: "letter-scale", intensity: 1.2, perPhoto: 3.5 },
  { key: "ai-modern", name: "AI Modern", emoji: "🤖", desc: "玻璃 + 液态 + HUD + RGB 分离 + 运动模糊",
    anims: ["glass-morph", "liquid-morph", "hud-reveal", "rgb-split", "motion-blur"], transition: "warp", easing: "easeOut", textAnim: "neon", intensity: 1.1, perPhoto: 4.5 },
];

/* ============================== 十二、随机动画 ============================== */
export type RandomMode =
  | "gentle" | "modern" | "cinematic" | "apple" | "church" | "wedding" | "kids" | "tech" | "all";

export const RANDOM_MODES: { key: RandomMode; label: string; pick: (a: AnimDef) => boolean }[] = [
  { key: "gentle", label: "温和模式", pick: (a) => a.perf === 1 && !a.fnHeavy },
  { key: "modern", label: "现代模式", pick: (a) => a.cats.includes("minimal") || a.cats.includes("apple") },
  { key: "cinematic", label: "电影模式", pick: (a) => a.cats.includes("cinematic") },
  { key: "apple", label: "Apple 模式", pick: (a) => a.cats.includes("apple") },
  { key: "church", label: "教会模式", pick: (a) => a.cats.includes("church") || a.cats.includes("wall") },
  { key: "wedding", label: "婚礼模式", pick: (a) => a.cats.includes("wedding") },
  { key: "kids", label: "儿童模式", pick: (a) => a.cats.includes("kids") },
  { key: "tech", label: "科技模式", pick: (a) => a.cats.includes("tech") },
  { key: "all", label: "全部随机", pick: () => true },
] as unknown as { key: RandomMode; label: string; pick: (a: AnimDef) => boolean }[];

/** 生成不连续重复的随机动画序列 */
export function randomSequence(mode: RandomMode, count: number): string[] {
  const modeDef = RANDOM_MODES.find((m) => m.key === mode) ?? RANDOM_MODES[RANDOM_MODES.length - 1];
  const pool = ANIMATION_LIBRARY.filter((a) => a.id !== "none" && modeDef.pick(a));
  const use = pool.length ? pool : ANIMATION_LIBRARY.filter((a) => a.id !== "none");
  const out: string[] = [];
  let prev = "";
  for (let i = 0; i < count; i++) {
    let pick = use[Math.floor(Math.random() * use.length)].id;
    let guard = 0;
    while (pick === prev && use.length > 1 && guard++ < 12) pick = use[Math.floor(Math.random() * use.length)].id;
    out.push(pick);
    prev = pick;
  }
  return out;
}

/* ============================== 搜索 ============================== */
export function searchAnimations(query: string, cat: CatKey, favorites: string[] = []): AnimDef[] {
  const q = query.trim().toLowerCase();
  return ANIMATION_LIBRARY.filter((a) => {
    if (cat === "featured" && !a.cats.includes("featured") && !favorites.includes(a.id)) return false;
    if (cat !== "all" && cat !== "featured" && cat !== "transition" && cat !== "text" && cat !== "template" && !a.cats.includes(cat)) return false;
    if (!q) return true;
    return (a.name + a.en + a.desc + a.scene + a.cats.join(" ")).toLowerCase().includes(q);
  });
}

export const LIBRARY_STATS = {
  animations: ANIMATION_LIBRARY.length,
  transitions: TRANSITIONS.length,
  textAnimations: TEXT_ANIMS.length,
  combos: ANIM_COMBOS.length,
  gpuAccelerated: ANIMATION_LIBRARY.filter((a) => a.gpu).length,
};
