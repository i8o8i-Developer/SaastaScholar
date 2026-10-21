import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Save,
  RefreshCw,
  Crown,
  FileText,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/Lib/Api";
import { toast } from "sonner";
import { cn } from "@/Lib/Utils";

interface PlanConfig {
  id: string;
  tier: string;
  name: string;
  price_monthly: number;
  price_semester: number;
  permissions: {
    allowed_tabs: string[];
    can_access_notes: boolean;
    can_download_notes: boolean;
    can_access_labs: boolean;
    can_access_pyqs: boolean;
    can_access_faculty: boolean;
    can_access_assignments: boolean;
    max_daily_downloads: number;
    badge_title?: string;
  };
}

const ALL_PAGES = [
  { id: "overview", label: "Dashboard Overview Hub", desc: "General Dashboard, Announcements & Quick Links" },
  { id: "notes", label: "Handwritten Class Notes Hub", desc: "DRM-Protected Verified Professor Class Notes" },
  { id: "pyqs", label: "Solved Examination Papers (PYQs)", desc: "10-Year Solved University Semester Papers" },
  { id: "syllabus", label: "Official University Syllabus", desc: "Curriculum Units & Marking Distribution" },
  { id: "faculty", label: "Teacher Handouts & Slides", desc: "Direct Lecture Slide Decks & Handouts" },
  { id: "labs", label: "Labs & Practical Code Hub", desc: "Handwritten Lab Manuals & Viva Question Bank" },
  { id: "assignments", label: "Academic Assignment Helper", desc: "Model Solutions & Homework Guidance" },
  { id: "planner", label: "Timetable & Semester Planner", desc: "Routine Organizer & Attendance Targets" },
  { id: "notices", label: "Official Department Notices", desc: "Live Exam Schedules & Campus Circulars" },
  { id: "community-forum", label: "Student Community Forum", desc: "Peer-to-Peer Academic Discussion Boards" },
  { id: "student-desk", label: "Student Help Desk & Support", desc: "Grievances, Ticket Inquiries & Admin Contact" },
];

