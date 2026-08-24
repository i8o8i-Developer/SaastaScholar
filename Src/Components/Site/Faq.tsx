import {
  HelpCircle,
  MessageCircle,
  Search,
  Sparkles,
  X,
  ChevronDown,
  BookOpen,
  GraduationCap,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import { useState, useMemo } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/Ui/Accordion";
import { cn } from "@/Lib/Utils";
import { Cta, Eyebrow, Pill, Reveal, Section, SectionHeading } from "./Primitives";

type FaqCategory = "All Questions" | "Academic Hub" | "Assignments" | "Practicals & Labs" | "Access & Free Plan";

interface FaqItem {
  question: string;
  answer: string;
  category: FaqCategory;
  popular?: boolean;
}

const CATEGORIES: { label: FaqCategory; icon: typeof HelpCircle }[] = [
  { label: "All Questions", icon: Sparkles },
  { label: "Academic Hub", icon: BookOpen },
  { label: "Assignments", icon: GraduationCap },
  { label: "Practicals & Labs", icon: FlaskConical },
  { label: "Access & Free Plan", icon: ShieldCheck },
];

const FAQS_DATA: FaqItem[] = [
  {
    category: "Academic Hub",
    popular: true,
    question: "What Is The NimsWallah Platform?",
    answer:
      "NimsWallah Is An All-In-One Student Academic Platform Designed Specifically For University Scholars. It Consolidates Course Notes, Lab Manuals, AI Assignment Assistance, Previous-Year Solved Papers, Direct University Notifications, And Semester CGPA Target Calculators Into One Unified Workspace.",
  },
  {
    category: "Access & Free Plan",
    popular: true,
    question: "Who Can Use This Academic Workspace?",
    answer:
      "Any Enrolled University Student, Department Scholar, Or Faculty Member Whose University Program Is Supported. Once You Select Your University, Degree, Branch, Semester, And Section, Your Entire Dashboard Instantly Customizes To Match Your Exact Timetable And Syllabus.",
  },
  {
    category: "Academic Hub",
    question: "How Does University-Based Personalization Work?",
    answer:
      "Every Single Note, PYQ, And Notice Is Mapped To A Dynamic Hierarchy: Institution → Faculty → Department → Program → Semester → Section → Subject Code. You Will Only Ever See Study Resources And Announcements That Are 100% Relevant To Your Current Enrolled Courses.",
  },
  {
    category: "Academic Hub",
    popular: true,
    question: "Can I Download Previous-Year Question Papers With Solutions?",
    answer:
      "Yes. The Academic Hub Contains Complete Archives Of Previous-Year Question Papers (PYQs) Spanning Multiple Years. Verified Model Answer Keys And Step-By-Step Explanations Are Available For Core Subjects And Elective Papers.",
  },
  {
    category: "Assignments",
    popular: true,
    question: "How Does The AI Assignment Creator Assist With Coursework?",
    answer:
      "The AI Assignment Assistant Helps Structure Your Drafts, Generate Academic Citations (IEEE, APA, Harvard), Format References, And Export Formatted PDF Or Word Documents Tailored To Your Department Guidelines. Final Review And Academic Responsibility Remain With You.",
  },
  {
    category: "Practicals & Labs",
    question: "What Practical Lab Resources Are Provided For Each Subject?",
    answer:
      "Each Experiment Includes A Full Lab Packet: Official Lab Manual, Theoretical Procedure, Step-By-Step Code Or Apparatus Setup, Printable Record-Book Formats, And Curated Viva Voce Question Banks With Examiner Explanations.",
  },
  {
    category: "Access & Free Plan",
    question: "How Do Live University Notifications Reach Me?",
    answer:
      "Official University Circulars, Departmental Schedules, Exam Date Sheets, And Holiday Notices Are Consolidated Into A Single Live Real-Time Feed. You Can Filter Notifications By Department, Batch, Or Urgent Deadlines.",
  },
  {
    category: "Access & Free Plan",
    question: "Is The Platform Completely Free For College Students?",
    answer:
      "Yes, There Is A Generous Lifetime Free Plan That Grants Access To Standard Course Notes, Live Circulars, Basic Timetable Planning, And Standard PYQs. Premium Upgrades Unlock AI Assignment Drafting, Solved Lab Manuals, And Offline Bundles.",
  },
  {
    category: "Academic Hub",
    question: "Can Professors Or Class Representatives Upload Notes?",
    answer:
      "Yes. Verified Department Representatives And Faculty Can Upload Lecture Slides, Lab Code Repositories, And Hand-Written Notes Directly To A Designated Section Or Subject Module For Instant Peer Distribution.",
  },
];

export function Faq() {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("All Questions");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Questions" || item.category === selectedCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <Section id="faq" tone="surface" className="relative overflow-hidden">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
        {/* Left Column: Heading, Support Card & Highlights */}
        <Reveal className="space-y-8">
          <div>
            <Eyebrow>Frequently Asked Questions</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.2rem]">
              Clear Answers. No Ambiguity.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Everything You Need To Know About University Personalization, Assignment Tools, Lab
              Packs, And Student Access.
            </p>
          </div>

          {/* Quick Support Card */}
          <div className="overflow-hidden rounded-2xl border border-border-strong bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Still Have Questions?</h4>
                <p className="text-xs text-muted-foreground">
                  Our Student Support Team Responds In Minutes.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Cannot Find What You Are Looking For? Connect With Our Student Council Or Raise A Query
              Directly.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Cta href="/dashboard?tab=student-desk" size="sm" variant="primary">
                Contact Student Desk
              </Cta>
              <Cta href="/dashboard?tab=community-forum" size="sm" variant="outline">
                Community Forum
              </Cta>
            </div>
          </div>
        </Reveal>

        {/* Right Column: Search, Category Chips & Interactive Accordion */}
        <Reveal delay={100} className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Any Question, Topic, Or Keyword..."
              className="h-12 w-full rounded-xl border border-border bg-card pr-10 pl-10 text-sm shadow-2xs transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear Search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className="overflow-hidden rounded-xl border border-border bg-card px-5 transition-all duration-200 data-[state=open]:border-primary/50 data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="py-4.5 text-left text-base font-semibold hover:no-underline hover:text-primary">
                    <div className="flex items-center gap-2.5 pr-3 text-foreground">
                      <span className="font-mono text-xs font-medium text-primary/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{faq.question}</span>
                      {faq.popular ? (
                        <span className="hidden sm:inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary uppercase">
                          Popular
                        </span>
                      ) : null}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border/60 pt-3 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center">
              <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-semibold text-foreground">No Matching Questions Found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try Adjusting Your Keyword Or Choose A Different Category Above.
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
