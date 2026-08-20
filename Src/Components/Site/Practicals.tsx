import {
  BookMarked,
  CheckCircle2,
  ChevronRight,
  Code2,
  Download,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  HelpCircle,
  Layers,
  MessageCircleQuestion,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/Lib/Utils";
import { MockWindow, Pill, Reveal, Section, SectionHeading } from "./Primitives";

interface ExperimentData {
  id: string;
  number: string;
  title: string;
  dueDate: string;
  aim: string;
  apparatus: string;
  outcome: string;
  vivaQuestions: { q: string; a: string; level: string }[];
}

const EXPERIMENTS: ExperimentData[] = [
  {
    id: "exp-6",
    number: "06",
    title: "Implementation Of A* Search Algorithm",
    dueDate: "Record Due 26 Aug",
    aim: "To Implement A* Search Algorithm On A Weighted State Graph Using Heuristic Cost Estimates.",
    apparatus: "Python 3.11, NetworkX, Matplotlib, Lab Workstation",
    outcome: "CO3 — Formulate And Evaluate Informed Search Strategies",
    vivaQuestions: [
      {
        q: "Why Is A* Considered Optimal Under An Admissible Heuristic?",
        a: "An Admissible Heuristic Never Overestimates The Actual Cost To Reach The Goal, Ensuring The Shortest Path Is Explored First.",
        level: "High Frequency",
      },
      {
        q: "Differentiate Between Breadth-First Search And Uniform Cost Search.",
        a: "BFS Expands The Shallowest Node First, While Uniform Cost Search Expands The Node With The Lowest Cumulative Path Cost.",
        level: "Core Concept",
      },
      {
        q: "What Is The Worst-Case Time Complexity Of The A* Search Algorithm?",
        a: "In The Worst Scenario With An Uninformed Heuristic, The Time Complexity Grows As O(b^d), Where b Is Branching Factor And d Is Depth.",
        level: "Exam Favorite",
      },
    ],
  },
  {
    id: "exp-4",
    number: "04",
    title: "Binary Search Tree Traversals & Balancing",
    dueDate: "Completed & Verified",
    aim: "To Construct A Balanced Binary Search Tree And Execute Inorder, Preorder, And Postorder Traversals.",
    apparatus: "GCC Compiler, C++20 Standard Library, Linux Terminal",
    outcome: "CO2 — Implement Complex Non-Linear Data Structures",
    vivaQuestions: [
      {
        q: "What Is The Relationship Between Inorder Traversal And BST Keys?",
        a: "An Inorder Traversal Of Any Valid Binary Search Tree Always Yields Node Values In Strictly Ascending Order.",
        level: "Fundamental",
      },
      {
        q: "How Does An AVL Tree Maintain Logarithmic Height?",
        a: "Through Single And Double Rotations Whenever The Balance Factor Of Any Node Deviates Outside The [-1, 1] Range.",
        level: "Core Concept",
      },
    ],
  },
  {
    id: "exp-7",
    number: "07",
    title: "Minimax Algorithm With Alpha-Beta Pruning",
    dueDate: "Record Due 02 Sep",
    aim: "To Develop An Adversarial Search Engine For Tic-Tac-Toe Using Alpha-Beta Pruned Decision Trees.",
    apparatus: "Python 3.11, Pygame Engine, Jupyter Lab",
    outcome: "CO4 — Construct Game-Playing And Strategic Reasoning Engines",
    vivaQuestions: [
      {
        q: "What Condition Triggers An Alpha Cutoff In Game Search?",
        a: "A Cutoff Occurs When Beta Becomes Less Than Or Equal To Alpha, Meaning The Opponent Has A Better Alternative Already.",
        level: "Advanced",
      },
    ],
  },
];

const CAPABILITIES = [
  {
    title: "Practical Task List",
    copy: "Every Experiment For The Current Semester Arranged In Official Sequence.",
  },
  {
    title: "Official Lab Manuals",
    copy: "Verified Manuals, Code Frameworks, And Procedure Guidelines Per Experiment.",
  },
  {
    title: "Experiment Explanations",
    copy: "Clear Mathematical Formulations, Theory Summaries, And Expected Graph Outputs.",
  },
  {
    title: "Curated Viva Sets",
    copy: "Comprehensive Question Banks With Model Answers For Confident Viva Voce.",
  },
  {
    title: "Record-Book Templates",
    copy: "Pre-Formatted Header Sheets And Calculation Grids Ready To Print Or Transcribe.",
  },
  {
    title: "Submission Timelines",
    copy: "Lab Deadlines Tracked Weekly With Automated Reminders For Batch Submissions.",
  },
  {
    title: "Progress Dashboard",
    copy: "Clear Visual Status On Completed, Pending, And Verified Lab Experiments.",
  },
];

export function Practicals() {
  const [selectedExpId, setSelectedExpId] = useState<string>("exp-6");
  const [revealedViva, setRevealedViva] = useState<Record<number, boolean>>({ 0: true });

  const currentExp = EXPERIMENTS.find((e) => e.id === selectedExpId) ?? EXPERIMENTS[0]!;

  const toggleViva = (index: number) => {
    setRevealedViva((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Section id="practicals" className="relative overflow-hidden">
      <Reveal>
        <SectionHeading
          eyebrow="Practicals & Laboratory Hub"
          title="Never Walk Into A University Lab Unprepared."
          description="Each Practical Arrives As A Complete Laboratory Packet — Official Manual, Theory Breakdown, Model Viva Questions, And Formatted Record-Book Templates — Tailored To Your Lab Section."
        />
      </Reveal>

      {/* Experiment Selector Tabs */}
      <Reveal delay={50} className="mt-10 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs font-bold text-muted-foreground uppercase">
          Select Experiment:
        </span>
        {EXPERIMENTS.map((exp) => (
          <button
            key={exp.id}
            onClick={() => {
              setSelectedExpId(exp.id);
              setRevealedViva({ 0: true });
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer",
              selectedExpId === exp.id
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <span className="font-mono opacity-80">Exp {exp.number}</span>
            <span>{exp.title.split(" ").slice(0, 3).join(" ")}...</span>
          </button>
        ))}
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Mock Laboratory Window (8 Cols) */}
        <Reveal className="lg:col-span-8">
          <MockWindow
            title={`Artificial Intelligence Lab · Experiment ${currentExp.number}`}
            actions={
              <Pill tone={currentExp.dueDate.includes("Completed") ? "green" : "warn"}>
                {currentExp.dueDate}
              </Pill>
            }
          >
            <div className="grid gap-px bg-border sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              {/* Left Sub-Card: Experiment Definition & Docs */}
              <div className="bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="label-caps font-semibold text-primary">Experiment Details</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    Code: AI-LAB-304
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                  {currentExp.title}
                </h3>

                <dl className="mt-6 space-y-4 text-sm">
                  <div className="rounded-lg border border-border/70 bg-surface/60 p-3">
                    <dt className="label-caps font-bold text-muted-foreground">Aim Of Practical</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-foreground">{currentExp.aim}</dd>
                  </div>

                  <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2 text-xs">
                    <dt className="label-caps pt-0.5 text-muted-foreground">Environment:</dt>
                    <dd className="font-medium text-foreground">{currentExp.apparatus}</dd>
                  </div>

                  <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2 text-xs">
                    <dt className="label-caps pt-0.5 text-muted-foreground">Curriculum:</dt>
                    <dd className="font-medium text-foreground">{currentExp.outcome}</dd>
                  </div>
                </dl>

                {/* Practical Material Buttons */}
                <div className="mt-6 border-t border-border pt-4">
                  <span className="label-caps text-[0.65rem] text-muted-foreground uppercase">
                    Ready-To-Use Lab Packets
                  </span>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(
                          `📖 Opening Official Lab Manual For Experiment ${currentExp.number}: ${currentExp.title}`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5 cursor-pointer"
                    >
                      <BookMarked className="h-3.5 w-3.5 text-primary" />
                      <span>Lab Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(
                          `💻 Fetching Verified Clean Python/C++ Code For Experiment ${currentExp.number}...`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Code2 className="h-3.5 w-3.5 text-primary" />
                      <span>Source Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(
                          `📑 Generating Printable University Record Template For Experiment ${currentExp.number}...`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                      <span>Record Template</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sub-Card: Interactive Viva Voce Questions */}
              <div className="bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="label-caps flex items-center gap-2 font-semibold text-muted-foreground">
                    <MessageCircleQuestion className="h-4 w-4 text-primary" />
                    Viva Preparation Bank
                  </span>
                  <span className="text-[0.7rem] font-bold text-primary">
                    {currentExp.vivaQuestions.length} Questions
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {currentExp.vivaQuestions.map((item, idx) => {
                    const isOpen = Boolean(revealedViva[idx]);
                    return (
                      <div
                        key={item.q}
                        className="rounded-xl border border-border bg-surface/70 p-3.5 text-sm transition-all hover:border-primary/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-foreground">
                            <span className="mr-1.5 font-mono text-xs font-bold text-primary">
                              Q{idx + 1}.
                            </span>
                            {item.q}
                          </p>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2">
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary">
                            {item.level}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleViva(idx)}
                            className="text-xs font-semibold text-primary underline-offset-2 hover:underline cursor-pointer"
                          >
                            {isOpen ? "Hide Solution" : "Reveal Model Answer"}
                          </button>
                        </div>

                        {isOpen ? (
                          <div className="mt-2 rounded-md bg-background/80 p-2.5 text-xs leading-relaxed text-muted-foreground">
                            <span className="font-bold text-foreground">Model Answer: </span>
                            {item.a}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-lg border border-border/80 bg-accent/30 p-3 text-center">
                  <p className="text-xs font-medium text-accent-foreground">
                    12 Additional Viva Voce Prompts Available In Full Lab Packet
                  </p>
                </div>
              </div>
            </div>
          </MockWindow>
        </Reveal>

        {/* Right Column: Progress & Capabilities Tracker (4 Cols) */}
        <Reveal delay={100} className="lg:col-span-4">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-border-strong bg-card p-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="label-caps flex items-center gap-2 font-semibold text-muted-foreground">
                  <FlaskConical className="h-4 w-4 text-primary" />
                  Semester Lab Progress
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.7rem] font-bold text-emerald-600 dark:text-emerald-400">
                  On Track
                </span>
              </div>

              <div className="mt-5 flex items-baseline justify-between">
                <p className="font-display text-4xl font-bold tracking-tight text-foreground">
                  06<span className="text-xl font-normal text-muted-foreground">/10 Completed</span>
                </p>
                <span className="font-mono text-sm font-bold text-primary">60%</span>
              </div>

              {/* Progress Bar */}
              <div
                className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-valuenow={60}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: "60%" }}
                />
              </div>

              {/* Upcoming Session Notice */}
              <div className="mt-5 rounded-xl border border-border bg-surface p-3.5 text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Next Scheduled Session:</span>
                <p className="mt-0.5 font-medium">Thursday 10:30 AM · Advanced AI Lab (Room 402)</p>
              </div>

              {/* Feature Capabilities Checklist */}
              <ul className="mt-6 space-y-3">
                {CAPABILITIES.map((cap) => (
                  <li key={cap.title} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-foreground">{cap.title}</p>
                      <p className="text-[0.75rem] leading-relaxed text-muted-foreground">
                        {cap.copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
