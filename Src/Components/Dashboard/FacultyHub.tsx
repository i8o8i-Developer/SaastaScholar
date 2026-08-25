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
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-card via-surface/90 to-card p-6 sm:p-8 shadow-xs backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">
              <LibraryBig className="h-3.5 w-3.5" />
              <span>Official Faculty Uploads</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Faculty Materials &amp; Resources
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Direct Access To Ppt's, Pdf's, And Handouts Uploaded By Your Professors.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Faculty Materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border bg-background pr-3 pl-10 text-xs placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedSubject("ALL")}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs",
            selectedSubject === "ALL"
              ? "bg-primary text-primary-foreground font-bold shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          All Subjects ({materials.length})
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.code}
            type="button"
            onClick={() => setSelectedSubject(sub.code)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs",
              selectedSubject === sub.code
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {sub.code}: {sub.name}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
          <LibraryBig className="h-10 w-10 mx-auto text-muted-foreground/40" />
          <h3 className="font-display font-bold text-base text-foreground">
            No Faculty Materials Available
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Faculty Members Can Upload Class Resources, Slides, And Handouts From The Admin Portal.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              onClick={() => onOpenReader(mat.id)}
              className="group relative flex flex-col justify-between h-full rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/30 p-5 sm:p-6 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 active:scale-[0.99] cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 px-2.5 py-1 text-xs font-mono font-bold">
                      {mat.subject_code}
                    </span>
                    {mat.file ? (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[0.68rem] font-bold font-mono">
                        <FileText className="h-3 w-3" />
                        {mat.file.endsWith(".pdf") ? "PDF Document" : mat.file.endsWith(".docx") ? "Word Doc" : mat.file.endsWith(".pptx") || mat.file.endsWith(".ppt") ? "Presentation" : "Attached File"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[0.68rem] font-bold font-mono">
                        <Sparkles className="h-3 w-3" />
                        Typed Resource
                      </span>
                    )}
                  </div>

                  <span className="rounded-xl bg-surface px-2.5 py-1 text-[0.65rem] font-bold text-muted-foreground border border-border/60 font-mono shrink-0">
                    {mat.page_count} Pages
                  </span>
                </div>

                <h3 className="mt-3.5 text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {mat.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed min-h-[44px]">
                  {mat.summary || "Faculty uploaded class resource."}
                </p>

                {mat.tags && mat.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mat.tags.map((t, idx) => (
                      <span key={idx} className="rounded-lg bg-surface/80 border border-border/60 px-2 py-0.5 text-[0.65rem] font-mono text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between pt-3.5 border-t border-border/60 text-xs">
                <span className="text-[0.7rem] text-muted-foreground font-semibold">Secure DRM View</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
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
