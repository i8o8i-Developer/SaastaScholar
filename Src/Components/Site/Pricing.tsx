import { Check } from "lucide-react";

import { cn } from "@/Lib/Utils";
import { Cta, Pill, Reveal, Section, SectionHeading } from "./Primitives";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "Forever",
    summary: "Get Oriented With Your Academic Profile And Core Material.",
    features: [
      "Limited Academic Resources",
      "Basic Notifications",
      "Basic Planning",
      "University And Section Setup",
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Student",
    price: "₹149",
    period: "Per Month",
    summary: "The Full Academic Workspace For Your Semester.",
    features: [
      "Full Academic Hub",
      "Previous-Year And Solved Papers",
      "Practical And Lab Resources",
      "Assignment Tools And Templates",
      "Full Student Planner",
      "Full Notification Center",
    ],
    cta: "Get Started",
    featured: true,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "Per Month",
    summary: "For Students Who Want Preparation Handled Intelligently.",
    features: [
      "Everything In Student",
      "Advanced AI Features",
      "Personalized Study Planning",
      "Advanced Exam Preparation",
      "AI Viva Preparation",
    ],
    cta: "Go Pro",
    featured: false,
  },
];

export function Pricing() {
  return (
    <Section id="pricing">
      <Reveal>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple Plans, Built For Student Budgets."
          description="Start Free. Upgrade When Your Semester Gets Serious. Cancel Any Time."
          align="center"
        />
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 90}>
            <div
              className={cn(
                "flex h-full flex-col rounded-xl border p-7 transition-all duration-300",
                plan.featured
                  ? "border-primary bg-primary-deep text-primary-foreground shadow-[0_30px_70px_-45px_color-mix(in_oklab,var(--color-primary-deep)_90%,transparent)]"
                  : "border-border-strong bg-card hover:border-primary/50",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl">{plan.name}</h3>
                {plan.featured ? <Pill tone="solid">Most Popular</Pill> : null}
              </div>
              <p
                className={cn(
                  "mt-3 text-sm leading-relaxed",
                  plan.featured ? "opacity-80" : "text-muted-foreground",
                )}
              >
                {plan.summary}
              </p>
              <p className="mt-7 flex items-baseline gap-2">
                <span className="font-display text-5xl">{plan.price}</span>
                <span
                  className={cn(
                    "label-caps",
                    plan.featured ? "opacity-70" : "text-muted-foreground",
                  )}
                >
                  {plan.period}
                </span>
              </p>
              <ul
                className={cn(
                  "mt-7 flex-1 space-y-3 border-t pt-6",
                  plan.featured ? "border-primary-foreground/20" : "border-border",
                )}
              >
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        plan.featured ? "opacity-90" : "text-primary",
                      )}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Cta
                href="/login"
                size="lg"
                variant={plan.featured ? "inverse" : "outline"}
                className="mt-8 w-full"
              >
                {plan.cta}
              </Cta>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Feature Availability Rolls Out Semester By Semester As Universities Are Onboarded.
      </p>
    </Section>
  );
}
