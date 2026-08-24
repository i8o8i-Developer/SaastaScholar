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

    const triggerBlackoutShield = (reason: string, durationMs = 3500) => {
      setIsScreenBlurred(true);
      setIsSecurityAlertActive(true);

      // Overwrite clipboard immediately on screenshot shortcut attempt
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("🔒 Protected Academic Material — Copyright NIMS University. Redistribution is strictly prohibited.");
        }
      } catch (e) {
        // Ignore clipboard write restrictions
      }

      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        setIsScreenBlurred(false);
        setIsSecurityAlertActive(false);
      }, durationMs);

      // Telemetry log to backend
      apiFetch("/drm/security-report/", {
        method: "POST",
        body: JSON.stringify({
          material_id: materialId,
          event_type: reason,
          details: {
            timestamp: new Date().toISOString(),
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            user_agent: navigator.userAgent,
          },
        }),
      }).catch(() => {});
    };

    // Track keys for Snipping Tool heuristic
    let isMetaPressed = false;
    let isShiftPressed = false;

    const handleKeyTrackerDown = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.metaKey) isMetaPressed = true;
      if (e.key === "Shift" || e.shiftKey) isShiftPressed = true;
    };
    const handleKeyTrackerUp = (e: KeyboardEvent) => {
      if (e.key === "Meta") isMetaPressed = false;
      if (e.key === "Shift") isShiftPressed = false;
    };

    // 1. Intercept Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerBlackoutShield("CONTEXT_MENU_BLOCKED", 2500);
      toast.error(toTitleCase("Right-Click Context Actions Are Disabled On DRM Documents."));
    };

    // 2. Comprehensive Screenshot, DevTools & Print Interceptor
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // PrintScreen Key
      if (e.key === "PrintScreen" || e.code === "PrintScreen" || key === "printscreen") {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SCREENSHOT_HOTKEY_DETECTED", 3000);
        toast.error(toTitleCase("Screen Capture Intercepted. Blackout Engaged."));
        return;
      }

      // Windows / Mac Snipping Combos (Ctrl+Shift+S, Meta+Shift+S, Cmd+Shift+3/4/5)
      if (
        (isCtrlOrMeta && e.shiftKey && (key === "s" || e.code === "KeyS")) ||
        (e.metaKey && e.shiftKey && ["3", "4", "5", "s"].includes(key)) ||
        (e.altKey && e.key === "PrintScreen")
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SNIPPING_TOOL_SHORTCUT", 3000);
        toast.error(toTitleCase("Snipping Tool Shortcut Intercepted."));
        return;
      }

      // Print Prevention: Ctrl+P / Cmd+P
      if (isCtrlOrMeta && (key === "p" || e.code === "KeyP")) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("PRINT_BLOCKED", 3000);
        toast.error(toTitleCase("Document Printing Is Blocked By DRM Policy."));
        return;
      }

      // Save Webpage: Ctrl+S / Cmd+S
      if (isCtrlOrMeta && (key === "s" || e.code === "KeyS")) {
        e.preventDefault();
        e.stopPropagation();
        triggerBlackoutShield("SAVE_BLOCKED", 2500);
        toast.error(toTitleCase("Saving Protected Document Offline Is Prohibited."));
        return;
      }

      // View Source / Inspection: Ctrl+U, F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === "F12" ||
        (isCtrlOrMeta && key === "u") ||
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
        triggerBlackoutShield("COPY_BLOCKED", 2000);
        toast.error(toTitleCase("Text Selection And Copying Are Prohibited."));
        return;
      }
    };

    // 3. Tab Visibility & Snipping Tool Blur Heuristic
    const handleBlur = () => {
      if (isMetaPressed && isShiftPressed) {
        triggerBlackoutShield("SNIPPING_TOOL_SHORTCUT", 5000);
        toast.error(toTitleCase("Snipping Tool Intercepted."));
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenBlurred(true);
      } else {
        setIsScreenBlurred(false);
        setIsSecurityAlertActive(false);
      }
    };

    // 4. Native Print Media Query Listener
    const mediaQueryList = window.matchMedia("print");
    const handlePrintChange = (mql: MediaQueryListEvent | MediaQueryList) => {
      if (mql.matches) {
        triggerBlackoutShield("PRINT_DIALOG_DETECTED", 4000);
      }
    };

    window.addEventListener("beforeprint", () => triggerBlackoutShield("PRINT_DIALOG_DETECTED", 4000));
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyTrackerDown, true);
    window.addEventListener("keyup", handleKeyTrackerUp, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handlePrintChange);
    } else {
      mediaQueryList.addListener(handlePrintChange);
    }

    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyTrackerDown, true);
      window.removeEventListener("keyup", handleKeyTrackerUp, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handlePrintChange);
      } else {
        mediaQueryList.removeListener(handlePrintChange);
      }
    };
  }, [enabled, materialId]);

  return {
    isScreenBlurred,
    setIsScreenBlurred,
    resumeReading,
    isDevtoolsOpen,
    isSecurityAlertActive,
  };
}
