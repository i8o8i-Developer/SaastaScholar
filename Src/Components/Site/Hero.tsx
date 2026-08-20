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

const MARQUEE_ITEMS = [
  { icon: GraduationCap, text: "NIMS University Syllabus Aligned", tag: "Official" },
  { icon: Cpu, text: "B.Tech Computer Science & AI", tag: "Course" },
  { icon: FileCheck2, text: "Solved Previous-Year Papers (PYQs)", tag: "Verified" },
  { icon: FlaskConical, text: "Lab Manuals & Practical Codes", tag: "Labs" },
  { icon: BookMarked, text: "Topper Handwritten Unit Notes", tag: "Top Rated" },
  { icon: Sparkles, text: "AI Assignment Creator & Formatter", tag: "AI Tool" },
  { icon: ShieldCheck, text: "100% Free Starter Study Bundles", tag: "Free" },
  { icon: Users, text: "15,000+ Active University Students", tag: "Community" },
  { icon: Award, text: "Faculty-Verified Model Answers", tag: "Exam Prep" },
];

export function Hero() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  // JS animation fallback ensures the ticker ALWAYS moves smoothly on any device/OS setting
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    let pos = 0;
    let animationFrameId: number;
    let isHovered = false;

    const onMouseEnter = () => {
      isHovered = true;
    };
    const onMouseLeave = () => {
      isHovered = false;
    };

    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);

    const step = () => {
      if (!isHovered && el) {
        pos += 0.8;
        const halfWidth = el.scrollWidth / 2;
        if (pos >= halfWidth) {
          pos = 0;
        }
        el.style.transform = `translate3d(-${pos}px, 0, 0)`;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
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

      <div className="relative mx-auto grid w-full max-w-[84rem] gap-6 px-3.5 pt-6 pb-6 sm:px-8 sm:pt-10 sm:pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10 min-w-0">
        <Reveal className="min-w-0">
          <Pill tone="green">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Built For Your University Syllabus</span>
          </Pill>

          <h1 className="mt-4 text-[1.85rem] leading-[1.05] sm:text-5xl lg:text-[4rem] font-bold tracking-tight text-foreground break-words">
            Your Entire University Life. Organized.
          </h1>

          <p className="mt-3.5 max-w-xl text-xs sm:text-base leading-relaxed text-muted-foreground break-words">
            Access Daily Class Notes, Assignments, Practicals, Previous-Year Papers, Exam
            Updates, University Notices And More — Organized By Your University, Department,
            Semester And Section.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row min-w-0">
            <Cta href="/login" size="lg" className="w-full sm:w-auto">
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Cta>
            <Cta href="#features" variant="outline" size="lg" className="w-full sm:w-auto">
              Explore Features
            </Cta>
          </div>

          <dl className="mt-6 grid max-w-lg grid-cols-3 gap-2 sm:gap-6 border-t border-border pt-4">
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

          {/* Social Proof & Trust Badges Row (Fills bottom-left empty gap) */}
          <div className="mt-6 flex flex-wrap items-center gap-3.5 rounded-2xl border border-border/80 bg-card/70 p-3 sm:p-3.5 shadow-2xs backdrop-blur-xs min-w-0">
            <div className="flex -space-x-2 shrink-0">
              {["bg-emerald-500 text-white", "bg-teal-600 text-white", "bg-indigo-600 text-white", "bg-amber-500 text-white"].map((bg, idx) => (
                <div
                  key={idx}
                  className={`grid h-7 w-7 place-items-center rounded-full border-2 border-card text-[0.65rem] font-bold ${bg}`}
                >
                  {["A", "R", "S", "P"][idx]}
                </div>
              ))}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-xs font-bold text-foreground">4.9/5</span>
              </div>
              <p className="text-[0.68rem] text-muted-foreground truncate">
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
              <div className="border-b border-border bg-card px-4 py-3 sm:px-5 sm:py-3.5 min-w-0">
                <p className="label-caps text-[0.65rem] text-muted-foreground font-semibold">Good Morning, Aarav</p>
                <p className="mt-0.5 font-display text-sm sm:text-base font-bold text-foreground truncate">
                  NIMS University · B.Tech AI &amp; ML
                </p>
              </div>
              <ul className="grid gap-px bg-border grid-cols-1 sm:grid-cols-2 min-w-0">
                {DASHBOARD_ITEMS.map((item, i) => (
                  <li
                    key={item.title}
                    onClick={() => toast.info(`📌 Opening ${item.title}...`)}
                    className="group bg-card p-3 transition-all duration-200 hover:bg-accent/40 cursor-pointer min-w-0"
                    style={{ animation: `fade-in 0.5s ease-out ${0.15 + i * 0.08}s both` }}
                  >
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors min-w-0">
                        <item.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="label-caps text-[0.65rem] font-semibold truncate">{item.label}</span>
                      </span>
                      <Pill tone={item.tone}>{item.tag}</Pill>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm font-semibold leading-snug group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] text-muted-foreground truncate">{item.meta}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-3.5 py-2 sm:px-5 sm:py-2.5 min-w-0">
                <span className="text-[0.65rem] sm:text-xs text-muted-foreground font-medium truncate">
                  Synced With Computer Science
                </span>
                <span className="label-caps text-[0.65rem] text-primary font-bold shrink-0">Live</span>
              </div>
            </MockWindow>
          </div>
        </Reveal>
      </div>

      {/* ===================== Guaranteed Infinite Horizontal Ticker Band ===================== */}
      <div className="relative border-y border-border/80 bg-gradient-to-r from-emerald-500/5 via-surface/80 to-teal-500/5 py-3 backdrop-blur-xs overflow-hidden">
        {/* Left and right fade gradient mask */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 [background:linear-gradient(to_right,var(--color-background),transparent_10%,transparent_90%,var(--color-background))]"
        />

        {/* Ticker Container with dual JS+CSS hardware-accelerated motion */}
        <div
          ref={marqueeRef}
          className="flex items-center gap-3.5 whitespace-nowrap cursor-pointer will-change-transform"
          style={{ width: "max-content" }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
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
                <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[0.6rem] font-bold text-primary">
                  {item.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
