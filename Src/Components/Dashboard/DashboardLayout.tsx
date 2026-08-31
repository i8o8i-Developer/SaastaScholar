import React, { useEffect, useState } from "react";
import {
  Award,
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Cpu,
  FileCheck2,
  FileText,
  Flame,
  FlaskConical,
  GraduationCap,
  Home,
  Layers,
  LibraryBig,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  ScrollText,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/Hooks/UseAuth";
import { useTheme } from "@/Hooks/UseTheme";
import { cn } from "@/Lib/Utils";
import { toast } from "sonner";
import { apiFetch, DepartmentNotice, SidebarBadgeConfig } from "@/Lib/Api";
import { MarkdownContent } from "@/Components/Ui/MarkdownContent";
import { BroadcastBanner } from "@/Components/Ui/BroadcastBanner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenReader?: (materialId: string) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  category: string;
  time: string;
  is_read: boolean;
}

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard Overview", icon: Home, badge: null },
  { id: "notes", label: "Handwritten Notes", icon: BookOpen, badge: "Topper" },
  { id: "pyqs", label: "Solved PYQs", icon: FileCheck2, badge: "2020–25" },
  { id: "syllabus", label: "Official Syllabus", icon: ScrollText, badge: "Curriculum" },
  { id: "faculty", label: "Faculty Materials", icon: LibraryBig, badge: "Uploads" },
  { id: "labs", label: "Labs & Viva Voce", icon: FlaskConical, badge: "50+ Q&A" },
  { id: "assignments", label: "Assignment Tracker", icon: FileText, badge: "AI Tool" },
  { id: "planner", label: "Timetable & Planner", icon: Calendar, badge: "Live" },
  { id: "notices", label: "Department Notices", icon: Bell, badge: "New" },
  { id: "community-forum", label: "Community Forum", icon: MessageSquare, badge: "Active" },
  { id: "student-desk", label: "Student Support Desk", icon: LifeBuoy, badge: "Help" },
  { id: "profile", label: "Academic Profile", icon: User, badge: null },
];

