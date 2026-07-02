import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: () => (
    <ComingSoon
      title="网站运营中心"
      description="今日/本月访问、热门工具与页面、来源、地区、设备与浏览器分析。将在第 4 期上线。"
    />
  ),
});
