import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  BookMarked,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  Mail,
  Percent,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
});

export function Login() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please Enter A Valid Student Email Address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setJoined(true);
      toast.success(
        "🎉 You Have Unlocked Free Starter Study Notes And VIP 50% Launch Discount! Check Your Inbox Soon.",
      );
    }, 600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background py-8 px-3.5 sm:px-8 sm:py-12 min-w-0">
      {/* Dynamic Ambient Mesh Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[50rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-400/10 to-indigo-500/15 blur-[120px] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-[100px]"
      />

      {/* Blueprint Grid Overlay */}
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-80 [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent)]"
      />

      <div className="relative mx-auto max-w-4xl min-w-0">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between min-w-0">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-xs transition-colors hover:border-primary/50 hover:bg-accent/40"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-primary" />
            <span>Return To Home</span>
          </a>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Study Notes Portal · Launching Soon</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-[0_24px_70px_-25px_color-mix(in_oklab,var(--color-primary-deep)_35%,transparent)] backdrop-blur-md min-w-0">
          {/* Card Top Banner */}
          <div className="border-b border-border/80 bg-gradient-to-r from-emerald-500/10 via-surface to-teal-500/10 px-5 py-4 sm:px-8 sm:py-5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-base sm:text-lg font-bold text-foreground truncate">
                    NimsWallah Notes &amp; Exam Store
                  </h1>
                  <p className="text-[0.7rem] sm:text-xs text-muted-foreground truncate">
                    Topper Handwritten Notes, Solved PYQs (2020–2025) &amp; Lab Manuals
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-primary/30 bg-accent/60 px-3 py-1 text-xs font-bold text-accent-foreground shrink-0">
                Early Access Pass
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-8 min-w-0">
            <div className="grid gap-8 lg:grid-cols-12 min-w-0">
              {/* Left Column: Mission & Early-Access Form (7 cols) */}
              <div className="lg:col-span-7 min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>University Curated Academic Store</span>
                </div>

                <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl leading-tight break-words">
                  All Semester Notes, Solved Papers &amp; Practicals.
                </h2>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground break-words">
                  Stop Relying On Blurred WhatsApp Photos And Incomplete Photocopies. NimsWallah
                  Provides Verified, Faculty-Approved Handwritten Notes, Unit-Wise Formula Sheets,
                  Solved Past 5-Year Question Papers, And Ready-To-Submit Practical Lab Records.
                </p>

                {/* Form or Success State */}
                <div className="mt-6 min-w-0">
                  {joined ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 min-w-0">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <h3 className="font-bold text-sm sm:text-base">VIP Early Access Reserved!</h3>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        We Have Sent A Confirmation Link To <strong className="text-foreground">{email}</strong>.
                        You Will Receive Instant Download Links To Free Starter Notes &amp; Solved PYQ
                        Packs On Launch Day.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleJoinWaitlist} className="space-y-3 min-w-0">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Unlock Free Starter Pack &amp; Priority Portal Access
                      </label>
                      <div className="relative min-w-0">
                        <Mail className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter Your Student Email (E.g. Name@University.edu)"
                          required
                          className="h-11 sm:h-13 w-full rounded-xl border border-border bg-background pr-3 pl-10 text-xs sm:text-sm shadow-2xs transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex h-11 sm:h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-deep hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
                      >
                        {loading ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : (
                          <>
                            <span>Get Free Starter Notes &amp; 50% Off Pass</span>
                            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Offer Highlight Box */}
                <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-3.5 sm:p-4 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Percent className="h-4 w-4 shrink-0" />
                    <span>Early-Bird Student Privilege</span>
                  </div>
                  <p className="mt-1 text-[0.7rem] sm:text-xs leading-relaxed text-muted-foreground break-words">
                    All Students Who Register On The Waitlist Receive 1 Full Subject Solved PYQ Bundle
                    100% Free Upon Launch Day.
                  </p>
                </div>
              </div>

              {/* Right Column: Premium Study Materials Catalog Preview (5 cols) */}
              <div className="lg:col-span-5 min-w-0">
                <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 sm:p-6 min-w-0">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3 min-w-0">
                    <span className="label-caps font-semibold text-muted-foreground text-xs truncate">
                      Upcoming Semester Study Bundles
                    </span>
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  </div>

                  <div className="mt-4 space-y-2.5 min-w-0">
                    <div className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-3.5 text-xs font-semibold text-foreground min-w-0">
                      <span className="flex items-center gap-2 truncate">
                        <FileCheck2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">Solved PYQ Archives (2020–2025)</span>
                      </span>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary shrink-0">
                        Popular
                      </span>
                    </div>

                    <div className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-3.5 text-xs font-semibold text-foreground min-w-0">
                      <span className="flex items-center gap-2 truncate">
                        <BookMarked className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="truncate">Unit-Wise Handwritten Notes</span>
                      </span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted-foreground shrink-0">
                        PDF
                      </span>
                    </div>

                    <div className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-3.5 text-xs font-semibold text-foreground min-w-0">
                      <span className="flex items-center gap-2 truncate">
                        <FlaskConical className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="truncate">Lab Manuals &amp; Viva Cheat-Sheets</span>
                      </span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted-foreground shrink-0">
                        Ready
                      </span>
                    </div>

                    <div className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-3.5 text-xs font-semibold text-foreground min-w-0">
                      <span className="flex items-center gap-2 truncate">
                        <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="truncate">Assignment Outlines &amp; Citations</span>
                      </span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted-foreground shrink-0">
                        AI Tool
                      </span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/80 pt-4">
                    <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                      <p className="font-display text-lg sm:text-xl font-bold text-primary">100%</p>
                      <p className="text-[0.65rem] text-muted-foreground">Syllabus Match</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card p-3 text-center">
                      <p className="font-display text-lg sm:text-xl font-bold text-primary">2020–25</p>
                      <p className="text-[0.65rem] text-muted-foreground">Solved Papers</p>
                    </div>
                  </div>
                </div>

                {/* Trust Guarantee Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Faculty-Verified Content · Zero Malware · Instant PDF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
