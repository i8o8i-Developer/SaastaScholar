import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/Components/Ui/Sonner";
import { AuthProvider } from "@/Hooks/UseAuth";
import { reportLovableError } from "../Lib/LovableErrorReporting";
import { CookieConsentBanner } from "@/Components/Ui/CookieConsentBanner";
import { LegalComplianceHub } from "@/Components/Site/LegalComplianceHub";
import { Search, ArrowLeft, Home, FileText, BookOpen, Target, FlaskConical, Calendar, Clock, ShieldCheck } from "lucide-react";

function NotFoundComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState("gdpr-dpdp");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?q=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = "/?tab=notes";
    }
  };

  const openPolicy = (policyId: string) => {
    setSelectedPolicy(policyId);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative select-none">
      {/* Main Unslop Academic Archive Card */}
      <div className="relative z-10 max-w-[640px] w-full bg-card border border-border rounded-3xl p-6 sm:p-10 text-center shadow-sm space-y-6">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-full font-mono text-xs text-muted-foreground uppercase tracking-wider font-bold shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span>SaastaScholar Courseware Archive · 404</span>
        </div>

        {/* Minimal Characterful Document Graphic */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border text-foreground shadow-2xs">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>

        {/* Headline & Description */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Academic Courseware Not Found
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            The lecture notes, syllabus unit, or past question paper you requested does not exist at this address or may have been reorganized in the semester courseware repository.
          </p>
        </div>

        {/* Live Search Input */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Handwritten Notes, Solved PYQs, Lab Manuals..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-2xs"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-lg bg-primary hover:bg-primary-deep text-primary-foreground font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span>Search</span>
          </button>
        </form>

        {/* Quick Academic Hub Shortcuts */}
        <div className="pt-2">
          <span className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
            Quick Academic Repositories
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <a
              href="/?tab=notes"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-muted border border-border text-foreground font-semibold transition-all shadow-2xs"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Handwritten Notes</span>
            </a>
            <a
              href="/?tab=syllabus"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-muted border border-border text-foreground font-semibold transition-all shadow-2xs"
            >
              <BookOpen className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Official Syllabus</span>
            </a>
            <a
              href="/?tab=pyqs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-muted border border-border text-foreground font-semibold transition-all shadow-2xs"
            >
              <Target className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Solved PYQs</span>
            </a>
            <a
              href="/?tab=labs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-muted border border-border text-foreground font-semibold transition-all shadow-2xs"
            >
              <FlaskConical className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>Lab Manuals</span>
            </a>
            <a
              href="/?tab=timetable"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-muted border border-border text-foreground font-semibold transition-all shadow-2xs"
            >
              <Calendar className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span>Timetable</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-deep text-primary-foreground px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Return To Study Workspace</span>
          </Link>
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href = "/"))}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface hover:bg-muted text-foreground px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Statutory Brand & Compliance Note */}
        <div className="pt-4 border-t border-border/80 text-center space-y-1">
          <p className="text-[0.68rem] text-muted-foreground">
            © {new Date().getFullYear()} <strong>SaastaScholar™</strong> · A DurgaAI Solutions Academic Innovation. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[0.68rem] text-muted-foreground/80">
            <button type="button" onClick={() => openPolicy("gdpr-dpdp")} className="hover:text-foreground underline cursor-pointer">DPDP Act (2023)</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("payment-terms")} className="hover:text-foreground underline cursor-pointer">Student Terms</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("data-retention")} className="hover:text-foreground underline cursor-pointer">Privacy Policy</button>
          </div>
        </div>
      </div>

      <LegalComplianceHub
        open={legalModalOpen}
        onOpenChange={setLegalModalOpen}
        initialPolicyId={selectedPolicy}
      />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          This Page Did Not Load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something Went Wrong On Our End. You Can Try Refreshing Or Head Back Home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-deep cursor-pointer"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="bottom-right" richColors />
        <CookieConsentBanner />
      </AuthProvider>
    </QueryClientProvider>
  );
}
