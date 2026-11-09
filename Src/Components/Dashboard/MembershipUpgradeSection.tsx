import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Crown,
  Sparkles,
  Tag,
  Zap,
  ArrowRight,
  ShieldCheck,
  Percent,
  FileText,
  Printer,
  ArrowDownCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/Hooks/UseAuth";
import { apiFetch, studentSubscriptionApi } from "@/Lib/Api";
import { initiateRazorpayPayment } from "@/Lib/Razorpay";
import { toast } from "sonner";
import { cn } from "@/Lib/Utils";
import { StudentInvoiceModal } from "./StudentInvoiceModal";
import { AcademicInvoiceData } from "@/Utils/InvoicePrinter";

interface PlanItem {
  tier: "FREE" | "BASIC" | "PREMIUM" | "ELITE";
  name: string;
  tagline: string;
  priceMonthly: number;
  priceSemester: number;
  popular?: boolean;
  badge?: string;
  features: string[];
}

const PLANS: PlanItem[] = [
  {
    tier: "FREE",
    name: "Free Scholar",
    tagline: "Essential Academic Information",
    priceMonthly: 0,
    priceSemester: 0,
    features: [
      "Official University Syllabus Explorer",
      "Class Routine & Semester Timetable",
      "Teacher Handouts & Class Slides",
      "Department Examination & College Notices",
      "Community Student Forum & Help Desk",
    ],
  },
  {
    tier: "BASIC",
    name: "Basic Scholar",
    tagline: "For Diligent Daily Study",
    priceMonthly: 99,
    priceSemester: 499,
    features: [
      "Everything In Free Scholar Plan",
      "Complete Verified Handwritten Class Notes",
      "DRM-Protected In-Browser Academic Reader",
      "High-Resolution Diagram Views & Zoom",
      "Personalized Subject Revision Bookmarks",
    ],
  },
  {
    tier: "PREMIUM",
    name: "Premium Achiever",
    tagline: "Comprehensive Exam & Lab Mastery",
    priceMonthly: 129,
    priceSemester: 649,
    popular: true,
    badge: "Most Popular",
    features: [
      "Everything In Basic Scholar Plan",
      "Handwritten Lab Manuals & Code Executions",
      "Viva Voce Oral Exam Question Bank & Hints",
      "10-Year Solved University Examination Papers (PYQs)",
      "Daily Assignment Helper & Model Solutions",
    ],
  },
  {
    tier: "ELITE",
    name: "Elite Scholar",
    tagline: "Total Academic Domination",
    priceMonthly: 159,
    priceSemester: 799,
    badge: "Best Value",
    features: [
      "Everything In Premium Achiever Plan",
      "Most Expected Examination Guess Papers",
      "Pre-Exam Sample Practice Test Series",
      "Priority Direct Faculty Academic Guidance",
      "Zero Download Limitations & Fast DRM Caching",
    ],
  },
];

const TIER_RANK: Record<string, number> = {
  FREE: 0,
  BASIC: 1,
  PREMIUM: 2,
  ELITE: 3,
};

interface MembershipUpgradeSectionProps {
  initialTier?: "BASIC" | "PREMIUM" | "ELITE";
  onUpgradeSuccess?: () => void;
}

