import {
  ArrowRight,
  Award,
  BellRing,
  BookMarked,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileText,
  FlaskConical,
  GraduationCap,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { toast } from "sonner";

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
    tone: "warn" as const,
    tag: "Due Soon",
  },
  {
    icon: FlaskConical,
    label: "Upcoming Practical",
    title: "AI Lab — Experiment 6: A* Search",
    meta: "Tomorrow · 2:00 PM · Lab B2",
    tone: "neutral" as const,
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
    tone: "neutral" as const,
    tag: "Solved",
  },
  {
    icon: BookOpen,
    label: "Upcoming Exam",
    title: "Mid-Semester Examination I",
    meta: "Starts 14 Sept · 6 subjects",
    tone: "warn" as const,
    tag: "24 Days",
  },
];

const MARQUEE_ITEMS = [
  { icon: GraduationCap, text: "NIMS University Syllabus Aligned" },
  { icon: Cpu, text: "B.Tech Computer Science & AI" },
  { icon: FileCheck2, text: "Solved Previous-Year Question Papers (PYQs)" },
  { icon: FlaskConical, text: "Lab Manuals & Practical Codes" },
  { icon: BookMarked, text: "Topper Handwritten Notes" },
  { icon: Sparkles, text: "AI Assignment Creator & Formatter" },
  { icon: ShieldCheck, text: "100% Free Starter Study Bundles" },
  { icon: Users, text: "15,000+ Active University Students" },
  { icon: Award, text: "Faculty-Verified Model Answers" },
];

export function Hero() {
  return (
    <div id="top" className="relative overflow-hidden bg-radial from-emerald-500/5 via-background to-background">
      {/* Dynamic Colorful Ambient Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[38rem] w-[54rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-400/10 to-indigo-500/15 blur-[120px] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-20 -z-10 h-[24rem] w-[24rem] rounded-full bg-amber-400/10 blur-[90px] opacity-60"
      />

      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-100 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
      />

      <div className="relative mx-auto grid w-full max-w-[84rem] gap-8 px-3.5 pt-8 pb-12 sm:px-8 sm:pt-20 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12 min-w-0">
        <Reveal className="min-w-0">
          <Pill tone="green">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Built For Your University Syllabus</span>
          </Pill>
          <h1 className="mt-5 text-[1.85rem] leading-[1.05] sm:text-6xl lg:text-[4.4rem] font-bold tracking-tight text-foreground break-words">
            Your Entire University Life. Organized.
          </h1>
          <p className="mt-4 max-w-xl text-xs sm:text-base leading-relaxed text-muted-foreground break-words">
            Access Daily Class Notes, Assignments, Practicals, Previous-Year Papers, Exam
            Updates, University Notices And More — Organized By Your University, Department,
            Semester And Section.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row min-w-0">
            <Cta href="/login" size="lg" className="w-full sm:w-auto">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Cta>
            <Cta href="#features" variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Features
            </Cta>
          </div>
          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-2 sm:gap-6 border-t border-border pt-5">
            {[
              ["6", "Academic Modules"],
              ["1", "Unified Feed"],
              ["0", "Group Noise"],
            ].map(([value, label]) => (
              <div key={label} className="min-w-0">
                <dt className="font-display text-xl sm:text-3xl font-bold text-primary">{value}</dt>
                <dd className="label-caps mt-1 text-[0.6rem] sm:text-xs text-muted-foreground truncate">{label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={120} className="relative min-w-0">
          <div className="animate-float-slow min-w-0">
            <MockWindow
              title="NimsWallah · Dashboard"
              actions={<Pill tone="green">Sem 1 · Sec A</Pill>}
              className="shadow-[0_28px_80px_-25px_color-mix(in_oklab,var(--color-primary-deep)_40%,transparent)]"
            >
              <div className="border-b border-border bg-card px-4 py-3 sm:px-5 sm:py-4 min-w-0">
                <p className="label-caps text-[0.65rem] text-muted-foreground font-semibold">Good Morning, Aarav</p>
                <p className="mt-1 font-display text-sm sm:text-lg font-bold text-foreground truncate">
                  NIMS University · B.Tech AI &amp; ML
                </p>
              </div>
              <ul className="grid gap-px bg-border grid-cols-1 sm:grid-cols-2 min-w-0">
                {DASHBOARD_ITEMS.map((item, i) => (
                  <li
                    key={item.title}
                    onClick={() => toast.info(`📌 Opening ${item.title}...`)}
                    className="group bg-card p-3 sm:p-4 transition-all duration-200 hover:bg-accent/40 cursor-pointer min-w-0"
                    style={{ animation: `fade-in 0.5s ease-out ${0.15 + i * 0.08}s both` }}
                  >
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors min-w-0">
                        <item.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="label-caps text-[0.65rem] font-semibold truncate">{item.label}</span>
                      </span>
                      <Pill tone={item.tone}>{item.tag}</Pill>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm font-semibold leading-snug group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[0.7rem] sm:text-xs text-muted-foreground truncate">{item.meta}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-3.5 py-2.5 sm:px-5 sm:py-3 min-w-0">
                <span className="text-[0.65rem] sm:text-xs text-muted-foreground font-medium truncate">
                  Synced With Computer Science
                </span>
                <span className="label-caps text-[0.65rem] text-primary font-bold shrink-0">Live</span>
              </div>
            </MockWindow>
          </div>
        </Reveal>
      </div>

      {/* ===================== Infinite Horizontal Ticker / Logo Band ===================== */}
      <div className="relative border-y border-border/80 bg-surface/60 py-3.5 backdrop-blur-xs overflow-hidden">
        {/* Left and right fade gradient mask */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 [background:linear-gradient(to_right,var(--color-background),transparent_12%,transparent_88%,var(--color-background))]"
        />

        <div className="animate-marquee flex items-center gap-4">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 shadow-2xs transition-colors hover:border-primary/50 hover:bg-accent/40"
              >
                <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span className="text-xs font-semibold tracking-tight text-foreground whitespace-nowrap">
                  {item.text}
                </span>
                <span className="h-1 w-1 rounded-full bg-primary/40" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
