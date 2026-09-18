import { FileText, FolderOpen, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { MockWindow, Pill, Reveal, Section, SectionHeading } from "./Primitives";

const FEATURES = [
  ["01", "Daily Class Notes", "Notes Published The Same Day, Mapped To The Class Held."],
  ["02", "Subject-Wise Notes", "Every Subject Of Your Semester With Its Own Structured Shelf."],
  ["03", "Unit-Wise Resources", "Material Split Unit By Unit So Revision Follows Your Syllabus."],
  ["04", "Important Questions", "Repeatedly Asked Questions Surfaced Per Unit And Subject."],
  ["05", "Previous-Year Papers", "Archive Of Past University Papers For Your Program."],
  ["06", "Solved Papers", "Worked Solutions For Selected Previous-Year Papers."],
  ["07", "Official Syllabus", "The Approved Syllabus For Your Program And Semester."],
  ["08", "Course Outcomes", "Outcome Mapping So You Know What You Are Assessed On."],
  ["09", "Recommended Resources", "Books, References And Reading Lists Chosen Per Subject."],
  ["10", "Faculty Materials", "Uploads From Your Own Faculty, Attached To Your Section."],
];

const RESOURCE_ROWS = [
  { title: "Unit 2 — Informed Search Strategies", type: "Class Notes", size: "PDF · 14 Pages", tag: "Today", category: "Unit 2" },
  { title: "Unit 2 — Important Viva & Exam Questions", type: "Question Bank", size: "PDF · 3 Pages", tag: "Today", category: "Unit 2" },
  { title: "Unit 1 — State Space Search & Problem Solving", type: "Class Notes", size: "PDF · 20 Pages", tag: "Verified", category: "Unit 1" },
  { title: "Unit 3 — Knowledge Representation & Logic", type: "Lecture Slides", size: "PDF · 16 Pages", tag: "Syllabus", category: "Unit 3" },
  { title: "Introduction To AI — 2024 End-Semester Exam", type: "Previous-Year Paper", size: "PDF · 6 Pages", tag: "Archive", category: "Papers" },
  { title: "Introduction To AI — 2024 Solved Solution Key", type: "Solved Paper", size: "PDF · 22 Pages", tag: "Verified", category: "Papers" },
  { title: "Approved Course Outcomes CO1–CO5 Mapping", type: "Official Syllabus", size: "Document", tag: "Official", category: "Faculty" },
  { title: "Russell & Norvig AI Text — Chapter 3 Reference", type: "Recommended Resource", size: "Reference", tag: "Book", category: "Faculty" },
];

export function AcademicHub() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredResources = useMemo(() => {
    return RESOURCE_ROWS.filter((item) => {
      const matchesTab = activeTab === "All" || item.category === activeTab;
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchTerm]);

  return (
    <Section id="academic-hub">
      <Reveal>
        <SectionHeading
          eyebrow="Academic Hub"
          title="Everything Academic. In One Hub."
          description="One Structured Shelf Per Subject — Notes, Questions, Papers, Syllabus And Faculty Uploads, All Inheriting Your Semester And Section."
        />
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <Reveal className="min-w-0">
          <ul className="border-t border-border">
            {FEATURES.map(([num, title, copy]) => (
              <li
                key={num}
                className="group flex flex-col sm:grid sm:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[11.5rem_minmax(0,1fr)] xl:grid-cols-[13.5rem_minmax(0,1fr)] items-start sm:items-baseline gap-1.5 sm:gap-4 border-b border-border py-3.5 sm:py-4 transition-colors hover:bg-surface/60 min-w-0"
              >
                <div className="flex items-baseline gap-2.5 min-w-0">
                  <span className="label-caps text-primary text-xs font-bold font-mono shrink-0">{num}</span>
                  <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">{title}</h3>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground min-w-0">
                  {copy}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={100} className="lg:sticky lg:top-24 lg:self-start">
          <MockWindow
            title="Academic Hub · Introduction To AI"
            actions={<Pill tone="green">Semester 1</Pill>}
          >
            <div className="relative flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Course Notes, Past Papers, And Viva Sets..."
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2 border-b border-border bg-surface px-4 py-3">
              {["All", "Unit 1", "Unit 2", "Unit 3", "Papers", "Faculty"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={
                    activeTab === t
                      ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors cursor-pointer"
                      : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground cursor-pointer"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            <ul className="divide-y divide-border">
              {filteredResources.map((res) => (
                <li
                  key={res.title}
                  className="flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-surface group"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-surface transition-colors group-hover:border-primary group-hover:bg-accent/40">
                    <FileText className="h-4 w-4 text-primary" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold group-hover:text-primary transition-colors">
                      {res.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {res.type} · {res.size}
                    </span>
                  </span>
                  <Pill tone="neutral">{res.tag}</Pill>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-primary" />
                <span>{filteredResources.length} Resources Shown In This View</span>
              </span>
              <span className="font-semibold text-primary">Live Syllabus Sync</span>
            </div>
          </MockWindow>
        </Reveal>
      </div>
    </Section>
  );
}
