import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FlaskConical,
  Layers,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { apiFetch, MilestoneCountdown, PersonalStudyTask, TimetableSlot } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";
import { toast } from "sonner";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getTodayCode = (): string => {
  const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const map: Record<number, string> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 0: "Mon" };
  return map[dayIndex] || "Mon";
};

export function TimetablePlanner() {
  const todayCode = getTodayCode();
  const [selectedDay, setSelectedDay] = useState<string>(todayCode);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [tasks, setTasks] = useState<PersonalStudyTask[]>([]);
  const [milestones, setMilestones] = useState<MilestoneCountdown[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskTime, setNewTaskTime] = useState<string>("18:30");
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSlots, setExpandedSlots] = useState<Record<string, boolean>>({});

  const toggleSlotExpand = (slotId: string) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [slotId]: !prev[slotId],
    }));
  };

  const loadScheduleAndMilestones = async () => {
    try {
      setLoading(true);
      const [timeRes, taskRes, mileRes] = await Promise.allSettled([
        apiFetch<{ slots: TimetableSlot[] }>(`/planner/timetable/?day=${selectedDay}`),
        apiFetch<PersonalStudyTask[]>("/planner/tasks/"),
        apiFetch<MilestoneCountdown[]>("/planner/milestones/"),
      ]);

      if (timeRes.status === "fulfilled") {
        const data = timeRes.value?.slots || timeRes.value;
        setSlots(Array.isArray(data) ? data : []);
      } else {
        setSlots([]);
      }

      if (taskRes.status === "fulfilled") {
        const tData = taskRes.value;
        setTasks(Array.isArray(tData) ? tData : []);
      }

      if (mileRes.status === "fulfilled") {
        const mData = mileRes.value;
        setMilestones(Array.isArray(mData) ? mData : []);
      }
    } catch {
      toast.error("Failed To Load Live Timetable And Milestones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleAndMilestones();
  }, [selectedDay]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const created = await apiFetch<PersonalStudyTask>("/planner/tasks/", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          scheduled_time: newTaskTime || "18:30",
          target_date: new Date().toISOString().split("T")[0],
          category: "Study",
        }),
      });

      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle("");
      toast.success("Study Goal Appended To Today's Plan!");
    } catch {
      toast.error("Failed To Create Study Task.");
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
    );

    try {
      await apiFetch(`/planner/tasks/${taskId}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_completed: !currentStatus }),
      });
    } catch {
      toast.error("Failed To Synchronize Task Status.");
      loadScheduleAndMilestones();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await apiFetch(`/planner/tasks/${taskId}/`, { method: "DELETE" });
      toast.success("Task Removed.");
    } catch {
      toast.error("Failed To Delete Task.");
      loadScheduleAndMilestones();
    }
  };

  const calculateDaysRemaining = (targetDate: string): string => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Concluded";
    if (days === 0) return "Today";
    return `${days} Days Left`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      {/* ================= Header Banner with Weekday Controls ================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-6 shadow-xs min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.68rem] font-bold text-primary font-mono">
            <Calendar className="h-3.5 w-3.5" />
            <span>Synchronized Lecture &amp; Revision Matrix</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Timetable &amp; Study Planner
          </h1>
          <p className="text-[0.72rem] sm:text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Synchronized Lecture Timings, Lab Practical Batches, Room Allocations, And Personal Revision Tasks.
          </p>
        </div>

        {/* Dropdown Weekday Selector + Equal 6-Col Segmented Grid */}
        <div className="mt-4 sm:mt-6 space-y-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 shrink-0">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Select Weekday:</span>
            </label>
            <div className="relative w-full sm:w-64">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="h-10 w-full appearance-none rounded-2xl border border-border/80 bg-card px-3.5 pr-10 text-xs font-bold text-foreground focus:border-primary focus:outline-none shadow-2xs cursor-pointer"
              >
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>
                    {d === "Mon" && "Monday (Mon)"}
                    {d === "Tue" && "Tuesday (Tue)"}
                    {d === "Wed" && "Wednesday (Wed)"}
                    {d === "Thu" && "Thursday (Thu)"}
                    {d === "Fri" && "Friday (Fri)"}
                    {d === "Sat" && "Saturday (Sat)"}
                    {todayCode === d ? " • Today" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-surface/80 border border-border/80 shadow-2xs min-w-0">
            {WEEKDAYS.map((day) => {
              const isActive = selectedDay === day;
              const isToday = todayCode === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl py-2 px-1 text-center transition-all cursor-pointer select-none",
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25 scale-[1.02]"
                      : "text-muted-foreground hover:bg-surface/50 hover:text-foreground font-semibold",
                  )}
                >
                  <span className="text-xs sm:text-sm font-bold tracking-tight">{day}</span>
                  {isToday && (
                    <span className={cn(
                      "inline-block mt-0.5 rounded-full px-1.5 py-0.2 text-[0.52rem] sm:text-[0.6rem] font-extrabold uppercase leading-none",
                      isActive ? "bg-white/30 text-white" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold"
                    )}>
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= 2-Column Schedule Workspace ================= */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12 min-w-0 items-start">
        {/* Left: Day Schedule Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 sm:pb-3">
            <span className="font-display font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{selectedDay} Schedule Timeline</span>
            </span>
            <span className="text-[0.68rem] sm:text-xs font-mono text-muted-foreground">
              {slots.length} Events Scheduled
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 sm:h-24 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/60 animate-pulse" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center space-y-3">
              <Clock className="h-9 w-9 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40" />
              <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                No Lectures Scheduled For {selectedDay}
              </h3>
              <p className="text-[0.72rem] sm:text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                No Active Timetable Slots Configured For This Day. Utilize This Time For Unit Notes Revision, Lab Prep, Or Adding Personal Study Goals.
              </p>
            </div>
          ) : (
            /* Visual Connected Timeline Track */
            <div className="relative pl-4 sm:pl-6 border-l-2 border-dashed border-border/80 space-y-3 sm:space-y-4 ml-2 sm:ml-3">
              {slots.map((slot) => {
                const isLab = (slot.event_type || "").toLowerCase().includes("lab") || (slot.title || "").toLowerCase().includes("lab");
                const isExpanded = Boolean(expandedSlots[slot.id]);

                return (
                  <div key={slot.id} className="relative group">
                    {/* Timeline Node Indicator Dot */}
                    <div className={cn(
                      "absolute -left-[23px] sm:-left-[31px] top-4.5 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 bg-background flex items-center justify-center shadow-xs transition-transform group-hover:scale-125 z-10",
                      isLab ? "border-cyan-500" : "border-emerald-500"
                    )}>
                      <div className={cn("h-1.5 w-1.5 rounded-full", isLab ? "bg-cyan-500 animate-pulse" : "bg-emerald-500")} />
                    </div>

                    {/* Timeline Event Card */}
                    <div
                      className={cn(
                        "rounded-2xl sm:rounded-3xl border bg-gradient-to-b from-card via-card to-surface/30 p-3.5 sm:p-4 shadow-xs transition-all hover:shadow-md",
                        isLab
                          ? "border-cyan-500/30 hover:border-cyan-500/60"
                          : "border-emerald-500/30 hover:border-emerald-500/60"
                      )}
                    >
                      {/* Card Header: Badges, Time & Accordion Dropdown Trigger */}
                      <div className="flex items-center justify-between border-b border-border/60 pb-2.5 gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className={cn(
                            "rounded-xl px-2.5 py-0.5 text-xs font-mono font-bold border",
                            isLab
                              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                          )}>
                            {slot.subject_code || "ACAD"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-xl bg-surface border border-border/70 px-2 py-0.5 text-[0.65rem] font-bold text-muted-foreground">
                            {isLab ? <FlaskConical className="h-3 w-3 text-cyan-600 dark:text-cyan-400" /> : <BookOpen className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />}
                            <span>{slot.event_type || "Class"}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="inline-flex items-center gap-1 font-mono text-[0.7rem] sm:text-xs font-bold text-foreground bg-surface/80 border border-border/60 px-2.5 py-1 rounded-xl shadow-2xs">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                            <span>{slot.start_time} - {slot.end_time}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleSlotExpand(slot.id)}
                            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
                            title={isExpanded ? "Collapse Details" : "Expand Details"}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Middle: Title & Meta */}
                      <div className="mt-2.5">
                        <h4 className="font-display font-bold text-xs sm:text-sm md:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                          {slot.title}
                        </h4>
                      </div>

                      {/* Footer: Room & Faculty Chips */}
                      <div className="mt-3 pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 font-mono font-semibold bg-surface px-2.5 py-1 rounded-xl border border-border/60">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="font-bold text-foreground">{slot.room_number || "LT-01"}</span>
                        </span>
                        {slot.faculty_name && (
                          <span className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-xl border border-border/60 truncate max-w-[60%] sm:max-w-none">
                            <User className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate font-semibold text-foreground">{slot.faculty_name}</span>
                          </span>
                        )}
                      </div>

                      {/* Dropdown / Collapsible Accordion Drawer */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-dashed border-border/80 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                          <div className="rounded-xl bg-surface/80 p-2.5 border border-border/60 text-xs space-y-1">
                            <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider block">
                              Academic Session Insights
                            </span>
                            <p className="text-muted-foreground leading-relaxed text-[0.75rem]">
                              {slot.meta_info || "Standard university curriculum session. Recommended to review Topper Notes & Solved PYQs prior to lecture."}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[0.7rem] font-bold">
                            <div className="rounded-xl border border-border/60 bg-surface/50 p-2 flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate">Sem {slot.semester || 1} • Sec {slot.section || "A"}</span>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-surface/50 p-2 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">{slot.room_number || "Lecture Hall"}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Personal Tasks & Real Milestone Countdowns (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Personal Study Checklist Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                Personal Study Checklist
              </span>
              <span className="text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                {tasks.filter((t) => t.is_completed).length}/{tasks.length} Completed
              </span>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add Study Task (E.g. Revise Unit 2)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="h-10 flex-1 rounded-2xl border border-border bg-surface px-3.5 text-xs focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary-deep active:scale-95 transition-all cursor-pointer shadow-xs"
                title="Add Task"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No Tasks Added Yet. Add A Study Goal Above.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, task.is_completed)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-2xl border p-3 text-xs transition-all cursor-pointer hover:scale-[1.01]",
                      task.is_completed
                        ? "border-border/60 bg-surface/40 opacity-70"
                        : "border-border bg-card shadow-2xs hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-lg border transition-colors",
                          task.is_completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-border bg-surface",
                        )}
                      >
                        {task.is_completed && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <span
                        className={cn(
                          "font-semibold text-foreground truncate",
                          task.is_completed && "line-through text-muted-foreground",
                        )}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.65rem] text-muted-foreground">{task.time}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="text-muted-foreground hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. REAL Upcoming Examination & Milestone Countdown Card */}
          <div className="rounded-3xl border border-border/80 bg-surface/70 p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-bold text-xs text-foreground">Examination &amp; Milestone Countdowns</span>
              </div>
              <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[0.65rem] font-bold">
                Live Timetable Sync
              </span>
            </div>

            {milestones.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No Examination Dates Published Yet. Admin Can Broadcast Exam Milestones.
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/60 shadow-2xs">
                    <div className="min-w-0">
                      <span className="font-bold text-foreground block truncate">{m.title}</span>
                      <span className="text-[0.65rem] text-muted-foreground">{m.target_date} · {m.category}</span>
                    </div>
                    <span className="rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 text-xs font-bold font-mono shrink-0">
                      {calculateDaysRemaining(m.target_date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
