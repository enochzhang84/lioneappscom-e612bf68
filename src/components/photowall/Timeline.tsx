import * as React from "react";
import { Play, Pause, Square, SkipBack, Magnet, ChevronDown, ChevronUp, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { fmtTime } from "@/lib/photowall/render";
import { defaultTimelineState } from "@/lib/photowall/types";
import { assetUrl } from "@/lib/photowall/store";
import { useEditor } from "./ctx";

const LABEL_W = 104;
const ROW_H = 56;

function Thumb({ assetId }: { assetId: string }) {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let ok = true;
    assetUrl(assetId).then((u) => ok && setUrl(u));
    return () => { ok = false; };
  }, [assetId]);
  return url ? <img src={url} alt="" className="h-8 w-8 shrink-0 rounded object-cover" /> : <div className="h-8 w-8 shrink-0 rounded bg-white/10" />;
}

export function Timeline() {
  const { project, setProject, patchSettings, timeline, time, setTime, playing, setPlaying, selection, setSelection } = useEditor();
  const ts = project.timeline ?? defaultTimelineState();
  const total = timeline.total;
  const scale = ts.timelineScale;
  const width = Math.max(400, total * scale);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const laneRef = React.useRef<HTMLDivElement>(null);

  const patchTs = React.useCallback(
    (patch: Partial<typeof ts>) =>
      setProject((p) => ({ ...p, timeline: { ...(p.timeline ?? defaultTimelineState()), ...patch } }), { history: false }),
    [setProject],
  );

  /* 记录当前时间到项目（节流保存由编辑器统一处理） */
  React.useEffect(() => {
    const t = setTimeout(() => patchTs({ currentTime: time }), 800);
    return () => clearTimeout(t);
  }, [time, patchTs]);

  const snap = (v: number) => (ts.snap ? Math.round(v * 2) / 2 : Math.round(v * 100) / 100);
  const xToTime = (clientX: number) => {
    const el = laneRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.min(total, Math.max(0, ((clientX - r.left) / width) * total));
  };

  /* 播放指针拖动 / 刻度点击 */
  function startScrub(e: React.PointerEvent) {
    setTime(xToTime(e.clientX));
    const move = (ev: PointerEvent) => setTime(xToTime(ev.clientX));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  /* 通用拖拽（移动 / 改时长） */
  function drag(e: React.PointerEvent, onMove: (deltaSec: number, curSec: number) => void, onEnd?: () => void) {
    e.stopPropagation();
    const startX = e.clientX;
    const move = (ev: PointerEvent) => onMove(((ev.clientX - startX) / width) * total, xToTime(ev.clientX));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onEnd?.();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const pageSegs = timeline.segments.filter((s) => s.kind === "page");

  function setSegDuration(segIndex: number, dur: number) {
    const seg = pageSegs[segIndex];
    const first = seg?.photos[0];
    if (!first) return;
    const d = Math.max(0.5, Math.round(dur * 10) / 10);
    setProject((p) => ({ ...p, photos: p.photos.map((x) => (x.id === first.id ? { ...x, duration: d } : x)) }), { history: false });
  }

  function reorder(fromSeg: number, toTime: number) {
    const a = pageSegs[fromSeg];
    if (!a) return;
    const target = pageSegs.findIndex((s) => toTime >= s.start && toTime < s.end);
    if (target < 0 || target === fromSeg) return;
    const ids = new Set(a.photos.map((x) => x.id));
    setProject((p) => {
      const block = p.photos.filter((x) => ids.has(x.id));
      const rest = p.photos.filter((x) => !ids.has(x.id));
      const anchor = pageSegs[target].photos[0];
      let at = rest.findIndex((x) => x.id === anchor?.id);
      if (at < 0) at = rest.length;
      return { ...p, photos: [...rest.slice(0, at), ...block, ...rest.slice(at)] };
    });
  }

  const ticks: number[] = [];
  const stepSec = scale > 40 ? 1 : scale > 18 ? 5 : scale > 8 ? 10 : 30;
  for (let t = 0; t <= total; t += stepSec) ticks.push(t);

  if (ts.collapsed) {
    return (
      <div className="flex h-9 shrink-0 items-center gap-3 border-t border-white/10 bg-[#12151c] px-4 text-white">
        <Button size="sm" variant="ghost" className="h-7 gap-1 text-white/70 hover:bg-white/10 hover:text-white" onClick={() => patchTs({ collapsed: false })}>
          <ChevronUp className="h-3.5 w-3.5" /> 展开时间轴
        </Button>
        <span className="text-[11px] tabular-nums text-white/50">{fmtTime(time)} / {fmtTime(total)}</span>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col border-t border-white/10 bg-[#12151c] text-white" style={{ height: ts.height }}>
      {/* 拖动改变高度 */}
      <div
        onPointerDown={(e) => {
          const startY = e.clientY;
          const h0 = ts.height;
          const move = (ev: PointerEvent) => patchTs({ height: Math.min(520, Math.max(140, h0 - (ev.clientY - startY))) });
          const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", up);
        }}
        className="h-1.5 shrink-0 cursor-row-resize bg-white/5 hover:bg-primary/40"
      />

      {/* 控制行 */}
      <div className="flex h-11 shrink-0 flex-wrap items-center gap-2 border-b border-white/10 px-3">
        <span className="tabular-nums text-xs text-white/80">{fmtTime(time)}</span>
        <span className="text-xs text-white/30">/</span>
        <span className="tabular-nums text-xs text-white/50">{fmtTime(total)}</span>
        <div className="ml-2 flex items-center gap-1">
          <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => setPlaying(!playing)} aria-label={playing ? "暂停" : "播放"}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <IconMini tip="停止" onClick={() => { setPlaying(false); setTime(0); }}><Square className="h-3.5 w-3.5" /></IconMini>
          <IconMini tip="从头播放" onClick={() => { setTime(0); setPlaying(true); }}><SkipBack className="h-3.5 w-3.5" /></IconMini>
          <IconMini tip="循环播放" active={project.settings.loop} onClick={() => patchSettings({ loop: !project.settings.loop })}><Repeat className="h-3.5 w-3.5" /></IconMini>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <IconMini tip="吸附到 0.5 秒" active={ts.snap} onClick={() => patchTs({ snap: !ts.snap })}><Magnet className="h-3.5 w-3.5" /></IconMini>
          <div className="flex w-32 items-center gap-2">
            <span className="text-[10px] text-white/40">缩放</span>
            <Slider value={[scale]} min={4} max={80} step={1} onValueChange={(v) => patchTs({ timelineScale: v[0] })} />
          </div>
          <IconMini tip="折叠时间轴" onClick={() => patchTs({ collapsed: true })}><ChevronDown className="h-3.5 w-3.5" /></IconMini>
        </div>
      </div>

      {/* 轨道区 */}
      <div className="flex min-h-0 flex-1">
        {/* 固定轨道名 */}
        <div className="shrink-0 border-r border-white/10 bg-[#151922]" style={{ width: LABEL_W }}>
          <div className="h-6 border-b border-white/10" />
          {["画面轨", "主图轨", "文字轨", "音频轨", "转场轨"].map((n) => (
            <div key={n} className="flex items-center border-b border-white/5 px-3 text-[11px] text-white/55" style={{ height: ROW_H }}>
              {n}
            </div>
          ))}
        </div>

        {/* 可横向滚动内容 */}
        <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto overflow-y-auto">
          <div ref={laneRef} className="relative" style={{ width }}>
            {/* 刻度 */}
            <div className="sticky top-0 z-10 h-6 cursor-pointer border-b border-white/10 bg-[#12151c]" onPointerDown={startScrub}>
              {ticks.map((t) => (
                <div key={t} className="absolute top-0 h-full border-l border-white/10 pl-1 text-[9px] leading-6 text-white/40" style={{ left: (t / total) * width }}>
                  {fmtTime(t)}
                </div>
              ))}
            </div>

            {/* 画面轨 */}
            <Row>
              {pageSegs.map((s, i) => {
                const left = (s.start / total) * width;
                const w = ((s.end - s.start) / total) * width;
                const first = s.photos[0];
                const sel = first && selection.type === "photo" && selection.id === first.id;
                return (
                  <div
                    key={i}
                    onPointerDown={(e) => drag(e, () => {}, () => {})}
                    onClick={() => first && setSelection({ type: "photo", id: first.id })}
                    className={`absolute top-1 flex cursor-grab items-center gap-1.5 overflow-hidden rounded-md border bg-white/[0.07] px-1 ${
                      sel ? "border-primary ring-1 ring-primary" : "border-white/10 hover:border-white/30"
                    }`}
                    style={{ left, width: Math.max(8, w - 2), height: ROW_H - 8 }}
                    title={`${first?.name ?? ""} ${fmtTime(s.start)} → ${fmtTime(s.end)}`}
                  >
                    <span
                      onPointerDown={(e) => { e.stopPropagation(); drag(e, (d) => setSegDuration(i, (s.end - s.start) - d)); }}
                      className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize bg-primary/50 opacity-0 hover:opacity-100"
                    />
                    {first && <Thumb assetId={first.assetId} />}
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[10px] text-white/85">{first?.name ?? `#${i + 1}`}</span>
                      <span className="block truncate text-[9px] tabular-nums text-white/40">
                        {fmtTime(s.start)}–{fmtTime(s.end)} · {(s.end - s.start).toFixed(1)}s
                      </span>
                    </span>
                    <span
                      onPointerDown={(e) => { e.stopPropagation(); drag(e, (d) => setSegDuration(i, (s.end - s.start) + d)); }}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize bg-primary/50 opacity-0 hover:opacity-100"
                    />
                    <span
                      onPointerDown={(e) => { e.stopPropagation(); let last = s.start; drag(e, (_d, cur) => { last = cur; }, () => reorder(i, last)); }}
                      className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 cursor-grab"
                      title="拖动调整顺序"
                    />
                  </div>
                );
              })}
            </Row>

            {/* 主图轨：进入全屏 / 全屏停留 / 退出全屏 */}
            <Row>
              {pageSegs.map((s, i) => {
                const plan = heroPlan(project, s, 0);
                if (plan.index < 0 || plan.mode === "grid") return null;
                const segs: { label: string; from: number; to: number; cls: string }[] = [
                  { label: "进入全屏", from: plan.start, to: plan.start + plan.inDur, cls: "bg-amber-500/35 border-amber-400/50" },
                  { label: "全屏停留", from: plan.start + plan.inDur, to: plan.start + plan.inDur + plan.holdDur, cls: "bg-primary/45 border-primary" },
                  { label: "退出全屏", from: plan.end - plan.outDur, to: plan.end, cls: "bg-amber-500/35 border-amber-400/50" },
                ];
                return segs.map((b, bi) => {
                  const left = ((s.start + b.from) / total) * width;
                  const w = ((b.to - b.from) / total) * width;
                  if (w <= 0.5) return null;
                  return (
                    <div
                      key={`${i}-${bi}`}
                      className={`absolute top-1 flex items-center justify-center overflow-hidden rounded-md border text-[9px] text-white/90 ${b.cls}`}
                      style={{ left, width: Math.max(4, w - 2), height: ROW_H - 8 }}
                      title={`${b.label} ${fmtTime(s.start + b.from)} → ${fmtTime(s.start + b.to)}`}
                    >
                      <span className="truncate px-1">{b.label}</span>
                    </div>
                  );
                });
              })}
            </Row>



            {/* 文字轨 */}
            <Row>
              {project.texts.map((tx) => {
                const left = (tx.start / total) * width;
                const w = (tx.duration / total) * width;
                const sel = selection.type === "text" && selection.id === tx.id;
                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelection({ type: "text", id: tx.id })}
                    onPointerDown={(e) =>
                      drag(e, (d) =>
                        setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === tx.id ? { ...x, start: Math.max(0, snap(tx.start + d)) } : x)) }), { history: false }),
                      )
                    }
                    className={`absolute top-2 flex cursor-grab items-center overflow-hidden rounded-md border bg-sky-500/25 px-2 text-[10px] text-sky-50 ${
                      sel ? "border-primary ring-1 ring-primary" : "border-sky-300/25 hover:border-sky-200/60"
                    }`}
                    style={{ left, width: Math.max(10, w), height: ROW_H - 16 }}
                    title={tx.text}
                  >
                    <span
                      onPointerDown={(e) => { e.stopPropagation(); drag(e, (d) => setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === tx.id ? { ...x, start: Math.max(0, snap(tx.start + d)), duration: Math.max(0.5, snap(tx.duration - d)) } : x)) }), { history: false })); }}
                      className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize bg-white/40"
                    />
                    <span className="truncate px-1.5">{tx.text || "（空文字）"}</span>
                    <span
                      onPointerDown={(e) => { e.stopPropagation(); drag(e, (d) => setProject((p) => ({ ...p, texts: p.texts.map((x) => (x.id === tx.id ? { ...x, duration: Math.max(0.5, snap(tx.duration + d)) } : x)) }), { history: false })); }}
                      className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize bg-white/40"
                    />
                  </div>
                );
              })}
              {project.texts.length === 0 && <Empty>暂无文字图层</Empty>}
            </Row>

            {/* 音频轨 */}
            <Row>
              {project.music.map((m) => {
                const start = m.startTime ?? 0;
                const dur = m.loop ? total - start : Math.min(m.duration, total - start);
                const left = (start / total) * width;
                const w = (Math.max(0.5, dur) / total) * width;
                const sel = selection.type === "music" && selection.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelection({ type: "music", id: m.id })}
                    onPointerDown={(e) =>
                      drag(e, (d) =>
                        setProject((p) => ({ ...p, music: p.music.map((x) => (x.id === m.id ? { ...x, startTime: Math.max(0, snap(start + d)) } : x)) }), { history: false }),
                      )
                    }
                    className={`absolute top-2 cursor-grab overflow-hidden rounded-md border bg-violet-500/25 ${
                      sel ? "border-primary ring-1 ring-primary" : "border-violet-300/25 hover:border-violet-200/60"
                    }`}
                    style={{ left, width: Math.max(20, w), height: ROW_H - 16 }}
                    title={`${m.name} · ${fmtTime(m.duration)}`}
                  >
                    <Waveform data={m.waveform ?? null} seed={m.name.length} muted={Boolean(m.muted)} />
                    <div className="absolute inset-0 flex items-center justify-between gap-1 px-2 text-[10px] text-violet-50">
                      <span className="truncate">{m.name}</span>
                      <span className="shrink-0 tabular-nums text-violet-100/70">
                        {m.muted ? "静音" : `${Math.round(m.volume * 100)}%`}{m.loop ? " · 循环" : ""} · {fmtTime(m.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {project.music.length === 0 && <Empty>暂无背景音乐</Empty>}
            </Row>

            {/* 转场轨 */}
            <Row last>
              {timeline.segments.slice(0, -1).map((s, i) => {
                const tr = project.settings.transition;
                const left = ((s.end - tr / 2) / total) * width;
                const w = (tr / total) * width;
                return (
                  <div
                    key={i}
                    onPointerDown={(e) => drag(e, (d) => patchSettings({ transition: Math.min(3, Math.max(0.1, Math.round((tr + d) * 10) / 10)) }))}
                    className="absolute top-3 flex cursor-ew-resize items-center justify-center overflow-hidden rounded border border-amber-300/25 bg-amber-500/25 text-[9px] text-amber-50"
                    style={{ left, width: Math.max(14, w), height: ROW_H - 22 }}
                    title={`转场：淡入淡出 ${tr.toFixed(1)}s（拖动可调整）`}
                  >
                    {w > 44 ? `淡入淡出 ${tr.toFixed(1)}s` : ""}
                  </div>
                );
              })}
            </Row>

            {/* 播放指针 */}
            <div className="pointer-events-none absolute top-0 bottom-0 z-20 w-[2px] bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,.8)]" style={{ left: (time / total) * width }}>
              <div
                onPointerDown={startScrub}
                className="pointer-events-auto -ml-[7px] h-4 w-4 cursor-ew-resize rounded-b-md bg-rose-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`relative ${last ? "" : "border-b border-white/5"}`} style={{ height: ROW_H }}>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/25">{children}</span>;
}

function Waveform({ data, seed, muted }: { data: number[] | null; seed: number; muted: boolean }) {
  const bars = React.useMemo(() => {
    if (data?.length) return data;
    let s = seed * 9301 + 49297;
    return Array.from({ length: 80 }, () => {
      s = (s * 9301 + 49297) % 233280;
      return 0.25 + (s / 233280) * 0.7;
    });
  }, [data, seed]);
  return (
    <div className={`flex h-full w-full items-center gap-[1px] px-1 ${muted ? "opacity-30" : "opacity-70"}`}>
      {bars.map((v, i) => (
        <span key={i} className="flex-1 rounded-sm bg-violet-200/70" style={{ height: `${v * 70}%` }} />
      ))}
    </div>
  );
}

function IconMini({ children, tip, onClick, active }: { children: React.ReactNode; tip: string; onClick: () => void; active?: boolean }) {
  return (
    <Button
      size="icon" variant="ghost" title={tip} aria-label={tip} onClick={onClick}
      className={`h-7 w-7 ${active ? "bg-primary/25 text-primary" : "text-white/60"} hover:bg-white/10 hover:text-white`}
    >
      {children}
    </Button>
  );
}
