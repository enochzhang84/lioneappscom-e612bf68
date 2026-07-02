import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: () => (
    <ComingSoon
      title="用户管理"
      description="会员列表、收藏、考试记录、错题本、最近使用。将在第 4 期上线。"
    />
  ),
});
