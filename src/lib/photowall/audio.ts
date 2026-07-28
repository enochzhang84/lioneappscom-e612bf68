// Photo Wall Studio — 播放时的背景音乐控制（编辑器预览 / 真实预览共用）
import type { PWProject } from "./types";
import { assetUrl } from "./store";

export interface AudioController {
  sync: (time: number, playing: boolean) => void;
  dispose: () => void;
}

/** 为项目内所有音乐创建 <audio> 控制器，按时间轴位置同步播放 */
export async function createAudioController(project: PWProject): Promise<AudioController> {
  const items: { el: HTMLAudioElement; start: number; volume: number; muted: boolean; fadeIn: number; fadeOut: number; end: number }[] = [];

  for (const m of project.music) {
    const url = await assetUrl(m.assetId);
    if (!url) continue;
    const el = new Audio(url);
    el.loop = m.loop;
    el.preload = "auto";
    const start = m.startTime ?? 0;
    items.push({
      el,
      start,
      volume: m.volume,
      muted: Boolean(m.muted),
      fadeIn: m.fadeIn,
      fadeOut: m.fadeOut,
      end: start + (m.loop ? Number.POSITIVE_INFINITY : Math.max(0.1, m.duration - (m.trimStart || 0))),
    });
  }

  function sync(time: number, playing: boolean) {
    for (const it of items) {
      const active = playing && time >= it.start && time < it.end;
      if (!active) {
        if (!it.el.paused) it.el.pause();
        continue;
      }
      const local = time - it.start;
      if (Math.abs(it.el.currentTime - local) > 0.4 && !it.el.loop) it.el.currentTime = local;
      let v = it.muted ? 0 : it.volume;
      if (it.fadeIn > 0 && local < it.fadeIn) v *= local / it.fadeIn;
      const remain = it.end - time;
      if (it.fadeOut > 0 && isFinite(remain) && remain < it.fadeOut) v *= Math.max(0, remain / it.fadeOut);
      it.el.volume = Math.min(1, Math.max(0, v));
      if (it.el.paused) void it.el.play().catch(() => {});
    }
  }

  function dispose() {
    for (const it of items) {
      it.el.pause();
      it.el.src = "";
    }
    items.length = 0;
  }

  return { sync, dispose };
}
