import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  Megaphone,
  Pin,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { cn } from "@/Lib/Utils";
import { DepartmentNotice, apiFetch } from "@/Lib/Api";

export function DepartmentNotices() {
  const [notices, setNotices] = useState<DepartmentNotice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadNotices() {
      try {
        const res = await apiFetch<DepartmentNotice[]>("/academic/notices/");
        const items = Array.isArray(res) ? res : ((res as any)?.results || []);
        setNotices(items);
        if (items.length > 0) {
          setExpandedNoticeId(items[0].id);
        }
      } catch (err) {
        console.error("Error Loading Notices:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, []);

  const filteredNotices = notices.filter((item) => {
    const matchesCat =
      selectedCategory === "ALL" || item.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.reference_number || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto min-w-0">
      {/* ================= Header Banner ================= */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-emerald-500/10 via-surface to-teal-500/10 p-6 sm:p-8 backdrop-blur-md shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Megaphone className="h-3.5 w-3.5" />
              <span>Official University Communications</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Department Circulars &amp; Notices
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Official Examination Schedules, Record Submission Deadlines, Department Notices &amp; Syllabus Circulars Synchronized In Real Time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-border/80 bg-card p-3 text-center shadow-xs">
              <span className="block text-[0.65rem] text-muted-foreground font-bold uppercase">Active Notices</span>
              <span className="font-mono text-base font-bold text-primary">{notices.length} Published</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Search & Category Filter Controls ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Circulars by Keyword, Topic, or Ref No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border bg-card pr-3.5 pl-10 text-xs font-medium focus:border-primary focus:outline-none transition-colors shadow-2xs"
          />
        </div>

        {/* Category Selector (Mobile Dropdown + Desktop Wrapping Pills) */}
        <div className="sm:hidden relative w-full">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-11 w-full appearance-none rounded-2xl border border-border/80 bg-card px-3.5 pr-10 text-xs font-bold text-foreground focus:border-primary focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Circulars</option>
            <option value="EXAMINATION">Examinations</option>
            <option value="LAB_NOTICES">Lab Notices</option>
            <option value="ACADEMIC">Academic</option>
            <option value="CIRCULAR">General Circulars</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: "ALL", label: "All Circulars" },
            { id: "EXAMINATION", label: "Examinations" },
            { id: "LAB_NOTICES", label: "Lab Notices" },
            { id: "ACADEMIC", label: "Academic" },
            { id: "CIRCULAR", label: "General Circulars" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= Notices Feed List ================= */}
      <div className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            return (
              <div
                key={notice.id}
                className={cn(
                  "rounded-3xl border transition-all bg-card p-5 sm:p-7 shadow-xs space-y-4",
                  notice.priority === "HIGH" || notice.priority === "URGENT"
                    ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/5 via-card to-card ring-1 ring-emerald-500/20"
                    : "border-border/80 hover:border-border",
                )}
              >
                {/* Notice Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase",
                        notice.category.toUpperCase().includes("EXAM") && "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20",
                        notice.category.toUpperCase().includes("LAB") && "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20",
                        notice.category.toUpperCase().includes("ACAD") && "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
                        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                      )}
                    >
                      {notice.category}
                    </span>

                    <span className="font-mono text-[0.7rem] text-muted-foreground font-semibold">
                      Ref: {notice.reference_number || "NIMS-2026"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{notice.published_at ? new Date(notice.published_at).toLocaleDateString() : "Active Circular"}</span>
                  </div>
                </div>

                {/* Notice Title */}
                <div>
                  <h2 className="font-display text-base sm:text-lg font-bold text-foreground leading-snug">
                    {notice.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {notice.content}
                  </p>
                </div>

                {/* Notice Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-border/70">
                  <div className="flex items-center gap-2 text-muted-foreground text-[0.75rem]">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">Issued By: {notice.published_by || "Dean Of Academic Affairs"}</span>
                  </div>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-[0.65rem] font-bold text-muted-foreground">
                    Target: {notice.is_broadcast_all ? "All University Students" : `Semester ${notice.target_semester}`}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-muted-foreground mx-auto">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-base text-foreground">No Official Circulars Dispatched Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Official University Circulars And Examination Notifications Dispatched By Administrators Will Appear Here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
