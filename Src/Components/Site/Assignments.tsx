import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileDown,
  FileText,
  Layers,
  Quote,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/Lib/Utils";
import { Cta, MockWindow, Pill, Reveal, Section, SectionHeading } from "./Primitives";

const TOOLS = [
  { id: "ai-creator", label: "AI Assignment Creator", icon: Sparkles },
  { id: "templates", label: "Assignment Templates", icon: Layers },
  { id: "tracker", label: "Deadline Tracker", icon: Clock },
  { id: "status", label: "Submission Status", icon: CheckCircle2 },
  { id: "pdf-gen", label: "PDF Generation", icon: FileDown },
  { id: "word-gen", label: "Word Generation", icon: FileText },
  { id: "citation-gen", label: "Citation Generator", icon: Quote },
  { id: "reference-gen", label: "Reference Generator", icon: Quote },
  { id: "self-check", label: "Self-Check", icon: Check },
  { id: "history", label: "Assignment History", icon: Clock },
];

const MODULE_OPTIONS = [
  "Data Structures · Semester 1 · Section A",
  "Design & Analysis Of Algorithms · Semester 3",
  "Machine Learning & Pattern Recognition · Semester 5",
  "Operating Systems & Architecture · Semester 3",
];

const TOPIC_OPTIONS = [
  "Comparative Analysis Of Sorting Algorithms",
  "Implementation Of Red-Black Trees & Balancing",
  "Neural Network Optimization Using Adam vs SGD",
  "Process Synchronization In Unix Kernels",
];

const FORMAT_OPTIONS = ["University Template", "IEEE Conference", "Springer LNCS", "Harvard Standard"];
const CITATION_OPTIONS = ["IEEE", "APA 7th", "MLA 9th", "Chicago"];

interface TrackerItem {
  id: string;
  title: string;
  due: string;
  status: "In Progress" | "Not Started" | "Submitted";
  tone: "warn" | "neutral" | "green";
}

const INITIAL_TRACKER: TrackerItem[] = [
  { id: "1", title: "Data Structures — Assignment 3", due: "Due In 2 Days", status: "In Progress", tone: "warn" },
  { id: "2", title: "Engineering Maths — Tutorial Sheet 4", due: "Due In 6 Days", status: "Not Started", tone: "neutral" },
  { id: "3", title: "Intro To AI — Case Study", due: "Submitted 18 Aug", status: "Submitted", tone: "green" },
];

