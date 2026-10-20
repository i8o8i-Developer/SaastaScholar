import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/Hooks/UseAuth";
import { apiFetch } from "@/Lib/Api";

export interface PlanPermissions {
  tier: string;
  is_admin: boolean;
  allowed_tabs: string[];
  can_access_notes: boolean;
  can_download_notes: boolean;
  can_access_labs: boolean;
  can_access_pyqs: boolean;
  can_access_faculty: boolean;
  can_access_assignments: boolean;
  max_daily_downloads: number;
  badge_title: string;
}

const DEFAULT_FREE_PERMISSIONS: PlanPermissions = {
  tier: "FREE",
  is_admin: false,
  allowed_tabs: ["overview", "syllabus", "planner", "timetable", "notices", "community-forum", "student-desk", "profile", "membership"],
  can_access_notes: true,
  can_download_notes: false,
  can_access_labs: false,
  can_access_pyqs: false,
  can_access_faculty: true,
  can_access_assignments: false,
  max_daily_downloads: 0,
  badge_title: "Free Scholar",
};

export function usePlanAccess() {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<PlanPermissions>(DEFAULT_FREE_PERMISSIONS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAccessMatrix = async () => {
    if (!isAuthenticated) {
      setPermissions(DEFAULT_FREE_PERMISSIONS);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<PlanPermissions>("/subscriptions/my-access/");
      if (data && data.allowed_tabs) {
        setPermissions(data);
      }
    } catch {
      // Fallback Based On User Access Tier
      const userTier = (user?.access_tier || "FREE").toUpperCase();
      if (user?.is_staff || user?.is_superuser) {
        setPermissions({
          tier: "ELITE",
          is_admin: true,
          allowed_tabs: ["*"],
          can_access_notes: true,
          can_download_notes: true,
          can_access_labs: true,
          can_access_pyqs: true,
          can_access_faculty: true,
          can_access_assignments: true,
          max_daily_downloads: 9999,
          badge_title: "Administrator",
        });
      } else if (userTier === "ELITE" || userTier === "ELITE_PLUS") {
        setPermissions({
          tier: "ELITE",
          is_admin: false,
          allowed_tabs: ["*"],
          can_access_notes: true,
          can_download_notes: true,
          can_access_labs: true,
          can_access_pyqs: true,
          can_access_faculty: true,
          can_access_assignments: true,
          max_daily_downloads: 9999,
          badge_title: "Elite Lifetime Scholar",
        });
      } else if (userTier === "PREMIUM" || userTier === "ACHIEVER") {
        setPermissions({
          tier: "PREMIUM",
          is_admin: false,
          allowed_tabs: ["overview", "notes", "pyqs", "syllabus", "faculty", "labs", "assignments", "planner", "timetable", "notices", "community-forum", "student-desk", "profile", "membership"],
          can_access_notes: true,
          can_download_notes: true,
          can_access_labs: true,
          can_access_pyqs: true,
          can_access_faculty: true,
          can_access_assignments: true,
          max_daily_downloads: 50,
          badge_title: "Premium Achiever",
        });
      } else if (userTier === "BASIC" || userTier === "SCHOLAR") {
        setPermissions({
          tier: "BASIC",
          is_admin: false,
          allowed_tabs: ["overview", "notes", "syllabus", "faculty", "planner", "timetable", "notices", "community-forum", "student-desk", "profile", "membership"],
          can_access_notes: true,
          can_download_notes: true,
          can_access_labs: false,
          can_access_pyqs: false,
          can_access_faculty: true,
          can_access_assignments: false,
          max_daily_downloads: 10,
          badge_title: "Basic Scholar",
        });
      } else {
        setPermissions(DEFAULT_FREE_PERMISSIONS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessMatrix();
  }, [isAuthenticated, user?.access_tier]);

  const hasTabAccess = useMemo(() => {
    return (tabId: string): boolean => {
      if (permissions.is_admin || permissions.tier === "ELITE") return true;
      if (permissions.allowed_tabs.includes("*")) return true;
      return permissions.allowed_tabs.includes(tabId.toLowerCase());
    };
  }, [permissions]);

  const getRequiredTierForTab = (tabId: string): "BASIC" | "PREMIUM" | "ELITE" => {
    switch (tabId.toLowerCase()) {
      case "notes":
        return "BASIC";
      case "pyqs":
      case "labs":
      case "assignments":
        return "PREMIUM";
      default:
        return "BASIC";
    }
  };

  return {
    permissions,
    loading,
    hasTabAccess,
    getRequiredTierForTab,
    refreshPermissions: fetchAccessMatrix,
  };
}
