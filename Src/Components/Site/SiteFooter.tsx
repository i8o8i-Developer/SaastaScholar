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
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/Hooks/UseAuth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/Ui/Dialog";
import { LegalComplianceHub } from "./LegalComplianceHub";
import { apiFetch } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

interface FooterLink {
  label: string;
  href?: string;
  tab?: string;
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
    accent: "bg-[#005F15]",
    accentGradient: "from-[#005F15] to-emerald-400",
    hoverColor: "hover:text-[#005F15] dark:hover:text-emerald-400",
    badgeStyle: "bg-[#005F15]/15 text-[#005F15] dark:text-emerald-400 border-[#005F15]/20",
    links: [
      { label: "Topper Handwritten Notes", tab: "notes", badge: "Core" },
      { label: "Solved PYQs (2020-2025)", tab: "pyqs", badge: "Verified" },
      { label: "Unit-Wise Formula Sheets", tab: "notes" },
      { label: "Official Syllabus Breakdown", tab: "syllabus" },
      { label: "Model Exam Answer Keys", tab: "pyqs" },
      { label: "Forensic DRM Document Viewer", tab: "notes", badge: "Secure" },
    ],
  },
  {
    title: "Labs & Practicals",
    accent: "bg-[#007EAC]",
    accentGradient: "from-[#007EAC] to-sky-400",
    hoverColor: "hover:text-[#007EAC] dark:hover:text-sky-400",
    badgeStyle: "bg-[#007EAC]/15 text-[#007EAC] dark:text-sky-400 border-[#007EAC]/20",
    links: [
      { label: "Lab Manuals & Procedures", tab: "labs" },
      { label: "Python, C++ & Java Codes", tab: "labs", badge: "Tested" },
      { label: "50+ Viva Voce Question Bank", tab: "labs" },
      { label: "Printable Record Templates", tab: "labs" },
      { label: "Experiment Observation Sheets", tab: "labs" },
    ],
  },
  {
    title: "Trust & Statutory Privacy",
    accent: "bg-[#005F15]",
    accentGradient: "from-[#005F15] to-emerald-400",
    hoverColor: "hover:text-[#005F15] dark:hover:text-emerald-400",
    badgeStyle: "bg-[#005F15]/15 text-[#005F15] dark:text-emerald-400 border-[#005F15]/20",
    links: [
      { label: "GDPR & DPDP Compliance Charter", modal: "gdpr-dpdp", badge: "Statutory" },
      { label: "Cookie & Session Telemetry", modal: "cookie-telemetry", badge: "EPrivacy" },
      { label: "Marketing Consent Policy", modal: "marketing-consent" },
      { label: "Data Deletion (Right To Erasure)", modal: "data-deletion", badge: "72h SLA" },
      { label: "Data Retention & Archival Matrix", modal: "data-retention" },
      { label: "Data Processing Agreement (DPA)", modal: "dpa" },
    ],
  },
  {
    title: "Commerce & Legal Rights",
    accent: "bg-[#BA0000]",
    accentGradient: "from-[#BA0000] via-amber-500 to-[#005F15]",
    hoverColor: "hover:text-[#BA0000] dark:hover:text-rose-400",
    badgeStyle: "bg-[#BA0000]/15 text-[#BA0000] dark:text-rose-400 border-[#BA0000]/20",
    links: [
      { label: "Sub-Processors & Disclosures", modal: "third-party" },
      { label: "Trademark & Intellectual Property", modal: "ip-policy" },
      { label: "Payment & Subscription Terms", modal: "payment-terms" },
      { label: "Refund Policy (Settlement Window)", modal: "refund-policy", badge: "Policy" },
      { label: "Cancellation & Downgrade Policy", modal: "cancellation-policy" },
    ],
  },
];

