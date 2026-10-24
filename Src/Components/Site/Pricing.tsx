import {
  ArrowRight,
  Award,
  CheckCircle2,
  Crown,
  Flame,
  GraduationCap,
  Percent,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/Hooks/UseAuth";
import { initiateRazorpayPayment } from "@/Lib/Razorpay";

import { cn } from "@/Lib/Utils";
import { Cta, Reveal, Section, SectionHeading } from "./Primitives";

export function Pricing() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "semester">("semester");

  const isSemester = billingCycle === "semester";

  // Pricing Model Aligned With Saasta Scholar Specifications:
  // Monthly Base: Starter: Free | Scholar: ₹99/mo | Achiever: ₹129/mo | Elite+: ₹159/mo
  // Semester Discount (15% Student Discount with 5% GST Included / Rounded):
  // Scholar: ₹88/mo (₹499/sem) | Achiever: ₹115/mo (₹649/sem) | Elite+: ₹142/mo (₹799/sem)
  const PLANS = [
    {
      id: "free",
      tierCode: "FREE",
      name: "Free",
      tagline: "Syllabus , Time Table , Faculty Materials , Notices , Exam Dates",
      monthlyPrice: "₹0",
      semesterPrice: "₹0",
      period: "Free Access",
      subPrice: "Instant Activation · Zero Cost",
      popular: false,
      badge: "Instant Access",
      features: [
        "Official University Syllabus",
        "Daily Class Timetable",
        "Faculty Materials & Lecture Handouts",
        "Official Notices & Circulars",
        "Exam Dates & Hall Ticket Alerts",
      ],
      cta: "Get Started Free",
      variant: "outline" as const,
      highlight: "Free Forever",
    },
    {
      id: "basic",
      tierCode: "BASIC",
      name: "Basic",
      tagline: "Free + Handwritten Notes",
      monthlyPrice: "₹99",
      semesterPrice: "₹88",
      semesterTotal: "₹499 / sem",
      period: isSemester ? "/ Month" : "/ Month",
      subPrice: isSemester ? "Billed ₹499 Per Semester · Save 15%" : "Standard Monthly Plan",
      popular: false,
      badge: "Notes Pack",
      features: [
        "Everything In Free Plan",
        "Complete Handwritten Unit Notes",
        "Chapter Formula Sheets & Cheat Decks",
        "High-Speed Mobile & PC Study Reader",
      ],
      cta: "Choose Basic Plan",
      variant: "outline" as const,
      highlight: "Popular For Notes",
    },
    {
      id: "premium",
      tierCode: "PREMIUM",
      name: "Premium",
      tagline: "Basic + Handwritten Lab Manual And Viva Practice + PYQ Question Papers",
      monthlyPrice: "₹129",
      semesterPrice: "₹115",
      semesterTotal: "₹649 / sem",
      period: isSemester ? "/ Month" : "/ Month",
      subPrice: isSemester ? "Billed ₹649 Per Semester · Save 15%" : "Standard Monthly Plan",
      popular: true,
      badge: "Best Value · Most Popular",
      features: [
        "Everything In Basic Plan",
        "Handwritten Lab Manuals & Codes",
        "Viva Voce Practice Q&A Bank (Top 50+)",
        "5+ Years Solved PYQ Question Papers",
        "Step-by-Step Model Answers",
      ],
      cta: "Get Premium Pass",
      variant: "primary" as const,
      highlight: "Best Value For Students",
    },
    {
      id: "elite",
      tierCode: "ELITE",
      name: "Elite",
      tagline: "Premium + Most Expected Question Paper + Sample Practice Question Papers",
      monthlyPrice: "₹159",
      semesterPrice: "₹142",
      semesterTotal: "₹799 / sem",
      period: isSemester ? "/ Month" : "/ Month",
      subPrice: isSemester ? "Billed ₹799 Per Semester · Save 15%" : "Standard Monthly Plan",
      popular: false,
      badge: "All-Inclusive VIP",
      features: [
        "Everything In Premium Plan",
        "Most Expected Question Papers",
        "Sample Practice Question Papers & Mocks",
        "1-Click Complete Semester ZIP Download",
        "Priority 24/7 Academic Support",
      ],
      cta: "Join Elite Pass",
      variant: "outline" as const,
      highlight: "All-Inclusive VIP",
    },
  ];

  return (
    <Section id="pricing" className="relative overflow-hidden py-14 sm:py-20">
      {/* Ambient Forest Green Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[34rem] w-[54rem] rounded-full bg-emerald-600/10 blur-[140px]"
      />

      <Reveal>
        <SectionHeading
          eyebrow="Fair Student Pricing"
          title="Pocket-Friendly Plans For Every Student."
          description="Quality Education, Without The Heavy Price. Get All Notes, Solved Exam Papers, And Practical Code For Less Than The Price Of One Cup Of Chai."
          align="center"
        />
      </Reveal>

      {/* Billing Cycle Toggle */}
      <Reveal delay={60} className="mt-8 flex justify-center px-1">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/90 p-1 shadow-2xs backdrop-blur-xs max-w-full">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "rounded-full px-2.5 min-[340px]:px-4 py-1.5 text-[0.7rem] min-[340px]:text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap",
              !isSemester
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Monthly Plan
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("semester")}
            className={cn(
              "inline-flex items-center gap-1 min-[340px]:gap-1.5 rounded-full px-2.5 min-[340px]:px-4 py-1.5 text-[0.7rem] min-[340px]:text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap",
              isSemester
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>Semester Pass</span>
            <span
              className={cn(
                "rounded-full px-1.5 min-[340px]:px-2 py-0.5 text-[0.58rem] min-[340px]:text-[0.62rem] font-bold uppercase shrink-0",
                isSemester
                  ? "bg-white/20 text-white"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
              )}
            >
              Save 15%
            </span>
          </button>
        </div>
      </Reveal>

      {/* 4-Tier Pricing Grid */}
      <div className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 min-w-0 relative">
        {PLANS.map((plan, i) => {
          const displayPrice = isSemester ? plan.semesterPrice : plan.monthlyPrice;

          return (
            <Reveal key={plan.id} delay={i * 60} className="min-w-0">
              <div
                className={cn(
                  "relative flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border p-4 sm:p-5.5 transition-all duration-300 backdrop-blur-md min-w-0",
                  plan.popular
                    ? "border-emerald-500/80 bg-gradient-to-b from-[#003B0D] via-[#004D11] to-[#002408] text-white shadow-[0_20px_50px_-20px_rgba(0,95,21,0.5)] lg:-translate-y-2 ring-1 ring-emerald-400/40"
                    : "border-border/80 bg-card/95 hover:border-primary/50 shadow-xs hover:-translate-y-1",
                )}
              >
                {/* Popular Card Top Pill Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-3 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-emerald-950 shadow-sm whitespace-nowrap">
                      <Flame className="h-3 w-3 fill-current text-amber-500" />
                      <span>Best Value · Most Popular</span>
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                    <h3
                      className={cn(
                        "font-display text-lg sm:text-xl font-bold break-words",
                        plan.popular ? "text-white" : "text-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[0.6rem] font-semibold shrink-0 uppercase tracking-wider",
                        plan.popular
                          ? "bg-emerald-400/20 text-emerald-200"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {plan.highlight}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "mt-1.5 text-xs leading-relaxed break-words min-h-[36px]",
                      plan.popular ? "text-emerald-100/85" : "text-muted-foreground",
                    )}
                  >
                    {plan.tagline}
                  </p>

                  {/* Price Display */}
                  <div className="mt-4 border-b border-border/60 pb-3.5 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={cn(
                          "font-display text-3xl sm:text-4xl font-black tracking-tight",
                          plan.popular ? "text-white" : "text-foreground",
                        )}
                      >
                        {displayPrice}
                      </span>
                      <span
                        className={cn(
                          "text-[0.68rem] font-semibold uppercase tracking-wider",
                          plan.popular ? "text-emerald-200/80" : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                    {plan.subPrice && (
                      <p
                        className={cn(
                          "mt-1 text-[0.68rem] font-medium leading-tight",
                          plan.popular ? "text-emerald-300" : "text-primary",
                        )}
                      >
                        {plan.subPrice}
                      </p>
                    )}
                  </div>

                  {/* Feature Bullets */}
                  <ul className="mt-4 space-y-2.5 min-w-0">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs min-w-0">
                        <CheckCircle2
                          className={cn(
                            "mt-0.5 h-3.5 w-3.5 shrink-0",
                            plan.popular ? "text-emerald-300" : "text-primary",
                          )}
                        />
                        <span
                          className={cn(
                            "leading-relaxed break-words text-[0.72rem]",
                            plan.popular ? "text-emerald-50/90" : "text-foreground/90",
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-3 border-t border-border/40 min-w-0">
                  {isAuthenticated && plan.id !== "free" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const targetTier = (plan.tierCode || plan.id.toUpperCase()) as "BASIC" | "PREMIUM" | "ELITE";
                        initiateRazorpayPayment({
                          planTier: targetTier,
                          cycle: billingCycle,
                          onSuccess: () => {
                            refreshUser();
                          },
                        });
                      }}
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-full py-2.5 shadow-xs cursor-pointer transition-all active:scale-[0.98]",
                        plan.popular
                          ? "bg-white text-emerald-950 hover:bg-emerald-50 hover:shadow-lg shadow-[0_8px_20px_-5px_rgba(255,255,255,0.3)] font-black"
                          : "bg-surface hover:bg-primary hover:text-primary-foreground border border-border/80 hover:border-primary text-foreground",
                      )}
                    >
                      <span>
                        {user?.access_tier?.toUpperCase() === plan.tierCode || user?.access_tier?.toUpperCase() === plan.id.toUpperCase()
                          ? "Current Active Plan"
                          : `Upgrade To ${plan.name}`}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </button>
                  ) : (
                    <Cta
                      href={isAuthenticated ? "/dashboard" : `/login?mode=signup&plan=${plan.id}`}
                      size="md"
                      className={cn(
                        "w-full justify-center text-xs font-bold shadow-xs py-2.5 cursor-pointer transition-all active:scale-[0.98]",
                        plan.popular
                          ? "bg-white text-emerald-950 hover:bg-emerald-50 hover:shadow-lg shadow-[0_8px_20px_-5px_rgba(255,255,255,0.3)] font-black"
                          : "bg-surface hover:bg-primary hover:text-primary-foreground border border-border/80 hover:border-primary",
                      )}
                      variant={plan.popular ? "inverse" : plan.variant}
                    >
                      <span>{isAuthenticated && plan.id === "free" ? "Go To Dashboard" : plan.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Cta>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Trust & Guarantee Badges Row */}
      <Reveal delay={160}>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5 sm:gap-8 border-t border-border/80 pt-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Verified Handwritten Notes &amp; 5+ Yrs Solved PYQs</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Instant Access On Registration</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Verified University Curricula Alignment</span>
          </span>
        </div>
      </Reveal>
    </Section>
  );
}
