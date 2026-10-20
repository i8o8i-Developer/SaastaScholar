import {
  BookMarked,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  Layers,
  MapPin,
  MessageCircleQuestion,
  Printer,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/Lib/Utils";
import { MockWindow, Pill, Reveal, Section } from "./Primitives";

interface VivaItem {
  q: string;
  a: string;
  level: string;
}

interface ExperimentData {
  id: string;
  number: string;
  title: string;
  code: string;
  dueDate: string;
  aim: string;
  apparatus: string;
  outcome: string;
  sourceCode: string;
  vivaQuestions: VivaItem[];
}

const EXPERIMENTS: ExperimentData[] = [
  {
    id: "exp-6",
    number: "06",
    code: "AI-LAB-304",
    title: "Implementation Of A* Search Algorithm",
    dueDate: "Record Due 26 Aug",
    aim: "To Implement A* Search Algorithm On A Weighted State Graph Using Heuristic Cost Estimates.",
    apparatus: "Python 3.11, NetworkX, Matplotlib, Lab Workstation",
    outcome: "CO3 — Formulate And Evaluate Informed Search Strategies",
    sourceCode: `import heapq

def a_star_search(graph, start, goal, heuristic):
    open_set = []
    heapq.heappush(open_set, (0 + heuristic[start], 0, start, [start]))
    visited = set()

    while open_set:
        est_cost, cost, current, path = heapq.heappop(open_set)
        if current in visited:
            continue
        visited.add(current)
        if current == goal:
            return path, cost
        for neighbor, weight in graph.get(current, {}).items():
            if neighbor not in visited:
                new_cost = cost + weight
                heapq.heappush(open_set, (new_cost + heuristic[neighbor], new_cost, neighbor, path + [neighbor]))
    return None, float('inf')`,
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
        q: "What Is The Worst Case Time Complexity Of The A* Search Algorithm?",
        a: "In The Worst Scenario With An Uninformed Heuristic, The Time Complexity Grows As O(b^d), Where b Is Branching Factor And d Is Depth.",
        level: "Exam Favorite",
      },
    ],
  },
  {
    id: "exp-4",
    number: "04",
    code: "DSA-LAB-201",
    title: "Binary Search Tree Traversals & Balancing",
    dueDate: "Record Due 19 Aug",
    aim: "To Construct A Balanced Binary Search Tree And Execute Inorder, Preorder, And Postorder Traversals.",
    apparatus: "GCC Compiler, C++20 Standard Library, Linux Terminal",
    outcome: "CO2 — Implement Complex Non-Linear Data Structures",
    sourceCode: `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node *left, *right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->data << " ";
    inorder(root->right);
}`,
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
    code: "AI-LAB-305",
    title: "Minimax Algorithm With Alpha-Beta Pruning",
    dueDate: "Record Due 02 Sep",
    aim: "To Develop An Adversarial Search Engine For Tic-Tac-Toe Using Alpha-Beta Pruned Decision Trees.",
    apparatus: "Python 3.11, Pygame Engine, Jupyter Lab",
    outcome: "CO4 — Construct Game-Playing And Strategic Reasoning Engines",
    sourceCode: `def minimax(node, depth, is_maximizing, alpha, beta):
    if depth == 0 or node.is_terminal():
        return node.evaluate()
    if is_maximizing:
        max_eval = -float('inf')
        for child in node.children():
            eval = minimax(child, depth - 1, False, alpha, beta)
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = float('inf')
        for child in node.children():
            eval = minimax(child, depth - 1, True, alpha, beta)
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return min_eval`,
    vivaQuestions: [
      {
        q: "What Condition Triggers An Alpha Cutoff In Game Search?",
        a: "A Cutoff Occurs When Beta Becomes Less Than Or Equal To Alpha, Meaning The Opponent Has A Better Alternative Already.",
        level: "Advanced",
      },
    ],
  },
];

const CHECKLIST_ITEMS = [
  { id: "task-list", title: "Practical Task List", desc: "Every Experiment For The Current Semester Arranged In Official Sequence" },
  { id: "manuals", title: "Official Lab Manuals", desc: "Verified Manuals, Code Frameworks And Procedure Guidelines Per Experiment" },
  { id: "explanations", title: "Experiment Explanations", desc: "Clear Mathematical Formulations, Theory Summaries, And Expected Screen Outputs" },
  { id: "viva-sets", title: "Curated Viva Sets", desc: "Comprehensive Question Banks With Model Answers For Confident Viva Voce" },
  { id: "templates", title: "Record-Book Templates", desc: "Pre-Formatted Header Sheets And Calculation Grids Ready To Print Or Transcribe" },
  { id: "timelines", title: "Submission Timelines", desc: "Lab Deadlines Tracked Weekly With Automated Reminders For Batch Submissions" },
  { id: "dashboard", title: "Progress Dashboard", desc: "Clear Visual Status On Completed, Pending, And Verified Lab Experiments" },
];

