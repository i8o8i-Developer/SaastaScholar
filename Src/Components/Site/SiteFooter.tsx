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
    title: "University Non-Affiliation & Statutory Fair Use Legal Disclaimer",
    subtitle: "Statutory Educational Fair Dealing Declaration Under Section 52(1)(a) Of The Indian Copyright Act, 1957 & Section 30(2)(d) Of The Trade Marks Act, 1999",
    content: [
      "Statutory University Non-Affiliation Declaration (Consumer Protection Act, 2019): NimsWallah Is An Independent Student-Led Peer-To-Peer Educational Support Portal. NimsWallah Is Not Officially Affiliated With, Endorsed, Sponsored, Maintained, Or Operated By NIMS University Rajasthan Or Any Statutory University Governing Body.",
      "Educational Fair Dealing Exemption (Section 52(1)(a)(i) Of The Indian Copyright Act, 1957): All Syllabus Breakdowns, Handwritten Student Lecture Notes, Past Examination Archives, And Reference Study Aids Hosted Across This Platform Are Distributed Strictly Under The Statutory 'Fair Dealing' Doctrine Exclusively For Non-Commercial Private Study, Research, Criticism, And Academic Revision.",
      "Instructional Reproduction Defense (Section 52(1)(h) & Section 52(1)(i) Of The Indian Copyright Act, 1957): Study Materials And Model Answers Are Produced And Shared Strictly In The Course Of Academic Instruction And For Answering University Examination Questions.",
      "Nominative Trademark Fair Use (Section 30(2)(d) Of The Trade Marks Act, 1999): All University Names, Institutional Acronyms, Degree Program Designations, And Subject Codes Mentioned On This Platform Belong Solely To Their Respective Trademark Holders. Their Use On NimsWallah Is Strictly Nominative To Facilitate Courseware Navigation And Student Cataloging.",
      "Intermediary Safe Harbour Immunity (Section 79 Of The Information Technology Act, 2000 & IT Intermediary Rules, 2021): NimsWallah Acts Exclusively As A Neutral Educational Technology Intermediary Providing Secure Cloud Hosting And Automated Forensic DRM Protection For Peer-To-Peer Academic Submissions.",
    ],
  },
  "Privacy Policy": {
    title: "Student Privacy Policy & Data Protection Charter",
    subtitle: "Compliant With Digital Personal Data Protection Act, 2023 (DPDP Act, 2023) & Information Technology Act, 2000 (SPDI Rules, 2011)",
    content: [
      "Lawful Data Collection & Purpose Limitation (Digital Personal Data Protection Act, 2023 - DPDP Act 2023): We Collect Only Necessary Student Verification Data (Full Name, University Roll Number, Academic Department, Specialization Program, Semester, Section, And Institutional Email) Solely For Workspace Provisioning And DRM Protection.",
      "Forensic Watermark Telemetry & Tamper Evident Proof (Section 65B Of Indian Evidence Act, 1872 & Bharatiya Sakshya Adhiniyam, 2023): To Prevent Unauthorized Scraping And Illegal Commercial Redistribution, Our Dynamic Engine Overlays Cryptographic Session Watermarks (Student Name, Roll Number, Timestamp, Session Hash, And Client IP). This Telemetry Is Maintained As Forensic Tamper-Proof Evidence And Never Monetized.",
      "Zero Third-Party Commercial Data Brokerage (SPDI Rules 2011 & DPDP Act 2023): NimsWallah Strictly Prohibits Selling, Renting, Leasing, Or Exchanging Student Personal Data, Usage Patterns, Or Reading History With Any External Advertisers, Data Brokers, Or Marketing Agencies.",
      "Cryptographic Infrastructure & Secure Storage (Section 43A Of The Information Technology Act, 2000): All User Passwords Are Cryptographically Protected With Argon2 And PBKDF2 SHA-256 Algorithms. Data In Transit Is Fully Shielded Using TLS 1.3 Transport Encryption With Mandatory HTTP Strict Transport Security (HSTS).",
      "Student Rights Of Data Principals (Section 11, 12 & 13 Of DPDP Act, 2023): Every Student Enrolled Retains The Statutory Right To Access, Review, Rectify, Export, Or Permanently Delete Their Personal Information And Uploaded Contributions By Submitting A Request To privacy@nimswallah.in.",
      "Statutory Grievance Redressal Mechanism (Rule 3(2) Of Information Technology Intermediary Rules, 2021): The Grievance Redressal Officer Can Be Reached At grievance@nimswallah.in With An Expedited 48-Hour Response Guarantee For All Privacy And Account Security Petitions.",
    ],
  },
  "Terms Of Service": {
    title: "Terms Of Service & Academic User Agreement",
    subtitle: "Legally Binding User Agreement Governing Platform Usage, Content Ownership, And Forensic DRM Safeguards Under Indian Law",
    content: [
      "Legally Enforceable Electronic Agreement (Section 10A Of The Information Technology Act, 2000 & Indian Contract Act, 1872): Creating An Account Or Accessing Courseware Establishes A Binding Electronic Contract Between The Enrolled Student And NimsWallah Governance.",
      "Single-Scholar Non-Commercial License (Section 14 & Section 51 Of The Indian Copyright Act, 1957): Access To Platform Courseware Is Granted Exclusively Under A Limited, Revocable, Personal, Non-Transferable Educational License Solely For Private Study. Reselling, Mass Downloading, Scraping, Or Group Account Sharing Is Strictly Prohibited.",
      "Forensic DRM Anti-Circumvention Covenant (Section 65A & Section 65B Of The Indian Copyright Act, 1957): Users Strictly Covenants Not To Bypass, Disable, Decompile, Intercept, Screen-Capture, Or Circumvent Any Forensic Watermarks Or Technical Safeguards. Violations Trigger Immediate Termination And Civil Liability Under Applicable Copyright Laws.",
      "Uploader Warranty & Originality Declaration (Section 57 Of The Indian Copyright Act, 1957): Any Scholar Or Faculty Contributor Publishing Study Guides Warrants That They Hold Lawful Intellectual Authority Over The Content And That It Contains No Plagiarized Material Or Confidentially Protected Institutional Data.",
      "Academic Disclaimer & Absence Of Grade Warranty: NimsWallah Educational Modules, PYQ Solutions, And AI Tools Are Conceptual Revision Aids. The Platform Explicitly Disclaims Any Guarantee Regarding Specific Institutional Exam Questions Or Final Grade Outcomes.",
      "Dispute Resolution, Arbitration & Exclusive Jurisdiction: Any Legal Claim Or Dispute Arising Under These Terms Shall Be Resolved In Accordance With The Arbitration And Conciliation Act, 1996, With Exclusive Territorial Jurisdiction Vested In Jaipur, Rajasthan, India.",
    ],
  },
  "DMCA & Copyright Policy": {
    title: "DMCA & Statutory Copyright Infringement Takedown Policy",
    subtitle: "Notice-And-Takedown Protocol Under Rule 3(1)(d) Of Information Technology Intermediary Rules, 2021 & Section 52(1)(c) Of The Indian Copyright Act, 1957",
    content: [
      "Statutory Takedown Notice Framework (Rule 3(1)(d) Of Information Technology Intermediary Guidelines Rules, 2021 & Section 52(1)(c) Of Copyright Act, 1957): NimsWallah Respects Intellectual Property Rights And Maintains A 24-To-36-Hour Notice-And-Takedown Mechanism For Copyright Holders.",
      "Formal Infringement Notice Mandate: To File A Valid Copyright Complaint, Rights Holders Must Send A Verified Written Notice To legal@nimswallah.in Containing: (1) Exact Identification Of The Copyrighted Work, (2) Direct URL Or Material Identifier, (3) Proof Of Legal Authority Or Copyright Ownership, And (4) Statement Of Good Faith Belief Under Penalty Of Perjury.",
      "Expedited Interim Access Restriction (24-Hour Protocol): Upon Receipt Of A Bona Fide Infringement Notice, Our Legal Compliance Desk Immediately Restricts Public Access To The Challenged URL Within 24 Hours Pending Formal Verification.",
      "Counter-Notification & Due Process: Contributors Facing An Unjust Copyright Claim May Submit A Sworn Counter-Notification Demonstrating Original Authorship Or Fair Dealing Under Section 52(1)(a) Of The Indian Copyright Act, 1957.",
      "Repeat Infringer Termination Policy: Accounts That Repeatedly Violate Copyright Provisions Will Face Permanent Platform Expulsion And Forfeiture Of Courseware Privileges.",
    ],
  },
  "Data Security Policy": {
    title: "Data Security & Infrastructure Hardening Policy",
    subtitle: "Enterprise Container Sandboxing, End-To-End Encryption, And Real-Time Threat Mitigation In Compliance With ISO/IEC 27001 Standards",
    content: [
      "Zero-Trust Hardened Infrastructure (Section 43A IT Act, 2000 & ISO/IEC 27001 Standards): Our Production Environment Deploys In Isolated Linux Container Sandboxes With Automated TLS 1.3 Encryption, Gunicorn Thread Isolation, And Least-Privilege Role Access Controls.",
      "Active Cybersecurity Threat Mitigation: Real-Time Web Application Firewalls, Brute-Force Rate Limiters, SQL Injection Parameterization, And Cross-Site Scripting (XSS) Sanitization Protect All User Data Against Hostile Network Attacks.",
      "Automated Redundancy & Data Durability: All Relational Database Tables, Student Progress Records, And DRM Vault Storage Are Replicated With Multi-Tier Point-In-Time Recovery Mechanisms.",
      "Mandatory Cybersecurity Incident Reporting: In Accordance With CERT-In (Indian Computer Emergency Response Team) Directives, Security Incidents Are Promptly Documented And Addressed With Full Transparency.",
    ],
  },
  "Security Policy": {
    title: "Data Security & Infrastructure Hardening Policy",
    subtitle: "Enterprise Container Sandboxing, End-To-End Encryption, And Real-Time Threat Mitigation In Compliance With ISO/IEC 27001 Standards",
    content: [
      "Zero-Trust Hardened Infrastructure (Section 43A IT Act, 2000 & ISO/IEC 27001 Standards): Our Production Environment Deploys In Isolated Linux Container Sandboxes With Automated TLS 1.3 Encryption, Gunicorn Thread Isolation, And Least-Privilege Role Access Controls.",
      "Active Cybersecurity Threat Mitigation: Real-Time Web Application Firewalls, Brute-Force Rate Limiters, SQL Injection Parameterization, And Cross-Site Scripting (XSS) Sanitization Protect All User Data Against Hostile Network Attacks.",
      "Automated Redundancy & Data Durability: All Relational Database Tables, Student Progress Records, And DRM Vault Storage Are Replicated With Multi-Tier Point-In-Time Recovery Mechanisms.",
      "Mandatory Cybersecurity Incident Reporting: In Accordance With CERT-In (Indian Computer Emergency Response Team) Directives, Security Incidents Are Promptly Documented And Addressed With Full Transparency.",
    ],
  },
  "Cookie Preferences": {
    title: "Cookie & Session Telemetry Policy",
    subtitle: "Essential Session Authentication Tokens Only · Zero Cross-Site Behavioral Tracking",
    content: [
      "Strictly Essential Authentication Tokens Only: NimsWallah Deploys Only Cryptographically Signed, HTTP-Only Session Cookies Necessary To Maintain Scholar Login Authentication, CSRF Security, And Workspace Preferences.",
      "Zero Behavioral Tracking Pixels: We Do Not Employ Any Third-Party Cross-Site Marketing Cookies, Fingerprinting Telemetry, Or Invasive Tracking Beacons.",
      "Client-Side Privacy Controls: Scholars May Reset Or Purge Stored Session Preferences At Any Time Through Standard Browser Storage Controls Or By Logging Out Of The Academic Workspace.",
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
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80 pt-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground min-w-0 text-center sm:text-left">
            <p className="break-words">
              © {new Date().getFullYear()} NimsWallah. Crafted For University Excellence.
            </p>
            <span className="hidden text-muted-foreground/40 sm:inline">•</span>
            <p className="inline-flex items-center justify-center gap-1">
              <span>Made With</span>
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500 shrink-0 animate-pulse" />
              <span className="font-semibold bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
                For University Students
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs transition-all duration-200 hover:border-transparent hover:bg-gradient-to-r hover:from-emerald-500/20 hover:via-cyan-500/20 hover:to-purple-500/20 hover:scale-105 cursor-pointer shrink-0"
          >
            <span>Back To Top</span>
            <span className="text-emerald-500 font-bold">↑</span>
          </button>
        </div>
      </div>

      {/* ===================== Interactive Policy Modal Dialog ===================== */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl max-h-[88dvh] sm:max-h-[85vh] flex flex-col p-4 sm:p-6 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <DialogHeader className="shrink-0 text-left pr-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>NimsWallah Governance &amp; Statutory Compliance</span>
            </div>
            <DialogTitle className="font-display text-lg sm:text-xl font-bold text-foreground">
              {currentPolicy?.title ?? activeModal}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {currentPolicy?.subtitle || "Official Institutional Guidelines & Compliance Directives"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-3 text-xs leading-relaxed text-foreground/90 scrollbar-thin pr-1">
            {currentPolicy?.content.map((paragraph, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-surface/70 p-3 sm:p-3.5 shadow-2xs"
              >
                <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[0.65rem] font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="flex-1 text-foreground/90 leading-relaxed font-normal">{paragraph}</p>
              </div>
            ))}
          </div>

          <div className="shrink-0 mt-2 flex justify-end border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-deep cursor-pointer"
            >
              Understood &amp; Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
