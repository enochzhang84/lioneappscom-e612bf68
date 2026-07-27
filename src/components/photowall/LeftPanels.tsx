import * as React from "react";
import { toast } from "sonner";
import {
  Upload, Trash2, Star, Eye, Pencil, CheckSquare, Square, Search, RefreshCw, Wand2, Download, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { assetUrl, hashBlob, putAsset, deleteAsset } from "@/lib/photowall/store";
import { ANIMATIONS, LAYOUTS, TEMPLATES, TEXT_PRESETS } from "@/lib/photowall/presets";
import { ASPECTS, type PWPhoto, type PWText } from "@/lib/photowall/types";
import { fmtTime } from "@/lib/photowall/render";
import { exportVideo, downloadBlob, pickMime } from "@/lib/photowall/export";
import { useEditor } from "./ctx";
import type { PanelKey } from "./rail";

/* --------------------------------- 通用 --------------------------------- */
function PanelShell({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {desc && <p className="mt-0.5 text-[11px] text-white/45">{desc}</p>}
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4 text-white/85">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-white/55">{label}</Label>
      {children}
    </div>
  );
}

function darkInput(extra = "") {
  return `border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 ${extra}`;
}

function Thumb({ assetId, className }: { assetId: string; className?: string }) {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let ok = true;
    assetUrl(assetId).then((u) => ok && setUrl(u));
    return () => { ok = false; };
  }, [assetId]);
  return url ? <img src={url} alt="" loading="lazy" className={className} /> : <div className={`bg-white/10 ${className}`} />;
}

