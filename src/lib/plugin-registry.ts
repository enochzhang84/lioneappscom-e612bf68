// Platform Core — 前端插件注册表。
// 后台 `tool_plugins` 表里的 component_key 对应这里注册的组件；
// 前台工具页可通过 `PluginRegistry.get(componentKey)` 拿到对应 React 组件。
import type { ComponentType } from "react";

export type PluginProps = {
  config?: Record<string, unknown>;
  itemSlug?: string;
  pageSlug?: string;
};

type Entry = {
  component: ComponentType<PluginProps>;
  meta?: { name?: string; description?: string };
};

const registry = new Map<string, Entry>();

export const PluginRegistry = {
  register(key: string, entry: Entry) {
    registry.set(key, entry);
  },
  get(key: string): ComponentType<PluginProps> | null {
    return registry.get(key)?.component ?? null;
  },
  has(key: string) {
    return registry.has(key);
  },
  list() {
    return Array.from(registry.entries()).map(([key, entry]) => ({ key, ...entry.meta }));
  },
};
