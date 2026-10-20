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
  initialTier = "PREMIUM",
  onUpgradeSuccess,
}: MembershipUpgradeSectionProps) {
  const { user, refreshUser } = useAuth();
  const currentTier = (user?.access_tier || "FREE").toUpperCase();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "semester">("monthly");
  const [selectedTier, setSelectedTier] = useState<"BASIC" | "PREMIUM" | "ELITE">(initialTier);

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

  const selectedPlan = PLANS.find((p) => p.tier === selectedTier) ?? (PLANS[2] as (typeof PLANS)[number]);
  const basePrice = billingCycle === "semester" ? selectedPlan.priceSemester : selectedPlan.priceMonthly;

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
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-card/95 via-card/85 to-primary/5 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Crown className="h-3.5 w-3.5" />
              <span>Academic Membership Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Upgrade Your Study Experience
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unlock Verified Handwritten Notes, Solved 10-Year Examination Papers, And Viva Voce Question Banks Tailored For Your University Curriculum.
            </p>
          </div>

          {/* Current Membership Status Badge */}
          <div className="flex flex-col items-start md:items-end rounded-2xl border border-border/80 bg-background/80 p-4 shadow-sm min-w-[220px]">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              Current Active Pass
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-black text-primary">
                {currentTier} SCHOLAR
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">
              {currentTier === "FREE" ? "Standard Free Access" : "Full Benefits Unlocked"}
            </span>
          </div>
        </div>

        {/* Billing Cycle Pill Switcher */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center rounded-2xl border border-border/80 bg-muted/60 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setBillingCycle("monthly");
                setAppliedCoupon(null);
              }}
              className={cn(
                "rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer",
                billingCycle === "monthly"
                  ? "bg-card text-foreground shadow-sm"
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
                "relative rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                billingCycle === "semester"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Semester Pass</span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[0.62rem] font-extrabold text-primary">
                Save 35%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                "relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300",
                plan.tier !== "FREE" ? "cursor-pointer" : "opacity-90 cursor-default",
                isSelected
                  ? "border-primary bg-primary/5 shadow-xl ring-2 ring-primary/40 -translate-y-1"
                  : "border-border/80 bg-card hover:border-border hover:shadow-md",
                plan.popular && !isSelected && "border-primary/40"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-primary-foreground shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-foreground">{plan.name}</h3>
                  {isSelected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                </div>

                <p className="mt-1 text-xs text-muted-foreground min-h-[32px]">{plan.tagline}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground">₹{price}</span>
                  <span className="text-xs text-muted-foreground">
                    {price === 0 ? "Forever" : billingCycle === "semester" ? "/ Semester" : "/ Month"}
                  </span>
                </div>

                <div className="mt-6 space-y-2.5 border-t border-border/60 pt-5">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground block">
                    Plan Privileges
                  </span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                {isCurrent ? (
                  <div className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-center text-xs font-bold text-emerald-500">
                    Current Active Pass
                  </div>
                ) : plan.tier === "FREE" ? (
                  <div className="w-full rounded-2xl border border-border bg-muted/40 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                    Free Tier Included
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
                      "w-full rounded-2xl py-2.5 text-xs font-bold transition-all cursor-pointer shadow-sm",
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary-deep"
                        : "border border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    {isSelected ? "Selected Plan" : "Select Plan"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout & Coupon Section For Selected Plan */}
      {Boolean(selectedPlan) && (
        <div className="overflow-hidden rounded-3xl border border-primary/30 bg-card p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Checkout Summary
              </span>
              <h2 className="text-xl font-extrabold text-foreground mt-0.5">
                Upgrading To {selectedPlan.name} ({billingCycle === "semester" ? "Semester Pass" : "Monthly Pass"})
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Standard Price</span>
              <p className="text-xl font-black text-foreground">₹{basePrice}</p>
            </div>
          </div>

          {/* Promotional Coupon Voucher Box */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-bold text-foreground">
                  Have A Promotional Discount Coupon Or Voucher?
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[0.68rem] text-muted-foreground">Popular Vouchers:</span>
                <button
                  type="button"
                  onClick={() => handlePresetCoupon("SAASTA20")}
                  className="rounded-lg border border-primary/30 bg-background px-2.5 py-1 text-[0.65rem] font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  SAASTA20 (20% Off)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetCoupon("FREEDOM100")}
                  className="rounded-lg border border-emerald-500/30 bg-background px-2.5 py-1 text-[0.65rem] font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  FREEDOM100 (100% Free)
                </button>
              </div>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-mono font-bold text-foreground">{appliedCoupon.code}</span>
                    <span className="ml-2 font-semibold text-emerald-500">
                      {appliedCoupon.discount_percent > 0
                        ? `${appliedCoupon.discount_percent}% Off Applied`
                        : `₹${appliedCoupon.discount_amount_inr} Off Applied`}
                    </span>
                    <p className="text-[0.68rem] text-muted-foreground mt-0.5">{appliedCoupon.message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-500 hover:text-rose-400 cursor-pointer"
                >
                  Remove Voucher
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Percent className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code (e.g. SAASTA20)"
                    className="h-11 w-full rounded-xl border border-border bg-background pr-3 pl-10 text-xs font-mono uppercase focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="h-11 w-full sm:w-auto px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-deep transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {couponLoading ? "Validating..." : "Apply Coupon"}
                </button>
              </div>
            )}
          </div>

          {/* Final Payable & Upgrade Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <div>
              <span className="text-xs text-muted-foreground">Total Payable Amount</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                {appliedCoupon ? (
                  <>
                    <span className="text-base text-muted-foreground line-through">₹{basePrice}</span>
                    <span className="text-3xl font-black text-emerald-500">
                      ₹{appliedCoupon.final_amount_inr}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-foreground">₹{basePrice}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  (Includes GST & Razorpay Gateway)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInitiateUpgrade}
              disabled={upgrading}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-deep hover:shadow-xl active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {upgrading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Proceed To Pay ₹
                    {appliedCoupon ? appliedCoupon.final_amount_inr : basePrice} Via Razorpay
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-[0.68rem] text-muted-foreground border-t border-border/40">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              256-Bit Encrypted Razorpay Gateway
            </span>
            <span>•</span>
            <span>Instant Membership Activation</span>
            <span>•</span>
            <span>Official Digital Tax Invoice Generated</span>
          </div>
        </div>
      )}
    </div>
  );
}
