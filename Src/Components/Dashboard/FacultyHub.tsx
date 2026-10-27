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
      {/* Header Banner - Only Shown At Root Folders Level */}
      {!openedSubjectFolder && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-blue-500/10 via-surface to-indigo-500/10 p-3.5 xs:p-4.5 sm:p-7 shadow-xs backdrop-blur-md min-w-0">
          <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 sm:px-3 py-0.5 text-[0.62rem] xs:text-[0.68rem] sm:text-xs font-bold text-blue-700 dark:text-blue-300 mb-1.5">
                <LibraryBig className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">Teacher Slides &amp; Classroom Notes</span>
              </div>
              <h1 className="text-base xs:text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words leading-tight">
                Teacher Slides &amp; Class Handouts
              </h1>
              <p className="text-[0.7rem] xs:text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
                Direct Access To PPT Slides, PDFs, And Classroom Notes Shared By Your College Teachers.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-surface border border-border/80 text-[0.7rem] sm:text-xs font-mono font-bold text-foreground shadow-2xs">
                <Folder className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>{subjects.length} Subject Folders</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[0.7rem] sm:text-xs font-mono font-bold text-blue-600 dark:text-blue-400 shadow-2xs">
                <span>{materials.length} Materials</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FOLDER STRUCTURE ROOT VIEW: Subject Folders Grid */}
      {!openedSubjectFolder ? (
        <div className="space-y-4">
          {/* Folders Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1">
            <div className="relative flex-1 max-w-md min-w-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={folderSearchQuery}
                onChange={(e) => setFolderSearchQuery(e.target.value)}
                placeholder="Search Faculty Subject Folders..."
                className="h-10 sm:h-11 w-full rounded-2xl border border-border/80 bg-card pl-10 pr-4 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none shadow-xs transition-all min-w-0"
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
            <div className="grid gap-3 sm:gap-4.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
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
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-blue-500/5 p-3.5 xs:p-4.5 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg cursor-pointer min-w-0"
                  >
                    <div className="space-y-2.5 xs:space-y-3 min-w-0">
                      {/* Top Header Row: Icon + Code pill + Items Count Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-2xs group-hover:scale-105 transition-transform">
                            <Folder className="h-4.5 w-4.5" />
                          </div>
                          <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[0.62rem] xs:text-[0.68rem] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate max-w-[130px] xs:max-w-none">
                            {sub.code}
                          </span>
                        </div>
                        <span className={cn(
                          "rounded-full px-2 xs:px-2.5 py-0.5 text-[0.62rem] xs:text-[0.68rem] font-mono font-bold shrink-0 border",
                          count > 0
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                            : "bg-surface text-muted-foreground border-border/80"
                        )}>
                          {count} {count === 1 ? "Item" : "Items"}
                        </span>
                      </div>

                      {/* Full Subject Name: NO Truncation! Displays Full Name Naturally Across Lines */}
                      <div className="min-w-0">
                        <h4 className="font-display text-sm sm:text-base font-bold text-foreground leading-snug break-words group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {sub.name}
                        </h4>
                      </div>

                      <p className="text-[0.72rem] xs:text-xs text-muted-foreground line-clamp-2 leading-relaxed break-words min-h-[30px]">
                        {sub.syllabus_summary || `Official Faculty Lecture Slides, Reference Guides & Handouts For ${sub.name}.`}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-border/60 flex items-center justify-between text-[0.7rem] xs:text-xs text-muted-foreground min-w-0">
                      <span className="font-mono text-[0.65rem] xs:text-[0.7rem]">
                        {sub.credits ? `${sub.credits} Credits` : "Core Course"}
                      </span>
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
        /* REIMAGINED ULTRA-COMPACT FOLDER WORKSPACE */
        <div className="space-y-3.5 sm:space-y-4 min-w-0">
          {/* Integrated Sleek Folder Header (Compact, High Density, No Half-Page Waste) */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-blue-500/10 p-3.5 sm:p-4.5 shadow-xs min-w-0">
            {/* Top Action Row: Back Button & Count Pill */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/60 min-w-0">
              <button
                type="button"
                onClick={() => setOpenedSubjectFolder(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-blue-500/10 text-foreground hover:text-blue-600 dark:hover:text-blue-400 border border-border/80 hover:border-blue-500/30 font-bold text-xs cursor-pointer shadow-2xs active:scale-95 transition-all shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back To Folders</span>
              </button>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-700 dark:text-blue-300 font-mono font-bold text-[0.65rem] sm:text-xs shrink-0">
                <FileText className="h-3 w-3 text-blue-500 shrink-0" />
                <span>
                  {filteredMaterials.length} {filteredMaterials.length === 1 ? "File" : "Files"}
                </span>
              </span>
            </div>

            {/* Subject Identity & Full Name (Full Subject Name Always Visible Without Truncation) */}
            <div className="pt-2.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1 min-w-0">
                <span className="rounded-lg bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 font-mono text-[0.65rem] sm:text-xs font-bold text-blue-700 dark:text-blue-300 shrink-0">
                  {openedSubjectFolder.code}
                </span>
                <span className="text-[0.65rem] sm:text-xs font-mono font-medium text-muted-foreground truncate">
                  {openedSubjectFolder.credits ? `${openedSubjectFolder.credits} Credits · ` : ""}Faculty Courseware Repository
                </span>
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-bold text-foreground leading-snug break-words">
                {openedSubjectFolder.name}
              </h2>
            </div>
          </div>

          {/* Inside Folder Search */}
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search faculty materials inside ${openedSubjectFolder.code}...`}
              className="h-10 sm:h-11 w-full rounded-2xl border border-border/80 bg-card pl-10 pr-4 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none shadow-xs transition-all min-w-0"
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
            <div className="grid gap-3 sm:gap-4.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch min-w-0">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => onOpenReader(mat.id)}
                  className="group relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-3.5 xs:p-4 sm:p-5.5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-lg active:scale-[0.99] cursor-pointer min-w-0"
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
