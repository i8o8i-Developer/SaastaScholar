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
import { cn } from "@/Lib/Utils";
import { toast } from "sonner";
import { apiFetch, DepartmentNotice, SidebarBadgeConfig } from "@/Lib/Api";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [badgeConfigs, setBadgeConfigs] = useState<Record<string, { text: string; active: boolean; variant: string }>>({});
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

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

  // Fetch Live Notices As Real Notifications
  useEffect(() => {
    async function loadLiveNotices() {
      try {
        const res = await apiFetch<DepartmentNotice[]>("/academic/notices/");
        const items = Array.isArray(res) ? res : ((res as any)?.results || []);
        const formatted: NotificationItem[] = items.map((n: DepartmentNotice) => {
          const dateStr = n.published_at ? new Date(n.published_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent";
          return {
            id: n.id,
            title: n.title,
            content: n.content,
            category: n.category || "Official Notice",
            time: dateStr,
            is_read: false,
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

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileOpen(false);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All Notifications Marked As Read.");
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    toast.success("Notification Inbox Cleared.");
  };

  const handleToggleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !n.is_read } : n)),
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ===================== Desktop Sidebar ===================== */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col justify-between border-r border-border/80 bg-card/75 p-5 backdrop-blur-md shrink-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <img
              src="/NIMSWallah.png"
              onError={(e) => {
                e.currentTarget.src = "/favicon.png";
              }}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                NimsWallah
              </h2>
              <p className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-widest">
                Academic Command Engine
              </p>
            </div>
          </div>

          {/* Student Profile Quick Strip */}
          <div
            onClick={() => onSelectTab("profile")}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-border/80 bg-surface/70 p-3 shadow-2xs hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="relative">
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

            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform" />
          </div>

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
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/25"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {hasBadge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[0.6rem] font-bold tracking-wide transition-all",
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
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="text-[0.7rem] text-muted-foreground font-semibold">Theme Mode</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Of Workspace</span>
          </button>
        </div>
      </aside>

      {/* ===================== Mobile Drawer ===================== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs">
          <div className="flex h-full w-72 flex-col justify-between bg-card p-5 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <img
                    src="/NIMSWallah.png"
                    onError={(e) => {
                      e.currentTarget.src = "/favicon.png";
                    }}
                    alt="Logo"
                    className="h-7 w-7 object-contain"
                  />
                  <span className="font-bold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    NimsWallah
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl p-1.5 hover:bg-surface text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-1.5">
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
                        "flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all",
                        isActive
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/25"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {hasBadge && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[0.6rem] font-bold",
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

            <div className="pt-3 border-t border-border space-y-2">
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all active:scale-95"
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-card/85 px-4 sm:px-8 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-foreground lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
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

          {/* Quick Header Tools (Search Trigger, Notifications, User) */}
          <div className="flex items-center gap-2.5">
            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={() => onSelectTab("notes")}
              className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all cursor-pointer shadow-2xs"
            >
              <Search className="h-3.5 w-3.5 text-primary" />
              <span className="hidden md:inline font-medium">Search Courseware...</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card animate-pulse" />
                )}
              </button>

              {/* Notification Modal / Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-border bg-card p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <h3 className="font-display font-bold text-sm text-foreground">
                        Official Academic Notifications
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400">
                          {unreadCount} Unread
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
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      disabled={unreadCount === 0}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs",
                        unreadCount > 0
                          ? "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
                          : "bg-surface text-muted-foreground/50 border border-border cursor-not-allowed",
                      )}
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      <span>Mark As Read</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearAllNotifications}
                      disabled={notifications.length === 0}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-2xs",
                        notifications.length > 0
                          ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white active:scale-95"
                          : "bg-surface text-muted-foreground/50 border border-border cursor-not-allowed",
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        <CheckCircle2 className="h-9 w-9 text-emerald-500 mx-auto mb-2 opacity-60" />
                        <p className="font-bold text-sm text-foreground">Inbox Is Clean</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                          You Have Read All Current Department Examination &amp; Academic Circulars.
                        </p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleNotificationRead(item.id)}
                          className={cn(
                            "group rounded-2xl border p-3.5 text-xs transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                            item.is_read
                              ? "border-border/50 bg-surface/40 opacity-75 hover:opacity-100"
                              : "border-emerald-500/40 bg-emerald-500/5 shadow-xs hover:border-emerald-500/70",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded-lg bg-primary/10 text-primary px-2 py-0.5 text-[0.65rem] font-bold">
                              {item.category}
                            </span>
                            <span className="text-[0.65rem] text-muted-foreground font-mono">{item.time}</span>
                          </div>

                          <h4 className="mt-2 font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-[0.75rem] text-muted-foreground leading-relaxed">
                            {item.content}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-border/40 text-[0.65rem] text-muted-foreground">
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
                className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1.5 sm:px-2.5 transition-colors hover:border-primary/50 cursor-pointer"
              >
                <div className="grid h-6 w-6 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold overflow-hidden">
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
                <span className="hidden sm:inline font-bold text-xs text-foreground">
                  {user?.full_name?.split(" ")[0] || "Scholar"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl z-50 space-y-1">
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
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>Academic Profile Settings</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out Of Workspace</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Routed Dashboard Page Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background scrollbar-thin min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