/* ------------------------------- 图片面板 ------------------------------- */
function ImagesPanel() {
  const { project, setProject, selection, setSelection, selectedIds, setSelectedIds } = useEditor();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [q, setQ] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [visible, setVisible] = React.useState(120);
  const [confirm, setConfirm] = React.useState<null | { title: string; desc: string; run: () => void }>(null);
  const reuploadRef = React.useRef(false);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? project.photos.filter((p) => (p.name + (p.title ?? "") + (p.caption ?? "")).toLowerCase().includes(s)) : project.photos;
  }, [project.photos, q]);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const existing = new Set(project.photos.map((p) => p.hash));
      const next: PWPhoto[] = [];
      let dupes = 0;
      for (const f of Array.from(files)) {
        if (!/^image\//.test(f.type) && !/\.(heic|heif)$/i.test(f.name)) continue;
        const hash = await hashBlob(f);
        if (existing.has(hash)) { dupes++; continue; }
        existing.add(hash);
        const assetId = await putAsset(f);
        const url = await assetUrl(assetId);
        const dim = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () => resolve({ w: 0, h: 0 });
          img.src = url ?? "";
        });
        if (!dim.w) { toast.error(`无法解码：${f.name}（HEIC 建议先转 JPG）`); continue; }
        next.push({
          id: crypto.randomUUID(), assetId, name: f.name, w: dim.w, h: dim.h, size: f.size, hash,
          rotate: 0, radius: 0, border: 0, shadow: true, focusX: 0.5, focusY: 0.5, highlight: false, cover: false, duration: null,
        });
      }
      if (next.length) setProject((p) => ({ ...p, photos: [...p.photos, ...next] }));
      toast.success(`已添加 ${next.length} 张图片${dupes ? `，跳过 ${dupes} 张重复` : ""}`);
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: string, e: React.MouseEvent) {
    if (e.shiftKey && selectedIds.length) {
      const ids = filtered.map((p) => p.id);
      const a = ids.indexOf(selectedIds[selectedIds.length - 1]);
      const b = ids.indexOf(id);
      const [s, t] = a < b ? [a, b] : [b, a];
      setSelectedIds(Array.from(new Set([...selectedIds, ...ids.slice(s, t + 1)])));
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    } else {
      setSelectedIds([id]);
    }
    setSelection({ type: "photo", id });
  }

  function removePhotos(ids: string[]) {
    const set = new Set(ids);
    const gone = project.photos.filter((p) => set.has(p.id));
    setProject((p) => ({ ...p, photos: p.photos.filter((x) => !set.has(x.id)) }));
    gone.forEach((g) => void deleteAsset(g.assetId));
    setSelectedIds((prev) => prev.filter((x) => !set.has(x)));
    toast.success(`已移除 ${ids.length} 张图片`);
  }

  return (
    <PanelShell title="图片" desc="拖拽或点击上传 · 支持 JPG / PNG / WebP / HEIC">
      <input
        ref={inputRef} type="file" accept="image/*,.heic,.heif" multiple className="hidden"
        onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }}
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); void addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] p-6 text-center transition hover:border-primary/60 hover:bg-primary/5"
      >
        {busy ? <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" /> : <Upload className="mx-auto mb-2 h-6 w-6 text-white/50" />}
        <p className="text-sm font-medium text-white">{busy ? "正在处理…" : "拖拽 / 点击批量上传"}</p>
        <p className="mt-1 text-[11px] text-white/40">自动按 Hash 检测重复图片</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索图片…" className={darkInput("pl-8 h-9")} />
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        <Button size="sm" variant="secondary" className="h-7 gap-1 px-2" onClick={() => setSelectedIds(filtered.map((p) => p.id))}>
          <CheckSquare className="h-3 w-3" /> 全选
        </Button>
        <Button size="sm" variant="secondary" className="h-7 gap-1 px-2" onClick={() => setSelectedIds([])}>
          <Square className="h-3 w-3" /> 取消选择
        </Button>
        <Button
          size="sm" variant="secondary" className="h-7 gap-1 px-2"
          disabled={!selectedIds.length}
          onClick={() =>
            setConfirm({
              title: "移除已选择的图片",
              desc: `确定移除已选择的 ${selectedIds.length} 张图片？移除后不进入回收站，布局与播放顺序会自动刷新。`,
              run: () => removePhotos(selectedIds),
            })
          }
        >
          <Trash2 className="h-3 w-3" /> 清空已选择
        </Button>
        <Button
          size="sm" variant="secondary" className="h-7 gap-1 px-2"
          disabled={!project.photos.length}
          onClick={() =>
            setConfirm({
              title: "清空当前项目所有图片",
              desc: "此操作不可恢复。项目、音乐、动画与设置会保留，仅清空图片。",
              run: () => removePhotos(project.photos.map((p) => p.id)),
            })
          }
        >
          清空全部
        </Button>
        <Button
          size="sm" variant="secondary" className="h-7 gap-1 px-2"
          onClick={() => {
            reuploadRef.current = true;
            setConfirm({
              title: "重新上传",
              desc: "将先清空当前项目全部图片，然后打开文件选择框上传新图片并自动生成照片墙。",
              run: () => {
                removePhotos(project.photos.map((p) => p.id));
                setTimeout(() => inputRef.current?.click(), 200);
              },
            });
          }}
        >
          <RefreshCw className="h-3 w-3" /> 重新上传
        </Button>
        <Select
          onValueChange={(v) =>
            setProject((p) => {
              const arr = [...p.photos];
              if (v === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
              if (v === "size") arr.sort((a, b) => b.size - a.size);
              if (v === "highlight") arr.sort((a, b) => Number(b.highlight) - Number(a.highlight));
              if (v === "reverse") arr.reverse();
              return { ...p, photos: arr };
            })
          }
        >
          <SelectTrigger className={darkInput("h-7 w-[92px] text-[11px]")}><SelectValue placeholder="排序" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">按名称</SelectItem>
            <SelectItem value="size">按大小</SelectItem>
            <SelectItem value="highlight">重点优先</SelectItem>
            <SelectItem value="reverse">反转顺序</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-[11px] text-white/40">
        共 {project.photos.length} 张{selectedIds.length > 0 && ` · 已选 ${selectedIds.length} 张`}
        {project.photos.length > 500 && " · 已启用懒加载"}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filtered.slice(0, visible).map((ph) => {
          const sel = selectedIds.includes(ph.id);
          return (
            <ContextMenu key={ph.id}>
              <ContextMenuTrigger asChild>
                <div
                  onClick={(e) => toggle(ph.id, e)}
                  className={`group relative aspect-square overflow-hidden rounded-xl ring-2 transition ${
                    sel ? "ring-primary" : selection.id === ph.id ? "ring-white/50" : "ring-transparent hover:ring-white/25"
                  }`}
                >
                  <Thumb assetId={ph.assetId} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                    <button title="重点" onClick={(e) => { e.stopPropagation(); setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === ph.id ? { ...x, highlight: !x.highlight } : x)) })); }}
                      className="rounded p-1 text-white/80 hover:text-amber-300"><Star className="h-3.5 w-3.5" /></button>
                    <button title="编辑" onClick={(e) => { e.stopPropagation(); setSelection({ type: "photo", id: ph.id }); }}
                      className="rounded p-1 text-white/80 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                    <button title="移除" onClick={(e) => { e.stopPropagation(); removePhotos([ph.id]); }}
                      className="rounded p-1 text-white/80 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="absolute left-1 top-1 flex gap-1">
                    {ph.highlight && <span className="rounded bg-amber-400/90 px-1 text-[9px] font-semibold text-black">重点</span>}
                    {ph.cover && <span className="rounded bg-sky-400/90 px-1 text-[9px] font-semibold text-black">封面</span>}
                    {(ph.caption || ph.title) && <span className="rounded bg-emerald-400/90 px-1 text-[9px] font-semibold text-black">解说</span>}
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem onSelect={() => setSelection({ type: "photo", id: ph.id })}><Eye className="mr-2 h-3.5 w-3.5" />打开预览 / 编辑</ContextMenuItem>
                <ContextMenuItem onSelect={() => setProject((p) => ({ ...p, photos: p.photos.map((x) => ({ ...x, cover: x.id === ph.id })) }))}>设为封面</ContextMenuItem>
                <ContextMenuItem onSelect={() => setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === ph.id ? { ...x, highlight: !x.highlight } : x)) }))}>设为重点照片</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onSelect={() => setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === ph.id ? { ...x, rotate: (x.rotate + 90) % 360 } : x)) }))}>旋转 90°</ContextMenuItem>
                <ContextMenuItem onSelect={() => setProject((p) => { const i = p.photos.findIndex((x) => x.id === ph.id); const copy = { ...ph, id: crypto.randomUUID() }; const arr = [...p.photos]; arr.splice(i + 1, 0, copy); return { ...p, photos: arr }; })}>复制</ContextMenuItem>
                <ContextMenuItem onSelect={() => { void assetUrl(ph.assetId).then((u) => { if (u) { const a = document.createElement("a"); a.href = u; a.download = ph.name; a.click(); } }); }}>
                  <Download className="mr-2 h-3.5 w-3.5" />下载原图
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-destructive" onSelect={() => removePhotos([ph.id])}>移除</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      {filtered.length > visible && (
        <Button variant="secondary" className="w-full" onClick={() => setVisible((v) => v + 120)}>
          加载更多（剩余 {filtered.length - visible} 张）
        </Button>
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.desc}
        destructive
        onConfirm={() => { confirm?.run(); setConfirm(null); }}
      />
    </PanelShell>
  );
}

