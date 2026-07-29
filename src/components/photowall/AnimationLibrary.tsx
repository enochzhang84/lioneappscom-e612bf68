import * as React from "react";
import { toast } from "sonner";
import {
  Search, Star, Sparkles, Shuffle, Gauge, Clock, Zap, Layers, Type as TypeIcon, Wand2, History, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ANIMATION_LIBRARY, ANIM_COMBOS, ANIM_MAP, CATEGORIES, EASINGS, LIBRARY_STATS, PERF_MODES,
  RANDOM_MODES, TEXT_ANIMS, TRANSITIONS, detectPerfMode, ease, evalAnimation, randomSequence,
  resolveAnimId, searchAnimations,
  type AnimDef, type CatKey, type EasingKey, type PerfMode, type RandomMode,
} from "@/lib/photowall/animations";
import {
  ANIM_GROUPS, RECOMMENDED_COMBOS, SCENE_GROUPS, SCENE_PRESETS, SCENE_STATS,
  planSequence, planToSettings, type AnimGroupKey, type AnimPlan,
} from "@/lib/photowall/scenes";
import { drawFx } from "@/lib/photowall/fx";
import { useEditor } from "./ctx";

const FAV_KEY = "pw-anim-favorites";
const RECENT_KEY = "pw-anim-recent";

function readList(key: string): string[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]") as string[]; } catch { return []; }
}
function writeList(key: string, v: string[]) {
  try { localStorage.setItem(key, JSON.stringify(v.slice(0, 60))); } catch { /* ignore */ }
}

const dark = "border-white/10 bg-white/[0.06] text-white placeholder:text-white/30";

/* ------------------------- 动画卡片实时预览 ------------------------- */
function AnimPreview({ def, img, active }: { def: AnimDef; img: HTMLImageElement | null; active: boolean }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const raf = React.useRef<number>(0);

  React.useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width, H = cv.height;
    const t0 = performance.now();

    const frame = (now: number) => {
      const p = active ? ((now - t0) / (def.dur * 1000)) % 1 : 0.45;
      const a = evalAnimation(def.id, p, { seed: 3, zoom: 1.25, hold: 0.5, intensity: 1, easing: "cinematic" });
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0b0d12";
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = a.alpha;
      ctx.translate(W / 2 + a.dx * W, H / 2 + a.dy * H);
      ctx.rotate(a.rot);
      ctx.translate(-W / 2, -H / 2);
      ctx.beginPath();
      const r = 8;
      ctx.moveTo(r, 0); ctx.arcTo(W, 0, W, H, r); ctx.arcTo(W, H, 0, H, r); ctx.arcTo(0, H, 0, 0, r); ctx.arcTo(0, 0, W, 0, r); ctx.closePath();
      ctx.clip();
      if (a.blur > 0) ctx.filter = `blur(${a.blur * (W / 400)}px)`;
      if (img && img.complete && img.naturalWidth) {
        const s = Math.max(W / img.naturalWidth, H / img.naturalHeight) * a.scale;
        const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        ctx.drawImage(img, (W - dw) * (0.5 + a.focusDX), (H - dh) * (0.5 + a.focusDY), dw, dh);
      } else {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, "#1e3a8a"); g.addColorStop(0.5, "#2563eb"); g.addColorStop(1, "#0ea5e9");
        ctx.save();
        ctx.translate(W / 2, H / 2); ctx.scale(a.scale, a.scale); ctx.translate(-W / 2, -H / 2);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(255,255,255,.25)";
        ctx.beginPath(); ctx.arc(W * 0.32, H * 0.36, H * 0.16, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(W * 0.1, H); ctx.lineTo(W * 0.45, H * 0.45); ctx.lineTo(W * 0.8, H); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.filter = "none";
      if (a.fx) drawFx(ctx, a.fx, a.fxAmt, W, H, p, 3);
      ctx.restore();
      if (active) raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf.current);
  }, [def, img, active]);

  return <canvas ref={ref} width={220} height={124} className="h-auto w-full rounded-lg" />;
}

