import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft, Undo2, Redo2, PlayCircle, Save, Upload as PublishIcon, Download, X, PanelLeftClose, PanelLeftOpen,
  Ruler, Grid2x2, Loader2, Check, AlertCircle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ASPECTS, type PWProject, type PWSettings } from "@/lib/photowall/types";
import { buildTimeline } from "@/lib/photowall/render";
import { saveProject } from "@/lib/photowall/store";
import { createAudioController, type AudioController } from "@/lib/photowall/audio";
import { EditorCtx, useImages, type Selection } from "./ctx";
import { RAIL, type PanelKey } from "./rail";
import { LeftPanel } from "./LeftPanels";
import { PreviewCanvas } from "./PreviewCanvas";
import { PlaybackBar } from "./PlaybackBar";
import { Inspector } from "./Inspector";
import { Timeline } from "./Timeline";

type SaveState = "idle" | "saving" | "saved" | "error";

export function StudioEditor({ initial }: { initial: PWProject }) {
  const navigate = useNavigate();
  const [project, setProjectRaw] = React.useState<PWProject>(initial);
  const [past, setPast] = React.useState<PWProject[]>([]);
  const [future, setFuture] = React.useState<PWProject[]>([]);
  const [panel, setPanel] = React.useState<PanelKey>("images");
  const [collapsed, setCollapsed] = React.useState(false);
  const [selection, setSelection] = React.useState<Selection>({ type: null, id: null });
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [time, setTime] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [showGrid, setShowGrid] = React.useState(false);
  const [showSafe, setShowSafe] = React.useState(false);
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [exportKick, setExportKick] = React.useState(0);
  const [exportFormat, setExportFormat] = React.useState<"mp4" | "webm">("mp4");

  const { images } = useImages(project);
  const timeline = React.useMemo(() => buildTimeline(project), [project]);


  const setProject = React.useCallback(
    (updater: (p: PWProject) => PWProject, opts?: { history?: boolean }) => {
      setProjectRaw((prev) => {
        if (opts?.history !== false) {
          setPast((h) => [...h.slice(-49), prev]);
          setFuture([]);
        }
        return updater(prev);
      });
    },
    [],
  );

  const patchSettings = React.useCallback(
    (s: Partial<PWSettings>) => setProject((p) => ({ ...p, settings: { ...p.settings, ...s } })),
    [setProject],
  );

  /* 自动保存 */
  const firstRef = React.useRef(true);
  React.useEffect(() => {
    if (firstRef.current) { firstRef.current = false; return; }
    setSaveState("saving");
    const t = setTimeout(() => {
      saveProject(project)
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, 900);
    return () => clearTimeout(t);
  }, [project]);

  /* 播放循环 */
  React.useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime((t) => {
        const next = t + dt;
        if (next >= timeline.total) {
          if (project.settings.loop) return 0;
          setPlaying(false);
          return timeline.total;
        }
        return next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, timeline.total, project.settings.loop]);

  /* 快捷键 */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a" && panel === "images") {
        e.preventDefault();
        setSelectedIds(project.photos.map((p) => p.id));
      } else if (e.code === "Space") {
        e.preventDefault();
        setPlaying((v) => !v);
      }

    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function undo() {
    setPast((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [project, ...f]);
      setProjectRaw(prev);
      return h.slice(0, -1);
    });
  }
  function redo() {
    setFuture((f) => {
      if (!f.length) return f;
      setPast((h) => [...h, project]);
      setProjectRaw(f[0]);
      return f.slice(1);
    });
  }

  const api = {
    project, setProject, patchSettings, images, reloadImages: () => {},
    timeline, time, setTime, playing, setPlaying, selection, setSelection, selectedIds, setSelectedIds,
  };

  return (
    <EditorCtx.Provider value={api}>
      <TooltipProvider delayDuration={200}>
        <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#0e1117]">
          {/* 顶部工具栏 */}
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#12151c] px-3 text-white">
            <Button variant="ghost" size="sm" className="gap-1 text-white/70 hover:bg-white/10 hover:text-white" onClick={() => navigate({ to: "/tools/photo-wall" })}>
              <ChevronLeft className="h-4 w-4" /> 返回
            </Button>
            <Input
              value={project.name}
              onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))}
              className="h-8 w-56 border-transparent bg-transparent text-sm font-semibold text-white hover:border-white/15 focus-visible:border-white/25"
            />
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${project.status === "published" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/55"}`}>
              {project.status === "published" ? "已发布" : "草稿"}
            </span>

            <div className="flex items-center gap-1.5">
              <IconBtn tip="撤销" onClick={undo} disabled={!past.length}><Undo2 className="h-4 w-4" /></IconBtn>
              <IconBtn tip="重做" onClick={redo} disabled={!future.length}><Redo2 className="h-4 w-4" /></IconBtn>
              <Button
                variant="secondary" size="sm" className="gap-1"
                onClick={async () => {
                  setPlaying(false);
                  setSaveState("saving");
                  try {
                    await saveProject(project);
                    setSaveState("saved");
                  } catch { setSaveState("error"); }
                  window.open(`/display/photo-wall-preview/${project.id}`, "_blank", "noopener");
                }}
              >
                <PlayCircle className="h-4 w-4" /> 真实预览
              </Button>

              <div className="mx-1 flex rounded-lg bg-white/[0.06] p-0.5">
                {(Object.keys(ASPECTS) as (keyof typeof ASPECTS)[]).map((k) => (
                  <button key={k} onClick={() => setProject((p) => ({ ...p, aspect: k }))}
                    className={`rounded-md px-2 py-1 text-[11px] transition ${project.aspect === k ? "bg-primary text-white" : "text-white/55 hover:text-white"}`}>{k}</button>
                ))}
              </div>
              <div className="flex w-28 items-center gap-2">
                <Slider value={[zoom]} min={0.2} max={2} step={0.05} onValueChange={(v) => setZoom(v[0])} />
                <span className="w-9 text-[11px] tabular-nums text-white/50">{Math.round(zoom * 100)}%</span>
              </div>
              <IconBtn tip="网格辅助线" active={showGrid} onClick={() => setShowGrid((v) => !v)}><Grid2x2 className="h-4 w-4" /></IconBtn>
              <IconBtn tip="安全区域" active={showSafe} onClick={() => setShowSafe((v) => !v)}><Ruler className="h-4 w-4" /></IconBtn>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-white/50">
                {saveState === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> 正在保存</>}
                {saveState === "saved" && <><Check className="h-3 w-3 text-emerald-400" /> 已保存</>}
                {saveState === "error" && <><AlertCircle className="h-3 w-3 text-rose-400" /> 保存失败</>}
              </span>
              <Button variant="ghost" size="sm" className="gap-1 text-white/75 hover:bg-white/10 hover:text-white"
                onClick={() => { setSaveState("saving"); saveProject(project).then(() => { setSaveState("saved"); toast.success("草稿已保存"); }).catch(() => setSaveState("error")); }}>
                <Save className="h-4 w-4" /> 保存
              </Button>
              <Button size="sm" className="gap-1"
                onClick={() => { setProject((p) => ({ ...p, status: "published" })); toast.success("已发布，可在最近项目中播放"); }}>
                <PublishIcon className="h-4 w-4" /> 发布
              </Button>
              <Button variant="secondary" size="sm" className="gap-1" onClick={() => setPanel("export")}>
                <Download className="h-4 w-4" /> 导出 MP4
              </Button>
              <IconBtn tip="关闭" onClick={() => navigate({ to: "/tools/photo-wall" })}><X className="h-4 w-4" /></IconBtn>
            </div>
          </header>

          {/* 主体 */}
          <div className="flex min-h-0 flex-1">
            {/* 左侧图标栏 */}
            <nav className="flex w-[68px] shrink-0 flex-col items-center gap-1 border-r border-white/10 bg-[#12151c] py-3">
              {RAIL.map((r) => {
                const Icon = r.icon;
                const active = panel === r.key && !collapsed;
                return (
                  <button key={r.key} onClick={() => { setPanel(r.key); setCollapsed(false); }}
                    className={`flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[10px] transition ${active ? "bg-primary/20 text-primary" : "text-white/50 hover:bg-white/[0.07] hover:text-white"}`}>
                    <Icon className="h-[18px] w-[18px]" />
                    {r.label}
                  </button>
                );
              })}
              <button onClick={() => setCollapsed((v) => !v)} className="mt-auto rounded-xl p-2 text-white/40 hover:bg-white/10 hover:text-white">
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </nav>

            {/* 左侧面板 */}
            {!collapsed && (
              <div className="w-[320px] shrink-0 overflow-hidden border-r border-white/10 bg-[#151922]">
                <LeftPanel panel={panel} />
              </div>
            )}

            {/* 画布 + 时间轴 */}
            <div className="flex min-w-0 flex-1 flex-col">
              <PreviewCanvas zoom={zoom} setZoom={setZoom} showGrid={showGrid} showSafe={showSafe} />
              <TimelineBar />
            </div>

            {/* 右侧属性面板 */}
            <Inspector />
          </div>

          {previewMode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" onClick={() => setPreviewMode(false)}>
              <div className="w-full max-w-[92vw]">
                <PreviewCanvas zoom={1.7} setZoom={() => {}} showGrid={false} showSafe={false} />
              </div>
              <span className="absolute bottom-6 text-xs text-white/40">点击任意处或按 Esc 退出预览</span>
            </div>
          )}
        </div>
      </TooltipProvider>
    </EditorCtx.Provider>
  );
}

function IconBtn({
  children, tip, onClick, disabled, active,
}: { children: React.ReactNode; tip: string; onClick?: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost" size="icon" onClick={onClick} disabled={disabled}
          className={`h-8 w-8 ${active ? "bg-primary/20 text-primary" : "text-white/65"} hover:bg-white/10 hover:text-white`}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}
