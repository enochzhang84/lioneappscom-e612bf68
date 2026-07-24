import { createFileRoute, Outlet } from "@tanstack/react-router";

// /tools 作为布局路由，仅渲染子路由。
// /tools 的裸访问由 tools.index.tsx 重定向到 /p/tools。
export const Route = createFileRoute("/tools")({
  component: () => <Outlet />,
});
