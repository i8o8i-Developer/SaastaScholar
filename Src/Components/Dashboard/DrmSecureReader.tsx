import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  Maximize2,
  Minimize2,
  Moon,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AcademicMaterial, apiFetch, DrmMaterialPayload, DrmPageVector } from "@/Lib/Api";
import { useAuth } from "@/Hooks/UseAuth";
import { useDrmProtection } from "@/Hooks/UseDrmProtection";
import { cn } from "@/Lib/Utils";
import { toast } from "sonner";

interface DrmSecureReaderProps {
  materialId: string;
  onClose: () => void;
}

const FALLBACK_PAYLOAD: DrmMaterialPayload = {
  session_token: "drm-sess-demo-2026",
  material_id: "demo-material",
  title: "Unit 1: Foundations of Intelligent Agents & Rational Architectures",
  subject_code: "AI201",
  subject_name: "Introduction To Artificial Intelligence",
  total_pages: 5,
  access_tier: "SEMESTER_TOPPER",
  watermark: {
    student_name: "Aarav Sharma",
    roll_number: "24BCSE102",
    enrollment_no: "NIMS2026-CS-8942",
    ip_address: "103.186.192.44",
    timestamp: new Date().toISOString(),
    session_hash: "SEC-9842A-NIMS",
  },
};

const SAMPLE_PAGES: Record<number, DrmPageVector> = {
  1: {
    page_number: 1,
    page_title: "Section 1: Intelligent Agent Architectures & PEAS Analysis",
    content_html: `
      <div class="space-y-4">
        <div class="border-b border-gray-200 dark:border-gray-700 pb-3">
          <span class="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            AI201 · UNIT 1 · PAGE 1
          </span>
          <h2 class="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">Foundations Of Intelligent Agents &amp; PEAS Analysis</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Verified NIMS University Faculty Notes</p>
        </div>
        
        <div class="space-y-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          <p>An Intelligent Agent Is Anything That Perceives Its Environment Through Sensors And Acts Upon That Environment Through Actuators. A Rational Agent Is One That Acts So As To Achieve The Best Outcome Or, When There Is Uncertainty, The Best Expected Outcome.</p>
          
          <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-500/20 font-mono text-xs text-emerald-900 dark:text-emerald-200 font-bold">
            Formal Agent Function: f : P* &rarr; A &nbsp;|&nbsp; Mapping From Percept Sequence History To Concrete Actions.
          </div>

          <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-4">1.1 The PEAS Classification Model</h3>
          <p>To Design An Intelligent Agent, We Must Formally Specify The Performance Measure, Environment, Actuators, And Sensors (PEAS):</p>

          <div class="grid grid-cols-2 gap-3 my-3 text-xs">
            <div class="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <strong class="text-emerald-600 dark:text-emerald-400 block mb-1">Performance (P):</strong>
              Safety, Speed, Legal Compliance, Fuel Efficiency, Passenger Comfort.
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <strong class="text-emerald-600 dark:text-emerald-400 block mb-1">Environment (E):</strong>
              Urban Roads, Pedestrians, Weather Variations, Dynamic Traffic.
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <strong class="text-emerald-600 dark:text-emerald-400 block mb-1">Actuators (A):</strong>
              Steering Wheel, Accelerator, Disc Brakes, Display Signals, Horn.
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <strong class="text-emerald-600 dark:text-emerald-400 block mb-1">Sensors (S):</strong>
              LiDAR, Sonar Sensors, Optical Cameras, GPS Receiver, Speedometer.
            </div>
          </div>
        </div>
      </div>
    `,
  },
  2: {
    page_number: 2,
    page_title: "Section 2: Environment Classification & State Space Formulations",
    content_html: `
      <div class="space-y-4">
        <div class="border-b border-gray-200 dark:border-gray-700 pb-3">
          <span class="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            AI201 · UNIT 1 · PAGE 2
          </span>
          <h2 class="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">Environment Classification &amp; Task Domain Models</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Verified NIMS University Faculty Notes</p>
        </div>

        <div class="space-y-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          <p>Environments In Artificial Intelligence Exhibit Fundamental Characteristics That Dictate Agent Architecture Complexity:</p>

          <div class="space-y-2 text-xs">
            <div class="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <strong>Fully Observable vs Partially Observable:</strong> An Environment Is Fully Observable If Sensors Access The Complete State Of The Environment At Any Given Point In Time.
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <strong>Deterministic vs Stochastic:</strong> If The Next State Of The Environment Is Completely Determined By The Current State And Action, It Is Deterministic.
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
              <strong>Episodic vs Sequential:</strong> In Episodic Environments, Each Episode Consists Of The Agent Perceiving And Performing A Single Action Independent Of Prior History.
            </div>
          </div>
        </div>
      </div>
    `,
  },
};

