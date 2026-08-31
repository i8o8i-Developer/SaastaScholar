import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  FileCheck2,
  FileText,
  Flame,
  FlaskConical,
  GraduationCap,
  Layers,
  LineChart,
  PieChart,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Zap,
  Lock,
  Timer,
  ShieldAlert,
  AlertTriangle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { AcademicMaterial, apiFetch, DashboardSummary, StudentAssignment, Subject, TimetableSlot, studentSecurityApi } from "@/Lib/Api";
import { useAuth } from "@/Hooks/UseAuth";
import { cn } from "@/Lib/Utils";

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenReader: (materialId: string) => void;
}

export function DashboardOverview({ onNavigateTab, onOpenReader }: DashboardOverviewProps) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [sumRes, subsRes, matsRes, assignsRes, ttRes] = await Promise.allSettled([
          apiFetch<DashboardSummary>("/accounts/dashboard-summary/"),
          apiFetch<Subject[]>("/academic/subjects/"),
          apiFetch<AcademicMaterial[]>("/academic/materials/"),
          apiFetch<StudentAssignment[]>("/assignments/"),
          apiFetch<{ slots: TimetableSlot[] }>("/planner/timetable/"),
        ]);

        if (sumRes.status === "fulfilled" && sumRes.value) {
          setSummary(sumRes.value);
        }
        if (subsRes.status === "fulfilled") {
          const data = subsRes.value;
          setSubjects(Array.isArray(data) ? data : ((data as any)?.results || []));
        }
        if (matsRes.status === "fulfilled") {
          const data = matsRes.value;
          setMaterials(Array.isArray(data) ? data : ((data as any)?.results || []));
        }
        if (assignsRes.status === "fulfilled") {
          const data = assignsRes.value;
          setAssignments(Array.isArray(data) ? data : ((data as any)?.results || []));
        }
        if (ttRes.status === "fulfilled") {
          const data = ttRes.value?.slots || ttRes.value;
          setTimetableSlots(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const studentName = user?.full_name || summary?.user_name || "Student Scholar";
  const studentProgram = user?.program || summary?.program || "Undergraduate Degree";
  const targetCgpaNum = Number(user?.target_cgpa || summary?.target_cgpa || 10.0);

  // Dynamic counts
  const notesCount = materials.filter((m) => m.material_type === "NOTES").length;
  const pyqsCount = materials.filter((m) => m.material_type === "SOLVED_PYQ").length;
  const syllabusCount = materials.filter((m) => m.material_type === "SYLLABUS").length;
  const labsCount = summary?.metrics?.lab_manuals_count || materials.filter((m) => m.material_type === "LAB_MANUAL").length;
  const pendingAssignmentsCount = assignments.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length;

  // Timetable distribution per weekday
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timetableByDay = daysOfWeek.map((day) => {
    const count = timetableSlots.filter((slot) => slot.day_of_week === day).length;
    return { day, count, hours: count * 1.5 };
  });

  const [warningDismissed, setWarningDismissed] = useState(false);

  const handleAcknowledgeWarning = async () => {
    try {
      await studentSecurityApi.acknowledgeWarning();
      setWarningDismissed(true);
      toast.success("Disciplinary Warning Acknowledged.");
    } catch (err: any) {
      toast.error("Failed To Acknowledge Warning.");
    }
  };

  const isDrmBlocked = user?.is_drm_blocked || summary?.is_drm_blocked;
  const blockReason = user?.block_reason || summary?.block_reason;
  const cooldownUntil = user?.cooldown_until || summary?.cooldown_until;
  const isCooldownActive = cooldownUntil && new Date(cooldownUntil) > new Date();
  const warningNote = !warningDismissed && (user?.security_warning_note || summary?.security_warning_note);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      {/* ================= Security & Disciplinary Notice Banners ================= */}
      {warningNote && (
        <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-background to-rose-950/20 p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Official Disciplinary Notice From Administration</span>
              </span>
              <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                {warningNote}
              </p>
            </div>
          </div>
          <button
            onClick={handleAcknowledgeWarning}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all shrink-0 cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Acknowledge Notice</span>
          </button>
        </div>
      )}

      {isDrmBlocked && (
        <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-5 shadow-sm flex items-center gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-display font-bold text-sm text-rose-600 dark:text-rose-400">
              DRM Content Access Restricted By University Administration
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reason: <strong className="text-foreground">{blockReason || "Security/Policy Violation"}</strong>. Contact Department Administration or submit a ticket at Student Support Desk to appeal.
            </p>
          </div>
        </div>
      )}

      {/* DRM Cooldown Banner */}
      {isCooldownActive && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 backdrop-blur-md shadow-xs flex items-center gap-3.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Timer className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-display font-bold text-sm text-amber-600 dark:text-amber-400">
              Temporary Security Cooldown Active
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              DRM reading canvas is temporarily locked until <strong className="text-foreground font-mono">{new Date(cooldownUntil).toLocaleString("en-IN")}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ================= 1. Welcome Header Banner ================= */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-emerald-500/10 via-surface to-teal-500/10 p-6 sm:p-8 backdrop-blur-md shadow-xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NIMS Student Scholar Workspace</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome Back, {studentName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Enrolled In <strong className="text-foreground">{studentProgram}</strong> (Semester {user?.semester || 1} · Section {user?.section || "A"}). All Academic Analytics, DRM Notes, And Solved Papers Are Live.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Target CGPA Goal Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 sm:p-4 text-center shadow-xs">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[0.65rem] uppercase tracking-wider mb-1">
                <Target className="h-3.5 w-3.5" />
                <span>Target CGPA Goal</span>
              </div>
              <span className="font-display text-xl sm:text-2xl font-bold text-foreground font-mono">
                {targetCgpaNum.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">/ 10.00</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. Today's Lecture Schedule & Real-Time Clock Banner ================= */}
      {summary?.next_lecture?.day_status === "DAY_ENDED" ? (
        <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-emerald-500/5 via-card to-cyan-500/5 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[0.65rem] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  College Academic Day Has Ended For Today
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.2 text-[0.6rem] font-bold text-emerald-600 dark:text-emerald-400">
                  Classes Concluded
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-foreground mt-0.5">
                All Scheduled Lectures For Today Are Complete
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rest Up, Revise Notes, Or Prepare For Upcoming Sessions. Schedule Will Automatically Roll Over At Midnight.
              </p>
            </div>
          </div>
          {summary.next_lecture.day && summary.next_lecture.title && summary.next_lecture.title !== "No Scheduled Lectures In Blueprint" ? (
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="rounded-xl bg-surface border border-border/80 px-3 py-1.5 font-bold text-foreground">
                🗓️ {summary.next_lecture.day}: {summary.next_lecture.title}
              </span>
              {summary.next_lecture.room && (
                <span className="rounded-xl bg-surface border border-border/80 px-3 py-1.5 font-bold text-foreground">
                  📍 {summary.next_lecture.room}
                </span>
              )}
              <span className="rounded-xl bg-primary/10 px-3 py-1.5 font-bold font-mono text-primary">
                ⏰ {summary.next_lecture.time}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onNavigateTab("timetable")}
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>View Full Weekly Timetable</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : summary?.next_lecture?.day_status === "NO_CLASSES_TODAY" ? (
        <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-cyan-500/5 via-card to-indigo-500/5 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider">
                No Classroom Lectures Scheduled For Today
              </span>
              <h3 className="font-display font-bold text-base text-foreground mt-0.5">
                Academic Self-Study &amp; Revision Day
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Utilize This Time To Review Unit Notes, Solved PYQs, Or Complete Laboratory Assignments.
              </p>
            </div>
          </div>
          {summary.next_lecture.day && summary.next_lecture.title && summary.next_lecture.title !== "No Scheduled Lectures In Blueprint" ? (
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="rounded-xl bg-surface border border-border/80 px-3 py-1.5 font-bold text-foreground">
                🗓️ {summary.next_lecture.day}: {summary.next_lecture.title}
              </span>
              {summary.next_lecture.room && (
                <span className="rounded-xl bg-surface border border-border/80 px-3 py-1.5 font-bold text-foreground">
                  📍 {summary.next_lecture.room}
                </span>
              )}
              <span className="rounded-xl bg-primary/10 px-3 py-1.5 font-bold font-mono text-primary">
                ⏰ {summary.next_lecture.time}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onNavigateTab("timetable")}
              className="font-bold text-xs text-primary hover:underline cursor-pointer"
            >
              View Weekly Timetable →
            </button>
          )}
        </div>
      ) : summary?.next_lecture ? (
        <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
              summary.next_lecture.is_ongoing
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            )}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[0.65rem] uppercase font-bold tracking-wider",
                  summary.next_lecture.is_ongoing
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {summary.next_lecture.is_ongoing
                    ? "Active Lecture In Session"
                    : `Next Upcoming Lecture (${summary.next_lecture.day || "Today"})`}
                </span>
                {summary.next_lecture.is_ongoing && (
                  <span className="inline-flex items-center rounded-full bg-rose-500/20 px-2 py-0.2 text-[0.6rem] font-extrabold text-rose-600 dark:text-rose-400 animate-pulse">
                    Live Now
                  </span>
                )}
              </div>
              <h3 className="font-display font-bold text-base text-foreground mt-0.5">{summary.next_lecture.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{summary.next_lecture.topic}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {summary.next_lecture.faculty && (
              <span className="rounded-xl bg-surface px-3 py-1.5 font-semibold text-foreground/85">
                👨‍🏫 {summary.next_lecture.faculty}
              </span>
            )}
            <span className="rounded-xl bg-surface px-3 py-1.5 font-bold text-foreground">
              📍 {summary.next_lecture.room}
            </span>
            <span className="rounded-xl bg-primary/10 px-3 py-1.5 font-bold font-mono text-primary">
              ⏰ {summary.next_lecture.time}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary" />
            <span>No Lectures Scheduled In Timetable Matrix.</span>
          </div>
          <button onClick={() => onNavigateTab("timetable")} className="font-bold text-primary hover:underline cursor-pointer">
            View Weekly Timetable →
          </button>
        </div>
      )}

      {/* ================= 3. Five Dynamic Resource Cards ================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Card 1: Handwritten Notes */}
        <button
          onClick={() => onNavigateTab("notes")}
          className="rounded-3xl border border-border/80 bg-card p-5 text-left shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-[0.65rem] font-bold uppercase text-muted-foreground tracking-wider">Handwritten Notes</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-display text-2xl sm:text-3xl font-bold text-foreground font-mono">
                {notesCount} <span className="text-xs text-muted-foreground font-normal">Packs</span>
              </span>
              <p className="text-xs text-muted-foreground mt-1">Topper Verified Derivations</p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
            <span>Explore Unit Notes</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </button>

        {/* Card 2: Solved PYQs */}
        <button
          onClick={() => onNavigateTab("pyqs")}
          className="rounded-3xl border border-border/80 bg-card p-5 text-left shadow-xs hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-[0.65rem] font-bold uppercase text-muted-foreground tracking-wider">Solved PYQs</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-500/10 text-cyan-600">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-display text-2xl sm:text-3xl font-bold text-foreground font-mono">
                {pyqsCount} <span className="text-xs text-muted-foreground font-normal">Papers</span>
              </span>
              <p className="text-xs text-muted-foreground mt-1">Verified Step-by-Step Solutions</p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-cyan-600 group-hover:translate-x-1 transition-transform">
            <span>Open PYQ Archive</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </button>

        {/* Card 3: Official Syllabus */}
        <button
          onClick={() => onNavigateTab("syllabus")}
          className="rounded-3xl border border-border/80 bg-card p-5 text-left shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-[0.65rem] font-bold uppercase text-muted-foreground tracking-wider">Official Syllabus</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
                <ScrollText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-display text-2xl sm:text-3xl font-bold text-foreground font-mono">
                {syllabusCount} <span className="text-xs text-muted-foreground font-normal">Guides</span>
              </span>
              <p className="text-xs text-muted-foreground mt-1">Curriculum &amp; Exam Objectives</p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
            <span>View Syllabus</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </button>

        {/* Card 4: Lab Manuals */}
        <button
          onClick={() => onNavigateTab("labs")}
          className="rounded-3xl border border-border/80 bg-card p-5 text-left shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-[0.65rem] font-bold uppercase text-muted-foreground tracking-wider">Lab Manuals</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
                <FlaskConical className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-display text-2xl sm:text-3xl font-bold text-foreground font-mono">
                {labsCount} <span className="text-xs text-muted-foreground font-normal">Experiments</span>
              </span>
              <p className="text-xs text-muted-foreground mt-1">Multi-Language Code &amp; Viva Drills</p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
            <span>View Practical Hub</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </button>

        {/* Card 5: Assignments */}
        <button
          onClick={() => onNavigateTab("assignments")}
          className="rounded-3xl border border-border/80 bg-card p-5 text-left shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-[0.65rem] font-bold uppercase text-muted-foreground tracking-wider">Assignments</span>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-display text-2xl sm:text-3xl font-bold text-foreground font-mono">
                {pendingAssignmentsCount} <span className="text-xs text-muted-foreground font-normal">Pending</span>
              </span>
              <p className="text-xs text-muted-foreground mt-1">Due Dates &amp; IEEE Outline AI</p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
            <span>Track Submissions</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </button>
      </div>

      {/* ================= 4. REAL Dynamic Academic Analytics ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">
              Real-Time Academic Telemetry &amp; Curriculum Progress
            </h2>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            Live Database Telemetry
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Panel 1: Subject Modules & Coverage Matrix (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-display font-bold text-sm text-foreground">
                  Enrolled Subjects &amp; Published Material Coverage
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {subjects.length} Enrolled Courses
                </span>
              </div>

              <div className="space-y-4 mt-4">
                {subjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No Subjects Registered Yet. Create Subjects In Admin Portal.
                  </div>
                ) : (
                  subjects.map((sub) => {
                    const subNotes = materials.filter((m) => m.subject === sub.id && m.material_type === "NOTES").length;
                    const subPyqs = materials.filter((m) => m.subject === sub.id && m.material_type === "SOLVED_PYQ").length;
                    const progressPct = Math.min(Math.round((subNotes / 5) * 100), 100);

                    return (
                      <div key={sub.id} className="space-y-2 rounded-2xl bg-surface/60 p-3.5 border border-border/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold font-mono text-primary">
                              {sub.code}
                            </span>
                            <span className="font-bold text-xs text-foreground">{sub.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-600">
                            {subNotes}/5 Units Published
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                            style={{ width: `${Math.max(progressPct, 8)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground pt-1">
                          <span>Faculty: <strong className="text-foreground">{sub.faculty_name || "Department Faculty"}</strong></span>
                          <span>{subPyqs} Solved PYQs Available</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Panel 2: Weekly Timetable Distribution (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-display font-bold text-sm text-foreground">
                  Weekly Timetable Period Distribution
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {timetableSlots.length} Total Periods
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {timetableByDay.map(({ day, count, hours }) => {
                  const maxPeriods = 6;
                  const barWidth = Math.min(Math.round((count / maxPeriods) * 100), 100);

                  return (
                    <div key={day} className="flex items-center gap-3 text-xs">
                      <span className="w-10 font-bold font-mono text-foreground">{day}</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface border border-border/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${Math.max(barWidth, count > 0 ? 15 : 0)}%` }}
                        />
                      </div>
                      <span className="w-20 text-right font-mono text-muted-foreground text-[0.7rem]">
                        {count} Periods ({hours}h)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-surface/80 p-3.5 border border-border/60 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Semester Cohort:</span>
              <strong className="text-foreground">Semester {user?.semester || 1} (Section {user?.section || "A"})</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
