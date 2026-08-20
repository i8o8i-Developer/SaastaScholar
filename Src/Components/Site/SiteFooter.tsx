import {
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Cpu,
  Flame,
  Github,
  Globe,
  GraduationCap,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MessageSquare,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  Twitter,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/Ui/Dialog";
import { cn } from "@/Lib/Utils";

interface FooterLink {
  label: string;
  href?: string;
  badge?: string;
  modal?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Academic Hub",
    links: [
      { label: "Academic Hub", href: "#academic-hub", badge: "Core" },
      { label: "Assignment Tracker", href: "#assignments", badge: "Live" },
      { label: "Practical Records & Labs", href: "#practicals" },
      { label: "Exam PYQs & Solved Papers", href: "#academic-hub", badge: "Updated" },
      { label: "Smart Planner & Timetable", href: "#planner" },
      { label: "CGPA / SGPA Predictor", href: "#features", badge: "New" },
    ],
  },
  {
    title: "Resources & Prep",
    links: [
      { label: "Department Syllabus", href: "#academic-hub" },
      { label: "Lab Manuals & Viva Prep", href: "#practicals" },
      { label: "Live Notifications Feed", href: "#notifications", badge: "Instant" },
      { label: "Project Repositories", href: "#features" },
      { label: "Peer Study Notes", href: "#academic-hub" },
      { label: "Community Doubt Forum", href: "#faq" },
    ],
  },
  {
    title: "University & Life",
    links: [
      { label: "About NimsWallah", href: "#top" },
      { label: "Campus Ambassador Program", href: "/login", badge: "Hiring" },
      { label: "Student Perks & Offers", href: "#pricing" },
      { label: "Product Roadmap", href: "#features" },
      { label: "Frequently Asked Questions", href: "#faq" },
      { label: "Contact Student Support", href: "/login" },
    ],
  },
  {
    title: "Trust & Legal",
    links: [
      { label: "Privacy Policy", modal: "Privacy Policy" },
      { label: "Terms Of Service", modal: "Terms Of Service" },
      { label: "Academic Integrity & Honor", modal: "Academic Integrity & Honor" },
      { label: "Data Security Policy", modal: "Data Security Policy" },
      { label: "Cookie Preferences", modal: "Cookie Preferences" },
      { label: "System Uptime Status", modal: "System Uptime Status" },
    ],
  },
];

const POLICY_DETAILS: Record<string, { title: string; content: string[] }> = {
  "Privacy Policy": {
    title: "Student Privacy Policy",
    content: [
      "We Collect Only Minimal Information Necessary To Personalize Your University Workspace (Institution, Department, Program, Semester, Section).",
      "We Never Sell Student Personal Data, Academic Submissions, Or Coursework Details To Third-Party Advertisers.",
      "All Exam History, Course Notes, And Assignment Drafts Are Stored With Industry-Standard AES-256 Cloud Encryption.",
    ],
  },
  "Terms Of Service": {
    title: "Student Terms Of Service",
    content: [
      "NimsWallah Is Designed Exclusively As An Academic Study Assistant And Organizational Workspace For University Scholars.",
      "Users Retain Full Authorship And Responsibility For Any Submitted Assignments, Coursework, And Lab Records.",
      "Access Is Subject To Continuous Compliance With University Honor Codes And Academic Standards.",
    ],
  },
  "Academic Integrity & Honor": {
    title: "Academic Integrity & Honor Code",
    content: [
      "All AI-Generated Outlines, Solutions, And References Must Be Used For Conceptual Learning And Study Aid Purposes Only.",
      "Direct Submission Of Unreviewed Material Is Strictly In Violation Of Academic Honor Guidelines.",
      "We Encourage Rigorous Citation, Ethical Writing, And Thorough Personal Understanding.",
    ],
  },
  "Data Security Policy": {
    title: "Data Security & Infrastructure Policy",
    content: [
      "Our Infrastructure Employs Automated SSL/TLS Protocols, Role-Based Access Controls, And Isolated Container Sandboxes.",
      "Continuous Redundant Backups Ensure Zero Data Loss For Semester Course Notes And Saved Timetables.",
      "Zero Unauthorized Access: Course Materials And Student Profiles Are Partitioned By Verified University Domains.",
    ],
  },
  "Security Policy": {
    title: "Data Security & Infrastructure Policy",
    content: [
      "Our Infrastructure Employs Automated SSL/TLS Protocols, Role-Based Access Controls, And Isolated Container Sandboxes.",
      "Continuous Redundant Backups Ensure Zero Data Loss For Semester Course Notes And Saved Timetables.",
      "Zero Unauthorized Access: Course Materials And Student Profiles Are Partitioned By Verified University Domains.",
    ],
  },
  "Cookie Preferences": {
    title: "Cookie & Local Storage Policy",
    content: [
      "We Use Essential Local Storage Tokens Only To Retain Your Active University Profile And Semester Preferences.",
      "No Third-Party Tracking Pixels Or Intrusive Profiling Cookies Are Deployed.",
    ],
  },
  "System Uptime Status": {
    title: "System Availability & Uptime",
    content: [
      "All Core Modules (Academic Hub, Notification Feed, AI Assignment Creator, Lab Packets) Are Operating At 99.98% Uptime.",
      "Direct Sync With Department Servers Runs Automatically Every 15 Minutes.",
    ],
  },
};

