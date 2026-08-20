import {
  CheckCircle2,
  Clock,
  FileDown,
  Quote,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Cta, MockWindow, Pill, Reveal, Section, SectionHeading } from "./Primitives";

const TOOLS = [
  "AI Assignment Creator",
  "Assignment Templates",
  "Deadline Tracker",
  "Submission Status",
  "PDF Generation",
  "Word Generation",
  "Citation Generator",
  "Reference Generator",
  "Self-Check",
  "Assignment History",
];

const TRACKER = [
  ["Data Structures — Assignment 3", "Due In 2 Days", "In Progress", "warn"],
  ["Engineering Maths — Tutorial Sheet 4", "Due In 6 Days", "Not Started", "neutral"],
  ["Intro To AI — Case Study", "Submitted 18 Aug", "Submitted", "green"],
] as const;

export function Assignments() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeFormat, setActiveFormat] = useState("University Template");
  const [activeCitation, setActiveCitation] = useState("IEEE");

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 600);
  };

  return (
    <Section id="assignments" tone="surface">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
        <Reveal>
          <SectionHeading
            eyebrow="Assignments & Coursework"
            title="Assignments Without The Chaos."
            description="Create, Organize And Track Every Assignment From One Place — From First Draft To Final Submission, With Formatting And References Handled."
          />
          <ul className="mt-9 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 rounded-xl overflow-hidden shadow-xs">
            {TOOLS.map((tool) => (
              <li
                key={tool}
                className="flex items-center gap-2.5 bg-background px-4 py-3.5 text-sm font-medium transition-colors hover:bg-accent hover:text-primary cursor-default"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span>{tool}</span>
              </li>
            ))}
          </ul>
          <Cta href="/login" size="lg" className="mt-9">
            Explore Assignment Tools
          </Cta>
        </Reveal>

        <Reveal delay={100} className="grid gap-5">
          <MockWindow
            title="New Assignment · AI Creator"
            actions={<Pill tone="green">Draft Ready</Pill>}
          >
            <div className="space-y-4 p-5">
              <div>
                <p className="label-caps text-muted-foreground font-semibold">Subject Module</p>
                <p className="mt-1.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm font-medium">
                  Data Structures · Semester 1 · Section A
                </p>
              </div>
              <div>
                <p className="label-caps text-muted-foreground font-semibold">Assignment Topic</p>
                <p className="mt-1.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm font-medium">
                  Comparative Analysis Of Sorting Algorithms
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="label-caps text-muted-foreground font-semibold">Format</p>
                  <p className="mt-1.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium">
                    {activeFormat}
                  </p>
                </div>
                <div>
                  <p className="label-caps text-muted-foreground font-semibold">Citation Style</p>
                  <p className="mt-1.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium">
                    {activeCitation}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-deep hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{generating ? "Drafting..." : "Generate Draft"}</span>
                </button>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5 cursor-pointer"
                >
                  <FileDown className="h-3.5 w-3.5 text-primary" />
                  <span>PDF Export</span>
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5 cursor-pointer"
                >
                  <FileDown className="h-3.5 w-3.5 text-primary" />
                  <span>Word DOCX</span>
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5 cursor-pointer"
                >
                  <Quote className="h-3.5 w-3.5 text-primary" />
                  <span>IEEE References</span>
                </a>
              </div>
            </div>
          </MockWindow>

          <MockWindow title="Deadline Tracker">
            <ul className="divide-y divide-border">
              {TRACKER.map(([title, due, status, tone]) => (
                <li
                  key={title}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface"
                >
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{due}</span>
                  </span>
                  <Pill tone={tone}>{status}</Pill>
                </li>
              ))}
            </ul>
          </MockWindow>
        </Reveal>
      </div>
    </Section>
  );
}