/* ------------------------------- 其它面板 ------------------------------- */
function TemplatesPanel() {
  const { project, setProject } = useEditor();
  return (
    <PanelShell title="模板中心" desc="一键套用布局、动画、节奏与开场结束">
      <div className="grid gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setProject((p) => ({
                ...p,
                settings: {
                  ...p.settings, ...t.patch,
                  openingText: t.opening, openingSub: t.openingSub, endingText: t.ending,
                },
              }));
              toast.success(`已套用模板：${t.name}`);
            }}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-primary/60 hover:bg-primary/10"
          >
            <span className="text-xl">{t.emoji}</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-white">{t.name}</span>
              <span className="block truncate text-[11px] text-white/45">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-white/35">当前项目：{project.name}</p>
    </PanelShell>
  );
}

function TextPanel() {
  const { project, setProject, setSelection, timeline } = useEditor();
  function add(kind: PWText["kind"]) {
    const pre = TEXT_PRESETS[0];
    const t: PWText = {
      id: crypto.randomUUID(), kind, text: kind === "title" ? "标题文字" : kind === "verse" ? "经文" : "文字",
      preset: pre.key, font: pre.font, color: pre.color, size: kind === "title" ? 8 : 5,
      align: "center", shadow: true, animation: "fade", start: 0, duration: Math.min(5, timeline.total),
    };
    setProject((p) => ({ ...p, texts: [...p.texts, t] }));
    setSelection({ type: "text", id: t.id });
  }
  return (
    <PanelShell title="文字" desc="主标题 / 副标题 / 解说 / 经文 / 结束语">
      <div className="grid grid-cols-2 gap-2">
        {([["title", "主标题"], ["subtitle", "副标题"], ["caption", "图片解说"], ["verse", "经文"], ["outro", "结束语"]] as const).map(([k, l]) => (
          <Button key={k} variant="secondary" size="sm" onClick={() => add(k)}>+ {l}</Button>
        ))}
      </div>
      <div className="space-y-1.5">
        {project.texts.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <button className="min-w-0 flex-1 text-left" onClick={() => setSelection({ type: "text", id: t.id })}>
              <span className="block truncate text-xs text-white">{t.text || "（空文字）"}</span>
              <span className="block text-[10px] text-white/40">{fmtTime(t.start)} → {fmtTime(t.start + t.duration)}</span>
            </button>
            <button className="text-white/40 hover:text-rose-400" onClick={() => setProject((p) => ({ ...p, texts: p.texts.filter((x) => x.id !== t.id) }))}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {project.texts.length === 0 && <p className="text-[11px] text-white/35">还没有文字图层。</p>}
      </div>
    </PanelShell>
  );
}

function MusicPanel() {
  const { project, setProject, setSelection, timeline } = useEditor();
  const ref = React.useRef<HTMLInputElement>(null);
  const musicTotal = project.music.reduce((a, m) => a + m.duration, 0);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    for (const f of Array.from(files)) {
      const assetId = await putAsset(f);
      const url = await assetUrl(assetId);
      const duration = await new Promise<number>((resolve) => {
        const a = new Audio(url ?? "");
        a.onloadedmetadata = () => resolve(a.duration || 0);
        a.onerror = () => resolve(0);
      });
      setProject((p) => ({
        ...p,
        music: [...p.music, { id: crypto.randomUUID(), assetId, name: f.name, volume: 0.8, fadeIn: 2, fadeOut: 3, loop: true, trimStart: 0, trimEnd: 0, duration }],
      }));
    }
    toast.success("音乐已添加");
  }

  return (
    <PanelShell title="背景音乐" desc="支持 MP3 / WAV / M4A · 多首叠加">
      <input ref={ref} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
      <Button className="w-full gap-2" onClick={() => ref.current?.click()}><Upload className="h-4 w-4" /> 上传音乐</Button>
      <div className="space-y-1.5">
        {project.music.map((m) => (
          <div key={m.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <button className="min-w-0 flex-1 text-left" onClick={() => setSelection({ type: "music", id: m.id })}>
              <span className="block truncate text-xs text-white">{m.name}</span>
              <span className="block text-[10px] text-white/40">{fmtTime(m.duration)} · 音量 {Math.round(m.volume * 100)}%</span>
            </button>
            <button className="text-white/40 hover:text-rose-400" onClick={() => setProject((p) => ({ ...p, music: p.music.filter((x) => x.id !== m.id) }))}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      {project.music.length > 0 && (
        <p className={`rounded-xl p-3 text-[11px] ${Math.abs(musicTotal - timeline.total) > 15 ? "bg-amber-500/15 text-amber-200" : "bg-emerald-500/15 text-emerald-200"}`}>
          音乐总长 {fmtTime(musicTotal)} · 视频总长 {fmtTime(timeline.total)}
          {Math.abs(musicTotal - timeline.total) > 15 ? "（长度差异较大，建议开启循环或调整总时长）" : "（长度匹配良好）"}
        </p>
      )}
    </PanelShell>
  );
}

function AnimationPanel() {
  const { project, patchSettings } = useEditor();
  const s = project.settings;
  return (
    <PanelShell title="动画" desc="全局照片动效与参数">
      <div className="grid grid-cols-2 gap-2">
        {ANIMATIONS.map((a) => (
          <button key={a.key} onClick={() => patchSettings({ animation: a.key })}
            className={`rounded-xl border p-3 text-left transition ${s.animation === a.key ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04] hover:border-white/25"}`}>
            <span className="block text-xs font-medium text-white">{a.label}</span>
            <span className="block text-[10px] text-white/40">{a.desc}</span>
          </button>
        ))}
      </div>
      <Field label={`放大比例 ${s.zoom.toFixed(2)}×`}><Slider value={[s.zoom]} min={1} max={1.6} step={0.01} onValueChange={(v) => patchSettings({ zoom: v[0] })} /></Field>
      <Field label={`停留比例 ${Math.round(s.hold * 100)}%`}><Slider value={[s.hold]} min={0} max={1} step={0.05} onValueChange={(v) => patchSettings({ hold: v[0] })} /></Field>
      <Field label={`转场时间 ${s.transition.toFixed(1)}s`}><Slider value={[s.transition]} min={0.1} max={3} step={0.1} onValueChange={(v) => patchSettings({ transition: v[0] })} /></Field>
      <Field label={`背景变暗 ${Math.round(s.dimBg * 100)}%`}><Slider value={[s.dimBg]} min={0} max={0.8} step={0.05} onValueChange={(v) => patchSettings({ dimBg: v[0] })} /></Field>
      {[["blurBg", "背景模糊"], ["random", "随机播放"], ["noRepeat", "禁止连续重复"]].map(([k, l]) => (
        <div key={k} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2">
          <span className="text-xs">{l}</span>
          <Switch checked={Boolean(s[k as "blurBg"])} onCheckedChange={(v) => patchSettings({ [k]: v } as never)} />
        </div>
      ))}
    </PanelShell>
  );
}

function LayoutPanel() {
  const { project, patchSettings } = useEditor();
  const s = project.settings;
  return (
    <PanelShell title="布局" desc="决定每个画面同时展示多少张照片">
      <div className="grid grid-cols-2 gap-2">
        {LAYOUTS.map((l) => (
          <button key={l.key} onClick={() => patchSettings({ layout: l.key })}
            className={`rounded-xl border p-3 text-left transition ${s.layout === l.key ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04] hover:border-white/25"}`}>
            <span className="block text-xs font-medium text-white">{l.label}</span>
            <span className="block text-[10px] text-white/40">每屏 {l.per} 张</span>
          </button>
        ))}
      </div>
      <Field label={`间距 ${s.gap}`}><Slider value={[s.gap]} min={0} max={60} step={1} onValueChange={(v) => patchSettings({ gap: v[0] })} /></Field>
      <Field label={`圆角 ${s.radius}`}><Slider value={[s.radius]} min={0} max={60} step={1} onValueChange={(v) => patchSettings({ radius: v[0] })} /></Field>
      <Field label={`白色边框 ${s.border}`}><Slider value={[s.border]} min={0} max={24} step={1} onValueChange={(v) => patchSettings({ border: v[0] })} /></Field>
      {[["shadow", "阴影"], ["rotateRandom", "随机旋转"]].map(([k, l]) => (
        <div key={k} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2">
          <span className="text-xs">{l}</span>
          <Switch checked={Boolean(s[k as "shadow"])} onCheckedChange={(v) => patchSettings({ [k]: v } as never)} />
        </div>
      ))}
    </PanelShell>
  );
}

function PlayPanel() {
  const { project, patchSettings, timeline } = useEditor();
  const s = project.settings;
  const perPage = timeline.pageCount ? (timeline.total - (s.openingText ? s.openingDuration : 0) - (s.endingText ? s.endingDuration : 0)) / timeline.pageCount : 0;
  return (
    <PanelShell title="播放" desc="固定每张时间 或 指定总播放时间">
      <div className="grid grid-cols-2 gap-2">
        <Button variant={s.timingMode === "perPhoto" ? "default" : "secondary"} size="sm" onClick={() => patchSettings({ timingMode: "perPhoto" })}>固定每张时间</Button>
        <Button variant={s.timingMode === "total" ? "default" : "secondary"} size="sm" onClick={() => patchSettings({ timingMode: "total" })}>指定总时长</Button>
      </div>
      {s.timingMode === "perPhoto" ? (
        <Field label={`每个画面 ${s.perPhoto.toFixed(1)} 秒`}>
          <Slider value={[s.perPhoto]} min={1} max={20} step={0.5} onValueChange={(v) => patchSettings({ perPhoto: v[0] })} />
        </Field>
      ) : (
        <Field label="目标总时长（分钟）">
          <Input type="number" min={1} step={1} className={darkInput()} value={Math.round(s.totalTarget / 60)} onChange={(e) => patchSettings({ totalTarget: Math.max(1, Number(e.target.value)) * 60 })} />
        </Field>
      )}
      <Button variant="secondary" className="w-full gap-2" onClick={() => { patchSettings({ timingMode: "total" }); toast.success("已按目标总时长自动分配每张显示时间"); }}>
        <Wand2 className="h-4 w-4" /> 一键适配总时长
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Field label="开场文字"><Input className={darkInput()} value={s.openingText} onChange={(e) => patchSettings({ openingText: e.target.value })} /></Field>
        <Field label="开场秒数"><Input type="number" className={darkInput()} value={s.openingDuration} onChange={(e) => patchSettings({ openingDuration: Number(e.target.value) })} /></Field>
        <Field label="开场副标题"><Input className={darkInput()} value={s.openingSub} onChange={(e) => patchSettings({ openingSub: e.target.value })} /></Field>
        <Field label="结束文字"><Input className={darkInput()} value={s.endingText} onChange={(e) => patchSettings({ endingText: e.target.value })} /></Field>
        <Field label="结束副标题"><Input className={darkInput()} value={s.endingSub} onChange={(e) => patchSettings({ endingSub: e.target.value })} /></Field>
        <Field label="结束秒数"><Input type="number" className={darkInput()} value={s.endingDuration} onChange={(e) => patchSettings({ endingDuration: Number(e.target.value) })} /></Field>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2">
        <span className="text-xs">播放结束后自动循环</span>
        <Switch checked={s.loop} onCheckedChange={(v) => patchSettings({ loop: v })} />
      </div>

      <div className="rounded-2xl bg-white/[0.05] p-3 text-[11px] leading-relaxed text-white/70">
        <div>图片数量：{project.photos.length} 张</div>
        <div>画面数量：{timeline.pageCount} 屏（每屏 {timeline.perPage} 张）</div>
        <div>每屏时间：{perPage.toFixed(2)} 秒</div>
        <div>开场 / 结束：{s.openingText ? s.openingDuration : 0}s / {s.endingText ? s.endingDuration : 0}s</div>
        <div className="mt-1 text-sm font-semibold text-white">总播放时长：{fmtTime(timeline.total)}</div>
      </div>
    </PanelShell>
  );
}

function ExportPanel() {
  const { project, images } = useEditor();
  const [res, setRes] = React.useState("1920x1080");
  const [progress, setProgress] = React.useState<null | { percent: number; remaining: number; bytes: number }>(null);
  const [result, setResult] = React.useState<{ blob: Blob; ext: string } | null>(null);
  const cancelRef = React.useRef({ cancelled: false });
  const mime = pickMime();

  async function run() {
    const [w, h] = res.split("x").map(Number);
    cancelRef.current = { cancelled: false };
    setResult(null);
    setProgress({ percent: 0, remaining: 0, bytes: 0 });
    try {
      const out = await exportVideo({
        project, images, width: w, height: h, fps: 30, signal: cancelRef.current,
        onProgress: (p) => setProgress({ percent: p.percent, remaining: p.remaining, bytes: p.bytes }),
      });
      setResult(out);
      toast.success("视频渲染完成");
    } catch (e) {
      toast.error("导出失败：" + (e as Error).message);
    } finally {
      setProgress(null);
    }
  }

  return (
    <PanelShell title="导出视频" desc="H.264 / AAC · 30 FPS · yuv420p · faststart">
      <Field label="分辨率">
        <Select value={res} onValueChange={setRes}>
          <SelectTrigger className={darkInput()}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1920x1080">1920 × 1080（横屏）</SelectItem>
            <SelectItem value="1080x1920">1080 × 1920（竖屏）</SelectItem>
            <SelectItem value="1280x720">1280 × 720</SelectItem>
            <SelectItem value="720x1280">720 × 1280</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <p className="rounded-xl bg-white/[0.05] p-3 text-[11px] text-white/55">
        当前浏览器输出格式：<span className="font-medium text-white">{mime.ext.toUpperCase()}</span>
        {mime.ext !== "mp4" && "（此浏览器不支持 MP4 直录，将输出 WebM，可在 Chrome 中导出 MP4）"}
      </p>

      {progress ? (
        <div className="space-y-2">
          <Progress value={progress.percent} />
          <div className="flex justify-between text-[11px] text-white/60">
            <span>{progress.percent.toFixed(1)}%</span>
            <span>剩余 {fmtTime(progress.remaining)} · {(progress.bytes / 1048576).toFixed(1)} MB</span>
          </div>
          <Button variant="secondary" className="w-full" onClick={() => (cancelRef.current.cancelled = true)}>取消导出</Button>
        </div>
      ) : (
        <Button className="w-full gap-2" onClick={() => void run()} disabled={!project.photos.length}>
          <Download className="h-4 w-4" /> 开始渲染（实时录制）
        </Button>
      )}

      {result && (
        <Button variant="secondary" className="w-full gap-2" onClick={() => downloadBlob(result.blob, `${project.name}.${result.ext}`)}>
          <Download className="h-4 w-4" /> 下载 {result.ext.toUpperCase()}（{(result.blob.size / 1048576).toFixed(1)} MB）
        </Button>
      )}
      <p className="text-[11px] text-white/35">渲染期间请保持本页在前台，导出时长约等于视频时长。</p>
    </PanelShell>
  );
}

function ProjectPanel() {
  const { project, setProject, timeline } = useEditor();
  return (
    <PanelShell title="项目" desc="基础信息与画布比例">
      <Field label="项目名称"><Input className={darkInput()} value={project.name} onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))} /></Field>
      <Field label="画布比例">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(ASPECTS) as (keyof typeof ASPECTS)[]).map((k) => (
            <Button key={k} size="sm" variant={project.aspect === k ? "default" : "secondary"} onClick={() => setProject((p) => ({ ...p, aspect: k }))}>{k}</Button>
          ))}
        </div>
      </Field>
      <div className="rounded-2xl bg-white/[0.05] p-3 text-[11px] text-white/65">
        <div>状态：{project.status === "published" ? "已发布" : "草稿"}</div>
        <div>创建：{new Date(project.createdAt).toLocaleString()}</div>
        <div>更新：{new Date(project.updatedAt).toLocaleString()}</div>
        <div>时长：{fmtTime(timeline.total)}</div>
      </div>
    </PanelShell>
  );
}

