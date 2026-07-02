import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/files")({
  component: () => (
    <ComingSoon
      title="文件管理"
      description="统一管理图片、PDF、视频、文档等媒体资源，供页面、工具与文章复用。将在第 3 期上线。"
    />
  ),
});
