import {
  ArrowRight,
  Award,
  BellRing,
  BookMarked,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Cpu,
  Download,
  FileCheck2,
  FileText,
  Flame,
  FlaskConical,
  GraduationCap,
  Layers,
  NotebookPen,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { cn } from "@/Lib/Utils";
import { Cta, MockWindow, Pill, Reveal } from "./Primitives";

const DASHBOARD_ITEMS = [
  {
    icon: CalendarClock,
    label: "Today's Class",
    title: "Machine Learning — Unit 2",
    meta: "10:30 AM · Room LT-04 · Dr. Meera Raghav",
    tone: "green" as const,
    tag: "Now",
  },
  {
    icon: NotebookPen,
    label: "New Assignment",
    title: "Data Structures — Assignment 3",
    meta: "Due in 2 days · 20 marks",
    tone: "red" as const,
    tag: "Due Soon",
  },
  {
    icon: FlaskConical,
    label: "Upcoming Practical",
    title: "AI Lab — Experiment 6: A* Search",
    meta: "Tomorrow · 2:00 PM · Lab B2",
    tone: "blue" as const,
    tag: "Prep Ready",
  },
  {
    icon: BellRing,
    label: "Recent Notice",
    title: "Mid-Sem Timetable Released",
    meta: "Department Of CSE · 32 minutes ago",
    tone: "green" as const,
    tag: "Department",
  },
  {
    icon: FileText,
    label: "Previous-Year Paper",
    title: "Discrete Mathematics — 2024 Solved",
    meta: "PDF · 18 pages · Verified",
    tone: "blue" as const,
    tag: "Solved",
  },
  {
    icon: BookOpen,
    label: "Upcoming Exam",
    title: "Mid-Semester Examination I",
    meta: "Starts 14 Sept · 6 subjects",
    tone: "red" as const,
    tag: "24 Days",
  },
];

const TRACK_1_ITEMS = [
  { icon: GraduationCap, text: "University Curriculum Aligned", tag: "Official", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: Cpu, text: "B.Tech Computer Science & AI", tag: "Course", tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { icon: FileCheck2, text: "Solved Previous-Year Papers (2020–2025)", tag: "Verified", tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { icon: FlaskConical, text: "Lab Manuals & Practical Codes", tag: "Labs", tone: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { icon: BookMarked, text: "Topper Handwritten Unit Notes", tag: "Top Rated", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: Sparkles, text: "AI Assignment Creator & Formatter", tag: "AI Tool", tone: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  { icon: ShieldCheck, text: "Curated Student Study Bundles", tag: "Curriculum", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: Users, text: "Verified Department Study Portal", tag: "Academic", tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { icon: Award, text: "Faculty-Verified Model Answers", tag: "Exam Prep", tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
];

const TRACK_2_ITEMS = [
  { icon: BookOpen, title: "Discrete Mathematics", desc: "2024 Solved PYQ Paper", badge: "PDF" },
  { icon: Cpu, title: "Machine Learning Unit 2", desc: "Supervised & Unsupervised", badge: "Notes" },
  { icon: FlaskConical, title: "AI Lab Viva Cheat-Sheet", desc: "50+ Q&A Answer Key", badge: "Viva" },
  { icon: FileText, title: "Data Structures & Algorithms", desc: "Trees, Graphs & DP", badge: "Guide" },
  { icon: Sparkles, title: "Operating Systems", desc: "Memory & CPU Scheduling", badge: "Solved" },
  { icon: BookMarked, title: "DBMS & SQL Query Bank", desc: "Normal Forms & Relational", badge: "Cheat-Sheet" },
  { icon: Award, title: "Computer Networks", desc: "OSI Layers & Protocols", badge: "Exam Ready" },
];

export function Hero() {
  return (
    <div id="top" className="relative overflow-hidden">
      {/* Dynamic Colorful Ambient Lighting Matched to Brand Logo Triad (#005F15, #007EAC, #BA0000) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[38rem] w-[54rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#005F15]/20 via-[#007EAC]/15 to-[#BA0000]/15 blur-[120px] opacity-75"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-20 -z-10 h-[24rem] w-[24rem] rounded-full bg-gradient-to-bl from-[#007EAC]/20 via-[#005F15]/15 to-[#BA0000]/15 blur-[90px] opacity-65"
      />

      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-100 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
      />

      {/* Hero Main Grid Container */}
      <div className="relative mx-auto grid w-full max-w-[84rem] gap-10 px-2.5 min-[340px]:px-3.5 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12 min-w-0">
        {/* Left Column */}
        <Reveal className="min-w-0 flex flex-col justify-between">
          <div>
            <Pill tone="green">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Made For College Students</span>
            </Pill>

            <h1 className="mt-5 text-[1.8rem] min-[360px]:text-[2.2rem] leading-[1.08] sm:text-5xl lg:text-[4rem] font-bold tracking-tight text-foreground break-words">
              Your Entire University Life.{" "}
              <span className="text-logo-gradient">Organized.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground break-words">
              Get Instant Access To Clean Handwritten Notes, Solved Exam Papers, Lab Codes, And Class Timetables — All Neatly Arranged For Your Exact Branch And Semester.
            </p>

            {/* CTAs + Social Proof Row */}
            <div className="mt-7 flex flex-col gap-3.5 sm:flex-row sm:items-center min-w-0">
              <Cta href="/login?mode=signup" size="lg" className="w-full sm:w-auto shadow-md">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Cta>
              <Cta href="#features" variant="outline" size="lg" className="w-full sm:w-auto">
                See How It Works
              </Cta>
            </div>

            {/* Student Rating & Social Proof Bar with Logo Triad Avatars */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
              <div className="flex -space-x-1.5 shrink-0">
                {["bg-[#005F15]", "bg-[#007EAC]", "bg-[#BA0000]", "bg-emerald-600"].map((bg, idx) => (
                  <div
                    key={idx}
                    className={`grid h-6 w-6 place-items-center rounded-full border-2 border-background text-[0.6rem] font-bold text-white shadow-xs ${bg}`}
                  >
                    {["N", "S", "D", "A"][idx]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-bold text-foreground ml-0.5">4.9/5</span>
              </div>
              <span>•</span>
              <span className="font-medium text-foreground/80">Verified Study Notes &amp; Solutions</span>
            </div>
          </div>

          {/* Attractive Glassmorphic Metric Stat Cards Directly Echoing Logo Triad (#005F15, #007EAC, #BA0000) */}
          <div className="mt-7 grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 sm:gap-3 min-w-0">
            {[
              {
                value: "100%",
                label: "Course Notes",
                sub: "Structured Chapter Guides",
                icon: Layers,
                accent: "from-[#005F15]/15 to-[#005F15]/5 text-[#005F15] dark:text-emerald-400",
                valueClass: "bg-gradient-to-br from-[#005F15] to-emerald-600 dark:from-emerald-400 dark:to-teal-300",
                borderHover: "hover:border-[#005F15]/50",
              },
              {
                value: "5+ Yrs",
                label: "Solved Papers",
                sub: "Step-By-Step Answers",
                icon: BookOpen,
                accent: "from-[#007EAC]/15 to-[#007EAC]/5 text-[#007EAC] dark:text-sky-400",
                valueClass: "bg-gradient-to-br from-[#007EAC] to-cyan-600 dark:from-sky-400 dark:to-cyan-300",
                borderHover: "hover:border-[#007EAC]/50",
              },
              {
                value: "Zero",
                label: "Spam Or Ads",
                sub: "Just Pure Study",
                icon: ShieldCheck,
                accent: "from-[#BA0000]/15 to-[#BA0000]/5 text-[#BA0000] dark:text-rose-400",
                valueClass: "bg-gradient-to-br from-[#BA0000] to-rose-600 dark:from-rose-400 dark:to-red-300",
                borderHover: "hover:border-[#BA0000]/50",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={cn(
                    "group relative flex flex-row min-[420px]:flex-col items-center min-[420px]:items-stretch justify-between rounded-2xl border border-border/80 bg-card/90 p-2.5 sm:p-3.5 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:bg-card hover:-translate-y-0.5 min-w-0 gap-2.5 min-[420px]:gap-0",
                    stat.borderHover,
                  )}
                >
                  <div className="flex items-center gap-2.5 min-[420px]:justify-between min-[420px]:gap-1 min-w-0 flex-1">
                    <div className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br shadow-2xs", stat.accent)}>
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                    </div>
                    {/* Mobile (<420px) Text Block */}
                    <div className="min-w-0 block min-[420px]:hidden">
                      <p className="font-semibold text-xs text-foreground leading-tight truncate">
                        {stat.label}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] text-muted-foreground truncate">
                        {stat.sub}
                      </p>
                    </div>
                    {/* Desktop/Tablet (>=420px) Metric Value */}
                    <span className={cn("hidden min-[420px]:inline-block font-display text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent shrink-0 whitespace-nowrap", stat.valueClass)}>
                      {stat.value}
                    </span>
                  </div>

                  {/* Desktop/Tablet (>=420px) Text Block */}
                  <div className="mt-2 min-w-0 hidden min-[420px]:block">
                    <p className="font-semibold text-xs text-foreground leading-tight truncate">
                      {stat.label}
                    </p>
                    <p className="mt-0.5 text-[0.62rem] sm:text-[0.68rem] text-muted-foreground truncate">
                      {stat.sub}
                    </p>
                  </div>

                  {/* Mobile (<420px) Metric Value on Right */}
                  <span className={cn("inline-block min-[420px]:hidden font-display text-base min-[320px]:text-lg font-black tracking-tight bg-clip-text text-transparent shrink-0 whitespace-nowrap text-right pl-2", stat.valueClass)}>
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Right Column: Dashboard Mock Window + Two Live Companion Badges */}
        <Reveal delay={120} className="relative min-w-0 flex flex-col justify-between">
          <div className="animate-float-slow min-w-0">
            <MockWindow
              title="SaastaScholar · Dashboard"
              actions={<Pill tone="green">Sem 1 · Sec A</Pill>}
              className="shadow-[0_24px_70px_-25px_color-mix(in_oklab,var(--color-primary-deep)_35%,transparent)]"
            >
              <div className="border-b border-border bg-card px-4 py-3 sm:px-5 sm:py-3.5 min-w-0">
                <p className="label-caps text-[0.68rem] text-muted-foreground font-semibold">Good Morning, Aarav</p>
                <p className="mt-0.5 font-display text-sm sm:text-base font-bold text-foreground truncate">
                  Scholar Study Workspace · B.Tech AI &amp; ML
                </p>
              </div>
              <ul className="grid gap-px bg-border grid-cols-1 sm:grid-cols-2 min-w-0">
                {DASHBOARD_ITEMS.map((item, i) => (
                  <li
                    key={item.title}
                    className="group bg-card p-3 sm:p-3.5 transition-all duration-200 hover:bg-accent/40 min-w-0"
                    style={{ animation: `fade-in 0.5s ease-out ${0.15 + i * 0.08}s both` }}
                  >
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors min-w-0">
                        <item.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="label-caps text-[0.65rem] font-semibold truncate">{item.label}</span>
                      </span>
                      <Pill tone={item.tone}>{item.tag}</Pill>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold leading-snug group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[0.65rem] text-muted-foreground truncate">{item.meta}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-4 py-2.5 min-w-0">
                <span className="text-xs text-muted-foreground font-medium truncate">
                  Synced With Computer Science
                </span>
                <span className="label-caps text-xs text-primary font-bold shrink-0">Live</span>
              </div>
            </MockWindow>
          </div>

          {/* Two Companion Cards At End of Right Side (Balances Both Columns) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
            <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 p-3 shadow-2xs backdrop-blur-xs transition-all hover:border-primary/50 min-w-0">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <School className="h-4 w-4 shrink-0" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  Official College Syllabus
                </p>
                <p className="text-[0.65rem] text-muted-foreground truncate">
                  Matches Your Current Semester
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/90 p-3 shadow-2xs backdrop-blur-xs transition-all hover:border-primary/50 min-w-0">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <FileCheck2 className="h-4 w-4 shrink-0" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  Solved Exam Papers (2020–2025)
                </p>
                <p className="text-[0.65rem] text-muted-foreground truncate">
                  Clear Answers For Full Marks
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ===================== Rich Dual Horizontal Ticker Section ===================== */}
      <div className="relative border-t border-border/80 bg-surface/70 py-4 backdrop-blur-md overflow-hidden space-y-2.5">
        {/* Left & Right Fade Gradient Masks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 [background:linear-gradient(to_right,var(--color-background),transparent_10%,transparent_90%,var(--color-background))]"
        />

        {/* Track 1: Accreditation & Features (Moves Left via GPU CSS) */}
        <div
          className="animate-marquee-left flex items-center gap-3.5 whitespace-nowrap will-change-transform"
        >
          {[...TRACK_1_ITEMS, ...TRACK_1_ITEMS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/80 bg-card/95 px-3.5 py-1.5 shadow-2xs transition-all duration-200 hover:border-primary hover:bg-accent/60 hover:scale-[1.03]"
              >
                <div className="grid h-5 w-5 place-items-center rounded-full bg-primary/15 text-primary">
                  <Icon className="h-3 w-3 shrink-0" />
                </div>
                <span className="text-xs font-semibold tracking-tight text-foreground">
                  {item.text}
                </span>
                <span className={`rounded px-1.5 py-0.2 text-[0.6rem] font-bold ${item.tone}`}>
                  {item.tag}
                </span>
              </div>
            );
          })}
        </div>

        {/* Track 2: Live Course Notes & PYQ Packs (Moves Right via GPU CSS) */}
        <div
          className="animate-marquee-right flex items-center gap-3.5 whitespace-nowrap will-change-transform"
        >
          {[...TRACK_2_ITEMS, ...TRACK_2_ITEMS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href="/login"
                className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-border/80 bg-card/95 px-4 py-2 shadow-2xs transition-all duration-200 hover:border-primary hover:bg-accent/60 hover:scale-[1.03] cursor-pointer"
              >
                <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs font-bold text-foreground">{item.title}</span>
                <span className="text-[0.7rem] text-muted-foreground">{item.desc}</span>
                <span className="rounded bg-secondary px-1.5 py-0.2 text-[0.6rem] font-semibold text-muted-foreground">
                  {item.badge}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
