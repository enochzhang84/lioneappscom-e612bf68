/**
 * Platform Bootstrap / Global Context
 * ------------------------------------
 * 全站公共数据（Navigation / Site Settings / Footer / SEO / Logo / Theme ...）
 * 一律通过这里统一加载和缓存。
 *
 * 使用方式：
 *   1. 在 __root.tsx 的 loader 中调用 `ensurePlatformData(context.queryClient)`
 *      —— 保证 SSR 阶段就把数据填入 React Query，且客户端在首次渲染前
 *      就已经拿到全部导航/设置。
 *   2. 用 <PlatformProvider> 包裹整站，读取用 `usePlatform()`。
 *   3. Header / Footer / 任何组件都不允许自己再单独去数据库拿这些数据。
 */
import { queryOptions, useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createContext, useContext, type ReactNode } from "react";
import { getSettings, listNavPages, type PageNavItem } from "./cms.functions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

export const navPagesQueryOptions = (
  fn: () => Promise<PageNavItem[]> = listNavPages,
) =>
  queryOptions({
    queryKey: ["platform", "nav-pages"],
    queryFn: () => fn(),
    staleTime: 5 * 60_000,
  });

export const siteSettingsQueryOptions = (
  fn: () => Promise<Record<string, Json>> = getSettings,
) =>
  queryOptions({
    queryKey: ["platform", "site-settings"],
    queryFn: () => fn(),
    staleTime: 5 * 60_000,
  });

/**
 * 在 loader 中调用，SSR + 客户端首次渲染前完成全部公共数据的加载。
 * 客户端后续导航直接命中缓存，不会再请求。
 */
export async function ensurePlatformData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.ensureQueryData(navPagesQueryOptions()),
    queryClient.ensureQueryData(siteSettingsQueryOptions()),
  ]);
}

export type PlatformData = {
  navPages: PageNavItem[];
  settings: Record<string, Json>;
};

const PlatformContext = createContext<PlatformData | null>(null);

/**
 * 全站公共数据 Provider。
 * 使用 useSuspenseQuery —— 若 loader 已经 ensureQueryData，数据一定同步可用，
 * 不会出现 “先空再填” 的二次 render。
 */
export function PlatformProvider({ children }: { children: ReactNode }) {
  const listNav = useServerFn(listNavPages);
  const getSet = useServerFn(getSettings);
  const { data: navPages } = useSuspenseQuery(navPagesQueryOptions(() => listNav()));
  const { data: settings } = useSuspenseQuery(siteSettingsQueryOptions(() => getSet()));
  return (
    <PlatformContext.Provider value={{ navPages, settings }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform(): PlatformData {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error(
      "usePlatform() must be used inside <PlatformProvider>. " +
        "确认组件位于 __root.tsx 的 PlatformProvider 内部。",
    );
  }
  return ctx;
}
