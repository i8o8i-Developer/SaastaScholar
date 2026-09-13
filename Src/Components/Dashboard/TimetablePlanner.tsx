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
import {
  WEEKDAYS,
  useIstClock,
} from "@/Lib/IstTime";

export function TimetablePlanner() {
  const istClock = useIstClock();
  const todayCode = istClock.weekdayCode;
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
          target_date: istClock.dateIso,
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
      {/* ================= Header Banner with Weekday Controls & Live IST Sync ================= */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-6 shadow-xs min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

          {/* Dedicated Real-Time IST Synchronization Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 sm:p-4 shrink-0 flex flex-col justify-center space-y-1 shadow-xs min-w-[210px]">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live IST Sync</span>
              </span>
              <span className="text-[0.58rem] font-mono font-bold text-muted-foreground bg-surface/80 px-1.5 py-0.5 rounded border border-border/60">
                UTC+05:30
              </span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-black text-foreground tracking-tight flex items-baseline gap-1">
              <span>{istClock.timeString}</span>
              <span className="text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400">IST</span>
            </div>
            <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-muted-foreground">
              <Clock className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="truncate">{istClock.dateString}</span>
            </div>
          </div>
        </div>

        {/* Equal 7-Column Segmented Weekday Matrix */}
        <div className="mt-4 sm:mt-6 min-w-0">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 p-1.5 rounded-2xl bg-surface/80 border border-border/80 shadow-2xs min-w-0">
            {WEEKDAYS.map((day) => {
              const isActive = selectedDay === day;
              const isToday = todayCode === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl py-2 px-0.5 sm:px-1 text-center transition-all cursor-pointer select-none",
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25 scale-[1.02]"
                      : "text-muted-foreground hover:bg-surface/50 hover:text-foreground font-semibold",
                  )}
                >
                  <span className="text-xs sm:text-sm font-bold tracking-tight">{day}</span>
                  {isToday && (
                    <span className={cn(
                      "inline-block mt-0.5 rounded-full px-1 sm:px-1.5 py-0.2 text-[0.5rem] sm:text-[0.6rem] font-extrabold uppercase leading-none",
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
            <span className="text-[0.68rem] sm:text-xs font-mono text-muted-foreground font-bold">
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
                {selectedDay === "Sun" ? "No Classroom Lectures On Sunday" : `No Lectures Scheduled For ${selectedDay}`}
              </h3>
              <p className="text-[0.72rem] sm:text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {selectedDay === "Sun"
                  ? "Sunday Is An Institutional Self-Study & Revision Day. Use This Quiet Period To Revise Unit Notes, Solve Previous Year Papers, Or Work On Personal Study Goals."
                  : "No Active Timetable Slots Configured For This Day. Utilize This Time For Unit Notes Revision, Lab Prep, Or Adding Personal Study Goals."}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                {selectedDay === "Sun" ? (
                  <button
                    type="button"
                    onClick={() => setSelectedDay("Mon")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-deep shadow-xs transition-all cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>View Monday Schedule</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = WEEKDAYS.indexOf(selectedDay as any);
                      const nextDayIndex = idx >= 0 ? (idx + 1) % WEEKDAYS.length : 0;
                      setSelectedDay(WEEKDAYS[nextDayIndex] || "Mon");
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-surface border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-card shadow-2xs transition-all cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>View Next Day</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Visual Connected Timeline Track */
            <div className="relative pl-4 sm:pl-6 border-l-2 border-dashed border-border/80 space-y-3 sm:space-y-4 ml-2 sm:ml-3">
              {slots.map((slot) => {
                const isLab = (slot.event_type || "").toLowerCase().includes("lab") || (slot.title || "").toLowerCase().includes("lab");
                const isViewingToday = selectedDay === todayCode;
                const isLiveNow = isViewingToday && slot.start_time <= istClock.current24HourTime && istClock.current24HourTime <= slot.end_time;
                const isUpcoming = isViewingToday && slot.start_time > istClock.current24HourTime;
                const isConcluded = isViewingToday && slot.end_time < istClock.current24HourTime;

                return (
                  <div key={slot.id} className="relative group">
                    {/* Timeline Node Indicator Dot */}
                    <div className={cn(
                      "absolute -left-[23px] sm:-left-[31px] top-4.5 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 bg-background flex items-center justify-center shadow-xs transition-transform group-hover:scale-125 z-10",
                      isLiveNow ? "border-rose-500 scale-110" : isLab ? "border-cyan-500" : "border-emerald-500"
                    )}>
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isLiveNow ? "bg-rose-500 animate-ping" : isLab ? "bg-cyan-500 animate-pulse" : "bg-emerald-500"
                      )} />
                    </div>

                    {/* Timeline Event Card */}
                    <div
                      className={cn(
                        "rounded-2xl sm:rounded-3xl border bg-gradient-to-b from-card via-card to-surface/30 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md space-y-3",
                        isLiveNow
                          ? "border-rose-500/60 shadow-rose-500/10 ring-1 ring-rose-500/30"
                          : isLab
                          ? "border-cyan-500/30 hover:border-cyan-500/60"
                          : "border-emerald-500/30 hover:border-emerald-500/60"
                      )}
                    >
                      {/* Card Header: Badges & Time */}
                      <div className="flex items-center justify-between border-b border-border/60 pb-2.5 gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className={cn(
                            "rounded-xl px-2.5 py-0.5 text-xs font-mono font-bold border",
                            isLiveNow
                              ? "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
                              : isLab
                              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                          )}>
                            {slot.subject_code || "ACAD"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-xl bg-surface border border-border/70 px-2 py-0.5 text-[0.65rem] font-bold text-muted-foreground">
                            {isLab ? <FlaskConical className="h-3 w-3 text-cyan-600 dark:text-cyan-400" /> : <BookOpen className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />}
                            <span>{slot.event_type || "Class Lecture"}</span>
                          </span>
                          {isLiveNow && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[0.62rem] font-extrabold text-rose-600 dark:text-rose-400 animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                              Live In Session (IST)
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.62rem] font-bold text-emerald-600 dark:text-emerald-400">
                              Upcoming Today
                            </span>
                          )}
                          {isConcluded && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-surface border border-border/80 px-2 py-0.5 text-[0.62rem] font-medium text-muted-foreground">
                              Concluded
                            </span>
                          )}
                        </div>

                        <div className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] sm:text-xs font-bold text-foreground bg-surface/80 border border-border/60 px-2.5 py-1 rounded-xl shadow-2xs">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span>{slot.start_time} - {slot.end_time}</span>
                        </div>
                      </div>

                      {/* Middle: Title */}
                      <div>
                        <h4 className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                          {slot.title}
                        </h4>
                      </div>

                      {/* Footer: Room, Faculty & Semester Chips */}
                      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 font-mono font-semibold bg-surface px-2.5 py-1 rounded-xl border border-border/60">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-bold text-foreground">{slot.room_number || "LT-01"}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-mono bg-surface px-2.5 py-1 rounded-xl border border-border/60 font-semibold text-foreground">
                            <Layers className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Sem {slot.semester || 1} • Sec {slot.section || "A"}</span>
                          </span>
                        </div>

                        {slot.faculty_name && (
                          <span className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-xl border border-border/60 truncate">
                            <User className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate font-semibold text-foreground">{slot.faculty_name}</span>
                          </span>
                        )}
                      </div>
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
