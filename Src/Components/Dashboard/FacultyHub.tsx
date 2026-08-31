import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  LibraryBig,
  FileText,
  Search,
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
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
      }
    }
    loadMaterials();
  }, []);

  const filteredMaterials = materials.filter((m) => {
    const matchesSubject = selectedSubject === "ALL" || m.subject_code === selectedSubject;
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject_name.toLowerCase().includes(searchQuery.toLowerCase());
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
              <span className="truncate">Official Faculty Uploads</span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words">
              Faculty Materials &amp; Handouts
            </h1>
            <p className="text-[0.72rem] sm:text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words">
              Direct Access To PPT Presentations, PDF Courseware, And Classroom Handouts Uploaded By University Faculty.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Faculty Materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 sm:h-11 w-full rounded-2xl border border-border/80 bg-background/90 pr-3 pl-10 text-xs placeholder:text-muted-foreground/70 focus:border-blue-500 focus:outline-none shadow-xs transition-all"
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
            All Materials ({materials.length})
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
      </div>

      {/* Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center space-y-3 min-w-0">
          <LibraryBig className="h-9 w-9 sm:h-10 sm:w-10 mx-auto text-muted-foreground/40" />
          <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
            No Faculty Materials Available
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Faculty Members Can Upload Class Resources, Slides, And Handouts From The Admin Portal.
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
                      {mat.subject_code}
                    </span>
                    {mat.file ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold font-mono">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span>{mat.file.endsWith(".pdf") ? "PDF Document" : mat.file.endsWith(".docx") ? "Word Doc" : mat.file.endsWith(".pptx") || mat.file.endsWith(".ppt") ? "Presentation" : "Attached File"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold font-mono">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>Typed Resource</span>
                      </span>
                    )}
                  </div>

                  <span className="rounded-xl bg-surface px-2 py-0.5 text-[0.6rem] sm:text-[0.65rem] font-bold text-muted-foreground border border-border/60 font-mono shrink-0">
                    {mat.page_count} Pages
                  </span>
                </div>

                <h3 className="mt-3 text-sm sm:text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug break-words">
                  {mat.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed break-words min-h-[32px]">
                  {mat.summary || "Faculty uploaded class resource and study slides."}
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
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="text-[0.65rem] text-muted-foreground font-semibold">Strictly View-Only</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[0.7rem] sm:text-xs">
                  <span>Open Resource</span>
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
