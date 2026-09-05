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
import { useTheme } from "@/Hooks/UseTheme";
import { PdfCanvasViewer } from "./PdfCanvasViewer";

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
  const { isDark } = useTheme();
  const { isScreenBlurred, resumeReading, isAccountBlocked, blockReason, violationsCount, isDrmDisabled, toggleDrm } = useDrmProtection({ materialId });

  const [payload, setPayload] = useState<DrmMaterialPayload>(FALLBACK_PAYLOAD);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageData, setPageData] = useState<DrmPageVector>(SAMPLE_PAGES[1]!);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [readingTheme, setReadingTheme] = useState<"day" | "sepia" | "night">(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "night" : "day";
    }
    return "day";
  });
  const [isJumpInputOpen, setIsJumpInputOpen] = useState<boolean>(false);
  const [jumpPageValue, setJumpPageValue] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Strictly identify if this is a genuine PDF courseware document
  const isPdfDoc =
    payload.file_ext === "pdf" ||
    Boolean(payload.file_url?.toLowerCase().endsWith(".pdf")) ||
    Boolean(pageData.file_url?.toLowerCase().endsWith(".pdf")) ||
    Boolean(payload.file_name?.toLowerCase().endsWith(".pdf"));

  // Per user specification: No clean notes functionality for PDF files; render clean notes exclusively for other document types
  const readerViewMode: "document" | "manuscript" = isPdfDoc ? "document" : "manuscript";

  // Synchronize reading theme with application dark/light theme
  useEffect(() => {
    setReadingTheme(isDark ? "night" : "day");
  }, [isDark]);

  // Load Session & Material Info
  useEffect(() => {
    let isCancelled = false;
    async function loadDrmSession() {
      try {
        const res = await apiFetch<DrmMaterialPayload>(`/drm/session/${materialId}/`);
        if (res && !isCancelled) {
          setPayload(res);
        }
      } catch (err) {
        console.warn("Using Fallback DRM Payload:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    loadDrmSession();
    return () => {
      isCancelled = true;
    };
  }, [materialId]);

  // Load Page Content
  useEffect(() => {
    let isCancelled = false;
    async function loadPage() {
      try {
        const res = await apiFetch<DrmPageVector>(`/drm/material/${materialId}/page/${currentPage}/`);
        if (res && !isCancelled) {
          setPageData(res);
        } else if (SAMPLE_PAGES[currentPage] && !isCancelled) {
          setPageData(SAMPLE_PAGES[currentPage]!);
        }
      } catch (err) {
        if (SAMPLE_PAGES[currentPage] && !isCancelled) {
          setPageData(SAMPLE_PAGES[currentPage]!);
        }
      }
    }
    loadPage();
    return () => {
      isCancelled = true;
    };
  }, [materialId, currentPage]);

  const handleNextPage = () => {
    if (currentPage < payload.total_pages) {
      setCurrentPage((prev) => prev + 1);
    } else {
      toast.info("You have reached the last page of this academic record.");
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageValue, 10);
    if (!isNaN(target) && target >= 1 && target <= payload.total_pages) {
      setCurrentPage(target);
      setIsJumpInputOpen(false);
      setJumpPageValue("");
    } else {
      toast.error(`Please enter a valid page number between 1 and ${payload.total_pages}`);
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

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting when user is typing in page jump input
      if (document.activeElement?.tagName === "INPUT") return;

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoomLevel((z) => Math.min(z + 25, 250));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoomLevel((z) => Math.max(z - 25, 60));
      } else if (e.key === "0") {
        e.preventDefault();
        setZoomLevel(100);
      } else if (e.key === "Escape") {
        if (isFullscreen) {
          handleToggleFullscreen();
        } else if (isJumpInputOpen) {
          setIsJumpInputOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentPage, payload.total_pages, isFullscreen, isJumpInputOpen]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col select-none overflow-hidden min-w-0 transition-colors duration-200",
        readingTheme === "day" && "bg-slate-100 dark:bg-zinc-950 text-foreground",
        readingTheme === "sepia" && "bg-[#f4ecd8] text-[#3c2f1d]",
        readingTheme === "night" && "bg-black text-zinc-100",
        isFullscreen ? "fixed inset-0 z-[100]" : ""
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

      {/* ================= BLACKOUT SHIELD OVERLAY (CLICK TO RESUME) ================= */}
      {isScreenBlurred && !isAccountBlocked && !isDrmDisabled && (
        <div
          onClick={() => resumeReading()}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center backdrop-blur-2xl animate-in fade-in duration-75 cursor-pointer select-none"
        >
          {/* Central Holographic Shield Card */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              resumeReading();
            }}
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
                Content is secure. Click anywhere to instantly resume your reading session.
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
      <div className="flex flex-wrap items-center justify-between gap-1.5 xs:gap-2 sm:gap-3 border-b border-border/80 bg-card/95 px-2 xs:px-3 sm:px-6 py-2 xs:py-2.5 backdrop-blur-md shrink-0 shadow-2xs min-w-0">
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

        {/* Center Page Navigator With Jump Input */}
        <div className="flex items-center gap-1 text-[0.65rem] xs:text-xs bg-surface/80 p-0.5 xs:p-1 rounded-xl xs:rounded-2xl border border-border/80 shadow-2xs shrink-0">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="grid h-6 w-6 xs:h-7 xs:w-7 place-items-center rounded-lg xs:rounded-xl bg-card text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface active:scale-90 transition-all cursor-pointer border border-border/60"
            title="Previous Page (ArrowLeft)"
          >
            <ChevronLeft className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
          </button>

          {isJumpInputOpen ? (
            <form onSubmit={handleJumpToPage} className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={payload.total_pages}
                value={jumpPageValue}
                onChange={(e) => setJumpPageValue(e.target.value)}
                placeholder={`${currentPage}`}
                autoFocus
                onBlur={() => setIsJumpInputOpen(false)}
                className="w-12 h-6 px-1 text-center font-mono font-bold text-xs bg-card border border-primary rounded-lg text-foreground focus:outline-hidden"
              />
              <span className="text-[0.65rem] text-muted-foreground font-mono">/ {payload.total_pages}</span>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setJumpPageValue(`${currentPage}`);
                setIsJumpInputOpen(true);
              }}
              className="font-mono font-bold text-foreground px-1.5 xs:px-2.5 text-[0.65rem] xs:text-xs hover:text-primary transition-colors cursor-pointer select-none"
              title="Click To Jump To Page"
            >
              {currentPage} / {payload.total_pages}
            </button>
          )}

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= payload.total_pages}
            className="grid h-6 w-6 xs:h-7 xs:w-7 place-items-center rounded-lg xs:rounded-xl bg-card text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface active:scale-90 transition-all cursor-pointer border border-border/60"
            title="Next Page (ArrowRight)"
          >
            <ChevronRight className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
          </button>
        </div>

        {/* Right Tools (Reading Themes, Zoom, Fullscreen) */}
        <div className="flex items-center gap-1 xs:gap-1.5 shrink-0">
          {/* Reading Color Themes (Day / Sepia / Night) */}
          <div className="flex items-center gap-0.5 bg-surface/80 p-0.5 rounded-xl border border-border/80 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setReadingTheme("day")}
              className={cn(
                "h-6 w-6 rounded-lg grid place-items-center transition-all cursor-pointer",
                readingTheme === "day" ? "bg-white text-slate-900 shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
              )}
              title="Day Mode (Crisp White)"
            >
              <Sun className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setReadingTheme("sepia")}
              className={cn(
                "h-6 w-6 rounded-lg grid place-items-center transition-all cursor-pointer text-[0.65rem] font-bold",
                readingTheme === "sepia" ? "bg-[#e8dcbf] text-[#3c2f1d] shadow-xs border border-[#d8ccaf]" : "text-muted-foreground hover:text-foreground"
              )}
              title="Sepia Mode (Warm Academic)"
            >
              Aa
            </button>
            <button
              type="button"
              onClick={() => setReadingTheme("night")}
              className={cn(
                "h-6 w-6 rounded-lg grid place-items-center transition-all cursor-pointer",
                readingTheme === "night" ? "bg-zinc-900 text-white shadow-xs border border-zinc-700" : "text-muted-foreground hover:text-foreground"
              )}
              title="Night Mode (OLED Dark)"
            >
              <Moon className="h-3 w-3" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 bg-surface/90 p-0.5 rounded-xl border border-border/80 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 25, 60))}
              disabled={zoomLevel <= 60}
              className="grid h-6 w-6 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-card active:scale-90 disabled:opacity-40 transition-all cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="font-mono text-[0.65rem] px-1 font-bold hover:text-primary transition-colors cursor-pointer select-none"
              title="Reset 100% Zoom (0)"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 25, 250))}
              disabled={zoomLevel >= 250}
              className="grid h-6 w-6 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-card active:scale-90 disabled:opacity-40 transition-all cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* DRM Engine Status Badge */}
          <div
            title={isDrmDisabled ? "DRM disabled by administration." : "Forensic DRM active."}
            className={cn(
              "hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-xl text-[0.65rem] font-bold border select-none transition-all shadow-2xs",
              isDrmDisabled
                ? "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/30"
            )}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>{isDrmDisabled ? "DRM Off" : "DRM Armed"}</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="grid h-7 w-7 xs:h-8 xs:w-8 place-items-center rounded-xl border border-border/80 bg-surface/80 text-muted-foreground hover:text-foreground hover:border-primary/50 active:scale-95 transition-all cursor-pointer shadow-2xs"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" /> : <Maximize2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" />}
          </button>
        </div>
      </div>

      {/* Print Quarantine CSS & Anti-Selection Style Injection */}
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
        /* Scoped High-Contrast Typography For Dark & Sepia Themes */
        .reading-theme-day h1, .reading-theme-day h2, .reading-theme-day h3, .reading-theme-day h4,
        .reading-theme-day strong {
          color: #0f172a !important;
        }
        .reading-theme-day p, .reading-theme-day span, .reading-theme-day li {
          color: #334155 !important;
        }
        .reading-theme-night h1, .reading-theme-night h2, .reading-theme-night h3, .reading-theme-night h4,
        .reading-theme-night strong {
          color: #f4f4f5 !important;
        }
        .reading-theme-night p, .reading-theme-night span, .reading-theme-night li {
          color: #d4d4d8 !important;
        }
        .reading-theme-sepia h1, .reading-theme-sepia h2, .reading-theme-sepia h3, .reading-theme-sepia h4,
        .reading-theme-sepia strong {
          color: #3c2f1d !important;
        }
        .reading-theme-sepia p, .reading-theme-sepia span, .reading-theme-sepia li {
          color: #534228 !important;
        }
      `}</style>

      {/* Main Secure Canvas Reading Zone with Dynamic Watermark */}
      <div
        style={{ WebkitOverflowScrolling: "touch" }}
        className={cn(
          "relative flex-1 overflow-y-auto overscroll-contain touch-pan-y p-2 xs:p-4 sm:p-6 flex justify-center items-start transition-all duration-75 min-w-0 w-full",
          !isDrmDisabled ? "drm-unrestricted-content" : "drm-protected-content",
          isScreenBlurred && !isDrmDisabled ? "flex" : isScreenBlurred ? "hidden opacity-0 pointer-events-none select-none invisible" : "flex"
        )}
      >
        {/* Dynamic Watermark Background Grid Overlay */}
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
          style={readerViewMode === "document" ? undefined : { transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className={cn(
            "relative z-10 w-full rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-200 overflow-hidden select-none min-w-0 mx-auto",
            readingTheme === "day" && "bg-white text-slate-900 border border-slate-200 reading-theme-day shadow-xl",
            readingTheme === "sepia" && "bg-[#fbf0d9] text-[#3c2f1d] border border-[#e4d6b6] reading-theme-sepia shadow-xl",
            readingTheme === "night" && "bg-zinc-900 text-zinc-100 border border-zinc-800 reading-theme-night shadow-2xl",
            readerViewMode === "document" ? "max-w-5xl p-2 xs:p-4 sm:p-6" : "max-w-4xl p-3 xs:p-5 sm:p-8"
          )}
        >
          {readerViewMode === "document" ? (
            <div className="space-y-3 sm:space-y-4 min-w-0">
              <div
                className={cn(
                  "border-b pb-2 sm:pb-3 flex flex-wrap items-center justify-between gap-2",
                  readingTheme === "day" && "border-slate-200",
                  readingTheme === "sepia" && "border-[#e4d6b6]",
                  readingTheme === "night" && "border-zinc-800"
                )}
              >
                <div className="min-w-0">
                  <span
                    className={cn(
                      "text-[0.6rem] sm:text-[0.65rem] uppercase tracking-wider font-bold font-mono px-2 py-0.5 rounded-md border",
                      readingTheme === "day" && "bg-emerald-50 text-emerald-800 border-emerald-300",
                      readingTheme === "sepia" && "bg-[#ecdcb9] text-[#4a3b25] border-[#d8c59f]",
                      readingTheme === "night" && "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    )}
                  >
                    {payload.subject_code} · PDF CANVAS (PAGE {currentPage}/{payload.total_pages})
                  </span>
                  <h2
                    className={cn(
                      "text-base sm:text-xl font-bold mt-1 truncate",
                      readingTheme === "day" && "text-slate-900",
                      readingTheme === "sepia" && "text-[#3c2f1d]",
                      readingTheme === "night" && "text-zinc-100"
                    )}
                  >
                    {payload.title}
                  </h2>
                  <p
                    className={cn(
                      "text-[0.65rem] sm:text-[0.7rem] truncate",
                      readingTheme === "day" && "text-slate-600",
                      readingTheme === "sepia" && "text-[#6b583e]",
                      readingTheme === "night" && "text-zinc-400"
                    )}
                  >
                    {payload.file_name || "Official Courseware Document"}
                  </p>
                </div>
              </div>
              <PdfCanvasViewer
                fileUrl={pageData.file_url || payload.file_url || ""}
                currentPage={currentPage}
                zoomLevel={zoomLevel}
                watermark={payload.watermark}
                isDrmDisabled={isDrmDisabled}
                onTotalPagesDetected={(p) => {
                  if (p && p !== payload.total_pages) {
                    setPayload((prev) => ({ ...prev, total_pages: p }));
                  }
                }}
              />
            </div>
          ) : (
            <div className="relative">
              <div
                dangerouslySetInnerHTML={{ __html: pageData.content_html }}
                className={cn(
                  "prose prose-sm max-w-none font-sans leading-relaxed select-none min-w-0 overflow-hidden break-words text-xs sm:text-sm",
                  readingTheme === "day" && "prose-slate text-slate-800",
                  readingTheme === "sepia" && "text-[#3c2f1d]",
                  readingTheme === "night" && "prose-invert text-zinc-200"
                )}
              />
              {/* Forensic Watermark Floating Over Manuscript */}
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
          <div
            className={cn(
              "mt-3 sm:mt-4 pt-2 sm:pt-3 border-t flex flex-wrap items-center justify-between text-[0.6rem] sm:text-[0.65rem] font-mono gap-1",
              readingTheme === "day" && "border-slate-200 text-slate-500",
              readingTheme === "sepia" && "border-[#e4d6b6] text-[#785e3a]",
              readingTheme === "night" && "border-zinc-800 text-zinc-500"
            )}
          >
            <span>NimsWallah Academic DRM Pipeline · Page {currentPage} Of {payload.total_pages}</span>
            <span>Student ID: {user?.roll_number || payload.watermark.roll_number}</span>
          </div>
        </div>
      </div>

      {/* Reader Bottom Bar */}
      <div
        className={cn(
          "border-t px-3 sm:px-4 py-2 text-center text-[0.65rem] sm:text-[0.7rem] shrink-0 font-medium select-none flex flex-wrap items-center justify-between gap-1 transition-colors duration-200",
          readingTheme === "day" && "bg-white/95 border-slate-200 text-slate-600",
          readingTheme === "sepia" && "bg-[#ebdcb9]/95 border-[#d8c59f] text-[#6b583e]",
          readingTheme === "night" && "bg-zinc-950/95 border-zinc-800 text-zinc-400"
        )}
      >
        <span className="hidden sm:inline">🔒 Strictly View-Only Protected Academic Record · High-Frequency Forensic Telemetry Active</span>
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold mx-auto sm:mx-0">
          Forensic ID: {user?.roll_number || payload.watermark.roll_number}
        </span>
      </div>
    </div>
  );
}
