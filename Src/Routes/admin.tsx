import { createFileRoute } from "@tanstack/react-router";
import { AdminPortal } from "@/Components/Admin/AdminPortal";

export const Route = createFileRoute("/admin")({
  component: AdminPortal,
});
