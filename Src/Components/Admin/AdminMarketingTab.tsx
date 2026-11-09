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
    preheader: "Your Monday Study Kit: Unit Formula Sheets, Lab Viva Answers, And Exam Notes.",
    contentHtml: `<div style="margin-bottom:16px;">
  <span style="display:inline-block; padding:4px 10px; background:#0b1d14; color:#34d399; border:1px solid #10b981; border-radius:0; font-size:11px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase;">
    ★ Weekly Academic Dispatch
  </span>
</div>
<h2 style="color:#ffffff; font-size:20px; font-weight:900; margin:0 0 10px 0; letter-spacing:-0.4px; text-transform:uppercase;">
  Curated Study Kit For Your Semester
</h2>
<p style="color:#ededed; font-size:13.5px; line-height:1.6; margin:0 0 16px 0;">
  Hello Scholar, Here Is Your Curated Study Intelligence Pack For The Upcoming Week, Verified By Campus Subject Experts And Strictly Aligned With University Curriculum:
</p>

<div style="background:#19191b; border:1px solid rgba(255,255,255,0.08); border-radius:0; padding:16px; margin:20px 0;">
  <p style="margin:0 0 12px 0; color:#34d399; font-weight:800; font-size:12.5px; text-transform:uppercase; letter-spacing:0.5px;">
    ⚡ Newly Uploaded High-Yield Resources:
  </p>
  
  <div style="background:#0b1d14; border:1px solid #10b981; border-left:4px solid #10b981; border-radius:0; padding:12px 14px; margin-bottom:10px;">
    <div style="font-weight:800; color:#34d399; font-size:13px; margin-bottom:2px;">📘 Unit 3 &amp; 4 Handwritten Formula Sheets</div>
    <div style="color:#cbd5e1; font-size:12px; line-height:1.5;">Verified Mathematical Derivations, Key Formulas, And Exam Cheat-Sheets.</div>
  </div>

  <div style="background:#0c182b; border:1px solid #3b82f6; border-left:4px solid #3b82f6; border-radius:0; padding:12px 14px; margin-bottom:10px;">
    <div style="font-weight:800; color:#60a5fa; font-size:13px; margin-bottom:2px;">📝 Solved University PYQs (2020–2025)</div>
    <div style="color:#cbd5e1; font-size:12px; line-height:1.5;">Past Examination Papers With Complete Faculty Step-By-Step Solutions.</div>
  </div>

  <div style="background:#17102b; border:1px solid #8b5cf6; border-left:4px solid #8b5cf6; border-radius:0; padding:12px 14px;">
    <div style="font-weight:800; color:#a78bfa; font-size:13px; margin-bottom:2px;">🔬 Practical Lab Manual &amp; Viva Voce Bank</div>
    <div style="color:#cbd5e1; font-size:12px; line-height:1.5;">Most Frequently Asked External Examiner Viva Questions With Model Answers.</div>
  </div>
</div>

<p style="color:#94a3b8; font-size:13px; line-height:1.6; margin:16px 0;">
  Review These Verified Notes Today To Stay Ahead In Your Continuous Assessment Tests And University Semester Finals.
</p>

<div style="text-align:center; margin:28px 0 12px 0;">
  <a href="https://saastascholar.durgaaisolutions.in/dashboard" class="btn-primary" style="display:inline-block; background:#005F15; border:1px solid #10b981; color:#ffffff !important; padding:13px 32px; border-radius:0; font-weight:800; font-size:13px; text-decoration:none; text-transform:uppercase; letter-spacing:0.6px;">
    Open Study Repository →
  </a>
</div>`,
  },
  exam_alert: {
    subject: "Urgent Examination Alert: Sessional Dates & Master Revision Guide",
    preheader: "Official Term Schedule Release And High-Priority Revision Notes.",
    contentHtml: `<div style="margin-bottom:16px;">
  <span style="display:inline-block; padding:4px 10px; background:#240e14; color:#f87171; border:1px solid #ef4444; border-radius:0; font-size:11px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase;">
    🚨 Official Examination Notice
  </span>
</div>
<h2 style="color:#ffffff; font-size:20px; font-weight:900; margin:0 0 10px 0; letter-spacing:-0.4px; text-transform:uppercase;">
  Mid-Term Examination Schedule Announced
</h2>
<p style="color:#ededed; font-size:13.5px; line-height:1.6; margin:0 0 16px 0;">
  Dear Scholar, The University Examination Authority Has Published The Official Timetable For The Upcoming Mid-Term Sessional Examinations.
</p>

<div style="background:#240e14; border:1px solid #ef4444; border-left:4px solid #ef4444; border-radius:0; padding:16px; margin:20px 0;">
  <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
    <strong style="color:#f87171;">Exam Window:</strong>
    <span style="color:#ffffff; font-weight:700;">Commencing Next Monday (09:30 AM IST)</span>
  </div>
  <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px;">
    <strong style="color:#f87171;">Syllabus Coverage:</strong>
    <span style="color:#ffffff; font-weight:700;">Units 1, 2, And 3 Comprehensive</span>
  </div>
  <div style="display:flex; justify-content:space-between; font-size:13px;">
    <strong style="color:#f87171;">Recommended Strategy:</strong>
    <span style="color:#34d399; font-weight:800;">Focus On 5-Year Solved PYQ Banks</span>
  </div>
</div>

<div style="background:#19191b; border:1px solid rgba(255,255,255,0.08); border-radius:0; padding:14px 16px; margin:18px 0; font-size:12.5px; color:#cbd5e1; line-height:1.6;">
  <p style="margin:0 0 6px 0;"><strong>★ Exam Room Advisory:</strong> Carry Your Official College Identity Card And Hall Ticket.</p>
  <p style="margin:0;"><strong>★ High-Yield Tip:</strong> All Expected Long-Answer Questions Are Tagged In The PYQ Repository.</p>
</div>

<div style="text-align:center; margin:28px 0 12px 0;">
  <a href="https://saastascholar.durgaaisolutions.in/dashboard?tab=pyqs" class="btn-primary" style="display:inline-block; background:#be123c; border:1px solid #ef4444; color:#ffffff !important; padding:13px 32px; border-radius:0; font-weight:800; font-size:13px; text-decoration:none; text-transform:uppercase; letter-spacing:0.6px;">
    Access Solved Exam PYQs →
  </a>
</div>`,
  },
  lab_viva: {
    subject: "Lab Practical Cheat-Sheet & Viva Voce Master Bank",
    preheader: "Ace Your Laboratory Evaluations With Full Viva Answers And Experiment Setups.",
    contentHtml: `<div style="margin-bottom:16px;">
  <span style="display:inline-block; padding:4px 10px; background:#17102b; color:#a78bfa; border:1px solid #8b5cf6; border-radius:0; font-size:11px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase;">
    ⚡ Practical Study Kit &amp; Viva Bank
  </span>
</div>
<h2 style="color:#ffffff; font-size:20px; font-weight:900; margin:0 0 10px 0; letter-spacing:-0.4px; text-transform:uppercase;">
  Laboratory Practical &amp; Viva Voce Master Bank
</h2>
<p style="color:#ededed; font-size:13.5px; line-height:1.6; margin:0 0 16px 0;">
  Hello Scholar, Secure Full Marks In Your Internal Laboratory Practical Assessments With Our Verified Lab Manuals And Viva Master Guide:
</p>

<div style="background:#17102b; border:1px solid #8b5cf6; border-left:4px solid #8b5cf6; border-radius:0; padding:16px; margin:20px 0;">
  <p style="margin:0 0 10px 0; color:#a78bfa; font-weight:800; font-size:13px; text-transform:uppercase;">
    ✔ Verified Lab Manual Highlights:
  </p>
  <div style="color:#ededed; font-size:12.5px; line-height:1.7;">
    <p style="margin:0 0 6px 0;">• <strong>Complete Circuit Diagrams &amp; Flowcharts:</strong> Step-By-Step Schematics And Algorithms.</p>
    <p style="margin:0 0 6px 0;">• <strong>Clean Code Snippets &amp; Test Vectors:</strong> Verified Inputs And Exact Expected Output Tables.</p>
    <p style="margin:0;">• <strong>Top 30 Faculty Viva Questions:</strong> Model Conceptual Answers Prepared By Department Faculty.</p>
  </div>
</div>

<p style="color:#94a3b8; font-size:13px; line-height:1.6; margin:16px 0;">
  All Experiments Include Ready-To-Write Observations, Formula Summaries, And Viva Questions.
</p>

<div style="text-align:center; margin:28px 0 12px 0;">
  <a href="https://saastascholar.durgaaisolutions.in/dashboard?tab=labs" class="btn-primary" style="display:inline-block; background:#6d28d9; border:1px solid #8b5cf6; color:#ffffff !important; padding:13px 32px; border-radius:0; font-weight:800; font-size:13px; text-decoration:none; text-transform:uppercase; letter-spacing:0.6px;">
    Explore Lab Experiments →
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

            {/* Email Client Mock Window */}
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-3 sm:p-4 shadow-sm font-sans space-y-3">
              {/* Client Window Toolbar */}
              <div className="flex items-center justify-between px-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-[0.68rem] font-bold text-muted-foreground">Inbox · Live Dispatch Preview</span>
                </div>
                <div className="text-[0.65rem] text-muted-foreground font-mono">
                  Today, 10:00 AM IST
                </div>
              </div>

              {/* Envelope Metadata Card */}
              <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-xs grid place-items-center shrink-0">
                      SS
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-xs truncate">SaastaScholar Support &lt;support@saastascholar.in&gt;</p>
                      <p className="text-[0.65rem] text-muted-foreground truncate">To: All Registered Scholars (Curriculum Batch)</p>
                    </div>
                  </div>
                  <span className="text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    Verified SPF/DKIM
                  </span>
                </div>
                <div className="pt-1.5 border-t border-border/50">
                  <p className="text-[0.7rem] text-muted-foreground font-medium truncate">
                    Subject: <strong className="text-foreground font-bold">{subject || "No Subject Specified"}</strong>
                  </p>
                  {preheader && (
                    <p className="text-[0.65rem] text-muted-foreground/80 truncate mt-0.5">
                      Snippet: {preheader}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Paper Card Container - Sharp Non-Gradient Dark Obsidian */}
              <div className="border border-border/80 bg-[#1c1d20] text-[#ededed] overflow-hidden">
                {/* Email Header */}
                <div className="bg-[#005F15] px-6 py-6 text-center text-white border-b-2 border-emerald-500">
                  <h2 className="text-xl font-black uppercase tracking-tight text-white m-0">
                    SaastaScholar™
                  </h2>
                  <div className="mt-2 inline-block bg-[#0b1d14] border border-emerald-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    Quality Education, Without The Heavy Price
                  </div>
                </div>

                {/* Email Content Body */}
                <div
                  className="p-6 text-xs sm:text-sm text-[#ededed] leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />

                {/* Email Footer */}
                <div className="bg-[#141415] border-t border-border/80 p-5 text-center text-[11px] text-zinc-400 space-y-1">
                  <p className="m-0 font-medium">
                    &copy; 2026 <strong>SaastaScholar</strong> · Owned &amp; Engineered By DurgaAI Solutions.
                  </p>
                  <p className="m-0 text-[10px] text-zinc-500">
                    Jaipur Knowledge City, Rajasthan 303121 · DPDP Act (2023) Compliant.
                  </p>
                  <p className="m-0 pt-1">
                    <span className="text-emerald-400 font-bold underline cursor-pointer">
                      Unsubscribe Instantly With One Click
                    </span>
                    {" · "}
                    <span className="text-zinc-500">Manage Email Preferences</span>
                  </p>
                </div>
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
