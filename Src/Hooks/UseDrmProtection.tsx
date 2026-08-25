import { useEffect, useState, useRef } from "react";
import { apiFetch, toTitleCase } from "@/Lib/Api";
import { toast } from "sonner";

interface UseDrmProtectionProps {
  materialId?: string;
  enabled?: boolean;
}

export function useDrmProtection({ materialId, enabled = true }: UseDrmProtectionProps = {}) {
  const [isScreenBlurred, setIsScreenBlurred] = useState(false);
  const [isDevtoolsOpen, setIsDevtoolsOpen] = useState(false);
  const [isSecurityAlertActive, setIsSecurityAlertActive] = useState(false);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resumeReading = () => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setIsScreenBlurred(false);
    setIsSecurityAlertActive(false);
  };

  useEffect(() => {
    if (!enabled) return;

    const overwriteClipboard = () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(
            "🔒 Protected Academic Material — Copyright NIMS University. Screen capture and copying are strictly prohibited."
          );
        }
      } catch {
      }
    };

    const triggerBlackoutShield = (reason: string, durationMs = 3500) => {
      setIsScreenBlurred(true);
      setIsSecurityAlertActive(true);
      overwriteClipboard();

      try {
        window.getSelection()?.removeAllRanges();
      } catch {
      }

      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        setIsScreenBlurred(false);
        setIsSecurityAlertActive(false);
      }, durationMs);

      // Telemetry log to backend with full forensic context
      apiFetch<{ status: string; violations_count?: number; cooldown_active?: boolean }>("/drm/security-report/", {
        method: "POST",
        body: JSON.stringify({
          material_id: materialId,
          event_type: reason,
          details: {
            timestamp: new Date().toISOString(),
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            screen_resolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
            user_agent: navigator.userAgent,
            is_mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            max_touch_points: navigator.maxTouchPoints || 0,
            document_visibility: document.visibilityState,
          },
        }),
      })
        .then((res) => {
          if (res?.cooldown_active) {
            toast.error("Account Placed In Disciplinary Cooldown Due To Repeated Triggers.");
          }
        })
        .catch(() => {});
    };

    // 
    let isMetaPressed = false;
    let isShiftPressed = false;
    let isCtrlPressed = false;

    const handleKeyTrackerDown = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.metaKey) isMetaPressed = true;
      if (e.key === "Shift" || e.shiftKey) isShiftPressed = true;
      if (e.key === "Control" || e.ctrlKey) isCtrlPressed = true;
    };

    const handleKeyTrackerUp = (e: KeyboardEvent) => {
      if (e.key === "Meta") isMetaPressed = false;
      if (e.key === "Shift") isShiftPressed = false;
      if (e.key === "Control") isCtrlPressed = false;
    };

    // 1. Intercept Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerBlackoutShield("CONTEXT_MENU_BLOCKED", 2500);
      toast.error(toTitleCase("Right-Click Context Actions Are Disabled On DRM Documents."));
      return false;
    };

    // 2. Intercept Copy, Cut, SelectStart & DragStart Events
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      overwriteClipboard();
      triggerBlackoutShield("COPY_ATTEMPT_INTERCEPTED", 3000);
      toast.error(toTitleCase("Text Selection And Copying Are Prohibited By DRM Policy."));
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      overwriteClipboard();
      triggerBlackoutShield("CUT_ATTEMPT_INTERCEPTED", 3000);
      toast.error(toTitleCase("Document Content Extraction Is Strictly Restricted."));
      return false;
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 3. Comprehensive Screenshot, DevTools & Print Interceptor
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = (e.key || "").toLowerCase();
      const code = (e.code || "").toLowerCase();

      // PrintScreen Key (PrtScn / PrintScreen)
      if (e.key === "PrintScreen" || code === "printscreen" || key === "printscreen") {
        e.preventDefault();
        e.stopPropagation();
        overwriteClipboard();
        triggerBlackoutShield("SCREENSHOT_HOTKEY_DETECTED", 3500);
        toast.error(toTitleCase("Screen Capture Intercepted. Blackout Shield Engaged."));
        return;
      }

      // Windows / Mac Snipping Combos (Win+Shift+S, Ctrl+Shift+S, Cmd+Shift+3/4/5/S, Alt+PrtScn)
      if (
        (isCtrlOrMeta && e.shiftKey && (key === "s" || code === "keys")) ||
        (e.metaKey && e.shiftKey && ["3", "4", "5", "s"].includes(key)) ||
        (e.altKey && (e.key === "PrintScreen" || code === "printscreen"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        overwriteClipboard();
        triggerBlackoutShield("SNIPPING_TOOL_SHORTCUT", 4000);
        toast.error(toTitleCase("Snipping Tool Shortcut Intercepted."));
        return;
      }

      // Print Prevention: Ctrl+P / Cmd+P
      if (isCtrlOrMeta && (key === "p" || code === "keyp")) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("PRINT_BLOCKED", 3000);
        toast.error(toTitleCase("Document Printing Is Blocked By DRM Policy."));
        return;
      }

      // Save Webpage: Ctrl+S / Cmd+S
      if (isCtrlOrMeta && (key === "s" || code === "keys")) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SAVE_BLOCKED", 2500);
        toast.error(toTitleCase("Saving Protected Document Offline Is Prohibited."));
        return;
      }

      // View Source / Inspection: Ctrl+U, F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === "F12" ||
        code === "f12" ||
        (isCtrlOrMeta && (key === "u" || code === "keyu")) ||
        (isCtrlOrMeta && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        (e.metaKey && e.altKey && ["i", "j", "c", "u"].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setIsDevtoolsOpen(true);
        triggerBlackoutShield("DEVTOOLS_ATTEMPT", 3000);
        toast.error(toTitleCase("Developer Inspection Tools Are Restricted."));
        return;
      }

      // Text Extraction: Ctrl+A (Select All), Ctrl+C (Copy), Ctrl+X (Cut)
      if (isCtrlOrMeta && ["a", "c", "x"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        overwriteClipboard();
        triggerBlackoutShield("COPY_BLOCKED", 2500);
        toast.error(toTitleCase("Text Selection And Copying Are Prohibited."));
        return;
      }
    };

    // 4. Window Focus Blur (Snipping Tool / Screenshot Grabber Activation Detection)
    const handleBlur = () => {
      if (isMetaPressed || isShiftPressed || isCtrlPressed) {
        triggerBlackoutShield("SNIPPING_TOOL_OVERLAY_ACTIVE", 4500);
        toast.error(toTitleCase("Screen Capture Utility Intercepted."));
      } else {
        setIsScreenBlurred(true);
      }
    };

    const handleFocus = () => {
      if (!isSecurityAlertActive) {
        setIsScreenBlurred(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenBlurred(true);
      } else {
        if (!isSecurityAlertActive) {
          setIsScreenBlurred(false);
        }
      }
    };

    // 5. Mobile Touch Long-Press & Multi-Finger Capture Shield
    let touchTimer: NodeJS.Timeout | null = null;
    const handleTouchStart = (e: TouchEvent) => {
      if (touchTimer) clearTimeout(touchTimer);

      // 
      if (e.touches && e.touches.length >= 3) {
        e.preventDefault();
        overwriteClipboard();
        triggerBlackoutShield("MULTI_FINGER_MOBILE_CAPTURE", 3500);
        toast.error(toTitleCase("Multi-Touch Screen Capture Intercepted."));
        return;
      }
      
      touchTimer = setTimeout(() => {
        overwriteClipboard();
        try {
          window.getSelection()?.removeAllRanges();
        } catch {}
      }, 400);
    };

    const handleTouchEnd = () => {
      if (touchTimer) clearTimeout(touchTimer);
    };

    const handleTouchCancel = () => {
      if (touchTimer) clearTimeout(touchTimer);
    };

    // 6. Native Print Media Query Listener & Mobile Page Hide
    const handlePageHide = () => {
      setIsScreenBlurred(true);
      overwriteClipboard();
    };

    const mediaQueryList = window.matchMedia("print");
    const handlePrintChange = (mql: MediaQueryListEvent | MediaQueryList) => {
      if (mql.matches) {
        triggerBlackoutShield("PRINT_DIALOG_DETECTED", 4000);
      }
    };

    window.addEventListener("beforeprint", () => triggerBlackoutShield("PRINT_DIALOG_DETECTED", 4000));
    window.addEventListener("contextmenu", handleContextMenu, true);
    window.addEventListener("copy", handleCopy, true);
    window.addEventListener("cut", handleCut, true);
    window.addEventListener("selectstart", handleSelectStart, true);
    window.addEventListener("dragstart", handleDragStart, true);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("keydown", handleKeyTrackerDown, true);
    window.addEventListener("keyup", handleKeyTrackerUp, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handlePrintChange);
    } else {
      mediaQueryList.addListener(handlePrintChange);
    }

    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      if (touchTimer) clearTimeout(touchTimer);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      window.removeEventListener("copy", handleCopy, true);
      window.removeEventListener("cut", handleCut, true);
      window.removeEventListener("selectstart", handleSelectStart, true);
      window.removeEventListener("dragstart", handleDragStart, true);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("keydown", handleKeyTrackerDown, true);
      window.removeEventListener("keyup", handleKeyTrackerUp, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handlePrintChange);
      } else {
        mediaQueryList.removeListener(handlePrintChange);
      }
    };
  }, [enabled, materialId, isSecurityAlertActive]);

  return {
    isScreenBlurred,
    setIsScreenBlurred,
    resumeReading,
    isDevtoolsOpen,
    isSecurityAlertActive,
  };
}
