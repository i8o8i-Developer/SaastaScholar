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
    <div className="min-h-screen bg-[#040806] text-[#f0fdf4] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(16,185,129,0.12)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-emerald-600/10 blur-[60px] pointer-events-none" />

      {/* Main Glassmorphic HUD Card */}
      <div className="relative z-10 max-w-[720px] w-full bg-[#081610]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 sm:p-10 text-center shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(5,150,105,0.2)]">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full mb-6 font-mono text-xs text-emerald-300 uppercase tracking-wider font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          SaastaScholar • Error 404: Route Not Found
        </div>

        {/* Radar Telemetry Graphic */}
        <div className="w-28 h-28 mx-auto mb-5 relative flex items-center justify-center">
          <svg className="w-full h-full animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="40" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="50" cy="50" r="32" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
            <line x1="50" y1="2" x2="50" y2="10" stroke="rgba(52, 211, 153, 0.6)" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="90" x2="50" y2="98" stroke="rgba(52, 211, 153, 0.6)" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="50" x2="10" y2="50" stroke="rgba(52, 211, 153, 0.6)" strokeWidth="2" strokeLinecap="round" />
            <line x1="90" y1="50" x2="98" y2="50" stroke="rgba(52, 211, 153, 0.6)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="absolute font-mono text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]">404</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
          Academic Material Not Found
        </h1>
        <p className="text-slate-300 max-w-md mx-auto text-xs sm:text-sm leading-relaxed mb-6 font-normal">
          The Requested Study Note, Syllabus Unit, Or Past Question Paper Could Not Be Located In This Directory.
        </p>

        {/* Live Search Input */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-5 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 200+ Notes, Solved PYQs, Lab Manuals..."
            className="w-full pl-4 pr-24 py-2.5 rounded-xl border border-emerald-500/30 bg-black/50 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Quick Academic Hub Shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs">
          <a href="/?tab=notes" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 font-semibold transition-all">
            <FileText className="h-3 w-3 text-emerald-400" />
            Handwritten Notes
          </a>
          <a href="/?tab=syllabus" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 font-semibold transition-all">
            <BookOpen className="h-3 w-3 text-cyan-400" />
            Syllabus
          </a>
          <a href="/?tab=pyqs" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 font-semibold transition-all">
            <Target className="h-3 w-3 text-amber-400" />
            Solved PYQs
          </a>
          <a href="/?tab=labs" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 font-semibold transition-all">
            <FlaskConical className="h-3 w-3 text-purple-400" />
            Lab Codes &amp; Viva
          </a>
          <a href="/?tab=timetable" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 font-semibold transition-all">
            <Calendar className="h-3 w-3 text-rose-400" />
            Timetable
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-emerald-600 border border-emerald-400/20 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Return To SaastaScholar
          </Link>
          <button
            type="button"
            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = "/"}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Telemetry Diagnostics Strip */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3 mb-6 font-mono text-[0.7rem] text-slate-400 flex flex-wrap items-center justify-around gap-2 text-left">
          <div>Status: <span className="text-emerald-400 font-bold">404 NOT_FOUND</span></div>
          <div>Gateway: <span className="text-slate-200 font-bold">Nginx Gateway</span></div>
          <div>Health: <span className="text-emerald-400 font-bold">● Systems Operational</span></div>
        </div>

        {/* Legal & Compliance Quick Bar in 404 */}
        <div className="pt-5 border-t border-white/[0.08] text-xs">
          <div className="text-[0.7rem] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            SaastaScholar Legal &amp; Compliance Hub
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.72rem] text-slate-400">
            <button type="button" onClick={() => openPolicy("gdpr-dpdp")} className="hover:text-emerald-300 underline cursor-pointer">GDPR &amp; DPDP</button>
            <span>•</span>
            <button type="button" onClick={() => { window.dispatchEvent(new CustomEvent("open_cookie_preferences")); }} className="hover:text-emerald-300 underline cursor-pointer">Cookie Consent</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("marketing-consent")} className="hover:text-emerald-300 underline cursor-pointer">Marketing Consent</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("data-deletion")} className="hover:text-emerald-300 underline cursor-pointer">Data Deletion</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("data-retention")} className="hover:text-emerald-300 underline cursor-pointer">Data Retention</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("dpa")} className="hover:text-emerald-300 underline cursor-pointer">DPA</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("third-party")} className="hover:text-emerald-300 underline cursor-pointer">Sub-Processors</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("ip-policy")} className="hover:text-emerald-300 underline cursor-pointer">IP &amp; Fair Use</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("payment-terms")} className="hover:text-emerald-300 underline cursor-pointer">Subscriptions</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("refund-policy")} className="hover:text-emerald-300 underline cursor-pointer">Refund Policy</button>
            <span>•</span>
            <button type="button" onClick={() => openPolicy("cancellation-policy")} className="hover:text-emerald-300 underline cursor-pointer">Cancellation Policy</button>
          </div>
          <div className="mt-4 text-[0.68rem] text-white/40">
            SaastaScholar • Owned &amp; Engineered By <strong className="text-emerald-400 font-semibold">DurgaAI Solutions</strong>
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
