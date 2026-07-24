import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/solution-builder")({
  head: () => ({
    meta: [
      { title: "方案配置中心 · Solution Builder | Lione Apps" },
      { name: "description", content: "在线配置电脑、NAS、家庭网络与完整 IT 方案，实时计算预算、检查兼容性并导出专业 PDF 报价。" },
      { property: "og:title", content: "Solution Builder | Lione Apps" },
      { property: "og:description", content: "Configure PCs, NAS, home networks and complete IT solutions with real-time pricing and PDF export." },
    ],
  }),
  component: () => <Outlet />,
});
