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
} from "lucide-react";
import { useAuth } from "@/Hooks/UseAuth";
import { apiFetch } from "@/Lib/Api";
import { initiateRazorpayPayment } from "@/Lib/Razorpay";
import { toast } from "sonner";
import { cn } from "@/Lib/Utils";

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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "semester">("monthly");
  const [selectedTier, setSelectedTier] = useState<"BASIC" | "PREMIUM" | "ELITE" | null>(initialTier || null);

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

  const selectedPlan = selectedTier ? (PLANS.find((p) => p.tier === selectedTier) ?? null) : null;
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

  const handlePresetCoupon = (code: string) => {
    setCouponCode(code);
    setAppliedCoupon(null);
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
    <div className="space-y-6 p-3.5 sm:p-6 max-w-6xl mx-auto">
      {/* Header Banner - Compact & Modern */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/25 bg-gradient-to-br from-card/95 via-card/85 to-primary/5 p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-primary">
              <Crown className="h-3 w-3" />
              <span>SaastaScholar Academic Pass</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Upgrade Your Study Experience
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlock verified handwritten notes, solved 10-year examination papers, and practical lab code packets.
            </p>
          </div>

          {/* Current Membership Status Chip */}
          <div className="flex items-center gap-2.5 rounded-xl sm:rounded-2xl border border-border/80 bg-surface/80 px-3.5 py-2 shadow-2xs shrink-0">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const isSelected = selectedTier === plan.tier;
          const price = billingCycle === "semester" ? plan.priceSemester : plan.priceMonthly;

          return (
            <div
              key={plan.tier}
              onClick={() => {
                if (plan.tier !== "FREE") {
                  setSelectedTier(plan.tier);
                  setAppliedCoupon(null);
                }
              }}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-200",
                plan.tier !== "FREE" ? "cursor-pointer" : "opacity-90 cursor-default",
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/40 -translate-y-0.5"
                  : "border-border/80 bg-card hover:border-border hover:shadow-sm",
                plan.popular && !isSelected && "border-primary/40"
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
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
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
                  <div className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2 text-center text-xs font-bold text-emerald-500">
                    Active Pass
                  </div>
                ) : plan.tier === "FREE" ? (
                  <div className="w-full rounded-xl border border-border bg-muted/40 py-2 text-center text-xs font-semibold text-muted-foreground">
                    Free Included
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plan.tier !== "FREE") {
                        setSelectedTier(plan.tier);
                        setAppliedCoupon(null);
                      }
                    }}
                    className={cn(
                      "w-full rounded-xl py-2 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95",
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary-deep"
                        : "border border-border bg-card text-foreground hover:bg-muted"
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

      {/* Checkout & Coupon Section For Selected Plan - Short & Better UI/UX */}
      {selectedPlan ? (
        <div
          id="checkout-summary-section"
          className="mx-auto max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/35 bg-card/95 p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-3.5 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* Top Bar: Plan Info & Base Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/80">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-primary/10 border border-primary/25 px-2 py-0.5 text-[0.62rem] font-bold text-primary uppercase tracking-wider">
                  Step 2 · Checkout
                </span>
                <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[0.62rem] font-bold">
                  {selectedPlan.tier}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-foreground mt-0.5 truncate">
                {selectedPlan.name} · {billingCycle === "semester" ? "Semester Pass (180 Days)" : "Monthly Pass (30 Days)"}
              </h3>
            </div>
            <div className="flex items-baseline gap-1.5 sm:text-right shrink-0">
              <span className="text-[0.68rem] text-muted-foreground uppercase font-bold">Standard:</span>
              <span className="text-base font-mono font-bold text-foreground">₹{basePrice}</span>
            </div>
          </div>

          {/* Compact Inline Coupon Box */}
          <div className="rounded-xl border border-border/70 bg-surface/50 p-2.5 sm:p-3 space-y-2">
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="font-mono font-black text-foreground text-xs">{appliedCoupon.code}</span>
                  <span className="rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[0.65rem] px-1.5 py-0.5 truncate">
                    {appliedCoupon.discount_percent > 0 ? `${appliedCoupon.discount_percent}% OFF` : `₹${appliedCoupon.discount_amount_inr} OFF`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-500 hover:text-rose-400 cursor-pointer shrink-0 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code (e.g. SAASTA20)"
                      className="h-8.5 w-full rounded-xl border border-border bg-card pr-3 pl-8 text-xs font-mono uppercase focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="h-8.5 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-deep transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-xs active:scale-95"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {/* Micro Quick Code Chips */}
                <div className="flex items-center gap-1.5 flex-wrap text-[0.65rem]">
                  <span className="text-muted-foreground font-semibold">Quick Codes:</span>
                  <button
                    type="button"
                    onClick={() => handlePresetCoupon("SAASTA20")}
                    className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer"
                  >
                    SAASTA20 (20% OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetCoupon("FREEDOM100")}
                    className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    FREEDOM100 (100% FREE)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Compact Payable Bar & Proceed Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs uppercase font-bold text-muted-foreground">Total:</span>
              {appliedCoupon ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground line-through font-mono">₹{basePrice}</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">₹{appliedCoupon.final_amount_inr}</span>
                </div>
              ) : (
                <span className="text-xl sm:text-2xl font-black text-foreground font-mono">₹{basePrice}</span>
              )}
              <span className="text-[0.65rem] text-muted-foreground font-medium">(GST Included)</span>
            </div>

            <button
              type="button"
              onClick={handleInitiateUpgrade}
              disabled={upgrading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-deep active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {upgrading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    Pay ₹{appliedCoupon ? appliedCoupon.final_amount_inr : basePrice} Via Razorpay
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
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
            <span>Official Tax Invoice</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-5 text-center space-y-1.5">
          <div className="mx-auto h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Zap className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-foreground">Step 1: Choose Your Academic Plan Above</h3>
          <p className="text-[0.7rem] text-muted-foreground max-w-sm mx-auto">
            Select a plan above to view voucher discounts and activate instant checkout.
          </p>
        </div>
      )}
    </div>
  );
}
