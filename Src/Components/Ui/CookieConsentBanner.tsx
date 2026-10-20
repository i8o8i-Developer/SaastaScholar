import { useState, useEffect } from "react";
import { Cookie, ShieldCheck, Check, Settings2, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/Lib/Utils";

// Cookie Preferences Structure Definition
export interface CookiePreferences {
  essential: boolean; // Always True (JWT Auth, CSRF, DRM Session Token)
  analytics: boolean; // SigNoz OpenTelemetry Observability
  marketing: boolean; // Semester Announcements & Exam Alerts
  timestamp: string;
}

const STORAGE_KEY = "saastascholar_cookie_consent";

// Global Cookie & Privacy Consent Banner In Title Case
export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    // Check Prior Stored Consent
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Smooth Entrance Delay
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed: CookiePreferences = JSON.parse(saved);
        setAnalyticsConsent(parsed.analytics);
        setMarketingConsent(parsed.marketing);
      } catch (e) {
        setIsVisible(true);
      }
    }

    // Custom Event Listener For Reopening Preferences
    const handleOpenPreferences = () => {
      setShowPreferences(true);
      setIsVisible(true);
    };

    window.addEventListener("open_cookie_preferences", handleOpenPreferences);
    return () => window.removeEventListener("open_cookie_preferences", handleOpenPreferences);
  }, []);

  const savePreferences = (essentialOnly = false) => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: essentialOnly ? false : analyticsConsent,
      marketing: essentialOnly ? false : marketingConsent,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setIsVisible(false);
    setShowPreferences(false);

    toast.success(
      essentialOnly
        ? "Essential Privacy Mode Activated. Non-Essential Cookies Rejected."
        : "Cookie & Telemetry Preferences Saved Successfully!"
    );
  };

  const acceptAll = () => {
    setAnalyticsConsent(true);
    setMarketingConsent(true);
    const preferences: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setIsVisible(false);
    setShowPreferences(false);
    toast.success("All Cookies & Telemetry Approved. Thank You For Supporting SaastaScholar!");
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie & Privacy Consent"
      className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-2xl border border-emerald-500/25 bg-[#040806]/95 backdrop-blur-xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(5,150,105,0.18)] text-slate-200">
        {!showPreferences ? (
          // Main Compact Consent View
          <div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Cookie &amp; Privacy Consent</h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.65rem] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    DPDP &amp; GDPR
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed font-normal">
                  SaastaScholar Uses Strictly Necessary Cookies For JWT Authentication &amp; Forensic DRM Protection. We Also Use Privacy-First Telemetry To Monitor Academic Server Performance.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Customize
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => savePreferences(true)}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Granular Preferences View
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Privacy &amp; Cookie Preferences</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Back To Banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {/* Category 1: Strictly Necessary */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    Strictly Necessary Cookies
                    <span className="text-[0.65rem] text-emerald-400 font-mono">(Mandatory)</span>
                  </span>
                  <span className="text-[0.68rem] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Always Active
                  </span>
                </div>
                <p className="mt-1 text-[0.72rem] text-slate-300 leading-normal">
                  Required For Student JWT Authentication, CSRF Token Validation, Password Resets, And In-Memory Forensic DRM Watermarking. Cannot Be Disabled.
                </p>
              </div>

              {/* Category 2: Performance & Observability Telemetry */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Performance Telemetry (SigNoz)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsConsent}
                      onChange={(e) => setAnalyticsConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="mt-1 text-[0.72rem] text-slate-300 leading-normal">
                  Anonymized OpenTelemetry Metrics And Error Telemetry To Detect Server Latencies, Failed Document Loads, And Maintain 99.9% Academic Uptime.
                </p>
              </div>

              {/* Category 3: Announcements & Academic Alerts */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Exam Alerts &amp; Marketing</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="mt-1 text-[0.72rem] text-slate-300 leading-normal">
                  Allows Dispatching Semester Exam Dates, Hall Ticket Notifications, And Optional Discount Code Promotions To Your Registered Email Address.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => savePreferences(true)}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() => savePreferences(false)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
