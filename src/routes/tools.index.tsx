import { createFileRoute, redirect } from "@tanstack/react-router";

// 短路由：/tools → /p/tools
export const Route = createFileRoute("/tools/")({
  beforeLoad: () => {
    throw redirect({ to: "/p/$slug", params: { slug: "tools" }, search: {} });
  },
});
