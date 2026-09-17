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
  const onTotalPagesDetectedRef = useRef(onTotalPagesDetected);
  onTotalPagesDetectedRef.current = onTotalPagesDetected;

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const currentLoadedUrlRef = useRef<string | null>(null);
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

  // 
  const loadDocument = useCallback(async () => {
    if (!fileUrl) {
      setError("No Document Source URL Provided.");
      setLoading(false);
      return;
    }

    // 
    if (pdfDoc && currentLoadedUrlRef.current === fileUrl) {
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
        currentLoadedUrlRef.current = fileUrl;
        if (onTotalPagesDetectedRef.current && doc.numPages) {
          onTotalPagesDetectedRef.current(doc.numPages);
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
  }, [fileUrl]);

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

        // 
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = Math.floor(viewport.width);
        offscreenCanvas.height = Math.floor(viewport.height);
        const offscreenContext = offscreenCanvas.getContext("2d", { alpha: false });
        if (!offscreenContext) return;

        const renderContext = {
          canvasContext: offscreenContext,
          viewport: viewport,
          enableWebGL: true,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (isCancelled || !isMountedRef.current) return;

        // 
        if (!isDrmDisabled && watermark && offscreenContext) {
          offscreenContext.save();
          offscreenContext.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
          offscreenContext.rotate((-28 * Math.PI) / 180);
          offscreenContext.translate(-offscreenCanvas.width / 2, -offscreenCanvas.height / 2);

          const fontSize = Math.max(13, Math.floor(offscreenCanvas.width / 50));
          offscreenContext.font = `500 ${fontSize}px "Courier New", Courier, monospace`;
          offscreenContext.fillStyle = "rgba(16, 185, 129, 0.075)";

          const stepX = Math.max(380, offscreenCanvas.width / 2.2);
          const stepY = Math.max(200, offscreenCanvas.height / 5);
          const startX = -offscreenCanvas.width;
          const endX = offscreenCanvas.width * 2;
          const startY = -offscreenCanvas.height;
          const endY = offscreenCanvas.height * 2;

          const scholarName = (watermark.student_name || "AUTHORIZED SCHOLAR").toUpperCase();
          const scholarRoll = (watermark.roll_number || "VERIFIED").toUpperCase();
          const ipAddr = watermark.ip_address || "127.0.0.1";
          const sessHash = watermark.session_hash || "SEC-DRM";

          let row = 0;
          for (let y = startY; y < endY; y += stepY) {
            const offsetX = row % 2 === 0 ? 0 : stepX / 2;
            for (let x = startX + offsetX; x < endX; x += stepX) {
              const line1 = `🔒 ${scholarRoll} · ${scholarName}`;
              const line2 = `NIMS UNIVERSITY · ${ipAddr} · ${sessHash}`;

              offscreenContext.fillText(line1, x, y);
              offscreenContext.fillText(line2, x, y + fontSize * 1.3);
            }
            row++;
          }
          offscreenContext.restore();
        }

        //
        canvas.width = offscreenCanvas.width;
        canvas.height = offscreenCanvas.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.aspectRatio = `${ratio}`;
        canvas.style.display = "block";

        const visibleCtx = canvas.getContext("2d", { alpha: false });
        if (visibleCtx) {
          visibleCtx.drawImage(offscreenCanvas, 0, 0);
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

        {/* Non-Intrusive Interaction Guard Layer */}
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="absolute inset-0 z-30 pointer-events-auto select-none"
        />
      </div>
    </div>
  );
}

