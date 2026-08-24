import { createFileRoute } from "@tanstack/react-router";
import { UserDashboard } from "@/Components/Dashboard/UserDashboard";

export const Route = createFileRoute("/dashboard")({
  component: UserDashboard,
});
