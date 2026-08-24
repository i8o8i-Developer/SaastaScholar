import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Cpu,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { apiFetch, LabExperiment, Subject } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";
import { toast } from "sonner";

export function LabsHub() {
  const [experiments, setExperiments] = useState<LabExperiment[]>([]);
  const [selectedExp, setSelectedExp] = useState<LabExperiment | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<string>("python");
  const [revealedViva, setRevealedViva] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLabs() {
      try {
        const res = await apiFetch<LabExperiment[]>("/academic/labs/");
        const items = Array.isArray(res) ? res : ((res as any)?.results || []);
        setExperiments(items);
        if (items.length > 0) {
          setSelectedExp(items[0]);
        }
      } catch (err) {
        console.error("Error Loading Lab Experiments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLabs();
  }, []);

  const toggleVivaReveal = (index: number) => {
    setRevealedViva((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopyCode = () => {
    toast.error("🔒 Direct Code Extraction Is Restricted By DRM Policy For Academic Integrity.");
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-card via-surface/90 to-card p-6 sm:p-8 shadow-xs backdrop-blur-md">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300 mb-2">
          <FlaskConical className="h-3.5 w-3.5" />
          <span>Faculty-Verified Lab Manuals &amp; 50+ Viva Voce Drills</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Practical Hub &amp; Viva Voce Question Bank
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Complete Experiment Procedures, Verified Multi-Language Source Codes, Output Traces, And High-Frequency Viva Questions.
        </p>
      </div>

      {/* Experiments Navigation Selector */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {experiments.map((exp) => {
          const isSelected = selectedExp?.id === exp.id;
          return (
            <button
              key={exp.id}
              type="button"
              onClick={() => {
                setSelectedExp(exp);
                setRevealedViva({});
              }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs text-left",
                isSelected
                  ? "border-purple-500 bg-surface text-foreground font-bold shadow-xs ring-1 ring-purple-500/30"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-xl font-bold text-xs",
                  isSelected ? "bg-purple-600 text-white shadow-xs" : "bg-surface text-muted-foreground",
                )}
              >
                {exp.experiment_number}
              </div>
              <div className="min-w-0 max-w-[220px]">
                <p className="truncate text-foreground font-bold">{exp.title}</p>
                <p className="text-[0.65rem] text-muted-foreground">{exp.subject_code} · Verified Record</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Experiment View */}
      {selectedExp ? (
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Left Column: Aim, Theory, Procedure & Viva Drill (6 cols) */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            {/* Experiment Aim & Apparatus */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4 flex-1">
              <div>
                <span className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400 font-mono tracking-wider">
                  EXPERIMENT {selectedExp.experiment_number} · OBJECTIVE &amp; AIM
                </span>
                <h3 className="text-base sm:text-lg font-bold text-foreground mt-1.5 leading-snug">{selectedExp.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {selectedExp.aim}
                </p>
              </div>

              {selectedExp.apparatus_required && (
                <div className="rounded-2xl bg-surface/70 p-3.5 border border-border/60 text-xs">
                  <span className="font-bold text-foreground">Apparatus &amp; Software Environment:</span>
                  <p className="text-muted-foreground mt-0.5 font-medium">{selectedExp.apparatus_required}</p>
                </div>
              )}

              {/* Theory */}
              <div className="pt-3 border-t border-border/60">
                <span className="text-xs uppercase font-bold text-foreground tracking-wider">Theoretical Background &amp; Mathematical Model</span>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {selectedExp.theory}
                </p>
              </div>

              {/* Procedure */}
              {selectedExp.procedure_steps && selectedExp.procedure_steps.length > 0 ? (
                <div className="pt-3 border-t border-border/60">
                  <span className="text-xs uppercase font-bold text-foreground tracking-wider">Step-by-Step Practical Procedure</span>
                  <ol className="mt-2.5 space-y-2 text-xs text-muted-foreground">
                    {selectedExp.procedure_steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[0.65rem] font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="flex-1 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>

            {/* Viva Voce Flashcard Drill Bank */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-purple-500" />
                  <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                    Viva Voce Question Bank (50+ Drill)
                  </span>
                </div>
                <span className="text-[0.65rem] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  High Probability
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {selectedExp.viva_questions?.map((item: any, idx) => {
                  const isRevealed = revealedViva[idx];
                  const qText = item.question || item.q || "High-Yield Viva Question";
                  const aText = item.answer || item.a || "Standard Faculty Analytical Derivation & Working Procedure.";
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/70 bg-surface/70 p-3.5 transition-all text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">Q{idx + 1}.</span>
                          <span className="font-bold text-foreground">{qText}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleVivaReveal(idx)}
                          className="shrink-0 rounded-lg p-1 hover:bg-surface text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
                        >
                          {isRevealed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                      {isRevealed && (
                        <div className="mt-2.5 pt-2.5 border-t border-border/60 text-[0.75rem] text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-3 rounded-xl animate-in fade-in duration-150">
                          <span className="font-bold">Model Faculty Answer: </span>
                          <span className="leading-relaxed">{aText}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Code Viewer & Output (6 cols) */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                      Verified Multi-Language Source Code
                    </span>
                  </div>

                  {/* Code Tabs */}
                  <div className="flex items-center gap-1 rounded-xl bg-surface p-1 border border-border text-xs shadow-2xs">
                    {Object.keys(selectedExp.code_snippets || {}).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveCodeTab(lang)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-[0.65rem] font-bold uppercase transition-all cursor-pointer",
                          activeCodeTab === lang ? "bg-primary text-primary-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Box */}
                <div className="relative rounded-2xl bg-zinc-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-zinc-800 shadow-inner select-none min-h-[380px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[0.65rem] text-zinc-500">
                    <span>{activeCodeTab.toUpperCase()} Verified Implementation</span>
                    <span className="text-zinc-600 font-bold">DRM Protected Record</span>
                  </div>
                  <pre className="leading-relaxed whitespace-pre-wrap font-mono">
                    {selectedExp.code_snippets?.[activeCodeTab] || "# Code Implementation Available In Practical Record"}
                  </pre>
                </div>
              </div>

              {/* Output Sample */}
              {selectedExp.output_sample && (
                <div className="pt-3 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground mb-2">
                    <Terminal className="h-3.5 w-3.5 text-cyan-500" />
                    <span>Verified Console Execution Output:</span>
                  </div>
                  <div className="rounded-2xl bg-surface/90 p-3.5 font-mono text-[0.75rem] text-cyan-600 dark:text-cyan-400 border border-border/80">
                    {selectedExp.output_sample}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-muted-foreground mx-auto">
            <FlaskConical className="h-6 w-6" />
          </div>
          <h3 className="font-display font-bold text-base text-foreground">No Practical Experiments Published Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Practical Records, Code Implementations, And Viva Drills Added By The Department Will Appear Here.
          </p>
        </div>
      )}
    </div>
  );
}
