import {
  BookOpen,
  Check,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileText,
  Flame,
  FlaskConical,
  Github,
  GraduationCap,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Twitter,
  Zap,
} from "lucide-react";
import { FormEvent, useState } from "react";
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
  accent: string;
  accentGradient: string;
  hoverColor: string;
  badgeStyle: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Study Materials",
    accent: "bg-emerald-400",
    accentGradient: "from-emerald-400 to-teal-400",
    hoverColor: "hover:text-emerald-500 dark:hover:text-emerald-400",
    badgeStyle: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    links: [
      { label: "Topper Handwritten Notes", href: "#academic-hub", badge: "Core" },
      { label: "Solved PYQs (2020–2025)", href: "#academic-hub", badge: "Verified" },
      { label: "Unit-Wise Formula Sheets", href: "#academic-hub" },
      { label: "Official Syllabus Breakdown", href: "#academic-hub" },
      { label: "Model Exam Answer Keys", href: "#academic-hub" },
    ],
  },
  {
    title: "Labs & Practicals",
    accent: "bg-cyan-400",
    accentGradient: "from-cyan-400 to-blue-400",
    hoverColor: "hover:text-cyan-500 dark:hover:text-cyan-400",
    badgeStyle: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    links: [
      { label: "Lab Manuals & Procedures", href: "#practicals" },
      { label: "Python, C++ & Java Codes", href: "#practicals", badge: "Tested" },
      { label: "50+ Viva Voce Question Bank", href: "#practicals" },
      { label: "Printable Record Templates", href: "#practicals" },
      { label: "Experiment Observation Sheets", href: "#practicals" },
    ],
  },
  {
    title: "Academic Workflow",
    accent: "bg-purple-400",
    accentGradient: "from-purple-400 to-pink-400",
    hoverColor: "hover:text-purple-500 dark:hover:text-purple-400",
    badgeStyle: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
    links: [
      { label: "AI Assignment Formatter", href: "#assignments", badge: "AI Tool" },
      { label: "IEEE & APA Citation Tools", href: "#assignments" },
      { label: "Smart Timetable & Planner", href: "#planner" },
      { label: "Department Exam Notices", href: "#notifications" },
      { label: "Frequently Asked Questions", href: "#faq" },
    ],
  },
  {
    title: "Trust & Legal",
    accent: "bg-rose-400",
    accentGradient: "from-rose-400 to-amber-400",
    hoverColor: "hover:text-rose-500 dark:hover:text-rose-400",
    badgeStyle: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
    links: [
      { label: "University Legal Disclaimer", modal: "Legal Disclaimer" },
      { label: "Student Privacy Policy", modal: "Privacy Policy" },
      { label: "Terms Of Service & Honor Code", modal: "Terms Of Service" },
      { label: "DMCA & Copyright Takedown", modal: "DMCA & Copyright Policy" },
      { label: "Data Security & Infrastructure", modal: "Data Security Policy" },
      { label: "Cookie & Session Telemetry", modal: "Cookie Preferences" },
    ],
  },
];

