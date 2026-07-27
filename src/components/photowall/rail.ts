import {
  FolderOpen, Images, LayoutTemplate, Type, Music2, Sparkles, Grid3x3, Play, Download, Settings,
} from "lucide-react";

export type PanelKey =
  | "project" | "images" | "templates" | "text" | "music" | "animation" | "layout" | "play" | "export" | "settings";

export const RAIL: { key: PanelKey; label: string; icon: typeof Images }[] = [
  { key: "project", label: "项目", icon: FolderOpen },
  { key: "images", label: "图片", icon: Images },
  { key: "templates", label: "模板", icon: LayoutTemplate },
  { key: "text", label: "文字", icon: Type },
  { key: "music", label: "音乐", icon: Music2 },
  { key: "animation", label: "动画", icon: Sparkles },
  { key: "layout", label: "布局", icon: Grid3x3 },
  { key: "play", label: "播放", icon: Play },
  { key: "export", label: "导出", icon: Download },
  { key: "settings", label: "设置", icon: Settings },
];
