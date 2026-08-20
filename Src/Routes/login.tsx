import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  FlaskConical,
  GraduationCap,
  Lock,
  Mail,
  Percent,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Cta, Eyebrow, Pill, Reveal } from "@/Components/Site/Primitives";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
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

  const handleBundleClick = (bundleName: string) => {
    toast.info(
      `📦 ${bundleName} Will Be Available For Instant Download Upon Portal Launch! Enter Your Email Below To Secure Free Early Access.`,
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background py-8 px-3.5 sm:px-8 sm:py-12 min-w-0">
      {/* Dynamic Ambient Mesh Glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[38rem] w-[54rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/15 to-indigo-500/20 blur-[130px] opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 right-10 -z-10 h-[28rem] w-[28rem] rounded-full bg-emerald-400/15 blur-[100px]"
      />

      {/* Grid Lines Overlay */}
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-100 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
      />

      <div className="relative mx-auto max-w-4xl min-w-0">
        {/* Top Nav Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4 sm:pb-6 min-w-0">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:text-primary truncate"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className="truncate">Back To Academic Workspace</span>
          </Link>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/NIMSWallah.png"
              alt="NimsWallah Logo"
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain rounded-md"
            />
            <span className="font-display text-base sm:text-lg font-bold tracking-tight">NimsWallah</span>
          </Link>
        </div>

        {/* Center Coming Soon Card */}
        <div className="mt-8 sm:mt-12 min-w-0">
          <Reveal className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border-strong bg-card/90 p-4 sm:p-8 lg:p-12 shadow-[0_24px_80px_-30px_color-mix(in_oklab,var(--color-primary-deep)_35%,transparent)] backdrop-blur-md min-w-0">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center min-w-0">
              {/* Left Column: Heading & Early Access Form (7 cols) */}
              <div className="lg:col-span-7 min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[0.65rem] sm:text-xs font-semibold text-primary max-w-full">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Study Portal &amp; Premium Notes Store</span>
                </div>

                <h1 className="mt-4 text-xl sm:text-4xl lg:text-[2.8rem] font-bold tracking-tight text-foreground leading-[1.12] break-words">
                  Student Portal &amp; Premium Notes Store Launching Soon!
                </h1>

                <p className="mt-3 text-xs sm:text-base leading-relaxed text-muted-foreground break-words">
                  Get Instant Access To Topper-Curated Subject Notes, Verified Solved Previous-Year Papers,
                  Lab Manuals With Viva Keys, And AI Assignment Drafting Tools.
                </p>

                {/* Form or Subscribed Message */}
                <div className="mt-6 sm:mt-8 min-w-0">
                  {joined ? (
                    <div className="rounded-xl sm:rounded-2xl border border-primary/40 bg-accent/50 p-4 sm:p-5 text-xs sm:text-sm min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">You Are On The VIP Study List!</p>
                          <p className="text-[0.7rem] sm:text-xs text-muted-foreground break-words">
                            We Will Dispatch Your Free Starter Study Notes Bundle And 50% Early-Bird Voucher
                            To {email}.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleJoinWaitlist} className="space-y-3 min-w-0">
                      <div className="relative min-w-0">
                        <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                    <button
                      type="button"
                      onClick={() => handleBundleClick("Solved Previous-Year Papers (PYQ Pack)")}
                      className="group flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-3.5 text-left text-xs font-semibold text-foreground transition-all hover:border-primary hover:bg-accent/40 cursor-pointer min-w-0"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FileCheck2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">Solved PYQ Archives (2020–2025)</span>
                      </span>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary shrink-0">
                        Popular
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBundleClick("Topper Handwritten Notes Bundle")}
                      className="group flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-3.5 text-left text-xs font-semibold text-foreground transition-all hover:border-primary hover:bg-accent/40 cursor-pointer min-w-0"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <BookMarked className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="truncate">Unit-Wise Handwritten Notes</span>
                      </span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted-foreground shrink-0">
                        PDF
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBundleClick("Lab Manual & Viva Voce Cheat-Sheets")}
                      className="group flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 sm:p-3.5 text-left text-xs font-semibold text-foreground transition-all hover:border-primary hover:bg-accent/40 cursor-pointer min-w-0"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FlaskConical className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="truncate">Lab Manuals &amp; Viva Cheat-Sheets</span>
                      </span>
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted-foreground shrink-0">
                        Verified
                      </span>
                    </button>
                  </div>

                  <div className="mt-5 border-t border-border/80 pt-4 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      Included In Every Semester Bundle:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground min-w-0">
                      <li className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">Instant Download In PDF &amp; Editable Formats</span>
                      </li>
                      <li className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">AI Assignment Reference Generator Access</span>
                      </li>
                      <li className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">100% Verified University Syllabus Alignment</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 min-w-0">
                    <Link
                      to="/"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <span>Browse Open Free Course Notes</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
