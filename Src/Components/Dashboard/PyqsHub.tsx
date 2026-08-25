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
    <div className="space-y-4 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-card via-surface/90 to-card p-4 xs:p-6 sm:p-8 shadow-xs backdrop-blur-md min-w-0">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 xs:px-3 py-0.5 text-[0.65rem] xs:text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-2">
              <Award className="h-3 w-3 xs:h-3.5 xs:w-3.5 shrink-0" />
              <span className="truncate">2020–2027 University Solved Question Papers</span>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words">
              Solved PYQ Archive &amp; Answer Keys
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
              Step-By-Step Model Solutions Matching NIMS University Evaluation Marking Schemes And High-Yield 10-Mark Exam Questions.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Solved Papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 sm:h-11 w-full rounded-2xl border border-border bg-background pr-3 pl-10 text-xs placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1.5 xs:gap-2 overflow-x-auto pb-1.5 scrollbar-none min-w-0">
        <button
          type="button"
          onClick={() => setSelectedSubject("ALL")}
          className={cn(
            "rounded-xl px-3 xs:px-4 py-1.5 xs:py-2 text-[0.7rem] xs:text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs",
            selectedSubject === "ALL"
              ? "bg-primary text-primary-foreground font-bold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          All ({pyqs.length})
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.code}
            type="button"
            onClick={() => setSelectedSubject(sub.code)}
            className={cn(
              "rounded-xl px-3 xs:px-4 py-1.5 xs:py-2 text-[0.7rem] xs:text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs",
              selectedSubject === sub.code
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {sub.code}: {sub.name}
          </button>
        ))}
      </div>

      {/* Year Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 text-xs min-w-0">
        <span className="text-muted-foreground font-bold text-[0.65rem] xs:text-[0.7rem] uppercase tracking-wider">Exam Year:</span>
        {["ALL", "2026-2027", "2025-2026", "2024", "2023", "2022"].map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            className={cn(
              "rounded-lg px-2 xs:px-3 py-1 text-[0.65rem] xs:text-[0.7rem] font-bold transition-colors cursor-pointer",
              selectedYear === yr
                ? "bg-surface border border-cyan-500/50 text-cyan-600 dark:text-cyan-400 font-bold shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {yr === "ALL" ? "All Years" : yr}
          </button>
        ))}
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
        <div className="grid gap-3.5 xs:gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch min-w-0">
          {filteredPyqs.map((pyq) => (
            <div
              key={pyq.id}
              onClick={() => onOpenReader(pyq.id)}
              className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/30 p-3.5 xs:p-5 sm:p-6 shadow-xs transition-all hover:border-cyan-500/50 hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] cursor-pointer min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1.5 xs:gap-2">
                  <div className="flex items-center gap-1 xs:gap-1.5 flex-wrap min-w-0">
                    <span className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 text-[0.65rem] xs:text-xs font-mono font-bold">
                      {pyq.subject_code} · {pyq.academic_year}
                    </span>
                    {pyq.file ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-1.5 xs:px-2 py-0.5 text-[0.6rem] xs:text-[0.68rem] font-bold font-mono">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">{pyq.file.endsWith(".pdf") ? "PDF Doc" : pyq.file.endsWith(".docx") ? "Word" : "File"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-1.5 xs:px-2 py-0.5 text-[0.6rem] xs:text-[0.68rem] font-bold font-mono">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>Solved Key</span>
                      </span>
                    )}
                  </div>

                  <span className="rounded-xl bg-surface px-2 py-0.5 text-[0.6rem] xs:text-[0.65rem] font-bold text-muted-foreground border border-border/60 font-mono shrink-0">
                    {pyq.page_count} Pages
                  </span>
                </div>

                <h3 className="mt-2.5 xs:mt-3.5 text-sm sm:text-base font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug break-words">
                  {pyq.title}
                </h3>
                <p className="mt-1.5 xs:mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed break-words min-h-[36px]">
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

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.65rem] xs:text-[0.7rem]">
                  <span className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-xl border border-cyan-500/20">
                    <CheckCircle2 className="h-3 w-3 shrink-0" /> 10-Mark Solved
                  </span>
                  <span className="text-muted-foreground font-mono font-semibold bg-surface px-2 py-0.5 rounded-xl border border-border/60">
                    Verified Keys
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-2.5 xs:pt-3.5 border-t border-border/60 text-xs">
                <span className="text-[0.65rem] text-muted-foreground font-semibold">Strictly View-Only</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[0.7rem] xs:text-xs">
                  <span>Read Solved Key</span>
                  <ArrowRight className="h-3 w-3 xs:h-3.5 xs:w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
