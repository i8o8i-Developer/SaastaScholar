import { useEffect, useState, useRef } from "react";
import { apiFetch, toTitleCase } from "@/Lib/Api";
import { toast } from "sonner";

interface UseDrmProtectionProps {
  materialId?: string;
  enabled?: boolean;
}

export function isDrmGloballyDisabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("nimswallah_drm_disabled") === "true";
}

export function setDrmGloballyDisabled(disabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("nimswallah_drm_disabled", disabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent("drm-setting-changed", { detail: { disabled } }));
}

export function useDrmProtection({ materialId, enabled = true }: UseDrmProtectionProps = {}) {
  const [isDrmDisabled, setIsDrmDisabled] = useState(isDrmGloballyDisabled);
  const [isScreenBlurred, setIsScreenBlurred] = useState(false);
  const [isDevtoolsOpen, setIsDevtoolsOpen] = useState(false);
  const [isSecurityAlertActive, setIsSecurityAlertActive] = useState(false);
  const [isAccountBlocked, setIsAccountBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [violationsCount, setViolationsCount] = useState(0);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const isMobile =
    typeof navigator !== "undefined" &&
    (isIOS || isAndroid || (navigator.maxTouchPoints > 1 && window.innerWidth < 1024));

  // Continuous Telemetry & Audit Recorder Function
  const logDrmEvent = (eventType: string, extraDetails: Record<string, any> = {}) => {
    if (isDrmDisabled || !enabled) return;

    const details = {
      timestamp: new Date().toISOString(),
      screen_width: typeof window !== "undefined" ? window.innerWidth : 0,
      screen_height: typeof window !== "undefined" ? window.innerHeight : 0,
      screen_resolution:
        typeof window !== "undefined" && window.screen ? `${window.screen.width}x${window.screen.height}` : "unknown",
      device_pixel_ratio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      is_mobile: isMobile,
      is_ios: isIOS,
      is_android: isAndroid,
      max_touch_points: typeof navigator !== "undefined" ? navigator.maxTouchPoints || 0 : 0,
      document_visibility: typeof document !== "undefined" ? document.visibilityState : "unknown",
      ...extraDetails,
    };

    apiFetch<{
      status: string;
      violations_count?: number;
      is_drm_blocked?: boolean;
      block_reason?: string;
    }>("/drm/security-report/", {
      method: "POST",
      body: JSON.stringify({
        material_id: materialId,
        event_type: eventType.slice(0, 50),
        details: details,
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
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    // 1. Fetch Global Server-Side DRM Configuration
    apiFetch<{ is_drm_enabled: boolean }>("/drm/config/")
      .then((res) => {
        if (res && typeof res.is_drm_enabled === "boolean") {
          const disabled = !res.is_drm_enabled;
          if (disabled !== isDrmGloballyDisabled()) {
            setDrmGloballyDisabled(disabled);
          }
          setIsDrmDisabled(disabled);
        }
      })
      .catch(() => {});

    // 2. Listen For Local & Cross-Tab Admin Toggle Events
    const handleDrmSettingChange = (e: any) => {
      const disabled = e.detail?.disabled ?? isDrmGloballyDisabled();
      setIsDrmDisabled(disabled);
      if (disabled) {
        setIsScreenBlurred(false);
        setIsSecurityAlertActive(false);
        setIsAccountBlocked(false);
      }
    };
    window.addEventListener("drm-setting-changed", handleDrmSettingChange);
    window.addEventListener("storage", handleDrmSettingChange);
    return () => {
      window.removeEventListener("drm-setting-changed", handleDrmSettingChange);
      window.removeEventListener("storage", handleDrmSettingChange);
    };
  }, []);

  const resumeReading = () => {
    if (isAccountBlocked) return;
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setIsScreenBlurred(false);
    setIsSecurityAlertActive(false);
    logDrmEvent("DRM_READING_RESUMED", {});
  };

  useEffect(() => {
    if (!enabled || isDrmDisabled) {
      setIsScreenBlurred(false);
      setIsSecurityAlertActive(false);
      return;
    }

    const overwriteClipboard = () => {
      try {
        if (
          typeof document !== "undefined" &&
          document.hasFocus() &&
          !document.hidden &&
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ) {
          navigator.clipboard
            .writeText(
              "🔒 Protected Academic Material — Copyright NIMS University. Screen Capture And copying are strictly prohibited."
            )
            .catch(() => {
              //
            });
        }
      } catch {}
    };

    const triggerBlackoutShield = (reason: string, durationMs = 4500) => {
      if (isDrmDisabled || !enabled) return;
      setIsScreenBlurred(true);
      setIsSecurityAlertActive(true);
      overwriteClipboard();

      try {
        window.getSelection()?.removeAllRanges();
      } catch {}

      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        if (!isAccountBlocked) {
          setIsScreenBlurred(false);
          setIsSecurityAlertActive(false);
        }
      }, durationMs);

      // Real-Time Telemetry & Instant Disciplinary Block Reporting
      logDrmEvent(reason, { trigger_source: "blackout_shield" });
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

    // 1. Intercept Right-Click Context Menu & Mobile Long-Press
    const handleContextMenu = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerBlackoutShield("CONTEXT_MENU_BLOCKED", 3500);
      toast.error(toTitleCase("Right-Click Actions And Image Menus Are Disabled."));
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

      // PrintScreen Key
      if (e.key === "PrintScreen" || code === "printscreen" || key === "printscreen") {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SCREENSHOT_HOTKEY_DETECTED", 6000);
        toast.error(toTitleCase("Screen Capture Intercepted. Blackout Shield Engaged."));
        return;
      }

      // Windows / Mac Snipping Combos
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

      // Print Prevention
      if (isCtrlOrMeta && (key === "p" || code === "keyp")) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("PRINT_BLOCKED", 4000);
        toast.error(toTitleCase("Document Printing Is Blocked By DRM Policy."));
        return;
      }

      // Save Webpage
      if (isCtrlOrMeta && (key === "s" || code === "keys")) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SAVE_BLOCKED", 3500);
        toast.error(toTitleCase("Saving Protected Document Offline Is Prohibited."));
        return;
      }

      // View Source / Inspection
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

      // Text Extraction
      if (isCtrlOrMeta && ["a", "c", "x"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("COPY_BLOCKED", 3500);
        toast.error(toTitleCase("Text Selection And Copying Are Prohibited."));
        return;
      }
    };

    // 
    const handleBlur = () => {
      isMetaPressed = false;
      isShiftPressed = false;
      isCtrlPressed = false;

      setIsScreenBlurred(true);
      setIsSecurityAlertActive(true);
      logDrmEvent("WINDOW_BLUR_POSSIBLE_SCREENSHOT", {
        is_mobile: isMobile,
        trigger: "window_blur",
      });
    };

    const handleFocus = () => {
      isMetaPressed = false;
      isShiftPressed = false;
      isCtrlPressed = false;

      if (!isAccountBlocked && !isMobile) {
        setIsScreenBlurred(false);
        setIsSecurityAlertActive(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenBlurred(true);
        setIsSecurityAlertActive(true);
        logDrmEvent("VISIBILITY_HIDDEN_CAPTURE_GUARD", {
          is_mobile: isMobile,
          visibility_state: document.visibilityState,
        });
      } else {
        if (!isAccountBlocked && !isMobile) {
          setIsScreenBlurred(false);
          setIsSecurityAlertActive(false);
        }
      }
    };

    const handlePageHide = () => {
      setIsScreenBlurred(true);
      logDrmEvent("PAGE_HIDE_CAPTURE_GUARD", { is_mobile: isMobile });
    };

    // 6. Mobile Multi-Touch & 3+ Finger Screenshot Gesture Detection
    let touchTimer: ReturnType<typeof setTimeout> | null = null;
    const handleTouchStart = (e: TouchEvent) => {
      if (touchTimer) clearTimeout(touchTimer);

      // 
      if (e.touches && e.touches.length >= 3) {
        e.preventDefault();
        e.stopPropagation();
        overwriteClipboard();
        triggerBlackoutShield("MULTI_FINGER_GESTURE_CAPTURE", 4500);
        toast.error(toTitleCase("Three-Finger Screenshot Gesture Intercepted. Blackout Shield Engaged."));
        return;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 3) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("MULTI_FINGER_GESTURE_CAPTURE", 4500);
        return;
      }
    };

    const handleTouchEnd = () => {
      if (touchTimer) clearTimeout(touchTimer);
    };

    const handleTouchCancel = () => {
      if (touchTimer) clearTimeout(touchTimer);
      // Hardware button press during touch cancels touch
      if (isMobile) {
        setIsScreenBlurred(true);
      }
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
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    window.addEventListener("keydown", handleKeyTrackerDown, true);
    window.addEventListener("keyup", handleKeyTrackerUp, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handlePageHide);
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
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
      window.removeEventListener("keydown", handleKeyTrackerDown, true);
      window.removeEventListener("keyup", handleKeyTrackerUp, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handlePrintChange);
      } else {
        mediaQueryList.removeListener(handlePrintChange);
      }
    };
  }, [enabled, materialId, isDrmDisabled, isSecurityAlertActive, isAccountBlocked, isMobile, isIOS, isAndroid]);

  return {
    isScreenBlurred,
    setIsScreenBlurred,
    resumeReading,
    isDevtoolsOpen,
    isSecurityAlertActive,
    isAccountBlocked,
    blockReason,
    violationsCount,
    isDrmDisabled,
    isMobile,
    logDrmEvent,
    toggleDrm: () => setDrmGloballyDisabled(!isDrmDisabled),
  };
}
