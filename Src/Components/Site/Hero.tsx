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
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

import { useEffect, useRef } from "react";
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

const TRACK_1_ITEMS = [
  { icon: GraduationCap, text: "NIMS University Syllabus Aligned", tag: "Official", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: Cpu, text: "B.Tech Computer Science & AI", tag: "Course", tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { icon: FileCheck2, text: "Solved Previous-Year Papers (2020–2025)", tag: "Verified", tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { icon: FlaskConical, text: "Lab Manuals & Practical Codes", tag: "Labs", tone: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { icon: BookMarked, text: "Topper Handwritten Unit Notes", tag: "Top Rated", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: Sparkles, text: "AI Assignment Creator & Formatter", tag: "AI Tool", tone: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  { icon: ShieldCheck, text: "100% Free Starter Study Bundles", tag: "Free", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: Users, text: "15,000+ Active University Students", tag: "Community", tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
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
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let pos1 = 0;
    let pos2 = 0;
    let animId: number;
    let hovered1 = false;
    let hovered2 = false;

    const t1 = track1Ref.current;
    const t2 = track2Ref.current;

    const enter1 = () => (hovered1 = true);
    const leave1 = () => (hovered1 = false);
    const enter2 = () => (hovered2 = true);
    const leave2 = () => (hovered2 = false);

    t1?.addEventListener("mouseenter", enter1);
    t1?.addEventListener("mouseleave", leave1);
    t2?.addEventListener("mouseenter", enter2);
    t2?.addEventListener("mouseleave", leave2);

    const step = () => {
      if (t1 && !hovered1) {
        pos1 += 0.8;
        const half1 = t1.scrollWidth / 2;
        if (pos1 >= half1) pos1 = 0;
        t1.style.transform = `translate3d(-${pos1}px, 0, 0)`;
      }

      if (t2 && !hovered2) {
        pos2 += 0.7;
        const half2 = t2.scrollWidth / 2;
        if (pos2 >= half2) pos2 = 0;
        t2.style.transform = `translate3d(${pos2 - half2}px, 0, 0)`;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      t1?.removeEventListener("mouseenter", enter1);
      t1?.removeEventListener("mouseleave", leave1);
      t2?.removeEventListener("mouseenter", enter2);
      t2?.removeEventListener("mouseleave", leave2);
    };
  }, []);

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
        className="grid-lines pointer-events-none absolute inset-0 opacity-100 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
      />

      {/* Red Line 1: Generous Top Spacing from Navbar */}
      <div className="relative mx-auto grid w-full max-w-[84rem] gap-10 px-3.5 pt-12 pb-14 sm:px-8 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14 min-w-0">
        <Reveal className="min-w-0">
          <Pill tone="green">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Built For Your University Syllabus</span>
          </Pill>

          <h1 className="mt-6 text-[2.2rem] leading-[1.04] sm:text-5xl lg:text-[4.2rem] font-bold tracking-tight text-foreground break-words">
            Your Entire University Life. Organized.
          </h1>

          {/* Red Line 2: Expanded Gap Between Headline and Description */}
          <p className="mt-6 max-w-xl text-sm sm:text-lg leading-relaxed text-muted-foreground break-words">
            Access Daily Class Notes, Assignments, Practicals, Previous-Year Papers, Exam
            Updates, University Notices And More — Organized By Your University, Department,
            Semester And Section.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row min-w-0">
            <Cta href="/login" size="lg" className="w-full sm:w-auto">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Cta>
            <Cta href="#features" variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Features
            </Cta>
          </div>

          {/* Red Line 3: Expanded Gap Between Buttons and Stats Row */}
          <dl className="mt-10 sm:mt-12 grid max-w-lg grid-cols-3 gap-3 sm:gap-6 border-t border-border pt-7 sm:pt-8">
            {[
              ["6", "Academic Modules"],
              ["1", "Unified Feed"],
              ["0", "Group Noise"],
            ].map(([value, label]) => (
              <div key={label} className="min-w-0">
                <dt className="font-display text-2xl sm:text-3xl font-bold text-primary">{value}</dt>
                <dd className="label-caps mt-1.5 text-[0.65rem] sm:text-xs text-muted-foreground truncate">{label}</dd>
              </div>
            ))}
          </dl>

          {/* Red Line 4: Expanded Gap Between Stats Row and Social Proof Card */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 rounded-2xl border border-border/80 bg-card/75 p-4 sm:p-4.5 shadow-2xs backdrop-blur-xs min-w-0">
            <div className="flex -space-x-2 shrink-0">
              {["bg-emerald-500 text-white", "bg-teal-600 text-white", "bg-indigo-600 text-white", "bg-amber-500 text-white"].map((bg, idx) => (
                <div
                  key={idx}
                  className={`grid h-8 w-8 place-items-center rounded-full border-2 border-card text-[0.7rem] font-bold ${bg}`}
                >
                  {["A", "R", "S", "P"][idx]}
                </div>
              ))}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-xs sm:text-sm font-bold text-foreground">4.9/5</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                Trusted By 15,000+ University Students Across Departments
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="relative min-w-0">
          <div className="animate-float-slow min-w-0">
            <MockWindow
              title="NimsWallah · Dashboard"
              actions={<Pill tone="green">Sem 1 · Sec A</Pill>}
              className="shadow-[0_28px_80px_-25px_color-mix(in_oklab,var(--color-primary-deep)_40%,transparent)]"
            >
              <div className="border-b border-border bg-card px-5 py-4 min-w-0">
                <p className="label-caps text-[0.7rem] text-muted-foreground font-semibold">Good Morning, Aarav</p>
                <p className="mt-1 font-display text-base sm:text-lg font-bold text-foreground truncate">
                  NIMS University · B.Tech AI &amp; ML
                </p>
              </div>
              <ul className="grid gap-px bg-border grid-cols-1 sm:grid-cols-2 min-w-0">
                {DASHBOARD_ITEMS.map((item, i) => (
                  <li
                    key={item.title}
                    onClick={() => toast.info(`📌 Opening ${item.title}...`)}
                    className="group bg-card p-3.5 sm:p-4 transition-all duration-200 hover:bg-accent/40 cursor-pointer min-w-0"
                    style={{ animation: `fade-in 0.5s ease-out ${0.15 + i * 0.08}s both` }}
                  >
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors min-w-0">
                        <item.icon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="label-caps text-[0.68rem] font-semibold truncate">{item.label}</span>
                      </span>
                      <Pill tone={item.tone}>{item.tag}</Pill>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm font-semibold leading-snug group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[0.7rem] text-muted-foreground truncate">{item.meta}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-4 py-3 sm:px-5 sm:py-3 min-w-0">
                <span className="text-xs text-muted-foreground font-medium truncate">
                  Synced With Computer Science
                </span>
                <span className="label-caps text-xs text-primary font-bold shrink-0">Live</span>
              </div>
            </MockWindow>
          </div>
        </Reveal>
      </div>

      {/* ===================== Rich Dual Horizontal Ticker Section ===================== */}
      <div className="relative border-t border-border/80 bg-surface/70 py-4.5 backdrop-blur-md overflow-hidden space-y-3">
        {/* Left & Right Fade Gradient Masks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 [background:linear-gradient(to_right,var(--color-background),transparent_10%,transparent_90%,var(--color-background))]"
        />

        {/* Track 1: Accreditation & Features (Moves Left) */}
        <div
          ref={track1Ref}
          className="flex items-center gap-3.5 whitespace-nowrap cursor-pointer will-change-transform"
          style={{ width: "max-content" }}
        >
          {[...TRACK_1_ITEMS, ...TRACK_1_ITEMS, ...TRACK_1_ITEMS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => toast.info(`📚 ${item.text} is included with NimsWallah!`)}
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

        {/* Track 2: Live Course Notes & PYQ Packs (Moves Right) */}
        <div
          ref={track2Ref}
          className="flex items-center gap-3.5 whitespace-nowrap cursor-pointer will-change-transform"
          style={{ width: "max-content" }}
        >
          {[...TRACK_2_ITEMS, ...TRACK_2_ITEMS, ...TRACK_2_ITEMS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => toast.info(`📖 Opening preview for ${item.title}...`)}
                className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-border/80 bg-card/95 px-4 py-2 shadow-2xs transition-all duration-200 hover:border-primary hover:bg-accent/60 hover:scale-[1.03]"
              >
                <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs font-bold text-foreground">{item.title}</span>
                <span className="text-[0.7rem] text-muted-foreground">{item.desc}</span>
                <span className="rounded bg-secondary px-1.5 py-0.2 text-[0.6rem] font-semibold text-muted-foreground">
                  {item.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
