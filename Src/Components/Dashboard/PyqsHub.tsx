import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookMarked,
  CheckCircle2,
  FileCheck2,
  FileText,
  Filter,
  Flame,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AcademicMaterial, apiFetch, Subject } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

interface PyqsHubProps {
  onOpenReader: (materialId: string) => void;
}

export function PyqsHub({ onOpenReader }: PyqsHubProps) {
  const [pyqs, setPyqs] = useState<AcademicMaterial[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadPyqs() {
      try {
        const [pyqsRes, subsRes] = await Promise.allSettled([
          apiFetch<AcademicMaterial[]>("/academic/materials/?type=SOLVED_PYQ"),
          apiFetch<Subject[]>("/academic/subjects/"),
        ]);
        if (pyqsRes.status === "fulfilled") {
          const data = pyqsRes.value;
          setPyqs(Array.isArray(data) ? data : ((data as any)?.results || []));
        }
        if (subsRes.status === "fulfilled") {
          const data = subsRes.value;
          setSubjects(Array.isArray(data) ? data : ((data as any)?.results || []));
        }
      } catch (err) {
        console.error("Error Loading Solved PYQs:", err);
      }
    }
    loadPyqs();
  }, []);

  const filteredPyqs = pyqs.filter((p) => {
    const matchesSubject = selectedSubject === "ALL" || p.subject_code === selectedSubject;
    const matchesYear = selectedYear === "ALL" || p.academic_year === selectedYear;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subject_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto min-w-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-cyan-500/10 via-surface to-blue-500/10 p-4 sm:p-7 shadow-xs backdrop-blur-md min-w-0">
        <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 sm:px-3 py-0.5 text-[0.65rem] sm:text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-1.5">
              <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">2020–2027 University Solved Question Papers</span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words">
              Solved PYQ Archive &amp; Answer Keys
            </h1>
            <p className="text-[0.72rem] sm:text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
              Step-By-Step Model Solutions Matching NIMS University Evaluation Marking Schemes And High-Yield 10-Mark Exam Questions.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Solved Papers, Years..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 sm:h-11 w-full rounded-2xl border border-border/80 bg-background/90 pr-3 pl-10 text-xs placeholder:text-muted-foreground/70 focus:border-cyan-500 focus:outline-none shadow-xs transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter Toolbar Container */}
      <div className="space-y-2.5">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar min-w-0">
          <button
            type="button"
            onClick={() => setSelectedSubject("ALL")}
            className={cn(
              "rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-[0.7rem] sm:text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs",
              selectedSubject === "ALL"
                ? "bg-primary text-primary-foreground font-bold shadow-xs scale-[1.02]"
                : "border border-border/70 bg-card text-muted-foreground hover:bg-surface hover:text-foreground",
            )}
          >
            All PYQs ({pyqs.length})
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.code}
              type="button"
              onClick={() => setSelectedSubject(sub.code)}
              className={cn(
                "rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-[0.7rem] sm:text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs max-w-[220px] truncate sm:max-w-none",
                selectedSubject === sub.code
                  ? "bg-primary text-primary-foreground font-bold shadow-xs scale-[1.02]"
                  : "border border-border/70 bg-card text-muted-foreground hover:bg-surface hover:text-foreground",
              )}
            >
              {sub.code}: {sub.name}
            </button>
          ))}
        </div>

        {/* Year Filter Segmented Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface/70 border border-border/60 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <span className="text-muted-foreground font-bold text-[0.62rem] sm:text-[0.68rem] uppercase tracking-wider px-2 shrink-0">Exam Year:</span>
          {["ALL", "2026-2027", "2025-2026", "2024", "2023", "2022"].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={cn(
                "rounded-xl px-2.5 sm:px-3 py-1 text-[0.65rem] sm:text-xs font-bold transition-all cursor-pointer shrink-0",
                selectedYear === yr
                  ? "bg-background border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 shadow-xs font-extrabold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {yr === "ALL" ? "All Years" : yr}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredPyqs.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center space-y-3 min-w-0">
          <FileCheck2 className="h-9 w-9 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40" />
          <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
            No Solved PYQ Papers Published Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Faculty And Administrators Can Publish Solved University Question Papers With Model Answer Keys Via The Admin Portal.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch min-w-0">
          {filteredPyqs.map((pyq) => (
            <div
              key={pyq.id}
              onClick={() => onOpenReader(pyq.id)}
              className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-4 sm:p-6 shadow-xs transition-all hover:border-cyan-500/50 hover:shadow-lg active:scale-[0.99] cursor-pointer min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 text-[0.65rem] sm:text-xs font-mono font-bold">
                      {pyq.subject_code} · {pyq.academic_year}
                    </span>
                    {pyq.file ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold font-mono">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span>{pyq.file.endsWith(".pdf") ? "PDF Doc" : pyq.file.endsWith(".docx") ? "Word" : "File"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold font-mono">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>Solved Key</span>
                      </span>
                    )}
                  </div>

                  <span className="rounded-xl bg-surface px-2 py-0.5 text-[0.6rem] sm:text-[0.65rem] font-bold text-muted-foreground border border-border/60 font-mono shrink-0">
                    {pyq.page_count} Pages
                  </span>
                </div>

                <h3 className="mt-3 text-sm sm:text-base font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug break-words">
                  {pyq.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed break-words min-h-[32px]">
                  {pyq.summary || "Official university previous year solved paper with model derivations."}
                </p>

                {pyq.tags && pyq.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {pyq.tags.map((t, idx) => (
                      <span key={idx} className="rounded-lg bg-surface/80 border border-border/60 px-1.5 py-0.5 text-[0.6rem] font-mono text-muted-foreground truncate">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.65rem] sm:text-[0.7rem]">
                  <span className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-xl border border-cyan-500/20">
                    <CheckCircle2 className="h-3 w-3 shrink-0" /> 10-Mark Solved
                  </span>
                  <span className="text-muted-foreground font-mono font-semibold bg-surface px-2 py-0.5 rounded-xl border border-border/60">
                    Verified Keys
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="text-[0.65rem] text-muted-foreground font-semibold">Strictly View-Only</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[0.7rem] sm:text-xs">
                  <span>Read Solved Key</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
