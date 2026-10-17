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
import { cn } from "@/Lib/Utils";

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
            navigate({ to: "/dashboard" });
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

            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 sm:px-3.5 py-1.5 text-[0.68rem] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>
                {authMode === "admin" ? (
                  <>
                    <span className="hidden xs:inline">Academic </span>Admin Portal
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Student Study </span>Portal
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="overflow-hidden rounded-3xl border border-border/90 bg-card/90 shadow-[0_24px_70px_-25px_color-mix(in_oklab,var(--color-primary-deep)_35%,transparent)] backdrop-blur-md min-w-0">
          {/* Card Top Banner */}
          <div className="border-b border-border/80 bg-gradient-to-r from-emerald-500/10 via-surface to-teal-500/10 px-4 sm:px-8 py-3.5 sm:py-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                  {authMode === "admin" ? <ShieldCheck className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-base sm:text-lg font-bold text-foreground truncate">
                    {authMode === "admin" ? "NimsWallah Admin Portal" : "NimsWallah Student Portal"}
                  </h1>
                  <p className="text-[0.68rem] sm:text-xs text-muted-foreground truncate">
                    {authMode === "admin"
                      ? "Manage Courses, Upload Notes & Send Notices"
                      : "Handwritten Notes, Solved Papers & Lab Codes"}
                  </p>
                </div>
              </div>

              {/* Segmented Mode Switcher */}
              <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 bg-surface p-1 rounded-2xl border border-border shadow-2xs w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setEmail("");
                    setPassword("");
                  }}
                  className={cn(
                    "px-1.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[0.68rem] xs:text-xs sm:text-xs text-center whitespace-nowrap",
                    authMode === "login"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="hidden xs:inline">Student </span>Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setEmail("");
                    setPassword("");
                  }}
                  className={cn(
                    "px-1.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[0.68rem] xs:text-xs sm:text-xs text-center whitespace-nowrap",
                    authMode === "register"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="hidden xs:inline">New </span>Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("admin");
                    setEmail("");
                    setPassword("");
                  }}
                  className={cn(
                    "px-1.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-[0.68rem] xs:text-xs sm:text-xs text-center whitespace-nowrap",
                    authMode === "admin"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Admin<span className="hidden xs:inline"> Portal</span>
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
                      {authMode === "register" && "Create Free Student Account"}
                      {authMode === "login" && "Student Login"}
                      {authMode === "admin" && "Teacher & Admin Sign In"}
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-tight">
                    {authMode === "register" && "Join NimsWallah."}
                    {authMode === "login" && "Welcome Back!"}
                    {authMode === "admin" && "Teacher & Admin Portal"}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {authMode === "register" && "Get All Your Class Notes, Solved Papers, And Practical Codes In One Simple Place."}
                    {authMode === "login" && "Log In To View Your Subject Notes, Old Exam Papers, And Syllabus."}
                    {authMode === "admin" && "Upload Notes, Publish Exam Papers, And Post College Notices For Students."}
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

                      {/* Cascading Academic Blueprint Selectors: Department -> Program -> Semester -> Listed Sections */}
                      <div className="space-y-3">
                        {/* Step 1: Academic Department */}
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Academic Department</label>
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

                        {/* Step 2: Degree Program / Specialization */}
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1">Degree Program / Specialization</label>
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

                        {/* Step 3 & 4: Semester & Listed Sections for Selected Program */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-foreground mb-1">Enrolled Semester</label>
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
                                Listed Cohort Section
                              </label>
                              <span className="text-[0.65rem] font-mono font-bold text-primary">
                                {createdSections.length > 0
                                  ? `${createdSections.length} Created Section${createdSections.length > 1 ? "s" : ""}`
                                  : "No Sections Created"}
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
                                      {sec.max_capacity ? ` · Cap: ${sec.max_capacity}` : ""}
                                    </option>
                                  );
                                })
                              ) : (
                                <option value="A">Section A (Default - No Created Batches)</option>
                              )}
                            </select>
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
                      {authMode === "admin" ? "Admin Email Address" : "College Email Address"}
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

                  {/* Simple Role Switch Helper */}
                  {authMode === "login" && (
                    <div className="flex items-center gap-2 rounded-2xl bg-muted/60 border border-border/80 p-3 text-xs text-muted-foreground">
                      <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                      <div className="leading-snug">
                        <span>Teacher Or College Staff? </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("admin");
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
                        <span>Student Looking For Study Notes? </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setEmail("");
                            setPassword("");
                          }}
                          className="font-bold text-emerald-600 underline hover:text-emerald-700 cursor-pointer"
                        >
                          Click Here For Student Sign In
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
                          {authMode === "register" && "Create Free Student Account"}
                          {authMode === "login" && "Log In to Study"}
                          {authMode === "admin" && "Sign In as Admin"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Offerings, Pricing & Protection */}
              <div className="lg:col-span-5 min-w-0 flex flex-col justify-between space-y-4">
                {/* 1. What You Get Card */}
                <div className="rounded-3xl border border-border/80 bg-surface/80 p-5 sm:p-6 min-w-0 space-y-4 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/80 pb-3">
                      <span className="font-bold text-sm text-foreground">
                        {authMode === "admin" ? "Admin Management Tools" : "Everything You Need for Exams"}
                      </span>
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>

                    <div className="space-y-3 text-xs mt-3.5">
                      {authMode === "admin" ? (
                        <>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <Building2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Organize Departments, Courses &amp; Student Sections
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <FileText className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Upload Handwritten Notes &amp; Solved Exam Papers
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <FlaskConical className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Publish Lab Experiment Codes &amp; Viva Questions
                            </span>
                          </div>
                          <div className="flex items-start gap-2.5 text-muted-foreground">
                            <Megaphone className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span className="leading-snug text-foreground/90 font-medium">
                              Post College Circulars &amp; Class Timetables
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-foreground block">Chapter-Wise Handwritten Notes</span>
                              <span className="text-[0.7rem] text-muted-foreground">Formulas, Diagrams, And Easy Derivations Matched To Your Syllabus.</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <FileCheck2 className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-foreground block">Solved Past Exam Papers</span>
                              <span className="text-[0.7rem] text-muted-foreground">Step-By-Step Solved Mid-Sem And End-Sem Question Papers.</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <FlaskConical className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-foreground block">Lab Manuals &amp; Viva Questions</span>
                              <span className="text-[0.7rem] text-muted-foreground">Ready-To-Run Practical Code And Top Viva Questions Asked By Teachers.</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-bold text-foreground block">Class Schedule &amp; College Notices</span>
                              <span className="text-[0.7rem] text-muted-foreground">Daily Class Timetables, Exam Date Sheets, And Urgent Circulars.</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Transparent Student Pricing Tiers Card (Only On New Student Registration) */}
                {authMode === "register" && (
                  <div className="rounded-3xl border border-primary/30 bg-card p-4 sm:p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                      <span className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-primary" />
                        <span>Simple Student Plans</span>
                      </span>
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Pocket Friendly
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      {/* Free Tier */}
                      <div className="rounded-2xl border border-border/80 bg-surface/60 p-2.5 flex flex-col justify-between">
                        <div>
                          <span className="block text-[0.65rem] font-bold text-muted-foreground uppercase">Free Plan</span>
                          <span className="text-sm font-extrabold text-foreground mt-0.5 block">₹0</span>
                        </div>
                        <span className="text-[0.62rem] text-muted-foreground leading-tight mt-1.5 block">
                          Unit 1 Notes &amp; Timetable
                        </span>
                      </div>

                      {/* Semester Pass */}
                      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-2.5 flex flex-col justify-between relative shadow-xs">
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[0.55rem] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                          Popular
                        </span>
                        <div>
                          <span className="block text-[0.65rem] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Semester Pass</span>
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                            ₹499<span className="text-[0.6rem] font-normal text-muted-foreground">/sem</span>
                          </span>
                        </div>
                        <span className="text-[0.62rem] text-emerald-800 dark:text-emerald-200 leading-tight mt-1.5 block">
                          All 5 Units + Solved Papers
                        </span>
                      </div>

                      {/* VIP Plan */}
                      <div className="rounded-2xl border border-border/80 bg-surface/60 p-2.5 flex flex-col justify-between">
                        <div>
                          <span className="block text-[0.65rem] font-bold text-muted-foreground uppercase">VIP All-Access</span>
                          <span className="text-sm font-extrabold text-foreground mt-0.5 block">
                            ₹899<span className="text-[0.6rem] font-normal text-muted-foreground">/sem</span>
                          </span>
                        </div>
                        <span className="text-[0.62rem] text-muted-foreground leading-tight mt-1.5 block">
                          Downloadable + 1-on-1 Help
                        </span>
                      </div>
                    </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
