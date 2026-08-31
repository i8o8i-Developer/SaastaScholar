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
  Zap,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/Hooks/UseAuth";
import { useTheme } from "@/Hooks/UseTheme";
import { toast } from "sonner";
import { apiFetch, Department, ProgramSpecialization, SectionBatch } from "@/Lib/Api";

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
  const [section, setSection] = useState<string>("");
  const [rollNumber, setRollNumber] = useState<string>("");
  const [targetCgpa, setTargetCgpa] = useState<string>("");
  const [currentCgpa, setCurrentCgpa] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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
          return currentValid ? prev : depts[0].id;
        });
      }
      if (progs.length > 0) {
        setSelectedProgramId((prev) => {
          const currentValid = progs.some((p: any) => p.id === prev);
          return currentValid ? prev : progs[0].id;
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

  // Filtered Sections for selected Program and Semester
  const availableSections = sections.filter(
    (s) => (!selectedProgramId || s.program === selectedProgramId) && s.semester === semester,
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
        const deptName = selectedDeptObj?.name || "Department Of Computer Science & Engineering";
        const progName = selectedProgramObj?.name || "B.Tech Computer Science & Engineering";
        const studentName: string = (fullName && fullName.trim()) ? fullName.trim() : (email ? (email.split("@")[0] || "Scholar") : "Scholar");
        const studentRoll: string = rollNumber.trim() ? rollNumber.trim() : `25${selectedProgramObj?.code || "CSE"}001`;
        const studentSection: string = section.trim() ? section.trim() : "A";
        const studentTarget: string = targetCgpa.trim() ? targetCgpa.trim() : "9.50";
        const studentCurrent: string = currentCgpa.trim() ? currentCgpa.trim() : "9.00";

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
        });
        navigate({ to: "/dashboard" });
      } else {
        await login(email, password);
        if (authMode === "admin" || email === "admin@nims.edu.in") {
          toast.success("Master Administrator Session Initialized.");
          navigate({ to: "/admin" });
        } else {
          toast.success("Student Scholar Authenticated.");
          navigate({ to: "/dashboard" });
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

      <div className="relative mx-auto w-full max-w-4xl min-w-0 space-y-4">
        {/* Top Breadcrumb Bar */}
        <div className="flex items-center justify-between min-w-0">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-4 py-1.5 text-xs font-semibold text-foreground shadow-2xs backdrop-blur-xs transition-all hover:border-primary/50 hover:bg-surface active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-primary" />
            <span>Return To Home</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card/85 text-foreground hover:bg-surface cursor-pointer transition-all shadow-2xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>
                {authMode === "admin" ? "Academic Administration Console" : "Student Dashboard & DRM Hub"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="overflow-hidden rounded-3xl border border-border/90 bg-card/90 shadow-[0_24px_70px_-25px_color-mix(in_oklab,var(--color-primary-deep)_35%,transparent)] backdrop-blur-md min-w-0">
          {/* Card Top Banner */}
          <div className="border-b border-border/80 bg-gradient-to-r from-emerald-500/10 via-surface to-teal-500/10 px-6 py-4 sm:px-8 sm:py-5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                  {authMode === "admin" ? <ShieldCheck className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-base sm:text-lg font-bold text-foreground truncate">
                    {authMode === "admin" ? "NimsWallah Administration Control" : "NimsWallah Student Portal"}
                  </h1>
                  <p className="text-[0.7rem] sm:text-xs text-muted-foreground truncate">
                    {authMode === "admin"
                      ? "Department Infrastructure, Specializations & Official Circular Broadcasts"
                      : "Handwritten Notes, Solved PYQs (2020–2025) & Lab Manuals"}
                  </p>
                </div>
              </div>

              {/* Segmented Mode Switcher */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl border border-border text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setEmail("");
                    setPassword("");
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                    authMode === "login"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Student Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setEmail("");
                    setPassword("");
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                    authMode === "register"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  New Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("admin");
                    setEmail("");
                    setPassword("");
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                    authMode === "admin"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Admin Portal
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
                      {authMode === "register" && "Register Student Account"}
                      {authMode === "login" && "Access Your Academic Workspace"}
                      {authMode === "admin" && "Institutional Controller Sign In"}
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-tight">
                    {authMode === "register" && "Set Up Your Semester Profile."}
                    {authMode === "login" && "Welcome Back, Student Scholar."}
                    {authMode === "admin" && "Administrative Master Console."}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {authMode === "register" && "Personalize Your Study Materials, Lecture Planner, And Lab Viva Banks For Your University Section."}
                    {authMode === "login" && "Sign In With Your Student Email To Access DRM-Protected Notes, 2020–2025 Solved PYQs, And Assignment Tools."}
                    {authMode === "admin" && "Manage University Departments, Degree Specializations, Semesters, Sections, And Broadcast Official Circulars."}
                  </p>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5 min-w-0">
                  {authMode === "register" && (
                    <>
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

                      {/* Dynamic Academic Blueprint Selectors */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Academic Department</label>
                          <select
                            value={selectedDeptId}
                            onChange={(e) => {
                              setSelectedDeptId(e.target.value);
                              const matchingProgs = programs.filter((p) => p.department === e.target.value);
                              if (matchingProgs.length > 0 && matchingProgs[0]?.id) {
                                setSelectedProgramId(matchingProgs[0].id);
                              } else {
                                setSelectedProgramId("");
                              }
                            }}
                            className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none transition-colors"
                          >
                            {departments.length === 0 ? (
                              <option value="">No Departments Registered Yet (Admin Config Required)</option>
                            ) : (
                              departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name} ({d.code})
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-foreground mb-1">Degree Program / Specialization</label>
                            <select
                              value={selectedProgramId}
                              onChange={(e) => setSelectedProgramId(e.target.value)}
                              className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs sm:text-sm font-semibold focus:border-primary focus:outline-none transition-colors"
                            >
                              {availablePrograms.length === 0 ? (
                                <option value="">Select Specialization...</option>
                              ) : (
                                availablePrograms.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.code})
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-foreground mb-1">Semester &amp; Cohort Section</label>
                            <div className="flex gap-2">
                              <select
                                value={semester}
                                onChange={(e) => setSemester(Number(e.target.value))}
                                className="h-11 w-1/2 rounded-2xl border border-border bg-background px-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                              >
                                {Array.from({ length: selectedProgramObj?.total_semesters || 8 }, (_, i) => i + 1).map((s) => (
                                  <option key={s} value={s}>
                                    Semester {s}
                                  </option>
                                ))}
                              </select>

                              {availableSections.length > 0 ? (
                                <select
                                  value={section}
                                  onChange={(e) => setSection(e.target.value)}
                                  className="h-11 w-1/2 rounded-2xl border border-border bg-background px-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                                >
                                  {availableSections.map((sec) => (
                                    <option key={sec.id} value={sec.section || sec.section_name || "A"}>
                                      Sec {sec.section || sec.section_name || "A"}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={section}
                                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                                  placeholder="Sec (E.g. A)"
                                  className="h-11 w-1/2 rounded-2xl border border-border bg-background px-3 text-xs text-center uppercase font-bold focus:border-primary focus:outline-none"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Student ID</label>
                          <input
                            type="text"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="e.g. 24BCSE102"
                            required
                            className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Current CGPA</label>
                          <input
                            type="text"
                            value={currentCgpa}
                            onChange={(e) => setCurrentCgpa(e.target.value)}
                            placeholder="9.12"
                            className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Target CGPA</label>
                          <input
                            type="text"
                            value={targetCgpa}
                            onChange={(e) => setTargetCgpa(e.target.value)}
                            placeholder="9.50"
                            className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      {authMode === "admin" ? "Administrative Controller Email" : "Institutional Email Address"}
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={authMode === "admin" ? "admin@nims.edu.in" : "student@nims.edu.in"}
                        required
                        className="h-11 w-full rounded-2xl border border-border bg-background pr-3.5 pl-10 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className={authMode === "register" ? "grid grid-cols-2 gap-3" : "space-y-1"}>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Account Password</label>
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

                    {authMode === "register" && (
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
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary-deep hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-3"
                  >
                    {loading ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        <span>
                          {authMode === "register" && "Register & Enter Dashboard"}
                          {authMode === "login" && "Sign In To Workspace"}
                          {authMode === "admin" && "Sign In As Institutional Administrator"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Symmetrical Features & Protection Overview (5 cols) */}
              <div className="lg:col-span-5 min-w-0 flex flex-col justify-between space-y-4">
                {/* 1. Academic / Admin Command Center Card */}
                <div className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 min-w-0 space-y-4 shadow-xs flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/80 pb-3">
                      <span className="font-bold text-sm text-foreground">
                        {authMode === "admin" ? "Institutional Control Center" : "Academic Command Center"}
                      </span>
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>

                    <div className="space-y-3.5 text-xs mt-4">
                      {authMode === "admin" ? (
                        <>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <Building2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Department &amp; Specialization Curriculum Matrix
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <FileText className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Live Unit Notes &amp; Solved PYQ Publishing Studio
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <FlaskConical className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Practical Labs, Multi-Language Code &amp; Viva Voce Banks
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <Megaphone className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Official University Circulars &amp; Timetable Dispatch
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Verified Handwritten Notes &amp; Master Formula Sheets
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <FileCheck2 className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              2020–2025 Solved University Examination Papers
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <FlaskConical className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Verified Lab Manuals &amp; 50+ Viva Voce Question Bank
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              AI Assignment Outlines &amp; IEEE Citation Engine
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Protected DRM Platform Card */}
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-xs text-emerald-800 dark:text-emerald-300 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{authMode === "admin" ? "Administrative Security Matrix" : "Protected DRM Platform"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {authMode === "admin"
                      ? "Administrative Actions, Curriculum Publications, And Student Telemetry Are Protected With JWT Bearer Tokens And Encrypted Role Permissions."
                      : "All Study Notes And Solved Papers Are Rendered In Real-Time With Your Dynamic Institutional Forensic Watermark. Strictly View-Only."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
