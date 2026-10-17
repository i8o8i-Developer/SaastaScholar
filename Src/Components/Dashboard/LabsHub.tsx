import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookMarked,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Cpu,
  FileCheck2,
  FileText,
  Filter,
  Flame,
  FlaskConical,
  GraduationCap,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Terminal,
  Zap,
} from "lucide-react";
import { AcademicMaterial, apiFetch, Subject, toTitleCase } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";
import { toast } from "sonner";

interface LabsHubProps {
  onOpenReader: (materialId: string) => void;
}

export function LabsHub({ onOpenReader }: LabsHubProps) {
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLabsData() {
      try {
        const [matsRes, subsRes] = await Promise.allSettled([
          apiFetch<AcademicMaterial[]>("/academic/materials/?type=LAB_MANUAL"),
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
        console.error("Error Loading Lab Manuals & Viva Voce:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLabsData();
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
    } catch (err: any) {
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
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-purple-500/10 via-surface to-indigo-500/10 p-4 sm:p-7 shadow-xs backdrop-blur-md min-w-0">
        <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 sm:px-3 py-0.5 text-[0.65rem] sm:text-xs font-bold text-purple-700 dark:text-purple-300 mb-1.5">
              <FlaskConical className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Teacher-Approved Lab Manuals &amp; Viva Questions</span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words">
              Lab Manuals &amp; Viva Questions
            </h1>
            <p className="text-[0.72rem] sm:text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
              Step-By-Step Experiment Steps, Ready-To-Run Code, Expected Outputs, And Common Viva Questions To Help You Score Full Practical Marks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-2xs">
              <Code2 className="h-3.5 w-3.5" />
              <span>Ready-To-Run Code</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Lab Notes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Filters (No Scrolling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Subject Select Dropdown */}
        <div className="relative">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter By Subject"
            className="h-11 w-full appearance-none rounded-2xl border border-border/80 bg-card px-3.5 pr-10 text-xs sm:text-sm font-bold text-foreground focus:border-purple-500 focus:outline-none shadow-xs cursor-pointer transition-all truncate"
          >
            <option value="ALL">🧪 All Lab Subjects ({materials.length} Manuals)</option>
            {subjects.map((sub) => (
              <option key={sub.code} value={sub.code}>
                {sub.code}: {sub.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Experiment / Unit Number Select Dropdown */}
        <div className="relative">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            aria-label="Filter By Experiment Number"
            className="h-11 w-full appearance-none rounded-2xl border border-border/80 bg-card px-3.5 pr-10 text-xs sm:text-sm font-bold text-foreground focus:border-purple-500 focus:outline-none shadow-xs cursor-pointer transition-all truncate"
          >
            <option value="ALL">🔬 All Experiments &amp; Labs</option>
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={String(num)}>
                Experiment / Lab {num}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Real-time Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Experiments, Viva Drills, Algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border/80 bg-card pr-3.5 pl-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-purple-500 focus:outline-none shadow-xs transition-all"
          />
        </div>
      </div>

      {/* Materials Cards Grid */}
      {loading ? (
        <div className="grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-56 rounded-3xl border border-border/60 bg-card/40 animate-pulse"
            />
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 sm:p-12 text-center">
          <FlaskConical className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            No Lab Manuals &amp; Viva Voce Found
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {selectedSubject !== "ALL" || selectedUnit !== "ALL" || searchQuery
              ? "No laboratory materials match the current filters. Try resetting your search or subject selections."
              : "No lab manuals have been published for this semester yet. Check back soon or contact your course faculty."}
          </p>
          {(selectedSubject !== "ALL" || selectedUnit !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedSubject("ALL");
                setSelectedUnit("ALL");
                setSearchQuery("");
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 cursor-pointer transition-colors"
            >
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              onClick={() => onOpenReader(mat.id)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/30 p-4 sm:p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg cursor-pointer min-w-0"
            >
              <div className="space-y-3 min-w-0">
                {/* Top Tags Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="rounded-xl bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-[0.68rem] font-bold font-mono text-purple-700 dark:text-purple-300 whitespace-nowrap">
                      {mat.subject_code} · Exp {mat.unit_number || 1}
                    </span>
                    {mat.file ? (
                      <span className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[0.65rem] font-bold font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        PDF Manual
                      </span>
                    ) : (
                      <span className="rounded-xl bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-[0.65rem] font-bold font-mono text-purple-600 dark:text-purple-400 whitespace-nowrap inline-flex items-center gap-1">
                        <Terminal className="h-3 w-3" />
                        Studio Manual
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleBookmark(e, mat.id)}
                    aria-label={mat.is_bookmarked ? "Remove Bookmark" : "Save Bookmark"}
                    className={cn(
                      "grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl border transition-all cursor-pointer",
                      mat.is_bookmarked
                        ? "border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-2xs"
                        : "border-border/80 bg-surface/60 text-muted-foreground hover:bg-card hover:text-foreground",
                    )}
                  >
                    <BookMarked
                      className={cn("h-3.5 w-3.5 transition-transform", mat.is_bookmarked && "scale-110 fill-current")}
                    />
                  </button>
                </div>

                {/* Title & Summary */}
                <div className="min-w-0">
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                    {mat.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">
                    {mat.summary || "Full laboratory algorithm, step-by-step experiment steps, verified code implementations, and viva voce bank."}
                  </p>
                </div>

                {/* Dynamic Tags */}
                {mat.tags && mat.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5 min-w-0">
                    {mat.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.65rem] font-mono text-muted-foreground truncate"
                      >
                        #{tag}
                      </span>
                    ))}
                    {mat.tags.length > 3 && (
                      <span className="text-[0.65rem] font-mono text-muted-foreground self-center">
                        +{mat.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata & Action CTA */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[0.7rem] whitespace-nowrap">
                    {mat.page_count} Pages
                  </span>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[0.7rem] text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform text-xs shrink-0">
                  <span>Open Manual</span>
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
