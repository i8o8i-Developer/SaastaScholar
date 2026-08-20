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

      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Academic Personalization"
            title="Your Academic Content, Filtered For You."
            description="NimsWallah Does Not Show You A Library Of Random Material. It Resolves Your Exact Academic Position — Then Serves Only What Belongs To It."
          />
          <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground">
            Every Note, Solved PYQ Paper, Lab Manual And Deadline Inherits Your Academic Context.
            Change Your Semester And The Entire Workspace Re-Filters Instantly.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Cta href="/login" size="lg" className="shadow-md hover:shadow-lg">
              <span>Access Your Semester Hub</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Cta>
            <Cta href="#academic-hub" variant="outline" size="lg">
              Explore Academic Hub
            </Cta>
          </div>
        </Reveal>

        <Reveal delay={100} className="min-w-0">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] min-w-0">
            {/* Left Card: Dynamic Hierarchy Chain */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 p-4 sm:p-5 shadow-[0_16px_50px_-25px_color-mix(in_oklab,var(--color-primary-deep)_30%,transparent)] backdrop-blur-md min-w-0">
              <div className="flex items-center justify-between border-b border-border/80 pb-3.5 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="label-caps font-bold text-foreground text-xs truncate">
                    Academic Scope Chain
                  </span>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold text-primary shrink-0">
                  Inherited
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
                        <p className="mt-0.5 text-xs sm:text-sm font-semibold text-foreground leading-snug break-words">
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
                <div className="flex items-center justify-between border-b border-border/80 pb-3.5 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Filter className="h-4 w-4 text-primary shrink-0" />
                    <span className="label-caps font-bold text-foreground text-xs truncate">
                      Matched For You
                    </span>
                  </div>
                  <Pill tone="green">4 Synced</Pill>
                </div>

                <ul className="mt-3.5 space-y-2.5 min-w-0">
                  {FILTERED_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.title}
                        className="group flex items-start justify-between gap-2.5 rounded-xl border border-border/70 bg-surface/60 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 min-w-0"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-card text-primary shadow-2xs">
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-snug break-words">
                              {item.title}
                            </p>
                            <p className="mt-1 text-[0.68rem] text-muted-foreground truncate">{item.meta}</p>
                          </div>
                        </div>

                        <Pill tone={item.tagTone} className="shrink-0">
                          {item.badge}
                        </Pill>
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
                    412 Irrelevant Items Hidden
                  </span>
                </div>
                <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                  Zero WhatsApp Spam. Zero Random Course Noise.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
