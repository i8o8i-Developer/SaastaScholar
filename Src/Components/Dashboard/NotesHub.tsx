import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Search,
  ShieldCheck,
  Sparkles,
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
  const [openedSubjectFolder, setOpenedSubjectFolder] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>("");
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
    } catch {
      setMaterials((prev) =>
        prev.map((m) => (m.id === materialId ? { ...m, is_bookmarked: !m.is_bookmarked } : m)),
      );
      toast.success("Bookmark Status Updated In Session.");
    }
  };

  const filteredSubjects = subjects.filter((sub) => {
    if (!folderSearchQuery.trim()) return true;
    const q = folderSearchQuery.toLowerCase();
    return sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q);
  });

  const filteredMaterials = materials.filter((m) => {
    if (!openedSubjectFolder) return false;
    const matchesSubject = m.subject_code === openedSubjectFolder.code || m.subject === openedSubjectFolder.id;
    const matchesUnit = selectedUnit === "ALL" || String(m.unit_number) === selectedUnit;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesUnit && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto min-w-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-emerald-500/10 via-surface to-teal-500/10 p-4 sm:p-7 shadow-xs backdrop-blur-md min-w-0">
        <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 sm:px-3 py-0.5 text-[0.65rem] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1.5">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Official NIMS Syllabus Notes</span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words">
              Handwritten &amp; Typed Study Notes
            </h1>
            <p className="text-[0.72rem] sm:text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
              Teacher-Approved Notes, Topper Formula Sheets, And Chapter Study Guides To Help You Ace Your Exams With Ease.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-surface border border-border/80 text-xs font-mono font-bold text-foreground shadow-2xs">
              <Folder className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{subjects.length} Subject Folders</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <span>{materials.length} Notes</span>
            </span>
          </div>
        </div>
      </div>

      {/* FOLDER STRUCTURE ROOT VIEW: Subject Folders Grid */}
      {!openedSubjectFolder ? (
        <div className="space-y-4">
          {/* Folders Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={folderSearchQuery}
                onChange={(e) => setFolderSearchQuery(e.target.value)}
                placeholder="Search Subject Folders By Name Or Code..."
                className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-10 pr-4 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none shadow-xs transition-all"
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground font-semibold self-end sm:self-center">
              Showing {filteredSubjects.length} Of {subjects.length} Folders
            </span>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center space-y-3 min-w-0">
              <FolderOpen className="h-9 w-9 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40" />
              <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                No Subject Folders Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No Course Subject Matched &quot;{folderSearchQuery}&quot;. Clear Your Search Filter To View All Subjects.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSubjects.map((sub) => {
                const count = materials.filter(
                  (m) => m.subject_code === sub.code || m.subject === sub.id
                ).length;
                return (
                  <div
                    key={sub.code}
                    onClick={() => {
                      setOpenedSubjectFolder(sub);
                      setSelectedUnit("ALL");
                      setSearchQuery("");
                    }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/5 p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg cursor-pointer min-w-0"
                  >
                    <div className="space-y-3 min-w-0">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs group-hover:scale-105 transition-transform">
                            <Folder className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[0.68rem] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              {sub.code} · Subject Folder
                            </span>
                            <h4 className="font-display text-sm font-bold text-foreground truncate">
                              {sub.name}
                            </h4>
                          </div>
                        </div>
                        <span className="rounded-full bg-surface border border-border/80 px-2.5 py-0.5 text-[0.68rem] font-mono font-bold text-foreground shrink-0">
                          {count} {count === 1 ? "Note" : "Notes"}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                        {sub.syllabus_summary || `Official Verified Handwritten Study Notes & Derivations For ${sub.name}.`}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono text-[0.7rem]">{sub.credits ? `${sub.credits} Credits` : "Core Course"}</span>
                      <div className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform text-xs">
                        <span>Open Folder</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* INSIDE FOLDER VIEW */
        <div className="space-y-4 sm:space-y-5">
          {/* Breadcrumb Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-surface/80 border border-border/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setOpenedSubjectFolder(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-colors"
              >
                <FolderOpen className="h-3.5 w-3.5 text-primary" />
                <span>All Subject Folders</span>
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                {openedSubjectFolder.code}: {openedSubjectFolder.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpenedSubjectFolder(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer self-start sm:self-auto rounded-xl hover:bg-card transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back To Folders</span>
            </button>
          </div>

          {/* Folder Details Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {openedSubjectFolder.name} ({openedSubjectFolder.code})
                </h3>
                <p className="text-xs text-muted-foreground">
                  {openedSubjectFolder.syllabus_summary || "Curriculum & Unit Notes Vault"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-surface border border-border/80 px-3 py-1 text-xs font-mono font-bold text-foreground self-start sm:self-auto">
              {filteredMaterials.length} of {materials.filter((m) => m.subject_code === openedSubjectFolder.code || m.subject === openedSubjectFolder.id).length} Available Notes
            </span>
          </div>

          {/* Inside Folder Filters: Search & Unit Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search inside ${openedSubjectFolder.code}...`}
                className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-10 pr-4 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none shadow-xs transition-all"
              />
            </div>

            <div className="relative">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                aria-label="Filter by unit"
                className="h-11 w-full appearance-none rounded-2xl border border-border/80 bg-card px-3.5 pr-10 text-xs sm:text-sm font-bold text-foreground focus:border-emerald-500 focus:outline-none shadow-xs cursor-pointer transition-all truncate"
              >
                <option value="ALL">📖 All Units (Complete Course)</option>
                {["1", "2", "3", "4", "5"].map((unit) => (
                  <option key={unit} value={unit}>
                    Unit {unit} Study Notes
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Materials Cards Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center space-y-3 min-w-0">
              <BookOpen className="h-9 w-9 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40" />
              <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                No Notes Found In This Folder
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No Handwritten Notes Match Your Filter Criteria For {openedSubjectFolder.code}. Try Changing The Unit Filter Or Search Query.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch min-w-0">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => onOpenReader(mat.id)}
                  className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-4 sm:p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-lg active:scale-[0.99] cursor-pointer min-w-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[0.65rem] sm:text-xs font-mono font-bold">
                          {mat.subject_code} {mat.unit_number ? `· U${mat.unit_number}` : ""}
                        </span>
                        {mat.file ? (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold font-mono">
                            <FileText className="h-3 w-3 shrink-0" />
                            <span>{mat.file.endsWith(".pdf") ? "PDF Doc" : mat.file.endsWith(".docx") ? "Word" : "File"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold font-mono">
                            <Sparkles className="h-3 w-3 shrink-0" />
                            <span>Study Notes</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(e, mat.id)}
                        className={cn(
                          "grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl border border-border/70 bg-surface text-muted-foreground hover:text-primary active:scale-90 transition-all cursor-pointer shrink-0",
                          mat.is_bookmarked ? "text-primary border-primary/40 bg-primary/10" : "",
                        )}
                        title="Bookmark For Quick Study"
                      >
                        <BookMarked className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>

                    <h3 className="mt-3 text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug break-words">
                      {mat.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed break-words min-h-[32px]">
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

                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.65rem] sm:text-[0.7rem]">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-xl border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3 shrink-0" /> Topper Verified
                      </span>
                      <span className="text-muted-foreground font-mono font-semibold bg-surface px-2 py-0.5 rounded-xl border border-border/60">
                        {mat.page_count} Pages
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                    <span className="text-[0.65rem] text-muted-foreground font-semibold">Strictly View-Only</span>
                    <span className="font-bold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[0.7rem] sm:text-xs">
                      <span>Open Reader</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
