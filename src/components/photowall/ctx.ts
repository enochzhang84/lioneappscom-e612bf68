import * as React from "react";
import type { PWProject, PWSettings } from "@/lib/photowall/types";
import type { ImageMap, Timeline } from "@/lib/photowall/render";
import { assetUrl } from "@/lib/photowall/store";

export type SelectionType = "photo" | "text" | "music" | null;
export interface Selection {
  type: SelectionType;
  id: string | null;
}

export interface EditorApi {
  project: PWProject;
  setProject: (updater: (p: PWProject) => PWProject, opts?: { history?: boolean }) => void;
  patchSettings: (s: Partial<PWSettings>) => void;
  images: ImageMap;
  reloadImages: () => void;
  timeline: Timeline;
  time: number;
  setTime: (t: number) => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  selection: Selection;
  setSelection: (s: Selection) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const EditorCtx = React.createContext<EditorApi | null>(null);

export function useEditor(): EditorApi {
  const ctx = React.useContext(EditorCtx);
  if (!ctx) throw new Error("EditorCtx missing");
  return ctx;
}

/** 载入项目内所有图片为 HTMLImageElement */
export function useImages(project: PWProject) {
  const [images, setImages] = React.useState<ImageMap>(new Map());
  const [nonce, setNonce] = React.useState(0);
  const key = project.photos.map((p) => p.assetId).join(",");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const map: ImageMap = new Map();
      await Promise.all(
        project.photos.map(async (p) => {
          const url = await assetUrl(p.assetId);
          if (!url) return;
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              map.set(p.assetId, img);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = url;
          });
        }),
      );
      if (!cancelled) setImages(map);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce]);

  return { images, reload: () => setNonce((n) => n + 1) };
}
