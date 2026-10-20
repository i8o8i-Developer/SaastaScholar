import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coffee,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { MockWindow, Pill, Reveal, Section, SectionHeading } from "./Primitives";

interface ScheduleItem {
  time: string;
  title: string;
  meta: string;
  tone: "green" | "warn" | "neutral" | "solid";
  tag: string;
}

const WEEK = [
  { day: "Mon", date: "18", items: 4 },
  { day: "Tue", date: "19", items: 3 },
  { day: "Wed", date: "20", items: 5 },
  { day: "Thu", date: "21", items: 2 },
  { day: "Fri", date: "22", items: 4 },
  { day: "Sat", date: "23", items: 1 },
  { day: "Sun", date: "24", items: 0 },
];

const DAILY_SCHEDULES: Record<string, ScheduleItem[]> = {
  Mon: [
    {
      time: "09:00",
      title: "Data Structures & Algorithms",
      meta: "Class · Room LT-01 · Unit 2: Trees & Traversal",
      tone: "green",
      tag: "Class",
    },
    {
      time: "11:00",
      title: "Discrete Mathematics",
      meta: "Class · Room LT-03 · Unit 3: Combinatorics",
      tone: "green",
      tag: "Class",
    },
    {
      time: "14:00",
      title: "Python Lab — Data Structures Coding",
      meta: "Practical · Lab A1 · Exercise 4 Verification",
      tone: "neutral",
      tag: "Practical",
    },
    {
      time: "17:00",
      title: "DSA Assignment 2 Submission Prep",
      meta: "Personal Study Block · 20 Marks",
      tone: "warn",
      tag: "Task",
    },
  ],
  Tue: [
    {
      time: "10:00",
      title: "Database Management Systems",
      meta: "Class · Room LT-02 · SQL & Normalization",
      tone: "green",
      tag: "Class",
    },
    {
      time: "12:30",
      title: "Operating Systems — CPU Scheduling",
      meta: "Class · Room LT-04 · Round Robin & Priority",
      tone: "neutral",
      tag: "Class",
    },
    {
      time: "16:00",
      title: "DBMS Tutorial Sheet 3 Due",
      meta: "Deadline · Online Submission Portal",
      tone: "warn",
      tag: "Deadline",
    },
  ],
  Wed: [
    {
      time: "08:30",
      title: "Engineering Mathematics III",
      meta: "Class · Room LT-02 · Laplace Transforms",
      tone: "neutral",
      tag: "Class",
    },
    {
      time: "10:30",
      title: "Introduction To AI & Heuristics",
      meta: "Class · Room LT-04 · Dr. Meera Raghav",
      tone: "green",
      tag: "Class",
    },
    {
      time: "12:00",
      title: "Assignment 3 — Draft Review",
      meta: "Personal Study Task · Uninformed Search",
      tone: "neutral",
      tag: "Task",
    },
    {
      time: "14:00",
      title: "AI Lab — Experiment 6: A* Search",
      meta: "Practical · Lab B2 · 50 Viva Q&A Ready",
      tone: "green",
      tag: "Practical",
    },
    {
      time: "17:00",
      title: "Mini Project — Sprint Check",
      meta: "Project Milestone · Section A Team",
      tone: "warn",
      tag: "Project",
    },
  ],
  Thu: [
    {
      time: "09:30",
      title: "Computer Networks & OSI Model",
      meta: "Class · Room LT-05 · Packet Routing",
      tone: "green",
      tag: "Class",
    },
    {
      time: "14:00",
      title: "DBMS Lab — SQL Joins & Schema Design",
      meta: "Practical · Lab B1 · MySQL Workbench",
      tone: "neutral",
      tag: "Practical",
    },
  ],
  Fri: [
    {
      time: "09:00",
      title: "Theory Of Computation & Automata",
      meta: "Class · Room LT-02 · DFA & NFA State Graphs",
      tone: "green",
      tag: "Class",
    },
    {
      time: "11:00",
      title: "Machine Learning Unit 2 Revision",
      meta: "Class · Room LT-04 · Supervised Models",
      tone: "neutral",
      tag: "Class",
    },
    {
      time: "14:00",
      title: "AI Lab Record Verification & Viva",
      meta: "Faculty Signature Session · Lab B2",
      tone: "green",
      tag: "Practical",
    },
    {
      time: "18:00",
      title: "Mid-Sem Prep: 2024 Solved PYQ Review",
      meta: "Personal Study Block · 5-Year Papers",
      tone: "warn",
      tag: "Task",
    },
  ],
  Sat: [
    {
      time: "11:00",
      title: "Weekly Solved PYQ Practice & Self-Test",
      meta: "Self-Paced Library Session · Discrete Maths",
      tone: "neutral",
      tag: "Self Study",
    },
  ],
  Sun: [],
};

