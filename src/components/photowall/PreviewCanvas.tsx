import * as React from "react";
import { ASPECTS } from "@/lib/photowall/types";
import { drawFrame, textBox } from "@/lib/photowall/render";
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
  const { project, timeline, images, time, selection, setSelection, setProject } = useEditor();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const dragRef = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draftText, setDraftText] = React.useState("");
  const [, force] = React.useReducer((n: number) => n + 1, 0);

  const dim = ASPECTS[project.aspect];
  const stageW = dim.w / 2.6;
  const stageH = dim.h / 2.6;

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = dim.w;
    c.height = dim.h;
    drawFrame(ctx, project, timeline, images, time, dim.w, dim.h);
    force();
  }, [project, timeline, images, time, dim.w, dim.h]);

  /** 当前时间点可见的文字（含包围盒，转换为舞台像素） */
  const visibleTexts = React.useMemo(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!ctx) return [];
    const k = stageW / dim.w;
    return project.texts
      .filter((t) => !t.hidden && time >= t.start && time <= t.start + t.duration)
      .map((t) => {
        const b = textBox(ctx, t, dim.w, dim.h);
        return { t, x: b.x * k, y: b.y * k, w: b.w * k, h: b.h * k, rot: t.rotate ?? 0 };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.texts, time, dim.w, dim.h, stageW]);

  function startMove(e: React.PointerEvent, id: string, mode: "move" | "scale" | "rotate") {
    e.stopPropagation();
    e.preventDefault();
    setSelection({ type: "text", id });
    const tx = project.texts.find((t) => t.id === id);
    if (!tx) return;
    const rect = stageRef.current?.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const base = { x: tx.x ?? 0.5, y: tx.y ?? 0.5, scale: tx.scale ?? 1, rotate: tx.rotate ?? 0 };
    const cxPx = (rect?.left ?? 0) + (tx.x ?? 0.5) * (rect?.width ?? stageW);
    const cyPx = (rect?.top ?? 0) + (tx.y ?? 0.5) * (rect?.height ?? stageH);

    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / ((rect?.width ?? stageW) || 1);
      const dy = (ev.clientY - startY) / ((rect?.height ?? stageH) || 1);
      setProject((p) => ({
        ...p,
        texts: p.texts.map((t) => {
          if (t.id !== id) return t;
          if (mode === "move") {
            const snap = (v: number) => (Math.abs(v - 0.5) < 0.012 ? 0.5 : Number(v.toFixed(4)));
            return { ...t, x: snap(Math.min(1, Math.max(0, base.x + dx))), y: snap(Math.min(1, Math.max(0, base.y + dy))) };
          }
          if (mode === "scale") {
            const s = Math.min(4, Math.max(0.2, base.scale * (1 + (dx + dy) * 1.6)));
            return { ...t, scale: Number(s.toFixed(3)) };
          }
          const ang = (Math.atan2(ev.clientY - cyPx, ev.clientX - cxPx) * 180) / Math.PI + 90;
          const snapped = Math.abs(ang % 15) < 3 ? Math.round(ang / 15) * 15 : ang;
          return { ...t, rotate: Number(snapped.toFixed(1)) };
        }),
      }), { history: false });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setProject((p) => ({ ...p }));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function commitEdit() {
    if (!editing) return;
    const id = editing;
    const val = draftText;
    setProject((p) => ({ ...p, texts: p.texts.map((t) => (t.id === id ? { ...t, text: val } : t)) }));
    setEditing(null);
  }

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
          ref={stageRef}
          className="relative rounded-2xl overflow-hidden shadow-[0_30px_90px_-20px_rgba(0,0,0,.85)] ring-1 ring-white/10"
          style={{ width: stageW, height: stageH }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" />

          {/* 文字交互层：单击选中 · 拖拽移动 · 双击编辑 · 手柄缩放/旋转 */}
          <div className="absolute inset-0">
            {visibleTexts.map(({ t, x, y, w, h, rot }) => {
              const sel = selection.type === "text" && selection.id === t.id;
              return (
                <div
                  key={t.id}
                  onPointerDown={(e) => startMove(e, t.id, "move")}
                  onDoubleClick={(e) => { e.stopPropagation(); setEditing(t.id); setDraftText(t.text); }}
                  className={cn(
                    "absolute cursor-move",
                    sel ? "outline outline-1 outline-sky-400" : "hover:outline hover:outline-1 hover:outline-white/35",
                  )}
                  style={{ left: x, top: y, width: Math.max(12, w), height: Math.max(10, h), transform: `rotate(${rot}deg)` }}
                  title="拖拽移动 · 双击编辑文字"
                >
                  {sel && (
                    <>
                      <div
                        onPointerDown={(e) => startMove(e, t.id, "scale")}
                        className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-sm border border-sky-300 bg-white"
                      />
                      <div
                        onPointerDown={(e) => startMove(e, t.id, "rotate")}
                        className="absolute -top-5 left-1/2 h-3 w-3 -translate-x-1/2 cursor-grab rounded-full border border-sky-300 bg-white"
                      />
                    </>
                  )}
                </div>
              );
            })}

            {editing && (() => {
              const cur = visibleTexts.find((v) => v.t.id === editing);
              if (!cur) return null;
              return (
                <textarea
                  autoFocus
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditing(null);
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitEdit();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute z-10 resize-none rounded border border-sky-400 bg-black/80 p-1 text-center text-[12px] leading-tight text-white outline-none"
                  style={{ left: cur.x, top: cur.y, width: Math.max(120, cur.w), height: Math.max(28, cur.h) }}
                />
              );
            })()}
          </div>

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
