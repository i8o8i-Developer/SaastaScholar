import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Cpu,
  FileCheck2,
  FileText,
  Flame,
  Key,
  Layers,
  Loader2,
  Plus,
  Send,
  Sparkles,
  Tag,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { apiFetch, StudentAssignment, Subject } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";
import { toast } from "sonner";

export function AssignmentsTracker() {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Gemini AI Modal State
  const [aiTopic, setAiTopic] = useState<string>("");
  const [aiSubject, setAiSubject] = useState<string>("");
  const [aiFormat, setAiFormat] = useState<string>("IEEE");
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem("nimswallah_gemini_key") || "");
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [generatedOutline, setGeneratedOutline] = useState<any | null>(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const [assignsData, subsData] = await Promise.allSettled([
        apiFetch<StudentAssignment[]>("/assignments/"),
        apiFetch<Subject[]>("/academic/subjects/"),
      ]);

      if (assignsData.status === "fulfilled") {
        const data = assignsData.value;
        setAssignments(Array.isArray(data) ? data : ((data as any)?.results || []));
      } else {
        setAssignments([]);
      }

      if (subsData.status === "fulfilled") {
        const data = subsData.value;
        setSubjects(Array.isArray(data) ? data : ((data as any)?.results || []));
      }
    } catch (err) {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleToggleStatus = async (assignmentId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "PENDING"
        ? "IN_PROGRESS"
        : currentStatus === "IN_PROGRESS"
          ? "SUBMITTED"
          : "PENDING";

    try {
      const updated = await apiFetch<StudentAssignment>(
        `/assignments/${assignmentId}/status/`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: updated.status } : a)),
      );
      toast.success(`Assignment Marked As ${nextStatus.replace("_", " ")}.`);
    } catch (err: any) {
      toast.error(err.message || "Failed To Update Status.");
    }
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      toast.error("Please Enter Assignment Topic Or Title.");
      return;
    }

    try {
      setAiGenerating(true);
      if (geminiApiKey.trim()) {
        localStorage.setItem("nimswallah_gemini_key", geminiApiKey.trim());
      }

      const res = await apiFetch<any>("/assignments/generate-outline/", {
        method: "POST",
        body: JSON.stringify({
          topic: aiTopic,
          subject: aiSubject || (subjects[0]?.name ?? "Computer Science & Engineering"),
          format: aiFormat,
          gemini_api_key: geminiApiKey.trim(),
        }),
      });

      setGeneratedOutline(res);
      toast.success(
        res.model_used?.includes("Gemini")
          ? "Academic Outline Generated With Live Gemini AI!"
          : "Academic Outline Formatted With Curriculum Standards."
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI outline.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Citation Copied To Clipboard.");
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto min-w-0">
      {/* ================= Header Banner ================= */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-emerald-500/10 via-surface to-teal-500/10 p-3.5 xs:p-4.5 sm:p-7 backdrop-blur-md shadow-xs min-w-0">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="space-y-1.5 sm:space-y-2 min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 sm:px-3 py-0.5 text-[0.62rem] xs:text-[0.68rem] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span>AI Powered Academic Workflow Engine</span>
            </div>
            <h1 className="font-display text-base xs:text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words leading-tight">
              Assignment Tracker &amp; Formatter Hub
            </h1>
            <p className="text-[0.7rem] xs:text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl break-words">
              Track Term Submissions, Marks Weightage, Due Dates, And Generate IEEE-Standard Academic Outlines With Gemini AI.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setAiTopic("");
              setAiSubject(subjects[0]?.name || "Artificial Intelligence");
              setGeneratedOutline(null);
              setAiModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Wand2 className="h-4 w-4 shrink-0" />
            <span>Launch Gemini AI Formatter</span>
          </button>
        </div>
      </div>

      {/* ================= Assignments Grid ================= */}
      {loading ? (
        <div className="grid gap-3.5 sm:gap-5 sm:grid-cols-2 min-w-0">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/60 animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 sm:p-12 text-center space-y-3.5 min-w-0 flex flex-col items-center justify-center shadow-2xs">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
            <FileCheck2 className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-display font-bold text-sm sm:text-base text-foreground">No Assignments Published Yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Assignments Published By Faculty In The Admin Portal Will Appear Here With Submission Due Dates, Rubrics, And Marks Weightage.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:gap-5 sm:grid-cols-2 min-w-0">
          {assignments.map((item) => {
            const isDone = item.status === "SUBMITTED" || item.status === "EVALUATED";
            const inProg = item.status === "IN_PROGRESS";

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl sm:rounded-3xl border bg-card p-3.5 xs:p-4.5 sm:p-6 shadow-xs flex flex-col justify-between space-y-3.5 sm:space-y-4 transition-all hover:border-primary/50 min-w-0",
                  isDone ? "border-border/60 opacity-80" : "border-border/90",
                )}
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5 min-w-0">
                    <span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-[0.65rem] xs:text-xs font-bold font-mono text-primary">
                      {item.subject_code || "ACAD"}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 xs:px-2.5 py-0.5 text-[0.62rem] xs:text-[0.65rem] font-bold uppercase tracking-wide shrink-0",
                        isDone
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : inProg
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Full Subject Name (No Truncation) */}
                  {item.subject_name && (
                    <span className="text-[0.65rem] xs:text-[0.7rem] font-mono font-bold text-muted-foreground block leading-snug break-words">
                      {item.subject_name}
                    </span>
                  )}

                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground leading-snug break-words">
                    {item.title}
                  </h3>
                  <p className="text-[0.72rem] xs:text-xs text-muted-foreground leading-relaxed break-words">
                    {item.description || "Continuous assessment assignment module."}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2.5 border-t border-border/60 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-[0.7rem] xs:text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Due: <strong className="text-foreground">{item.due_date}</strong></span>
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {item.total_marks} Marks
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground hover:bg-card hover:border-primary/50 cursor-pointer transition-all active:scale-95"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Toggle Submission Status</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAiTopic(item.title);
                        setAiSubject(item.subject_name || "Computer Science");
                        setGeneratedOutline(null);
                        setAiModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer transition-all active:scale-95"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate AI Outline</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= Gemini AI Outline Generator Modal ================= */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold text-lg text-foreground">
                  Gemini AI Academic Outline Generator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateAI} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">Assignment Problem Title / Topic</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g.  Heuristic Search Algorithms & a* Admissibility Proofs"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Target Subject Module</label>
                  <input
                    type="text"
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    placeholder="Artificial Intelligence"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">Citation Standard</label>
                  <select
                    value={aiFormat}
                    onChange={(e) => setAiFormat(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  >
                    <option value="IEEE">IEEE Reference Style</option>
                    <option value="APA 7th">APA 7th Edition</option>
                    <option value="Harvard">Harvard Reference Format</option>
                    <option value="ACM">ACM Digital Library Style</option>
                  </select>
                </div>
              </div>

              {/* Gemini API Key Optional Input */}
              <div className="rounded-2xl border border-border/80 bg-surface/60 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-foreground text-xs">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    <span>Gemini AI API Key (Optional)</span>
                  </div>
                  <span className="text-[0.65rem] text-muted-foreground font-mono">
                    {geminiApiKey ? "API Key Configured" : "Uses Server / Curriculum Model"}
                  </span>
                </div>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy... (Paste Your Gemini Key for Live AI Generation)"
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 font-mono text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={aiGenerating}
                className="h-11 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{aiGenerating ? "Generating Rigorous Academic Outline..." : "Generate Assignment Outline & Citations"}</span>
              </button>
            </form>

            {/* Generated Outline Result */}
            {generatedOutline && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-primary uppercase tracking-wider">
                    {generatedOutline.model_used || "Generated Academic Structure"}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-emerald-600">
                    {generatedOutline.format} Format
                  </span>
                </div>

                <div className="space-y-3">
                  {generatedOutline.outline?.map((sec: any, idx: number) => (
                    <div key={idx} className="rounded-2xl border border-border/70 bg-surface/70 p-3.5 space-y-1">
                      <h4 className="font-bold text-xs text-foreground">{sec.section}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{sec.details}</p>
                    </div>
                  ))}
                </div>

                {/* Formatted Citations */}
                {generatedOutline.citations?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="font-bold text-xs text-foreground block">Compliant Academic Citations:</span>
                    {generatedOutline.citations.map((cite: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border/60 text-xs">
                        <span className="font-mono text-[0.7rem] text-muted-foreground leading-snug">{cite}</span>
                        <button
                          onClick={() => handleCopyCitation(cite)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Copy Citation"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
