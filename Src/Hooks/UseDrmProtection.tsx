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
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [violationsCount, setViolationsCount] = useState(0);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resumeReading = () => {
    if (isAccountBlocked) return;
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setIsScreenBlurred(false);
    setIsSecurityAlertActive(false);
  };

  useEffect(() => {
    if (!enabled) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

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

    const triggerBlackoutShield = (reason: string, durationMs = 4000) => {
      setIsScreenBlurred(true);
      setIsSecurityAlertActive(true);
      overwriteClipboard();

      try {
        window.getSelection()?.removeAllRanges();
      } catch {
      }

      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        if (!isAccountBlocked) {
          setIsScreenBlurred(false);
          setIsSecurityAlertActive(false);
        }
      }, durationMs);

      // Real-Time Telemetry & Instant Disciplinary Block Reporting
      apiFetch<{
        status: string;
        violations_count?: number;
        is_drm_blocked?: boolean;
        block_reason?: string;
        warning_note?: string;
        cooldown_active?: boolean;
      }>("/drm/security-report/", {
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
            is_ios: isIOS,
            is_android: isAndroid,
            is_mobile: isIOS || isAndroid,
            max_touch_points: navigator.maxTouchPoints || 0,
            document_visibility: document.visibilityState,
          },
        }),
      })
        .then((res) => {
          if (res?.violations_count !== undefined) {
            setViolationsCount(res.violations_count);
          }
          if (res?.is_drm_blocked) {
            setIsAccountBlocked(true);
            setBlockReason(res.block_reason || "Account Suspended Due To Unauthorized Screen Capture Activity.");
            setIsScreenBlurred(true);
            toast.error("SECURITY LOCKDOWN: Account Blocked For Unauthorized Screen Capture.");
          } else if (res?.cooldown_active) {
            toast.error("Account Placed In Disciplinary Cooldown Due To Security Triggers.");
          }
        })
        .catch(() => {});
    };

    // Tracking Modifier Keys & Instant Screenshot Combo Detection
    let isMetaPressed = false;
    let isShiftPressed = false;
    let isCtrlPressed = false;

    const handleKeyTrackerDown = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.metaKey) isMetaPressed = true;
      if (e.key === "Shift" || e.shiftKey) isShiftPressed = true;
      if (e.key === "Control" || e.ctrlKey) isCtrlPressed = true;

      const key = (e.key || "").toLowerCase();
      const code = (e.code || "").toLowerCase();

      // Instant PrintScreen Key Interception
      if (e.key === "PrintScreen" || code === "printscreen" || key === "printscreen") {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SCREENSHOT_HOTKEY_DETECTED", 6000);
        toast.error(toTitleCase("Screen Capture Intercepted. Blackout Shield Engaged."));
        return;
      }

      // Instant Win+Shift or Ctrl+Shift Snipping Tool Auto Trigger
      if ((isMetaPressed && isShiftPressed) || (isCtrlPressed && isShiftPressed) || (e.altKey && key === "printscreen")) {
        triggerBlackoutShield("SNIPPING_TOOL_SHORTCUT", 6000);
        toast.error(toTitleCase("Snipping Tool Combination Intercepted."));
        return;
      }
    };

    const handleKeyTrackerUp = (e: KeyboardEvent) => {
      const key = (e.key || "").toLowerCase();
      const code = (e.code || "").toLowerCase();

      if (e.key === "PrintScreen" || code === "printscreen" || key === "printscreen") {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SCREENSHOT_HOTKEY_DETECTED", 6000);
        return;
      }

      if (e.key === "Meta") isMetaPressed = false;
      if (e.key === "Shift") isShiftPressed = false;
      if (e.key === "Control") isCtrlPressed = false;
    };

    // 1. Intercept Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerBlackoutShield("CONTEXT_MENU_BLOCKED", 3500);
      toast.error(toTitleCase("Right-Click Actions Are Disabled On DRM Documents."));
      return false;
    };

    // 2. Intercept Copy, Cut, SelectStart & DragStart Events
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      overwriteClipboard();
      triggerBlackoutShield("COPY_ATTEMPT_INTERCEPTED", 4000);
      toast.error(toTitleCase("Text Selection And Copying Are Prohibited By DRM Policy."));
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      overwriteClipboard();
      triggerBlackoutShield("CUT_ATTEMPT_INTERCEPTED", 4000);
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
        triggerBlackoutShield("SCREENSHOT_HOTKEY_DETECTED", 6000);
        toast.error(toTitleCase("Screen Capture Intercepted. Blackout Shield Engaged."));
        return;
      }

      // Windows / Mac Snipping Combos (Win+Shift+S, Ctrl+Shift+S, Cmd+Shift+3/4/5/6/S, Alt+PrtScn)
      if (
        (isCtrlOrMeta && e.shiftKey && (key === "s" || code === "keys")) ||
        (e.metaKey && e.shiftKey && ["3", "4", "5", "6", "s"].includes(key)) ||
        (e.altKey && (e.key === "PrintScreen" || code === "printscreen"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SNIPPING_TOOL_SHORTCUT", 6000);
        toast.error(toTitleCase("Snipping Tool Shortcut Intercepted."));
        return;
      }

      // Print Prevention: Ctrl+P / Cmd+P
      if (isCtrlOrMeta && (key === "p" || code === "keyp")) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("PRINT_BLOCKED", 4000);
        toast.error(toTitleCase("Document Printing Is Blocked By DRM Policy."));
        return;
      }

      // Save Webpage: Ctrl+S / Cmd+S
      if (isCtrlOrMeta && (key === "s" || code === "keys")) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SAVE_BLOCKED", 3500);
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
        triggerBlackoutShield("DEVTOOLS_ATTEMPT", 4000);
        toast.error(toTitleCase("Developer Inspection Tools Are Restricted."));
        return;
      }

      // Text Extraction: Ctrl+A (Select All), Ctrl+C (Copy), Ctrl+X (Cut)
      if (isCtrlOrMeta && ["a", "c", "x"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("COPY_BLOCKED", 3500);
        toast.error(toTitleCase("Text Selection And Copying Are Prohibited."));
        return;
      }
    };

    // 4. Window Focus Blur (Engages Visual Blackout Shield Locally On App Switch / Screen Loss)
    const handleBlur = () => {
      setIsScreenBlurred(true);
      overwriteClipboard();
      if (isMetaPressed || isShiftPressed || isCtrlPressed) {
        triggerBlackoutShield("SNIPPING_TOOL_OVERLAY_ACTIVE", 4000);
      }
    };

    const handleFocus = () => {
      if (!isAccountBlocked) {
        setIsScreenBlurred(false);
        setIsSecurityAlertActive(false);
      }
    };

    // 5. Visibility Change (Seamless Obfuscation On Tab Minimize / Phone Screen Lock)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenBlurred(true);
        overwriteClipboard();
      } else {
        if (!isAccountBlocked) {
          setIsScreenBlurred(false);
          setIsSecurityAlertActive(false);
        }
      }
    };

    // 6. Mobile Touch & 3+ Finger Gesture Detection
    let touchTimer: NodeJS.Timeout | null = null;
    const handleTouchStart = (e: TouchEvent) => {
      if (touchTimer) clearTimeout(touchTimer);

      // Check for 3+ finger swipe (mobile capture gesture)
      if (e.touches && e.touches.length >= 3) {
        e.preventDefault();
        overwriteClipboard();
        triggerBlackoutShield("MULTI_FINGER_MOBILE_CAPTURE", 3500);
        toast.error(toTitleCase("Multi-Touch Capture Intercepted."));
        return;
      }

      // Suppress mobile long-press text selection / callout
      touchTimer = setTimeout(() => {
        overwriteClipboard();
        try {
          window.getSelection()?.removeAllRanges();
        } catch {}
      }, 350);
    };

    const handleTouchEnd = () => {
      if (touchTimer) clearTimeout(touchTimer);
    };

    const handleTouchCancel = () => {
      if (touchTimer) clearTimeout(touchTimer);
    };

    // 7. Mobile Page Hide Listener
    const handlePageHide = () => {
      setIsScreenBlurred(true);
      overwriteClipboard();
    };

    const mediaQueryList = window.matchMedia("print");
    const handlePrintChange = (mql: MediaQueryListEvent | MediaQueryList) => {
      if (mql.matches) {
        triggerBlackoutShield("PRINT_DIALOG_DETECTED", 4500);
      }
    };

    window.addEventListener("beforeprint", () => triggerBlackoutShield("PRINT_DIALOG_DETECTED", 4500));
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
  }, [enabled, materialId, isSecurityAlertActive, isAccountBlocked]);

  return {
    isScreenBlurred,
    setIsScreenBlurred,
    resumeReading,
    isDevtoolsOpen,
    isSecurityAlertActive,
    isAccountBlocked,
    blockReason,
    violationsCount,
  };
}
