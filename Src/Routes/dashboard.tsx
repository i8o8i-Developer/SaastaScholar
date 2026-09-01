import React, { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

const LazyUserDashboard = lazy(() =>
  import("@/Components/Dashboard/UserDashboard").then((m) => ({
    default: m.UserDashboard,
  }))
);

function DashboardLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-mono font-bold text-muted-foreground">Initializing Student Workspace...</span>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <LazyUserDashboard />
    </Suspense>
  ),
});