export function DashboardLayout({ children, activeTab, onSelectTab, onOpenReader }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [badgeConfigs, setBadgeConfigs] = useState<Record<string, { text: string; active: boolean; variant: string }>>({});
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Fetch Dynamic Navigation Badges
  useEffect(() => {
    async function loadBadges() {
      try {
        const res = await apiFetch<SidebarBadgeConfig[]>("/academic/badges/");
        const items = Array.isArray(res) ? res : ((res as any)?.results || []);
        const map: Record<string, { text: string; active: boolean; variant: string }> = {};
        items.forEach((b: any) => {
          map[b.id] = {
            text: b.badge_text,
            active: b.is_active,
            variant: b.badge_variant || "emerald",
          };
        });
        setBadgeConfigs(map);
      } catch (err) {
        // Keep default fallback
      }
    }
    loadBadges();
  }, []);

  // Fetch Live Notices As Real Notifications With LocalStorage Persistence
  useEffect(() => {
    async function loadLiveNotices() {
      try {
        const res = await apiFetch<DepartmentNotice[]>("/academic/notices/");
        const items = Array.isArray(res) ? res : ((res as any)?.results || []);
        
        let readIds: string[] = [];
        let clearedIds: string[] = [];
        try {
          readIds = JSON.parse(localStorage.getItem("nimswallah_read_notices") || "[]");
          clearedIds = JSON.parse(localStorage.getItem("nimswallah_cleared_notices") || "[]");
        } catch {}

        const formatted: NotificationItem[] = items
          .filter((n: DepartmentNotice) => !clearedIds.includes(n.id))
          .map((n: DepartmentNotice) => {
            const dateStr = n.published_at ? new Date(n.published_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent";
            return {
              id: n.id,
              title: n.title,
              content: n.content,
              category: n.category || "Official Notice",
              time: dateStr,
              is_read: readIds.includes(n.id),
            };
          });
        setNotifications(formatted);
      } catch (err) {
        setNotifications([]);
      }
    }
    loadLiveNotices();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Global Keyboard Shortcut for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === "Escape") {
        setSearchModalOpen(false);
        setNotificationsOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileOpen(false);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, is_read: true }));
      try {
        const allIds = updated.map((n) => n.id);
        const existing: string[] = JSON.parse(localStorage.getItem("nimswallah_read_notices") || "[]");
        const merged = Array.from(new Set([...existing, ...allIds]));
        localStorage.setItem("nimswallah_read_notices", JSON.stringify(merged));
      } catch {}
      return updated;
    });
    toast.success("All Notifications Marked As Read.");
  };

  const handleClearAllNotifications = () => {
    try {
      const allIds = notifications.map((n) => n.id);
      const existing: string[] = JSON.parse(localStorage.getItem("nimswallah_cleared_notices") || "[]");
      const merged = Array.from(new Set([...existing, ...allIds]));
      localStorage.setItem("nimswallah_cleared_notices", JSON.stringify(merged));
    } catch {}
    setNotifications([]);
    toast.success("Notification Inbox Cleared.");
  };

  const handleToggleNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, is_read: !n.is_read } : n));
      try {
        const item = updated.find((n) => n.id === id);
        let existing: string[] = JSON.parse(localStorage.getItem("nimswallah_read_notices") || "[]");
        if (item?.is_read) {
          existing = Array.from(new Set([...existing, id]));
        } else {
          existing = existing.filter((x) => x !== id);
        }
        localStorage.setItem("nimswallah_read_notices", JSON.stringify(existing));
      } catch {}
      return updated;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ===================== Desktop Sidebar ===================== */}
      <aside
        className={cn(
          "hidden lg:flex flex-col justify-between border-r border-border/80 bg-card/75 backdrop-blur-md shrink-0 transition-all duration-300",
          sidebarCollapsed ? "w-20 p-3" : "w-64 xl:w-72 p-5"
        )}
      >
        <div>
          {/* Brand Header with Collapse / Expand Trigger */}
          <div className={cn("flex items-center gap-3 py-1", sidebarCollapsed ? "justify-center px-0" : "justify-between px-2")}>
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/NIMSWallah.png"
                onError={(e) => {
                  e.currentTarget.src = "/favicon.png";
                }}
                alt="Logo"
                className="h-8 w-8 object-contain shrink-0"
              />
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent truncate">
                    NimsWallah
                  </h2>
                  <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest truncate">
                    Academic Engine
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer shrink-0"
              title={sidebarCollapsed ? "Expand Sidebar (Open)" : "Collapse Sidebar (Close)"}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          {/* Student Profile Quick Strip */}
          {!sidebarCollapsed ? (
            <div
              onClick={() => onSelectTab("profile")}
              className="mt-6 flex items-center gap-3 rounded-2xl border border-border/80 bg-surface/70 p-3 shadow-2xs hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="relative shrink-0">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-xs overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="font-bold">{user?.full_name?.charAt(0) || "S"}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {user?.full_name || "Scholar Portal"}
                </h4>
                <p className="text-[0.65rem] text-muted-foreground font-mono truncate">
                  {(user as any)?.program_code || "B.Tech"} · Sem {user?.semester || 1}
                </p>
              </div>

              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform shrink-0" />
            </div>
          ) : (
            <div
              onClick={() => onSelectTab("profile")}
              className="mt-4 flex justify-center cursor-pointer group"
              title={`${user?.full_name || "Scholar"} - Academic Profile`}
            >
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-xs overflow-hidden group-hover:scale-105 transition-transform">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="font-bold">{user?.full_name?.charAt(0) || "S"}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
              </div>
            </div>
          )}

          {/* Navigation Links List */}
          <nav className="mt-6 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const dynamicConfig = badgeConfigs[item.id];
              const badgeText = dynamicConfig !== undefined ? (dynamicConfig.active ? dynamicConfig.text : "") : item.badge;
              const hasBadge = Boolean(badgeText && badgeText.trim().length > 0);
              const variant = dynamicConfig?.variant || "emerald";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    "flex w-full items-center rounded-2xl text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]",
                    sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5",
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/25"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && hasBadge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[0.6rem] font-bold tracking-wide transition-all whitespace-nowrap shrink-0 leading-none min-w-fit inline-block",
                        isActive
                          ? "bg-white/20 text-white"
                          : variant === "amber"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : variant === "purple"
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          : variant === "rose"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : variant === "cyan"
                          ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                          : variant === "blue"
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {badgeText}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-border/80">
          <div className={cn("flex items-center text-xs", sidebarCollapsed ? "justify-center" : "justify-between px-2")}>
            {!sidebarCollapsed && <span className="text-[0.7rem] text-muted-foreground font-semibold">Theme Mode</span>}
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Sign Out Of Workspace"
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all active:scale-95",
              sidebarCollapsed ? "p-2.5 w-full" : "p-2.5 w-full"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ===================== Mobile Drawer ===================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs">
          <div className="flex h-full w-[85vw] max-w-xs flex-col justify-between bg-card p-3 xs:p-5 shadow-2xl">
            <div className="min-w-0">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="/NIMSWallah.png"
                    onError={(e) => {
                      e.currentTarget.src = "/favicon.png";
                    }}
                    alt="Logo"
                    className="h-7 w-7 object-contain shrink-0"
                  />
                  <span className="font-bold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent truncate">
                    NimsWallah
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl p-1.5 hover:bg-surface text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto py-3 space-y-1 max-h-[calc(100vh-140px)]">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const dynamicConfig = badgeConfigs[item.id];
                  const badgeText = dynamicConfig !== undefined ? (dynamicConfig.active ? dynamicConfig.text : "") : item.badge;
                  const hasBadge = Boolean(badgeText && badgeText.trim().length > 0);
                  const variant = dynamicConfig?.variant || "emerald";

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl xs:rounded-2xl px-2.5 xs:px-3.5 py-2 xs:py-2.5 text-xs font-semibold cursor-pointer transition-all",
                        isActive
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/25"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2 xs:gap-3 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {hasBadge && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 xs:px-2 py-0.5 text-[0.55rem] xs:text-[0.6rem] font-bold shrink-0",
                            variant === "amber"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : variant === "purple"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                              : variant === "rose"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : variant === "cyan"
                              ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                              : variant === "blue"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                          )}
                        >
                          {badgeText}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 xs:pt-3 border-t border-border space-y-2">
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-xl xs:rounded-2xl border border-rose-500/20 bg-rose-500/5 p-2 xs:p-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out Of Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Main Routed Content & Header ===================== */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border/80 bg-card/85 px-2 xs:px-4 sm:px-8 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 xs:gap-3 min-w-0">
            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-8 w-8 xs:h-9 xs:w-9 place-items-center rounded-xl border border-border bg-surface text-foreground lg:hidden cursor-pointer shrink-0"
              title="Open Navigation"
            >
              <Menu className="h-4 w-4 xs:h-5 xs:w-5" />
            </button>

            {/* Desktop Sidebar Toggle Trigger */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer shrink-0"
              title={sidebarCollapsed ? "Open / Expand Sidebar" : "Close / Collapse Sidebar"}
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Program & Semester Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/70 bg-surface/80 px-3 py-1 text-xs">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold text-foreground">{(user as any)?.program_code || "B.Tech"}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold text-muted-foreground">Semester {user?.semester || 1}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Sec {user?.section || "A"}</span>
            </div>
          </div>

          {/* Quick Header Tools (Global Search, Notifications, User) */}
          <div className="flex items-center gap-1.5 xs:gap-2.5">
            {/* Global Search Command Trigger Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-1.5 xs:gap-2 rounded-xl xs:rounded-2xl border border-border/80 bg-surface/80 px-2.5 xs:px-3.5 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all cursor-pointer shadow-2xs group"
            >
              <Search className="h-3.5 w-3.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline font-medium">Search Courseware...</span>
              <kbd className="hidden lg:inline-flex items-center rounded border border-border bg-card px-1.5 py-0.5 text-[0.6rem] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Theme Switcher Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-8 w-8 xs:h-9 xs:w-9 place-items-center rounded-xl border border-border bg-surface text-foreground hover:bg-card cursor-pointer transition-all shadow-2xs shrink-0"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative grid h-8 w-8 xs:h-9 xs:w-9 place-items-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card animate-pulse" />
                )}
              </button>

              {/* Notification Modal / Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-[-3rem] xs:right-0 mt-3 w-[calc(100vw-1.5rem)] max-w-sm rounded-2xl xs:rounded-3xl border border-border bg-card p-3 xs:p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-border/80 pb-2.5 xs:pb-3">
                    <div className="flex items-center gap-1.5 xs:gap-2">
                      <Bell className="h-4 w-4 text-primary shrink-0" />
                      <h3 className="font-display font-bold text-xs xs:text-sm text-foreground truncate">
                        Academic Notifications
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-emerald-500/10 px-1.5 xs:px-2 py-0.5 text-[0.55rem] xs:text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {unreadCount} New
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Responsive Action Buttons Bar */}
                  <div className="grid grid-cols-2 gap-1.5 xs:gap-2 my-2.5 xs:my-3">
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      disabled={unreadCount === 0}
                      className={cn(
                        "flex items-center justify-center gap-1 rounded-xl px-2 xs:px-3 py-1.5 xs:py-2 text-[0.65rem] xs:text-xs font-bold transition-all cursor-pointer shadow-2xs",
                        unreadCount > 0
                          ? "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
                          : "bg-surface text-muted-foreground/50 border border-border cursor-not-allowed",
                      )}
                    >
                      <CheckCheck className="h-3 w-3 xs:h-3.5 xs:w-3.5 shrink-0" />
                      <span className="truncate">Mark Read</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearAllNotifications}
                      disabled={notifications.length === 0}
                      className={cn(
                        "flex items-center justify-center gap-1 rounded-xl px-2 xs:px-3 py-1.5 xs:py-2 text-[0.65rem] xs:text-xs font-bold transition-all cursor-pointer shadow-2xs",
                        notifications.length > 0
                          ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white active:scale-95"
                          : "bg-surface text-muted-foreground/50 border border-border cursor-not-allowed",
                      )}
                    >
                      <Trash2 className="h-3 w-3 xs:h-3.5 xs:w-3.5 shrink-0" />
                      <span className="truncate">Clear All</span>
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div className="space-y-2 max-h-[280px] xs:max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="py-6 xs:py-8 text-center text-xs text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                        <p className="font-bold text-foreground">You Are All Caught Up!</p>
                        <p className="text-[0.65rem] mt-0.5">No Unread Notices In Your Pipeline.</p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleNotificationRead(item.id)}
                          className={cn(
                            "rounded-xl xs:rounded-2xl border p-2.5 xs:p-3 text-xs transition-all cursor-pointer group",
                            item.is_read
                              ? "border-border/50 bg-card/40 opacity-75 hover:opacity-100 hover:bg-surface/50"
                              : "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10",
                          )}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="rounded-md bg-surface px-1.5 py-0.5 text-[0.6rem] font-bold font-mono text-primary truncate max-w-[120px]">
                              {item.category}
                            </span>
                            <span className="text-[0.6rem] font-mono text-muted-foreground shrink-0">
                              {item.time}
                            </span>
                          </div>

                          <h4 className="font-bold text-foreground text-xs leading-snug break-words">
                            {item.title}
                          </h4>
                          <div className="mt-1 text-[0.7rem] text-muted-foreground line-clamp-2 leading-relaxed break-words">
                            <MarkdownContent content={item.content} />
                          </div>

                          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-border/40 text-[0.6rem] text-muted-foreground">
                            <span>{item.is_read ? "Status: Read" : "Status: Unread"}</span>
                            <span className="text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.is_read ? "Click To Mark Unread" : "Click To Mark Read"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1 xs:p-1.5 sm:px-2.5 transition-colors hover:border-primary/50 cursor-pointer shrink-0"
              >
                <div className="grid h-6 w-6 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold overflow-hidden shrink-0">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="font-bold">{user?.full_name?.charAt(0) || "S"}</span>
                </div>
                <span className="hidden sm:inline font-bold text-xs text-foreground truncate max-w-[80px]">
                  {user?.full_name?.split(" ")[0] || "Scholar"}
                </span>
                <ChevronDown className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-muted-foreground shrink-0" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-[14rem] rounded-2xl border border-border bg-card p-2 shadow-xl z-50 space-y-1">
                  <div className="p-2 border-b border-border/60">
                    <p className="font-bold text-xs text-foreground truncate">{user?.full_name}</p>
                    <p className="text-[0.65rem] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onSelectTab("profile");
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-surface cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">Profile Settings</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Routed Dashboard Page Canvas */}
        <main className="flex-1 overflow-y-auto p-2 xs:p-4 sm:p-6 lg:p-8 bg-background scrollbar-thin min-w-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full mb-4 sm:mb-6">
            <BroadcastBanner target="DASHBOARD" />
          </div>
          {children}
        </main>
      </div>

      {/* ===================== Global Search Command Palette (Modal) ===================== */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-border/80 pb-3">
              <Search className="h-5 w-5 text-primary shrink-0 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search Handwritten Notes, PYQs, Syllabus, Faculty Materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Navigation Results List */}
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider px-2 block mb-2">
                Courseware Hubs &amp; Tools
              </span>
              {[
                { title: "Handwritten Notes & Derivations", tab: "notes", category: "Academic Courseware", icon: BookOpen, desc: "Unit-wise topper notes, formulas, and diagrams" },
                { title: "Solved PYQs & Model Answer Keys", tab: "pyqs", category: "Exam Archive", icon: FileCheck2, desc: "Solved previous year exam questions 2020-2027" },
                { title: "Official Institutional Syllabus", tab: "syllabus", category: "Curriculum", icon: ScrollText, desc: "Unit learning objectives and course outlines" },
                { title: "Faculty Materials & Handouts", tab: "faculty", category: "Faculty Resources", icon: LibraryBig, desc: "Professor slides, presentations, and handouts" },
                { title: "Lab Manuals & Practical Viva", tab: "labs", category: "Practical Labs", icon: FlaskConical, desc: "Lab experiments, procedures, and viva Q&A" },
                { title: "Assignment Tracker & Deadlines", tab: "assignments", category: "Tasks & Deadlines", icon: Code2, desc: "Pending assignments and AI code analysis" },
                { title: "Timetable & Daily Study Planner", tab: "planner", category: "Daily Schedule", icon: Calendar, desc: "Lecture schedules, venues, and revision matrix" },
                { title: "Department Notices & Circulars", tab: "notices", category: "Bulletins", icon: Bell, desc: "Exam circulars, holidays, and official updates" },
                { title: "Community Discussions Forum", tab: "community-forum", category: "Peer Discussions", icon: MessageSquare, desc: "Ask doubts and share solutions with students" },
                { title: "Student Support & Query Desk", tab: "student-desk", category: "Help & Grievance", icon: LifeBuoy, desc: "Submit tickets and resolve academic inquiries" },
              ]
                .filter((item) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    item.title.toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q) ||
                    item.desc.toLowerCase().includes(q)
                  );
                })
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.tab);
                        setSearchModalOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl p-3 text-left transition-all hover:bg-surface hover:border-primary/40 border border-transparent cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[0.7rem] text-muted-foreground truncate">{item.desc}</p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-surface px-2 py-0.5 text-[0.6rem] font-bold text-muted-foreground font-mono shrink-0">
                        {item.category}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* Footer Shortcut Info */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[0.65rem] text-muted-foreground">
              <span>Press <kbd className="font-mono bg-surface px-1.5 py-0.5 rounded border border-border">ESC</kbd> to close</span>
              <span>Global Courseware Search Engine</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
