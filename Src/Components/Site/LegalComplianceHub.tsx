import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/Ui/Dialog";
import {
  ShieldCheck,
  Lock,
  FileText,
  Trash2,
  Clock,
  Building2,
  Server,
  Award,
  CreditCard,
  RotateCcw,
  Ban,
  CheckCircle2,
  Mail,
  Search,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/Lib/Utils";

// Policy Document Interface Definition In Title Case
export interface PolicyDocument {
  id: string;
  category: "privacy" | "legal" | "commerce" | "data";
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  sections: { heading: string; body: string }[];
}

// Master Legal Policies Registry In Strict Title Case
export const LEGAL_POLICIES: PolicyDocument[] = [
  {
    id: "gdpr-dpdp",
    category: "privacy",
    title: "GDPR & DPDP Act Data Protection Charter",
    subtitle: "Comprehensive Compliance Under EU/UK GDPR (Regulation 2016/679) & India Digital Personal Data Protection Act, 2023",
    badge: "Statutory Privacy",
    icon: ShieldCheck,
    sections: [
      {
        heading: "1. Lawful Basis For Processing (GDPR Article 6 & DPDP Act Section 4)",
        body: "SaastaScholar Processes Student Personal Data Strictly Under Lawful Grounds: (A) Performance Of Contract: Providing Educational Workspace Features, Personalized Syllabus Tracking, And Courseware Delivery; (B) Legitimate Interests: Protecting Academic Copyright Via Anti-Piracy Forensic DRM Watermarking; (C) Compliance With Statutory Legal Obligations: Maintaining GST Tax Invoicing And CERT-In Cybersecurity Logs; (D) Explicit Consent: For Optional Semester Notifications And Announcement Emails.",
      },
      {
        heading: "2. Fundamental Data Subject Rights (GDPR Articles 15-22 & DPDP Act Sections 11-13)",
        body: "Scholars Have Guaranteed Legal Rights: (1) Right Of Access: Obtain Confirmation And A Downloadable Summary Of Personal Data Held; (2) Right To Rectification: Correct Inaccurate University Credentials; (3) Right To Erasure ('Right To Be Forgotten'): Request Complete Deletion Of Their Account And Associated Metadata; (4) Right To Data Portability: Export Personal Study Progress In Structured JSON Format; (5) Right To Restriction Of Processing; (6) Right To Object To Automated Decision-Making. Exercise These Rights By Emailing privacy@saastascholar.in.",
      },
      {
        heading: "3. International Data Transfers & Standard Contractual Clauses (SCCs)",
        body: "All Student Databases And DRM Vaults Are Hosted In High-Security, ISO/IEC 27001-Certified Data Centers With Automated Encryption At Rest (AES-256) And In Transit (TLS 1.3). Cross-Border Data Transfers Comply With EU Standard Contractual Clauses And DPDP Cross-Border Transfer Directives.",
      },
      {
        heading: "4. Data Protection Officer (DPO) & Supervisory Authority Escalation",
        body: "Our Designated Data Protection Officer Oversees Compliance And Can Be Contacted Directly At dpo@saastascholar.in Or legal@durgaaisolutions.in. In Case Of Unresolved Concerns, EU Residents May Lodge A Complaint With Their Local Data Protection Authority, And Indian Scholars With The Data Protection Board Of India.",
      },
    ],
  },
  {
    id: "cookie-telemetry",
    category: "privacy",
    title: "Cookie Consent & Session Telemetry Policy",
    subtitle: "Transparent Classification Under EPrivacy Directive (Directive 2002/58/EC) & DPDP SPDI Rules",
    badge: "EPrivacy Compliant",
    icon: Lock,
    sections: [
      {
        heading: "1. Strictly Necessary Cookies (Essential)",
        body: "These Cookies Are Cryptographically Signed And Essential To Navigate The Platform And Use Secure Features: (A) access_token & refresh_token: JWT Session Authentication; (B) csrftoken: Cross-Site Request Forgery Prevention; (C) drm_session_token: Short-Lived In-Memory Authorization For Canvas Document Reading. These Cannot Be Disabled.",
      },
      {
        heading: "2. Performance & Observability Telemetry (Optional / Toggleable)",
        body: "We Deploy Anonymized OpenTelemetry Agents (SigNoz) To Track API Response Latency, Document Rendering Performance, And HTTP Error Codes. This Telemetry Contains Zero Personal Identifiers Or Academic Reading Tracking And Is Used Solely To Maintain Platform 99.9% Uptime.",
      },
      {
        heading: "3. Zero Third-Party Advertising Pixels",
        body: "SaastaScholar And DurgaAI Solutions Maintain A Strict Zero-Ad Commitment. We NEVER Install Facebook Pixel, Google Ads Remarketing Beacons, Or Cross-Site Tracking Cookies. Your Educational Reading Habits Are Completely Private.",
      },
      {
        heading: "4. Cookie Control & Revocation",
        body: "Students Can Update Their Consent Preferences At Any Time By Clicking 'Cookie & Session Telemetry' In The Footer Or By Dispatching A Custom Browser Reset.",
      },
    ],
  },
  {
    id: "marketing-consent",
    category: "privacy",
    title: "Marketing Consent & Communication Policy",
    subtitle: "Clear Opt-In Protocol Under Indian TRAI UCC Regulations & CAN-SPAM Act",
    badge: "Zero Spam Pledge",
    icon: Mail,
    sections: [
      {
        heading: "1. Explicit Opt-In Protocol",
        body: "We Only Send Non-Essential Communications (Such As New Semester Study Packs, Exam Countdown Alerts, Or Coupon Discounts) If A Student Explicitly Opts In During Registration Or Via Profile Settings. Transactional Emails (Password Resets, Payment Receipts, Security Alerts) Are Exempt As They Are Essential To Account Security.",
      },
      {
        heading: "2. Zero Commercial Spam & Robocalls Guarantee",
        body: "SaastaScholar Will Never Call Your Phone Number Or Send Automated WhatsApp/SMS Spam For Promotional Purposes. Registered Phone Numbers Are Strictly Utilized For Two-Factor Authentication Recovery And Administrative Security Validation.",
      },
      {
        heading: "3. Immediate Unsubscribe Mechanism",
        body: "Every Promotional Email Contains A Verified, Single-Click Unsubscribe Link At The Bottom. Requests To Opt Out Of Marketing Communications Are Processed Instantly And Finalized Within 24 Hours.",
      },
    ],
  },
  {
    id: "data-deletion",
    category: "data",
    title: "Data Deletion & Right To Erasure Policy",
    subtitle: "Self-Serve & Administrative Account Purge Guarantee Under DPDP Act Section 12(3)",
    badge: "72-Hour Erasure",
    icon: Trash2,
    sections: [
      {
        heading: "1. The Right To Be Forgotten",
        body: "Any Registered Scholar Has The Absolute Statutory Right To Request Permanent Deletion Of Their Account, Study History, Academic Notes Uploads, And Personal Credentials From SaastaScholar Servers.",
      },
      {
        heading: "2. Deletion Request Procedure",
        body: "To Initiate Permanent Account Erasure: (A) Send An Email From Your Registered Address To privacy@saastascholar.in With The Subject Line 'Permanent Account Deletion Request'; OR (B) Open A Support Ticket In Your Student Dashboard Selecting 'Data Deletion / Account Termination'.",
      },
      {
        heading: "3. Execution Timeline & Verification",
        body: "Our Security Team Verifies Identity Within 24 Hours. Upon Verification, All Relational Records In PostgreSQL, Cached Sessions In Redis, And DRM Token History Are Permanently Purged Using Cryptographic Wiping Within 72 Hours.",
      },
      {
        heading: "4. Statutory Invoicing Retention Exception",
        body: "Pursuant To Section 44 Of The Goods And Services Tax (GST) Act, 2017 And Indian Income Tax Regulations, Financial Payment Order Invoices (Invoice Number, Transaction ID, Billing Name) Are Legally Retained For 7 Years Solely For Tax Audit Compliance And Cannot Be Expunged.",
      },
    ],
  },
  {
    id: "data-retention",
    category: "data",
    title: "Data Retention & Archival Schedule",
    subtitle: "Data Lifecycle Matrix Under ISO/IEC 27001 & CERT-In Cyber Security Directives",
    badge: "Audited Schedules",
    icon: Clock,
    sections: [
      {
        heading: "1. Active Student Account Records",
        body: "Retained For The Active Duration Of The Student's University Courseware Enrollment, Plus An Automatic 180-Day Grace Period Post-Graduation To Allow Export Of Student Files.",
      },
      {
        heading: "2. DRM Session Tokens & Ephemeral Viewport Proofs",
        body: "In-Memory Forensic Watermark Tokens And Viewport Authorization Sessions Expire Within 1 Hour And Are Completely Purged From Redis Cache Within 30 Days.",
      },
      {
        heading: "3. Security Audit & Incident Logs",
        body: "In Strict Accordance With The Directions Of The Indian Computer Emergency Response Team (CERT-In) Under Section 70B Of The IT Act, 2000, Cybersecurity Access And Intrusion Detection Logs Are Securely Retained For Exactly 180 Days Before Automated Rotation.",
      },
      {
        heading: "4. Inactive Account Decommissioning",
        body: "Accounts With Zero Login Activity For 24 Consecutive Months Are Scheduled For Automated Decommissioning. A 30-Day Prior Notification Is Emailed To Give The Scholar Opportunity To Retain Or Backup Their Notes.",
      },
    ],
  },
  {
    id: "dpa",
    category: "legal",
    title: "Data Processing Agreement (DPA)",
    subtitle: "Contractual Terms For Institutional Partners, Faculty & Independent Learners",
    badge: "B2B / B2C Legal",
    icon: FileText,
    sections: [
      {
        heading: "1. Scope & Roles Of Parties",
        body: "This Data Processing Agreement Governs The Processing Of Personal Data Provided By Educational Institutions, Faculty Contributors, And Scholars. DurgaAI Solutions Acts As The Data Processor, And The Individual Learner Or Partner Institution Acts As The Data Controller.",
      },
      {
        heading: "2. Technical & Organizational Measures (TOMs)",
        body: "The Processor Implements High-Standard Security Controls: (A) AES-256 Database Storage Encryption; (B) Argon2 And PBKDF2 Password Hashing; (C) TLS 1.3 Encrypted Data In Transit; (D) Linux Container Process Sandboxing; (E) Multi-Factor Administrative Security Barriers.",
      },
      {
        heading: "3. Sub-Processor Authorization",
        body: "The Controller Grants General Written Authorization To Engage Verified Infrastructure Sub-Processors (Razorpay For Payments, SigNoz For Telemetry, Google Cloud/Hetzner For Compute), Each Bound By Equivalent Data Protection Covenants.",
      },
      {
        heading: "4. Security Breach Notification Protocol",
        body: "In The Event Of A Confirmed Personal Data Breach, The Processor Shall Notify The Affected Controller And Regulatory Authorities Within 72 Hours Of Becoming Aware Of The Incident, Providing Full Remediation Reports.",
      },
    ],
  },
  {
    id: "third-party",
    category: "data",
    title: "Third-Party Disclosures & Sub-Processors Registry",
    subtitle: "Full Public Registry Of External Cloud Infrastructure & API Service Providers",
    badge: "100% Transparent",
    icon: Server,
    sections: [
      {
        heading: "1. Razorpay Software Private Limited (India)",
        body: "Role: Payment Gateway & UPI Processing. Personal Data Disclosed: Billing Name, Email, Phone, Order Amount. Compliance: RBI Authorized Payment Aggregator, PCI-DSS Level 1 Certified.",
      },
      {
        heading: "2. SigNoz OpenTelemetry Observability (Self-Hosted / Cloud)",
        body: "Role: Application Performance Monitoring (APM) & Server Health. Data Disclosed: Anonymized HTTP Latency, Error Codes, Client IP Hash. Zero Sensitive Student Notes Or Credentials Are Transmitted.",
      },
      {
        heading: "3. Google Cloud / Hetzner Cloud Infrastructure",
        body: "Role: Containerized Server Compute, Persistent Volumes & Automated Backups. Data Stored: Encrypted PostgreSQL Database, DRM Vault, And Static Frontend Bundles. Location: High-Availability Tier-3 Data Centers.",
      },
      {
        heading: "4. Google Workspace / Gmail SMTP Relay",
        body: "Role: Transactional Email Gateway. Data Disclosed: Recipient Email, Scholar Name, Password Reset Tokens, Payment Confirmations. Enforced Via TLS 1.3 Transport Encryption.",
      },
    ],
  },
  {
    id: "ip-policy",
    category: "legal",
    title: "Intellectual Property & Academic Fair Dealing Declaration",
    subtitle: "Statutory Educational Fair Dealing Under Section 52(1)(a) Of Copyright Act, 1957 & Section 30(2)(d) Of Trade Marks Act, 1999",
    badge: "Fair Dealing",
    icon: Award,
    sections: [
      {
        heading: "1. Educational Fair Dealing Exemption (Section 52(1)(a) Copyright Act, 1957)",
        body: "All Syllabus Breakdowns, Handwritten Student Lecture Notes, Unit Formula Cheat Sheets, Past Examination Question Compilations, And Model Answer Keys Accessible On SaastaScholar Are Created, Curated, And Shared Strictly For Non-Commercial Private Study, Scholarship, Review, And Academic Examination Preparation.",
      },
      {
        heading: "2. Proprietary Software Rights Of DurgaAI Solutions",
        body: "'SaastaScholar', The Brand Emblem, Color Design System (#005F15 Forest Green), In-Memory Forensic DRM Canvas Rendering Technology, And Application Source Code Are Original Copyrighted Works Owned Exclusively By DurgaAI Solutions. Unauthorized Cloning, Reverse Engineering, Or Commercial Scraping Is Strictly Prohibited.",
      },
      {
        heading: "3. Nominative Trademark Fair Use Doctrine (Section 30(2)(d) Trade Marks Act, 1999)",
        body: "University Titles, Departmental Acronyms, Course Codes, And Degree Designations (E.g. B.Tech, BCA, MCA, B.Pharm) Are Referenced Solely Under The Statutory Nominative Fair Use Doctrine To Identify Curricular Subject Matter. Such Descriptive References Do Not Imply Any University Endorsement Or Corporate Affiliation.",
      },
    ],
  },
  {
    id: "payment-terms",
    category: "commerce",
    title: "Payment & Subscription Terms",
    subtitle: "Clear 4-Tier Membership Structure, Invoicing, And Pricing Policy",
    badge: "Transparent Billing",
    icon: CreditCard,
    sections: [
      {
        heading: "1. Membership Tiers & Inclusions",
        body: "SaastaScholar Offers 4 Distinct Membership Options: (1) Free (INR 0): Syllabus, Timetable, Course Materials, Notices, Exam Dates; (2) Basic (INR 99/Mo, INR 499/Sem): Free Features + Handwritten Notes; (3) Premium (INR 129/Mo, INR 649/Sem): Basic + Handwritten Lab Manuals, Viva Practice + Solved PYQs; (4) Elite (INR 159/Mo, INR 799/Sem): Premium + Most Expected Question Papers + Practice Mocks.",
      },
      {
        heading: "2. Instant Account Activation",
        body: "Upon Successful Payment Verification Via Razorpay, Your Account Is Immediately Upgraded To The Chosen Membership Tier Without Requiring Logout Or Page Reload.",
      },
      {
        heading: "3. Formal GST Tax Invoicing",
        body: "Every Paid Order Automatically Generates A Verifiable, Unique Tax Invoice (E.g. INV-2026-XXXXXXXX) With Complete Billing Breakdown, Available For Instant Preview And Print In Your Student Dashboard And Admin Portal.",
      },
      {
        heading: "4. No Post-Purchase Refunds Policy",
        body: "Once A Subscription Payment Is Made And Premium Courseware Access Is Unlocked, All Transactions Are Strictly Final And Non-Refundable, Including Following Account Cancellation.",
      },
    ],
  },
  {
    id: "refund-policy",
    category: "commerce",
    title: "Refund Policy & Dispute Resolution",
    subtitle: "Commercial Settlement Period Protocol & Major Issue Redressal By DurgaAI Solutions",
    badge: "Settlement Protocol",
    icon: RotateCcw,
    sections: [
      {
        heading: "1. Strict No-Refund Policy After Subscription Or Cancellation",
        body: "Once A Subscription Is Made, No Refund Is Provided Post-Purchase Or Following Plan Cancellation Under Normal Circumstances. Subscription Fees Cover Immediate In-Memory Provisioning And Forensic DRM Access To Proprietary Academic Notes, Lab Manuals, And Examination Archives.",
      },
      {
        heading: "2. Exceptional Major Issue Redressal Within Settlement Period",
        body: "In Any Case Where A Major Technical Issue Occurs, The Scholar Must Contact DurgaAI Solutions Directly (support@durgaai.com Or support@saastascholar.in) Promptly Within The Statutory Settlement Period (Within 72 Hours Of Order Completion). If The Issue Is Verified As Major, Originates From Platform Infrastructure Faults, And Directly Prevents Academic Usage, A Discretionary Refund Will Be Evaluated And Provided.",
      },
      {
        heading: "3. Contact & Review Procedure With DurgaAI Solutions",
        body: "To Initiate A Review Under The Settlement Window, Send A Detailed Notice To support@durgaai.com Including Your Registered Email, Razorpay Order ID, Invoice Number, And Verifiable Diagnostic Evidence Demonstrating The Major Technical Failure. Inquiries Outside The Settlement Period Or For Routine Cancellations Will Not Be Entertained.",
      },
      {
        heading: "4. Accidental Duplicate Transactions",
        body: "In The Event Of Accidental Duplicate Payments Caused By Banking Gateway Timeouts Or Multi-Clicks, The Unintended Duplicate Charge Is Automatically Verified And Reimbursed Back To The Original Source Account Within 5 To 7 Business Days.",
      },
    ],
  },
  {
    id: "cancellation-policy",
    category: "commerce",
    title: "Cancellation & Graceful Downgrade Policy",
    subtitle: "Zero Hidden Renewal Traps & Full Control Over Academic Subscriptions",
    badge: "No Auto-Debits",
    icon: Ban,
    sections: [
      {
        heading: "1. Plan Cancellation Without Post-Purchase Refund",
        body: "Scholars May Cancel Their Membership Plan At Any Point Through Their Student Dashboard. However, If A Subscription Is Made, No Refund Is Provided After Cancellation. Fees Paid For The Term Remain Non-Refundable Subject Only To The DurgaAI Solutions Settlement Period Exception For Major Verified Faults.",
      },
      {
        heading: "2. Access Retention Until Expiry Date",
        body: "If You Decide To Cancel Or Not Renew, Your Account Remains Fully Active With All Premium Study Features Until The Exact Second Your Purchased Plan Duration Expires.",
      },
      {
        heading: "3. Graceful Free Plan Downgrade",
        body: "After Expiry, Your Account Automatically Returns To The Free Plan. All Your Personal Progress, Timetable Bookmarks, And Submitted Assignments Are 100% Preserved. You Never Lose Your Academic Workspace.",
      },
      {
        heading: "4. No Recurring Surprise Auto-Debits",
        body: "SaastaScholar Does Not Lock Your Credit Card Or Bank Account Into Hidden Recurring Auto-Debits. When Your Monthly Or Semester Pass Reaches Its Validity Date, You Will Never Be Charged Automatically Without Your Explicit Checkout Approval.",
      },
    ],
  },
];

// Component Properties Interface
interface LegalComplianceHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPolicyId?: string;
}