export function MembershipUpgradeSection({
  initialTier,
  onUpgradeSuccess,
}: MembershipUpgradeSectionProps) {
  const { user, refreshUser } = useAuth();
  const currentTier = (user?.access_tier || "FREE").toUpperCase();
  const currentRank = TIER_RANK[currentTier] ?? 0;
  const isElite = currentTier === "ELITE";
  const isPaidScholar = currentRank > 0;

  const [billingCycle, setBillingCycle] = useState<"monthly" | "semester">("monthly");
  const [selectedTier, setSelectedTier] = useState<"BASIC" | "PREMIUM" | "ELITE" | null>(initialTier || null);

  // Cancellation & Downgrade Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [downgrading, setDowngrading] = useState<boolean>(false);

  // Discount Coupon State
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_percent: number;
    discount_amount_inr: number;
    final_amount_inr: number;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [upgrading, setUpgrading] = useState<boolean>(false);

  // Self-Service Academic Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<AcademicInvoiceData | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(false);

  const handleFetchAndOpenInvoice = async () => {
    setInvoiceLoading(true);
    setInvoiceModalOpen(true);
    try {
      const res = await studentSubscriptionApi.getMyInvoices();
      if (res?.latest_invoice) {
        setInvoiceData(res.latest_invoice);
      } else {
        toast.error("No Academic Invoice Record Found.");
      }
    } catch (err: any) {
      toast.error("Failed To Load Official Academic Invoice.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleConfirmCancelPlan = async () => {
    try {
      setCancelling(true);
      const res = await studentSubscriptionApi.cancelSubscription();
      toast.success(res.message || "Your Paid Subscription Has Been Cancelled. Reverted To Free Scholar.");
      setCancelModalOpen(false);
      setSelectedTier(null);
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed To Cancel Subscription.");
    } finally {
      setCancelling(false);
    }
  };

  const handleInstantDowngrade = async (targetTier: string) => {
    try {
      setDowngrading(true);
      const res = await studentSubscriptionApi.downgradeSubscription(targetTier);
      toast.success(res.message || `Successfully Downgraded To ${targetTier.toUpperCase()} Scholar Pass.`);
      setSelectedTier(null);
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed To Downgrade Subscription.");
    } finally {
      setDowngrading(false);
    }
  };

  const selectedPlan = selectedTier ? (PLANS.find((p) => p.tier === selectedTier) ?? null) : null;
  const selectedRank = selectedPlan ? (TIER_RANK[selectedPlan.tier] ?? 0) : 0;
  const isDowngradeSelected = selectedPlan ? selectedRank < currentRank : false;
  const basePrice = selectedPlan ? (billingCycle === "semester" ? selectedPlan.priceSemester : selectedPlan.priceMonthly) : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please Enter A Valid Coupon Code.");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await apiFetch<any>("/subscriptions/apply-coupon/", {
        method: "POST",
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          plan_tier: selectedTier,
          cycle: billingCycle,
        }),
      });
      if (res.valid) {
        setAppliedCoupon(res);
        toast.success(res.message || `Coupon "${res.code}" Applied Successfully!`);
      } else {
        toast.error(res.error || "Invalid Or Expired Coupon Code.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed To Apply Coupon Code.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon Code Removed.");
  };

  const handleInitiateUpgrade = () => {
    if (!selectedTier || !selectedPlan) {
      toast.error("Please Select An Academic Plan First.");
      return;
    }
    setUpgrading(true);
    initiateRazorpayPayment({
      planTier: selectedTier,
      cycle: billingCycle,
      couponCode: appliedCoupon?.code || undefined,
      onSuccess: async () => {
        setUpgrading(false);
        toast.success(`Congratulations! You Have Upgraded To ${selectedPlan.name}.`);
        if (refreshUser) {
          await refreshUser();
        }
        if (onUpgradeSuccess) {
          onUpgradeSuccess();
        }
      },
      onError: (err) => {
        setUpgrading(false);
        toast.error(err?.message || "Payment Gateway Dismissed. No Charges Were Made.");
      },
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2.5 xs:p-3.5 sm:p-6 max-w-6xl mx-auto min-w-0">
      {/* Header Banner - Compact & Modern */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/25 bg-gradient-to-br from-card/95 via-card/85 to-primary/5 p-3.5 xs:p-4.5 sm:p-6 shadow-lg min-w-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 sm:gap-4 min-w-0">
          <div className="space-y-1.5 max-w-xl min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[0.62rem] xs:text-[0.68rem] font-bold text-primary">
              <Crown className="h-3 w-3 shrink-0" />
              <span>{isElite ? "SaastaScholar Elite Pass Active" : "SaastaScholar Academic Pass"}</span>
            </div>
            <h1 className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight text-foreground break-words leading-tight">
              {isElite
                ? "Manage Academic Pass & Membership"
                : isPaidScholar
                ? "Academic Pass & Plan Management"
                : "Upgrade Your Study Experience"}
            </h1>
            <p className="text-[0.7rem] xs:text-xs text-muted-foreground leading-relaxed break-words">
              {isElite
                ? "You are currently enjoying maximum tier privileges on the Elite Scholar Pass. Manage, downgrade to another plan, or cancel your subscription below."
                : isPaidScholar
                ? "Manage your active pass privileges, switch plans, or view and download official GST tax invoices."
                : "Unlock Verified Handwritten Notes, Solved 10-Year Examination Papers, and Practical Lab Code Packets."}
            </p>
          </div>

          {/* Current Membership Status Chip, Cancel Plan Button & Self-Service Invoice Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2.5 rounded-xl sm:rounded-2xl border border-border/80 bg-surface/80 px-3.5 py-2 shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground block">
                  Active Pass
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-primary">
                    {currentTier} SCHOLAR
                  </span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
              </div>
            </div>

            {isPaidScholar && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl sm:rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all cursor-pointer active:scale-95 shadow-2xs"
                title="Cancel your paid plan and revert to Free Scholar"
              >
                <ArrowDownCircle className="h-3.5 w-3.5" />
                <span>Cancel Plan</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleFetchAndOpenInvoice}
              className="inline-flex items-center gap-1.5 rounded-xl sm:rounded-2xl border border-primary/30 bg-primary/10 hover:bg-primary/20 px-3 py-2 text-xs font-bold text-primary transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="View and print your official academic fee tax invoice"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Tax Invoice</span>
            </button>
          </div>
        </div>

        {/* Billing Cycle Pill Switcher - Compact */}
        <div className="mt-4 pt-3 border-t border-border/60 flex justify-center">
          <div className="inline-flex items-center rounded-xl border border-border/80 bg-surface/90 p-1 shadow-inner text-xs">
            <button
              type="button"
              onClick={() => {
                setBillingCycle("monthly");
                setAppliedCoupon(null);
              }}
              className={cn(
                "rounded-lg px-4 py-1.5 font-bold transition-all cursor-pointer text-xs",
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => {
                setBillingCycle("semester");
                setAppliedCoupon(null);
              }}
              className={cn(
                "relative rounded-lg px-4 py-1.5 font-bold transition-all cursor-pointer flex items-center gap-1 text-xs",
                billingCycle === "semester"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Semester Pass</span>
              <span className={cn(
                "rounded-full px-1.5 py-0.2 text-[0.6rem] font-extrabold",
                billingCycle === "semester" ? "bg-black/20 text-white" : "bg-primary/20 text-primary"
              )}>
                -35%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 min-w-0">
        {PLANS.map((plan) => {
          const planRank = TIER_RANK[plan.tier] ?? 0;
          const isCurrent = currentTier === plan.tier;
          const isSelected = selectedTier === plan.tier;
          const isDowngrade = isPaidScholar && planRank < currentRank;
          const price = billingCycle === "semester" ? plan.priceSemester : plan.priceMonthly;

          return (
            <div
              key={plan.tier}
              onClick={() => {
                if (plan.tier === "FREE" && isPaidScholar) {
                  setCancelModalOpen(true);
                } else if (plan.tier !== "FREE") {
                  setSelectedTier(plan.tier);
                  setAppliedCoupon(null);
                }
              }}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-200",
                plan.tier !== "FREE" || isPaidScholar ? "cursor-pointer" : "opacity-90 cursor-default",
                isSelected
                  ? isDowngrade
                    ? "border-amber-500/50 bg-amber-500/[0.04] shadow-md ring-1 ring-amber-500/30 -translate-y-0.5"
                    : "border-primary bg-primary/[0.04] shadow-md ring-1 ring-primary/30 -translate-y-0.5"
                  : isDowngrade && isElite
                  ? "border-border/80 bg-card hover:border-amber-500/40 hover:shadow-xs"
                  : "border-border/80 bg-card hover:border-border hover:shadow-xs",
                plan.popular && !isSelected && !isElite && "border-primary/40"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-primary-foreground shadow-xs">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-extrabold text-foreground">{plan.name}</h3>
                  {isSelected && (
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isDowngrade ? "text-amber-400" : "text-primary"
                      )}
                    />
                  )}
                </div>

                <p className="mt-1 text-[0.7rem] sm:text-xs text-muted-foreground min-h-[28px]">{plan.tagline}</p>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-foreground">₹{price}</span>
                  <span className="text-[0.68rem] text-muted-foreground">
                    {price === 0 ? "Forever" : billingCycle === "semester" ? "/ Semester" : "/ Month"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-border/60 pt-3 text-xs">
                  <span className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground block">
                    Plan Privileges
                  </span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[0.7rem] sm:text-xs">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60">
                {isCurrent ? (
                  <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-center text-xs font-bold text-emerald-400">
                    Active Pass
                  </div>
                ) : plan.tier === "FREE" && isPaidScholar ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCancelModalOpen(true);
                    }}
                    className="w-full rounded-xl py-2 text-xs font-bold border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <ArrowDownCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Cancel / Downgrade To Free</span>
                  </button>
                ) : plan.tier === "FREE" ? (
                  <div className="w-full rounded-xl border border-border bg-muted/40 py-2 text-center text-xs font-semibold text-muted-foreground">
                    Free Included
                  </div>
                ) : isDowngrade ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plan.tier !== "FREE") {
                        setSelectedTier(plan.tier);
                      }
                      setAppliedCoupon(null);
                    }}
                    className={cn(
                      "w-full rounded-xl py-2 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5",
                      isSelected
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "border border-border/80 bg-surface/60 text-muted-foreground hover:text-foreground hover:bg-surface"
                    )}
                  >
                    <ArrowDownCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {isSelected ? "Selected For Downgrade" : `Downgrade To ${plan.name.replace(" Scholar", "").replace(" Achiever", "")}`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plan.tier !== "FREE") {
                        setSelectedTier(plan.tier);
                      }
                      setAppliedCoupon(null);
                    }}
                    className={cn(
                      "w-full rounded-xl py-2 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95",
                      isSelected
                        ? "bg-primary text-zinc-950 font-bold hover:bg-emerald-500"
                        : "border border-border/80 bg-surface/60 text-foreground hover:bg-surface"
                    )}
                  >
                    {isSelected ? "Selected" : "Select Plan"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout & Action Section For Selected Plan - Wide, Responsive, High Contrast Graphite */}
      {selectedPlan ? (
        <div
          id="checkout-summary-section"
          className={cn(
            "mx-auto w-full max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
            isDowngradeSelected
              ? "border-amber-500/30 bg-[#18191d]"
              : "border-white/[0.08] bg-[#18191d]"
          )}
        >
          {/* Top Bar: Plan Info & Base Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/[0.08]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider",
                    isDowngradeSelected
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  )}
                >
                  {isDowngradeSelected ? "Plan Downgrade" : "Step 2 · Checkout"}
                </span>
                <span className="rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.08] px-2 py-0.5 text-[0.62rem] font-bold">
                  {selectedPlan.tier}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
                {isDowngradeSelected ? `Downgrade To ${selectedPlan.name}` : selectedPlan.name} · {billingCycle === "semester" ? "Semester Pass (180 Days)" : "Monthly Pass (30 Days)"}
              </h3>
              {isDowngradeSelected && (
                <p className="text-xs text-zinc-400 mt-1">
                  You Are Downgrading From Your Current {currentTier} Scholar Tier To {selectedPlan.name}. You Can Apply The Instant Downgrade Or Renew Via Razorpay.
                </p>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 sm:text-right shrink-0">
              <span className="text-[0.68rem] text-zinc-400 uppercase font-bold">Standard:</span>
              <span className="text-base font-mono font-bold text-white">₹{basePrice}</span>
            </div>
          </div>

          {/* Compact Inline Coupon Box */}
          <div className="rounded-xl border border-white/[0.08] bg-[#121316] p-3 space-y-2">
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-mono font-bold text-white text-xs">{appliedCoupon.code}</span>
                  <span className="rounded-lg bg-emerald-500/15 text-emerald-400 font-bold text-[0.65rem] px-2 py-0.5 truncate border border-emerald-500/20">
                    {appliedCoupon.discount_percent > 0 ? `${appliedCoupon.discount_percent}% OFF` : `₹${appliedCoupon.discount_amount_inr} OFF`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer shrink-0 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Promotional Voucher Code (e.g. SCHOLAR50)"
                    className="h-9 w-full rounded-xl border border-white/[0.08] bg-[#18191d] pr-3 pl-9 text-xs font-mono uppercase text-white placeholder:normal-case placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="h-9 px-4 rounded-xl bg-primary text-zinc-950 text-xs font-bold hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm active:scale-95"
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Instant Downgrade or Payment / Checkout - Robust Unbroken Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1 border-t border-white/[0.06]">
            {/* Total Section - ALWAYS On A Single Clean Row */}
            <div className="flex items-baseline gap-2 whitespace-nowrap shrink-0">
              <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Total:</span>
              {appliedCoupon ? (
                <div className="inline-flex items-baseline gap-2 whitespace-nowrap">
                  <span className="text-xs text-zinc-500 line-through font-mono">₹{basePrice}</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">₹{appliedCoupon.final_amount_inr}</span>
                </div>
              ) : (
                <span className="text-2xl font-black text-white font-mono tracking-tight">₹{basePrice}</span>
              )}
              <span className="text-[0.7rem] text-zinc-400 font-medium">(GST Included)</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 justify-end">
              {isDowngradeSelected && (
                <button
                  type="button"
                  onClick={() => handleInstantDowngrade(selectedPlan.tier)}
                  disabled={downgrading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 px-4 text-xs font-bold transition-all hover:bg-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-60 whitespace-nowrap shadow-sm"
                >
                  {downgrading ? (
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  ) : (
                    <ArrowDownCircle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>Apply Instant Downgrade</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleInitiateUpgrade}
                disabled={upgrading}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer whitespace-nowrap",
                  isDowngradeSelected
                    ? "bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.1]"
                    : "bg-primary hover:bg-emerald-500 text-zinc-950 font-bold"
                )}
              >
                {upgrading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 shrink-0" />
                    <span>
                      {isDowngradeSelected
                        ? `Renew At ₹${appliedCoupon ? appliedCoupon.final_amount_inr : basePrice} Via Razorpay`
                        : `Upgrade Now · ₹${appliedCoupon ? appliedCoupon.final_amount_inr : basePrice}`}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Single Compact Trust Line */}
          <div className="flex items-center justify-center gap-2.5 pt-2 text-[0.62rem] text-muted-foreground border-t border-border/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              256-Bit Encrypted Gateway
            </span>
            <span>•</span>
            <span>Instant Access</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleFetchAndOpenInvoice}
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
            >
              <FileText className="h-2.5 w-2.5" />
              <span>Official Tax Invoice</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-5 text-center space-y-1.5">
          <div className="mx-auto h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Zap className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-foreground">
            {isElite
              ? "Select A Plan Above To Downgrade Or Manage Billing"
              : "Step 1: Choose Your Academic Plan Above"}
          </h3>
          <p className="text-[0.7rem] text-muted-foreground max-w-sm mx-auto">
            {isElite
              ? "Choose Basic or Premium to downgrade your membership, or click Cancel Plan to revert to Free Scholar."
              : "Select A Plan Above To View Voucher Discounts And Activate Instant Checkout."}
          </p>
        </div>
      )}

      {/* Official Self-Service Student Tax Invoice Modal */}
      <StudentInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        invoice={invoiceData}
        loading={invoiceLoading}
      />

      {/* Cancellation / Revert to Free Confirmation Modal - Clean Graphite */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#18191d] p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Cancel {currentTier} Scholar Pass?
                </h3>
                <p className="text-xs text-zinc-400">
                  Revert Your Account To The Free Scholar Plan.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#121316] p-3.5 space-y-2 text-xs">
              <p className="font-bold text-zinc-300">
                You Will Lose Instant Access To:
              </p>
              <ul className="space-y-1.5 text-zinc-400 list-disc list-inside text-xs">
                <li>10-Year Solved University Examination Papers</li>
                <li>Full Laboratory Manuals &amp; Viva Code Packets</li>
                <li>Faculty Priority Academic Guidance &amp; Daily Model Solutions</li>
                <li>Offline DRM Note Caching &amp; High-Resolution Diagrams</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/[0.08] hover:text-white cursor-pointer transition-colors"
              >
                Keep My Active Pass
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelPlan}
                disabled={cancelling}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                {cancelling ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ArrowDownCircle className="h-3.5 w-3.5" />
                )}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
