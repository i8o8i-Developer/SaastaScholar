import { ChevronRight, Filter } from "lucide-react";

import { Cta, Reveal, Section, SectionHeading } from "./Primitives";

const CHAIN = [
  { level: "University", value: "NIMS University" },
  { level: "Department", value: "Computer Science & Engineering" },
  { level: "Program", value: "B.Tech Artificial Intelligence And Machine Learning" },
  { level: "Semester", value: "Semester 1" },
  { level: "Section", value: "Section A" },
  { level: "Subject", value: "Introduction To AI" },
];

const FILTERED = [
  { title: "Unit 2 — Search Algorithms", meta: "Class Notes · Uploaded Today" },
  { title: "Assignment 3 — Uninformed Search", meta: "Due 24 Aug · Section A Only" },
  { title: "AI Lab Experiment 6", meta: "Lab Manual + Viva Questions" },
  { title: "2024 Mid-Sem Paper", meta: "Previous-Year · Solved" },
];

export function Personalization() {
  return (
    <Section id="features" tone="surface">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Academic Personalization"
            title="Your Academic Content, Filtered For You."
            description="NimsWallah Does Not Show You A Library Of Random Material. It Resolves Your Exact Academic Position — Then Serves Only What Belongs To It."
          />
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every Note, Paper, Notice And Deadline Inherits Your Academic Context. Change
            Semester And The Entire Workspace Changes With You.
          </p>
          <Cta href="#academic-hub" variant="outline" size="lg" className="mt-8">
            See How It Works
          </Cta>
        </Reveal>

        <Reveal delay={100} className="min-w-0">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] min-w-0">
            <ol className="rounded-xl border border-border-strong bg-card p-1.5 sm:p-2 min-w-0">
              {CHAIN.map((node, i) => (
                <li
                  key={node.level}
                  className="group relative flex items-start gap-2 sm:gap-3 rounded-lg px-2 py-2 sm:px-3 sm:py-3 transition-colors hover:bg-accent min-w-0"
                  style={{ paddingLeft: `clamp(0.5rem, ${0.4 + i * 0.25}rem, 1.75rem)` }}
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span className="min-w-0">
                    <span className="label-caps block text-[0.65rem] text-muted-foreground">
                      {node.level}
                    </span>
                    <span className="mt-0.5 block text-xs sm:text-sm font-semibold leading-snug break-words">
                      {node.value}
                    </span>
                  </span>
                  {i < CHAIN.length - 1 ? (
                    <ChevronRight
                      aria-hidden
                      className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 rotate-90 text-border-strong hidden xs:block"
                    />
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="rounded-xl border border-border-strong bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Filter className="h-3.5 w-3.5 text-primary" />
                <span className="label-caps text-muted-foreground">Matched For You</span>
              </div>
              <ul className="divide-y divide-border">
                {FILTERED.map((item) => (
                  <li key={item.title} className="px-4 py-4 transition-colors hover:bg-surface">
                    <p className="text-sm font-semibold leading-snug">{item.title}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{item.meta}</p>
                  </li>
                ))}
              </ul>
              <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                412 Items Hidden — Not Relevant To Section A
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
