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
      period: "Forever",
      popular: false,
      badge: "Free",
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
      period: isSemester ? "/ Sem" : "/ Month",
      subPrice: isSemester ? "Equates To Only ₹83 / Month · Save 45%" : "Billed Monthly",
      popular: true,
      badge: "Most Popular",
      features: [
        "All Unit-Wise Handwritten & Typed Topper Notes",
        "2020–2025 Solved University PYQs With Solutions",
        "Complete Lab Manuals + Verified Python/C++ Codes",
        "50+ Viva Voce Question Bank Per Experiment",
        "AI Assignment Formatter & IEEE/APA Citations",
        "Instant Exam Timetable & Hall Ticket Alerts",
        "High-Speed Uncapped PDF Downloads",
      ],
      cta: "Get Semester Access",
      variant: "primary" as const,
      highlight: "Topper Choice",
    },
    {
      name: "VIP All-Access",
      tagline: "Full Academic Advantage & Career Prep",
      price: isSemester ? "₹899" : "₹299",
      period: isSemester ? "/ Sem" : "/ Month",
      subPrice: isSemester ? "Equates To Only ₹149 / Month · Save 50%" : "Billed Monthly",
      popular: false,
      badge: "Full Access",
      features: [
        "Everything In Semester Topper Plan Included",
        "1-on-1 Academic Doubt Clearance & Faculty Q&A",
        "AI Exam Predictor & High-Yield 10-Mark Questions",
        "1-Click Full Semester Offline PDF Pack (.zip)",
        "Placement & Tech Internship Preparation Sheets",
        "Priority VIP Server Pipeline (Zero Rate Limits)",
      ],
      cta: "Unlock VIP Access",
      variant: "outline" as const,
      highlight: "All-Inclusive",
    },
  ];

  return (
    <Section id="pricing" className="relative overflow-hidden py-14 sm:py-20">
      {/* Ambient Lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[32rem] w-[46rem] rounded-full bg-emerald-500/10 blur-[130px]"
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
      <Reveal delay={60} className="mt-7 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/90 p-1 shadow-2xs backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
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
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
              isSemester
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>Semester Pass</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[0.62rem] font-bold",
                isSemester
                  ? "bg-white/20 text-white"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
              )}
            >
              Save 45%
            </span>
          </button>
        </div>
      </Reveal>

      {/* 3-Tier Pricing Grid */}
      <div className="mt-10 grid gap-5 lg:grid-cols-3 min-w-0 relative">
        {/* Free Floating Banner Overlay - Ultra-Vibrant Glassmorphic & Radiant */}
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
          <div className="relative pointer-events-auto transform -rotate-1 sm:-rotate-2 hover:rotate-0 transition-transform duration-300">
            {/* Ambient Multi-Color Glowing Aura */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500/40 via-rose-500/40 to-amber-500/40 blur-2xl -z-10 animate-pulse" />

            <div className="rounded-3xl bg-zinc-950/95 border-2 border-emerald-400/50 p-5 sm:p-8 text-center shadow-[0_0_60px_rgba(16,185,129,0.35),0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl ring-1 ring-white/20 max-w-lg mx-auto">
              {/* Top Launch Pill */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-[0.68rem] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2.5 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Special Campus Launch Celebration</span>
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              </div>

              {/* Main Glowing Headline */}
              <h2 className="font-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] leading-tight">
                Everything Is Free
              </h2>

              {/* Highlighted Glowing Date Pill */}
              <div className="mt-2.5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 px-4 py-1.5 shadow-[0_0_30px_rgba(244,63,94,0.6)] border border-white/30">
                <span className="font-display text-xs sm:text-sm md:text-base font-black uppercase tracking-wide text-white drop-shadow-sm">
                  Till 31 October 2026
                </span>
              </div>

              {/* Sub-feature Note */}
              <p className="mt-3 text-[0.72rem] sm:text-xs font-semibold text-emerald-300 tracking-wide flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>All Notes, Solved PYQs, Lab Manuals &amp; Syllabus 100% Unlocked</span>
              </p>
            </div>
          </div>
        </div>

        {PLANS.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 70} className="min-w-0">
            <div
              className={cn(
                "relative flex h-full flex-col justify-between rounded-2xl sm:rounded-3xl border p-5 sm:p-6.5 transition-all duration-300 backdrop-blur-md min-w-0",
                plan.popular
                  ? "border-primary/80 bg-gradient-to-b from-emerald-950/95 via-[#064e3b] to-teal-950/95 text-white shadow-[0_20px_60px_-25px_color-mix(in_oklab,var(--color-primary-deep)_90%,transparent)] lg:-translate-y-1.5"
                  : "border-border/80 bg-card/95 hover:border-primary/50 shadow-xs",
              )}
            >
              {/* Popular Card Top Pill Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-3 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-emerald-950 shadow-sm whitespace-nowrap">
                    <Flame className="h-3 w-3 fill-current" />
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
                      "rounded-full px-2 py-0.5 text-[0.62rem] font-semibold shrink-0",
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
                    "mt-1.5 text-xs leading-relaxed break-words",
                    plan.popular ? "text-emerald-100/80" : "text-muted-foreground",
                  )}
                >
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-4 border-b border-border/60 pb-4 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "font-display text-3xl sm:text-4xl font-black tracking-tight",
                        plan.price !== "₹0"
                          ? "line-through decoration-primary/40 decoration-[3px] text-muted-foreground/60"
                          : plan.popular
                            ? "text-white"
                            : "text-foreground",
                      )}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={cn(
                        "text-[0.7rem] font-semibold uppercase tracking-wider",
                        plan.popular ? "text-emerald-200/80" : "text-muted-foreground",
                      )}
                    >
                      {plan.period}
                    </span>
                  </div>
                  {plan.subPrice && (
                    <p
                      className={cn(
                        "mt-1 text-[0.7rem] font-medium",
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
              <div className="mt-6 pt-3 border-t border-border/40 min-w-0">
                <Cta
                  href={plan.price !== "₹0" ? undefined : "/login"}
                  size="md"
                  className={cn(
                    "w-full justify-center text-xs font-bold shadow-xs py-2.5",
                    plan.popular
                      ? "bg-white text-emerald-950 hover:bg-emerald-50 hover:scale-[1.02] shadow-[0_8px_20px_-5px_rgba(255,255,255,0.3)]"
                      : "hover:border-primary",
                    plan.price !== "₹0" ? "opacity-50 pointer-events-none cursor-not-allowed grayscale" : "cursor-pointer"
                  )}
                  variant={plan.popular ? "inverse" : plan.variant}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </Cta>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Trust & Guarantee Badges Row */}
      <Reveal delay={160}>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5 sm:gap-8 border-t border-border/80 pt-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Verified Handwritten Notes &amp; Solved PYQs</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Instant PDF Downloads On Launch</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Verified NIMS Syllabus Alignment</span>
          </span>
        </div>
      </Reveal>
    </Section>
  );
}
