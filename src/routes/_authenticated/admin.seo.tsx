import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: () => (
    <ComingSoon
      title="SEO 管理"
      description="每个页面独立配置 Title / Description / Keywords / Canonical / OG / robots；sitemap 与 Google 收录状态。将在第 3 期上线。"
    />
  ),
});