export function DrmSecureReader({ materialId, onClose }: DrmSecureReaderProps) {
  const { user } = useAuth();
  const { isScreenBlurred, resumeReading, isAccountBlocked, blockReason, violationsCount, isDrmDisabled, toggleDrm } = useDrmProtection({ materialId });

  const [payload, setPayload] = useState<DrmMaterialPayload>(FALLBACK_PAYLOAD);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageData, setPageData] = useState<DrmPageVector>(SAMPLE_PAGES[1]!);
  const [readerViewMode, setReaderViewMode] = useState<"document" | "manuscript">("manuscript");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load Session & Material Info
  useEffect(() => {
    async function loadDrmSession() {
      try {
        const res = await apiFetch<DrmMaterialPayload>(`/drm/session/${materialId}/`);
        if (res) {
          setPayload(res);
          if (res.file_url && res.file_ext === "pdf") {
            setReaderViewMode("document");
          } else {
            setReaderViewMode("manuscript");
          }
        }
      } catch (err) {
        console.error("Using Fallback DRM Payload:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDrmSession();
  }, [materialId]);

  // Load Page Content
  useEffect(() => {
    async function loadPage() {
      try {
        const res = await apiFetch<DrmPageVector>(`/drm/material/${materialId}/page/${currentPage}/`);
        if (res) setPageData(res);
        else if (SAMPLE_PAGES[currentPage]) setPageData(SAMPLE_PAGES[currentPage]!);
      } catch (err) {
        if (SAMPLE_PAGES[currentPage]) setPageData(SAMPLE_PAGES[currentPage]!);
      }
    }
    loadPage();
  }, [materialId, currentPage]);

  const handleNextPage = () => {
    if (currentPage < payload.total_pages) {
      setCurrentPage((prev) => prev + 1);
    } else {
      toast.info("You Have Reached The Last Page Of This Academic Record.");
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-screen w-full flex-col bg-background text-foreground select-none overflow-hidden min-w-0",
        isFullscreen ? "fixed inset-0 z-50" : ""
      )}
    >
      {/* ================= ACCOUNT SECURITY LOCKDOWN OVERLAY ================= */}
      {isAccountBlocked && !isDrmDisabled && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-white p-6 text-center backdrop-blur-3xl animate-in fade-in select-none">
          <div className="relative z-10 max-w-lg rounded-3xl border border-rose-500/50 bg-zinc-950/95 p-8 shadow-[0_0_80px_-15px_rgba(244,63,94,0.6)] backdrop-blur-2xl space-y-5">
            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-500 shadow-inner">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-3xl bg-rose-500/25 opacity-75" />
              <ShieldAlert className="h-10 w-10 text-rose-500" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Security Lockdown · Account Restricted</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                DRM Access Blocked
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
                {blockReason || "Unauthorized Screen Capture Attempt Detected On Protected DRM Material."}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-950 bg-rose-950/30 p-3.5 text-[0.7rem] font-mono text-zinc-400 space-y-1.5 text-left">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span>Student ID / Scholar:</span>
                <span>{user?.roll_number || payload.watermark.roll_number}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Total Violations Recorded:</span>
                <span className="text-rose-400 font-bold">{violationsCount || 1}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Enforcement Action:</span>
                <span className="text-rose-400 font-bold">DRM Content Access Suspended</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-lg transition-all hover:bg-rose-500 active:scale-95 cursor-pointer"
            >
              <span>Exit Reader &amp; Return To Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= BLACKOUT SHIELD OVERLAY ================= */}
      {isScreenBlurred && !isAccountBlocked && !isDrmDisabled && (
        <div
          onClick={() => resumeReading()}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center backdrop-blur-2xl animate-in fade-in duration-75 cursor-pointer select-none"
        >
          {/* Central Holographic Shield Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 max-w-lg rounded-3xl border border-emerald-500/40 bg-zinc-900/95 p-8 shadow-[0_0_60px_-15px_rgba(16,185,129,0.4)] backdrop-blur-xl space-y-5"
          >
            {/* Animated Shield Radar Beacon */}
            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-3xl bg-emerald-400/20 opacity-75" />
              <ShieldCheck className="h-10 w-10 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Forensic DRM Shield Engaged</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                DRM Screen Protection Active
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
                Content Is Protected. Click Below To Instantly Resume Your Reading Session.
              </p>
            </div>

            {/* Verification Chip */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-[0.7rem] font-mono text-zinc-400 space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Authorized Scholar:</span>
                <span>{user?.roll_number || payload.watermark.roll_number}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Protection Engine:</span>
                <span>HMAC-SHA256 Encrypted Vector Stream</span>
              </div>
            </div>

            {/* Click To Resume CTA */}
            <button
              type="button"
              onClick={() => resumeReading()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-zinc-950 font-bold text-xs shadow-lg transition-all hover:bg-emerald-400 active:scale-95 cursor-pointer"
            >
              <span>Click To Resume Reading Session</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top DRM Reader Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 xs:gap-2 sm:gap-3 border-b border-border/80 bg-card/95 px-2 xs:px-3 sm:px-6 py-2 xs:py-3 backdrop-blur-md shrink-0 shadow-2xs min-w-0">
        <div className="flex items-center gap-1.5 xs:gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-2 xs:px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface/80 hover:border-primary/50 active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Return To Dashboard</span>
            <span className="xs:hidden">Back</span>
          </button>

          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20 shrink-0">
              {payload.subject_code}
            </span>
            <span className="text-xs font-bold text-foreground truncate max-w-sm">
              {payload.title}
            </span>
          </div>
        </div>

        {/* Center Page Navigator */}
        <div className="flex items-center gap-1 text-[0.65rem] xs:text-xs bg-surface/80 p-0.5 xs:p-1 rounded-xl xs:rounded-2xl border border-border/80 shadow-2xs shrink-0">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="grid h-6 w-6 xs:h-7 xs:w-7 place-items-center rounded-lg xs:rounded-xl bg-card text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface active:scale-90 transition-all cursor-pointer border border-border/60"
            title="Previous Page"
          >
            <ChevronLeft className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
          </button>

          <span className="font-mono font-bold text-foreground px-1.5 xs:px-2.5 text-[0.65rem] xs:text-xs select-none">
            {currentPage} / {payload.total_pages}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= payload.total_pages}
            className="grid h-6 w-6 xs:h-7 xs:w-7 place-items-center rounded-lg xs:rounded-xl bg-card text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface active:scale-90 transition-all cursor-pointer border border-border/60"
            title="Next Page"
          >
            <ChevronRight className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
          </button>
        </div>

        {/* Right Tools (Mode Toggle, Zoom, Fullscreen) */}
        <div className="flex items-center gap-1 xs:gap-2 shrink-0">
          {/* Document View Toggle */}
          {(payload.file_url || pageData.file_url) && (
            <div className="flex items-center gap-1 bg-surface/80 p-1 rounded-2xl border border-border/80 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setReaderViewMode("document")}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-[0.7rem] font-bold transition-all cursor-pointer",
                  readerViewMode === "document"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {payload.file_ext === "pdf"
                  ? "📄 PDF Embed"
                  : payload.file_ext === "pptx" || payload.file_ext === "ppt"
                  ? "📊 Slide Deck"
                  : payload.file_ext === "docx" || payload.file_ext === "doc"
                  ? "📄 Word Doc"
                  : "📄 Document View"}
              </button>
              <button
                type="button"
                onClick={() => setReaderViewMode("manuscript")}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-[0.7rem] font-bold transition-all cursor-pointer",
                  readerViewMode === "manuscript"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                📝 Clean Notes
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-surface/80 p-1 rounded-2xl border border-border/80 text-xs shadow-2xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 15, 75))}
              className="grid h-6 w-6 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-card active:scale-90 transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[0.7rem] px-1.5 font-bold select-none">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 15, 150))}
              className="grid h-6 w-6 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-card active:scale-90 transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Institutional DRM Engine Status Indicator (Admin-Controlled Read-Only) */}
          <div
            title={isDrmDisabled ? "Master DRM Protection Is Completely Stopped Platform-Wide By University Administration." : "Master DRM Protection Is Actively Enforced."}
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[0.68rem] font-bold border select-none transition-all shadow-2xs",
              isDrmDisabled
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{isDrmDisabled ? "DRM Stopped" : "DRM Active"}</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="grid h-8 w-8 place-items-center rounded-xl border border-border/80 bg-surface/80 text-muted-foreground hover:text-foreground hover:border-primary/50 active:scale-95 transition-all cursor-pointer shadow-2xs"
            title="Toggle Secure Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Print Quarantine CSS & Anti-Selection Style Injection (Active Only When DRM Is Enabled) */}
      {!isDrmDisabled && (
        <style>{`
          @media print {
            body * { display: none !important; }
            body { background: #000000 !important; }
          }
          .drm-protected-content, .drm-protected-content * {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            -webkit-touch-callout: none !important;
          }
        `}</style>
      )}

      {/* Main Secure Canvas Reading Zone with Dynamic Watermark */}
      <div
        style={{ WebkitOverflowScrolling: "touch" }}
        className={cn(
          "relative flex-1 overflow-y-auto overscroll-contain touch-pan-y p-2 xs:p-4 sm:p-8 flex justify-center items-start transition-all duration-75 min-w-0 w-full",
          !isDrmDisabled ? "drm-unrestricted-content" : "drm-protected-content",
          isScreenBlurred && !isDrmDisabled ? "flex" : isScreenBlurred ? "hidden opacity-0 pointer-events-none select-none invisible" : "flex"
        )}
      >
        {/* Dynamic Watermark Background Grid Overlay (Visible Only When DRM Is Active) */}
        {!isDrmDisabled && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 flex flex-wrap items-center justify-around gap-8 sm:gap-12 p-2 sm:p-4 opacity-[0.12] dark:opacity-[0.08] overflow-hidden select-none"
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="rotate-[-26deg] text-center font-mono text-[0.6rem] sm:text-xs font-bold tracking-widest uppercase select-none">
                <p className="text-emerald-700 dark:text-emerald-300 drop-shadow-xs">{user?.full_name || payload.watermark.student_name} · {user?.roll_number || payload.watermark.roll_number}</p>
                <p className="text-[0.55rem] sm:text-[0.65rem] text-muted-foreground font-semibold">NIMS DRM · {payload.watermark.ip_address} · {payload.watermark.session_hash}</p>
              </div>
            ))}
          </div>
        )}

        {/* Paper Container: Full Page Crystal Clear Reading */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className="relative z-10 w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-border/80 bg-card text-foreground p-3 xs:p-5 sm:p-8 shadow-lg transition-transform duration-200 overflow-hidden select-none min-w-0"
        >
          {readerViewMode === "document" && payload.file_ext === "pdf" && (payload.file_url || pageData.file_url) ? (
            <div className="space-y-3 sm:space-y-4 min-w-0">
              <div className="border-b border-border/60 pb-2 sm:pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-wider font-bold text-rose-600 dark:text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                    {payload.subject_code} · PDF DOCUMENT (VIEW-ONLY · PAGE {currentPage}/{payload.total_pages})
                  </span>
                  <h2 className="text-base sm:text-xl font-bold mt-1 text-foreground truncate">{payload.title}</h2>
                  <p className="text-[0.65rem] sm:text-[0.7rem] text-muted-foreground truncate">{payload.file_name || "Official Courseware Document"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReaderViewMode("manuscript")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all border border-primary/30 cursor-pointer shadow-2xs active:scale-95"
                >
                  <span>📝 View Clean Notes Manuscript</span>
                </button>
              </div>
              <div className="relative w-full h-[60vh] xs:h-[68vh] sm:h-[74vh] rounded-xl sm:rounded-2xl overflow-hidden bg-background border border-border/80 shadow-inner select-none">
                <iframe
                  key={`pdf-page-${currentPage}-${pageData.file_url || payload.file_url}`}
                  src={(() => {
                    let pdfRaw = pageData.file_url || payload.file_url;
                    if (!pdfRaw) return "";
                    //
                    if (pdfRaw.startsWith("/")) {
                      pdfRaw = `${window.location.origin}${pdfRaw}`;
                    }
                    const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
                    if (isMobile) {
                      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfRaw)}`;
                    }
                    return `${pdfRaw}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`;
                  })()}
                  className="w-full h-full border-0 rounded-xl sm:rounded-2xl pointer-events-auto select-none"
                  title="PDF Document Preview"
                />
                {/* Forensic DRM Watermark Overlay Directly Over PDF (Visible Only When DRM Is Active) */}
                {!isDrmDisabled && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-20 flex flex-wrap items-center justify-around gap-6 sm:gap-10 p-4 opacity-25 dark:opacity-20 overflow-hidden select-none"
                  >
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="rotate-[-28deg] text-center font-mono text-[0.65rem] xs:text-xs font-bold tracking-widest uppercase select-none text-emerald-800 dark:text-emerald-300">
                        <p className="drop-shadow-xs">{user?.full_name || payload.watermark.student_name} · {user?.roll_number || payload.watermark.roll_number}</p>
                        <p className="text-[0.55rem] xs:text-[0.65rem] opacity-80 font-semibold">NIMS DRM · {payload.watermark.ip_address} · {payload.watermark.session_hash}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Non-Intrusive DRM Gesture Shield Layer (Active Only When DRM Is Active) */}
                {!isDrmDisabled && (
                  <div
                    onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onCopy={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute inset-0 pointer-events-none select-none z-30"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div
                dangerouslySetInnerHTML={{ __html: pageData.content_html }}
                className="prose prose-sm max-w-none font-sans leading-relaxed select-none min-w-0 overflow-hidden break-words text-xs sm:text-sm"
              />
              {/* Forensic Watermark Floating Over Manuscript (Visible Only When DRM Is Active) */}
              {!isDrmDisabled && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 flex flex-wrap items-center justify-around gap-6 p-4 opacity-20 dark:opacity-15 overflow-hidden select-none"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="rotate-[-26deg] text-center font-mono text-[0.65rem] font-bold tracking-widest uppercase select-none text-emerald-800 dark:text-emerald-300">
                      <p>{user?.full_name || payload.watermark.student_name} · {user?.roll_number || payload.watermark.roll_number}</p>
                      <p className="text-[0.55rem] opacity-75">NIMS DRM · {payload.watermark.ip_address}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Page Footer Security Signature */}
          <div className="mt-6 sm:mt-10 pt-3 sm:pt-4 border-t border-current/20 flex flex-wrap items-center justify-between text-[0.6rem] sm:text-[0.65rem] font-mono opacity-60 gap-1">
            <span>NimsWallah Academic DRM Pipeline · Page {currentPage} Of {payload.total_pages}</span>
            <span>Student ID: {user?.roll_number || payload.watermark.roll_number}</span>
          </div>
        </div>
      </div>

      {/* Reader Bottom Bar */}
      <div className="border-t border-border/80 bg-card/90 px-3 sm:px-4 py-2 text-center text-[0.65rem] sm:text-[0.7rem] text-muted-foreground shrink-0 font-medium select-none flex flex-wrap items-center justify-between gap-1">
        <span className="hidden sm:inline">🔒 Strictly View-Only Protected Academic Record · High-Frequency Forensic Telemetry Active</span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold mx-auto sm:mx-0">
          Forensic ID: {user?.roll_number || payload.watermark.roll_number}
        </span>
      </div>
    </div>
  );
}
