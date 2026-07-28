import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, X, Loader2, RotateCcw } from "lucide-react";
import { ASPECTS, type PWProject } from "@/lib/photowall/types";
import { buildTimeline, drawFrame, fmtTime, segmentAt } from "@/lib/photowall/render";
import { getProject, assetUrl } from "@/lib/photowall/store";
import { createAudioController, type AudioController } from "@/lib/photowall/audio";
import type { ImageMap } from "@/lib/photowall/render";

export const Route = createFileRoute("/display/photo-wall-preview/$id")({
  head: () => ({
    meta: [
      { title: "照片墙播放 — Photo Wall Studio | Lione Apps" },
      { name: "description", content: "全屏播放照片墙项目：照片、文字、动画与背景音乐按项目配置完整呈现。" },
      { property: "og:title", content: "照片墙播放 — Photo Wall Studio" },
      { property: "og:description", content: "全屏播放照片墙项目。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DisplayPage,
});

function DisplayPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const wantDraft = search.get("v") === "draft";

  const [project, setProject] = React.useState<PWProject | null>(null);
  const [missing, setMissing] = React.useState<string | null>(null);
  const [images, setImages] = React.useState<ImageMap>(new Map());
  const [time, setTime] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [full, setFull] = React.useState(false);
  const [uiVisible, setUiVisible] = React.useState(true);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const audioRef = React.useRef<AudioController | null>(null);
  const hideTimer = React.useRef<number | null>(null);

  /* 载入项目：默认已发布版本，?v=draft 载入草稿 */
  React.useEffect(() => {
    let ok = true;
    getProject(id).then((p) => {
      if (!ok) return;
      if (!p) { setMissing("项目不存在或已被删除。"); return; }
      const snap = p.publishedSnapshot as PWProject | null | undefined;
      if (!wantDraft && !snap) { setMissing("该项目尚未发布，请先在编辑器中点击「发布」。"); return; }
      setProject(wantDraft ? p : ({ ...(snap as PWProject), id: p.id }));
    });
    return () => { ok = false; };
  }, [id, wantDraft]);

  const timeline = React.useMemo(() => (project ? buildTimeline(project) : null), [project]);
  const dim = project ? ASPECTS[project.aspect] : ASPECTS["16:9"];

  /* 载入图片 */
  React.useEffect(() => {
    if (!project) return;
    let ok = true;
    (async () => {
      const map: ImageMap = new Map();
      await Promise.all(
        project.photos.map(async (ph) => {
          const url = await assetUrl(ph.assetId);
          if (!url) return;
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => { map.set(ph.assetId, img); resolve(); };
            img.onerror = () => resolve();
            img.src = url;
          });
        }),
      );
      if (ok) setImages(map);
    })();
    return () => { ok = false; };
  }, [project]);

  /* 音乐 */
  React.useEffect(() => {
    if (!project) return;
    let disposed = false;
    createAudioController(project).then((c) => {
      if (disposed) { c.dispose(); return; }
      audioRef.current = c;
    });
    return () => {
      disposed = true;
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, [project]);

  /* 播放循环 */
  React.useEffect(() => {
    if (!playing || !timeline || !project) return;
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
  }, [playing, timeline, project]);

  React.useEffect(() => { audioRef.current?.sync(time, playing); }, [time, playing]);

  /* 绘制 */
  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c || !project || !timeline) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    if (c.width !== dim.w) c.width = dim.w;
    if (c.height !== dim.h) c.height = dim.h;
    drawFrame(ctx, project, timeline, images, time, dim.w, dim.h);
  }, [project, timeline, images, time, dim.w, dim.h]);

  /* 控制条自动淡出 */
  const poke = React.useCallback(() => {
    setUiVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setUiVisible(false), 10000);
  }, []);
  React.useEffect(() => {
    poke();
    window.addEventListener("mousemove", poke);
    return () => {
      window.removeEventListener("mousemove", poke);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [poke]);

  const step = React.useCallback(
    (dir: 1 | -1) => {
      if (!timeline) return;
      const segs = timeline.segments;
      const cur = segmentAt(timeline, time);
      const i = cur ? segs.indexOf(cur) : 0;
      const next = segs[Math.min(segs.length - 1, Math.max(0, i + dir))];
      if (next) setTime(next.start + 0.001);
    },
    [timeline, time],
  );

  /* 快捷键 */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setPlaying((v) => !v); poke(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); poke(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); poke(); }
      else if (e.key === "Escape" && document.fullscreenElement) void document.exitFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, poke]);

  React.useEffect(() => {
    const onFs = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  function toggleFull() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  }

  if (missing) {
    return (
      <div className="grid h-[100dvh] place-items-center bg-black text-center text-white/70">
        <div>
          <p className="text-sm">{missing}</p>
          <button className="mt-3 text-sm text-primary underline" onClick={() => navigate({ to: "/tools/photo-wall" })}>
            返回照片墙工作室
          </button>
        </div>
      </div>
    );
  }

  if (!project || !timeline) {
    return (
      <div className="grid h-[100dvh] place-items-center bg-black">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const seg = segmentAt(timeline, time);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black" onClick={poke}>
      <div className="flex h-full w-full items-center justify-center">
        <canvas
          ref={canvasRef}
          className="max-h-full max-w-full"
          style={{ aspectRatio: `${dim.w} / ${dim.h}`, width: "100%", height: "auto", maxHeight: "100dvh", objectFit: "contain" }}
        />
      </div>

      <div
        className={`absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1.5 backdrop-blur transition-opacity duration-500 ${
          uiVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <CtrlBtn label="上一张" onClick={() => step(-1)}><SkipBack className="h-4 w-4" /></CtrlBtn>
        <CtrlBtn label={playing ? "暂停" : "播放"} onClick={() => setPlaying((v) => !v)}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </CtrlBtn>
        <CtrlBtn label="下一张" onClick={() => step(1)}><SkipForward className="h-4 w-4" /></CtrlBtn>
        <CtrlBtn label="从头播放" onClick={() => { setTime(0); setPlaying(true); }}><RotateCcw className="h-4 w-4" /></CtrlBtn>
        <span className="px-2 text-[11px] tabular-nums text-white/70">
          {fmtTime(time)} / {fmtTime(timeline.total)}
        </span>
        <CtrlBtn label={full ? "退出全屏" : "全屏"} onClick={toggleFull}>
          {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </CtrlBtn>
        <CtrlBtn label="关闭" onClick={() => window.close()}><X className="h-4 w-4" /></CtrlBtn>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 h-1 bg-white/10 transition-opacity duration-500 ${uiVisible ? "opacity-100" : "opacity-0"}`}
      >
        <div className="h-full bg-primary" style={{ width: `${(time / timeline.total) * 100}%` }} />
      </div>

      <div className={`absolute bottom-4 left-4 text-[11px] text-white/45 transition-opacity duration-500 ${uiVisible ? "opacity-100" : "opacity-0"}`}>
        {wantDraft ? "草稿版" : "已发布版"} · {seg?.kind === "opening" ? "开场" : seg?.kind === "ending" ? "结束" : `第 ${(seg?.index ?? 0) + 1} / ${timeline.pageCount} 屏`} · 空格播放/暂停 · ←→ 切换 · Esc 退出全屏
      </div>
    </div>
  );
}

function CtrlBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="rounded-full p-1.5 text-white/75 transition hover:bg-white/15 hover:text-white"
    >
      {children}
    </button>
  );
}
