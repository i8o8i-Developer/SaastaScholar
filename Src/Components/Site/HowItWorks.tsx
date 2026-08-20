import { Reveal, Section, SectionHeading } from "./Primitives";

const STEPS = [
  [
    "01",
    "Select Your University",
    "Find Your Institution And NimsWallah Loads Its Academic Structure — Departments, Programs And Calendars.",
  ],
  [
    "02",
    "Choose Your Academic Profile",
    "Set Your Department, Program, Semester And Section Once. Everything Downstream Inherits It.",
  ],
  [
    "03",
    "Access Your Personalized Academic Hub",
    "Notes, Papers, Practicals And Assignment Tools Open Pre-Filtered To Your Subjects.",
  ],
  [
    "04",
    "Stay Updated And Organized",
    "Notices Land In One Feed And Deadlines Flow Straight Into Your Planner.",
  ],
];

export function HowItWorks() {
  return (
    <Section tone="surface">
      <Reveal>
        <SectionHeading
          eyebrow="How It Works"
          title="Four Steps To A Cleaner Academic Workflow."
          align="center"
        />
      </Reveal>
      <ol className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(([num, title, copy], i) => (
          <Reveal as="li" key={num} delay={i * 80} className="relative bg-background p-7">
            <span className="label-caps text-primary">{num}</span>
            <span
              aria-hidden
              className="absolute right-0 top-[3.15rem] hidden h-px w-full bg-border lg:block"
            />
            <h3 className="mt-5 text-xl leading-tight">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
