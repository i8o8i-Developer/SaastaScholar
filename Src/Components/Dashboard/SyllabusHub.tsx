import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  Lock,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { AcademicMaterial, apiFetch, Subject, toTitleCase } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";
import { toast } from "sonner";

interface SyllabusHubProps {
  onOpenReader: (materialId: string) => void;
}

export function SyllabusHub({ onOpenReader }: SyllabusHubProps) {
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSyllabusData() {
      try {
        const [matsRes, subsRes] = await Promise.allSettled([
          apiFetch<AcademicMaterial[]>("/academic/materials/?type=SYLLABUS"),
          apiFetch<Subject[]>("/academic/subjects/"),
        ]);
        if (matsRes.status === "fulfilled") {
          const data = matsRes.value;
          setMaterials(Array.isArray(data) ? data : ((data as any)?.results || []));
        }
        if (subsRes.status === "fulfilled") {
          const data = subsRes.value;
          setSubjects(Array.isArray(data) ? data : ((data as any)?.results || []));
        }
      } catch (err) {
        console.error("Error Loading Syllabus Materials:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSyllabusData();
  }, []);

  const handleToggleBookmark = async (e: React.MouseEvent, materialId: string) => {
    e.stopPropagation();
    try {
      const res = await apiFetch<{ bookmarked: boolean; message: string }>(
        `/academic/bookmarks/${materialId}/toggle/`,
        { method: "POST" },
      );
      setMaterials((prev) =>
        prev.map((m) => (m.id === materialId ? { ...m, is_bookmarked: res.bookmarked } : m)),
      );
      toast.success(toTitleCase(res.message || "Bookmark Status Updated."));
    } catch {
      setMaterials((prev) =>
        prev.map((m) => (m.id === materialId ? { ...m, is_bookmarked: !m.is_bookmarked } : m)),
      );
      toast.success("Bookmark Status Updated In Session.");
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSubject = selectedSubject === "ALL" || m.subject_code === selectedSubject;
    const matchesUnit = selectedUnit === "ALL" || String(m.unit_number) === selectedUnit;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesUnit && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-card via-surface/90 to-card p-4 xs:p-6 sm:p-8 shadow-xs backdrop-blur-md min-w-0">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 xs:px-3 py-0.5 text-[0.65rem] xs:text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
              <ScrollText className="h-3 w-3 xs:h-3.5 xs:w-3.5 shrink-0" />
              <span>Official Institutional Syllabus &amp; Curriculum Breakdown</span>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words">
              University Courseware Syllabus Breakdown
            </h1>
            <p className="text-[0.75rem] xs:text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
              Official University Course Outlines, Unit-Wise Learning Objectives, Prescribed Textbooks, And Examination Weightage Distributions.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72 shrink-0 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Syllabus By Keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card/80 pl-9 sm:pl-10 pr-4 py-2 xs:py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs"
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
          All ({materials.length})
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.code}
            type="button"
            onClick={() => setSelectedSubject(sub.code)}
            className={cn(
              "rounded-xl px-3 xs:px-4 py-1.5 xs:py-2 text-[0.7rem] xs:text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs whitespace-nowrap",
              selectedSubject === sub.code
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {sub.code}: {sub.name}
          </button>
        ))}
      </div>

      {/* Unit Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 text-xs min-w-0">
        <span className="text-muted-foreground font-bold text-[0.65rem] xs:text-[0.7rem] uppercase tracking-wider">
          Filter By Unit:
        </span>
        {["ALL", "1", "2", "3", "4", "5"].map((unit) => (
          <button
            key={unit}
            onClick={() => setSelectedUnit(unit)}
            className={cn(
              "rounded-lg px-2 xs:px-3 py-1 text-[0.65rem] xs:text-[0.7rem] font-bold transition-colors cursor-pointer",
              selectedUnit === unit
                ? "bg-surface border border-primary/50 text-primary shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {unit === "ALL" ? "All Units" : `Unit ${unit}`}
          </button>
        ))}
      </div>

      {/* Syllabus Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-3xl border border-border/80 bg-card/40 animate-pulse p-6"
            />
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3 min-w-0">
          <ScrollText className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <h3 className="font-display font-bold text-base text-foreground">
            No Official Syllabus Materials Published Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Official Course Curriculum Documents Can Be Uploaded By Administrators From The Academic Publishing Studio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              onClick={() => onOpenReader(mat.id)}
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden min-w-0"
            >
              <div className="space-y-3 min-w-0">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      {mat.subject_code}
                    </span>
                    {mat.unit_number && (
                      <span className="rounded-lg bg-surface border border-border px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                        Unit {mat.unit_number}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleToggleBookmark(e, mat.id)}
                    className="text-muted-foreground hover:text-amber-500 transition-colors p-1"
                    title="Bookmark Syllabus"
                  >
                    <BookMarked
                      className={cn(
                        "h-4 w-4",
                        mat.is_bookmarked && "fill-amber-500 text-amber-500",
                      )}
                    />
                  </button>
                </div>

                {/* Title & Subject */}
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {mat.title}
                  </h3>
                  <p className="text-[0.7rem] sm:text-xs text-muted-foreground mt-0.5 truncate">
                    {mat.subject_name}
                  </p>
                </div>

                {/* Summary */}
                {mat.summary && (
                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                    {mat.summary}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 font-mono text-[0.7rem] font-bold text-foreground">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    {mat.page_count} {mat.page_count === 1 ? "Page" : "Pages"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="h-3 w-3" />
                    Official Syllabus
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>Open Syllabus</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
