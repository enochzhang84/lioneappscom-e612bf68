import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/logs")({
  component: () => (
    <ComingSoon
      title="操作日志"
      description="记录管理员登录、内容修改、页面新增/删除、系统错误等审计日志。将在第 5 期上线。"
    />
  ),
});
