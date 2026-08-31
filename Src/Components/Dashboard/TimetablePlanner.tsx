import React, { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
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
        const data = taskRes.value;
        setTasks(Array.isArray(data) ? data : []);
      }

      if (mileRes.status === "fulfilled") {
        const data = mileRes.value;
        setMilestones(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleAndMilestones();
  }, [selectedDay]);

  const handleToggleTask = async (taskId: string) => {
    try {
      const updated = await apiFetch<PersonalStudyTask>(`/planner/tasks/${taskId}/toggle/`, {
        method: "PATCH",
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update task.");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const created = await apiFetch<PersonalStudyTask>("/planner/tasks/", {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          date: new Date().toISOString().split("T")[0],
          time: newTaskTime || "18:30",
          priority: "MEDIUM",
        }),
      });
      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle("");
      toast.success("Study Task Added.");
    } catch (err: any) {
      toast.error(err.message || "Failed to add study task.");
    }
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiFetch(`/planner/tasks/${taskId}/`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Study Task Deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task.");
    }
  };

  const calculateDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Completed";
    if (diffDays === 0) return "Today!";
    return `${diffDays} Days`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto min-w-0">
      {/* ================= Header Banner ================= */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-emerald-500/10 via-surface to-teal-500/10 p-4 sm:p-7 backdrop-blur-md shadow-xs min-w-0">
        <div className="space-y-1.5 sm:space-y-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 sm:px-3 py-0.5 text-[0.65rem] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Synchronized Lecture &amp; Revision Matrix</span>
          </div>
          <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Timetable &amp; Study Planner
          </h1>
          <p className="text-[0.72rem] sm:text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Synchronized Lecture Timings, Lab Practical Batches, Room Allocations, And Personal Revision Tasks.
          </p>
        </div>

        {/* Weekday Segmented Grid (Seamless 6-Col Mobile Bar) */}
        <div className="mt-4 sm:mt-6 grid grid-cols-6 gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-surface/80 border border-border/70 shadow-2xs">
          {WEEKDAYS.map((day) => {
            const isActive = selectedDay === day;
            const isToday = todayCode === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 rounded-xl py-1.5 sm:py-2 px-1 text-xs font-bold transition-all cursor-pointer select-none",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-surface/50 hover:text-foreground",
                )}
              >
                <span className="text-[0.72rem] sm:text-xs font-bold">{day}</span>
                {isToday && (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.2 text-[0.5rem] sm:text-[0.58rem] font-extrabold uppercase leading-tight",
                    isActive ? "bg-white/25 text-white" : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  )}>
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 2-Column Schedule Workspace ================= */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-12 min-w-0 items-start">
        {/* Left: Day Schedule Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 sm:pb-3">
            <span className="font-display font-bold text-xs sm:text-sm text-foreground">
              {selectedDay} Schedule Timeline
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
            <div className="space-y-2.5 sm:space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-3.5 sm:p-5 shadow-xs flex flex-col justify-between space-y-2.5 sm:space-y-3 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="rounded-lg sm:rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] sm:text-xs font-bold font-mono text-primary">
                        {slot.subject_code || "ACAD"}
                      </span>
                      <span className="rounded-lg sm:rounded-full bg-surface px-2 py-0.5 text-[0.6rem] sm:text-[0.65rem] font-bold text-muted-foreground">
                        {slot.event_type}
                      </span>
                    </div>
                    <span className="font-mono text-[0.68rem] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-xs sm:text-sm text-foreground">{slot.title}</h4>
                    {slot.meta_info && (
                      <p className="text-[0.68rem] sm:text-xs text-muted-foreground mt-0.5">{slot.meta_info}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[0.68rem] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                      <span>{slot.room_number || "LT-01"}</span>
                    </span>
                    {slot.faculty_name && (
                      <span className="flex items-center gap-1 truncate max-w-[50%]">
                        <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
                        <span className="truncate">{slot.faculty_name}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
                    onClick={() => handleToggleTask(task.id)}
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
                        onClick={(e) => handleDeleteTask(task.id, e)}
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
