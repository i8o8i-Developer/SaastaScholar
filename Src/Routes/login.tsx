import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookMarked,
  Building2,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileText,
  FlaskConical,
  GraduationCap,
  Lock,
  Mail,
  Megaphone,
  Percent,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/Hooks/UseAuth";
import { useTheme } from "@/Hooks/UseTheme";
import { toast } from "sonner";
import { apiFetch, Department, ProgramSpecialization, SectionBatch } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/Ui/Dialog";
import { initiateRazorpayPayment } from "@/Lib/Razorpay";

export const Route = createFileRoute("/login")({
  component: Login,
});

export function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [authMode, setAuthMode] = useState<"login" | "register" | "admin">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "signup" || params.get("mode") === "register") return "register";
      if (params.get("mode") === "admin") return "admin";
    }
    return "login";
  });

  // Dynamic Blueprint Stores From Database
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<ProgramSpecialization[]>([]);
  const [sections, setSections] = useState<SectionBatch[]>([]);

  // Form State
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [semester, setSemester] = useState<number>(1);
  const [section, setSection] = useState<string>("A");
  const [rollNumber, setRollNumber] = useState<string>("");
  const [targetCgpa, setTargetCgpa] = useState<string>("");
  const [currentCgpa, setCurrentCgpa] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<"FREE" | "BASIC" | "PREMIUM" | "ELITE" | "STARTER" | "SCHOLAR" | "ACHIEVER" | "ELITE_PLUS">("FREE");

  // Promotional Discount Coupon & Billing Cycle State
  const [billingCycle, setBillingCycle] = useState<"monthly" | "semester">("monthly");
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_percent: number;
    discount_amount_inr: number;
    final_amount_inr: number;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);

  // Plan Pricing Reference Matrix
  const DEFAULT_PLAN_PRICING: { monthly: number; semester: number; name: string } = {
    monthly: 0,
    semester: 0,
    name: "Free Starter",
  };
  const PLAN_PRICING_MAP: Record<string, { monthly: number; semester: number; name: string }> = {
    FREE: { monthly: 0, semester: 0, name: "Free Starter" },
    STARTER: { monthly: 0, semester: 0, name: "Free Starter" },
    BASIC: { monthly: 99, semester: 499, name: "Basic Scholar" },
    SCHOLAR: { monthly: 99, semester: 499, name: "Basic Scholar" },
    PREMIUM: { monthly: 129, semester: 649, name: "Premium Achiever" },
    ACHIEVER: { monthly: 129, semester: 649, name: "Premium Achiever" },
    ELITE: { monthly: 159, semester: 799, name: "Elite Scholar" },
    ELITE_PLUS: { monthly: 159, semester: 799, name: "Elite Scholar" },
  };

  const isFreePlan = selectedPlan === "FREE" || selectedPlan === "STARTER";
  const activePlanPricing = PLAN_PRICING_MAP[selectedPlan] ?? DEFAULT_PLAN_PRICING;
  const currentBasePrice = billingCycle === "semester" ? activePlanPricing.semester : activePlanPricing.monthly;
  const currentFinalPayable = appliedCoupon ? appliedCoupon.final_amount_inr : currentBasePrice;

  // Handle Validation & Application Of Promotional Discount Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please Enter A Valid Coupon Code.");
      return;
    }
    setCouponLoading(true);
    try {
      const canonicalTier =
        selectedPlan === "SCHOLAR" ? "BASIC" :
        selectedPlan === "ACHIEVER" ? "PREMIUM" :
        selectedPlan === "ELITE_PLUS" ? "ELITE" : selectedPlan;

      const res = await apiFetch<any>("/subscriptions/apply-coupon/", {
        method: "POST",
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          plan_tier: canonicalTier,
          cycle: billingCycle,
        }),
      });

      if (res && res.valid) {
        setAppliedCoupon(res);
        toast.success(res.message || `Coupon "${res.code}" Applied Successfully!`);
      } else {
        toast.error(res?.error || "Invalid Or Expired Coupon Code.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed To Apply Coupon Code.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon Code Removed.");
  };

  const handleSelectQuickCoupon = (code: string) => {
    setCouponCode(code);
    setAppliedCoupon(null);
  };

  // Forgot Password / Reset State
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetOtp, setResetOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  const handleRequestResetOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please Enter Your Account Email Address.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await apiFetch<any>("/auth/password-reset/", {
        method: "POST",
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      toast.success(res.message || "Verification Code Sent To Your Email.");
      if (res.debug_otp) {
        toast.info(`[Debug Verification Code]: ${res.debug_otp}`);
      }
      setResetStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed To Dispatch Verification Code.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetOtp.trim()) {
      toast.error("Please Enter The 6-Digit Verification Code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password Must Be At Least 6 Characters Long.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await apiFetch<any>("/auth/password-reset-confirm/", {
        method: "POST",
        body: JSON.stringify({
          email: resetEmail.trim(),
          otp: resetOtp.trim(),
          new_password: newPassword,
        }),
      });
      toast.success(res.message || "Password Updated Successfully!");
      setEmail(resetEmail);
      setPassword("");
      setShowResetModal(false);
      setResetStep(1);
      setResetOtp("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Invalid Or Expired Code.");
    } finally {
      setResetLoading(false);
    }
  };

  // Fetch Live Academic Blueprint
  const loadAcademicBlueprint = async () => {
    try {
      const [deptsRes, progsRes, secsRes] = await Promise.all([
        apiFetch("/academic/departments/"),
        apiFetch("/academic/programs/"),
        apiFetch("/academic/sections/"),
      ]);
      const depts = Array.isArray(deptsRes) ? deptsRes : ((deptsRes as any)?.results || []);
      const progs = Array.isArray(progsRes) ? progsRes : ((progsRes as any)?.results || []);
      const secs = Array.isArray(secsRes) ? secsRes : ((secsRes as any)?.results || []);

      setDepartments(depts);
      setPrograms(progs);
      setSections(secs);

      if (depts.length > 0) {
        setSelectedDeptId((prev) => {
          const currentValid = depts.some((d: any) => d.id === prev);
          const chosenDept = currentValid ? prev : depts[0].id;
          const matching = progs.filter((p: any) => p.department === chosenDept);
          if (matching.length > 0) {
            setSelectedProgramId((prevProg) => {
              const progValid = matching.some((p: any) => p.id === prevProg);
              return progValid ? prevProg : matching[0].id;
            });
          }
          return chosenDept;
        });
      }
    } catch (err) {
      // Handled gracefully
    }
  };

  useEffect(() => {
    loadAcademicBlueprint();
  }, [authMode]);

  // Filtered Programs for selected Department
  const availablePrograms = programs.filter(
    (p) => !selectedDeptId || p.department === selectedDeptId,
  );

  // Filtered Sections for selected Program and Semester (Only Created Batches in DB)
  const availableSections = sections.filter(
    (s) => (!selectedProgramId || s.program === selectedProgramId) && Number(s.semester) === Number(semester),
  );

  const createdSections = Array.from(
    new Map(
      availableSections.map((sec) => [
        (sec.section || sec.section_name || "").trim().toUpperCase(),
        sec,
      ]),
    ).values(),
  );

  const selectedProgramObj = programs.find((p) => p.id === selectedProgramId);
  const selectedDeptObj = departments.find((d) => d.id === selectedDeptId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please Enter A Valid Email Address.");
      return;
    }

    if (authMode === "register" && password !== confirmPassword) {
      toast.error("Passwords Do Not Match. Please Verify.");
      return;
    }

    setLoading(true);
    try {
      if (authMode === "register") {
        const deptName = selectedDeptObj?.name || (departments.find((d) => d.id === selectedDeptId)?.name) || "Department Of Computer Science & Engineering";
        const progName = selectedProgramObj?.name || (programs.find((p) => p.id === selectedProgramId)?.name) || "B.Tech Computer Science & Engineering";
        const studentName: string = (fullName && fullName.trim()) ? fullName.trim() : (email ? (email.split("@")[0] || "Scholar") : "Scholar");
        const progCode = (selectedProgramObj?.code || "STU").replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase();
        const studentRoll: string = rollNumber.trim() ? rollNumber.trim() : `26${progCode}001`;
        const studentSection: string = (section && section.trim()) ? section.trim().toUpperCase() : "A";
        const studentTarget: string = targetCgpa.trim() ? targetCgpa.trim() : "9.50";
        const studentCurrent: string = currentCgpa.trim() ? currentCgpa.trim() : "9.00";

        const initialAssignedTier = isFreePlan ? "FREE" : selectedPlan;

        await register({
          email,
          password,
          full_name: studentName,
          department: deptName,
          program: progName,
          semester: Number(semester) || 1,
          section: studentSection,
          roll_number: studentRoll,
          target_cgpa: studentTarget,
          current_cgpa: studentCurrent,
          access_tier: initialAssignedTier,
        });

        // 1. Paid Plan With 100% Free Pass Coupon Applied (Zero Payment Required)
        if (!isFreePlan && currentFinalPayable === 0 && appliedCoupon) {
          try {
            await apiFetch<any>("/subscriptions/razorpay/create-order/", {
              method: "POST",
              body: JSON.stringify({
                plan_tier: selectedPlan,
                cycle: billingCycle,
                coupon_code: appliedCoupon.code,
              }),
            });
            toast.success(`Welcome! Your ${activePlanPricing.name} Has Been Activated With 100% Free Pass!`);
          } catch {
            toast.success("Account Created Successfully! Welcome To SaastaScholar.");
          }
          window.location.href = "/dashboard";
          return;
        }

        // 2. Paid Plan With Razorpay Payment Gateway Trigger
        if (!isFreePlan && currentFinalPayable > 0) {
          initiateRazorpayPayment({
            planTier: selectedPlan,
            cycle: billingCycle,
            couponCode: appliedCoupon?.code,
            onSuccess: async () => {
              toast.success(`Payment Verified! Welcome To ${activePlanPricing.name}.`);
              window.location.href = "/dashboard";
            },
            onError: () => {
              toast.info("Account Created As Free Scholar. You Can Upgrade Your Pass Anytime In Dashboard.");
              window.location.href = "/dashboard?tab=membership";
            },
          });
          return;
        }

        // 3. Free Plan Default Registration
        toast.success("Account Created Successfully! Welcome To SaastaScholar.");
        const searchParams = new URLSearchParams(window.location.search);
        const destinationTab = searchParams.get("tab") || "overview";
        window.location.href = `/dashboard?tab=${encodeURIComponent(destinationTab)}`;
        return;
      } else {
        const targetPortal: "student" | "admin" = authMode === "admin" ? "admin" : "student";
        const authenticatedUser = await login(email, password, targetPortal);

        const isUserAdmin = Boolean(
          authenticatedUser.is_staff ||
          authenticatedUser.is_superuser ||
          authenticatedUser.email === "admin@nims.edu.in"
        );

        if (authMode === "admin") {
          if (isUserAdmin) {
            navigate({ to: "/admin" });
          } else {
            toast.error("Access Denied: Administrative Clearance Required. Student Scholars Must Sign In Exclusively Through The Student Portal.");
          }
        } else {
          if (isUserAdmin) {
            toast.error("Access Denied: Administrator Credentials Detected. Administrator Accounts Must Sign In Exclusively Through The Admin Portal.");
          } else {
            const searchParams = new URLSearchParams(window.location.search);
            const destinationTab = searchParams.get("tab");
            if (destinationTab) {
              window.location.href = `/dashboard?tab=${encodeURIComponent(destinationTab)}`;
            } else {
              navigate({ to: "/dashboard" });
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication Failed. Please Check Credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background py-8 px-4 sm:px-8 sm:py-12 flex items-center justify-center min-w-0">
      {/* Dynamic Ambient Mesh Glows Matched to Logo Triad */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[50rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#005F15]/20 via-[#007EAC]/15 to-[#BA0000]/15 blur-[120px] opacity-75"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-gradient-to-bl from-[#007EAC]/20 via-[#005F15]/15 to-[#BA0000]/10 blur-[100px]"
      />

      {/* Blueprint Grid Overlay */}
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-80 [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent)]"
      />

      <div className="relative mx-auto w-full max-w-4xl min-w-0 space-y-4">
        {/* Top Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/85 px-3 sm:px-4 py-1.5 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-xs transition-all hover:border-primary/50 hover:bg-surface active:scale-95 cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-primary" />
            <span>Return To Home</span>
          </a>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card/85 text-foreground hover:bg-surface cursor-pointer transition-all shadow-2xs shrink-0"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#005F15]/30 bg-[#005F15]/10 dark:border-emerald-500/30 dark:bg-emerald-500/10 px-2.5 sm:px-3.5 py-1.5 text-[0.68rem] sm:text-xs font-bold text-[#005F15] dark:text-emerald-300 shadow-2xs shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>
                {authMode === "admin" ? (
                  <>Administrative Portal</>
                ) : (
                  <>Student Study Portal</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="overflow-hidden rounded-3xl border border-border/90 bg-card/90 shadow-[0_24px_70px_-25px_color-mix(in_oklab,var(--color-primary-deep)_35%,transparent)] backdrop-blur-md min-w-0 animate-smooth-entrance hover-lift-subtle">
          {/* Card Top Banner Matched To Logo Palette */}
          <div className="border-b border-border/80 bg-gradient-to-r from-[#005F15]/15 via-surface to-[#007EAC]/15 px-4 sm:px-8 py-3.5 sm:py-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src="/SaastaScholar.png"
                    alt="SaastaScholar Logo"
                    className="h-10 w-10 object-contain rounded-2xl p-1 bg-white border border-border/70 shadow-md shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-2 cursor-pointer"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-base sm:text-lg font-bold text-logo-gradient truncate">
                    {authMode === "admin" ? "Administrative Portal" : "Student Study Portal"}
                  </h1>
                  <p className="text-[0.68rem] sm:text-xs text-muted-foreground truncate">
                    {authMode === "admin"
                      ? "Manage Departments, Study Materials & College Notices"
                      : "Handwritten Notes, Solved Papers & Lab Codes"}
                  </p>
                </div>
              </div>

              {/* Segmented Mode Switcher */}
              <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 bg-surface/90 p-1 rounded-2xl border border-border shadow-2xs w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setSignupStep(1);
                    setEmail("");
                    setPassword("");
                  }}
                  className={cn(
                    "px-2.5 sm:px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-xs text-center whitespace-nowrap active:scale-95",
                    authMode === "login"
                      ? "bg-primary text-primary-foreground shadow-xs font-bold ring-1 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setSignupStep(1);
                    setEmail("");
                    setPassword("");
                  }}
                  className={cn(
                    "px-2.5 sm:px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-xs text-center whitespace-nowrap active:scale-95",
                    authMode === "register"
                      ? "bg-primary text-primary-foreground shadow-xs font-bold ring-1 ring-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("admin");
                    setSignupStep(1);
                    setEmail("");
                    setPassword("");
                  }}
                  className={cn(
                    "px-2.5 sm:px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs sm:text-xs text-center whitespace-nowrap active:scale-95",
                    authMode === "admin"
                      ? "bg-emerald-600 text-white shadow-xs font-bold ring-1 ring-emerald-500/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  Admin Login
                </button>
              </div>
            </div>
          </div>

          {/* Symmetrical 2-Column Content Grid */}
          <div className="p-6 sm:p-8 min-w-0">
            <div className="grid gap-8 lg:grid-cols-12 min-w-0 items-start">
              {/* Left Column: Input Form (7 cols) */}
              <div className="lg:col-span-7 min-w-0 flex flex-col justify-between space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      {authMode === "register" && "New Student Sign Up"}
                      {authMode === "login" && "Student Log In"}
                      {authMode === "admin" && "Administrative Sign In"}
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-tight">
                    {authMode === "register" && "Join Your Academic Workspace"}
                    {authMode === "login" && "Welcome Back, Student!"}
                    {authMode === "admin" && "Administrative Portal"}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {authMode === "register" && "Create Your Scholar Account To Access Handwritten Notes, Solved Papers, And Practical Lab Packets For Your Class."}
                    {authMode === "login" && "Log In To Access Your Daily Notes, Solved Exam Papers, And Class Timetable."}
                    {authMode === "admin" && "Sign In To Upload Course Notes, Manage Student Batches, And Send College Notices."}
                  </p>
                </div>

                {/* 3-Step Indicator on Registration */}
                {authMode === "register" && (
                  <div className="space-y-2 mb-2">
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="font-bold text-foreground">
                        {signupStep === 1 && "Step 1 of 3: Student Identity & Course"}
                        {signupStep === 2 && "Step 2 of 3: Academic Cohort & Goals"}
                        {signupStep === 3 && "Step 3 of 3: Account Security & Credentials"}
                      </span>
                      <span className="text-[0.68rem] font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full">
                        {signupStep === 1 ? "33% Complete" : signupStep === 2 ? "66% Complete" : "Almost Done!"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 bg-surface/85 border border-border/80 rounded-2xl p-1.5 sm:p-2">
                      <button
                        type="button"
                        onClick={() => setSignupStep(1)}
                        className={cn(
                          "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 justify-center sm:justify-start",
                          signupStep === 1
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : signupStep > 1
                            ? "text-primary hover:bg-primary/10"
                            : "text-muted-foreground"
                        )}
                      >
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-black/15 dark:bg-white/15 text-[0.65rem] font-extrabold shrink-0">1</span>
                        <span className="truncate">Course</span>
                      </button>
                      <div className={cn("h-0.5 flex-1 min-w-2 transition-colors", signupStep >= 2 ? "bg-primary" : "bg-border/60")} />
                      <button
                        type="button"
                        onClick={() => {
                          if (!fullName.trim()) {
                            toast.error("Please Enter Full Student Name First.");
                            return;
                          }
                          setSignupStep(2);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 justify-center sm:justify-start",
                          signupStep === 2
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : signupStep > 2
                            ? "text-primary hover:bg-primary/10"
                            : "text-muted-foreground"
                        )}
                      >
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-black/15 dark:bg-white/15 text-[0.65rem] font-extrabold shrink-0">2</span>
                        <span className="truncate">Cohort</span>
                      </button>
                      <div className={cn("h-0.5 flex-1 min-w-2 transition-colors", signupStep >= 3 ? "bg-primary" : "bg-border/60")} />
                      <button
                        type="button"
                        onClick={() => {
                          if (!fullName.trim()) {
                            toast.error("Please Enter Full Student Name First.");
                            return;
                          }
                          if (!rollNumber.trim()) {
                            toast.error("Please Enter Student ID / Roll Number.");
                            return;
                          }
                          setSignupStep(3);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 justify-center sm:justify-start",
                          signupStep === 3
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "text-muted-foreground"
                        )}
                      >
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-black/15 dark:bg-white/15 text-[0.65rem] font-extrabold shrink-0">3</span>
                        <span className="truncate">Security</span>
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5 min-w-0">
                  {authMode === "register" ? (
                    <>
                      {/* Step 1: Student Identity & Degree Program */}
                      {signupStep === 1 && (
                        <div className="space-y-3.5">
                          <div>
                            <label className="block text-xs font-bold text-foreground mb-1">Full Student Name</label>
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="E.g. Aarav Sharma"
                              required
                              className="h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                            />
                          </div>

                          {/* Academic Department */}
                          <div>
                            <label className="block text-xs font-bold text-foreground mb-1">College Department</label>
                            <select
                              value={selectedDeptId}
                              onChange={(e) => {
                                const newDeptId = e.target.value;
                                setSelectedDeptId(newDeptId);
                                const matchingProgs = programs.filter((p) => p.department === newDeptId);
                                if (matchingProgs.length > 0 && matchingProgs[0]?.id) {
                                  const newProgId = matchingProgs[0].id;
                                  setSelectedProgramId(newProgId);
                                  const matchingSecs = sections.filter(
                                    (s) => s.program === newProgId && Number(s.semester) === Number(semester)
                                  );
                                  if (matchingSecs.length > 0 && matchingSecs[0]) {
                                    const exists = matchingSecs.some(
                                      (s) => (s.section || s.section_name || "").trim().toUpperCase() === section.trim().toUpperCase()
                                    );
                                    if (!exists) {
                                      setSection((matchingSecs[0]?.section || matchingSecs[0]?.section_name || "A").trim().toUpperCase());
                                    }
                                  }
                                } else {
                                  setSelectedProgramId("");
                                }
                              }}
                              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none transition-colors"
                            >
                              {departments.length === 0 ? (
                                <option value="">No Departments Registered Yet</option>
                              ) : (
                                departments.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name} ({d.code})
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          {/* Degree Program / Specialization */}
                          <div>
                            <label className="block text-xs font-bold text-foreground mb-1">Degree Course / Branch</label>
                            <select
                              value={selectedProgramId}
                              onChange={(e) => {
                                const newProgId = e.target.value;
                                setSelectedProgramId(newProgId);
                                const matchingSecs = sections.filter(
                                  (s) => s.program === newProgId && Number(s.semester) === Number(semester)
                                );
                                if (matchingSecs.length > 0 && matchingSecs[0]) {
                                  const exists = matchingSecs.some(
                                    (s) => (s.section || s.section_name || "").trim().toUpperCase() === section.trim().toUpperCase()
                                  );
                                  if (!exists) {
                                    setSection((matchingSecs[0]?.section || matchingSecs[0]?.section_name || "A").trim().toUpperCase());
                                  }
                                }
                              }}
                              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none transition-colors"
                            >
                              {availablePrograms.length === 0 ? (
                                <option value="">Select Degree Course...</option>
                              ) : (
                                availablePrograms.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.code})
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!fullName.trim()) {
                                toast.error("Please Enter Your Full Student Name.");
                                return;
                              }
                              if (!selectedDeptId) {
                                toast.error("Please Select A College Department.");
                                return;
                              }
                              if (!selectedProgramId) {
                                toast.error("Please Select A Degree Course / Branch.");
                                return;
                              }
                              setSignupStep(2);
                            }}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-deep hover:shadow-lg active:scale-[0.98] cursor-pointer mt-3"
                          >
                            <span>Next: Academic Cohort &amp; CGPA</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {/* Step 2: Academic Cohort & Goals */}
                      {signupStep === 2 && (
                        <div className="space-y-3.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1">Current Semester</label>
                              <select
                                value={semester}
                                onChange={(e) => {
                                  const newSem = Number(e.target.value);
                                  setSemester(newSem);
                                  const matchingSecs = sections.filter(
                                    (s) => (!selectedProgramId || s.program === selectedProgramId) && Number(s.semester) === newSem
                                  );
                                  if (matchingSecs.length > 0 && matchingSecs[0]) {
                                    const exists = matchingSecs.some(
                                      (s) => (s.section || s.section_name || "").trim().toUpperCase() === section.trim().toUpperCase()
                                    );
                                    if (!exists) {
                                      setSection((matchingSecs[0]?.section || matchingSecs[0]?.section_name || "A").trim().toUpperCase());
                                    }
                                  }
                                }}
                                className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none"
                              >
                                {Array.from({ length: selectedProgramObj?.total_semesters || 8 }, (_, i) => i + 1).map((s) => (
                                  <option key={s} value={s}>
                                    Semester {s}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-foreground">
                                  Class Section
                                </label>
                                <span className="text-[0.65rem] font-mono font-bold text-primary">
                                  {createdSections.length > 0
                                    ? `${createdSections.length} Available`
                                    : "Default Section"}
                                </span>
                              </div>

                              <select
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none"
                              >
                                {createdSections.length > 0 ? (
                                  createdSections.map((sec) => {
                                    const secVal = (sec.section || sec.section_name || "A").trim().toUpperCase();
                                    return (
                                      <option key={sec.id || secVal} value={secVal}>
                                        Section {secVal}
                                        {sec.batch_code ? ` (${sec.batch_code})` : ""}
                                      </option>
                                    );
                                  })
                                ) : (
                                  <option value="A">Section A</option>
                                )}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-foreground mb-1">Student ID / University Roll Number</label>
                            <input
                              type="text"
                              value={rollNumber}
                              onChange={(e) => setRollNumber(e.target.value)}
                              placeholder="E.g. 24BCSE102"
                              required
                              className="h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-xs font-mono focus:border-primary focus:outline-none transition-colors"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1">Current CGPA</label>
                              <input
                                type="text"
                                value={currentCgpa}
                                onChange={(e) => setCurrentCgpa(e.target.value)}
                                placeholder="E.g. 8.50"
                                className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono focus:border-primary focus:outline-none transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1">Target CGPA Goal</label>
                              <input
                                type="text"
                                value={targetCgpa}
                                onChange={(e) => setTargetCgpa(e.target.value)}
                                placeholder="E.g. 9.50"
                                className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:border-primary focus:outline-none transition-colors"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setSignupStep(1)}
                              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-4 text-xs font-bold text-foreground transition-all hover:bg-muted cursor-pointer"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              <span>Back</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!rollNumber.trim()) {
                                  toast.error("Please Enter Your Student ID / Roll Number.");
                                  return;
                                }
                                setSignupStep(3);
                              }}
                              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-deep hover:shadow-lg active:scale-[0.98] cursor-pointer"
                            >
                              <span>Next: Credentials &amp; Security</span>
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Account Credentials & Security */}
                      {signupStep === 3 && (
                        <div className="space-y-3.5">
                          {/* Summary Pill */}
                          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="font-bold text-foreground block">{fullName || "Student Scholar"}</span>
                              <span className="text-[0.7rem] text-muted-foreground">
                                {selectedProgramObj?.code || "Program"} · Semester {semester} ({section}) · Roll: {rollNumber || "Pending"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSignupStep(1)}
                              className="text-[0.7rem] font-bold text-primary hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-foreground mb-1">College Email Address</label>
                            <div className="relative">
                              <Mail className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="student@nims.edu.in"
                                required
                                className="h-11 w-full rounded-2xl border border-border bg-background pr-3.5 pl-10 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1">Create A Password</label>
                              <div className="relative">
                                <Lock className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="••••••••"
                                  required
                                  className="h-11 w-full rounded-2xl border border-border bg-background pr-3.5 pl-10 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1">Confirm Password</label>
                              <div className="relative">
                                <Lock className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="••••••••"
                                  required
                                  className="h-11 w-full rounded-2xl border border-border bg-background pr-3.5 pl-10 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Plan Selection (Default: Starter Free) */}
                          <div className="rounded-2xl border border-border/80 bg-surface/50 p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Award className="h-4 w-4 text-primary" />
                                <span>Choose Membership Plan</span>
                              </label>
                              <span className="text-[0.62rem] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full uppercase">
                                Free Starter Default
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-left">
                              {/* Free */}
                              <button
                                type="button"
                                onClick={() => setSelectedPlan("FREE")}
                                className={cn(
                                  "rounded-xl border p-2.5 transition-all text-left cursor-pointer flex flex-col justify-between",
                                  selectedPlan === "FREE" || selectedPlan === "STARTER"
                                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                                    : "border-border/80 bg-card hover:border-primary/40"
                                )}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Free</span>
                                    {(selectedPlan === "FREE" || selectedPlan === "STARTER") && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                                  </div>
                                  <span className="text-sm font-extrabold text-foreground block mt-0.5">₹0 · Free</span>
                                </div>
                                <span className="text-[0.6rem] text-muted-foreground mt-1 leading-tight block line-clamp-2">Syllabus, Time Table, Faculty Materials, Notices, Exam Dates</span>
                              </button>

                              {/* Basic */}
                              <button
                                type="button"
                                onClick={() => setSelectedPlan("BASIC")}
                                className={cn(
                                  "rounded-xl border p-2.5 transition-all text-left cursor-pointer flex flex-col justify-between",
                                  selectedPlan === "BASIC" || selectedPlan === "SCHOLAR"
                                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                                    : "border-border/80 bg-card hover:border-primary/40"
                                )}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary">Basic</span>
                                    {(selectedPlan === "BASIC" || selectedPlan === "SCHOLAR") && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                                  </div>
                                  <span className="text-sm font-extrabold text-foreground block mt-0.5">₹99<span className="text-[0.6rem] font-normal text-muted-foreground">/mo</span></span>
                                </div>
                                <span className="text-[0.6rem] text-muted-foreground mt-1 leading-tight block line-clamp-2">Free + Handwritten Notes</span>
                              </button>

                              {/* Premium */}
                              <button
                                type="button"
                                onClick={() => setSelectedPlan("PREMIUM")}
                                className={cn(
                                  "rounded-xl border p-2.5 transition-all text-left cursor-pointer flex flex-col justify-between relative",
                                  selectedPlan === "PREMIUM" || selectedPlan === "ACHIEVER"
                                    ? "border-emerald-500 bg-emerald-500/15 shadow-xs ring-1 ring-emerald-500/50"
                                    : "border-border/80 bg-card hover:border-emerald-500/40"
                                )}
                              >
                                <span className="absolute -top-1.5 right-2 text-[0.5rem] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                                  Popular
                                </span>
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Premium</span>
                                    {(selectedPlan === "PREMIUM" || selectedPlan === "ACHIEVER") && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                                  </div>
                                  <span className="text-sm font-extrabold text-foreground block mt-0.5">₹129<span className="text-[0.6rem] font-normal text-muted-foreground">/mo</span></span>
                                </div>
                                <span className="text-[0.6rem] text-muted-foreground mt-1 leading-tight block line-clamp-2">Basic + Handwritten Lab Manual And Viva Practice + PYQ Papers</span>
                              </button>

                              {/* Elite */}
                              <button
                                type="button"
                                onClick={() => setSelectedPlan("ELITE")}
                                className={cn(
                                  "rounded-xl border p-2.5 transition-all text-left cursor-pointer flex flex-col justify-between",
                                  selectedPlan === "ELITE" || selectedPlan === "ELITE_PLUS"
                                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                                    : "border-border/80 bg-card hover:border-primary/40"
                                )}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Elite</span>
                                    {(selectedPlan === "ELITE" || selectedPlan === "ELITE_PLUS") && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                                  </div>
                                  <span className="text-sm font-extrabold text-foreground block mt-0.5">₹159<span className="text-[0.6rem] font-normal text-muted-foreground">/mo</span></span>
                                </div>
                                <span className="text-[0.6rem] text-muted-foreground mt-1 leading-tight block line-clamp-2">Premium + Most Expected Question Paper + Sample Practice Papers</span>
                              </button>
                            </div>
                            {!isFreePlan && (
                              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 flex items-center justify-between text-xs animate-in fade-in">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-foreground block">
                                    {activePlanPricing.name} Plan Selected ({billingCycle === "semester" ? "Semester Pass" : "Monthly"})
                                  </span>
                                  <span className="text-[0.68rem] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                    Billing Cycle &amp; Coupon Options Configured On The Right &rarr;
                                  </span>
                                </div>
                                <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                                  ₹{currentFinalPayable}
                                </span>
                              </div>
                            )}

                            {isFreePlan && (
                              <p className="text-[0.65rem] text-emerald-600 dark:text-emerald-400 font-semibold text-center">
                                ✓ Free Student Registration Grants Instant Access. You Can Upgrade Your Academic Plan Anytime In Dashboard Settings.
                              </p>
                            )}
                          </div>

                          <p className="text-[0.68rem] text-muted-foreground leading-relaxed">
                            By Registering, You Agree To The{" "}
                            <span className="font-semibold text-foreground">Terms Of Service</span> And{" "}
                            <span className="font-semibold text-foreground">Student Privacy Policy (DPDP Act, 2023)</span>.
                          </p>

                          <div className="flex items-center gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setSignupStep(2)}
                              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-4 text-xs font-bold text-foreground transition-all hover:bg-muted cursor-pointer"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              <span>Back</span>
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-deep hover:shadow-lg active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                            >
                              {loading ? (
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                              ) : (
                                <>
                                  {isFreePlan ? (
                                    <>
                                      <span>Complete Free Registration</span>
                                      <CheckCircle2 className="h-4 w-4" />
                                    </>
                                  ) : currentFinalPayable === 0 ? (
                                    <>
                                      <Sparkles className="h-4 w-4" />
                                      <span>Activate 100% Free Pass &amp; Complete Registration</span>
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="h-4 w-4" />
                                      <span>Pay ₹{currentFinalPayable} &amp; Complete Registration</span>
                                    </>
                                  )}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          {authMode === "admin" ? "Administrator Email Address" : "College Email Address"}
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={authMode === "admin" ? "admin@saastascholar.in" : "student@nims.edu.in"}
                            required
                            className="h-11 w-full rounded-2xl border border-border bg-background pr-3.5 pl-10 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">Password</label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="h-11 w-full rounded-2xl border border-border bg-background pr-3.5 pl-10 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                        {authMode === "login" && (
                          <div className="flex justify-end mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setResetEmail(email);
                                setShowResetModal(true);
                                setResetStep(1);
                              }}
                              className="text-[0.72rem] font-semibold text-primary hover:underline cursor-pointer"
                            >
                              Forgot Password?
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Simple Role Switch Helper */}
                      {authMode === "login" && (
                        <div className="flex items-center gap-2 rounded-2xl bg-muted/60 border border-border/80 p-3 text-xs text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                          <div className="leading-snug">
                            <span>Authorized System Administrator? </span>
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode("admin");
                                setSignupStep(1);
                                setEmail("");
                                setPassword("");
                              }}
                              className="font-bold text-primary underline hover:text-primary-deep cursor-pointer"
                            >
                              Click Here For Admin Portal
                            </button>
                          </div>
                        </div>
                      )}

                      {authMode === "admin" && (
                        <div className="flex items-center gap-2 rounded-2xl bg-muted/60 border border-border/80 p-3 text-xs text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                          <div className="leading-snug">
                            <span>Are You A Student Looking For Notes? </span>
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode("login");
                                setSignupStep(1);
                                setEmail("");
                                setPassword("");
                              }}
                              className="font-bold text-emerald-600 underline hover:text-emerald-700 cursor-pointer"
                            >
                              Click Here For Student Log In
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-xs sm:text-sm font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-3 ${
                          authMode === "admin"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-primary hover:bg-primary-deep text-primary-foreground"
                        }`}
                      >
                        {loading ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : (
                          <>
                            <span>
                              {authMode === "login" && "Log In To Study Hub"}
                              {authMode === "admin" && "Sign In As Administrator"}
                            </span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Right Column: Offerings, Pricing & Protection */}
              <div className="lg:col-span-5 min-w-0 flex flex-col justify-between space-y-4">
                {/* 1. What You Get Card */}
                <div className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 min-w-0 space-y-4 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/80 pb-3">
                      <span className="font-bold text-sm text-foreground">
                        {authMode === "admin" ? "Administrative Management Tools" : "Everything You Need For Top Marks"}
                      </span>
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>

                    <div className="space-y-3 text-xs mt-3.5">
                      {authMode === "admin" ? (
                        <>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <Building2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Organize College Departments, Courses &amp; Class Sections
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <FileText className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Upload Chapter-Wise Lecture Notes &amp; Exam Papers
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <FlaskConical className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Share Lab Experiment Source Code &amp; Viva Questions
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <Megaphone className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Post Urgent Announcements, Circulars &amp; Date Sheets
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-foreground block">Chapter-Wise Handwritten Notes</span>
                              <span className="text-[0.7rem] text-muted-foreground">Clean Formulas, Diagrams, And Easy Summaries.</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <FileCheck2 className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-foreground block">Solved Past Exam Papers</span>
                              <span className="text-[0.7rem] text-muted-foreground">Step-By-Step Model Answers For Mid-Sem And End-Sem Exams.</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <FlaskConical className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-foreground block">Lab Manuals &amp; Working Code</span>
                              <span className="text-[0.7rem] text-muted-foreground">Ready-To-Run Code And Top 50+ Viva Questions With Answers.</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-foreground block">Daily Timetable &amp; Notices</span>
                              <span className="text-[0.7rem] text-muted-foreground">Class Schedules, Exam Date Sheets, And College Circulars.</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Free Starter Access Guarantee Card (Replaces Cramped Plans) */}
                {authMode === "register" && (
                  <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 space-y-2.5 shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Start 100% Free Forever</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every Student Begins With Immediate Access To Chapter-Wise Handwritten Notes, Syllabus Breakdowns, Class Timetables, And College Circulars. No Credit Card Required.
                    </p>
                  </div>
                )}

                {/* 3. Clean Reading Card */}
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-xs text-emerald-800 dark:text-emerald-300 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{authMode === "admin" ? "Secure Administration System" : "Distraction-Free Study Reader"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {authMode === "admin"
                      ? "Administrative Actions, Syllabus Publishing, And Student Updates Are Protected With Secure Cloud Encryption."
                      : "Study Peacefully With Fast, Crystal-Clear Pages Designed To Help You Read Comfortably And Score Higher In Exams."}
                  </p>
                </div>

                {/* 4. Billing Cycle & Promotional Coupon Code (Right Side Position) */}
                {authMode === "register" && signupStep === 3 && !isFreePlan && (
                  <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 space-y-3.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Billing Cycle Toggle */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>Select Billing Cycle</span>
                        <span className="text-[0.62rem] font-bold text-emerald-600 dark:text-emerald-400">
                          {billingCycle === "semester" ? "Save 20% With Semester Pass" : "Billed Monthly"}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBillingCycle("monthly");
                            setAppliedCoupon(null);
                          }}
                          className={cn(
                            "rounded-xl py-2 px-3 text-xs font-bold border transition-all cursor-pointer text-center",
                            billingCycle === "monthly"
                              ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40"
                              : "border-border/80 bg-card text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          Monthly (₹{activePlanPricing.monthly}/mo)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBillingCycle("semester");
                            setAppliedCoupon(null);
                          }}
                          className={cn(
                            "rounded-xl py-2 px-3 text-xs font-bold border transition-all cursor-pointer text-center relative",
                            billingCycle === "semester"
                              ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/50"
                              : "border-border/80 bg-card text-muted-foreground hover:border-emerald-500/40"
                          )}
                        >
                          Semester (₹{activePlanPricing.semester}/sem)
                        </button>
                      </div>
                    </div>

                    {/* Promo Discount Coupon Code Box */}
                    <div className="space-y-2 pt-1 border-t border-emerald-500/20">
                      <label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-primary" />
                          <span>Apply Promotional Coupon Code</span>
                        </span>
                        {appliedCoupon && (
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-[0.65rem] font-bold text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                            <span>Remove Coupon</span>
                          </button>
                        )}
                      </label>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter Code (E.g. SAASTA100)"
                            disabled={Boolean(appliedCoupon)}
                            className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-3 text-xs font-bold uppercase tracking-wider focus:border-primary focus:outline-none disabled:opacity-60"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim() || Boolean(appliedCoupon)}
                          className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary-deep transition-all disabled:opacity-50 cursor-pointer shrink-0"
                        >
                          {couponLoading ? (
                            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          ) : (
                            <span>Apply</span>
                          )}
                        </button>
                      </div>

                      {/* Quick Coupon Preset Chips */}
                      {!appliedCoupon && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[0.62rem] text-muted-foreground font-semibold">Presets:</span>
                          <button
                            type="button"
                            onClick={() => handleSelectQuickCoupon("SAASTA100")}
                            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                          >
                            SAASTA100 (100% Free Pass)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectQuickCoupon("SCHOLAR20")}
                            className="rounded-lg border border-border bg-card px-2 py-0.5 text-[0.62rem] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            SCHOLAR20 (20% Off)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectQuickCoupon("EXAM50")}
                            className="rounded-lg border border-border bg-card px-2 py-0.5 text-[0.62rem] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            EXAM50 (₹50 Off)
                          </button>
                        </div>
                      )}

                      {/* Applied Coupon Feedback & Breakdown Card */}
                      {appliedCoupon && (
                        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span>{appliedCoupon.code} Applied</span>
                            </span>
                            <span className="text-[0.65rem] font-bold bg-emerald-500 text-white px-2 py-0.2 rounded-full">
                              {appliedCoupon.discount_percent}% Discount
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground border-t border-emerald-500/20 pt-1">
                            <span>Regular Plan Price:</span>
                            <span>₹{currentBasePrice}</span>
                          </div>
                          <div className="flex items-center justify-between text-[0.7rem] text-emerald-600 dark:text-emerald-400 font-bold">
                            <span>Voucher Savings:</span>
                            <span>-₹{appliedCoupon.discount_amount_inr}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-black text-foreground border-t border-emerald-500/20 pt-1">
                            <span>Final Payable Amount:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                              ₹{appliedCoupon.final_amount_inr}
                              {appliedCoupon.final_amount_inr === 0 && " (100% Free Pass)"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Brand & Trademark Protection Note */}
        <div className="mt-6 text-center text-xs text-muted-foreground/80 space-y-1 animate-fade-in">
          <p className="font-medium">
            © {new Date().getFullYear()} <strong className="text-foreground">SaastaScholar™</strong>. All Rights Reserved. A DurgaAI Solutions Academic Innovation.
          </p>
          <p className="text-[0.68rem] text-muted-foreground/70 max-w-xl mx-auto leading-relaxed">
            Proprietary Trademark Owned By DurgaAI Solutions Under The Trade Marks Act, 1999. Student Personal Data Is Strictly Protected In Accordance With The Digital Personal Data Protection Act, 2023 (DPDP Act).
          </p>
        </div>
      </div>

      {/* ===================== Interactive Password Reset Dialog Modal ===================== */}
      <Dialog open={showResetModal} onOpenChange={(open) => !open && setShowResetModal(false)}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-md p-6 bg-card border border-border/80 shadow-2xl rounded-3xl">
          <DialogHeader className="text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Lock className="h-3.5 w-3.5" />
              <span>Password Recovery</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {resetStep === 1 ? "Reset Your Account Password" : "Enter Verification Code"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {resetStep === 1
                ? "Enter Your Registered College Email Address To Receive A Secure 6-Digit Verification Code."
                : `We've Sent A 6-Digit Code To ${resetEmail}. Enter It Below Along With Your New Password.`}
            </DialogDescription>
          </DialogHeader>

          {resetStep === 1 ? (
            <form onSubmit={handleRequestResetOtp} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Registered College Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="student@nims.edu.in"
                    required
                    className="h-11 w-full rounded-2xl border border-border bg-background pr-3.5 pl-10 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-deep transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {resetLoading ? (
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <span>Send 6-Digit Code</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmPasswordReset} className="space-y-3.5 mt-2">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  required
                  className="h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-center font-mono text-base font-bold tracking-widest focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Create New Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="h-11 w-full rounded-2xl border border-border bg-background pr-3.5 pl-10 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setResetStep(1)}
                  className="text-xs font-bold text-muted-foreground hover:underline cursor-pointer"
                >
                  ← Back to Email
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-deep transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {resetLoading ? (
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
