import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tools/photo-wall")({
  component: () => <Outlet />,
});
