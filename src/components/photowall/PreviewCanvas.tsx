import * as React from "react";
import { ASPECTS } from "@/lib/photowall/types";
import { drawFrame } from "@/lib/photowall/render";
import { useEditor } from "./ctx";
import { cn } from "@/lib/utils";

export function PreviewCanvas({
  zoom,
  setZoom,
  showGrid,
  showSafe,
}: {
  zoom: number;
  setZoom: (z: number) => void;
  showGrid: boolean;
  showSafe: boolean;
}) {
  const { project, timeline, images, time } = useEditor();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const dragRef = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const dim = ASPECTS[project.aspect];

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = dim.w;
    c.height = dim.h;
    drawFrame(ctx, project, timeline, images, time, dim.w, dim.h);
  }, [project, timeline, images, time, dim.w, dim.h]);

  function onWheel(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 2) return;
    e.preventDefault();
    const next = Math.min(3, Math.max(0.15, zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
    setZoom(Number(next.toFixed(3)));
  }

  return (
    <div
      ref={wrapRef}
      onWheel={onWheel}
      onMouseDown={(e) => {
        dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      }}
      onMouseMove={(e) => {
        const d = dragRef.current;
        if (!d) return;
        setPan({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) });
      }}
      onMouseUp={() => (dragRef.current = null)}
      onMouseLeave={() => (dragRef.current = null)}
      onDoubleClick={() => {
        setPan({ x: 0, y: 0 });
        setZoom(1);
      }}
      className="relative flex-1 overflow-hidden bg-[#0a0c11] cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,.045) 1px, transparent 0)",
        backgroundSize: "22px 22px",
      }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transform: `translate(-50%,-50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <div
          className="relative rounded-2xl overflow-hidden shadow-[0_30px_90px_-20px_rgba(0,0,0,.85)] ring-1 ring-white/10"
          style={{ width: dim.w / 2.6, height: dim.h / 2.6 }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" />
          {showSafe && (
            <div className="pointer-events-none absolute inset-[7%] rounded-lg border border-dashed border-sky-300/40" />
          )}
          {showGrid && (
            <div className="pointer-events-none absolute inset-0">
              {[1, 2].map((i) => (
                <React.Fragment key={i}>
                  <div className="absolute top-0 bottom-0 border-l border-white/15" style={{ left: `${(i * 100) / 3}%` }} />
                  <div className="absolute left-0 right-0 border-t border-white/15" style={{ top: `${(i * 100) / 3}%` }} />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {project.photos.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm text-white/45">
          还没有图片 — 在左侧「图片」面板拖拽上传，即可实时生成照片墙
        </div>
      )}

      <div className={cn("absolute right-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[11px] text-white/70 backdrop-blur")}>
        {dim.w}×{dim.h} · {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
