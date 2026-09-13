import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";
import { Loader2, AlertCircle, RefreshCw, ZoomIn, ZoomOut, RotateCcw, FileText, ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  try {
    const origin = window.location.origin || "";
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${origin}/pdf.worker.min.mjs`;
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Knockout groups") ||
        args[0].includes("knockout") ||
        args[0].includes("fetchStandardFontData") ||
        args[0].includes("Setting up fake worker") ||
        args[0].includes("Cannot polyfill"))
    ) {
      return;
    }
    origWarn.apply(console, args);
  };
}

interface PdfCanvasViewerProps {
  fileUrl: string;
  currentPage: number;
  zoomLevel: number;
  onTotalPagesDetected?: (pages: number) => void;
  onFallbackToManuscript?: () => void;
  watermark?: {
    student_name?: string;
    roll_number?: string;
    ip_address?: string;
    session_hash?: string;
  };
  isDrmDisabled?: boolean;
}

export function PdfCanvasViewer({
  fileUrl,
  currentPage,
  zoomLevel,
  onTotalPagesDetected,
  onFallbackToManuscript,
  watermark,
  isDrmDisabled = false,
}: PdfCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [naturalWidth, setNaturalWidth] = useState<number>(800);
  const [naturalHeight, setNaturalHeight] = useState<number>(1130);
  const [pageAspectRatio, setPageAspectRatio] = useState<number>(0.707); // Default A4
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 1. Load PDF Document with Direct Binary Stream & Retry
  const loadDocument = useCallback(async () => {
    if (!fileUrl) {
      setError("No Document Source URL Provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let resolvedUrl = fileUrl;
    // Strip out localhost / 127.0.0.1 in case backend returned raw development host
    if (resolvedUrl.includes("127.0.0.1") || resolvedUrl.includes("localhost")) {
      try {
        const parsed = new URL(resolvedUrl);
        resolvedUrl = parsed.pathname;
      } catch {}
    }
    if (resolvedUrl.startsWith("/")) {
      resolvedUrl = `${window.location.origin}${resolvedUrl}`;
    }

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nimswallah_access_token") || sessionStorage.getItem("nimswallah_access_token")
          : null;

      // Direct main-thread binary fetch to avoid worker CORS/network hurdles
      let binaryData: Uint8Array | null = null;
      try {
        const fetchHeaders: Record<string, string> = {};
        if (token) {
          fetchHeaders["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(resolvedUrl, {
          headers: fetchHeaders,
          credentials: "include",
        });
        if (res.ok) {
          const ab = await res.arrayBuffer();
          binaryData = new Uint8Array(ab);
        } else {
          console.warn(`Direct PDF binary stream returned ${res.status}.`);
        }
      } catch (fErr) {
        console.warn("Main thread binary fetch fallback:", fErr);
      }

      if (!binaryData) {
        // If binary stream was not reachable directly, attempt fallback or throw clear notice
        throw new Error("Courseware PDF stream is initializing on server. Switch to Clean Notes Vector for instant reading.");
      }

      const docSource = {
        data: binaryData,
        cMapUrl: "https://unpkg.com/pdfjs-dist/cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "https://unpkg.com/pdfjs-dist/standard_fonts/",
        verbosity: 0,
        stopAtErrors: false,
      };

      const loadingTask = pdfjsLib.getDocument(docSource as any);
      const doc = await loadingTask.promise;

      if (isMountedRef.current) {
        setPdfDoc(doc);
        if (onTotalPagesDetected && doc.numPages) {
          onTotalPagesDetected(doc.numPages);
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error("PDF.js Document Load Error:", err);
        setError(err.message || "Unable To Load PDF Courseware Document.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fileUrl, onTotalPagesDetected]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument, retryCount]);

  // 2. Render Target Page to HTML5 Canvas (High-DPI Retina Rendering with iPhone/Mobile Safety)
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!pdfDoc || !canvasRef.current || !isMountedRef.current) return;

      const targetPageNum = Math.min(Math.max(currentPage, 1), pdfDoc.numPages);

      try {
        setRendering(true);

        // Cancel previous in-flight render safely
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(targetPageNum);
        if (isCancelled || !isMountedRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        // Extract native PDF dimensions
        const baseViewport = page.getViewport({ scale: 1.0 });
        const ratio = baseViewport.width / baseViewport.height;
        setPageAspectRatio(ratio);
        setNaturalWidth(baseViewport.width);
        setNaturalHeight(baseViewport.height);

        // Detect iPhone / iOS Safari for safe memory rasterization
        const isIOS =
          typeof navigator !== "undefined" &&
          (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

        // High resolution rasterization scale with adaptive memory cap:
        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, isIOS ? 2 : 2.5) : 1.5;
        const targetZoomFactor = zoomLevel / 100;
        const baseScale = Math.min(Math.max(1.0, targetZoomFactor * 1.25), isIOS ? 1.8 : 2.2);
        const renderScale = baseScale * Math.min(dpr, isIOS ? 1.4 : 1.6);
        const rawViewport = page.getViewport({ scale: renderScale });

        // Clamp max canvas pixel buffer dimensions to prevent iOS Safari crash
        const maxDimension = isIOS ? 2400 : 3600;
        let finalScale = renderScale;
        if (rawViewport.width > maxDimension || rawViewport.height > maxDimension) {
          finalScale = renderScale * (maxDimension / Math.max(rawViewport.width, rawViewport.height));
        }
        const viewport = finalScale !== renderScale ? page.getViewport({ scale: finalScale }) : rawViewport;

        // Set internal canvas pixel buffer size
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // Proportional canvas style
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.aspectRatio = `${ratio}`;
        canvas.style.display = "block";

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          enableWebGL: true,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        //
        if (!isDrmDisabled && watermark && context) {
          context.save();
          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate((-28 * Math.PI) / 180);
          context.translate(-canvas.width / 2, -canvas.height / 2);

          const fontSize = Math.max(16, Math.floor(canvas.width / 40));
          context.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
          
          //
          context.lineWidth = 2;
          context.strokeStyle = "rgba(255, 255, 255, 0.75)";
          context.fillStyle = "rgba(225, 29, 72, 0.28)"; 

          const stepX = Math.max(280, canvas.width / 2.5);
          const stepY = Math.max(130, canvas.height / 6.5);
          const startX = -canvas.width;
          const endX = canvas.width * 2;
          const startY = -canvas.height;
          const endY = canvas.height * 2;

          const scholarName = (watermark.student_name || "AUTHORIZED SCHOLAR").toUpperCase();
          const scholarRoll = (watermark.roll_number || "VERIFIED").toUpperCase();
          const ipAddr = watermark.ip_address || "127.0.0.1";
          const sessHash = watermark.session_hash || "SEC-DRM";
          const todayDate = new Date().toISOString().split("T")[0];

          let row = 0;
          for (let y = startY; y < endY; y += stepY) {
            const offsetX = row % 2 === 0 ? 0 : stepX / 2;
            for (let x = startX + offsetX; x < endX; x += stepX) {
              const line1 = `🔒 ${scholarName} · ${scholarRoll}`;
              const line2 = `NIMS DRM · IP: ${ipAddr} · ${sessHash}`;
              const line3 = `STRICT CONFIDENTIAL · ${todayDate}`;

              context.strokeText(line1, x, y);
              context.fillText(line1, x, y);
              context.strokeText(line2, x, y + fontSize * 1.25);
              context.fillText(line2, x, y + fontSize * 1.25);
              context.strokeText(line3, x, y + fontSize * 2.5);
              context.fillText(line3, x, y + fontSize * 2.5);
            }
            row++;
          }
          context.restore();
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("PDF.js Page Render Error:", err);
        }
      } finally {
        if (!isCancelled && isMountedRef.current) {
          setRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, currentPage, zoomLevel]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[65vh] p-8 text-center bg-card/60 rounded-2xl border border-border/80 space-y-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="font-bold text-sm text-foreground">Loading DRM Courseware Document...</p>
        <p className="text-xs text-muted-foreground font-mono">Initializing High-Definition In-Site Canvas Engine</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] p-6 sm:p-8 text-center bg-card/95 dark:bg-zinc-900/95 rounded-2xl border border-rose-500/30 space-y-4 max-w-lg mx-auto shadow-xl">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/15 text-rose-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-zinc-100">Document Renderer Notice</h3>
          <p className="text-xs text-muted-foreground dark:text-zinc-400 leading-relaxed">
            {error || "Unable to render PDF binary in canvas stream."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setRetryCount((c) => c + 1)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary-deep active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Document</span>
          </button>
        </div>
      </div>
    );
  }

  const computedWidth = `${Math.max(zoomLevel, 100)}%`;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col items-center overflow-x-auto overflow-y-visible bg-surface/20 rounded-xl sm:rounded-2xl p-1 xs:p-1.5 select-none scrollbar-thin"
      style={{ touchAction: zoomLevel > 100 ? "pan-x pan-y" : "pan-y" }}
    >
      {/* Active Rendering Indicator */}
      {rendering && (
        <div className="absolute top-3 right-3 z-40 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/95 border border-border/80 shadow-md backdrop-blur-xs text-[0.65rem] font-bold text-muted-foreground font-mono">
          <RefreshCw className="h-3 w-3 animate-spin text-primary" />
          <span>High-DPI Sharp</span>
        </div>
      )}

      {/* Primary HTML5 PDF Canvas Container With Dynamic Zoom Scale */}
      <div
        style={{
          width: computedWidth,
          maxWidth: zoomLevel <= 100 ? `${naturalWidth}px` : "none",
          transformOrigin: "top center",
        }}
        className="relative shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden border border-border/80 bg-white dark:bg-zinc-950 mx-auto transition-[width] duration-150 shrink-0"
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-auto select-none pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Forensic DRM Watermark Matrix (Overlaid Directly Above In-Memory Canvas With High Contrast) */}
        {!isDrmDisabled && watermark && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 flex flex-wrap items-center justify-around gap-6 sm:gap-10 p-2 sm:p-4 opacity-35 dark:opacity-30 overflow-hidden select-none"
          >
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="rotate-[-26deg] text-center font-mono text-[0.65rem] xs:text-xs font-black tracking-widest uppercase select-none text-rose-600 dark:text-rose-400 drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]"
              >
                <p className="font-extrabold tracking-wider">
                  🔒 {watermark.student_name || "AUTHORIZED SCHOLAR"} · {watermark.roll_number || "RESTRICTED"}
                </p>
                <p className="text-[0.55rem] xs:text-[0.65rem] text-rose-700 dark:text-rose-300 font-bold opacity-90">
                  NIMS DRM · IP: {watermark.ip_address || "127.0.0.1"} · {watermark.session_hash || "SECURE"}
                </p>
                <p className="text-[0.5rem] xs:text-[0.55rem] text-amber-600 dark:text-amber-300 font-semibold tracking-normal">
                  CAMERA CAPTURE TRACED &amp; RECORDED
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Non-Intrusive Interaction Guard Layer */}
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="absolute inset-0 z-30 pointer-events-auto select-none"
        />
      </div>
    </div>
  );
}

