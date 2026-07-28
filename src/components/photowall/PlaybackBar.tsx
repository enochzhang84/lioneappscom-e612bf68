import * as React from "react";
import { fmtTime, segmentAt } from "@/lib/photowall/render";
import { useEditor } from "./ctx";

export function PlaybackBar() {
  const { project, timeline, time, setTime, playing } = useEditor();
  const total = timeline.total;
  const seg = segmentAt(timeline, time);
  const pageSegs = timeline.segments.filter((s) => s.kind === "page");
  const idx = seg && seg.kind === "page" ? pageSegs.indexOf(seg) : -1;
  const photo = seg?.photos[0];

  const status = playing ? "播放中" : time <= 0 ? "未播放" : time >= total - 0.05 ? "已结束" : "已暂停";
  const barRef = React.useRef<HTMLDivElement>(null);

  function seek(e: React.PointerEvent) {
    const el = barRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const go = (clientX: number) => setTime(Math.min(total, Math.max(0, ((clientX - r.left) / r.width) * total)));
    go(e.clientX);
    const move = (ev: PointerEvent) => go(ev.clientX);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div className="shrink-0 border-t border-white/10 bg-[#0e1117] px-4 py-2 text-white">
      <div ref={barRef} onPointerDown={seek} className="group h-1.5 w-full cursor-pointer rounded-full bg-white/10">
        <div className="relative h-full rounded-full bg-primary" style={{ width: `${(time / total) * 100}%` }}>
          <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-white opacity-0 transition group-hover:opacity-100" />
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/55">
        <span className="tabular-nums text-white/85">{fmtTime(time)} / {fmtTime(total)}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] ${playing ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/60"}`}>{status}</span>
        <span>
          {seg?.kind === "opening" ? "开场画面" : seg?.kind === "ending" ? "结束画面" : `第 ${idx + 1} / ${pageSegs.length} 张`}
        </span>
        <span className="min-w-0 truncate text-white/45">{photo?.name ?? project.name}</span>
      </div>
    </div>
  );
}