const CAMPUS_DEPARTMENTS = [
  "B.Tech CSE",
  "B.Tech AI & Data Science",
  "B.Tech Cyber Security",
  "B.Tech Mechanical / Civil",
  "BCA & MCA",
  "B.Sc / M.Sc Computer Science",
  "B.Pharm / M.Pharm",
  "BBA & MBA",
  "Medical & Allied Sciences",
];

const SOCIAL_LINKS = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: Linkedin,
    hoverClass: "hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/10",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
    hoverClass: "hover:text-[#E4405F] hover:border-[#E4405F]/30 hover:bg-[#E4405F]/10",
  },
  {
    name: "Twitter / X",
    href: "https://x.com",
    icon: Twitter,
    hoverClass: "hover:text-foreground hover:border-foreground/30 hover:bg-foreground/10",
  },
  {
    name: "GitHub",
    href: "https://github.com",
    icon: Github,
    hoverClass: "hover:text-foreground hover:border-foreground/30 hover:bg-foreground/10",
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please Enter A Valid Student Email Address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      toast.success("Welcome Aboard! You Will Now Receive Critical Term Updates & Resources.");
    }, 600);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentPolicy = activeModal ? POLICY_DETAILS[activeModal] : null;

  return (
    <footer className="relative border-t border-border bg-gradient-to-b from-surface/70 via-background to-surface/90 text-foreground overflow-hidden">
      {/* Background ambient grid overlay */}
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-[0.04]"
      />

      <div className="relative mx-auto w-full max-w-[84rem] px-3.5 pt-12 pb-10 sm:px-8 sm:pt-16 sm:pb-12 min-w-0">
        {/* ===================== Top Newsletter Card ===================== */}
        <div className="mb-12 sm:mb-16 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/80 p-5 sm:p-10 shadow-[0_12px_40px_-20px_color-mix(in_oklab,var(--color-primary-deep)_25%,transparent)] backdrop-blur-sm min-w-0">
          <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-[1.2fr_1fr] min-w-0">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-accent/60 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[0.65rem] sm:text-xs font-semibold text-accent-foreground max-w-full">
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">Weekly Academic Dispatch</span>
              </div>
              <h3 className="mt-3 text-xl sm:text-3xl font-bold tracking-tight text-foreground break-words leading-tight">
                Stay Ahead In Your Semester.
              </h3>
              <p className="mt-2 text-xs sm:text-base leading-relaxed text-muted-foreground break-words">
                Exam Alerts, Lab Viva Cheat-Sheets, Assignment Deadlines, And Curated University
                Notes Delivered Directly To Your Student Inbox Every Monday.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-4 text-[0.7rem] sm:text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" /> Verified Academic Content
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> 100% Free For Students
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Flame className="h-3.5 w-3.5 text-highlight shrink-0" /> 15,000+ Active Students
                </span>
              </div>
            </div>

            <div className="min-w-0">
              {subscribed ? (
                <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-accent/40 p-4 text-xs sm:text-sm font-medium text-foreground min-w-0">
                  <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">You Are Officially Subscribed!</p>
                    <p className="text-[0.7rem] sm:text-xs text-muted-foreground truncate">
                      Check {email} For Your Orientation Toolkit.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row min-w-0">
                  <div className="relative flex-1 min-w-0">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Your Student Email (E.g. Name@University.edu)"
                      required
                      className="h-11 sm:h-12 w-full rounded-xl border border-border bg-background/90 pr-3 pl-10 text-xs sm:text-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-deep hover:shadow hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer shrink-0"
                  >
                    {loading ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        <span>Join Free</span>
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
              <p className="mt-2 text-[0.7rem] sm:text-[0.75rem] text-muted-foreground">
                Zero Spam. Unsubscribe Anytime With A Single Click.
              </p>
            </div>
          </div>
        </div>

        {/* ===================== Main Columns Grid ===================== */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 min-w-0">
          {/* Brand Col (lg: 4 cols) */}
          <div className="lg:col-span-4 min-w-0">
            <a href="#top" className="group inline-flex items-center gap-3">
              <img
                src="/NIMSWallah.png"
                alt="NimsWallah Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105"
              />
              <div>
                <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  NimsWallah
                </span>
                <span className="block text-[0.65rem] sm:text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">
                  Academic Command Center
                </span>
              </div>
            </a>

            <p className="mt-3.5 max-w-sm text-xs sm:text-sm leading-relaxed text-muted-foreground break-words">
              Empowering University Scholars To Streamline Courses, Organize Practicals, Master
              Assignments, And Track Target CGPAs — All In One Unified, Distraction-Free Platform.
            </p>

            {/* System Status Pill */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface px-3 py-1 text-[0.7rem] text-muted-foreground max-w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-medium text-foreground truncate">All Systems Operational</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="font-mono text-[0.65rem] shrink-0">v2.4</span>
            </div>

            {/* Social Icons */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {SOCIAL_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.name}
                    className={cn(
                      "grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 cursor-pointer",
                      item.hoverClass,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Nav Columns (lg: 8 cols = 2 cols each across 4 sections) */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4 min-w-0">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="min-w-0">
                <h4 className="label-caps text-xs font-bold text-foreground/90 truncate">{col.title}</h4>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label} className="min-w-0">
                      {link.modal ? (
                        <button
                          type="button"
                          onClick={() => setActiveModal(link.modal ?? null)}
                          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary text-left cursor-pointer break-words max-w-full"
                        >
                          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                            {link.label}
                          </span>
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-primary break-words max-w-full"
                        >
                          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                            {link.label}
                          </span>
                          {link.badge ? (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.2 text-[0.6rem] font-semibold uppercase leading-none shrink-0",
                                link.badge === "New" && "bg-highlight/20 text-highlight",
                                link.badge === "Live" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                                link.badge === "Core" && "bg-primary/15 text-primary",
                                link.badge === "Updated" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                                link.badge === "Instant" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                                link.badge === "Hiring" && "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                              )}
                            >
                              {link.badge}
                            </span>
                          ) : null}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ===================== Department Badges ===================== */}
        <div className="mt-10 sm:mt-14 border-t border-border/80 pt-6 sm:pt-8 min-w-0">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between min-w-0">
            <div className="flex items-center gap-2 text-[0.7rem] sm:text-xs font-semibold text-muted-foreground uppercase shrink-0">
              <GraduationCap className="h-4 w-4 text-primary shrink-0" />
              <span>Supported Programs:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {CAMPUS_DEPARTMENTS.map((dept) => (
                <span
                  key={dept}
                  className="rounded-md border border-border/70 bg-card/60 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.65rem] sm:text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground truncate"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ===================== Bottom Copyright & Back-to-Top ===================== */}
        <div className="mt-8 sm:mt-10 flex flex-col gap-4 border-t border-border/80 pt-6 lg:flex-row lg:items-center lg:justify-between min-w-0">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 text-xs text-muted-foreground min-w-0">
            <p className="break-words">
              © {new Date().getFullYear()} NimsWallah. Crafted For University Excellence.
            </p>
            <span className="hidden text-muted-foreground/40 sm:inline">•</span>
            <p className="inline-flex items-center gap-1">
              <span>Made With</span>
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500 shrink-0" />
              <span>For University Students</span>
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => setActiveModal("Privacy Policy")}
                className="transition-colors hover:text-primary whitespace-nowrap cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-muted-foreground/40">·</span>
              <button
                type="button"
                onClick={() => setActiveModal("Terms Of Service")}
                className="transition-colors hover:text-primary whitespace-nowrap cursor-pointer"
              >
                Terms Of Service
              </button>
              <span className="text-muted-foreground/40">·</span>
              <button
                type="button"
                onClick={() => setActiveModal("Security Policy")}
                className="transition-colors hover:text-primary whitespace-nowrap cursor-pointer"
              >
                Security Policy
              </button>
            </div>

            <button
              onClick={scrollToTop}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
              aria-label="Scroll Back To Top"
            >
              <span>Back To Top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Policy Modal */}
      {currentPolicy ? (
        <Dialog open={Boolean(activeModal)} onOpenChange={(open) => !open && setActiveModal(null)}>
          <DialogContent className="max-w-md rounded-2xl bg-card p-6 shadow-xl border border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {currentPolicy.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Official NimsWallah Academic Governance &amp; Standards
              </DialogDescription>
            </DialogHeader>
            <ul className="mt-4 space-y-3">
              {currentPolicy.content.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span className="text-foreground/90">{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:bg-primary-deep cursor-pointer"
              >
                Understood &amp; Accept
              </button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </footer>
  );
}