const TRACKS = [
  "Daily Lectures & Room Numbers",
  "Lab Practical Experiments & Code",
  "Homework Submission Deadlines",
  "Exam Revision & Solved Papers",
  "Urgent College Announcements",
  "Personal Focus Study Time",
];

export function Planner() {
  const [activeDay, setActiveDay] = useState("Wed");

  const currentSchedule = DAILY_SCHEDULES[activeDay] || [];
  const activeDateInfo = WEEK.find((w) => w.day === activeDay);

  return (
    <Section id="planner" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Ambient Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-10 -translate-y-1/2 -z-10 h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[120px]"
      />

      <Reveal>
        <SectionHeading
          eyebrow="Class Timetable & Daily Planner"
          title="Your Daily Classes and Deadlines, Simplified."
          description="See What Class Is Next, Which Lab Needs Prep, And What Assignment Is Due — All On A Clean Daily Timeline."
        />
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] min-w-0">
        {/* Left Column: Interactive Date Bar & Dynamic Schedule Timeline */}
        <Reveal className="min-w-0">
          <MockWindow
            title={`Planner · August 2026 · ${activeDay} ${activeDateInfo?.date ?? ""}`}
            actions={
              <Pill tone="green">
                {currentSchedule.length} Events Synced
              </Pill>
            }
          >
            {/* Weekday Switcher Bar */}
            <ul className="grid grid-cols-7 gap-px border-b border-border bg-border min-w-0">
              {WEEK.map((d) => (
                <li
                  key={d.day}
                  onClick={() => setActiveDay(d.day)}
                  className={
                    activeDay === d.day
                      ? "bg-primary px-0.5 py-2 sm:px-2 sm:py-3 text-center text-primary-foreground cursor-pointer transition-all min-w-0 shadow-inner"
                      : "bg-card px-0.5 py-2 sm:px-2 sm:py-3 text-center transition-colors hover:bg-accent/50 cursor-pointer min-w-0"
                  }
                >
                  <p className="label-caps opacity-80 text-[0.55rem] sm:text-xs font-bold truncate">{d.day}</p>
                  <p className="mt-0.5 font-display text-xs sm:text-lg font-bold">{d.date}</p>
                  <p className="mt-0.5 text-[0.5rem] sm:text-[0.65rem] opacity-80 font-medium truncate">{d.items} Events</p>
                </li>
              ))}
            </ul>

            {/* Dynamic Event Rows */}
            {currentSchedule.length > 0 ? (
              <ol className="p-2.5 sm:p-4 min-w-0 space-y-1">
                {currentSchedule.map((item) => (
                  <li
                    key={item.title}
                    className="grid grid-cols-[2.8rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_minmax(0,1fr)] gap-2 sm:gap-4 border-l border-border pl-0 group min-w-0"
                  >
                    <span className="label-caps pt-2.5 sm:pt-3.5 text-[0.65rem] sm:text-xs text-muted-foreground font-mono truncate">
                      {item.time}
                    </span>
                    <span className="relative border-l border-border py-2.5 sm:py-3 pl-3 sm:pl-4 transition-colors group-hover:bg-accent/30 rounded-r-xl min-w-0">
                      <span
                        aria-hidden
                        className="absolute -left-[4.5px] top-4 sm:top-5 h-2 w-2 rounded-full bg-primary ring-4 ring-card"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                        <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </span>
                        <Pill tone={item.tone}>{item.tag}</Pill>
                      </div>
                      <span className="mt-1 block text-[0.7rem] sm:text-xs text-muted-foreground truncate">
                        {item.meta}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="p-8 text-center min-w-0">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                  <Coffee className="h-6 w-6" />
                </div>
                <h4 className="font-display font-bold text-sm sm:text-base text-foreground">
                  No Classes Scheduled For Sunday
                </h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                  Enjoy Your Break Or Revise At Your Own Pace!
                </p>
              </div>
            )}
          </MockWindow>
        </Reveal>

        {/* Right Column: Unified Tracking Info */}
        <Reveal delay={100} className="min-w-0">
          <div className="flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 p-5 sm:p-6 shadow-sm backdrop-blur-md min-w-0">
            <div>
              <span className="label-caps flex items-center gap-2 font-bold text-xs text-muted-foreground uppercase tracking-wider">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                Tracked In One Unified Timeline
              </span>

              <ul className="mt-5 space-y-1">
                {TRACKS.map((t) => (
                  <li
                    key={t}
                    className="flex items-center justify-between border-b border-border/60 py-3 text-xs font-semibold text-foreground/90"
                  >
                    <span>{t}</span>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-xl border border-border/80 bg-surface/90 p-4 min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Always Synced With Your Department</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Classes And Lab Sessions Update Automatically From Your Class Timetable.
                Your Personal Study Notes Stay Private.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
