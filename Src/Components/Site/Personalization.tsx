import {
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Cpu,
  FileCheck2,
  FileText,
  Filter,
  FlaskConical,
  GraduationCap,
  Layers,
  Lock,
  Sparkles,
  Users2,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { Cta, Pill, Reveal, Section, SectionHeading } from "./Primitives";

const CHAIN = [
  {
    level: "University",
    value: "NIMS University",
    icon: Building2,
    tag: "Verified Campus",
  },
  {
    level: "Department",
    value: "Computer Science & Engineering",
    icon: Layers,
    tag: "Faculty Aligned",
  },
  {
    level: "Program",
    value: "B.Tech Artificial Intelligence & ML",
    icon: Cpu,
    tag: "4-Year Degree",
  },
  {
    level: "Semester",
    value: "Semester 1",
    icon: Calendar,
    tag: "Active Term",
  },
  {
    level: "Section",
    value: "Section A",
    icon: Users2,
    tag: "Batch 2026",
  },
  {
    level: "Subject",
    value: "Introduction To Artificial Intelligence",
    icon: BookOpen,
    tag: "Core Syllabus",
  },
];

const FILTERED_ITEMS = [
  {
    title: "Unit 2 — Search Algorithms & Heuristic Cost",
    meta: "Class Notes · 14 Pages PDF · Uploaded Today",
    badge: "Unit Notes",
    tagTone: "green" as const,
    icon: FileText,
  },
  {
    title: "Assignment 3 — State Space & Problem Formulation",
    meta: "Tutorial Sheet · Step-by-Step Solution Key",
    badge: "Assignment",
    tagTone: "warn" as const,
    icon: Zap,
  },
  {
    title: "AI Lab Experiment 6 — A* Algorithm Python Code",
    meta: "Executable Code + Observation Table + 50 Viva Q&A",
    badge: "Lab Manual",
    tagTone: "neutral" as const,
    icon: FlaskConical,
  },
  {
    title: "2024 End-Semester University Solved Paper",
    meta: "Previous-Year Paper · 100% Model Solutions Included",
    badge: "Solved PYQ",
    tagTone: "green" as const,
    icon: FileCheck2,
  },
];

export function Personalization() {
  const [selectedLevel, setSelectedLevel] = useState<string>("Semester 1");

  return (
    <Section id="features" tone="surface" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Dynamic Ambient Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/4 -translate-y-1/2 -z-10 h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[110px]"
      />

      <div className="grid gap-10 lg:gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Smart Filter"
            title="Only What You Need. Never Cluttered."
            description="No More Digging Through Random PDFs. Tell Us Your Course And Semester, And We Automatically Show Only The Notes, Lab Codes, And Exam Papers Made For Your Class."
          />
          <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground">
            Whenever You Switch Subjects Or Semesters, Your Entire Dashboard Updates In One Second.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Cta href="/login" size="lg" className="shadow-md hover:shadow-lg">
              <span>Open My Study Hub</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Cta>
            <Cta href="#academic-hub" variant="outline" size="lg">
              See Course Notes
            </Cta>
          </div>
        </Reveal>

        <Reveal delay={100} className="min-w-0">
          <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 min-w-0">
            {/* Left Card: Dynamic Hierarchy Chain */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 p-4 sm:p-5 shadow-[0_16px_50px_-25px_color-mix(in_oklab,var(--color-primary-deep)_30%,transparent)] backdrop-blur-md min-w-0">
              <div className="flex items-center justify-between border-b border-border/80 pb-3 min-w-0 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="label-caps font-bold text-foreground text-xs whitespace-nowrap">
                    How We Find Your Material
                  </span>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold text-primary shrink-0 whitespace-nowrap">
                  Automatic
                </span>
              </div>

              <ol className="mt-3.5 space-y-2 relative min-w-0">
                {/* Connecting subtle vertical line */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-4 bottom-4 left-4.5 w-0.5 bg-gradient-to-b from-primary via-emerald-400/40 to-border"
                />

                {CHAIN.map((node) => {
                  const Icon = node.icon;
                  const isSelected = selectedLevel === node.value;

                  return (
                    <li
                      key={node.level}
                      onClick={() => setSelectedLevel(node.value)}
                      className={`group relative flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 cursor-pointer min-w-0 ${
                        isSelected
                          ? "bg-accent/80 border border-primary/40 shadow-xs"
                          : "hover:bg-accent/40 border border-transparent"
                      }`}
                    >
                      <div
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-transform group-hover:scale-105 ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-surface text-primary border-border"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 min-w-0">
                          <span className="label-caps text-[0.62rem] text-muted-foreground font-semibold uppercase truncate">
                            {node.level}
                          </span>
                          <span className="rounded bg-secondary/80 px-1.5 py-0.2 text-[0.58rem] font-medium text-muted-foreground shrink-0">
                            {node.tag}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs sm:text-sm font-semibold text-foreground leading-snug break-normal">
                          {node.value}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Right Card: Filtered Stream Results */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 p-4 sm:p-5 shadow-[0_16px_50px_-25px_color-mix(in_oklab,var(--color-primary-deep)_30%,transparent)] backdrop-blur-md min-w-0">
              <div>
                <div className="flex items-center justify-between border-b border-border/80 pb-3 min-w-0 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Filter className="h-4 w-4 text-primary shrink-0" />
                    <span className="label-caps font-bold text-foreground text-xs whitespace-nowrap">
                      Matched For Your Class
                    </span>
                  </div>
                  <Pill tone="green" className="shrink-0 whitespace-nowrap">4 Ready Now</Pill>
                </div>

                <ul className="mt-3.5 space-y-2.5 min-w-0">
                  {FILTERED_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.title}
                        className="group flex flex-col justify-between rounded-xl border border-border/70 bg-surface/60 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 min-w-0"
                      >
                        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border/40">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-card text-primary shadow-2xs">
                              <Icon className="h-3 w-3 shrink-0" />
                            </div>
                            <span className="text-[0.65rem] font-mono font-medium text-muted-foreground truncate">
                              {(item.meta.split("·")[0] || item.meta).trim()}
                            </span>
                          </div>
                          <Pill tone={item.tagTone} className="shrink-0 text-[0.62rem] px-2 py-0.5">
                            {item.badge}
                          </Pill>
                        </div>

                        <p className="mt-2 text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug break-normal">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[0.65rem] text-muted-foreground truncate">{item.meta}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Bottom Noise Elimination Badge */}
              <div className="mt-4 rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2.5 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                  <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate text-[0.72rem] font-medium text-foreground">
                    412 Unrelated Class PDFs Filtered Out
                  </span>
                </div>
                <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                  No Random Group Forwards. No Confusing Files.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
