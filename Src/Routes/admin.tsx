import React, { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

const LazyAdminPortal = lazy(() =>
  import("@/Components/Admin/AdminPortal").then((m) => ({
    default: m.AdminPortal,
  }))
);

function AdminLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-mono font-bold text-muted-foreground">Loading Admin Engine...</span>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin")({
  component: () => (
    <Suspense fallback={<AdminLoadingFallback />}>
      <LazyAdminPortal />
    </Suspense>
  ),
});
