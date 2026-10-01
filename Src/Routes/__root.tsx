import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/Components/Ui/Sonner";
import { AuthProvider } from "@/Hooks/UseAuth";
import { reportLovableError } from "../Lib/LovableErrorReporting";

function NotFoundComponent() {
  return (
    <div className="min-h-screen bg-[#040806] text-[#f0fdf4] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.08)_0%,transparent_65%)] pointer-events-none" />
      <div className="relative z-10 max-w-[560px] w-full bg-[#081610]/85 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 sm:p-10 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(5,150,105,0.15)]">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full mb-6 font-mono text-xs text-emerald-300 uppercase tracking-wider font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          NimsWallah • Route Error 404
        </div>
        
        <div className="w-28 h-28 mx-auto mb-6 relative flex items-center justify-center">
          <svg className="w-full h-full animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="40" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="50" cy="50" r="32" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
            <line x1="50" y1="2" x2="50" y2="10" stroke="rgba(52, 211, 153, 0.6)" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="90" x2="50" y2="98" stroke="rgba(52, 211, 153, 0.6)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="absolute font-mono text-2xl font-bold tracking-tight text-white drop-shadow-md">404</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Study Material Not Found</h2>
        <p className="text-slate-300 max-w-sm mx-auto text-sm leading-relaxed mb-6 font-normal">
          The Notes, Syllabus, Or Question Paper You Are Looking For Does Not Exist Or Has Been Moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-emerald-600 border border-emerald-400/20"
          >
            Return To NimsWallah
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] text-xs text-white/50 tracking-wide">
          NimsWallah • Powered By <strong className="text-emerald-400 font-semibold">Durgaai Solutions</strong>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          This Page Did Not Load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something Went Wrong On Our End. You Can Try Refreshing Or Head Back Home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-deep cursor-pointer"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