export function AdminPlanMatrixTab() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("FREE");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Active Tier Editing State
  const [activePerms, setActivePerms] = useState<{
    allowed_tabs: string[];
    can_access_notes: boolean;
    can_download_notes: boolean;
    can_access_labs: boolean;
    can_access_pyqs: boolean;
    can_access_faculty: boolean;
    can_access_assignments: boolean;
    max_daily_downloads: number;
    badge_title: string;
  }>({
    allowed_tabs: [],
    can_access_notes: true,
    can_download_notes: false,
    can_access_labs: false,
    can_access_pyqs: false,
    can_access_faculty: true,
    can_access_assignments: false,
    max_daily_downloads: 0,
    badge_title: "",
  });

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>("/subscriptions/admin/plans/matrix/");
      if (res && res.matrix) {
        setPlans(res.matrix);
        const current = res.matrix.find((p: any) => p.tier === selectedTier) || res.matrix[0];
        if (current) {
          setSelectedTier(current.tier);
          setActivePerms(current.permissions);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed To Fetch Plan Access Matrix.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleSelectTier = (tier: string) => {
    setSelectedTier(tier);
    const target = plans.find((p) => p.tier === tier);
    if (target) {
      setActivePerms({
        allowed_tabs: target.permissions.allowed_tabs || [],
        can_access_notes: target.permissions.can_access_notes ?? true,
        can_download_notes: target.permissions.can_download_notes ?? false,
        can_access_labs: target.permissions.can_access_labs ?? false,
        can_access_pyqs: target.permissions.can_access_pyqs ?? false,
        can_access_faculty: target.permissions.can_access_faculty ?? true,
        can_access_assignments: target.permissions.can_access_assignments ?? false,
        max_daily_downloads: target.permissions.max_daily_downloads ?? 0,
        badge_title: target.permissions.badge_title || "",
      });
    }
  };

  const handleToggleTab = (tabId: string) => {
    if (activePerms.allowed_tabs.includes("*")) {
      // If Currently Full Access (*), Convert To Explicit List Minus This Tab
      const allIds = ALL_PAGES.map((p) => p.id).filter((id) => id !== tabId);
      setActivePerms((prev) => ({ ...prev, allowed_tabs: allIds }));
      return;
    }

    const exists = activePerms.allowed_tabs.includes(tabId);
    let updated: string[];
    if (exists) {
      updated = activePerms.allowed_tabs.filter((t) => t !== tabId);
    } else {
      updated = [...activePerms.allowed_tabs, tabId];
    }
    setActivePerms((prev) => ({ ...prev, allowed_tabs: updated }));
  };

  const handleSaveMatrix = async () => {
    setSaving(true);
    try {
      const res = await apiFetch<any>("/subscriptions/admin/plans/matrix/", {
        method: "PATCH",
        body: JSON.stringify({
          tier: selectedTier,
          permissions: activePerms,
        }),
      });

      if (res && res.success) {
        toast.success(res.message || `Access Permissions For ${selectedTier} Plan Saved Successfully!`);
        // Update local plans state
        setPlans((prev) =>
          prev.map((p) => (p.tier === selectedTier ? { ...p, permissions: res.permissions } : p))
        );
      } else {
        toast.error(res?.error || "Failed To Update Plan Permissions.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network Error Saving Plan Access Matrix.");
    } finally {
      setSaving(false);
    }
  };

  const currentPlan = plans.find((p) => p.tier === selectedTier);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-r from-card/95 via-card/85 to-primary/10 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Granular Role-Based Access Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Plan Access & Page Permission Matrix
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Configure Precisely Which Academic Hubs, DRM Readers, And Study Features Are Unlocked For Free, Basic, Premium, And Elite Scholars.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMatrix}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>Reload Matrix</span>
          </button>
        </div>
      </div>

      {/* Plan Tier Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["FREE", "BASIC", "PREMIUM", "ELITE"].map((tier) => {
          const isSelected = selectedTier === tier;
          const planData = plans.find((p) => p.tier === tier);

          return (
            <button
              key={tier}
              type="button"
              onClick={() => handleSelectTier(tier)}
              className={cn(
                "flex flex-col items-start p-4 rounded-2xl border transition-all cursor-pointer text-left",
                isSelected
                  ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/40 -translate-y-0.5"
                  : "border-border/80 bg-card hover:border-border"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  {tier}
                </span>
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <Crown className="h-4 w-4 text-muted-foreground/60" />
                )}
              </div>
              <span className="text-sm font-extrabold text-foreground mt-1">
                {planData?.name || `${tier.toLowerCase()} plan`}
              </span>
              <span className="text-[0.68rem] text-muted-foreground mt-0.5">
                {planData ? `₹${planData.price_monthly}/mo • ₹${planData.price_semester}/sem` : "Configuring"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Permissions Configuration Panel */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Active Configuration
            </span>
            <h3 className="text-lg font-black text-foreground mt-0.5">
              Permissions For {currentPlan?.name || selectedTier}
            </h3>
            <p className="text-xs text-muted-foreground">
              Changes applied here will immediately take effect for all scholars subscribed to this tier.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveMatrix}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-deep active:scale-[0.98] disabled:opacity-60 cursor-pointer shrink-0"
          >
            {saving ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save {selectedTier} Permissions</span>
              </>
            )}
          </button>
        </div>

        {/* Feature Switches & Limits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* DRM PDF Download Toggle */}
          <div className="rounded-2xl border border-border/70 bg-background/50 p-4 space-y-2">
            <span className="text-xs font-bold text-foreground block">
              DRM PDF Download Capability
            </span>
            <p className="text-[0.68rem] text-muted-foreground leading-relaxed">
              Allows student to save encrypted offline copies of verified materials.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  setActivePerms((prev) => ({
                    ...prev,
                    can_download_notes: !prev.can_download_notes,
                  }))
                }
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  activePerms.can_download_notes
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : "bg-muted text-muted-foreground border border-border"
                )}
              >
                {activePerms.can_download_notes ? (
                  <>
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Download Allowed</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Download Blocked</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Daily Download Limit */}
          <div className="rounded-2xl border border-border/70 bg-background/50 p-4 space-y-2">
            <span className="text-xs font-bold text-foreground block">
              Daily Download Quota Limit
            </span>
            <p className="text-[0.68rem] text-muted-foreground leading-relaxed">
              Maximum items a student on this tier can download per 24 hours (0 = None).
            </p>
            <div className="pt-1">
              <input
                type="number"
                min="0"
                max="9999"
                value={activePerms.max_daily_downloads}
                onChange={(e) =>
                  setActivePerms((prev) => ({
                    ...prev,
                    max_daily_downloads: Math.max(0, parseInt(e.target.value) || 0),
                  }))
                }
                className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-bold focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Watermark / Badge Title */}
          <div className="rounded-2xl border border-border/70 bg-background/50 p-4 space-y-2">
            <span className="text-xs font-bold text-foreground block">
              Scholar Pass Title / Badge
            </span>
            <p className="text-[0.68rem] text-muted-foreground leading-relaxed">
              Custom badge rendered on student dashboard & PDF watermarks.
            </p>
            <div className="pt-1">
              <input
                type="text"
                value={activePerms.badge_title}
                onChange={(e) =>
                  setActivePerms((prev) => ({
                    ...prev,
                    badge_title: e.target.value,
                  }))
                }
                placeholder="e.g. Free Scholar, Achiever Pass"
                className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs font-bold focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Allowed Pages & Hubs Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>Accessible Dashboard Pages & Study Hubs</span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Toggle which pages students on this tier can visit without triggering a paywall.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActivePerms((prev) => ({
                    ...prev,
                    allowed_tabs: ALL_PAGES.map((p) => p.id),
                  }))
                }
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={() =>
                  setActivePerms((prev) => ({
                    ...prev,
                    allowed_tabs: ["overview", "profile", "membership"],
                  }))
                }
                className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Reset To Basic
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ALL_PAGES.map((page) => {
              const isAllowed =
                activePerms.allowed_tabs.includes("*") || activePerms.allowed_tabs.includes(page.id);

              return (
                <div
                  key={page.id}
                  onClick={() => handleToggleTab(page.id)}
                  className={cn(
                    "flex items-start justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none",
                    isAllowed
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
                      : "border-border/60 bg-muted/20 opacity-70 hover:opacity-100 hover:border-border"
                  )}
                >
                  <div className="space-y-1 pr-3">
                    <span className="text-xs font-bold text-foreground block">
                      {page.label}
                    </span>
                    <span className="text-[0.68rem] text-muted-foreground line-clamp-2 block leading-snug">
                      {page.desc}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold shrink-0 transition-colors",
                      isAllowed
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {isAllowed ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Save Trigger */}
        <div className="pt-4 border-t border-border/80 flex items-center justify-between">
          <p className="text-xs text-muted-foreground italic">
            Note: Administrators Always Maintain Unrestricted Access To All Pages Regardless Of Tier Settings.
          </p>

          <button
            type="button"
            onClick={handleSaveMatrix}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-deep active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Commit & Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