function SettingsPanel() {
  const { project, patchSettings } = useEditor();
  return (
    <PanelShell title="设置" desc="外观与预留能力">
      <Field label="背景颜色"><Input type="color" className={darkInput("h-9 p-1")} value={project.settings.bgColor} onChange={(e) => patchSettings({ bgColor: e.target.value })} /></Field>
      <Field label="主题色"><Input type="color" className={darkInput("h-9 p-1")} value={project.settings.accent} onChange={(e) => patchSettings({ accent: e.target.value })} /></Field>
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white"><Wand2 className="h-4 w-4 text-primary" /> ✨ AI 一键生成</div>
        <p className="mt-1 text-[11px] leading-relaxed text-white/45">
          智能选择封面 · 智能排版 · 智能动画 · 智能配乐 · 自动计算最佳播放时间 · 自动生成开场与结束页。
        </p>
        <Button variant="secondary" size="sm" className="mt-3 w-full" disabled>即将推出</Button>
      </div>
    </PanelShell>
  );
}

export function LeftPanel({ panel }: { panel: PanelKey }) {
  switch (panel) {
    case "project": return <ProjectPanel />;
    case "images": return <ImagesPanel />;
    case "templates": return <TemplatesPanel />;
    case "text": return <TextPanel />;
    case "music": return <MusicPanel />;
    case "animation": return <AnimationPanel />;
    case "layout": return <LayoutPanel />;
    case "play": return <PlayPanel />;
    case "export": return <ExportPanel />;
    case "settings": return <SettingsPanel />;
    default: return null;
  }
}