export function Practicals() {
  const [selectedExpId, setSelectedExpId] = useState<string>("exp-6");
  const [revealedViva, setRevealedViva] = useState<Record<number, boolean>>({ 0: true });

  // Interactive Modal / Drawer States
  const [activeModal, setActiveModal] = useState<"manual" | "code" | "record" | null>(null);

  // Dynamic Completed Count
  const [completedCount, setCompletedCount] = useState<number>(6);
  const totalCount = 10;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const currentExp = EXPERIMENTS.find((e) => e.id === selectedExpId) ?? EXPERIMENTS[0]!;

  const toggleViva = (index: number) => {
    setRevealedViva((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentExp.sourceCode);
    }
    toast.success("Source Code Copied To Clipboard!", {
      description: `Tested executable Python/C++ code for ${currentExp.title}.`,
    });
  };

  const handleToggleCompleted = () => {
    if (completedCount >= totalCount) {
      setCompletedCount(6);
      toast.info("Progress Reset to 6/10");
    } else {
      const next = completedCount + 1;
      setCompletedCount(next);
      toast.success(`Lab Experiment Completed!`, {
        description: `Progress updated to ${next}/${totalCount} (${Math.round((next / totalCount) * 100)}%).`,
      });
    }
  };

  return (
    <Section id="practicals" className="relative overflow-hidden">
      {/* Section Heading matching Image 3 */}
      <Reveal>
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>PRACTICALS &amp; LABORATORY HUB</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.12]">
            Never Walk Into A University Lab Unprepared.
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-3xl">
            Each Practical Arrives As A Complete Laboratory Packet — Official Manual, Theory Breakdown, Model Viva Questions, And Formatted Record-Book Templates — Tailored To Your Lab Section.
          </p>
        </div>
      </Reveal>

      {/* Experiment Selector Tabs matching Image 3 */}
      <Reveal delay={50} className="mt-8 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          SELECT EXPERIMENT:
        </span>
        {EXPERIMENTS.map((exp) => (
          <button
            key={exp.id}
            type="button"
            onClick={() => {
              setSelectedExpId(exp.id);
              setRevealedViva({ 0: true });
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95",
              selectedExpId === exp.id
                ? "border-emerald-500 bg-emerald-600 text-white shadow-xs font-bold"
                : "border-border bg-card text-muted-foreground hover:border-emerald-500/50 hover:text-foreground"
            )}
          >
            <span className="font-mono">Exp {exp.number}</span>
            <span>{exp.title.split(" ").slice(0, 3).join(" ")}...</span>
          </button>
        ))}
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 min-w-0">
        {/* Left Column: Interactive Mock Laboratory Window (8 Cols) */}
        <Reveal className="lg:col-span-8 min-w-0">
          <MockWindow
            title={`ARTIFICIAL INTELLIGENCE LAB · EXPERIMENT ${currentExp.number}`}
            actions={
              <Pill tone={currentExp.dueDate.includes("Completed") ? "green" : "warn"}>
                {currentExp.dueDate}
              </Pill>
            }
          >
            <div className="grid gap-px bg-border sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              {/* Left Sub-Card: Experiment Definition & Interactive Packets */}
              <div className="bg-card p-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      EXPERIMENT DETAILS
                    </span>
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      Code: {currentExp.code}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                    {currentExp.title}
                  </h3>

                  <dl className="mt-5 space-y-3.5 text-xs">
                    <div className="rounded-xl border border-border/80 bg-surface/70 p-3.5 shadow-2xs">
                      <dt className="font-bold uppercase tracking-wider text-muted-foreground text-[0.65rem]">
                        AIM OF PRACTICAL
                      </dt>
                      <dd className="mt-1 text-xs leading-relaxed text-foreground font-medium">
                        {currentExp.aim}
                      </dd>
                    </div>

                    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2 text-xs">
                      <dt className="font-bold uppercase tracking-wider text-muted-foreground text-[0.65rem]">
                        ENVIRONMENT:
                      </dt>
                      <dd className="font-medium text-foreground">{currentExp.apparatus}</dd>
                    </div>

                    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-2 text-xs">
                      <dt className="font-bold uppercase tracking-wider text-muted-foreground text-[0.65rem]">
                        CURRICULUM:
                      </dt>
                      <dd className="font-medium text-foreground">{currentExp.outcome}</dd>
                    </div>
                  </dl>
                </div>

                {/* Practical Material Buttons Row */}
                <div className="border-t border-border pt-4">
                  <span className="block text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    READY-TO-USE LAB PACKETS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal("manual")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-emerald-500 hover:text-emerald-600 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <BookMarked className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Lab Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal("code")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-emerald-500 hover:text-emerald-600 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <Code2 className="h-3.5 w-3.5 text-cyan-500" />
                      <span>Source Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal("record")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-emerald-500 hover:text-emerald-600 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-purple-500" />
                      <span>Record Template</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sub-Card: Viva Voce Preparation Bank matching Image 3 */}
              <div className="bg-card p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <MessageCircleQuestion className="h-4 w-4 text-emerald-500" />
                      VIVA PREPARATION BANK
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {currentExp.vivaQuestions.length} Questions
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {currentExp.vivaQuestions.map((item, idx) => {
                      const isOpen = Boolean(revealedViva[idx]);
                      return (
                        <div
                          key={item.q}
                          className="rounded-xl border border-border bg-surface/70 p-3.5 text-xs transition-all hover:border-emerald-500/40"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-foreground leading-snug">
                              <span className="mr-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                Q{idx + 1}.
                              </span>
                              {item.q}
                            </p>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2">
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400">
                              {item.level}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleViva(idx)}
                              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline-offset-2 hover:underline cursor-pointer"
                            >
                              {isOpen ? "Hide Solution" : "Reveal Model Answer"}
                            </button>
                          </div>

                          {isOpen && (
                            <div className="mt-2 rounded-lg bg-card border border-border/80 p-2.5 text-xs leading-relaxed text-muted-foreground animate-smooth-entrance">
                              <strong className="text-foreground">Model Answer: </strong>
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface/80 p-3 text-center">
                  <p className="text-xs font-semibold text-muted-foreground">
                    12 Additional Viva Voce Prompts Available In Full Lab Packet
                  </p>
                </div>
              </div>
            </div>
          </MockWindow>
        </Reveal>

        {/* Right Column: Progress & Capabilities Tracker matching Image 3 (4 Cols) */}
        <Reveal delay={100} className="lg:col-span-4 min-w-0">
          <div className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div>
              {/* Header with Title and On Track Badge */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <FlaskConical className="h-4 w-4 text-emerald-500" />
                  SEMESTER LAB PROGRESS
                </span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400">
                  On Track
                </span>
              </div>

              {/* Interactive Big Number + Progress Bar */}
              <div
                onClick={handleToggleCompleted}
                className="mt-4 p-4 rounded-2xl bg-surface/80 border border-border/80 hover:border-emerald-500/50 cursor-pointer transition-all active:scale-[0.99] group"
                title="Click to mark another experiment complete"
              >
                <div className="flex items-baseline justify-between">
                  <div className="font-display text-3xl sm:text-4xl font-black text-foreground">
                    {String(completedCount).padStart(2, "0")}
                    <span className="text-xl sm:text-2xl text-muted-foreground font-normal">
                      /{totalCount} Completed
                    </span>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {progressPercent}%
                  </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-[0.65rem] text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Tap to update completion status ↻
                </p>
              </div>

              {/* Next Scheduled Session */}
              <div className="mt-4 rounded-2xl border border-border/80 bg-surface/60 p-3.5 space-y-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Next Scheduled Session:
                </p>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Thursday 10:30 AM · Advanced AI Lab (Room 402)</span>
                </p>
              </div>

              {/* Checklist from Image 3 */}
              <div className="mt-5 space-y-3">
                {CHECKLIST_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toast.info(`${item.title}: ${item.desc}`)}
                    className="flex items-start gap-2.5 text-xs p-1.5 rounded-xl hover:bg-surface transition-colors cursor-pointer group"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[0.68rem] text-muted-foreground leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Interactive Modal for Lab Manual / Code / Record */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-smooth-entrance"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                  {activeModal === "manual" && <BookMarked className="h-4 w-4" />}
                  {activeModal === "code" && <Code2 className="h-4 w-4" />}
                  {activeModal === "record" && <FileSpreadsheet className="h-4 w-4" />}
                </span>
                <div>
                  <h4 className="font-display font-bold text-base text-foreground">
                    {activeModal === "manual" && `Lab Manual · Exp ${currentExp.number}`}
                    {activeModal === "code" && `Tested Source Code · Exp ${currentExp.number}`}
                    {activeModal === "record" && `Printable Record Sheet · Exp ${currentExp.number}`}
                  </h4>
                  <p className="text-xs text-muted-foreground">{currentExp.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-surface border border-border text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {activeModal === "manual" && (
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <p className="font-bold text-foreground mb-1">1. Objective / Aim</p>
                  <p>{currentExp.aim}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <p className="font-bold text-foreground mb-1">2. Hardware &amp; Software Environment</p>
                  <p>{currentExp.apparatus}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <p className="font-bold text-foreground mb-1">3. Step-by-Step Execution Procedure</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Initialize Heuristic Table With Estimated Distances To Goal Node.</li>
                    <li>Enqueue Start Node With f(n) = g(n) + h(n).</li>
                    <li>Extract Minimum f-cost Node And Expand Valid Unvisited Neighbours.</li>
                    <li>Terminate Upon Dequeuing Goal Node And Print Optimum Path Cost.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeModal === "code" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground font-semibold">Python 3.11 Tested</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Code</span>
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-border">
                  {currentExp.sourceCode}
                </pre>
              </div>
            )}

            {activeModal === "record" && (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl border border-dashed border-border bg-surface text-center space-y-2">
                  <p className="font-bold text-foreground text-sm">University Lab Record Observation Sheet</p>
                  <p className="text-muted-foreground">Experiment No: {currentExp.number} · {currentExp.code}</p>
                  <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-border/80">
                    <div>Student Name: ____________</div>
                    <div>Roll Number: ____________</div>
                    <div>Faculty Signature: ____________</div>
                    <div>Grade Awarded: [ A+ / A / B ]</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Record Sheet Sent To Print Spooler")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Record Sheet</span>
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-foreground hover:bg-card cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