const POLICY_DETAILS: Record<string, { title: string; subtitle: string; content: string[] }> = {
  "Legal Disclaimer": {
    title: "University Non-Affiliation & Statutory Fair Use Legal Disclaimer",
    subtitle: "Statutory Educational Fair Dealing Declaration Under Section 52(1)(a) Of The Copyright Act, 1957 & Section 30(2)(d) Of The Trade Marks Act, 1999",
    content: [
      "Statutory University Non-Affiliation Declaration (Consumer Protection Act, 2019): SaastaScholar Is An Independent, Student-Led Educational Resource Platform Owned, Engineered, And Maintained By DurgaAI Solutions. SaastaScholar Is Not Officially Affiliated With, Endorsed By, Sponsored By, Or In Any Manner Connected To NIMS University Rajasthan Or Any Statutory University Governing Body.",
      "Educational Fair Dealing Exemption (Section 52(1)(a)(i) Of The Copyright Act, 1957): All Syllabus Breakdowns, Handwritten Student Lecture Summaries, Formula Compendiums, Previous Year Question Archives, And Academic Revision Guides Hosted Across This Platform Are Shared Exclusively Under The Statutory 'Fair Dealing' Doctrine For Non-Commercial Private Study, Scholarly Research, Review, And Student Examination Preparation.",
      "Instructional Reproduction Defense (Section 52(1)(h) & Section 52(1)(i) Of The Copyright Act, 1957): The Reproduction, Synthesis, And Conceptual Elaboration Of Syllabus Topics And Past Examination Prompts Are Conducted Strictly In The Course Of Academic Instruction And For Answering University Examination Questions Without Commercial Exploitation.",
      "Nominative Trademark Fair Use (Section 30(2)(d) Of The Trade Marks Act, 1999): Institutional Names, Degree Designations (E.g., B.Tech, BCA, MCA, B.Pharm, M.Pharm, MBA), Department Codes, And Course Syllabus Numbers Mentioned On SaastaScholar Belong Solely To Their Respective Trademark Proprietors. Their Use On This Platform Is Strictly Nominative, Descriptive, And Essential For Curricular Cataloging.",
      "Intermediary Safe Harbour Protection (Section 79 Of The Information Technology Act, 2000 & IT Intermediary Rules, 2021): SaastaScholar Operates Strictly As A Neutral Educational Technology Intermediary Providing Automated Forensic DRM Vault Hosting For User-Contributed Study Notes.",
    ],
  },
  "Trademark & IP Policy": {
    title: "Trademark Ownership, Brand Rights & Intellectual Property Notice",
    subtitle: "Protected Under The Trade Marks Act, 1999 & The Copyright Act, 1957 | Proprietary Asset Of DurgaAI Solutions",
    content: [
      "Proprietary Brand & Trademark Ownership (Section 28 & 29 Of The Trade Marks Act, 1999): 'SaastaScholar', The SaastaScholar Emblem Insignia, The Official Color Palette (#005F15 Forest Green, #007EAC Ocean Blue, #BA0000 Crimson Red), Typography, And Product Design Tokens Are Proprietary Trademarks And Intellectual Property Wholly Owned By DurgaAI Solutions. Unauthorized Commercial Reproduction, Counterfeit Mirroring, Brand Imitation, Passing Off, Or Domain Spoofing Is Strictly Prohibited And Subject To Immediate Civil And Criminal Litigation Under Applicable Intellectual Property Laws.",
      "Proprietary Software Architecture & Code Rights: All Application Source Code, Dynamic In-Memory DRM Canvas Rendering Mechanisms, Real-Time IST Schedule Planners, Exam Archive Indexing Systems, And User Interfaces Are Original Copyrighted Software Works Owned Exclusively By DurgaAI Solutions Under The Copyright Act, 1957. Reverse Engineering, Decompilation, Or Unauthorized Scraper Harvesting Is Strictly Forbidden.",
      "Nominative Trademark Fair Use Doctrine (Section 30(2)(d) Of The Trade Marks Act, 1999): Institutional Names, University Titles, And Degree Acronyms Are Referenced Strictly Under The Statutory Nominative Fair Use Doctrine To Facilitate Departmental Courseware Cataloging. Such References Do Not Imply Any Corporate Affiliation, University Sponsorship, Or Institutional Endorsement.",
      "Brand Protection & Anti-Counterfeiting Enforcement: DurgaAI Solutions Proactively Monitors Digital Channels And Enforces Rapid Takedowns Against Cloned Portals, Counterfeit Web Applications, Or Unauthorized Distributed Content Archives.",
      "Designated Intellectual Property Contact: Formal Inquiries Regarding Trademark Licensing, Institutional Partnerships, Or Corporate Rights Verification Should Be Directed To DurgaAI Solutions Legal Division At legal@durgaaisolutions.in Or trademarks@saastascholar.in.",
    ],
  },
  "Privacy Policy": {
    title: "Student Privacy Policy & Digital Personal Data Charter",
    subtitle: "Fully Compliant With Digital Personal Data Protection Act, 2023 (DPDP Act, 2023) & IT SPDI Rules, 2011 | DurgaAI Solutions Privacy Pledge",
    content: [
      "Lawful Data Collection & Purpose Limitation (Digital Personal Data Protection Act, 2023 - DPDP Act 2023): We Collect Only Necessary Student Verification Data (Full Name, University Roll Number, Academic Department, Specialization Program, Semester, Section, And Institutional Email) Solely For Workspace Provisioning, Academic Progress Tracking, And Anti-Piracy DRM Protection.",
      "Absolute Non-Commercialization Guarantee: SaastaScholar And DurgaAI Solutions Uphold A Zero-Monetization Privacy Pledge. We Strictly Forbid Selling, Licensing, Renting, Or Disclosing Student Personal Data, Identity Credentials, Or Reading Telemetry To Any External Advertising Networks, Recruiters, Or Commercial Data Brokers.",
      "Forensic Session Watermarking For Academic Integrity: In Accordance With Section 65B Of The Indian Evidence Act, 1872 & Bharatiya Sakshya Adhiniyam, 2023, Reader Sessions Feature Dynamic, Cryptographically Hashed Visual Proof (Name, Roll Number, Timestamp, And Client IP Hash) Exclusively To Deter Commercial Book Piracy And Unauthorized Redistribution.",
      "Cryptographic Security & Transport Encryption (Section 43A IT Act, 2000): Student Credentials Are Hash-Protected Using State-Of-The-Art Argon2 And PBKDF2 SHA-256 Algorithms. All Communications Are Enforced With TLS 1.3 Encryption And Strict HTTP Transport Security (HSTS).",
      "Statutory Data Principal Rights (Section 11, 12 & 13 Of DPDP Act, 2023): Every Registered Student Enjoys Absolute Statutory Rights To: (1) Access A Summary Of Personal Data, (2) Correct And Update Academic Details, (3) Request Permanent Erasure Of Account And Uploaded Materials, And (4) Nominate Another Individual In Case Of Incapacity, Via privacy@saastascholar.in.",
      "Statutory Grievance Redressal Mechanism (Rule 3(2) IT Intermediary Rules, 2021): Contact Our Designated Grievance Officer At grievance@saastascholar.in And support@durgaai.com. We Guarantee Official Acknowledgment Within 24 Hours And Expedited Resolution Within 15 Days.",
    ],
  },
  "Terms Of Service": {
    title: "Terms Of Service & Academic User Agreement",
    subtitle: "Legally Binding User Agreement Governing Platform Usage, Content Ownership, And Forensic DRM Safeguards Under Indian Law",
    content: [
      "Legally Enforceable Electronic Agreement (Section 10A Of The Information Technology Act, 2000 & Indian Contract Act, 1872): Creating An Account Or Accessing Courseware Establishes A Valid, Binding Electronic Contract Between The Enrolled Student And SaastaScholar Governance.",
      "Single-Scholar Non-Commercial Educational License (Section 14 & Section 51 Of The Copyright Act, 1957): Access To Platform Courseware Is Granted Exclusively Under A Limited, Revocable, Personal, Non-Transferable Educational License Solely For Private Study. Reselling, Mass Downloading, Automated Scraping, Or Group Account Sharing Is Strictly Prohibited.",
      "Forensic DRM Anti-Circumvention Covenant (Section 65A & Section 65B Of The Copyright Act, 1957): Users Strictly Covenant Not To Bypass, Disable, Decompile, Intercept, Screen-Capture, Or Circumvent Any Forensic Watermarks Or Technical Safeguards. Violations Trigger Immediate Account Termination And Civil Liability Under Applicable Copyright Laws.",
      "Uploader Warranty & Originality Declaration (Section 57 Of The Copyright Act, 1957): Any Scholar Or Faculty Contributor Publishing Study Guides Warrants That They Hold Lawful Intellectual Authority Over The Content And That It Contains No Plagiarized Material Or Confidentially Protected Institutional Data.",
      "Academic Disclaimer & Absence Of Grade Warranty: SaastaScholar Educational Modules, PYQ Solutions, And AI Tools Are Conceptual Revision Aids. The Platform Explicitly Disclaims Any Guarantee Regarding Specific Institutional Exam Questions Or Final Grade Outcomes.",
      "Dispute Resolution, Arbitration & Exclusive Jurisdiction: Any Legal Claim Or Dispute Arising Under These Terms Shall Be Resolved In Accordance With The Arbitration And Conciliation Act, 1996, With Exclusive Territorial Jurisdiction Vested In Jaipur, Rajasthan, India.",
    ],
  },
  "DMCA & Copyright Policy": {
    title: "DMCA & Statutory Copyright Infringement Takedown Policy",
    subtitle: "Notice-And-Takedown Protocol Under Rule 3(1)(d) Of IT Intermediary Rules, 2021 & Section 52(1)(c) Of The Copyright Act, 1957",
    content: [
      "Statutory Takedown Notice Framework (Rule 3(1)(d) Of Information Technology Intermediary Guidelines Rules, 2021 & Section 52(1)(c) Of Copyright Act, 1957): SaastaScholar Respects Intellectual Property Rights And Maintains A 24-To-36-Hour Notice-And-Takedown Mechanism For Copyright Holders.",
      "Formal Infringement Notice Mandate: To File A Valid Copyright Complaint, Rights Holders Must Send A Verified Written Notice To legal@saastascholar.in Containing: (1) Exact Identification Of The Copyrighted Work, (2) Direct URL Or Material Identifier, (3) Proof Of Legal Authority Or Copyright Ownership, And (4) Statement Of Good Faith Belief Under Penalty Of Perjury.",
      "Expedited Interim Access Restriction (24-Hour Protocol): Upon Receipt Of A Bona Fide Infringement Notice, Our Legal Compliance Desk Immediately Restricts Public Access To The Challenged URL Within 24 Hours Pending Formal Verification.",
      "Counter-Notification & Due Process: Contributors Facing An Unjust Copyright Claim May Submit A Sworn Counter-Notification Demonstrating Original Authorship Or Fair Dealing Under Section 52(1)(a) Of The Copyright Act, 1957.",
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
  "Cookie Preferences": {
    title: "Cookie & Session Telemetry Policy",
    subtitle: "Essential Session Authentication Tokens Only | Zero Cross-Site Behavioral Tracking",
    content: [
      "Strictly Essential Authentication Tokens Only: SaastaScholar Deploys Only Cryptographically Signed, HTTP-Only Session Cookies Necessary To Maintain Scholar Login Authentication, CSRF Security, And Workspace Preferences.",
      "Zero Behavioral Tracking Pixels: We Do Not Employ Any Third-Party Cross-Site Marketing Cookies, Fingerprinting Telemetry, Or Invasive Tracking Beacons.",
      "Client-Side Privacy Controls: Scholars May Reset Or Purge Stored Session Preferences At Any Time Through Standard Browser Storage Controls Or By Logging Out Of The Academic Workspace.",
    ],
  },
};


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
  const { user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [programsList, setProgramsList] = useState<{ id?: string; name: string; code?: string; hover: string }[]>([]);

  useEffect(() => {
    let active = true;
    const loadRealProgramsFromDb = async () => {
      try {
        const [progsRes, deptsRes] = await Promise.allSettled([
          apiFetch<any>("/academic/programs/"),
          apiFetch<any>("/academic/departments/"),
        ]);

        const rawProgs =
          progsRes.status === "fulfilled"
            ? Array.isArray(progsRes.value)
              ? progsRes.value
              : progsRes.value?.results || []
            : [];

        const rawDepts =
          deptsRes.status === "fulfilled"
            ? Array.isArray(deptsRes.value)
              ? deptsRes.value
              : deptsRes.value?.results || []
            : [];

        const hoverColors = [
          "hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/10",
          "hover:border-cyan-500/50 hover:text-cyan-500 hover:bg-cyan-500/10",
          "hover:border-indigo-500/50 hover:text-indigo-500 hover:bg-indigo-500/10",
          "hover:border-purple-500/50 hover:text-purple-500 hover:bg-purple-500/10",
          "hover:border-pink-500/50 hover:text-pink-500 hover:bg-pink-500/10",
          "hover:border-teal-500/50 hover:text-teal-500 hover:bg-teal-500/10",
          "hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/10",
          "hover:border-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10",
          "hover:border-orange-500/50 hover:text-orange-500 hover:bg-orange-500/10",
          "hover:border-violet-500/50 hover:text-violet-500 hover:bg-violet-500/10",
        ];

        if (active) {
          if (rawProgs.length > 0) {
            setProgramsList(
              rawProgs.map((p: any, idx: number) => ({
                id: p.id,
                name: p.name,
                code: p.code,
                hover: hoverColors[idx % hoverColors.length],
              }))
            );
          } else if (rawDepts.length > 0) {
            setProgramsList(
              rawDepts.map((d: any, idx: number) => ({
                id: d.id,
                name: d.name,
                code: d.code,
                hover: hoverColors[idx % hoverColors.length],
              }))
            );
          } else {
            setProgramsList([]);
          }
        }
      } catch {
        if (active) {
          setProgramsList([]);
        }
      }
    };

    loadRealProgramsFromDb();
    return () => {
      active = false;
    };
  }, []);

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
      {/* ===================== Top Logo Triad Gradient Edge Bar ===================== */}
      <div className="h-[3.5px] w-full bg-gradient-to-r from-[#005F15] via-[#007EAC] to-[#BA0000] shadow-[0_0_16px_rgba(0,126,172,0.35)]" />

      {/* Multi-Color Ambient Mesh Glows Matched to Logo Triad */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-1/4 -z-10 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#005F15]/15 via-[#007EAC]/10 to-[#BA0000]/10 blur-[140px] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 right-1/4 -z-10 h-[30rem] w-[40rem] translate-x-1/2 rounded-full bg-gradient-to-bl from-[#007EAC]/15 via-[#BA0000]/10 to-[#005F15]/10 blur-[140px] opacity-70"
      />

      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-[0.04]"
      />

      <div className="relative mx-auto w-full max-w-[84rem] px-2.5 min-[340px]:px-3.5 pt-10 pb-8 sm:px-8 sm:pt-16 sm:pb-12 min-w-0">
        {/* ===================== Top Newsletter Card (Clean Original Palette) ===================== */}
        <div className="mb-12 sm:mb-16 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card/80 p-3.5 sm:p-10 shadow-[0_12px_40px_-20px_color-mix(in_oklab,var(--color-primary-deep)_25%,transparent)] backdrop-blur-sm min-w-0">
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
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Student Study Workspace
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Flame className="h-3.5 w-3.5 text-highlight shrink-0" /> University Syllabus Aligned
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
                        <span>Subscribe</span>
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
                src="/SaastaScholar.png"
                alt="SaastaScholar Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-xl p-0.5 bg-white border border-border/60 shadow-xs transition-transform group-hover:scale-105"
              />
              <div>
                <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-logo-gradient">
                  SaastaScholar
                </span>
                <span className="block text-[0.65rem] sm:text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">
                  Academic Command Center
                </span>
              </div>
            </a>

            <p className="mt-3.5 max-w-sm text-xs sm:text-sm leading-relaxed text-muted-foreground break-words">
              Empowering University Scholars To Streamline Courses, Organize Practicals, Master
              Assignments, And Track Target CGPAs - All In One Unified, Distraction-Free Platform.
            </p>


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
                  {col.links.map((link) => {
                    const destinationHref = link.tab
                      ? (isAuthenticated ? `/dashboard?tab=${link.tab}` : `/login?mode=signup&tab=${link.tab}`)
                      : (link.href === "/login?mode=admin"
                          ? (isAuthenticated && (user?.is_staff || user?.is_superuser || user?.email === "admin@nims.edu.in") ? "/admin" : "/login?mode=admin")
                          : (link.href === "#faq" ? "/#faq" : (link.href || "#")));

                    return (
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
                            href={destinationHref}
                            onClick={(e) => {
                              if (link.href === "#faq") {
                                if (window.location.pathname === "/") {
                                  e.preventDefault();
                                  const target = document.getElementById("faq");
                                  if (target) {
                                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                                    window.history.pushState(null, "", "#faq");
                                  }
                                }
                              }
                            }}
                            className={cn(
                              "group inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground transition-colors break-words max-w-full cursor-pointer",
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
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ===================== Department Badges with Rainbow Hover (Real Database Programs Only) ===================== */}
        {programsList.length > 0 && (
          <div className="mt-10 sm:mt-14 border-t border-border/80 pt-6 sm:pt-8 min-w-0">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between min-w-0">
              <div className="flex items-center gap-2 text-[0.7rem] sm:text-xs font-bold text-foreground uppercase tracking-wider shrink-0">
                <div className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <GraduationCap className="h-3 w-3 shrink-0" />
                </div>
                <span>Supported Programs:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {programsList.map((prog, idx) => (
                  <a
                    key={prog.name + idx}
                    href={`/login?mode=signup&program=${encodeURIComponent(prog.code || prog.name)}`}
                    className={cn(
                      "rounded-lg border border-border/70 bg-card/70 px-2.5 py-1 text-[0.65rem] sm:text-xs font-medium text-muted-foreground transition-all duration-200 shadow-2xs backdrop-blur-xs hover:scale-105 cursor-pointer flex items-center gap-1.5",
                      prog.hover,
                    )}
                    title={`Enroll In ${prog.name}`}
                  >
                    <span>{prog.name}</span>
                    {prog.code && (
                      <span className="font-mono text-[0.6rem] font-bold opacity-75">
                        ({prog.code})
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== Bottom Copyright & Back-to-Top ===================== */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80 pt-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-muted-foreground min-w-0 text-center sm:text-left flex-wrap">
            <p className="break-words font-medium">
              © {new Date().getFullYear()} <strong className="text-foreground">SaastaScholar™</strong>. All Rights Reserved.
            </p>
            <span className="hidden text-muted-foreground/40 sm:inline">|</span>
            <p className="inline-flex items-center gap-1">
              <span>A</span>
              <strong className="text-foreground font-semibold">DurgaAI Solutions</strong>
              <span>Academic Platform</span>
            </p>
            <span className="hidden text-muted-foreground/40 sm:inline">|</span>
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => setActiveModal("gdpr-dpdp")}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                GDPR &amp; Privacy
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setActiveModal("refund-policy")}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Refund Policy
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setActiveModal("data-deletion")}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Data Deletion
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open_cookie_preferences"))}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Cookies
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setActiveModal("dpa")}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                DPA Terms
              </button>
            </div>
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

        {/* ===================== Massive Watermark Brand Typography & Initiative Attribution (Guaranteed 1 Line) ===================== */}
        <div className="mt-14 sm:mt-20 border-t border-border/50 pt-8 sm:pt-10 pb-4 overflow-hidden select-none">
          <div className="w-full overflow-hidden">
            <h2 className="font-display font-black text-[clamp(2.1rem,7.8vw,9.5rem)] whitespace-nowrap tracking-tight uppercase leading-none text-foreground/[0.08] dark:text-foreground/[0.06] hover:text-emerald-500/20 transition-colors duration-500 select-none block w-full text-center sm:text-left">
              SAASTASCHOLAR
            </h2>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="tracking-wide">An <strong className="text-foreground font-semibold">Durgaai Solutions</strong> Initiative</span>
          </div>
        </div>
      </div>

      {/* ===================== Comprehensive Legal, GDPR & Compliance Hub ===================== */}
      <LegalComplianceHub
        open={!!activeModal}
        onOpenChange={(open) => !open && setActiveModal(null)}
        initialPolicyId={activeModal || "gdpr-dpdp"}
      />
    </footer>
  );
}
