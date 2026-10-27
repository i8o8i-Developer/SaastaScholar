import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Eye,
  FileText,
  Clock,
  Trash2,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, toTitleCase } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

interface MarketingStats {
  total_students: number;
  free_students: number;
  premium_students: number;
  active_subscribers: number;
  unsubscribed_count: number;
  total_broadcasts: number;
  total_delivered: number;
  sender_email: string;
  smtp_host: string;
  deliverability_status: string;
  has_credentials: boolean;
}

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  source: string;
  subscribed_at: string;
  unsubscribed_at?: string | null;
}

interface BroadcastLog {
  id: string;
  subject: string;
  preheader: string;
  audience: string;
  content_html: string;
  total_targeted: number;
  total_delivered: number;
  total_failed: number;
  status: string;
  sent_by_name: string;
  created_at: string;
}

const EMAIL_TEMPLATES = {
  weekly_dispatch: {
    subject: "Weekly Academic Dispatch: High-Yield Notes & Solved Papers",
    preheader: "Your Monday Study Kit: Unit Formula Sheets, Lab Viva Answers, and Exam Notes.",
    contentHtml: `<span class="badge">Weekly Academic Dispatch</span>
<h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">This Week In Your Curriculum</h2>
<p>Hello Scholar,</p>
<p>Here Is Your Curated Academic Study Kit For The Upcoming Week, Aligned With University Coursework:</p>

<div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0; font-size:13px; line-height:1.7;">
  <p style="margin:0 0 8px 0; color:#34d399; font-weight:700;">★ High-Yield Handouts Added:</p>
  <p style="margin:0 0 6px 0;">• <strong>Unit 3 & 4 Handwritten Formula Sheets</strong> With Verified Derivations.</p>
  <p style="margin:0 0 6px 0;">• <strong>Solved PYQ Papers (2020–2025)</strong> With Step-by-Step Solutions.</p>
  <p style="margin:0;">• <strong>Lab Viva Voce Cheat-Sheets</strong> Covering Core Experiment Questions.</p>
</div>

<p>Stay Ahead In Your Internal Sessional Exams By Reviewing These Today.</p>

<div style="text-align:center; margin:26px 0 10px 0;">
  <a href="https://saastascholar.durgaaisolutions.in/dashboard" class="btn-primary">
    Open Study Repository
  </a>
</div>`,
  },
  exam_alert: {
    subject: "Urgent Examination Alert: Sessional Dates & Master Revision Guide",
    preheader: "Official Term Schedule Release and High-Priority Revision Notes.",
    contentHtml: `<span class="badge" style="background-color:rgba(239,68,68,0.15); color:#f87171; border:1px solid #ef4444;">Examination Notice</span>
<h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">Mid-Term Exam Schedule Announced</h2>
<p>Dear Scholar,</p>
<p>The University Examination Authority Has Released The Timetable For The Upcoming Mid-Term Sessional Assessments.</p>

<div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0; font-size:13px;">
  <p style="margin:0 0 6px 0; color:#cbd5e1;"><strong>Exam Window:</strong> Commencing Next Monday</p>
  <p style="margin:0 0 6px 0; color:#cbd5e1;"><strong>Coverage:</strong> Units 1, 2, and 3</p>
  <p style="margin:0; color:#34d399; font-weight:700;"><strong>Preparation Strategy:</strong> Focus on Solved PYQs and Viva Banks.</p>
</div>

<div style="text-align:center; margin:26px 0 10px 0;">
  <a href="https://saastascholar.durgaaisolutions.in/dashboard?tab=pyqs" class="btn-primary">
    Access Solved PYQs
  </a>
</div>`,
  },
  lab_viva: {
    subject: "Lab Practical Cheat-Sheet & Viva Voce Master Bank",
    preheader: "Ace Your Laboratory Evaluations With Full Viva Answers and Experiment Setups.",
    contentHtml: `<span class="badge">Practical Study Kit</span>
<h2 style="color:#ffffff; font-size:18px; font-weight:800; margin-top:0; text-transform:uppercase;">Lab Practical & Viva Master Bank</h2>
<p>Hello Scholar,</p>
<p>Ace Your Internal Laboratory Evaluations With Our Verified Lab Manuals And Frequently Asked Viva Voce Questions.</p>

<div style="background-color:#0b140c; border:1px solid #1f3322; padding:16px; margin:20px 0; font-size:13px; line-height:1.7;">
  <p style="margin:0 0 6px 0;">✔ Complete Algorithm & Flowchart Breakdowns</p>
  <p style="margin:0 0 6px 0;">✔ Code Snippets & Test Case Outputs</p>
  <p style="margin:0;">✔ Top 30 Faculty Viva Questions with Model Answers</p>
</div>

<div style="text-align:center; margin:26px 0 10px 0;">
  <a href="https://saastascholar.durgaaisolutions.in/dashboard?tab=labs" class="btn-primary">
    Explore Lab Experiments
  </a>
</div>`,
  },
};

