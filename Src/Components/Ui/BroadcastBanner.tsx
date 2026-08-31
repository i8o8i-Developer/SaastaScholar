import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Megaphone,
  Radio,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/Lib/Utils";
import { apiFetch, SiteBanner } from "@/Lib/Api";
import { MarkdownContent } from "./MarkdownContent";

interface BroadcastBannerProps {
  target?: "ALL" | "DASHBOARD" | "WEBSITE";
  className?: string;
  compact?: boolean;
  previewBanners?: SiteBanner[];
  ignoreDismissed?: boolean;
}

const VARIANT_STYLES: Record<
  SiteBanner["variant"],
  {
    border: string;
    bg: string;
    badge: string;
    glow: string;
    btn: string;
    icon: any;
    dot: string;
  }
> = {
  emerald: {
    border: "border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-gradient-to-r from-emerald-500/10 via-card/95 to-teal-500/10 dark:from-emerald-950/40 dark:via-card/90 dark:to-teal-950/40",
    badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.15)]",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs",
    icon: Megaphone,
    dot: "bg-emerald-400",
  },
  amber: {
    border: "border-amber-500/40 dark:border-amber-500/30 hover:border-amber-500/60",
    bg: "bg-gradient-to-r from-amber-500/10 via-card/95 to-orange-500/10 dark:from-amber-950/40 dark:via-card/90 dark:to-orange-950/40",
    badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.15)]",
    btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-xs",
    icon: AlertCircle,
    dot: "bg-amber-400",
  },
  rose: {
    border: "border-rose-500/40 dark:border-rose-500/30 hover:border-rose-500/60",
    bg: "bg-gradient-to-r from-rose-500/10 via-card/95 to-red-500/10 dark:from-rose-950/40 dark:via-card/90 dark:to-red-950/40",
    badge: "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.15)]",
    btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs",
    icon: Zap,
    dot: "bg-rose-400",
  },
  purple: {
    border: "border-purple-500/40 dark:border-purple-500/30 hover:border-purple-500/60",
    bg: "bg-gradient-to-r from-purple-500/10 via-card/95 to-indigo-500/10 dark:from-purple-950/40 dark:via-card/90 dark:to-indigo-950/40",
    badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.15)]",
    btn: "bg-purple-600 hover:bg-purple-700 text-white shadow-xs",
    icon: Sparkles,
    dot: "bg-purple-400",
  },
  cyan: {
    border: "border-cyan-500/40 dark:border-cyan-500/30 hover:border-cyan-500/60",
    bg: "bg-gradient-to-r from-cyan-500/10 via-card/95 to-blue-500/10 dark:from-cyan-950/40 dark:via-card/90 dark:to-blue-950/40",
    badge: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30",
    glow: "shadow-[0_0_25px_rgba(6,182,212,0.15)]",
    btn: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs",
    icon: Radio,
    dot: "bg-cyan-400",
  },
  gradient: {
    border: "border-emerald-500/40 dark:border-teal-500/40 hover:border-emerald-400",
    bg: "bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-indigo-950/50",
    badge: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold",
    glow: "shadow-[0_0_30px_rgba(20,184,166,0.2)]",
    btn: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white shadow-xs",
    icon: Sparkles,
    dot: "bg-teal-300",
  },
};

export function BroadcastBanner({
  target = "ALL",
  className,
  compact = false,
  previewBanners,
  ignoreDismissed = false,
}: BroadcastBannerProps) {
  const [banners, setBanners] = useState<SiteBanner[]>(() => previewBanners || []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const storageKey = `nimswallah_dismissed_${(target || "all").toLowerCase()}_banners`;
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (ignoreDismissed) return [];
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(!previewBanners);

  useEffect(() => {
    if (previewBanners) {
      setBanners(previewBanners);
      setLoading(false);
      return;
    }
    let isMounted = true;
    async function loadBanners() {
      try {
        const query = target && target !== "ALL" ? `?target=${target}` : "";
        const res = await apiFetch<SiteBanner[]>(`/academic/banners/${query}`);
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        if (isMounted) {
          setBanners(list);
        }
      } catch (err) {
        if (isMounted) {
          setBanners([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadBanners();
    return () => {
      isMounted = false;
    };
  }, [target, previewBanners]);

  const activeBanners = previewBanners
    ? banners.filter((b) => b.is_active)
    : banners.filter((b) => b.is_active && (ignoreDismissed || !dismissedIds.includes(b.id)));

  if (loading || activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[Math.min(currentIndex, activeBanners.length - 1)];
  if (!currentBanner) return null;

  const style = VARIANT_STYLES[currentBanner.variant] || VARIANT_STYLES.emerald;
  const IconComponent = style.icon;

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const isExternalLink =
    currentBanner.link_url?.startsWith("http://") || currentBanner.link_url?.startsWith("https://");

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl sm:rounded-3xl border shadow-xl backdrop-blur-xl transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300",
        style.border,
        style.bg,
        style.glow,
        compact ? "p-3 sm:p-3.5" : "p-4 sm:p-5",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left Section: Live Pulse Icon + Badge + Message */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Animated Glow Icon */}
          <div className="relative mt-0.5 sm:mt-0 shrink-0">
            <div className="grid h-8 w-8 sm:h-9 sm:sm:w-9 place-items-center rounded-xl bg-card/80 border border-border shadow-xs">
              <IconComponent className="h-4 w-4 text-foreground" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", style.dot)} />
              <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", style.dot)} />
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider", style.badge)}>
                <span>{currentBanner.tag || "Notice"}</span>
              </span>
              <h4 className="font-display text-xs sm:text-sm font-bold text-foreground truncate">
                {currentBanner.title}
              </h4>
            </div>

            <div className="text-xs text-foreground/85 leading-relaxed font-sans">
              <MarkdownContent content={currentBanner.message} className="text-xs [&>p]:my-0" />
            </div>
          </div>
        </div>

        {/* Right Section: Action Button + Multi-Banner Controls + Dismiss button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-border/40">
          {/*  */}
          {activeBanners.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-surface cursor-pointer shadow-2xs"
                title="Previous Announcement"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-[0.65rem] font-mono font-bold text-muted-foreground px-1">
                {currentIndex + 1}/{activeBanners.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-surface cursor-pointer shadow-2xs"
                title="Next Announcement"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* CTA Action Link */}
          {currentBanner.link_url && (
            <a
              href={currentBanner.link_url}
              target={isExternalLink ? "_blank" : undefined}
              rel={isExternalLink ? "noopener noreferrer" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0",
                style.btn
              )}
            >
              <span>{currentBanner.link_text || "Learn More"}</span>
              {isExternalLink ? (
                <ExternalLink className="h-3 w-3 shrink-0 opacity-85" />
              ) : (
                <ArrowRight className="h-3 w-3 shrink-0" />
              )}
            </a>
          )}

          {/* Dismiss Button */}
          {currentBanner.is_dismissible && (
            <button
              type="button"
              onClick={() => handleDismiss(currentBanner.id)}
              className="grid h-7 w-7 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface/80 cursor-pointer transition-colors shrink-0"
              title="Dismiss Banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