const POLICY_DETAILS: Record<string, { title: string; subtitle: string; content: string[] }> = {
  "Legal Disclaimer": {
    title: "University Non-Affiliation & Fair Use Legal Disclaimer",
    subtitle: "Statutory Educational Fair Use Declaration Under Section 52(1)(a) Indian Copyright Act 1957",
    content: [
      "Independent Student Initiative: NimsWallah is an independent student-led peer-to-peer educational support portal. It is NOT officially affiliated with, endorsed, sponsored, or operated by NIMS University Rajasthan or any university governing body.",
      "Fair Use Doctrine (Indian Copyright Act, 1957): All syllabus breakdowns, handwritten student notes, past examination archives, and reference study guides hosted on this platform are distributed strictly under the 'Fair Dealing' exception (Section 52(1)(a) of the Indian Copyright Act, 1957) exclusively for non-commercial private study, research, and academic scholarship.",
      "Trademarks & Registered Intellectual Property: All university names, institution insignias, official subject acronyms, and course codes referenced on this site belong exclusively to their respective institutional trademark proprietors. Their reference on NimsWallah is strictly nominative and intended solely for student courseware organization.",
      "Peer-To-Peer Content: All courseware uploaded by scholars remains the intellectual authorship of the respective student or contributing educator. NimsWallah acts as a passive technical platform hosting study units with forensic DRM protections.",
    ],
  },
  "Privacy Policy": {
    title: "Student Privacy Policy & Data Protection Charter",
    subtitle: "Compliant with Information Technology Act, 2000 (SPDI Rules 2011) & International Privacy Principles",
    content: [
      "Information We Collect: We collect only the essential credentials required to provision your academic workspace (Full Name, Student Roll Number, Department, Program Specialization, Semester, Cohort Section, and Verified Email Address).",
      "Forensic DRM Watermark Telemetry: To protect published scholar notes against illegal scraping and commercial distribution, our DRM engine dynamically renders real-time forensic session watermarks (Student Name, Roll Number, Session Hash, and Client IP). This telemetry data is never sold or used for behavioral profiling.",
      "Zero Third-Party Advertising: NimsWallah maintains a strict zero-tracker policy. We never sell, lease, or monetize student personal records, course choices, or academic analytics with third-party advertisers or data brokers.",
      "Cryptographic Security & Data Storage: All passwords are encrypted with military-grade Argon2 and PBKDF2 SHA-256 algorithms. All data in transit is shielded via TLS 1.3 encryption with strict HTTP Strict Transport Security (HSTS).",
      "Student Rights & Data Erasure: In compliance with the IT Act 2000, you possess the permanent legal right to inspect, correct, export, or permanently erase your academic profile and submissions at any time by contacting compliance@nimswallah.in.",
    ],
  },
  "Terms Of Service": {
    title: "Terms Of Service & Academic User Agreement",
    subtitle: "Legally Binding User Agreement Governing Platform Usage, Content Ownership, and DRM Integrity",
    content: [
      "Single-Scholar Educational License: Access to NimsWallah courseware is granted under a personal, non-exclusive, non-transferable, revocable license strictly for the individual student's examination preparation. Account sharing, credential reselling, or unauthorized group access is strictly prohibited.",
      "DRM Anti-Circumvention Covenant: Students expressly agree NOT to bypass, disable, decompile, tamper with, or circumvent any forensic DRM watermarks, capture-prevention overlays, or viewing safeguards implemented across the platform. Violations will result in immediate permanent account termination.",
      "Uploader Content Warranty: Any student or faculty contributor uploading notes, lab codes, or solutions warrants that they hold the requisite permissions to share such educational study aids and that their submission does not violate confidentiality or intellectual property rights.",
      "Disclaimers of Academic Warranty: NimsWallah study materials and AI-generated assignment outlines are structured to assist conceptual mastery. The platform makes no guarantees of specific examination grades or institutional curriculum alignment.",
      "Governing Law & Jurisdiction: These terms and conditions are governed by and construed in accordance with the laws of the Republic of India, with exclusive jurisdiction situated in Jaipur, Rajasthan.",
    ],
  },
  "DMCA & Copyright Policy": {
    title: "DMCA & Copyright Infringement Takedown Policy",
    subtitle: "Expedited Notice-and-Takedown Protocol for Copyright Holders & Academic Authors",
    content: [
      "Commitment To Copyright Compliance: NimsWallah respects all intellectual property rights and promptly addresses formal notices of alleged copyright infringement under applicable copyright acts and international standards.",
      "Notice Submission Requirements: If you believe your copyrighted material is present on this platform without authorization, submit a formal notice to legal@nimswallah.in including: (1) Identification of the copyrighted work, (2) Direct URL/material identifier, (3) Proof of copyright ownership or legal authorization, and (4) Contact details with a statement of good faith.",
      "24-Hour Expedited Material Review: Upon receipt of a valid copyright notice, our legal administration will immediately review and temporarily restrict or permanently remove the challenged material within 24 hours pending verification.",
      "Repeat Infringer Policy: Contributing accounts that repeatedly upload non-compliant copyrighted documents will face immediate and permanent platform exclusion.",
    ],
  },
  "Data Security Policy": {
    title: "Data Security & Infrastructure Policy",
    subtitle: "Container Sandboxing, End-to-End Encryption, and High-Availability Architecture",
    content: [
      "Zero-Trust Infrastructure: Our deployment architecture runs within isolated container sandboxes with automated TLS 1.3 certificates and hardened Linux environments.",
      "Automated Database Redundancy: Student profiles, course configurations, and academic records are backed up with cryptographic verification to ensure 100% data durability.",
      "Active Threat Mitigation: Automated rate-limiting, IP-level brute-force defense, and SQL injection firewalls protect all API endpoints against hostile network activity.",
    ],
  },
  "Security Policy": {
    title: "Data Security & Infrastructure Policy",
    subtitle: "Container Sandboxing, End-to-End Encryption, and High-Availability Architecture",
    content: [
      "Zero-Trust Infrastructure: Our deployment architecture runs within isolated container sandboxes with automated TLS 1.3 certificates and hardened Linux environments.",
      "Automated Database Redundancy: Student profiles, course configurations, and academic records are backed up with cryptographic verification to ensure 100% data durability.",
      "Active Threat Mitigation: Automated rate-limiting, IP-level brute-force defense, and SQL injection firewalls protect all API endpoints against hostile network activity.",
    ],
  },
  "Cookie Preferences": {
    title: "Cookie & Session Telemetry Policy",
    subtitle: "Essential Functional Tokens Only · Zero Advertising Trackers",
    content: [
      "Essential Session Tokens: We utilize strictly essential HTTP cookies and local storage items solely to authenticate your login state, theme mode, and semester preferences.",
      "Zero Advertising Trackers: We do not deploy third-party advertising cookies, fingerprinting pixels, or behavioral marketing trackers.",
      "Complete User Control: You can clear your stored browser session data at any time via your browser settings or by signing out of your workspace.",
    ],
  },
};