/* ------------------------- 缓动曲线编辑器 ------------------------- */
function CurveEditor({
  easing, bezier, onEasing, onBezier,
}: {
  easing: EasingKey;
  bezier: [number, number, number, number];
  onEasing: (v: EasingKey) => void;
  onBezier: (v: [number, number, number, number]) => void;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,.10)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo((W / 4) * i, 0); ctx.lineTo((W / 4) * i, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, (H / 4) * i); ctx.lineTo(W, (H / 4) * i); ctx.stroke();
    }
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const v = ease(easing, t, bezier);
      const x = t * W;
      const y = H - Math.min(1.25, Math.max(-0.25, v)) * H * 0.8 - H * 0.1;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [easing, bezier]);

  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white">动画曲线编辑器</span>
        <span className="text-[10px] text-white/35">可扩展关键帧</span>
      </div>
      <canvas ref={ref} width={260} height={110} className="w-full rounded-lg bg-black/30" />
      <Select value={easing} onValueChange={(v) => onEasing(v as EasingKey)}>
        <SelectTrigger className={`${dark} h-8 text-xs`}><SelectValue /></SelectTrigger>
        <SelectContent>
          {EASINGS.map((e) => <SelectItem key={e.key} value={e.key}>{e.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {easing === "custom" && (
        <div className="grid grid-cols-4 gap-1">
          {bezier.map((v, i) => (
            <Input
              key={i} type="number" step={0.05} value={v} className={`${dark} h-7 px-1 text-[11px]`}
              onChange={(e) => { const n = [...bezier] as [number, number, number, number]; n[i] = Number(e.target.value); onBezier(n); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 主面板 ------------------------------ */
type Tab = AnimGroupKey;
type Scope = "current" | "group" | "all" | "random";

/** 各分组默认聚焦的动画分类 */
const GROUP_CAT: Partial<Record<AnimGroupKey, CatKey>> = {
  basic: "basic", camera: "camera", bg: "bg", effect: "effect",
};
/** 分组图标 */
const GROUP_ICON: Record<AnimGroupKey, typeof Sparkles> = {
  combo: Wand2, scene: Sparkles, basic: Layers, transition: Shuffle, camera: Gauge,
  bg: Zap, text: TypeIcon, effect: Sparkles, fav: Star, recent: History,
};
/** 使用动画卡片网格的分组 */
const GRID_TABS: AnimGroupKey[] = ["basic", "camera", "bg", "effect", "fav", "recent"];

export function AnimationLibraryPanel() {
  const { project, setProject, patchSettings, images, selection, selectedIds } = useEditor();
  const s = project.settings;
  const [tab, setTab] = React.useState<Tab>("scene");
  const [sceneGroup, setSceneGroup] = React.useState<string>("church");
  const [cat, setCat] = React.useState<CatKey>("featured");
  const [q, setQ] = React.useState("");
  const [scope, setScope] = React.useState<Scope>("all");
  const [favs, setFavs] = React.useState<string[]>(() => readList(FAV_KEY));
  const [recent, setRecent] = React.useState<string[]>(() => readList(RECENT_KEY));
  const [hover, setHover] = React.useState<string | null>(null);
  const [onlyFav, setOnlyFav] = React.useState(false);
  const [randomMode, setRandomMode] = React.useState<RandomMode>("all");

  const sampleImg = React.useMemo(() => {
    const first = project.photos.find((p) => images.get(p.assetId));
    return first ? images.get(first.assetId) ?? null : null;
  }, [project.photos, images]);

  React.useEffect(() => {
    if (!s.perfMode) patchSettings({ perfMode: detectPerfMode() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentAnim = resolveAnimId(s.animationId ?? s.animation);
  const activeScene = s.animCombo ?? null;
  const list = React.useMemo(() => {
    if (tab === "fav") return favs.map((id) => ANIM_MAP[id]).filter(Boolean);
    if (tab === "recent") return recent.map((id) => ANIM_MAP[id]).filter(Boolean);
    let r = searchAnimations(q, cat, favs);
    if (onlyFav) r = r.filter((a) => favs.includes(a.id));
    return r;
  }, [q, cat, favs, onlyFav, tab, recent]);

  function toggleFav(id: string) {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      writeList(FAV_KEY, next);
      return next;
    });
  }

  function markRecent(id: string) {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)];
      writeList(RECENT_KEY, next);
      return next;
    });
  }

  function applyAnim(id: string) {
    markRecent(id);
    const name = ANIM_MAP[id]?.name ?? id;
    if (scope === "all") {
      setProject((p) => ({
        ...p,
        photos: p.photos.map((x) => ({ ...x, animationId: null })),
        settings: { ...p.settings, animationId: id, animRandom: false, animCombo: null },
      }));
      toast.success(`已应用到全部图片：${name}`);
      return;
    }
    if (scope === "random") {
      const seq = randomSequence(randomMode, project.photos.length || 1);
      setProject((p) => ({
        ...p,
        photos: p.photos.map((x, i) => ({ ...x, animationId: seq[i % seq.length] })),
        settings: { ...p.settings, animRandom: false },
      }));
      toast.success(`已随机分配 ${project.photos.length} 张图片的动画（不连续重复）`);
      return;
    }
    const ids = scope === "group" ? selectedIds : selection.type === "photo" && selection.id ? [selection.id] : selectedIds;
    if (!ids.length) { toast.error("请先在左侧图片面板选择图片"); return; }
    setProject((p) => ({ ...p, photos: p.photos.map((x) => (ids.includes(x.id) ? { ...x, animationId: id } : x)) }));
    toast.success(`已应用到 ${ids.length} 张图片：${name}`);
  }

  /** 套用一整套动画方案（场景类型 / 推荐组合共用） */
  function applyPlan(plan: AnimPlan, name: string, key: string) {
    const seq = planSequence(plan, project.photos.length || 1);
    setProject((p) => ({
      ...p,
      photos: p.photos.map((x, i) => ({ ...x, animationId: seq[i % seq.length] })),
      texts: p.texts.map((t) => ({
        ...t,
        animation: plan.text,
        animMotion: plan.hold ?? t.animMotion,
      })),
      settings: { ...p.settings, ...planToSettings(plan), animCombo: key },
    }));
    markRecent(plan.enter[0]);
    toast.success(`已套用：${name} · ${plan.perPhoto}s/张 · ${seq.length} 个片段`);
  }

  function applyCombo(key: string) {
    const c = ANIM_COMBOS.find((x) => x.key === key);
    if (!c) return;
    const seq: string[] = [];
    let prev = "";
    for (let i = 0; i < Math.max(1, project.photos.length); i++) {
      const pool = c.anims.filter((a) => a !== prev);
      const pick = pool[i % pool.length];
      seq.push(pick);
      prev = pick;
    }
    setProject((p) => ({
      ...p,
      photos: p.photos.map((x, i) => ({ ...x, animationId: seq[i % seq.length] })),
      texts: p.texts.map((t) => ({ ...t, animation: c.textAnim })),
      settings: {
        ...p.settings,
        animationId: c.anims[0],
        transitionId: c.transition,
        easing: c.easing,
        animIntensity: c.intensity,
        perPhoto: c.perPhoto ?? p.settings.perPhoto,
        animCombo: c.key,
      },
    }));
    toast.success(`已套用组合：${c.name}`);
  }

  const bezier = (s.customBezier ?? [0.25, 0.1, 0.25, 1]) as [number, number, number, number];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-primary" /> 动画资源库
        </h2>
        <p className="mt-0.5 text-[11px] text-white/45">
          {SCENE_STATS.scenes} 场景 · {LIBRARY_STATS.animations} 动画 · {LIBRARY_STATS.transitions} 转场 · {LIBRARY_STATS.textAnimations} 文字 · {SCENE_STATS.combos} 组合
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ANIM_GROUPS.map((g) => {
          const Icon = GROUP_ICON[g.key];
          return (
            <button key={g.key} onClick={() => { setTab(g.key); const c = GROUP_CAT[g.key]; if (c) setCat(c); }}
              title={g.desc}
              className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] transition ${tab === g.key ? "bg-primary text-primary-foreground" : "text-white/60 hover:bg-white/10"}`}>
              <Icon className="h-3 w-3" /> {g.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3 text-white/85">
        {tab === "scene" && (
          <>
            <p className="rounded-xl bg-white/[0.05] p-2.5 text-[11px] leading-relaxed text-white/55">
              点击场景卡片，一键套用整套动画配置：进入 / 停留 / 退出、转场、镜头、背景、文字、特效与推荐时长。
            </p>
            <div className="flex flex-wrap gap-1">
              {SCENE_GROUPS.map((g) => (
                <button key={g.key} onClick={() => setSceneGroup(g.key)}
                  className={`rounded-full px-2.5 py-1 text-[11px] transition ${sceneGroup === g.key ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-white/60 hover:bg-white/15"}`}>
                  {g.label}
                </button>
              ))}
            </div>
            <div className="grid gap-2">
              {SCENE_PRESETS.filter((x) => x.enabled && x.group === sceneGroup).map((sc) => (
                <button key={sc.key} onClick={() => applyPlan(sc.plan, sc.name, sc.key)}
                  className={`overflow-hidden rounded-2xl border text-left transition ${activeScene === sc.key ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04] hover:border-primary/50 hover:bg-white/[0.07]"}`}>
                  <div className="h-1.5 w-full" style={{ background: sc.cover }} />
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sc.emoji}</span>
                      <span className="text-sm font-medium text-white">{sc.name}</span>
                      <span className="text-[10px] text-white/35">{sc.en}</span>
                      {activeScene === sc.key && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="mt-1 text-[11px] text-white/45">{sc.desc}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1 text-[9px] text-white/55">
                      <span className="rounded bg-white/[0.07] px-1.5 py-0.5">节奏 {sc.rhythm}</span>
                      <span className="rounded bg-white/[0.07] px-1.5 py-0.5">{sc.plan.perPhoto}s / 张</span>
                      <span className="rounded bg-white/[0.07] px-1.5 py-0.5">镜头 {ANIM_MAP[sc.plan.camera]?.name ?? sc.plan.camera}</span>
                      <span className="rounded bg-white/[0.07] px-1.5 py-0.5">转场 {TRANSITIONS.find((t) => t.id === sc.plan.transition)?.name ?? sc.plan.transition}</span>
                      {sc.plan.bg && <span className="rounded bg-white/[0.07] px-1.5 py-0.5">背景 {ANIM_MAP[sc.plan.bg]?.name}</span>}
                      {sc.plan.effect && <span className="rounded bg-white/[0.07] px-1.5 py-0.5">特效 {ANIM_MAP[sc.plan.effect]?.name}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}




        {GRID_TABS.includes(tab) && (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索动画：名称 / 风格 / 用途…" className={`${dark} h-9 pl-8`} />
            </div>

            <div className="flex flex-wrap gap-1">
              {CATEGORIES.filter((c) => !["transition", "text", "template"].includes(c.key)).map((c) => (
                <button key={c.key} onClick={() => setCat(c.key)}
                  className={`rounded-full px-2.5 py-1 text-[11px] transition ${cat === c.key ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-white/60 hover:bg-white/15"}`}>
                  {c.label}
                </button>
              ))}
              <button onClick={() => setOnlyFav((v) => !v)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition ${onlyFav ? "bg-amber-400 text-black" : "bg-white/[0.07] text-white/60 hover:bg-white/15"}`}>
                <Star className="h-3 w-3" /> 我的收藏 {favs.length ? `(${favs.length})` : ""}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5">
              <div className="col-span-2 text-[11px] font-medium text-white/70">应用范围</div>
              {([["current", "当前图片"], ["group", "当前组"], ["all", "全部图片"], ["random", "随机应用"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setScope(k)}
                  className={`rounded-lg px-2 py-1.5 text-[11px] transition ${scope === k ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-white/65 hover:bg-white/15"}`}>{l}</button>
              ))}
              {scope === "random" && (
                <div className="col-span-2">
                  <Select value={randomMode} onValueChange={(v) => setRandomMode(v as RandomMode)}>
                    <SelectTrigger className={`${dark} h-8 text-xs`}><SelectValue /></SelectTrigger>
                    <SelectContent>{RANDOM_MODES.map((m) => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <Button size="sm" variant="secondary" className="col-span-2 h-8 gap-1 text-xs"
                onClick={() => {
                  const seq = randomSequence(randomMode, project.photos.length || 1);
                  setProject((p) => ({ ...p, photos: p.photos.map((x, i) => ({ ...x, animationId: seq[i % seq.length] })) }));
                  toast.success(`随机动画已生成（${RANDOM_MODES.find((m) => m.key === randomMode)?.label}）`);
                }}>
                <Shuffle className="h-3.5 w-3.5" /> 随机动画
              </Button>
            </div>

            {recent.length > 0 && (
              <div>
                <div className="mb-1.5 flex items-center gap-1 text-[11px] text-white/50"><History className="h-3 w-3" /> 最近使用</div>
                <div className="flex flex-wrap gap-1">
                  {recent.slice(0, 8).filter((id) => ANIM_MAP[id]).map((id) => (
                    <button key={id} onClick={() => applyAnim(id)} className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/15">
                      {ANIM_MAP[id].name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2.5 sm:grid-cols-2">
              {list.map((a) => {
                const isCurrent = currentAnim === a.id;
                return (
                  <div key={a.id}
                    onMouseEnter={() => setHover(a.id)} onMouseLeave={() => setHover((h) => (h === a.id ? null : h))}
                    onClick={() => applyAnim(a.id)}
                    className={`group cursor-pointer overflow-hidden rounded-2xl border p-2 transition ${isCurrent ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04] hover:border-primary/50 hover:bg-white/[0.07]"}`}>
                    <div className="relative">
                      <AnimPreview def={a} img={sampleImg} active={hover === a.id} />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFav(a.id); }}
                        className={`absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 transition ${favs.includes(a.id) ? "text-amber-300" : "text-white/50 hover:text-white"}`}>
                        <Star className="h-3 w-3" fill={favs.includes(a.id) ? "currentColor" : "none"} />
                      </button>
                      {isCurrent && <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground"><Check className="h-2.5 w-2.5" /> 使用中</span>}
                    </div>
                    <div className="mt-1.5 px-0.5">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="truncate text-xs font-medium text-white">{a.name}</span>
                        <span className="shrink-0 text-[9px] text-white/35">{a.en}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[10px] text-white/45">{a.desc}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-[9px] text-white/40">
                        <span className="inline-flex items-center gap-0.5 rounded bg-white/[0.07] px-1 py-0.5"><Clock className="h-2.5 w-2.5" />{a.dur}s</span>
                        <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 ${a.perf === 1 ? "bg-emerald-500/20 text-emerald-300" : a.perf === 2 ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"}`}>
                          <Gauge className="h-2.5 w-2.5" />{a.perf === 1 ? "轻量" : a.perf === 2 ? "中等" : "重度"}
                        </span>
                        {a.gpu && <span className="inline-flex items-center gap-0.5 rounded bg-sky-500/20 px-1 py-0.5 text-sky-300"><Zap className="h-2.5 w-2.5" />GPU</span>}
                      </div>
                      <p className="mt-1 truncate text-[10px] text-white/35">推荐场景：{a.scene}</p>
                    </div>
                  </div>
                );
              })}
              {list.length === 0 && <p className="col-span-2 py-6 text-center text-[11px] text-white/35">没有匹配的动画。</p>}
            </div>
          </>
        )}

        {tab === "transition" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {TRANSITIONS.map((t) => (
              <button key={t.id} onClick={() => { patchSettings({ transitionId: t.id }); toast.success(`转场：${t.name}`); }}
                className={`rounded-xl border p-2.5 text-left transition ${(s.transitionId ?? "cross-dissolve") === t.id ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04] hover:border-primary/50"}`}>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="truncate text-xs font-medium text-white">{t.name}</span>
                  {t.gpu && <Zap className="h-3 w-3 shrink-0 text-sky-300" />}
                </div>
                <span className="block truncate text-[10px] text-white/40">{t.en} · {t.desc}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "text" && (
          <>
            <p className="rounded-xl bg-white/[0.05] p-2.5 text-[11px] text-white/55">点击应用到全部文字图层，也可在右侧属性面板对单个文字单独设置。</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {TEXT_ANIMS.map((t) => (
                <button key={t.id}
                  onClick={() => { setProject((p) => ({ ...p, texts: p.texts.map((x) => ({ ...x, animation: t.id })) })); toast.success(`文字动画：${t.name}`); }}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-left transition hover:border-primary/50">
                  <span className="block text-xs font-medium text-white">{t.name}</span>
                  <span className="block truncate text-[10px] text-white/40">{t.en} · {t.desc}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "combo" && (
          <div className="grid gap-2">
            {ANIM_COMBOS.map((c) => (
              <button key={c.key} onClick={() => applyCombo(c.key)}
                className={`rounded-2xl border p-3 text-left transition ${s.animCombo === c.key ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04] hover:border-primary/50"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{c.emoji}</span>
                  <span className="text-sm font-medium text-white">{c.name}</span>
                </div>
                <p className="mt-1 text-[11px] text-white/45">{c.desc}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {c.anims.map((id) => <span key={id} className="rounded bg-white/[0.07] px-1.5 py-0.5 text-[9px] text-white/55">{ANIM_MAP[id]?.name ?? id}</span>)}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ------------------------- 通用参数 ------------------------- */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-xs font-medium text-white">动画参数</div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/55">动画速度 {(s.animSpeed ?? 1).toFixed(2)}×</Label>
            <Slider value={[s.animSpeed ?? 1]} min={0.25} max={3} step={0.05} onValueChange={(v) => patchSettings({ animSpeed: v[0] })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/55">延迟 {Math.round((s.animDelay ?? 0) * 100)}%</Label>
            <Slider value={[s.animDelay ?? 0]} min={0} max={0.8} step={0.05} onValueChange={(v) => patchSettings({ animDelay: v[0] })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/55">动画幅度 {(s.animIntensity ?? 1).toFixed(2)}×（缩放 / 旋转 / 位移 / 模糊）</Label>
            <Slider value={[s.animIntensity ?? 1]} min={0} max={2} step={0.05} onValueChange={(v) => patchSettings({ animIntensity: v[0] })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/55">持续时间（每个画面 {s.perPhoto.toFixed(1)} 秒）</Label>
            <Slider value={[s.perPhoto]} min={1} max={20} step={0.5} onValueChange={(v) => patchSettings({ perPhoto: v[0] })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/55">转场时间 {s.transition.toFixed(1)}s</Label>
            <Slider value={[s.transition]} min={0.1} max={3} step={0.1} onValueChange={(v) => patchSettings({ transition: v[0] })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-white/55">放大比例 {s.zoom.toFixed(2)}×</Label>
            <Slider value={[s.zoom]} min={1} max={1.8} step={0.01} onValueChange={(v) => patchSettings({ zoom: v[0] })} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2">
            <span className="text-xs">片段内循环动画</span>
            <Switch checked={s.animLoop ?? false} onCheckedChange={(v) => patchSettings({ animLoop: v })} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2">
            <span className="text-xs">每张随机动画（不连续重复）</span>
            <Switch checked={s.animRandom ?? false} onCheckedChange={(v) => patchSettings({ animRandom: v })} />
          </div>
        </div>

        <CurveEditor
          easing={(s.easing as EasingKey) ?? "cinematic"}
          bezier={bezier}
          onEasing={(v) => patchSettings({ easing: v })}
          onBezier={(v) => patchSettings({ customBezier: v })}
        />

        {/* ------------------------- 性能优化 ------------------------- */}
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">性能优化</span>
            <Button size="sm" variant="secondary" className="h-6 px-2 text-[10px]"
              onClick={() => { const m = detectPerfMode(); patchSettings({ perfMode: m }); toast.success(`已自动检测 GPU：${PERF_MODES.find((x) => x.key === m)?.label}`); }}>
              自动检测 GPU
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {PERF_MODES.map((m) => (
              <button key={m.key} onClick={() => patchSettings({ perfMode: m.key as PerfMode })}
                className={`rounded-lg px-2 py-1.5 text-[11px] transition ${(s.perfMode ?? "balanced") === m.key ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-white/65 hover:bg-white/15"}`}>
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/40">{PERF_MODES.find((m) => m.key === (s.perfMode ?? "balanced"))?.desc}</p>
        </div>

        <p className="pb-2 text-[10px] leading-relaxed text-white/30">
          动画库共 {ANIMATION_LIBRARY.length} 个图片动画、{TRANSITIONS.length} 个转场、{TEXT_ANIMS.length} 个文字动画、{ANIM_COMBOS.length} 个组合模板；
          编辑器预览、真实预览与 MP4 导出使用同一套渲染引擎，效果完全一致。
        </p>
      </div>
    </div>
  );
}
