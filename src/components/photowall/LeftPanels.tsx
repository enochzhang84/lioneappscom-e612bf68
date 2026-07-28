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
import { LAYOUTS, TEMPLATES, TEXT_PRESETS } from "@/lib/photowall/presets";
import { ASPECTS, type PWPhoto, type PWText } from "@/lib/photowall/types";
import { fmtTime } from "@/lib/photowall/render";
import { exportVideo, downloadBlob, pickMime } from "@/lib/photowall/export";
import { useEditor } from "./ctx";
import { AnimationLibraryPanel } from "./AnimationLibrary";
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
  const { project, setProject, selection, setSelection, selectedIds, setSelectedIds, timeline } = useEditor();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [q, setQ] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [visible, setVisible] = React.useState(120);
  const [confirm, setConfirm] = React.useState<null | { title: string; desc: string; run: () => void }>(null);
  const reuploadRef = React.useRef(false);
  /** 上传方式：加入时间轴（默认） / 仅上传到素材库 */
  const [uploadToTimeline, setUploadToTimeline] = React.useState(true);

  const inCount = project.photos.filter((p) => p.inTimeline !== false).length;
  const outCount = project.photos.length - inCount;

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
          inTimeline: uploadToTimeline,
        });
      }
      // 按上传顺序追加到素材库末尾，画面轨随之在现有片段之后延长
      if (next.length) setProject((p) => ({ ...p, photos: [...p.photos, ...next] }));
      toast.success(
        `已添加 ${next.length} 张图片${uploadToTimeline ? "，并全部加入画面轨" : "（仅素材库）"}${dupes ? ` · 跳过 ${dupes} 张重复` : ""}`,
      );
    } finally {
      setBusy(false);
    }
  }

  /** 加入时间轴：按 id 去重，不会重复创建片段 */
  function addToTimeline(ids: string[]) {
    const set = new Set(ids);
    const added = project.photos.filter((p) => set.has(p.id) && p.inTimeline === false).length;
    if (!added) { toast.info("所选图片已全部在画面轨中，未重复添加"); return; }
    setProject((p) => ({ ...p, photos: p.photos.map((x) => (set.has(x.id) ? { ...x, inTimeline: true } : x)) }));
    toast.success(`已将 ${added} 张图片加入画面轨`);
  }

  function removeFromTimeline(ids: string[]) {
    const set = new Set(ids);
    const n = project.photos.filter((p) => set.has(p.id) && p.inTimeline !== false).length;
    setProject((p) => ({ ...p, photos: p.photos.map((x) => (set.has(x.id) ? { ...x, inTimeline: false } : x)) }));
    toast.success(`已从画面轨移除 ${n} 张（素材保留在素材库）`);
  }

  function removePhotos(ids: string[]) {
    const set = new Set(ids);
    const gone = project.photos.filter((p) => set.has(p.id));
    setProject((p) => ({ ...p, photos: p.photos.filter((x) => !set.has(x.id)) }));
    gone.forEach((g) => void deleteAsset(g.assetId));
    setSelectedIds((prev) => prev.filter((x) => !set.has(x)));
    toast.success(`已移除 ${ids.length} 张图片`);
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

      {/* 上传方式 */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
        <div className="mb-1.5 text-[11px] text-white/55">上传方式</div>
        <div className="grid grid-cols-2 gap-1">
          {([[true, "上传并加入时间轴"], [false, "仅上传到素材库"]] as const).map(([v, l]) => (
            <button key={String(v)} onClick={() => setUploadToTimeline(v)}
              className={`rounded-lg px-1.5 py-1.5 text-[11px] transition ${uploadToTimeline === v ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-white/65 hover:bg-white/15"}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* 素材 / 时间轴数量统计 */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-[11px]">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-white/60">
          <span>素材库：<b className="text-white">{project.photos.length}</b> 张</span>
          <span>已加入时间轴：<b className="text-white">{inCount}</b> 张</span>
          <span>未加入：<b className={outCount ? "text-amber-300" : "text-white"}>{outCount}</b> 张</span>
          <span>画面轨：<b className="text-white">{timeline.pageCount}</b> 屏 · 每屏 {timeline.perPage} 张</span>
        </div>
        {outCount > 0 && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-amber-400/15 px-2 py-1.5 text-amber-200">
            <span>有 {outCount} 张图片尚未加入时间轴</span>
            <Button size="sm" className="h-6 px-2 text-[11px]" onClick={() => addToTimeline(project.photos.map((p) => p.id))}>全部加入</Button>
          </div>
        )}
      </div>

      {/* 时间轴批量操作 */}
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        <Button size="sm" variant="secondary" className="h-7 px-2" onClick={() => addToTimeline(project.photos.map((p) => p.id))}>全部加入时间轴</Button>
        <Button size="sm" variant="secondary" className="h-7 px-2" disabled={!selectedIds.length} onClick={() => addToTimeline(selectedIds)}>选中加入时间轴</Button>
        <Button size="sm" variant="secondary" className="h-7 px-2" disabled={!selectedIds.length} onClick={() => removeFromTimeline(selectedIds)}>从时间轴移除</Button>
        <Button
          size="sm" variant="secondary" className="h-7 px-2" disabled={!inCount}
          onClick={() => setConfirm({
            title: "清空画面轨",
            desc: "所有图片将退出时间轴，但仍保留在素材库中，可随时重新加入。",
            run: () => removeFromTimeline(project.photos.map((p) => p.id)),
          })}
        >清空画面轨</Button>
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
          const inTl = ph.inTimeline !== false;
          return (
            <ContextMenu key={ph.id}>
              <ContextMenuTrigger asChild>
                <div
                  onClick={(e) => toggle(ph.id, e)}
                  className={`group relative aspect-square overflow-hidden rounded-xl ring-2 transition ${
                    sel ? "ring-primary" : selection.id === ph.id ? "ring-white/50" : "ring-transparent hover:ring-white/25"
                  }`}
                >
                  <Thumb assetId={ph.assetId} className={`h-full w-full object-cover ${inTl ? "" : "opacity-45 grayscale"}`} />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                    <button title="重点" onClick={(e) => { e.stopPropagation(); setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === ph.id ? { ...x, highlight: !x.highlight } : x)) })); }}
                      className="rounded p-1 text-white/80 hover:text-amber-300"><Star className="h-3.5 w-3.5" /></button>
                    <button title="编辑" onClick={(e) => { e.stopPropagation(); setSelection({ type: "photo", id: ph.id }); }}
                      className="rounded p-1 text-white/80 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                    <button title={inTl ? "从时间轴移除" : "加入时间轴"} onClick={(e) => { e.stopPropagation(); inTl ? removeFromTimeline([ph.id]) : addToTimeline([ph.id]); }}
                      className="rounded p-1 text-white/80 hover:text-primary">{inTl ? <Square className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}</button>
                    <button title="删除素材" onClick={(e) => { e.stopPropagation(); setConfirm({ title: "删除素材", desc: `将从素材库彻底删除「${ph.name}」，同时从时间轴移除。若只想让它不参与播放，请改用「从时间轴移除」。`, run: () => removePhotos([ph.id]) }); }}
                      className="rounded p-1 text-white/80 hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="absolute left-1 top-1 flex flex-wrap gap-1">
                    <span className={`rounded px-1 text-[9px] font-semibold ${inTl ? "bg-primary text-primary-foreground" : "bg-white/80 text-black"}`}>
                      {inTl ? "已在时间轴" : "未加入"}
                    </span>
                    {ph.highlight && <span className="rounded bg-amber-400/90 px-1 text-[9px] font-semibold text-black">主图</span>}
                    {ph.cover && <span className="rounded bg-sky-400/90 px-1 text-[9px] font-semibold text-black">封面</span>}
                    {(ph.caption || ph.title) && <span className="rounded bg-emerald-400/90 px-1 text-[9px] font-semibold text-black">解说</span>}
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-52">
                <ContextMenuItem onSelect={() => setSelection({ type: "photo", id: ph.id })}><Eye className="mr-2 h-3.5 w-3.5" />打开预览 / 编辑</ContextMenuItem>
                {inTl
                  ? <ContextMenuItem onSelect={() => removeFromTimeline([ph.id])}>从时间轴移除（保留素材）</ContextMenuItem>
                  : <ContextMenuItem onSelect={() => addToTimeline([ph.id])}>加入时间轴</ContextMenuItem>}
                <ContextMenuItem onSelect={() => setProject((p) => ({ ...p, photos: p.photos.map((x) => ({ ...x, cover: x.id === ph.id })) }))}>设为封面</ContextMenuItem>
                <ContextMenuItem onSelect={() => setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === ph.id ? { ...x, highlight: !x.highlight } : x)) }))}>设为重点照片</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onSelect={() => setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === ph.id ? { ...x, rotate: (x.rotate + 90) % 360 } : x)) }))}>旋转 90°</ContextMenuItem>
                <ContextMenuItem onSelect={() => setProject((p) => { const i = p.photos.findIndex((x) => x.id === ph.id); const copy = { ...ph, id: crypto.randomUUID() }; const arr = [...p.photos]; arr.splice(i + 1, 0, copy); return { ...p, photos: arr }; })}>复制片段</ContextMenuItem>
                <ContextMenuItem onSelect={() => { void assetUrl(ph.assetId).then((u) => { if (u) { const a = document.createElement("a"); a.href = u; a.download = ph.name; a.click(); } }); }}>
                  <Download className="mr-2 h-3.5 w-3.5" />下载原图
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-destructive" onSelect={() => setConfirm({ title: "删除素材", desc: `将从素材库彻底删除「${ph.name}」，同时从时间轴移除。若只想让它不参与播放，请改用「从时间轴移除」。`, run: () => removePhotos([ph.id]) })}>删除素材</ContextMenuItem>
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
  return <AnimationLibraryPanel />;
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

      <div className="space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div>
          <span className="text-xs font-medium text-white">主图展示方式</span>
          <p className="mt-0.5 text-[10px] text-white/40">在「图片」面板把某张照片设为「重点照片」，即成为该屏主图</p>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {([["grid", "网格内放大"], ["fullscreen", "全屏覆盖"], ["overlay", "全屏浮层"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => patchSettings({ heroMode: k })}
              className={`rounded-lg px-1.5 py-1.5 text-[11px] transition ${(s.heroMode ?? "fullscreen") === k ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-white/65 hover:bg-white/15"}`}>{l}</button>
          ))}
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] text-white/55">主图全屏适配</span>
          <div className="grid grid-cols-2 gap-1">
            {([["cover", "铺满屏幕（无黑边）"], ["contain", "完整显示（不裁切）"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => patchSettings({ heroFit: k })}
                className={`rounded-lg px-1.5 py-1.5 text-[11px] transition ${(s.heroFit ?? "cover") === k ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-white/65 hover:bg-white/15"}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] text-white/55">图片焦点位置（避免人脸被裁切）</span>
          <div className="grid grid-cols-3 gap-1">
            {([["center", "居中"], ["top", "顶部"], ["bottom", "底部"], ["left", "左侧"], ["right", "右侧"], ["custom", "自定义"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => patchSettings({ heroFocus: k })}
                className={`rounded-lg px-1.5 py-1 text-[11px] transition ${(s.heroFocus ?? "center") === k ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-white/65 hover:bg-white/15"}`}>{l}</button>
            ))}
          </div>
        </div>

        {(s.heroFit ?? "cover") === "contain" && (
          <div className="space-y-1.5">
            <span className="text-[11px] text-white/55">留白区域背景</span>
            <div className="grid grid-cols-4 gap-1">
              {([["blur", "同图模糊"], ["black", "纯色"], ["color", "主题色"], ["dim", "变暗"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => patchSettings({ heroBg: k })}
                  className={`rounded-lg px-1 py-1 text-[10px] transition ${(s.heroBg ?? "blur") === k ? "bg-primary text-primary-foreground" : "bg-white/[0.07] text-white/65 hover:bg-white/15"}`}>{l}</button>
              ))}
            </div>
          </div>
        )}

        <Field label={`进入全屏 ${(s.heroIn ?? 1).toFixed(1)}s`}>
          <Slider value={[s.heroIn ?? 1]} min={0.3} max={3} step={0.1} onValueChange={(v) => patchSettings({ heroIn: v[0] })} />
        </Field>
        <Field label={`全屏停留 ${(s.heroHold ?? 5).toFixed(1)}s`}>
          <Slider value={[s.heroHold ?? 5]} min={0} max={20} step={0.5} onValueChange={(v) => patchSettings({ heroHold: v[0] })} />
        </Field>
        <Field label={`退出全屏 ${(s.heroOut ?? 1).toFixed(1)}s`}>
          <Slider value={[s.heroOut ?? 1]} min={0.3} max={3} step={0.1} onValueChange={(v) => patchSettings({ heroOut: v[0] })} />
        </Field>
        <Field label={`其他缩略图变暗 ${Math.round((s.heroDim ?? 0.9) * 100)}%（100% = 完全隐藏）`}>
          <Slider value={[s.heroDim ?? 0.9]} min={0} max={1} step={0.05} onValueChange={(v) => patchSettings({ heroDim: v[0] })} />
        </Field>
        <p className="text-[10px] leading-relaxed text-white/35">
          主图全屏与统一 currentTime 同步：暂停会停在当前动画帧，拖动时间轴可看到对应的放大比例与位置；预览与 MP4 导出效果一致。
        </p>
      </div>
    </PanelShell>
  );
}


function PlayPanel() {
  const { project, patchSettings, timeline, time, setTime, playing, setPlaying } = useEditor();
  const s = project.settings;
  const perPage = timeline.pageCount ? (timeline.total - (s.openingText ? s.openingDuration : 0) - (s.endingText ? s.endingDuration : 0)) / timeline.pageCount : 0;
  return (
    <PanelShell title="播放" desc="编辑器内部预览控制 · 与底部时间轴同步">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-white">编辑器预览</span>
          <span className="tabular-nums text-[11px] text-white/55">{fmtTime(time)} / {fmtTime(timeline.total)}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <Button size="sm" onClick={() => setPlaying(true)} disabled={playing}>播放</Button>
          <Button size="sm" variant="secondary" onClick={() => setPlaying(false)} disabled={!playing}>暂停</Button>
          <Button size="sm" variant="secondary" onClick={() => { setPlaying(false); setTime(0); }}>停止</Button>
          <Button size="sm" variant="secondary" onClick={() => { setTime(0); setPlaying(true); }}>从头</Button>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2">
          <span className="text-xs">循环播放</span>
          <Switch checked={s.loop} onCheckedChange={(v) => patchSettings({ loop: v })} />
        </div>
        <p className="mt-2 text-[11px] text-white/40">仅在当前画布中播放，不会打开新页面；如需真实播放请使用顶部「真实预览」。</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant={s.timingMode === "perPhoto" ? "default" : "secondary"} size="sm" onClick={() => patchSettings({ timingMode: "perPhoto" })}>固定每张时间</Button>
        <Button variant={s.timingMode === "total" ? "default" : "secondary"} size="sm" onClick={() => patchSettings({ timingMode: "total" })}>指定总时长</Button>
      </div>
      {s.timingMode === "perPhoto" ? (
        <Field label={`停留时间：每个画面 ${s.perPhoto.toFixed(1)} 秒`}>
          <Slider value={[s.perPhoto]} min={1} max={20} step={0.5} onValueChange={(v) => patchSettings({ perPhoto: v[0] })} />
        </Field>
      ) : (
        <Field label="目标总时长（分钟）">
          <Input type="number" min={1} step={1} className={darkInput()} value={Math.round(s.totalTarget / 60)} onChange={(e) => patchSettings({ totalTarget: Math.max(1, Number(e.target.value)) * 60 })} />
        </Field>
      )}
      <Field label={`淡入 / 淡出（转场）${s.transition.toFixed(1)} 秒`}>
        <Slider value={[s.transition]} min={0.1} max={3} step={0.1} onValueChange={(v) => patchSettings({ transition: v[0] })} />
      </Field>
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

type ExportStage = "idle" | "prepare" | "render" | "encode" | "done";

interface ExportRecord {
  id: string;
  name: string;
  size: number;
  res: string;
  fps: number;
  at: number;
  blob: Blob;
}

function ExportPanel({ kick, format }: { kick?: number; format?: "mp4" | "webm" }) {
  const { project, images, timeline } = useEditor();
  const [res, setRes] = React.useState("1920x1080");
  const [fps, setFps] = React.useState("30");
  const [quality, setQuality] = React.useState("high");
  const [fmt, setFmt] = React.useState<"mp4" | "webm">(format ?? "mp4");
  const [source, setSource] = React.useState<"draft" | "published">("draft");
  const [withMusic, setWithMusic] = React.useState(true);
  const [withText, setWithText] = React.useState(true);
  const [loopOut, setLoopOut] = React.useState(false);
  const [rangeMode, setRangeMode] = React.useState<"all" | "custom">("all");
  const [from, setFrom] = React.useState(0);
  const [to, setTo] = React.useState(Math.round(timeline.total));
  const [stage, setStage] = React.useState<ExportStage>("idle");
  const [progress, setProgress] = React.useState<{ percent: number; remaining: number; bytes: number } | null>(null);
  const [records, setRecords] = React.useState<ExportRecord[]>([]);
  const cancelRef = React.useRef({ cancelled: false });
  const runningRef = React.useRef(false);
  const mime = pickMime(fmt);

  React.useEffect(() => { if (format) setFmt(format); }, [format]);

  const run = React.useCallback(async () => {
    if (runningRef.current) { toast.info("已有导出任务正在进行"); return; }
    const src = source === "published" ? ((project.publishedSnapshot as typeof project | null) ?? null) : project;
    if (!src) { toast.error("该项目尚未发布，无法导出已发布版"); return; }
    runningRef.current = true;
    const [w, h] = res.split("x").map(Number);
    const f = Number(fps);
    cancelRef.current = { cancelled: false };
    setStage("prepare");
    setProgress({ percent: 0, remaining: 0, bytes: 0 });
    const started = Date.now();
    try {
      setStage("render");
      const out = await exportVideo({
        project: { ...src, settings: { ...src.settings, loop: loopOut } },
        images, width: w, height: h, fps: f, format: fmt,
        includeMusic: withMusic, includeText: withText,
        rangeStart: rangeMode === "custom" ? from : 0,
        rangeEnd: rangeMode === "custom" ? to : undefined,
        videoBitrate: Math.round(w * h * f * (quality === "high" ? 0.12 : quality === "medium" ? 0.08 : 0.05)),
        signal: cancelRef.current,
        onProgress: (p) => setProgress({ percent: p.percent, remaining: p.remaining, bytes: p.bytes }),
      });
      setStage("encode");
      const rec: ExportRecord = {
        id: crypto.randomUUID(),
        name: `${project.name}.${out.ext}`,
        size: out.blob.size,
        res: `${w}×${h}`,
        fps: f,
        at: started,
        blob: out.blob,
      };
      setRecords((r) => [rec, ...r].slice(0, 10));
      setStage("done");
      toast.success("导出完成，可在下方下载");
    } catch (e) {
      setStage("idle");
      toast.error("导出失败：" + (e as Error).message);
    } finally {
      runningRef.current = false;
      setProgress(null);
    }
  }, [project, images, res, fps, fmt, quality, source, withMusic, withText, loopOut, rangeMode, from, to]);

  const lastKick = React.useRef(kick);
  React.useEffect(() => {
    if (kick && kick !== lastKick.current) {
      lastKick.current = kick;
      void run();
    }
  }, [kick, run]);

  const stages: { key: ExportStage; label: string }[] = [
    { key: "prepare", label: "准备素材" },
    { key: "render", label: "渲染" },
    { key: "encode", label: "编码" },
    { key: "done", label: "完成" },
  ];
  const stageIdx = stages.findIndex((s) => s.key === stage);

  return (
    <PanelShell title="导出" desc="导出参数 · 进度 · 历史记录">
      <Field label="导出格式">
        <Select value={fmt} onValueChange={(v) => setFmt(v as "mp4" | "webm")}>
          <SelectTrigger className={darkInput()}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mp4">MP4（H.264 / AAC）</SelectItem>
            <SelectItem value="webm">WebM（VP9 / Opus）</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="导出版本">
        <Select value={source} onValueChange={(v) => setSource(v as "draft" | "published")}>
          <SelectTrigger className={darkInput()}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">当前草稿版（默认）</SelectItem>
            <SelectItem value="published">已发布版</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="分辨率">
        <Select value={res} onValueChange={setRes}>
          <SelectTrigger className={darkInput()}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1920x1080">1920 × 1080（横屏）</SelectItem>
            <SelectItem value="1080x1920">1080 × 1920（竖屏）</SelectItem>
            <SelectItem value="1440x1080">1440 × 1080（4:3）</SelectItem>
            <SelectItem value="1280x720">1280 × 720</SelectItem>
            <SelectItem value="720x1280">720 × 1280</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="帧率">
          <Select value={fps} onValueChange={setFps}>
            <SelectTrigger className={darkInput()}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 FPS</SelectItem>
              <SelectItem value="30">30 FPS</SelectItem>
              <SelectItem value="60">60 FPS</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="视频质量">
          <Select value={quality} onValueChange={setQuality}>
            <SelectTrigger className={darkInput()}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="high">高码率</SelectItem>
              <SelectItem value="medium">标准</SelectItem>
              <SelectItem value="low">压缩优先</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <p className="rounded-xl bg-white/[0.05] p-3 text-[11px] text-white/55">
        视频编码：{mime.ext === "mp4" ? "H.264 (avc1)" : "VP9"} · 音频编码：{mime.ext === "mp4" ? "AAC" : "Opus"} · 实际输出：
        <span className="font-medium text-white"> {mime.ext.toUpperCase()}</span>
        {fmt === "mp4" && mime.ext !== "mp4" && "（此浏览器不支持 MP4 直录，将输出 WebM，建议使用 Chrome）"}
      </p>

      {[["含背景音乐", withMusic, setWithMusic], ["含文字图层", withText, setWithText], ["导出循环标记", loopOut, setLoopOut]].map(([l, v, set]) => (
        <div key={l as string} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2">
          <span className="text-xs">{l as string}</span>
          <Switch checked={v as boolean} onCheckedChange={set as (b: boolean) => void} />
        </div>
      ))}

      <Field label="导出范围">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant={rangeMode === "all" ? "default" : "secondary"} onClick={() => setRangeMode("all")}>全部时间轴</Button>
          <Button size="sm" variant={rangeMode === "custom" ? "default" : "secondary"} onClick={() => setRangeMode("custom")}>自定义范围</Button>
        </div>
      </Field>
      {rangeMode === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="起始（秒）"><Input type="number" className={darkInput()} value={from} onChange={(e) => setFrom(Math.max(0, Number(e.target.value)))} /></Field>
          <Field label="结束（秒）"><Input type="number" className={darkInput()} value={to} onChange={(e) => setTo(Number(e.target.value))} /></Field>
        </div>
      )}

      {stage !== "idle" && (
        <div className="space-y-2 rounded-2xl bg-white/[0.05] p-3">
          <div className="flex justify-between text-[10px]">
            {stages.map((s, i) => (
              <span key={s.key} className={i <= stageIdx ? "text-primary" : "text-white/35"}>{s.label}</span>
            ))}
          </div>
          <Progress value={progress?.percent ?? (stage === "done" ? 100 : 0)} />
          {progress && (
            <div className="flex justify-between text-[11px] text-white/60">
              <span>{progress.percent.toFixed(1)}%</span>
              <span>剩余 {fmtTime(progress.remaining)} · {(progress.bytes / 1048576).toFixed(1)} MB</span>
            </div>
          )}
          {progress && <Button variant="secondary" className="w-full" onClick={() => (cancelRef.current.cancelled = true)}>取消导出</Button>}
        </div>
      )}

      <Button className="w-full gap-2" onClick={() => void run()} disabled={!project.photos.length || Boolean(progress)}>
        <Download className="h-4 w-4" /> {progress ? "正在导出…" : "开始导出"}
      </Button>

      <div className="space-y-1.5">
        <p className="text-[11px] text-white/45">导出记录</p>
        {records.length === 0 && <p className="text-[11px] text-white/25">暂无导出记录。</p>}
        {records.map((r) => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="truncate text-xs text-white">{r.name}</div>
            <div className="mt-0.5 text-[10px] text-white/45">
              {(r.size / 1048576).toFixed(1)} MB · {r.res} · {r.fps} FPS · {new Date(r.at).toLocaleString()}
            </div>
            <Button size="sm" variant="secondary" className="mt-2 w-full gap-1" onClick={() => downloadBlob(r.blob, r.name)}>
              <Download className="h-3.5 w-3.5" /> 下载
            </Button>
          </div>
        ))}
      </div>
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

export function LeftPanel({ panel, exportKick, exportFormat }: { panel: PanelKey; exportKick?: number; exportFormat?: "mp4" | "webm" }) {
  switch (panel) {
    case "project": return <ProjectPanel />;
    case "images": return <ImagesPanel />;
    case "templates": return <TemplatesPanel />;
    case "text": return <TextPanel />;
    case "music": return <MusicPanel />;
    case "animation": return <AnimationPanel />;
    case "layout": return <LayoutPanel />;
    case "play": return <PlayPanel />;
    case "export": return <ExportPanel kick={exportKick} format={exportFormat} />;
    case "settings": return <SettingsPanel />;
    default: return null;
  }
}
