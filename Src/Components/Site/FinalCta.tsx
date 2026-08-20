import { ArrowRight } from "lucide-react";

import { Cta, Reveal, Section } from "./Primitives";

export function FinalCta() {
  return (
    <Section
      id="get-started"
      className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white py-24 sm:py-32"
    >
      {/* Dynamic Luminous Aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[28rem] w-[44rem] rounded-full bg-gradient-to-r from-emerald-400/20 via-teal-300/15 to-indigo-500/20 blur-[100px]"
      />
      {/* Visible Blueprint Square Grid Lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_80%,transparent_100%)] opacity-100"
      />
      <Reveal className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
          Your University. Your Academics. One Place.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-emerald-100/80 sm:text-lg">
          Stop Searching Across Scattered Groups, Cloud Drives, And Chat Channels. Build A Faster,
          Higher-Scoring Academic Workflow Today.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Cta
            href="/login"
            size="lg"
            className="bg-white text-emerald-950 font-bold shadow-lg hover:bg-emerald-50 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4 text-emerald-700" />
          </Cta>
          <Cta
            href="#pricing"
            size="lg"
            className="border border-white/25 bg-white/5 text-white hover:bg-white/15 hover:border-white/40 transition-colors cursor-pointer"
          >
            Explore Student Pricing
          </Cta>
        </div>
      </Reveal>
    </Section>
  );
}
