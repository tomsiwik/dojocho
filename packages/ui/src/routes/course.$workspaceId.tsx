import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/course/$workspaceId")({
  component: Outlet,
});
