import { Reveal, Section, SectionHeading } from "./Primitives";

const STEPS = [
  [
    "01",
    "Pick Your College",
    "Select Your University So We Can Load Your Department And Subject List.",
  ],
  [
    "02",
    "Select Your Class",
    "Choose Your Branch, Current Semester, And Section Just Once.",
  ],
  [
    "03",
    "Get Your Study Packets",
    "Your Notes, Solved Question Papers, And Lab Manuals Open Automatically.",
  ],
  [
    "04",
    "Stay Ahead Every Day",
    "Never Miss A Class Announcement, Lab Record Submission, Or Exam Date.",
  ],
];

export function HowItWorks() {
  return (
    <Section tone="surface" className="py-16 sm:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Simple Setup"
          title="Get Started in 4 Easy Steps."
          description="It Takes Less Than 30 Seconds To Set Up Your Academic Workspace."
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
