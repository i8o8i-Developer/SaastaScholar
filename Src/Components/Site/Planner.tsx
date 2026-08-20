import { CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MockWindow, Pill, Reveal, Section, SectionHeading } from "./Primitives";

const WEEK = [
  { day: "Mon", date: "18", items: 4 },
  { day: "Tue", date: "19", items: 3 },
  { day: "Wed", date: "20", items: 5 },
  { day: "Thu", date: "21", items: 2 },
  { day: "Fri", date: "22", items: 4 },
  { day: "Sat", date: "23", items: 1 },
  { day: "Sun", date: "24", items: 0 },
];

const TIMELINE = [
  ["08:30", "Engineering Mathematics", "Class · Room LT-02", "neutral", "Class"],
  ["10:30", "Introduction To AI", "Class · Room LT-04 · Unit 2", "green", "Class"],
  ["12:00", "Assignment 3 — Draft Review", "Personal Study Task", "neutral", "Task"],
  ["14:00", "AI Lab — Experiment 6", "Practical · Lab B2", "green", "Practical"],
  ["17:00", "Mini Project — Sprint Check", "Project Milestone", "warn", "Project"],
  ["21:00", "Data Structures Assignment", "Deadline In 2 Days", "warn", "Deadline"],
] as const;

const TRACKS = [
  "Classes & Timetable",
  "Assignments & Submissions",
  "Exam Schedules",
  "Practicals & Lab Packets",
  "Project Sprints",
  "Urgent Deadlines",
  "Personal Study Tasks",
];

export function Planner() {
  const [activeDay, setActiveDay] = useState("Wed");

  return (
    <Section id="planner">
      <Reveal>
        <SectionHeading
          eyebrow="Student Planner & Schedule"
          title="Know What You Need To Do Next."
          description="A Single Timeline That Merges Your Timetable, Lab Sessions, Deadlines, Exams And Personal Study Blocks Into One Honest View Of The Week."
        />
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Reveal>
          <MockWindow
            title={`Planner · August 2026 · ${activeDay}`}
            actions={<Pill tone="green">Week 3 · Active</Pill>}
          >
            <ul className="grid grid-cols-7 gap-px border-b border-border bg-border min-w-0">
              {WEEK.map((d) => (
                <li
                  key={d.day}
                  onClick={() => {
                    setActiveDay(d.day);
                    toast.info(`📅 Switched View To ${d.day} (${d.date} Aug)`);
                  }}
                  className={
                    activeDay === d.day
                      ? "bg-primary px-0.5 py-2 sm:px-2 sm:py-3 text-center text-primary-foreground cursor-pointer transition-all min-w-0"
                      : "bg-card px-0.5 py-2 sm:px-2 sm:py-3 text-center transition-colors hover:bg-accent/50 cursor-pointer min-w-0"
                  }
                >
                  <p className="label-caps opacity-80 text-[0.55rem] sm:text-xs font-bold truncate">{d.day}</p>
                  <p className="mt-0.5 font-display text-xs sm:text-lg font-bold">{d.date}</p>
                  <p className="mt-0.5 text-[0.5rem] sm:text-[0.65rem] opacity-80 font-medium truncate">{d.items}m</p>
                </li>
              ))}
            </ul>
            <ol className="p-2.5 sm:p-4 min-w-0">
              {TIMELINE.map(([time, title, meta, tone, tag]) => (
                <li
                  key={title}
                  onClick={() => toast.success(`⏰ Reminder Set For: ${title} At ${time}`)}
                  className="grid grid-cols-[2.8rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_minmax(0,1fr)] gap-2 sm:gap-4 border-l border-border pl-0 group cursor-pointer min-w-0"
                >
                  <span className="label-caps pt-2.5 sm:pt-3.5 text-[0.65rem] sm:text-xs text-muted-foreground font-mono truncate">{time}</span>
                  <span className="relative border-l border-border py-2 sm:py-3 pl-3 sm:pl-5 transition-colors group-hover:bg-accent/30 rounded-r-lg min-w-0">
                    <span
                      aria-hidden
                      className="absolute -left-[4.5px] top-4 sm:top-5 h-2 w-2 rounded-full bg-primary ring-4 ring-card"
                    />
                    <span className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="text-xs sm:text-sm font-semibold group-hover:text-primary transition-colors truncate">
                        {title}
                      </span>
                      <Pill tone={tone}>{tag}</Pill>
                    </span>
                    <span className="mt-0.5 block text-[0.7rem] sm:text-xs text-muted-foreground truncate">{meta}</span>
                  </span>
                </li>
              ))}
            </ol>
          </MockWindow>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex h-full flex-col justify-between rounded-2xl border border-border-strong bg-card p-6 shadow-sm">
            <div>
              <span className="label-caps flex items-center gap-2 font-semibold text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Tracked In One Unified Timeline
              </span>
              <ul className="mt-5">
                {TRACKS.map((t) => (
                  <li
                    key={t}
                    className="flex items-center justify-between border-b border-border py-3.5 text-xs font-semibold text-foreground/90"
                  >
                    <span>{t}</span>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-bold text-foreground">Automatic Sync Enabled</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Academic Events Populate Automatically From Your Section Timetable. Personal Tasks
                Remain 100% Private To You.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