const CAMPUS_DEPARTMENTS = [
  { name: "B.Tech CSE", hover: "hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/10" },
  { name: "B.Tech AI & Data Science", hover: "hover:border-cyan-500/50 hover:text-cyan-500 hover:bg-cyan-500/10" },
  { name: "B.Tech Cyber Security", hover: "hover:border-indigo-500/50 hover:text-indigo-500 hover:bg-indigo-500/10" },
  { name: "B.Tech Mechanical / Civil", hover: "hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/10" },
  { name: "BCA & MCA", hover: "hover:border-purple-500/50 hover:text-purple-500 hover:bg-purple-500/10" },
  { name: "B.Sc / M.Sc Computer Science", hover: "hover:border-teal-500/50 hover:text-teal-500 hover:bg-teal-500/10" },
  { name: "B.Pharm / M.Pharm", hover: "hover:border-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10" },
  { name: "BBA & MBA", hover: "hover:border-orange-500/50 hover:text-orange-500 hover:bg-orange-500/10" },
  { name: "Medical & Allied Sciences", hover: "hover:border-fuchsia-500/50 hover:text-fuchsia-500 hover:bg-fuchsia-500/10" },
];

const SOCIAL_LINKS = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: Linkedin,
    hoverClass: "hover:text-[#0077b5] hover:border-[#0077b5]/40 hover:bg-[#0077b5]/10 shadow-[0_0_12px_rgba(0,119,181,0.2)]",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
    hoverClass: "hover:text-[#e1306c] hover:border-[#e1306c]/40 hover:bg-[#e1306c]/10 shadow-[0_0_12px_rgba(225,48,108,0.2)]",
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: Twitter,
    hoverClass: "hover:text-[#1da1f2] hover:border-[#1da1f2]/40 hover:bg-[#1da1f2]/10 shadow-[0_0_12px_rgba(29,161,242,0.2)]",
  },
  {
    name: "GitHub",
    href: "https://github.com",
    icon: Github,
    hoverClass: "hover:text-[#8b5cf6] hover:border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/10 shadow-[0_0_12px_rgba(139,92,246,0.2)]",
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
    <footer className="relative bg-gradient-to-b from-surface/90 via-background to-surface text-foreground overflow-hidden">
      {/* ===================== Top Vibrant Rainbow Gradient Edge Bar ===================== */}
      <div className="h-[3px] w-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-teal-400 via-cyan-400 via-indigo-500 to-fuchsia-500 shadow-[0_0_16px_rgba(236,72,153,0.35)]" />

      {/* Multi-Color Ambient Mesh Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-1/4 -z-10 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-emerald-500/10 blur-[140px] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 right-1/4 -z-10 h-[30rem] w-[40rem] translate-x-1/2 rounded-full bg-gradient-to-bl from-cyan-500/10 via-indigo-500/10 to-fuchsia-500/10 blur-[140px] opacity-70"
      />

      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-[0.04]"
      />

      <div className="relative mx-auto w-full max-w-[84rem] px-3.5 pt-12 pb-10 sm:px-8 sm:pt-16 sm:pb-12 min-w-0">
        {/* ===================== Top Newsletter Card (Clean Original Palette) ===================== */}
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
                  <Flame className="h-3.5 w-3.5 text-highlight shrink-0" /> NIMS Syllabus Aligned
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
                      Check {email} For Your Weekly Toolkit.
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
                src="/NIMSWallah.png?v=2"
                alt="NimsWallah Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105"
              />
              <div>
                <span className="font-display text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
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
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[0.7rem] text-muted-foreground max-w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-300 truncate">All Systems Operational</span>
              <span className="text-emerald-500/40">•</span>
              <span className="font-mono text-[0.65rem] shrink-0 text-emerald-600 dark:text-emerald-400 font-bold">v2.4</span>
            </div>

            {/* Social Icons with Rainbow Glows */}
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
                      "grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl border border-border bg-card/90 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-2xs backdrop-blur-xs",
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
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full bg-gradient-to-r shrink-0", col.accentGradient)} />
                  <h4 className="label-caps text-xs font-bold text-foreground/90 truncate">{col.title}</h4>
                </div>

                <ul className="mt-3.5 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label} className="min-w-0">
                      {link.modal ? (
                        <button
                          type="button"
                          onClick={() => setActiveModal(link.modal ?? null)}
                          className={cn(
                            "group inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground transition-colors text-left cursor-pointer break-words max-w-full",
                            col.hoverColor,
                          )}
                        >
                          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                            {link.label}
                          </span>
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          className={cn(
                            "group inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground transition-colors break-words max-w-full",
                            col.hoverColor,
                          )}
                        >
                          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                            {link.label}
                          </span>
                          {link.badge ? (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.2 text-[0.6rem] font-bold uppercase leading-none shrink-0 border",
                                col.badgeStyle,
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

        {/* ===================== Department Badges with Rainbow Hover ===================== */}
        <div className="mt-10 sm:mt-14 border-t border-border/80 pt-6 sm:pt-8 min-w-0">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between min-w-0">
            <div className="flex items-center gap-2 text-[0.7rem] sm:text-xs font-bold text-foreground uppercase tracking-wider shrink-0">
              <div className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <GraduationCap className="h-3 w-3 shrink-0" />
              </div>
              <span>Supported Programs:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {CAMPUS_DEPARTMENTS.map((dept) => (
                <span
                  key={dept.name}
                  className={cn(
                    "rounded-lg border border-border/70 bg-card/70 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[0.65rem] sm:text-xs font-medium text-muted-foreground transition-all duration-200 shadow-2xs backdrop-blur-xs cursor-default truncate",
                    dept.hover,
                  )}
                >
                  {dept.name}
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
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500 shrink-0 animate-pulse" />
              <span className="font-semibold bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
                For University Students
              </span>
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => setActiveModal("Privacy Policy")}
                className="transition-colors hover:text-emerald-500 whitespace-nowrap cursor-pointer font-medium"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveModal("Terms Of Service")}
                className="transition-colors hover:text-cyan-500 whitespace-nowrap cursor-pointer font-medium"
              >
                Terms Of Service
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveModal("Security Policy")}
                className="transition-colors hover:text-purple-500 whitespace-nowrap cursor-pointer font-medium"
              >
                Security Policy
              </button>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3 py-1 text-xs font-bold text-foreground shadow-2xs transition-all duration-200 hover:border-transparent hover:bg-gradient-to-r hover:from-emerald-500/20 hover:via-cyan-500/20 hover:to-purple-500/20 hover:scale-105 cursor-pointer shrink-0"
            >
              <span>Back To Top</span>
              <span className="text-emerald-500">↑</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== Interactive Policy Modal Dialog ===================== */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl">
          <DialogHeader>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>NimsWallah Governance</span>
            </div>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              {currentPolicy?.title ?? activeModal}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {currentPolicy?.subtitle || "Official Institutional Guidelines & Compliance Directives"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3 text-xs leading-relaxed text-foreground/90">
            {currentPolicy?.content.map((paragraph, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-surface/70 p-3"
              >
                <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[0.65rem] font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="flex-1">{paragraph}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end border-t border-border/60 pt-4">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-deep cursor-pointer"
            >
              Understood &amp; Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
