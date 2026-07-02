import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: () => (
    <ComingSoon
      title="通知中心"
      description="后台公告、系统通知、更新日志与版本信息。将在第 5 期上线。"
    />
  ),
});