// Master Compliance Hub Modal Component In Strict Title Case
export function LegalComplianceHub({
  open,
  onOpenChange,
  initialPolicyId = "gdpr-dpdp",
}: LegalComplianceHubProps) {
  const [selectedId, setSelectedId] = useState(initialPolicyId);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [mobileView, setMobileView] = useState<"list" | "reader">("reader");

  useEffect(() => {
    if (initialPolicyId) {
      setSelectedId(initialPolicyId);
      setMobileView("reader");
    }
  }, [initialPolicyId, open]);

  const activeDoc: PolicyDocument =
    LEGAL_POLICIES.find((p) => p.id === selectedId) || LEGAL_POLICIES[0]!;

  const filteredPolicies = LEGAL_POLICIES.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sections.some(
        (s) =>
          s.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[96vw] sm:w-full p-0 overflow-hidden bg-[#040806] border border-emerald-500/25 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(5,150,105,0.2)] rounded-2xl sm:rounded-3xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col gap-0">
        <DialogHeader className="p-3.5 sm:p-6 border-b border-white/[0.08] bg-[#081610]/90 backdrop-blur-xl shrink-0">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider mb-1 max-w-full">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              <span className="truncate">SaastaScholar | Legal &amp; Compliance Hub</span>
            </div>
            <DialogTitle className="text-base sm:text-2xl font-extrabold text-white tracking-tight break-words">
              Academic Legal &amp; Commerce Compliance
            </DialogTitle>
            <DialogDescription className="text-[0.68rem] sm:text-xs text-slate-400 mt-0.5 break-words leading-relaxed line-clamp-2 sm:line-clamp-none">
              Fully Compliant With DPDP Act 2023, EU GDPR, EPrivacy Directive, IT Act 2000, And Indian Consumer Protection Laws.
            </DialogDescription>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search Policies, Terms, Refund, Deletion..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (mobileView === "reader") setMobileView("list");
                }}
                className="w-full pl-8 pr-3 py-1.5 sm:pl-9 sm:pr-4 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 min-w-0"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto min-w-0 max-w-full scrollbar-none py-0.5 text-xs shrink-0 touch-pan-x">
              {[
                { id: "all", label: "All Policies" },
                { id: "privacy", label: "Privacy & GDPR" },
                { id: "commerce", label: "Payments & Refunds" },
                { id: "legal", label: "Legal & IP" },
                { id: "data", label: "Data Lifecycle" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setMobileView("list");
                  }}
                  className={cn(
                    "px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[0.7rem] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                    activeCategory === cat.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Master Layout: Left Sidebar Navigation + Right Document Reader */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          {/* Navigation Sidebar */}
          <div
            className={cn(
              "md:col-span-4 border-r border-white/[0.08] bg-[#06100b]/60 overflow-y-auto p-2.5 sm:p-3 space-y-1.5 min-w-0",
              mobileView === "reader" ? "hidden md:block" : "block"
            )}
          >
            {/* Mobile Header in List View showing Count */}
            <div className="flex md:hidden items-center justify-between pb-1 px-1 text-[0.7rem] text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Select Policy To Read</span>
              <span className="font-mono text-emerald-400 font-bold">{filteredPolicies.length} Available</span>
            </div>

            {filteredPolicies.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id);
                    setMobileView("reader");
                  }}
                  className={cn(
                    "w-full text-left p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 min-w-0",
                    isSelected
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-white shadow-sm"
                      : "hover:bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-transparent"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      isSelected ? "text-emerald-400" : "text-slate-400"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate block">{p.title}</span>
                    </div>
                    <span className="text-[0.62rem] sm:text-[0.65rem] text-slate-400 block truncate mt-0.5">
                      {p.badge}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredPolicies.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No Policies Matched Your Query.
              </div>
            )}
          </div>

          {/* Document Content View */}
          <div
            className={cn(
              "md:col-span-8 p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-[#040806]/40 min-w-0",
              mobileView === "list" ? "hidden md:block" : "block"
            )}
          >
            {/* Mobile Top Navigation Bar: Back to List Button */}
            <div className="flex md:hidden items-center justify-between gap-2 pb-2.5 border-b border-white/[0.08]">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 py-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                <span>All Policies</span>
              </button>
              <span className="text-[0.62rem] text-emerald-300 font-semibold truncate bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                {activeDoc.badge}
              </span>
            </div>

            <div className="min-w-0">
              <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[0.7rem] font-bold">
                <CheckCircle2 className="h-3 w-3" />
                {activeDoc.badge}
              </div>
              <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight mt-1 sm:mt-2 break-words">
                {activeDoc.title}
              </h3>
              <p className="text-[0.72rem] sm:text-xs text-slate-400 mt-1 leading-relaxed break-words">
                {activeDoc.subtitle}
              </p>
            </div>

            <div className="space-y-3.5 sm:space-y-5 min-w-0">
              {activeDoc.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-4 text-xs leading-relaxed min-w-0"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-300 mb-1.5 flex items-start gap-2 break-words">
                    <span className="flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[0.62rem] sm:text-[0.68rem] text-emerald-400 font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 break-words flex-1">{sec.heading}</span>
                  </h4>
                  <p className="text-slate-300 text-[0.72rem] sm:text-[0.78rem] leading-relaxed break-words pl-6.5 sm:pl-7">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Actions Footer Inside Modal */}
            <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-400 min-w-0">
              <span className="text-[0.65rem] sm:text-[0.7rem] break-words">
                Governance Desk: <strong className="text-white">legal@durgaaisolutions.in</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open_cookie_preferences"));
                  onOpenChange(false);
                }}
                className="inline-flex items-center gap-1.5 text-[0.7rem] sm:text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer shrink-0"
              >
                <span>Manage Cookie Preferences</span> <ExternalLink className="h-3 w-3 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