export function AdminMarketingTab() {
  const [activeSubTab, setActiveSubTab] = useState<
    "broadcast" | "subscribers" | "history"
  >("broadcast");

  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Broadcast Composer State
  const [subject, setSubject] = useState<string>(
    EMAIL_TEMPLATES.weekly_dispatch.subject
  );
  const [preheader, setPreheader] = useState<string>(
    EMAIL_TEMPLATES.weekly_dispatch.preheader
  );
  const [audience, setAudience] = useState<string>("ALL");
  const [contentHtml, setContentHtml] = useState<string>(
    EMAIL_TEMPLATES.weekly_dispatch.contentHtml
  );
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [testEmail, setTestEmail] = useState<string>("");
  const [sendingTest, setSendingTest] = useState<boolean>(false);
  const [sendingBroadcast, setSendingBroadcast] = useState<boolean>(false);

  // Subscribers Directory State
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState<boolean>(false);
  const [subscriberSearch, setSubscriberSearch] = useState<string>("");
  const [subscriberFilter, setSubscriberFilter] = useState<string>("all");
  const [newEmailInput, setNewEmailInput] = useState<string>("");
  const [addingSubscriber, setAddingSubscriber] = useState<boolean>(false);

  // History State
  const [logs, setLogs] = useState<BroadcastLog[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);

  // Load Initial Stats
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const res = await apiFetch<MarketingStats>("/academic/admin/marketing/stats/");
      setStats(res);
    } catch (err: any) {
      toast.error("Failed To Load Marketing Metrics.");
    } finally {
      setLoadingStats(false);
    }
  };

  // Load Subscribers
  const loadSubscribers = async () => {
    try {
      setSubscribersLoading(true);
      const params = new URLSearchParams();
      if (subscriberSearch) params.set("search", subscriberSearch);
      if (subscriberFilter !== "all") params.set("status", subscriberFilter);

      const res = await apiFetch<any>(
        `/academic/admin/marketing/subscribers/?${params.toString()}`
      );
      setSubscribers(Array.isArray(res) ? res : res?.results || []);
    } catch (err: any) {
      toast.error("Failed To Fetch Subscribers.");
    } finally {
      setSubscribersLoading(false);
    }
  };

  // Load History
  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await apiFetch<any>("/academic/admin/marketing/logs/");
      setLogs(Array.isArray(res) ? res : res?.results || []);
    } catch (err: any) {
      toast.error("Failed To Fetch Broadcast History.");
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeSubTab === "subscribers") {
      loadSubscribers();
    } else if (activeSubTab === "history") {
      loadLogs();
    }
  }, [activeSubTab, subscriberFilter]);

  const handleTemplateSelect = (key: keyof typeof EMAIL_TEMPLATES) => {
    const tmpl = EMAIL_TEMPLATES[key];
    if (tmpl) {
      setSubject(tmpl.subject);
      setPreheader(tmpl.preheader);
      setContentHtml(tmpl.contentHtml);
      toast.info(`Loaded ${toTitleCase(key.replace("_", " "))} Template.`);
    }
  };

  const handleSendTest = async () => {
    if (!subject.trim()) {
      toast.error("Please Enter A Broadcast Subject.");
      return;
    }
    try {
      setSendingTest(true);
      const res = await apiFetch<any>("/academic/admin/marketing/broadcast/", {
        method: "POST",
        body: JSON.stringify({
          subject: subject.trim(),
          preheader: preheader.trim(),
          content_html: contentHtml,
          audience,
          is_test: true,
          test_recipient: testEmail.trim(),
        }),
      });
      toast.success(res.message || "Test Preview Email Sent Successfully.");
    } catch (err: any) {
      toast.error(toTitleCase(err?.message || "Failed To Send Test Email."));
    } finally {
      setSendingTest(false);
    }
  };

  const handleBroadcastBlast = async () => {
    if (!subject.trim()) {
      toast.error("Please Enter A Broadcast Subject.");
      return;
    }
    if (!contentHtml.trim()) {
      toast.error("Please Provide Email Content HTML.");
      return;
    }

    const confirmed = window.confirm(
      `Confirm Broadcast Dispatch:\n\nSubject: ${subject}\nAudience Segment: ${audience}\n\nAre You Sure You Want To Send This Dispatch To All Targeted Recipients?`
    );
    if (!confirmed) return;

    try {
      setSendingBroadcast(true);
      const res = await apiFetch<any>("/academic/admin/marketing/broadcast/", {
        method: "POST",
        body: JSON.stringify({
          subject: subject.trim(),
          preheader: preheader.trim(),
          content_html: contentHtml,
          audience,
          is_test: false,
        }),
      });
      toast.success(res.message || "Marketing Broadcast Completed Successfully.");
      loadStats();
      if (activeSubTab === "history") loadLogs();
    } catch (err: any) {
      toast.error(toTitleCase(err?.message || "Broadcast Dispatch Failed."));
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput || !newEmailInput.includes("@")) {
      toast.error("Please Enter A Valid Email Address.");
      return;
    }
    try {
      setAddingSubscriber(true);
      await apiFetch("/academic/admin/marketing/subscribers/", {
        method: "POST",
        body: JSON.stringify({ email: newEmailInput.trim().toLowerCase() }),
      });
      toast.success("Subscriber Added Successfully.");
      setNewEmailInput("");
      loadSubscribers();
      loadStats();
    } catch (err: any) {
      toast.error(toTitleCase(err?.message || "Failed To Add Subscriber."));
    } finally {
      setAddingSubscriber(false);
    }
  };

  const handleToggleSubscriber = async (sub: Subscriber) => {
    try {
      await apiFetch(`/academic/admin/marketing/subscribers/${sub.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !sub.is_active }),
      });
      toast.success(
        `Subscriber Marked As ${!sub.is_active ? "Active" : "Unsubscribed"}.`
      );
      loadSubscribers();
      loadStats();
    } catch (err: any) {
      toast.error("Failed To Update Subscriber Status.");
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm("Remove This Subscriber Record Permanently?")) return;
    try {
      await apiFetch(`/academic/admin/marketing/subscribers/${id}/`, {
        method: "DELETE",
      });
      toast.success("Subscriber Deleted.");
      loadSubscribers();
      loadStats();
    } catch (err: any) {
      toast.error("Failed To Delete Subscriber.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================== Top Metrics Overview ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-2xs backdrop-blur-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Newsletter Subscribers
            </span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {loadingStats ? "..." : stats?.active_subscribers || 0}
          </div>
          <div className="text-[0.7rem] text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{stats?.unsubscribed_count || 0} Unsubscribed</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-2xs backdrop-blur-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Student Reach
            </span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {loadingStats ? "..." : stats?.total_students || 0}
          </div>
          <div className="text-[0.7rem] text-muted-foreground mt-1">
            {stats?.premium_students || 0} Premium · {stats?.free_students || 0} Free
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-2xs backdrop-blur-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Dispatches Sent
            </span>
            <Send className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {loadingStats ? "..." : stats?.total_broadcasts || 0}
          </div>
          <div className="text-[0.7rem] text-muted-foreground mt-1">
            {stats?.total_delivered || 0} Delivered To Student Inboxes
          </div>
        </div>
      </div>

      {/* ===================== Sub-Navigation Bar ===================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveSubTab("broadcast")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2",
              activeSubTab === "broadcast"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface hover:bg-surface/80 text-foreground border border-border/60"
            )}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Weekly Dispatch & Broadcast</span>
          </button>

          <button
            onClick={() => setActiveSubTab("subscribers")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2",
              activeSubTab === "subscribers"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface hover:bg-surface/80 text-foreground border border-border/60"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Subscriber Directory</span>
          </button>

          <button
            onClick={() => setActiveSubTab("history")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2",
              activeSubTab === "history"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface hover:bg-surface/80 text-foreground border border-border/60"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Dispatch History</span>
          </button>
        </div>

        <button
          onClick={() => {
            loadStats();
            if (activeSubTab === "subscribers") loadSubscribers();
            if (activeSubTab === "history") loadLogs();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-accent cursor-pointer transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* ===================== TAB 1: BROADCAST COMPOSER ===================== */}
      {activeSubTab === "broadcast" && (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* Left Column: Form Controls */}
          <div className="space-y-4">
            {/* Template Presets */}
            <div className="rounded-2xl border border-border/80 bg-card/80 p-4 shadow-2xs backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
                Quick Template Presets
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTemplateSelect("weekly_dispatch")}
                  className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  Weekly Academic Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect("exam_alert")}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  Examination Notice
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect("lab_viva")}
                  className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-colors cursor-pointer"
                >
                  Lab Viva Cheat-Sheet
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xs space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Target Audience Segment
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="ALL">All Registered Students & Newsletter Subscribers (Broadest Reach)</option>
                  <option value="STUDENTS">All Registered Students</option>
                  <option value="SUBSCRIBERS">Newsletter Subscribers Only</option>
                  <option value="FREE_TIER">Free Tier Scholars (Upgrade & Motivate)</option>
                  <option value="PREMIUM_TIER">Premium & Elite Scholars (Exclusive Perks)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Email Subject Line (Title Case Recommended)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g. Weekly Academic Dispatch: Unit 4 Formulas & Exam Alerts"
                  className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Inbox Preheader Text (Snippet Shown Next To Subject In Gmail/Outlook)
                </label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="E.g. Your Monday study kit: Unit formula sheets, lab viva answers, and exam notes."
                  className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Content HTML (SaastaScholar Brand Layout)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{previewMode ? "Hide Preview" : "Preview In Simulator"}</span>
                  </button>
                </div>
                <textarea
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  rows={10}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs font-mono text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border/80 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Test Send Input */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Test Email (Defaults to Admin)"
                    className="h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground flex-1 min-w-0 focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={sendingTest}
                    onClick={handleSendTest}
                    className="h-10 px-3.5 rounded-xl border border-border bg-surface hover:bg-accent text-foreground text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {sendingTest ? "Sending..." : "Send Test"}
                  </button>
                </div>

                {/* Blast Dispatch */}
                <button
                  type="button"
                  disabled={sendingBroadcast}
                  onClick={handleBroadcastBlast}
                  className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:bg-primary-deep transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  <span>{sendingBroadcast ? "Dispatching Blast..." : "Blast Broadcast Dispatch"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Email Simulator */}
          <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xs backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-primary" />
                <span>Live Inbox Simulator</span>
              </span>
              <span className="text-[0.7rem] text-muted-foreground font-mono">
                saastascholar.durgaaisolutions.in
              </span>
            </div>

            {/* Email Shell */}
            <div className="rounded-xl border border-[#1f3322] bg-[#0d140e] text-[#e2e8f0] overflow-hidden shadow-lg font-sans">
              {/* Email Header */}
              <div className="bg-[#005F15] p-5 text-center border-b-2 border-[#10b981]">
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-white m-0">
                  SaastaScholar™
                </h2>
                <p className="text-[10px] text-[#a7f3d0] uppercase tracking-wider font-bold mt-1 m-0">
                  Quality Education, Without The Heavy Price
                </p>
              </div>

              {/* Subject Bar */}
              <div className="bg-[#121c14] border-b border-[#1f3322] p-3 text-xs">
                <p className="text-muted-foreground text-[0.68rem] m-0">Subject:</p>
                <p className="font-bold text-white text-xs m-0 truncate">{subject}</p>
              </div>

              {/* Email Content Body */}
              <div
                className="p-5 text-xs text-[#cbd5e1] leading-relaxed space-y-3"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              {/* Email Footer */}
              <div className="bg-[#0b140c] border-t border-[#1a2c1d] p-4 text-center text-[10px] text-[#64748b]">
                <p className="m-0 mb-1">
                  &copy; 2026 <strong>SaastaScholar</strong> · Owned & Engineered By DurgaAI Solutions.
                </p>
                <p className="m-0 mb-2">Jaipur Knowledge City, Rajasthan 303121 · DPDP Act (2023) Compliant.</p>
                <p className="m-0 text-[#34d399] underline">
                  Unsubscribe Instantly With One Click
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: SUBSCRIBERS DIRECTORY ===================== */}
      {activeSubTab === "subscribers" && (
        <div className="space-y-4">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadSubscribers()}
                  placeholder="Search Subscribers by Email..."
                  className="h-10 w-full rounded-xl border border-border bg-background pr-3 pl-9 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={loadSubscribers}
                className="h-10 px-4 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground hover:bg-accent cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddSubscriber} className="flex items-center gap-2">
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="Add Subscriber Email..."
                required
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={addingSubscriber}
                className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-deep transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Subscribers Table */}
          <div className="rounded-2xl border border-border/80 bg-card/80 overflow-hidden shadow-2xs backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-surface/80 border-b border-border/80 text-muted-foreground text-[0.7rem] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Subscriber Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Subscribed At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {subscribersLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        Loading Subscribers Directory...
                      </td>
                    </tr>
                  ) : subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No Subscribers Found.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">
                          {sub.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase",
                              sub.is_active
                                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                            )}
                          >
                            {sub.is_active ? "Active" : "Unsubscribed"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {sub.source}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                          {new Date(sub.subscribed_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSubscriber(sub)}
                              title={sub.is_active ? "Mark Unsubscribed" : "Mark Active"}
                              className="p-1.5 rounded-lg border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
                            >
                              {sub.is_active ? (
                                <ToggleRight className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscriber(sub.id)}
                              title="Delete Record"
                              className="p-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: DISPATCH HISTORY ===================== */}
      {activeSubTab === "history" && (
        <div className="rounded-2xl border border-border/80 bg-card/80 overflow-hidden shadow-2xs backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surface/80 border-b border-border/80 text-muted-foreground text-[0.7rem] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Broadcast Subject</th>
                  <th className="py-3 px-4">Audience</th>
                  <th className="py-3 px-4">Delivered / Targeted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Loading Broadcast Logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No Broadcast Dispatches Sent Yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{log.subject}</p>
                        {log.preheader && (
                          <p className="text-[0.7rem] text-muted-foreground truncate max-w-sm">
                            {log.preheader}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {toTitleCase(log.audience.replace("_", " "))}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-emerald-500 font-bold">
                          {log.total_delivered}
                        </span>{" "}
                        / {log.total_targeted}
                        {log.total_failed > 0 && (
                          <span className="text-rose-500 text-[0.7rem] ml-1.5">
                            ({log.total_failed} Failed)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase",
                            log.status === "COMPLETED"
                              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                          )}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs font-mono">
                        {new Date(log.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
