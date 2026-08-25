import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
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
  Zap,
} from "lucide-react";
import { AcademicMaterial, apiFetch, Subject, toTitleCase } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";
import { toast } from "sonner";

interface NotesHubProps {
  onOpenReader: (materialId: string) => void;
}

export function NotesHub({ onOpenReader }: NotesHubProps) {
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadNotesData() {
      try {
        const [matsRes, subsRes] = await Promise.allSettled([
          apiFetch<AcademicMaterial[]>("/academic/materials/?type=NOTES"),
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
        console.error("Error Loading Notes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotesData();
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
      toast.success(toTitleCase(res.message || "Bookmark Updated."));
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
    <div className="space-y-4 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-card via-surface/90 to-card p-4 xs:p-6 sm:p-8 shadow-xs backdrop-blur-md min-w-0">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 xs:px-3 py-0.5 text-[0.65rem] xs:text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
              <Sparkles className="h-3 w-3 xs:h-3.5 xs:w-3.5 shrink-0" />
              <span className="truncate">NIMS Official Syllabus Aligned Records</span>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words">
              Handwritten &amp; Structured Notes Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
              Faculty-Reviewed, Topper Handwritten Derivations And Unit-Wise Examination Study Guides. Strictly Protected Under Real-Time View-Only DRM.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Notes, Formulas..."
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
          All ({materials.length})
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
            {sub.code}: {sub.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Unit Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 text-xs min-w-0">
        <span className="text-muted-foreground font-bold text-[0.65rem] xs:text-[0.7rem] uppercase tracking-wider">Filter By Unit:</span>
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

      {/* Materials Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center space-y-3 min-w-0">
          <BookOpen className="h-9 w-9 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40" />
          <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
            No Handwritten Notes Published Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Faculty And Administrators Can Publish Unit-Wise Handwritten Notes With DRM Protection Via The Admin Portal.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 xs:gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch min-w-0">
          {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            onClick={() => onOpenReader(mat.id)}
            className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/30 p-3.5 xs:p-5 sm:p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] cursor-pointer min-w-0"
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-1.5 xs:gap-2">
                <div className="flex items-center gap-1 xs:gap-1.5 flex-wrap min-w-0">
                  <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[0.65rem] xs:text-xs font-mono font-bold">
                    {mat.subject_code} {mat.unit_number ? `· U${mat.unit_number}` : ""}
                  </span>
                  {mat.file ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-1.5 xs:px-2 py-0.5 text-[0.6rem] xs:text-[0.68rem] font-bold font-mono">
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">{mat.file.endsWith(".pdf") ? "PDF Doc" : mat.file.endsWith(".docx") ? "Word" : "File"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 xs:px-2 py-0.5 text-[0.6rem] xs:text-[0.68rem] font-bold font-mono">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span>Manuscript</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleToggleBookmark(e, mat.id)}
                  className={cn(
                    "grid h-7 w-7 xs:h-8 xs:w-8 place-items-center rounded-xl border border-border/70 bg-surface text-muted-foreground hover:text-primary active:scale-90 transition-all cursor-pointer shrink-0",
                    mat.is_bookmarked ? "text-primary border-primary/40 bg-primary/10" : "",
                  )}
                  title="Bookmark For Quick Study"
                >
                  <BookMarked className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                </button>
              </div>

              <h3 className="mt-2.5 xs:mt-3.5 text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug break-words">
                {mat.title}
              </h3>
              <p className="mt-1.5 xs:mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed break-words min-h-[36px]">
                {mat.summary || "Faculty verified study guide & high-yield revision notes."}
              </p>

              {mat.tags && mat.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {mat.tags.map((t, idx) => (
                    <span key={idx} className="rounded-lg bg-surface/80 border border-border/60 px-1.5 py-0.5 text-[0.6rem] font-mono text-muted-foreground truncate">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.65rem] xs:text-[0.7rem]">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3 shrink-0" /> Topper Verified
                </span>
                <span className="text-muted-foreground font-mono font-semibold bg-surface px-2 py-0.5 rounded-xl border border-border/60">
                  {mat.page_count} Pages
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2.5 xs:pt-3.5 border-t border-border/60 text-xs">
              <span className="text-[0.65rem] text-muted-foreground font-semibold">Strictly View-Only</span>
              <span className="font-bold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[0.7rem] xs:text-xs">
                <span>Open Reader</span>
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
