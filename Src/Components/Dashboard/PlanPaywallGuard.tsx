import React from "react";
import { Lock, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface PlanPaywallGuardProps {
  tabTitle: string;
  requiredTier: "BASIC" | "PREMIUM" | "ELITE";
  onUpgradeClick: (tier: "BASIC" | "PREMIUM" | "ELITE") => void;
}

const TIER_FEATURES: Record<"BASIC" | "PREMIUM" | "ELITE", { name: string; price: string; features: string[] }> = {
  BASIC: {
    name: "Basic Scholar Plan",
    price: "₹99/mo",
    features: [
      "Full Access To Verified Handwritten Class Notes",
      "Official University Syllabus Tracker",
      "DRM-Protected In-Browser Academic Reader",
      "Semester Timetable & Class Routine Planner",
    ],
  },
  PREMIUM: {
    name: "Premium Achiever Plan",
    price: "₹129/mo",
    features: [
      "Everything In Basic Scholar Plan",
      "Full Handwritten Lab Manuals & Code Implementations",
      "Viva Voce Oral Exam Preparation Question Bank",
      "10-Year Solved University Examination Papers (PYQs)",
      "Daily Assignment Helper & Reference Models",
    ],
  },
  ELITE: {
    name: "Elite Lifetime Scholar Plan",
    price: "₹159/mo",
    features: [
      "Everything In Premium Achiever Plan",
      "Most Expected Examination Guess Papers",
      "Pre-Exam Sample Practice Test Series",
      "Priority Direct Faculty Academic Guidance",
      "Unrestricted High-Speed Offline DRM Caching",
    ],
  },
};

export function PlanPaywallGuard({ tabTitle, requiredTier, onUpgradeClick }: PlanPaywallGuardProps) {
  const planInfo = TIER_FEATURES[requiredTier] ?? TIER_FEATURES["PREMIUM"];

  return (
    <div className="flex min-h-[520px] w-full items-center justify-center p-4 sm:p-8">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-primary/25 bg-card/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl text-center">
        {/* Ambient Emerald Glow Background */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Lock Icon */}
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/30 shadow-inner">
            <Lock className="h-10 w-10 text-primary animate-pulse" />
            <div className="absolute -top-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs shadow-md">
              <Zap className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>

          {/* Badges & Heading */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Requires {planInfo.name}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {tabTitle} Is Locked
          </h2>

          <p className="mt-2.5 max-w-lg text-sm text-muted-foreground leading-relaxed">
            This Section Contains Exclusive Academic Materials Reserved For{" "}
            <strong className="text-foreground">{planInfo.name}</strong> Members. Upgrade Your Pass To Unlock Immediate Access.
          </p>

          {/* Feature Checklist Box */}
          <div className="mt-6 w-full rounded-2xl border border-border/80 bg-background/60 p-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                What You Unlock With {planInfo.name}:
              </span>
              <span className="text-sm font-extrabold text-primary">{planInfo.price}</span>
            </div>

            <ul className="mt-3.5 space-y-2.5">
              {planInfo.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug text-foreground/90 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
            <button
              type="button"
              onClick={() => onUpgradeClick(requiredTier)}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-deep hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Upgrade To {planInfo.name}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3.5 text-[0.65rem] text-muted-foreground italic">
            Instant Activation • Secure Razorpay Payment • 100% Academic Satisfaction Guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
