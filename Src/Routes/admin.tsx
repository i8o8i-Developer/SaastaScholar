import React, { Suspense, lazy, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldAlert, Home, BookOpen, Monitor } from "lucide-react";

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

function AdminMobileRestricted() {
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 360
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#040806] text-white flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#081610]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(186,0,0,0.2)] text-center relative overflow-hidden">
        {/* Top Triad Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#BA0000] via-[#007EAC] to-[#005F15]" />

        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-inner">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Monitor className="h-3.5 w-3.5" />
          <span>Device Resolution Policy</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          Sorry, Not Available On Mobile Screens
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          The SaastaScholar Master Administration Console Is Strictly Restricted To Laptop And Tablet Screens (Minimum 768px Width) For Secure Academic Operations, Comprehensive Data Management, And DRM Governance.
        </p>

        <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/40 p-3.5 text-left space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>Required Display:</span>
            <strong className="text-emerald-400">Tablet / Laptop (≥ 768px)</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Detected Screen:</span>
            <strong className="text-rose-400">{windowWidth}px (Mobile Device)</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Access Status:</span>
            <strong className="text-rose-400 uppercase">Strictly Disabled</strong>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <a
            href="/"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#005F15] to-emerald-700 px-4 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Return To SaastaScholar Home</span>
          </a>
          <a
            href="/dashboard"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>Open Student Study Workspace</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin")({
  component: () => {
    const [isMobile, setIsMobile] = useState<boolean>(() => {
      if (typeof window !== "undefined") {
        return window.innerWidth < 768;
      }
      return false;
    });

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isMobile) {
      return <AdminMobileRestricted />;
    }

    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        <LazyAdminPortal />
      </Suspense>
    );
  },
});
