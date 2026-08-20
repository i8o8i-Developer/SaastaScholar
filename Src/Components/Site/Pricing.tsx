import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Cpu,
  FileCheck2,
  Flame,
  HelpCircle,
  Percent,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/Lib/Utils";
import { Cta, Pill, Reveal, Section, SectionHeading } from "./Primitives";

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "semester">("semester");

  const isSemester = billingCycle === "semester";

  const PLANS = [
    {
      name: "Free Starter",
      tagline: "Explore Official Syllabus & Core Notes",
      price: "₹0",
      period: "Forever Free",
      popular: false,
      badge: "Starter",
      badgeTone: "neutral" as const,
      features: [
        "Official University Syllabus Breakdown",
        "1 Free Subject Solved PYQ Archive Pack",
        "Basic Daily Timetable & Exam Reminders",
        "Public University Notices Feed",
        "Standard Web Viewer Access",
      ],
      cta: "Start Free",
      variant: "outline" as const,
      highlight: "No Card Required",
    },
    {
      name: "Semester Topper",
      tagline: "Everything You Need To Score Top CGPA",
      price: isSemester ? "₹499" : "₹149",
      period: isSemester ? "Per Semester (Save 45%)" : "Per Month",
      subPrice: isSemester ? "Equates To Only ₹83 / Month" : "Billed Monthly",
      popular: true,
      badge: "Most Popular",
      badgeTone: "solid" as const,
      features: [
        "All Unit-Wise Handwritten & Typed Topper Notes",
        "2020–2025 Solved University PYQs With Step-by-Step Solutions",
        "Complete Lab Manuals + Verified Python/C++/Java Codes",
        "50+ Viva Voce Question Bank Per Lab Experiment",
        "AI Assignment Formatter & IEEE/APA Citation Generator",
        "Instant Department Exam Timetable & Hall Ticket Alerts",
        "High-Speed Uncapped PDF Downloads",
      ],
      cta: "Get Semester Access",
      variant: "primary" as const,
      highlight: "Highest Scorer Choice",
    },
    {
      name: "VIP All-Access",
      tagline: "Full Academic Advantage & Career Prep",
      price: isSemester ? "₹899" : "₹299",
      period: isSemester ? "Per Semester (Save 50%)" : "Per Month",
      subPrice: isSemester ? "Equates To Only ₹149 / Month" : "Billed Monthly",
      popular: false,
      badge: "Full Advantage",
      badgeTone: "neutral" as const,
      features: [
        "Everything In Semester Topper Plan Included",
        "1-on-1 Academic Doubt Clearance & Faculty Q&A",
        "AI Exam Predictor & High-Yield 10-Mark Question Lists",
        "1-Click Full Semester Offline PDF Pack Download (.zip)",
        "Placement & Tech Internship Preparation Sheets",
        "Priority VIP Server Pipeline (Zero Rate Limits)",
      ],
      cta: "Unlock VIP Access",
      variant: "outline" as const,
      highlight: "All-Inclusive VIP",
    },
  ];

  return (
    <Section id="pricing" className="relative overflow-hidden py-16 sm:py-24">
      {/* Ambient Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[36rem] w-[50rem] rounded-full bg-emerald-500/10 blur-[130px]"
      />

      <Reveal>
        <SectionHeading
          eyebrow="Student Pricing Plans"
          title="Simple Plans, Built For Student Budgets."
          description="Access Verified Notes, Solved PYQ Packs, Lab Codes, And AI Tools For Less Than The Cost Of A Single Textbook Photocopy."
          align="center"
        />
      </Reveal>

      {/* Billing Cycle Toggle */}
      <Reveal delay={60} className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/80 p-1.5 shadow-2xs backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
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
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
              isSemester
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>Semester Pass</span>
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[0.65rem] font-extrabold text-emerald-600 dark:text-emerald-300">
              Save 45%
            </span>
          </button>
        </div>
      </Reveal>

      {/* 3-Tier Pricing Grid */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3 min-w-0">
        {PLANS.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 80} className="min-w-0">
            <div
              className={cn(
                "relative flex h-full flex-col justify-between rounded-3xl border p-6 sm:p-8 transition-all duration-300 backdrop-blur-md min-w-0",
                plan.popular
                  ? "border-primary/80 bg-gradient-to-b from-emerald-950/90 via-emerald-900/90 to-teal-950/90 text-white shadow-[0_24px_70px_-25px_color-mix(in_oklab,var(--color-primary-deep)_90%,transparent)] lg:-translate-y-2"
                  : "border-border/80 bg-card/95 hover:border-primary/50 shadow-sm",
              )}
            >
              {/* Popular Card Glow Border Indicator */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-3.5 py-1 text-xs font-black text-emerald-950 shadow-md">
                    <Flame className="h-3.5 w-3.5 fill-current" />
                    <span>BEST VALUE · MOST POPULAR</span>
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <h3
                    className={cn(
                      "font-display text-xl sm:text-2xl font-bold truncate",
                      plan.popular ? "text-white" : "text-foreground",
                    )}
                  >
                    {plan.name}
                  </h3>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold shrink-0",
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
                    "mt-2 text-xs sm:text-sm leading-relaxed",
                    plan.popular ? "text-emerald-100/80" : "text-muted-foreground",
                  )}
                >
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-6 border-b border-border/60 pb-6 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "font-display text-4xl sm:text-5xl font-black tracking-tight",
                        plan.popular ? "text-white" : "text-foreground",
                      )}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        plan.popular ? "text-emerald-200/80" : "text-muted-foreground",
                      )}
                    >
                      {plan.period}
                    </span>
                  </div>
                  {plan.subPrice && (
                    <p
                      className={cn(
                        "mt-1.5 text-xs font-medium",
                        plan.popular ? "text-emerald-300" : "text-primary",
                      )}
                    >
                      {plan.subPrice}
                    </p>
                  )}
                </div>

                {/* Feature Bullets */}
                <ul className="mt-6 space-y-3 min-w-0">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs sm:text-sm min-w-0">
                      <CheckCircle2
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          plan.popular ? "text-emerald-300" : "text-primary",
                        )}
                      />
                      <span
                        className={cn(
                          "leading-relaxed break-words",
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
              <div className="mt-8 pt-4 border-t border-border/40 min-w-0">
                <Cta
                  href="/login"
                  size="lg"
                  className={cn(
                    "w-full justify-center text-xs sm:text-sm font-bold shadow-md cursor-pointer",
                    plan.popular
                      ? "bg-white text-emerald-950 hover:bg-emerald-50 hover:scale-[1.02] shadow-[0_10px_25px_-5px_rgba(255,255,255,0.3)]"
                      : "hover:border-primary",
                  )}
                  variant={plan.popular ? "inverse" : plan.variant}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Cta>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Trust & Guarantee Badges Row */}
      <Reveal delay={200}>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 border-t border-border/80 pt-8 text-xs sm:text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>7-Day Full Money-Back Guarantee</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <span>Instant PDF Downloads On Launch</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span>Verified NIMS Syllabus Alignment</span>
          </span>
        </div>
      </Reveal>
    </Section>
  );
}
