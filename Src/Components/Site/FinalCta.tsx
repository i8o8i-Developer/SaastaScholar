import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { Cta, Reveal, Section } from "./Primitives";

export function FinalCta() {
  return (
    <Section
      id="get-started"
      className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-950 via-[#064e3b] to-teal-950 text-white py-24 sm:py-32"
    >
      {/* Dynamic Luminous Radiant Auras */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[34rem] w-[50rem] rounded-full bg-gradient-to-r from-emerald-400/25 via-teal-300/20 to-indigo-500/25 blur-[120px] opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-400/15 blur-[90px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-teal-400/15 blur-[90px]"
      />

      {/* Visible Blueprint Square Grid Lines Overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_85%,transparent_100%)] opacity-100"
      />

      <div className="relative mx-auto max-w-4xl px-3.5 text-center min-w-0">
        <Reveal>
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-md shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
            <span>Built Exclusively For University Scholars</span>
          </div>

          {/* Main Headline */}
          <h2 className="mt-7 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.8rem] leading-[1.08] break-words">
            Your University. Your Academics. One Place.
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-emerald-100/80 sm:text-lg break-words">
            Stop Searching Across Scattered Groups, Cloud Drives, And Chat Channels. Build A Faster,
            Higher-Scoring Academic Workflow Today.
          </p>

          {/* CTA Buttons Row */}
          <div className="mt-10 flex flex-col justify-center gap-3.5 sm:flex-row min-w-0">
            <Cta
              href="/login"
              size="lg"
              className="bg-white text-emerald-950 font-bold shadow-[0_12px_30px_-10px_rgba(255,255,255,0.4)] hover:bg-emerald-50 hover:scale-[1.03] transition-all duration-200 cursor-pointer text-sm sm:text-base px-7"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 text-emerald-700 shrink-0" />
            </Cta>
            <Cta
              href="#pricing"
              size="lg"
              className="border border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-md transition-all cursor-pointer text-sm sm:text-base px-7"
            >
              Explore Student Pricing
            </Cta>
          </div>

          {/* Bottom Trust Row */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 border-t border-emerald-500/20 pt-8 text-xs sm:text-sm text-emerald-100/70">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>100% Free Starter Study Materials</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>Topper Notes &amp; Solved PYQs (2020–2025)</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>Zero Group Clutter Or Spam</span>
            </span>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
