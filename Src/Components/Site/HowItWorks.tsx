import { Reveal, Section, SectionHeading } from "./Primitives";

const STEPS = [
  [
    "01",
    "Select Your University",
    "Find Your Institution And NimsWallah Loads Its Complete Academic Structure — Departments, Degree Programs, And Calendars.",
  ],
  [
    "02",
    "Choose Your Academic Profile",
    "Set Your Department, Program, Semester And Section Once. Everything Downstream Inherits It Automatically.",
  ],
  [
    "03",
    "Access Your Personalized Academic Hub",
    "Notes, Solved PYQ Papers, Practicals And Assignment Tools Open Pre-Filtered To Your Exact Subjects.",
  ],
  [
    "04",
    "Stay Updated And Organized",
    "Notices Land In One Unified Feed And Exam Deadlines Flow Straight Into Your Personal Smart Planner.",
  ],
];

export function HowItWorks() {
  return (
    <Section tone="surface" className="py-16 sm:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="How It Works"
          title="Four Steps To A Cleaner Academic Workflow."
          description="A Simplified, Transparent Process Designed Around How You Study."
          align="center"
        />
      </Reveal>
      <ol className="mt-14 grid gap-px border border-border/80 bg-border/80 rounded-2xl overflow-hidden shadow-xs md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(([num, title, copy], i) => (
          <Reveal
            as="li"
            key={num}
            delay={i * 80}
            className="group relative bg-card p-6 sm:p-8 transition-colors duration-200 hover:bg-accent/40"
          >
            <div className="flex items-center justify-between">
              <span className="label-caps font-mono text-base sm:text-lg font-bold text-primary">
                {num}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
            </div>

            <span
              aria-hidden
              className="absolute right-0 top-[3.6rem] hidden h-px w-full bg-border/80 lg:block"
            />

            <h3 className="mt-6 text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
              {title}
            </h3>

            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {copy}
            </p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
