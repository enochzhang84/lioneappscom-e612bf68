import * as React from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { fmtTime } from "@/lib/photowall/render";
import { useEditor } from "./ctx";
import { Button } from "@/components/ui/button";

export function TimelineBar() {
  const { project, timeline, time, setTime, playing, setPlaying, setSelection } = useEditor();
  const trackRef = React.useRef<HTMLDivElement>(null);
  const total = timeline.total;

  function seekFromEvent(e: React.MouseEvent | MouseEvent) {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, ((e as MouseEvent).clientX - r.left) / r.width));
    setTime(p * total);
  }

  return (
    <div className="border-t border-white/10 bg-[#12151c] px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setTime(0)}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setPlaying(!playing)}
            aria-label={playing ? "暂停" : "播放"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10" onClick={() => setTime(total)}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        <div className="tabular-nums text-xs text-white/70">
          {fmtTime(time)} <span className="text-white/30">/</span> {fmtTime(total)}
        </div>
        <div className="ml-auto text-[11px] text-white/45">
          {project.photos.length} 张图片 · {timeline.pageCount} 个画面 · {project.music.length} 首音乐
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative mt-3 cursor-pointer select-none"
        onMouseDown={(e) => {
          seekFromEvent(e);
          const move = (ev: MouseEvent) => seekFromEvent(ev);
          const up = () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
          };
          window.addEventListener("mousemove", move);
          window.addEventListener("mouseup", up);
        }}
      >
        {/* 图片轨 */}
        <div className="flex h-9 gap-[2px] overflow-hidden rounded-lg bg-white/[0.04] p-[3px]">
          {timeline.segments.map((s, i) => {
            const w = ((s.end - s.start) / total) * 100;
            const active = time >= s.start && time < s.end;
            return (
              <div
                key={i}
                style={{ width: `${w}%` }}
                onClick={() => {
                  const first = s.photos[0];
                  if (first) setSelection({ type: "photo", id: first.id });
                }}
                className={`flex min-w-[2px] items-center justify-center overflow-hidden rounded-md text-[10px] transition ${
                  s.kind === "opening"
                    ? "bg-emerald-500/30 text-emerald-100"
                    : s.kind === "ending"
                      ? "bg-rose-500/30 text-rose-100"
                      : active
                        ? "bg-primary/70 text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {s.kind === "opening" ? "开场" : s.kind === "ending" ? "结束" : w > 4 ? `#${s.index + 1}` : ""}
              </div>
            );
          })}
        </div>

        {/* 音乐轨 */}
        <div className="mt-1 flex h-4 gap-[2px] rounded-lg bg-white/[0.04] p-[3px]">
          {project.music.length === 0 ? (
            <div className="flex-1 rounded text-center text-[9px] leading-[10px] text-white/25">音乐轨（空）</div>
          ) : (
            project.music.map((m) => (
              <div key={m.id} className="flex-1 truncate rounded bg-violet-500/40 px-2 text-[9px] leading-[10px] text-white/85">
                {m.name}
              </div>
            ))
          )}
        </div>

        {/* 播放头 */}
        <div className="pointer-events-none absolute -top-1 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,.7)]" style={{ left: `${(time / total) * 100}%` }}>
          <div className="-ml-[5px] h-3 w-3 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
