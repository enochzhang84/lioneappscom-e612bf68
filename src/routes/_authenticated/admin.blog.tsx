import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: () => (
    <ComingSoon
      title="文章中心"
      description="博客系统：分类、标签、文章、相关文章推荐。将在第 4 期上线。"
    />
  ),
});
