import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

// Configure PDF.js worker to use CDN matching installed version with fallback
if (typeof window !== "undefined") {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
  }
}

interface PdfCanvasViewerProps {
  fileUrl: string;
  currentPage: number;
  zoomLevel: number;
  onTotalPagesDetected?: (pages: number) => void;
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
  watermark,
  isDrmDisabled = false,
}: PdfCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageAspectRatio, setPageAspectRatio] = useState<number>(0.707); // Default A4
  const [naturalWidth, setNaturalWidth] = useState<number>(800);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState<boolean>(false);

  // 1. Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    async function loadDocument() {
      if (!fileUrl) return;
      setLoading(true);
      setError(null);

      let resolvedUrl = fileUrl;
      if (resolvedUrl.startsWith("/")) {
        resolvedUrl = `${window.location.origin}${resolvedUrl}`;
      }

      try {
        const loadingTask = pdfjsLib.getDocument({
          url: resolvedUrl,
          cMapUrl: "https://unpkg.com/pdfjs-dist/cmaps/",
          cMapPacked: true,
          standardFontDataUrl: "https://unpkg.com/pdfjs-dist/standard_fonts/",
          withCredentials: false,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          if (onTotalPagesDetected && doc.numPages) {
            onTotalPagesDetected(doc.numPages);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF.js Document Load Error:", err);
          setError(err.message || "Unable To Load PDF Courseware Document.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadDocument();
    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  // 2. Render Target Page to HTML5 Canvas With 100% Proportional Aspect Ratio
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!pdfDoc || !canvasRef.current) return;

      const targetPageNum = Math.min(Math.max(currentPage, 1), pdfDoc.numPages);

      try {
        setRendering(true);

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(targetPageNum);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        // Extract native PDF page dimensions
        const baseViewport = page.getViewport({ scale: 1.0 });
        const ratio = baseViewport.width / baseViewport.height;
        setPageAspectRatio(ratio);
        setNaturalWidth(baseViewport.width);

        // Render at crisp high resolution (2x native scale)
        const renderScale = 2.0;
        const viewport = page.getViewport({ scale: renderScale });

        // Set internal canvas pixel buffer dimensions
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // Reset inline styles so CSS width/height never squeeze the canvas
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
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("PDF.js Page Render Error:", err);
        }
      } finally {
        if (!isCancelled) {
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
  }, [pdfDoc, currentPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[65vh] p-8 text-center bg-card/60 rounded-2xl border border-border/80">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="font-bold text-sm text-foreground">Loading Courseware PDF Document...</p>
        <p className="text-xs text-muted-foreground mt-1 font-mono">Initializing High-Definition In-Site Canvas Engine</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] p-8 text-center bg-card/60 rounded-2xl border border-rose-500/30">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-500 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="font-bold text-sm text-foreground">Failed To Render PDF Document</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-x-auto min-h-[50vh] sm:min-h-[70vh] bg-surface/30 rounded-xl sm:rounded-2xl p-2 sm:p-4 select-none">
      {/* Active Rendering Indicator */}
      {rendering && (
        <div className="absolute top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/90 border border-border/80 shadow-md backdrop-blur-xs text-[0.65rem] font-bold text-muted-foreground font-mono">
          <RefreshCw className="h-3 w-3 animate-spin text-primary" />
          <span>Rendering High-DPI...</span>
        </div>
      )}

      {/* Primary HTML5 PDF Canvas Container With Proportional Dimensions */}
      <div
        style={{
          width: "100%",
          maxWidth: `${Math.min(naturalWidth * (zoomLevel / 100) * 1.15, 1100)}px`,
        }}
        className="relative shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden border border-border/80 bg-white mx-auto"
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-auto select-none pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Forensic DRM Watermark Matrix (Overlaid Directly Above In-Memory Canvas) */}
        {!isDrmDisabled && watermark && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 flex flex-wrap items-center justify-around gap-6 sm:gap-12 p-4 opacity-25 dark:opacity-20 overflow-hidden select-none"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="rotate-[-28deg] text-center font-mono text-[0.65rem] xs:text-xs font-bold tracking-widest uppercase select-none text-emerald-900 dark:text-emerald-300"
              >
                <p className="drop-shadow-xs">
                  {watermark.student_name || "Enrolled Scholar"} · {watermark.roll_number || "Verified"}
                </p>
                <p className="text-[0.55rem] xs:text-[0.65rem] opacity-85 font-semibold">
                  NIMS DRM · {watermark.ip_address || "127.0.0.1"} · {watermark.session_hash || "SECURE"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Interaction Guard Layer */}
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="absolute inset-0 z-30 pointer-events-auto select-none"
        />
      </div>
    </div>
  );
}
