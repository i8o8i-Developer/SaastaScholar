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

type FaqCategory = "All Questions" | "Academic Hub" | "Assignments" | "Practicals & Labs" | "Student Plans & Access";

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
  { label: "Student Plans & Access", icon: ShieldCheck },
];

const FAQS_DATA: FaqItem[] = [
  {
    category: "Academic Hub",
    popular: true,
    question: "What Is SaastaScholar?",
    answer:
      "SaastaScholar Is A Simple Website For College Students. It Keeps All Your Class Notes, Solved Exam Papers, Lab Experiment Codes, And Timetables In One Clean Place So You Never Have To Hunt Through Messy WhatsApp Groups.",
  },
  {
    category: "Student Plans & Access",
    popular: true,
    question: "Who Can Use This Study Platform?",
    answer:
      "Any Enrolled College Student! Once You Pick Your University, Degree, Branch, Semester, And Section, Your Dashboard Automatically Shows Only The Material For Your Exact Class.",
  },
  {
    category: "Academic Hub",
    question: "How Does Smart Filtering Work?",
    answer:
      "We Sort Every Single File By Branch, Semester, And Section. You Will Only Ever See The Notes And Announcements Meant For You — Zero Clutter Or Spam.",
  },
  {
    category: "Academic Hub",
    popular: true,
    question: "Can I Download Past Exam Papers With Solutions?",
    answer:
      "Yes! You Can Download Real University Exam Papers From Previous Years With Clear, Step-By-Step Solved Model Answers To Help You Score Full Marks.",
  },
  {
    category: "Assignments",
    popular: true,
    question: "How Does The AI Homework Helper Work?",
    answer:
      "It Helps You Create Neat Homework Drafts, Generates Proper IEEE And APA Citations, And Formats Everything Neatly Into A Printable PDF Or Word Document.",
  },
  {
    category: "Practicals & Labs",
    question: "What Lab Practicals Do You Provide?",
    answer:
      "You Get The Complete Lab Manual, Clean Tested Code, Observation Tables, And 50+ Real Viva Questions With Answers For Every Single Experiment.",
  },
  {
    category: "Student Plans & Access",
    question: "How Do I Get College Announcements?",
    answer:
      "All Official College Circulars, Exam Date Sheets, And Holiday Notices Arrive Instantly In Your Notice Feed Filtered Directly For Your Class.",
  },
  {
    category: "Student Plans & Access",
    popular: true,
    question: "How Do Student Access Plans Work?",
    answer:
      "Every Student Receives Starter Scholar Access Immediately For Course Outlines, Timetables, Notices, And Sample Solved Exam Papers.",
  },
  {
    category: "Academic Hub",
    question: "Can Class Representatives Or Administrators Upload Notes?",
    answer:
      "Yes! Authorized Administrators And Student Class Representatives Can Easily Upload Daily Lecture Slides, Handwritten Notes, And Lab Codes Directly To Their Section.",
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
              Got Questions? We Have Simple Answers.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Everything You Need To Know About Notes, Solved Papers, Lab Practicals, And Student Access.
            </p>
          </div>

          {/* Quick Support Card */}
          <div className="overflow-hidden rounded-2xl border border-border-strong bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Still Have Questions?</h3>
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
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={cn(
                    "inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1 sm:py-1.5 text-[0.72rem] sm:text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-2.5 sm:space-y-3">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className="overflow-hidden rounded-xl border border-border bg-card px-3 sm:px-5 transition-all duration-200 data-[state=open]:border-primary/50 data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="py-3 sm:py-4.5 text-left text-sm sm:text-base font-semibold hover:no-underline hover:text-primary">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 pr-1.5 sm:pr-3 text-foreground min-w-0 flex-1">
                      <span className="shrink-0 whitespace-nowrap font-mono text-[0.7rem] sm:text-xs font-semibold tabular-nums text-primary/80 mt-0.5 sm:mt-0 select-none">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 break-words text-xs sm:text-base leading-snug">{faq.question}</span>
                      {faq.popular ? (
                        <span className="hidden sm:inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary uppercase shrink-0">
                          Popular
                        </span>
                      ) : null}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border/60 pt-2.5 sm:pt-3 pb-3.5 sm:pb-5 text-xs sm:text-sm leading-relaxed text-muted-foreground break-words">
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
