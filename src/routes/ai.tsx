import { createFileRoute, redirect } from "@tanstack/react-router";

// 短路由：/ai → /p/ai
export const Route = createFileRoute("/ai")({
  beforeLoad: () => {
    throw redirect({ to: "/p/$slug", params: { slug: "ai" }, search: {} });
  },
});
