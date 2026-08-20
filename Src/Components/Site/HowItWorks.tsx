import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  FolderGit2,
  GraduationCap,
  Layers,
  School,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Cta, Pill, Reveal, Section, SectionHeading } from "./Primitives";

const STEPS = [
  {
    step: "01",
    title: "Select Your University",
    desc: "Choose Your Institution To Instantly Load Its Official Curriculum Structure, Department Calendars, And Grading Schemes.",
    icon: School,
    badge: "Campus Auto-Detection",
    highlight: "200+ Degree Programs",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    step: "02",
    title: "Set Your Academic Position",
    desc: "Configure Your Department, Degree Stream, Active Semester, And Section Once. All Study Feeds Inherit This Exact Scope.",
    icon: SlidersHorizontal,
    badge: "One-Time Fast Setup",
    highlight: "Zero Manual Categorization",
    gradient: "from-teal-500/20 to-cyan-500/10",
  },
  {
    step: "03",
    title: "Unlock Curated Study Hub",
    desc: "Access Topper Handwritten Notes, Solved PYQs (2020–2025), Lab Viva Cheat-Sheets, And AI Assignment Outlines.",
    icon: BookOpenCheck,
    badge: "Pre-Filtered Coursework",
    highlight: "100% Syllabus Aligned",
    gradient: "from-cyan-500/20 to-indigo-500/10",
  },
  {
    step: "04",
    title: "Master Deadlines & CGPA",
    desc: "Assignment Submission Dates, Viva Exams, And Attendance Milestones Flow Directly Into Your Live Academic Timetable.",
    icon: TrendingUp,
    badge: "Automated Daily Flow",
    highlight: "Target High GPA",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
];

export function HowItWorks() {
  return (
    <Section tone="surface" className="relative py-16 sm:py-24 overflow-hidden">
      {/* Dynamic Ambient Background Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-10 -z-10 h-[32rem] w-[32rem] rounded-full bg-emerald-500/10 blur-[130px]"
      />

      <Reveal>
        <SectionHeading
          eyebrow="Simple 4-Step Process"
          title="Four Steps To A Cleaner Academic Workflow."
          description="Transform How You Study In Minutes. No More Scattered WhatsApp PDFs Or Missing Vital Exam Dates."
          align="center"
        />
      </Reveal>

      {/* 4 Floating Glassmorphic Step Cards */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {STEPS.map((item, i) => {
          const Icon = item.icon;
          return (
            <Reveal
              key={item.step}
              delay={i * 90}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-7 shadow-[0_12px_40px_-20px_color-mix(in_oklab,var(--color-primary-deep)_25%,transparent)] backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-card hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-20px_color-mix(in_oklab,var(--color-primary)_35%,transparent)] min-w-0"
            >
              {/* Card Top Row: Step Number & Icon */}
              <div>
                <div className="flex items-center justify-between min-w-0">
                  <span className="font-display text-2xl sm:text-3xl font-black text-primary/80 group-hover:text-primary transition-colors">
                    {item.step}
                  </span>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent text-primary shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent/60 px-2.5 py-0.5 text-[0.68rem] font-bold text-accent-foreground">
                    <Sparkles className="h-3 w-3 text-primary shrink-0" />
                    <span>{item.badge}</span>
                  </span>

                  <h3 className="mt-3.5 text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug break-words">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground break-words">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Card Bottom Feature Highlight */}
              <div className="mt-6 border-t border-border/80 pt-3.5 flex items-center gap-1.5 text-[0.72rem] font-semibold text-primary">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.highlight}</span>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Bottom Action Row */}
      <Reveal delay={300} className="mt-12 flex justify-center">
        <Cta href="/login" size="lg" className="shadow-md hover:shadow-lg">
          <span>Set Up Your Academic Profile Free</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Cta>
      </Reveal>
    </Section>
  );
}
