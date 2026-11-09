import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Sparkles,
  Eye,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  Monitor,
  Code2,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, toTitleCase } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

export interface EmailStudioTemplate {
  id: string;
  category: "onboarding" | "academic" | "billing" | "security";
  name: string;
  badgeText: string;
  badgeColor: string;
  subject: string;
  preheader: string;
  headerTitle: string;
  headerSub: string;
  renderHtml: (vars: Record<string, string>) => string;
  defaultVars: Record<string, string>;
}

export const EMAIL_STUDIO_TEMPLATES: EmailStudioTemplate[] = [
  {
    id: "welcome",
    category: "onboarding",
    name: "1. Welcome Onboarding",
    badgeText: "Welcome Scholar",
    badgeColor: "emerald",
    subject: "Welcome To SaastaScholar™ · Academic Account Provisioned",
    preheader: "Your Student Study Workspace Credentials, Digital DRM Rights, And Subject Library Are Active.",
    headerTitle: "Welcome To SaastaScholar™",
    headerSub: "Quality Education, Without The Heavy Price",
    defaultVars: {
      student_name: "Aarav Sharma",
      roll_number: "2026ENGG1094",
      program: "B.Tech Computer Science (AI & ML)",
      semester: "Semester 1",
      section: "Section A",
      access_tier: "Free Starter Tier",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#0b1d14; color:#34d399; border:1px solid #10b981; margin-bottom:16px;">
  ★ Welcome Scholar
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  Your Academic Account Has Been Initialized Successfully. You Now Have Instant Access To Verified University Notes, Solved Exam Papers, Lab Practicals, And Syllabus Guides.
</p>

<div style="background:#0b1d14; border:1px solid #10b981; border-left:4px solid #10b981; padding:16px; margin:18px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr><td style="padding:6px 0; color:#94a3b8;">Student Scholar:</td><td style="padding:6px 0; font-weight:700; text-align:right; color:#ffffff;">${v["student_name"]}</td></tr>
    <tr><td style="padding:6px 0; color:#94a3b8;">University Roll Number:</td><td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">${v["roll_number"]}</td></tr>
    <tr><td style="padding:6px 0; color:#94a3b8;">Degree Program:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">${v["program"]}</td></tr>
    <tr><td style="padding:6px 0; color:#94a3b8;">Current Semester &amp; Section:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">${v["semester"]} (${v["section"]})</td></tr>
    <tr><td style="padding:6px 0; color:#94a3b8;">Academic Access Tier:</td><td style="padding:6px 0; font-weight:900; text-align:right; color:#34d399;">${v["access_tier"]}</td></tr>
  </table>
</div>

<p style="color:#94a3b8; font-size:12.5px; line-height:1.6; margin:16px 0;">
  Your Account Is Provisioned With Digital DRM Rights, Cloud Revision Bookmarks, And Curated Department Question Papers.
</p>

<div style="text-align:center; margin:26px 0 12px 0;">
  <a href="https://saastascholar.durgaaisolutions.in/login" style="display:inline-block; background:#005F15; border:1px solid #10b981; border-radius:0; color:#ffffff !important; font-weight:800; font-size:13px; padding:12px 28px; text-decoration:none; text-transform:uppercase; letter-spacing:0.5px;">
    Open Student Study Portal →
  </a>
</div>`,
  },
  {
    id: "otp",
    category: "security",
    name: "2. Password Reset OTP",
    badgeText: "Security Verification",
    badgeColor: "emerald",
    subject: "Cryptographic Password Reset OTP: 849201 · SaastaScholar Security",
    preheader: "One-Time Password Verification Code Valid For 10 Minutes.",
    headerTitle: "SaastaScholar™ Security",
    headerSub: "Cryptographic Verification Service",
    defaultVars: {
      student_name: "Aarav Sharma",
      otp_code: "849201",
      expires_in: "10 Minutes",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#0b1d14; color:#34d399; border:1px solid #10b981; margin-bottom:16px;">
  Security Verification
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  We Received A Request To Reset Your SaastaScholar Account Password. Enter The Secure One-Time Authorization Code (OTP) Below To Proceed:
</p>

<div style="background:#0b1d14; border:2px dashed #10b981; padding:22px; margin:20px 0; text-align:center;">
  <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#34d399; font-weight:800; margin-bottom:4px;">One-Time Verification Code</div>
  <div style="font-family:monospace; font-size:36px; font-weight:900; color:#34d399; letter-spacing:8px; margin:4px 0;">${v["otp_code"]}</div>
  <div style="font-size:11.5px; color:#94a3b8; margin-top:6px;">Valid For The Next ${v["expires_in"]} · Do Not Share This Code</div>
</div>

<div style="background:#211506; border:1px solid #f59e0b; border-left:4px solid #f59e0b; padding:14px; margin:18px 0; font-size:12.5px; color:#fde68a;">
  <strong>SECURITY NOTICE:</strong> If You Did Not Request A Password Reset, Please Disregard This Email Or Contact Campus IT Security Immediately. Your Account Remains Fully Protected.
</div>`,
  },
  {
    id: "pwdchanged",
    category: "security",
    name: "3. Password Changed Alert",
    badgeText: "Security Event",
    badgeColor: "rose",
    subject: "Security Advisory: Password Modified Successfully · SaastaScholar",
    preheader: "Immediate Security Notification Regarding Account Authentication Credentials.",
    headerTitle: "Security Advisory",
    headerSub: "Password Modification Completed",
    defaultVars: {
      student_name: "Aarav Sharma",
      device_info: "Desktop Browser (Chrome / Windows)",
      timestamp: "09-Nov-2026 22:15:32 IST",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#240e14; color:#f87171; border:1px solid #ef4444; margin-bottom:16px;">
  Security Event
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  The Password Associated With Your SaastaScholar Student Account Was Changed Successfully On <strong>${v["timestamp"]}</strong>.
</p>

<div style="background:#240e14; border:1px solid #ef4444; border-left:4px solid #ef4444; padding:16px; margin:18px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr><td style="padding:6px 0; color:#f87171;">Event Type:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">Password Modification</td></tr>
    <tr><td style="padding:6px 0; color:#f87171;">Client Device:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">${v["device_info"]}</td></tr>
    <tr><td style="padding:6px 0; color:#f87171;">Timestamp:</td><td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">${v["timestamp"]}</td></tr>
    <tr><td style="padding:6px 0; color:#f87171;">Security Status:</td><td style="padding:6px 0; font-weight:800; text-align:right; color:#34d399;">Session Re-Authenticated</td></tr>
  </table>
</div>

<div style="text-align:center; margin:26px 0 12px 0;">
  <a href="https://saastascholar.durgaaisolutions.in/login" style="display:inline-block; background:#be123c; border:1px solid #ef4444; border-radius:0; color:#ffffff !important; font-weight:800; font-size:13px; padding:12px 28px; text-decoration:none; text-transform:uppercase; letter-spacing:0.5px;">
    Did Not Make This Change? Lock Account →
  </a>
</div>`,
  },
  {
    id: "invoice",
    category: "billing",
    name: "7. Tax Invoice & Receipt",
    badgeText: "Order Confirmed",
    badgeColor: "emerald",
    subject: "Official Tax Invoice INV-2026-928174 · SaastaScholar Subscription",
    preheader: "Payment Verified And Confirmed. Download Official Electronic Tax Invoice.",
    headerTitle: "Official Tax Invoice",
    headerSub: "Payment Receipt & Subscription Confirmation",
    defaultVars: {
      student_name: "Aarav Sharma",
      invoice_no: "INV-2026-928174",
      payment_id: "pay_O18294XMN819",
      plan_title: "Elite Scholar Pass (Semester Subscription)",
      net_amount: "₹159.00",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#0b1d14; color:#34d399; border:1px solid #10b981; margin-bottom:16px;">
  Order Confirmed
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  Thank You For Subscribing To SaastaScholar. Your Transaction Has Been Verified And Settled In Full.
</p>

<div style="background:#0b1d14; border:1px solid #10b981; border-left:4px solid #10b981; padding:16px; margin:18px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr><td style="padding:6px 0; color:#94a3b8;">Invoice Number:</td><td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">${v["invoice_no"]}</td></tr>
    <tr><td style="padding:6px 0; color:#94a3b8;">Transaction ID:</td><td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">${v["payment_id"]}</td></tr>
    <tr><td style="padding:6px 0; color:#94a3b8;">Plan Description:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">${v["plan_title"]}</td></tr>
    <tr><td style="padding:6px 0; color:#94a3b8;">Net Amount Paid:</td><td style="padding:6px 0; font-weight:900; text-align:right; color:#34d399; font-size:15px;">${v["net_amount"]} (Incl. 18% GST)</td></tr>
  </table>
</div>

<div style="text-align:center; margin:26px 0 12px 0;">
  <a href="https://saastascholar.durgaaisolutions.in/dashboard?tab=invoices" style="display:inline-block; background:#005F15; border:1px solid #10b981; border-radius:0; color:#ffffff !important; font-weight:800; font-size:13px; padding:12px 28px; text-decoration:none; text-transform:uppercase; letter-spacing:0.5px;">
    Download PDF Tax Invoice →
  </a>
</div>`,
  },
  {
    id: "refund",
    category: "billing",
    name: "8. Refund Confirmation",
    badgeText: "Refund Processed",
    badgeColor: "rose",
    subject: "Refund Processed Successfully · SaastaScholar Billing Desk",
    preheader: "Settlement Credit Notification For Order Ref rfnd_8829410MN.",
    headerTitle: "Refund Processed",
    headerSub: "Settlement Credit Notification",
    defaultVars: {
      student_name: "Aarav Sharma",
      refund_ref: "rfnd_8829410MN",
      order_id: "order_M8392104",
      amount: "₹159.00",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#240e14; color:#f87171; border:1px solid #ef4444; margin-bottom:16px;">
  Refund Processed
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  Your Refund Request Has Been Approved And Executed By Our Billing Operations Desk.
</p>

<div style="background:#240e14; border:1px solid #ef4444; border-left:4px solid #ef4444; padding:16px; margin:18px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr><td style="padding:6px 0; color:#f87171;">Refund Reference:</td><td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">${v["refund_ref"]}</td></tr>
    <tr><td style="padding:6px 0; color:#f87171;">Original Order ID:</td><td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">${v["order_id"]}</td></tr>
    <tr><td style="padding:6px 0; color:#f87171;">Refund Amount:</td><td style="padding:6px 0; font-weight:900; text-align:right; color:#34d399; font-size:15px;">${v["amount"]}</td></tr>
    <tr><td style="padding:6px 0; color:#f87171;">Settlement Mode:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">Original UPI Account (Direct Reversal)</td></tr>
  </table>
</div>`,
  },
  {
    id: "tier_upgraded",
    category: "billing",
    name: "10. Plan Tier Upgraded",
    badgeText: "Tier Upgrade",
    badgeColor: "amber",
    subject: "Membership Tier Activated: Elite Scholar Pass · SaastaScholar Access",
    preheader: "Full DRM Reader, 5-Year Question Banks, And Priority AI Assistance Active.",
    headerTitle: "Membership Tier Activated",
    headerSub: "Elite Scholar Pass Privileges Unlocked",
    defaultVars: {
      student_name: "Aarav Sharma",
      active_tier: "Elite Scholar Pass",
      fee: "₹159.00 / Mo",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#211506; color:#fbbf24; border:1px solid #f59e0b; margin-bottom:16px;">
  Tier Upgrade
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  Congratulations! Your Scholar Account Has Been Upgraded To The <strong>${v["active_tier"]}</strong>. All Premium Digital Study Assets Are Now Unrestricted.
</p>

<div style="background:#211506; border:1px solid #f59e0b; border-left:4px solid #f59e0b; padding:16px; margin:18px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr><td style="padding:6px 0; color:#fbbf24;">Active Access Tier:</td><td style="padding:6px 0; font-weight:800; text-align:right; color:#ffffff;">${v["active_tier"]}</td></tr>
    <tr><td style="padding:6px 0; color:#fbbf24;">Monthly/Semester Fee:</td><td style="padding:6px 0; font-weight:900; text-align:right; color:#34d399;">${v["fee"]}</td></tr>
    <tr><td style="padding:6px 0; color:#fbbf24;">DRM Privileges:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">Full DRM High-Res Viewer Active</td></tr>
    <tr><td style="padding:6px 0; color:#fbbf24;">Question Banks:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">100% Unlocked (5-Year Model PYQs)</td></tr>
  </table>
</div>`,
  },
  {
    id: "drm_alert",
    category: "security",
    name: "12. DRM Security Alert",
    badgeText: "DRM Protection",
    badgeColor: "rose",
    subject: "Security Warning: Digital Rights Copy Protection Warning · SaastaScholar",
    preheader: "Important Security Notice Regarding Study Document Copy Protection And Reading Access.",
    headerTitle: "Security Warning",
    headerSub: "Digital Rights Copy Protection Detected",
    defaultVars: {
      student_name: "Aarav Sharma",
      document_title: "Unit 3 Engineering Mathematics Derivations",
      cooldown: "15 Minutes",
      violations_count: "1 Active Alert",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#240e14; color:#f87171; border:1px solid #ef4444; margin-bottom:16px;">
  DRM Protection
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  An Unauthorized Document Copying Or Screenshot Capture Event Was Blocked By The SaastaScholar Digital Rights Management Engine:
</p>

<div style="background:#240e14; border:1px solid #ef4444; border-left:4px solid #ef4444; padding:16px; margin:18px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr><td style="padding:6px 0; color:#f87171;">Violation Event:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">Screen Capture / PrintScreen Triggered</td></tr>
    <tr><td style="padding:6px 0; color:#f87171;">Document Opened:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">${v["document_title"]}</td></tr>
    <tr><td style="padding:6px 0; color:#f87171;">Security Status:</td><td style="padding:6px 0; font-weight:800; text-align:right; color:#f87171;">Cooldown Active (${v["cooldown"]})</td></tr>
    <tr><td style="padding:6px 0; color:#f87171;">Violation Count:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">${v["violations_count"]}</td></tr>
  </table>
</div>`,
  },
  {
    id: "assignment_deadline",
    category: "academic",
    name: "13. Assignment Deadline",
    badgeText: "Assignment Due",
    badgeColor: "amber",
    subject: "Urgent Deadline Alert: Practical Lab Record & Code Analysis (CS-201)",
    preheader: "24-Hour Notice: Submit Your Solved Lab Record & Continuous Assessment Report.",
    headerTitle: "Urgent Deadline Alert",
    headerSub: "24 Hours Remaining Before Cutoff",
    defaultVars: {
      student_name: "Aarav Sharma",
      assignment_title: "Practical Lab Record & Code Analysis",
      course_name: "Data Structures & Algorithms (CS-201)",
      deadline: "Tomorrow, 11:59 PM IST",
      weightage: "15% Of Internal Sessional Marks",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#211506; color:#fbbf24; border:1px solid #f59e0b; margin-bottom:16px;">
  Assignment Due
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  This Is An Automated Academic Deadline Reminder For An Approaching Coursework Submission:
</p>

<div style="background:#211506; border:1px solid #f59e0b; border-left:4px solid #f59e0b; padding:16px; margin:18px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr><td style="padding:6px 0; color:#fbbf24;">Assignment Title:</td><td style="padding:6px 0; font-weight:700; text-align:right; color:#ffffff;">${v["assignment_title"]}</td></tr>
    <tr><td style="padding:6px 0; color:#fbbf24;">Subject Course:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">${v["course_name"]}</td></tr>
    <tr><td style="padding:6px 0; color:#fbbf24;">Submission Deadline:</td><td style="padding:6px 0; font-weight:800; text-align:right; color:#f59e0b;">${v["deadline"]}</td></tr>
    <tr><td style="padding:6px 0; color:#fbbf24;">Grading Weightage:</td><td style="padding:6px 0; text-align:right; color:#ffffff;">${v["weightage"]}</td></tr>
  </table>
</div>`,
  },
  {
    id: "promo_offer",
    category: "billing",
    name: "15. Promo Code Offer",
    badgeText: "Special Offer",
    badgeColor: "purple",
    subject: "Exclusive Scholarship Voucher: 40% Instant Flat Off On Semester Pass",
    preheader: "Enter Coupon TOPPER40 At Checkout For 40% Off Semester Pass.",
    headerTitle: "Exclusive Scholarship Voucher",
    headerSub: "Special Limited-Time Student Pass Discount",
    defaultVars: {
      student_name: "Aarav Sharma",
      promo_code: "TOPPER40",
      discount: "Flat 40% Off",
      valid_until: "End Of Sessional Exams",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#17102b; color:#a78bfa; border:1px solid #8b5cf6; margin-bottom:16px;">
  Special Offer
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  You Have Unlocked An Exclusive Student Scholarship Voucher. Enjoy <strong>${v["discount"]}</strong> On The Semester Pass:
</p>

<div style="background:#17102b; border:2px dashed #8b5cf6; padding:22px; margin:20px 0; text-align:center;">
  <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#c4b5fd; font-weight:800; margin-bottom:4px;">Enter Coupon At Checkout</div>
  <div style="font-family:monospace; font-size:34px; font-weight:900; color:#c4b5fd; letter-spacing:8px; margin:4px 0;">${v["promo_code"]}</div>
  <div style="font-size:12px; color:#e9d5ff; margin-top:6px; font-weight:600;">${v["discount"]} · Valid Until ${v["valid_until"]}</div>
</div>

<div style="background:#0b1d14; border:1px solid #10b981; padding:14px; margin-bottom:20px; font-size:12.5px; color:#a7f3d0; text-align:center;">
  Valid For All Semester Passes Including Handwritten Notes, Model PYQs, And Priority Lab Viva Packs.
</div>`,
  },
  {
    id: "ticket_resolved",
    category: "security",
    name: "16. Support Ticket Resolved",
    badgeText: "Inquiry Resolved",
    badgeColor: "emerald",
    subject: "Support Ticket Resolved [#82914]: Lab Practical Code Execution Error",
    preheader: "Your Academic Support Inquiry Has Been Addressed And Reprovisioned.",
    headerTitle: "Support Ticket Resolved",
    headerSub: "Grievance Inquiry Successfully Closed",
    defaultVars: {
      student_name: "Aarav Sharma",
      ticket_id: "#82914",
      ticket_subject: "Lab Practical Code Execution Error",
      resolution_summary: "We Have Updated The Source Python Script Inside Practical 4 And Cleared Cached Digital Rights Tokens. You Can Now Run The Lab Viva Code Directly In Your Browser.",
    },
    renderHtml: (v) => `
<span style="display:inline-block; font-family:monospace; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; padding:4px 10px; background:#0b1d14; color:#34d399; border:1px solid #10b981; margin-bottom:16px;">
  Inquiry Resolved
</span>
<p style="margin:0 0 10px 0; color:#ededed; font-size:14px;">Dear <strong>${v["student_name"]}</strong>,</p>
<p style="margin:0 0 16px 0; color:#ededed; font-size:13.5px; line-height:1.6;">
  Your Academic Inquiry (Ticket ${v["ticket_id"]}) Regarding <strong>${v["ticket_subject"]}</strong> Has Been Resolved By Operations:
</p>

<div style="background:#0b1d14; border:1px solid #10b981; border-left:4px solid #10b981; padding:16px; margin:18px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tr><td style="padding:6px 0; color:#94a3b8;">Ticket Number:</td><td style="padding:6px 0; font-family:monospace; text-align:right; color:#ffffff;">${v["ticket_id"]}</td></tr>
    <tr><td style="padding:6px 0; color:#94a3b8;">Inquiry Subject:</td><td style="padding:6px 0; font-weight:700; text-align:right; color:#ffffff;">${v["ticket_subject"]}</td></tr>
    <tr><td style="padding:6px 0; color:#94a3b8;">Resolution Outcome:</td><td style="padding:6px 0; font-weight:800; text-align:right; color:#34d399;">RESOLVED · CLOSED</td></tr>
  </table>
</div>

<div style="background:#141415; border:1px solid rgba(255,255,255,0.08); padding:16px; font-size:13px; color:#ededed; line-height:1.6; margin:16px 0;">
  <strong style="color:#34d399; text-transform:uppercase; font-size:11.5px; display:block; margin-bottom:6px;">Resolution Notes:</strong>
  ${v["resolution_summary"]}
</div>`,
  },
];

export function AdminEmailStudioTab() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("welcome");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [customVars, setCustomVars] = useState<Record<string, string>>({});
  const [testEmail, setTestEmail] = useState<string>("admin@saastascholar.in");
  const [sendingTest, setSendingTest] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const currentTemplate =
    EMAIL_STUDIO_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    EMAIL_STUDIO_TEMPLATES[0]!;

  // Reset or initialize custom vars whenever template changes
  useEffect(() => {
    setCustomVars(currentTemplate.defaultVars);
  }, [selectedTemplateId]);

  const filteredTemplates =
    activeCategory === "all"
      ? EMAIL_STUDIO_TEMPLATES
      : EMAIL_STUDIO_TEMPLATES.filter((t) => t.category === activeCategory);

  const fullEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin:0; padding:0; border-radius: 0 !important; }
    body { background-color: #141415; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #ededed; }
  </style>
</head>
<body style="background:#141415; padding: 24px 12px; margin: 0;">
  <table style="width: 100%; max-width: 600px; margin: 0 auto; background: #1c1d20; border: 1px solid rgba(255, 255, 255, 0.08); border-collapse: collapse;">
    <tr>
      <td style="background: #005F15; padding: 26px 24px; text-align: center; border-bottom: 2px solid #10b981;">
        <h1 style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.4px; margin: 0; text-transform: uppercase;">
          ${currentTemplate.headerTitle}
        </h1>
        <p style="color: #a7f3d0; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; margin: 6px 0 0 0;">
          ${currentTemplate.headerSub}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 24px; color: #ededed; font-size: 13.5px; line-height: 1.65; background: #1c1d20;">
        ${currentTemplate.renderHtml(customVars)}
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 24px; background: #141415; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-size: 11px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">&copy; 2026 <strong>SaastaScholar</strong> · Owned &amp; Engineered By DurgaAI Solutions.</p>
        <p style="margin: 0; font-size: 10px; color: #64748b;">Protected Under The Digital Personal Data Protection (DPDP) Act, 2023.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const handleSendLiveTest = async () => {
    if (!testEmail.trim()) {
      toast.error("Please Enter A Valid Test Email Address.");
      return;
    }
    try {
      setSendingTest(true);
      const res = await apiFetch<any>("/academic/admin/marketing/broadcast/", {
        method: "POST",
        body: JSON.stringify({
          subject: currentTemplate.subject,
          preheader: currentTemplate.preheader,
          content_html: currentTemplate.renderHtml(customVars),
          audience: "ALL",
          is_test: true,
          test_recipient: testEmail.trim(),
        }),
      });
      toast.success(res.message || `Test Email Dispatched To ${testEmail.trim()}!`);
    } catch (err: any) {
      toast.error(toTitleCase(err?.message || "Failed To Send Test Email. Verify SMTP Settings."));
    } finally {
      setSendingTest(false);
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(fullEmailHtml);
    setCopiedCode(true);
    toast.success("Complete Email HTML Copied To Clipboard.");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Studio Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-[#0a0b0e] p-6 sm:p-8 shadow-xl min-w-0">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Official Sharp Dark Studio</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white m-0">
              SaastaScholar Email Studio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed m-0">
              Live Interactive Email Simulator And Deliverability Dispatcher. Review Sharp Rectangular Dark Templates, Inspect Dynamic Metadata, And Transmit Cryptographic In-Inbox Test Proofs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/Email-Template.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0f1013] hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-xs"
            >
              <span>Full Standalone Studio</span>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Two-Column Studio Layout */}
      <div className="grid lg:grid-cols-[1.2fr_1.8fr] gap-6 items-start">
        {/* Left Column: Template Selector & Variable Editor */}
        <div className="space-y-5">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#0a0b0e] border border-white/10">
            {[
              { id: "all", label: "All Templates" },
              { id: "onboarding", label: "Onboarding" },
              { id: "academic", label: "Academic" },
              { id: "billing", label: "Billing" },
              { id: "security", label: "Security" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeCategory === cat.id
                    ? "bg-emerald-500 text-black shadow-xs font-extrabold"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Template Selection List */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12] p-3.5 space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-thin">
            {filteredTemplates.map((t) => {
              const isSelected = t.id === selectedTemplateId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                    isSelected
                      ? "border-emerald-500 bg-emerald-950/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                      : "border-white/5 bg-[#090a0c] hover:border-white/20 text-zinc-300"
                  )}
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs block truncate text-white">
                      {t.name}
                    </span>
                    <span className="text-[0.68rem] text-zinc-400 block truncate font-mono">
                      {t.subject}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[0.62rem] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 font-mono",
                      t.badgeColor === "rose"
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        : t.badgeColor === "amber"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : t.badgeColor === "purple"
                        ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    )}
                  >
                    {t.badgeText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Test Parameter Controls */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0e12] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-white m-0">
                Live Parameter Customizer
              </h3>
            </div>

            <div className="space-y-3">
              {Object.keys(currentTemplate.defaultVars).map((key) => (
                <div key={key}>
                  <label className="text-[0.7rem] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    {toTitleCase(key.replace("_", " "))}
                  </label>
                  <input
                    type="text"
                    value={customVars[key] || ""}
                    onChange={(e) =>
                      setCustomVars((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full h-9 rounded-xl border border-white/10 bg-[#07080a] px-3 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Live Test Box */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#0b1d14] p-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-white m-0">
                Dispatch Live Test Email
              </h3>
            </div>
            <p className="text-[0.7rem] text-emerald-200/80 m-0">
              Transmit An Instant Rendered Proof Directly To Your SMTP Server To Verify Layout Deliverability In Gmail, Outlook, And Apple Mail.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter Recipient Email Address"
                className="flex-1 h-10 rounded-xl border border-emerald-500/40 bg-[#050608] px-3 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={sendingTest}
                onClick={handleSendLiveTest}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-4 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-60 shrink-0"
              >
                {sendingTest ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Proof</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Device Previewer */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0e12] p-5 space-y-4">
          {/* Preview Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Live Inbox Simulator
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Device Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#07080a] border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                    previewDevice === "desktop"
                      ? "bg-emerald-500 text-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                  title="Desktop View (600px)"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={cn(
                    "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                    previewDevice === "mobile"
                      ? "bg-emerald-500 text-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                  title="Mobile View (360px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Copy HTML */}
              <button
                type="button"
                onClick={handleCopyHtml}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-[#0f1013] hover:bg-white/10 text-xs font-bold text-white transition-all cursor-pointer shadow-xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Copy HTML</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email Header Meta Inspector */}
          <div className="p-3 rounded-xl bg-[#07080a] border border-white/10 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-500 uppercase text-[0.65rem] w-14 shrink-0">Subject:</span>
              <span className="font-bold text-white truncate">{currentTemplate.subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-500 uppercase text-[0.65rem] w-14 shrink-0">Preheader:</span>
              <span className="text-zinc-400 text-[0.72rem] truncate">{currentTemplate.preheader}</span>
            </div>
          </div>

          {/* Simulated Email Frame */}
          <div className="flex justify-center bg-[#07080a] p-4 sm:p-8 rounded-2xl border border-white/5 overflow-hidden">
            <div
              className={cn(
                "transition-all duration-300 w-full overflow-hidden shadow-2xl",
                previewDevice === "mobile" ? "max-w-[360px]" : "max-w-[580px]"
              )}
            >
              {/* Email Card Table */}
              <div className="border border-white/10 bg-[#1c1d20] overflow-hidden">
                {/* Flat Header Cell */}
                <div className="bg-[#005F15] px-6 py-6 text-center text-white border-b-2 border-emerald-500">
                  <h2 className="text-lg font-black uppercase tracking-tight text-white m-0">
                    {currentTemplate.headerTitle}
                  </h2>
                  <p className="text-[0.68rem] font-bold text-emerald-200 uppercase tracking-widest mt-1 m-0">
                    {currentTemplate.headerSub}
                  </p>
                </div>

                {/* Email Body Cell */}
                <div
                  className="p-6 sm:p-8 text-zinc-200 text-xs sm:text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: currentTemplate.renderHtml(customVars),
                  }}
                />

                {/* Email Footer Cell */}
                <div className="bg-[#141415] border-t border-white/10 px-6 py-4 text-center text-[0.7rem] text-zinc-400 space-y-1">
                  <p className="m-0 font-medium text-zinc-300">
                    &copy; 2026 <strong>SaastaScholar</strong> · Owned &amp; Engineered By DurgaAI Solutions.
                  </p>
                  <p className="m-0 text-[0.62rem] text-zinc-500">
                    Protected Under The Digital Personal Data Protection (DPDP) Act, 2023.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
