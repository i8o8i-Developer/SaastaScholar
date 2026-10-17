import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  LibraryBig,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AcademicMaterial, apiFetch, Subject } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

interface FacultyHubProps {
  onOpenReader: (materialId: string) => void;
}

export function FacultyHub({ onOpenReader }: FacultyHubProps) {
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [openedSubjectFolder, setOpenedSubjectFolder] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMaterials() {
      try {
        const [matsRes, subsRes] = await Promise.allSettled([
          apiFetch<AcademicMaterial[]>("/academic/materials/?type=FACULTY"),
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
        console.error("Error Loading Faculty Materials:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMaterials();
  }, []);

  const filteredSubjects = subjects.filter((sub) => {
    if (!folderSearchQuery.trim()) return true;
    const q = folderSearchQuery.toLowerCase();
    return sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q);
  });

  const filteredMaterials = materials.filter((m) => {
    if (!openedSubjectFolder) return false;
    const matchesSubject = m.subject_code === openedSubjectFolder.code || m.subject === openedSubjectFolder.id;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto min-w-0">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-blue-500/10 via-surface to-indigo-500/10 p-4 sm:p-7 shadow-xs backdrop-blur-md min-w-0">
        <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 sm:px-3 py-0.5 text-[0.65rem] sm:text-xs font-bold text-blue-700 dark:text-blue-300 mb-1.5">
              <LibraryBig className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span className="truncate">Teacher Slides &amp; Classroom Notes</span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words">
              Teacher Slides &amp; Class Handouts
            </h1>
            <p className="text-[0.72rem] sm:text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
              Direct Access To PPT Slides, PDFs, And Classroom Notes Shared By Your College Teachers.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-surface border border-border/80 text-xs font-mono font-bold text-foreground shadow-2xs">
              <Folder className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>{subjects.length} Subject Folders</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 shadow-2xs">
              <span>{materials.length} Materials</span>
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
                placeholder="Search Faculty Subject Folders..."
                className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-10 pr-4 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none shadow-xs transition-all"
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
                No Faculty Subject Folders Found
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
                      setSearchQuery("");
                    }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-blue-500/5 p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg cursor-pointer min-w-0"
                  >
                    <div className="space-y-3 min-w-0">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-2xs group-hover:scale-105 transition-transform">
                            <Folder className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[0.68rem] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                              {sub.code} · Faculty Folder
                            </span>
                            <h4 className="font-display text-sm font-bold text-foreground truncate">
                              {sub.name}
                            </h4>
                          </div>
                        </div>
                        <span className="rounded-full bg-surface border border-border/80 px-2.5 py-0.5 text-[0.68rem] font-mono font-bold text-foreground shrink-0">
                          {count} {count === 1 ? "Item" : "Items"}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                        {sub.syllabus_summary || `Official Faculty Lecture Slides, Reference Guides & Handouts For ${sub.name}.`}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono text-[0.7rem]">{sub.credits ? `${sub.credits} Credits` : "Core Course"}</span>
                      <div className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform text-xs">
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
                <FolderOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>All Faculty Folders</span>
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
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
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {openedSubjectFolder.name} ({openedSubjectFolder.code})
                </h3>
                <p className="text-xs text-muted-foreground">
                  {openedSubjectFolder.syllabus_summary || "Faculty Courseware Repository"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-surface border border-border/80 px-3 py-1 text-xs font-mono font-bold text-foreground self-start sm:self-auto">
              {filteredMaterials.length} Of {materials.filter((m) => m.subject_code === openedSubjectFolder.code || m.subject === openedSubjectFolder.id).length} Available Files
            </span>
          </div>

          {/* Inside Folder Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search faculty materials inside ${openedSubjectFolder.code}...`}
              className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-10 pr-4 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none shadow-xs transition-all"
            />
          </div>

          {/* Materials Cards Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center space-y-3 min-w-0">
              <LibraryBig className="h-9 w-9 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40" />
              <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                No Faculty Materials Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No Courseware Files Match Your Filter Criteria For {openedSubjectFolder.code}.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch min-w-0">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => onOpenReader(mat.id)}
                  className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-4 sm:p-6 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-lg active:scale-[0.99] cursor-pointer min-w-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[0.65rem] sm:text-xs font-mono font-bold">
                          {mat.subject_code} {mat.unit_number ? `· U${mat.unit_number}` : ""}
                        </span>
                        {mat.file ? (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold font-mono">
                            <FileText className="h-3 w-3 shrink-0" />
                            <span>{mat.file.endsWith(".pdf") ? "PDF Slides" : mat.file.endsWith(".ppt") || mat.file.endsWith(".pptx") ? "PowerPoint" : "Handout"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold font-mono">
                            <Sparkles className="h-3 w-3 shrink-0" />
                            <span>Courseware</span>
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-xl border border-blue-500/20 shrink-0">
                        Faculty Upload
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug break-words">
                      {mat.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed break-words min-h-[32px]">
                      {mat.summary || "Official professor handouts, slides and curricular reference material."}
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
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-xl border border-blue-500/20">
                        <ShieldCheck className="h-3 w-3 shrink-0" /> Professor Certified
                      </span>
                      <span className="text-muted-foreground font-mono font-semibold bg-surface px-2 py-0.5 rounded-xl border border-border/60">
                        {mat.page_count} Pages
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                    <span className="text-[0.65rem] text-muted-foreground font-semibold">Strictly View-Only</span>
                    <span className="font-bold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[0.7rem] sm:text-xs">
                      <span>Open Document</span>
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