export function Assignments() {
  const [activeTool, setActiveTool] = useState<string>("ai-creator");
  const [moduleIndex, setModuleIndex] = useState(0);
  const [topicIndex, setTopicIndex] = useState(0);
  const [formatIndex, setFormatIndex] = useState(0);
  const [citationIndex, setCitationIndex] = useState(0);

  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<boolean>(true);
  const [showDraftPreview, setShowDraftPreview] = useState(false);

  const [trackerItems, setTrackerItems] = useState<TrackerItem[]>(INITIAL_TRACKER);

  const handleToolClick = (toolId: string, label: string) => {
    setActiveTool(toolId);
    toast.success(`${label} Activated`, {
      description: "Interactive tools ready in live workspace.",
    });
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGeneratedDraft(true);
      setShowDraftPreview(true);
      toast.success("Draft Generated Successfully!", {
        description: `Ready for ${MODULE_OPTIONS[moduleIndex]}.`,
      });
    }, 700);
  };

  const handleExportPdf = () => {
    toast.success("PDF Export Complete", {
      description: `${TOPIC_OPTIONS[topicIndex]}.pdf Generated With University Cover Page.`,
    });
  };

  const handleExportWord = () => {
    toast.success("Word DOCX Exported", {
      description: "Formatted Document With Standard 1.15 Line Spacing Ready.",
    });
  };

  const handleCopyReferences = () => {
    toast.success(`${CITATION_OPTIONS[citationIndex]} References Copied`, {
      description: "5 Peer-Reviewed Academic Citations copied to clipboard.",
    });
  };

  const toggleTrackerItem = (id: string) => {
    setTrackerItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.status === "In Progress") {
          toast.success(`Marked "${item.title}" As Submitted!`);
          return { ...item, status: "Submitted", tone: "green" };
        }
        if (item.status === "Submitted") {
          toast.info(`Reset "${item.title}" To Not Started`);
          return { ...item, status: "Not Started", tone: "neutral" };
        }
        toast.info(`Updated "${item.title}" To In Progress`);
        return { ...item, status: "In Progress", tone: "warn" };
      })
    );
  };

  return (
    <Section id="assignments" tone="surface">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        {/* Left Column: Heading, Interactive Tools Grid & CTA */}
        <Reveal>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ASSIGNMENTS &amp; COURSEWORK</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.12]">
              Assignments Without The Chaos.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              Create, Organize And Track Every Assignment From One Place — From First Draft To Final Submission, With Formatting And References Handled.
            </p>
          </div>

          {/* Interactive Tools Grid (Clickable With Instant Feedback) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  type="button"
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id, tool.label)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-left active:scale-[0.98]",
                    isActive
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/30"
                      : "border-border bg-card text-foreground hover:border-emerald-500/40 hover:bg-surface"
                  )}
                >
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-emerald-500" : "text-muted-foreground"
                    )}
                  />
                  <span className="truncate">{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <Cta href="/login?mode=signup" size="lg" className="w-full sm:w-auto shadow-md">
              <span>Explore Assignment Tools</span>
              <Sparkles className="h-4 w-4 ml-1.5" />
            </Cta>
          </div>
        </Reveal>

        {/* Right Column: Interactive Mock Windows (AI Creator & Deadline Tracker) */}
        <Reveal delay={100} className="grid gap-6 min-w-0">
          {/* Mock Window 1: New Assignment · AI Creator */}
          <MockWindow
            title="NEW ASSIGNMENT · AI CREATOR"
            actions={
              <button
                type="button"
                onClick={() => setShowDraftPreview(!showDraftPreview)}
                className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <Pill tone="green">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  <span>Draft Ready</span>
                </Pill>
              </button>
            }
          >
            <div className="space-y-4 p-5 sm:p-6 bg-card min-w-0">
              {/* Subject Module */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  <span>SUBJECT MODULE</span>
                  <span className="text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-normal">
                    (Click to switch module)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setModuleIndex((prev) => (prev + 1) % MODULE_OPTIONS.length)}
                  className="w-full text-left rounded-xl border border-border bg-surface px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground transition-all hover:border-emerald-500/50 hover:bg-surface/80 cursor-pointer flex items-center justify-between shadow-2xs"
                >
                  <span className="truncate">{MODULE_OPTIONS[moduleIndex]}</span>
                  <span className="text-[0.68rem] text-muted-foreground ml-2 font-mono shrink-0">Switch ↻</span>
                </button>
              </div>

              {/* Assignment Topic */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  <span>ASSIGNMENT TOPIC</span>
                  <span className="text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-normal">
                    (Click to change topic)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTopicIndex((prev) => (prev + 1) % TOPIC_OPTIONS.length)}
                  className="w-full text-left rounded-xl border border-border bg-surface px-4 py-2.5 text-xs sm:text-sm font-semibold text-foreground transition-all hover:border-emerald-500/50 hover:bg-surface/80 cursor-pointer flex items-center justify-between shadow-2xs"
                >
                  <span className="truncate">{TOPIC_OPTIONS[topicIndex]}</span>
                  <span className="text-[0.68rem] text-muted-foreground ml-2 font-mono shrink-0">Change ↻</span>
                </button>
              </div>

              {/* Format & Citation Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    FORMAT
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormatIndex((prev) => (prev + 1) % FORMAT_OPTIONS.length)}
                    className="w-full text-left rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-emerald-500/50 cursor-pointer flex items-center justify-between shadow-2xs"
                  >
                    <span className="truncate">{FORMAT_OPTIONS[formatIndex]}</span>
                    <span className="text-[0.65rem] text-muted-foreground ml-1">↻</span>
                  </button>
                </div>
                <div>
                  <div className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    CITATION STYLE
                  </div>
                  <button
                    type="button"
                    onClick={() => setCitationIndex((prev) => (prev + 1) % CITATION_OPTIONS.length)}
                    className="w-full text-left rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition-all hover:border-emerald-500/50 cursor-pointer flex items-center justify-between shadow-2xs"
                  >
                    <span className="truncate">{CITATION_OPTIONS[citationIndex]}</span>
                    <span className="text-[0.65rem] text-muted-foreground ml-1">↻</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{generating ? "Generating Draft..." : "Generate Draft"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-emerald-500 hover:text-emerald-600 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <FileDown className="h-3.5 w-3.5 text-emerald-500" />
                  <span>PDF Export</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportWord}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-emerald-500 hover:text-emerald-600 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <FileText className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Word DOCX</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyReferences}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-emerald-500 hover:text-emerald-600 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Quote className="h-3.5 w-3.5 text-amber-500" />
                  <span>IEEE References</span>
                </button>
              </div>

              {/* Inline Generated Draft Expansion */}
              {showDraftPreview && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs space-y-2 animate-smooth-entrance">
                  <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Generated Paper Outline ({FORMAT_OPTIONS[formatIndex]})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDraftPreview(false)}
                      className="text-[0.68rem] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Close ✕
                    </button>
                  </div>
                  <div className="space-y-1.5 font-mono text-[0.72rem] text-muted-foreground">
                    <p className="text-foreground font-semibold">1. Abstract &amp; Problem Statement</p>
                    <p>Analysis of Quicksort, Mergesort, and Heapsort in O(n log n) average time complexity.</p>
                    <p className="text-foreground font-semibold">2. Empirical Benchmark Matrix</p>
                    <p>Memory overhead comparison table formatted to {CITATION_OPTIONS[citationIndex]} standards.</p>
                  </div>
                </div>
              )}
            </div>
          </MockWindow>

          {/* Mock Window 2: Deadline Tracker (Clickable Statuses) */}
          <MockWindow
            title="DEADLINE TRACKER"
            actions={
              <span className="text-[0.68rem] text-muted-foreground font-mono">
                Click Task To Update Status
              </span>
            }
          >
            <ul className="divide-y divide-border bg-card">
              {trackerItems.map((item) => (
                <li
                  key={item.id}
                  onClick={() => toggleTrackerItem(item.id)}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 transition-all hover:bg-surface cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[0.7rem] text-muted-foreground">{item.due}</p>
                    </div>
                  </div>
                  <Pill tone={item.tone}>{item.status}</Pill>
                </li>
              ))}
            </ul>
          </MockWindow>
        </Reveal>
      </div>
    </Section>
  );
}
