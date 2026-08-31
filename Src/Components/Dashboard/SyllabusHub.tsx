import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
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
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto min-w-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-teal-500/10 via-surface to-emerald-500/10 p-4 sm:p-7 shadow-xs backdrop-blur-md min-w-0">
        <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 sm:px-3 py-0.5 text-[0.65rem] sm:text-xs font-bold text-teal-700 dark:text-teal-300 mb-1.5">
              <ScrollText className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Official Institutional Syllabus &amp; Curriculum Breakdown</span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words">
              University Courseware Syllabus Breakdown
            </h1>
            <p className="text-[0.72rem] sm:text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
              Official University Course Outlines, Unit-Wise Learning Objectives, Prescribed Textbooks, And Examination Weightage Distributions.
            </p>
          </div>
        </div>
      </div>

      {/* Selection Filters (No Scrolling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {/* Subject Select Dropdown */}
        <div className="relative">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter by subject"
            className="h-11 w-full appearance-none rounded-2xl border border-border/80 bg-card px-3.5 pr-10 text-xs sm:text-sm font-bold text-foreground focus:border-teal-500 focus:outline-none shadow-xs cursor-pointer transition-all truncate"
          >
            <option value="ALL">📚 All Subjects ({materials.length} Syllabus Guides)</option>
            {subjects.map((sub) => (
              <option key={sub.code} value={sub.code}>
                {sub.code}: {sub.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Unit Select Dropdown */}
        <div className="relative">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            aria-label="Filter by unit"
            className="h-11 w-full appearance-none rounded-2xl border border-border/80 bg-card px-3.5 pr-10 text-xs sm:text-sm font-bold text-foreground focus:border-teal-500 focus:outline-none shadow-xs cursor-pointer transition-all truncate"
          >
            <option value="ALL">📖 All Units (Entire Curriculum)</option>
            {["1", "2", "3", "4", "5"].map((unit) => (
              <option key={unit} value={unit}>
                Unit {unit} Outline
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Syllabus Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 min-w-0">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-3xl border border-border/80 bg-card/40 animate-pulse p-6"
            />
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center space-y-3 min-w-0">
          <ScrollText className="h-9 w-9 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40" />
          <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
            No Official Syllabus Materials Published Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Official Course Curriculum Documents Can Be Uploaded By Administrators From The Academic Publishing Studio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 min-w-0">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              onClick={() => onOpenReader(mat.id)}
              className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-4 sm:p-6 shadow-xs transition-all hover:border-teal-500/50 hover:shadow-lg active:scale-[0.99] cursor-pointer min-w-0"
            >
              <div className="min-w-0">
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="rounded-xl bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-[0.65rem] sm:text-xs font-bold font-mono text-teal-700 dark:text-teal-300">
                      {mat.subject_code}
                    </span>
                    {mat.unit_number && (
                      <span className="rounded-xl bg-surface border border-border/70 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-semibold text-muted-foreground">
                        Unit {mat.unit_number}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleToggleBookmark(e, mat.id)}
                    className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl border border-border/70 bg-surface text-muted-foreground hover:text-primary active:scale-90 transition-all cursor-pointer shrink-0"
                    title="Bookmark Syllabus"
                  >
                    <BookMarked
                      className={cn(
                        "h-3.5 w-3.5 sm:h-4 sm:w-4",
                        mat.is_bookmarked && "fill-amber-500 text-amber-500",
                      )}
                    />
                  </button>
                </div>

                {/* Title & Subject */}
                <div className="mt-3 min-w-0">
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {mat.title}
                  </h3>
                  <p className="text-[0.7rem] sm:text-xs text-muted-foreground mt-0.5 truncate">
                    {mat.subject_name}
                  </p>
                </div>

                {/* Summary */}
                {mat.summary && (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">
                    {mat.summary}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 font-mono text-[0.68rem] sm:text-xs font-bold text-foreground bg-surface px-2 py-0.5 rounded-xl border border-border/60">
                    <FileText className="h-3 w-3 text-primary" />
                    {mat.page_count} Pages
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.62rem] sm:text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-xl border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" />
                    Official
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-[0.7rem] sm:text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
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
