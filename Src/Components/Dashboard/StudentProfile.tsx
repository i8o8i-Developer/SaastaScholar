import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  FlaskConical,
  Folder,
  FolderOpen,
  GraduationCap,
  Image as ImageIcon,
  Key,
  Layers,
  LibraryBig,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Phone,
  Radio,
  RefreshCw,
  Save,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { useAuth } from "@/Hooks/UseAuth";
import {
  apiFetch,
  toTitleCase,
  Department,
  ProgramSpecialization,
  SectionBatch,
  Subject,
  AcademicMaterial,
} from "@/Lib/Api";
import { toast } from "sonner";
import { cn } from "@/Lib/Utils";
import { isDrmGloballyDisabled, setDrmGloballyDisabled } from "@/Hooks/UseDrmProtection";

interface StudentProfileProps {
  onNavigateTab?: (tab: string) => void;
  onOpenReader?: (materialId: string) => void;
}

export function StudentProfile({ onNavigateTab, onOpenReader }: StudentProfileProps = {}) {
  const { user, updateProfile, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Folder Explorer Navigation States
  const [activeProfileFolder, setActiveProfileFolder] = useState<
    "all" | "cohort" | "preferences" | "subjects" | "security"
  >("all");
  const [selectedSubjectFolder, setSelectedSubjectFolder] = useState<Subject | null>(null);

  const [isDrmDisabled, setIsDrmDisabled] = useState<boolean>(isDrmGloballyDisabled);

  useEffect(() => {
    const handleDrmChange = (e: any) => {
      const disabled = e.detail?.disabled ?? isDrmGloballyDisabled();
      setIsDrmDisabled(disabled);
    };
    window.addEventListener("drm-setting-changed", handleDrmChange);
    window.addEventListener("storage", handleDrmChange);
    return () => {
      window.removeEventListener("drm-setting-changed", handleDrmChange);
      window.removeEventListener("storage", handleDrmChange);
    };
  }, []);

  const [fullName, setFullName] = useState<string>(user?.full_name || "");
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phone_number || "");
  const [targetCgpa, setTargetCgpa] = useState<number>(user?.target_cgpa ? Number(user.target_cgpa) : 9.5);
  const [bio, setBio] = useState<string>(user?.bio || "");
  const [academicFocus, setAcademicFocus] = useState<string>(user?.academic_focus || "");
  const [careerGoal, setCareerGoal] = useState<string>(user?.career_goal || "");
  const [department, setDepartment] = useState<string>(user?.department || "");
  const [program, setProgram] = useState<string>(user?.program || "");
  const [semester, setSemester] = useState<number>(user?.semester || 1);
  const [section, setSection] = useState<string>(user?.section || "A");

  const [departmentsList, setDepartmentsList] = useState<Department[]>([]);
  const [programsList, setProgramsList] = useState<ProgramSpecialization[]>([]);
  const [sectionsList, setSectionsList] = useState<SectionBatch[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [materialsList, setMaterialsList] = useState<AcademicMaterial[]>([]);

  const [isEditingAcademicRecord, setIsEditingAcademicRecord] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savingAcademic, setSavingAcademic] = useState<boolean>(false);

  useEffect(() => {
    async function loadAcademicCatalogue() {
      try {
        const [deptsRes, progsRes, secsRes, subsRes, matsRes] = await Promise.allSettled([
          apiFetch<Department[]>("/academic/departments/"),
          apiFetch<ProgramSpecialization[]>("/academic/programs/"),
          apiFetch<SectionBatch[]>("/academic/sections/"),
          apiFetch<Subject[]>("/academic/subjects/"),
          apiFetch<AcademicMaterial[]>("/academic/materials/"),
        ]);
        if (deptsRes.status === "fulfilled") {
          const d = deptsRes.value;
          setDepartmentsList(Array.isArray(d) ? d : ((d as any)?.results || []));
        }
        if (progsRes.status === "fulfilled") {
          const p = progsRes.value;
          setProgramsList(Array.isArray(p) ? p : ((p as any)?.results || []));
        }
        if (secsRes.status === "fulfilled") {
          const s = secsRes.value;
          setSectionsList(Array.isArray(s) ? s : ((s as any)?.results || []));
        }
        if (subsRes.status === "fulfilled") {
          const sb = subsRes.value;
          setSubjectsList(Array.isArray(sb) ? sb : ((sb as any)?.results || []));
        }
        if (matsRes.status === "fulfilled") {
          const m = matsRes.value;
          setMaterialsList(Array.isArray(m) ? m : ((m as any)?.results || []));
        }
      } catch (err) {
        // Handled gracefully
      }
    }
    loadAcademicCatalogue();
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhoneNumber(user.phone_number || "");
      setTargetCgpa(user.target_cgpa ? Number(user.target_cgpa) : 9.5);
      setBio(user.bio || "");
      setAcademicFocus(user.academic_focus || "");
      setCareerGoal(user.career_goal || "");
      setDepartment(user.department || "");
      setProgram(user.program || "");
      setSemester(user.semester || 1);
      setSection(user.section || "A");
    }
  }, [user]);

  // 
  const enrolledSemester = Number(semester || user?.semester || 1);
  const enrolledSubjects = subjectsList.filter((s) => {
    if (!s.semester) return true;
    return Number(s.semester) === enrolledSemester;
  });

  const handleSaveAcademicRecord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingAcademic(true);
    try {
      const cleanSection = (section && section.trim()) ? section.trim().toUpperCase() : "A";
      const cleanDept = (department || user?.department || "").trim();
      const cleanProg = (program || user?.program || "").trim();
      const cleanSem = Number(semester) || 1;

      const ok = await updateProfile({
        department: cleanDept,
        program: cleanProg,
        semester: cleanSem,
        section: cleanSection,
      });

      if (ok) {
        setIsEditingAcademicRecord(false);
        toast.success(`Academic record updated to ${cleanProg} · Sem ${cleanSem} · Sec ${cleanSection}!`);
      }
    } catch (err: any) {
      toast.error(toTitleCase(err.message || "Failed To Update Academic Cohort Record."));
    } finally {
      setSavingAcademic(false);
    }
  };

  const handleToggleDrm = () => {
    const nextState = !isDrmDisabled;
    setIsDrmDisabled(nextState);
    setDrmGloballyDisabled(nextState);
    if (nextState) {
      toast.warning("Master DRM Protection Completely Stopped & Disabled.");
    } else {
      toast.success("Master DRM Protection Actively Enabled & Enforced.");
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar Image Must Be Under 5MB.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const token = localStorage.getItem("nimswallah_access_token");
      const res = await fetch("/api/auth/profile/avatar/", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.avatar_url && user) {
          user.avatar_url = data.avatar_url;
        }
        toast.success("Profile Avatar Uploaded Successfully.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(toTitleCase(err.error || "Failed To Upload Avatar."));
      }
    } catch (err: any) {
      toast.error("Network Error While Uploading Profile Photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone_number: phoneNumber,
        bio: bio,
        academic_focus: academicFocus,
        career_goal: careerGoal,
        department: department,
        program: program,
        semester: Number(semester),
        section: section.toUpperCase(),
        target_cgpa: String(targetCgpa),
      });
      setIsEditingAcademicRecord(false);
      toast.success("Academic Profile Details Updated Successfully.");
    } catch (err: any) {
      toast.error(toTitleCase(err.message || "Failed To Update Profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto min-w-0">
      {/* Hidden File Input for Real Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/png, image/jpeg, image/webp, image/jpg"
        className="hidden"
      />

      {/* ================= Header Banner ================= */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-emerald-500/10 via-surface to-teal-500/10 p-4 sm:p-7 backdrop-blur-md shadow-xs min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-5 min-w-0 flex-1">
            {/* Clickable Profile Avatar with Real Upload */}
            <div
              className="relative group cursor-pointer shrink-0 self-start sm:self-center"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile photo"
            >
              <div className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-2xl sm:rounded-3xl text-white font-bold text-xl sm:text-2xl shadow-lg transition-transform group-hover:scale-105 bg-gradient-to-tr from-emerald-600 to-teal-500 overflow-hidden border border-border/60">
                {uploadingAvatar ? (
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                ) : user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                {!uploadingAvatar && !user?.avatar_url && (
                  <span className="font-bold">{(user?.full_name || "A").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute inset-0 grid place-items-center rounded-2xl sm:rounded-3xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full bg-primary text-primary-foreground border-2 border-card text-[0.6rem] shadow-xs">
                <Upload className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </span>
            </div>

            <div className="min-w-0 space-y-1 w-full flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-base sm:text-2xl font-bold text-foreground break-words">
                  {user?.full_name || "Student Scholar"}
                </h1>
                <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[0.62rem] sm:text-xs font-bold uppercase tracking-wider border border-emerald-500/20 whitespace-nowrap shrink-0">
                  {user?.access_tier?.replace("_", " ") || "FREE STARTER"}
                </span>
              </div>
              <p className="text-[0.72rem] sm:text-xs md:text-sm text-muted-foreground break-all sm:break-normal">
                {user?.email} · <span className="font-mono font-bold text-foreground">ID: {user?.roll_number || "STU01"}</span>
              </p>
              <p className="text-[0.72rem] sm:text-xs text-foreground/85 font-medium leading-relaxed break-words">
                {user?.bio || "No Academic Statement Set Yet. Add Your Study Focus And Research Goals In Personal Preferences."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-border bg-card px-3 sm:px-4 py-2 text-xs font-bold text-foreground hover:bg-surface hover:border-primary/50 active:scale-95 transition-all cursor-pointer shadow-2xs truncate"
            >
              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 text-primary shrink-0" />}
              <span>{uploadingAvatar ? "Uploading..." : "Change Avatar"}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 sm:px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer shadow-2xs truncate"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= FOLDER EXPLORER CONTROLS & BREADCRUMBS ================= */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl bg-surface/80 border border-border/80 shadow-2xs">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto no-scrollbar scroll-smooth">
            <button
              type="button"
              onClick={() => {
                setActiveProfileFolder("all");
                setSelectedSubjectFolder(null);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-card border border-border/60 text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-colors"
            >
              <FolderOpen className="h-3.5 w-3.5 text-primary" />
              <span>Profile Explorer</span>
            </button>

            {activeProfileFolder !== "all" && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                <button
                  type="button"
                  onClick={() => setSelectedSubjectFolder(null)}
                  className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary font-bold border border-primary/20 shrink-0 cursor-pointer"
                >
                  {activeProfileFolder === "cohort" && "Institutional Cohort"}
                  {activeProfileFolder === "preferences" && "Personal Preferences"}
                  {activeProfileFolder === "subjects" && "Enrolled Subjects"}
                  {activeProfileFolder === "security" && "DRM Security"}
                </button>
              </>
            )}

            {selectedSubjectFolder && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                <span className="px-2.5 py-1 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold border border-violet-500/20 shrink-0">
                  {selectedSubjectFolder.code}
                </span>
              </>
            )}
          </div>

          {/* Quick Segmented Folder Navigation Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveProfileFolder("all");
                setSelectedSubjectFolder(null);
              }}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0",
                activeProfileFolder === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <Folder className="h-3.5 w-3.5" />
              <span>All Folders</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveProfileFolder("cohort");
                setSelectedSubjectFolder(null);
              }}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0",
                activeProfileFolder === "cohort"
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Cohort</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveProfileFolder("preferences");
                setSelectedSubjectFolder(null);
              }}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0",
                activeProfileFolder === "preferences"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span>Preferences</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveProfileFolder("subjects");
                setSelectedSubjectFolder(null);
              }}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0",
                activeProfileFolder === "subjects"
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <LibraryBig className="h-3.5 w-3.5" />
              <span>Subject Folders ({enrolledSubjects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveProfileFolder("security");
                setSelectedSubjectFolder(null);
              }}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0",
                activeProfileFolder === "security"
                  ? "bg-gradient-to-r from-amber-600 to-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Security</span>
            </button>
          </div>
        </div>

        {/* ================= VIEW 1: ALL FOLDERS OVERVIEW GRID ================= */}
        {activeProfileFolder === "all" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                Academic Identity &amp; Courseware Directory (4 Root Folders)
              </span>
              <span className="text-xs font-mono text-primary font-bold">
                Cohort {user?.program ? user.program : "B.Tech"} · Sem {enrolledSemester}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {/* Folder 1: Institutional Cohort */}
              <div
                onClick={() => setActiveProfileFolder("cohort")}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-cyan-500/5 p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-lg cursor-pointer min-w-0"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-2xs group-hover:scale-105 transition-transform">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[0.68rem] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                          Academic Cohort Folder
                        </span>
                        <h4 className="font-display text-base font-bold text-foreground truncate">
                          {user?.program || "Registered Degree Program"}
                        </h4>
                      </div>
                    </div>
                    <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[0.68rem] font-mono font-bold text-cyan-700 dark:text-cyan-300 shrink-0">
                      Sem {enrolledSemester} · Sec {user?.section || "A"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Official Department Architecture, Specialization Program, Section Cohort Enrollment &amp; Verification ID.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.68rem] font-mono text-muted-foreground">
                      🏢 {user?.department || "Department"}
                    </span>
                    <span className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.68rem] font-mono text-muted-foreground">
                      🎓 Roll: {user?.roll_number || "STU01"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[0.7rem]">{user?.university || "NIMS University"}</span>
                  <div className="inline-flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform text-xs">
                    <span>Open Cohort Folder</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              {/* Folder 2: Personal Preferences */}
              <div
                onClick={() => setActiveProfileFolder("preferences")}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/5 p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg cursor-pointer min-w-0"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs group-hover:scale-105 transition-transform">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[0.68rem] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Student Preferences Folder
                        </span>
                        <h4 className="font-display text-base font-bold text-foreground truncate">
                          {user?.full_name || "Student Scholar"}
                        </h4>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[0.68rem] font-mono font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                      Goal: {targetCgpa.toFixed(2)} CGPA
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Personalized Research Statement, Elective Focus Area, Career Trajectory Track &amp; Target CGPA Goal.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.68rem] font-mono text-muted-foreground">
                      🎯 {careerGoal || "Industry MNCs Track"}
                    </span>
                    <span className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.68rem] font-mono text-muted-foreground">
                      📞 {user?.phone_number || "Contact Set"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[0.7rem]">{user?.email}</span>
                  <div className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform text-xs">
                    <span>Open Preferences Folder</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              {/* Folder 3: Enrolled Courseware & Subject Folders */}
              <div
                onClick={() => setActiveProfileFolder("subjects")}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-violet-500/5 p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg cursor-pointer min-w-0"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-2xs group-hover:scale-105 transition-transform">
                        <LibraryBig className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[0.68rem] font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                          Courseware Curriculum Folders
                        </span>
                        <h4 className="font-display text-base font-bold text-foreground truncate">
                          Semester {enrolledSemester} Subject Repositories
                        </h4>
                      </div>
                    </div>
                    <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[0.68rem] font-mono font-bold text-violet-700 dark:text-violet-300 shrink-0">
                      {enrolledSubjects.length} Subject Folders
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Interactive Directory of Course Subjects With One-Click Access To Unit Notes, Solved PYQs &amp; Lab Manuals.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {enrolledSubjects.slice(0, 3).map((s) => (
                      <span key={s.code} className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.68rem] font-mono font-bold text-foreground">
                        📁 {s.code}
                      </span>
                    ))}
                    {enrolledSubjects.length > 3 && (
                      <span className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.68rem] font-mono text-muted-foreground">
                        +{enrolledSubjects.length - 3} More
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[0.7rem]">{materialsList.length} Total Course Documents</span>
                  <div className="inline-flex items-center gap-1 font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform text-xs">
                    <span>Browse Subject Folders</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              {/* Folder 4: DRM Security & Standing */}
              <div
                onClick={() => setActiveProfileFolder("security")}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-amber-500/5 p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-lg cursor-pointer min-w-0"
              >
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs group-hover:scale-105 transition-transform">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[0.68rem] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Forensic Security Folder
                        </span>
                        <h4 className="font-display text-base font-bold text-foreground truncate">
                          DRM Governance &amp; Standing
                        </h4>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[0.68rem] font-mono font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                      Authorized Scholar
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Anti-Capture Screen Blurring, Forensic Watermarking Telemetry &amp; System Authorization Standing.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.68rem] font-mono text-muted-foreground">
                      🛡️ DRM: {isDrmDisabled ? "Disabled" : "Active & Enforced"}
                    </span>
                    <span className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.68rem] font-mono text-muted-foreground">
                      🔒 Zero Policy Violations
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[0.7rem]">Protected Real-Time Sandbox</span>
                  <div className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform text-xs">
                    <span>Open Security Folder</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: COHORT FOLDER ================= */}
        {activeProfileFolder === "cohort" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <h2 className="font-display font-bold text-lg text-foreground">
                  Institutional Academic Cohort Folder
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveProfileFolder("all")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return To All Folders</span>
              </button>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-bold text-base text-foreground">
                    Institutional Cohort Credentials
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAcademicRecord(!isEditingAcademicRecord)}
                    className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 text-xs font-bold transition-all cursor-pointer"
                  >
                    {isEditingAcademicRecord ? "Close Edit" : "Change Section / Cohort"}
                  </button>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[0.65rem] font-bold border border-emerald-500/20">
                    Verified Student
                  </span>
                </div>
              </div>

              {isEditingAcademicRecord ? (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/30 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span>Update Academic Cohort &amp; Section</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingAcademicRecord(false)}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Department Dropdown */}
                  <div>
                    <label className="block text-[0.68rem] font-bold text-muted-foreground mb-1">Academic Department</label>
                    <select
                      value={department}
                      onChange={(e) => {
                        const newDept = e.target.value;
                        setDepartment(newDept);
                        const matching = programsList.filter(
                          (p) => p.department === newDept || p.department_name === newDept
                        );
                        if (matching.length > 0 && matching[0]) {
                          setProgram(matching[0].name);
                        }
                      }}
                      className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-bold focus:border-primary focus:outline-none"
                    >
                      <option value="">Select Academic Department...</option>
                      {departmentsList.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Degree Program Dropdown */}
                  <div>
                    <label className="block text-[0.68rem] font-bold text-muted-foreground mb-1">Degree Program / Specialization</label>
                    <select
                      value={program}
                      onChange={(e) => {
                        const newProg = e.target.value;
                        setProgram(newProg);
                        const pObj = programsList.find((p) => p.name === newProg || p.code === newProg);
                        if (pObj && pObj.department_name) {
                          setDepartment(pObj.department_name);
                        }
                      }}
                      className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-bold focus:border-primary focus:outline-none"
                    >
                      <option value="">Select Degree Specialization...</option>
                      {programsList
                        .filter((p) => !department || p.department === department || p.department_name === department)
                        .map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Dynamic Section & Semester Selector */}
                  {(() => {
                    const selectedProgObj = programsList.find(
                      (p) => p.name === program || p.code === program || p.id === program
                    );
                    const createdSections = sectionsList.filter((s) => {
                      const semMatch = Number(s.semester) === Number(semester);
                      if (!selectedProgObj) return semMatch;
                      return (
                        semMatch &&
                        (s.program === selectedProgObj.id ||
                          s.program_name === selectedProgObj.name ||
                          s.program_code === selectedProgObj.code)
                      );
                    });

                    const isCurrentInCreated = createdSections.some(
                      (sec) => (sec.section || sec.section_name || "").trim().toUpperCase() === section.trim().toUpperCase()
                    );

                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Semester */}
                          <div>
                            <label className="block text-[0.68rem] font-bold text-muted-foreground mb-1">Enrolled Semester</label>
                            <select
                              value={semester}
                              onChange={(e) => {
                                const newSem = Number(e.target.value);
                                setSemester(newSem);
                              }}
                              className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-bold focus:border-primary focus:outline-none"
                            >
                              {Array.from({ length: selectedProgObj?.total_semesters || 8 }, (_, i) => i + 1).map((sem) => (
                                <option key={sem} value={sem}>
                                  Semester {sem}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Listed Sections Selector */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[0.68rem] font-bold text-muted-foreground">Cohort Section</label>
                              <span className="text-[0.62rem] font-mono font-bold text-primary">
                                {createdSections.length > 0
                                  ? `${createdSections.length} Created Section${createdSections.length > 1 ? "s" : ""}`
                                  : "Default Cohort"}
                              </span>
                            </div>

                            <select
                              value={section}
                              onChange={(e) => setSection(e.target.value)}
                              className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                            >
                              {createdSections.length > 0 ? (
                                <>
                                  {createdSections.map((sec) => {
                                    const secVal = (sec.section || sec.section_name || "A").trim().toUpperCase();
                                    return (
                                      <option key={sec.id || secVal} value={secVal}>
                                        Section {secVal}
                                        {sec.batch_code ? ` (${sec.batch_code})` : ""}
                                        {sec.max_capacity ? ` · Cap: ${sec.max_capacity}` : ""}
                                      </option>
                                    );
                                  })}
                                  {!isCurrentInCreated && section && (
                                    <option value={section.trim().toUpperCase()}>
                                      Section {section.trim().toUpperCase()} (Current Saved)
                                    </option>
                                  )}
                                </>
                              ) : (
                                <option value={section || "A"}>
                                  {section ? `Section ${section}` : "Section A"}
                                </option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={handleSaveAcademicRecord}
                      disabled={savingAcademic}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary-deep cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {savingAcademic ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      <span>{savingAcademic ? "Updating Cohort..." : "Apply Cohort & Section Changes"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAcademicRecord(false)}
                      className="h-9 px-3.5 rounded-xl border border-border bg-surface text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-surface/60 border border-border/60 space-y-1">
                    <span className="text-muted-foreground font-medium text-[0.7rem] uppercase tracking-wider font-mono">University Campus</span>
                    <p className="font-bold text-foreground text-sm">{user?.university || "NIMS University, Rajasthan"}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface/60 border border-border/60 space-y-1">
                    <span className="text-muted-foreground font-medium text-[0.7rem] uppercase tracking-wider font-mono">Department</span>
                    <p className="font-bold text-foreground text-sm">{user?.department || "Registered Department"}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface/60 border border-border/60 space-y-1">
                    <span className="text-muted-foreground font-medium text-[0.7rem] uppercase tracking-wider font-mono">Degree Program</span>
                    <p className="font-bold text-foreground text-sm">{user?.program || "Registered Program"}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface/60 border border-border/60 space-y-1">
                    <span className="text-muted-foreground font-medium text-[0.7rem] uppercase tracking-wider font-mono">Semester &amp; Section Cohort</span>
                    <p className="font-bold text-foreground text-sm font-mono">Semester {enrolledSemester} · Section {user?.section || "A"}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface/60 border border-border/60 space-y-1">
                    <span className="text-muted-foreground font-medium text-[0.7rem] uppercase tracking-wider font-mono">Student Scholar ID</span>
                    <p className="font-mono font-bold text-foreground text-sm">{user?.roll_number || "STU01"}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface/60 border border-border/60 space-y-1">
                    <span className="text-muted-foreground font-medium text-[0.7rem] uppercase tracking-wider font-mono">Official Enrollment Number</span>
                    <p className="font-mono font-bold text-foreground text-sm">{user?.enrollment_no || "NIMS-ENR-2026"} <span className="text-[0.65rem] text-emerald-600 font-bold">✓ Verified</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW 3: PREFERENCES FOLDER ================= */}
        {activeProfileFolder === "preferences" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-display font-bold text-lg text-foreground">
                  Personal Preferences &amp; Career Goals Folder
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveProfileFolder("all")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return To All Folders</span>
              </button>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Full Student Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter Full Student Name..."
                      required
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="E.g. +91 98765 43210"
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Academic Statement / Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share Your Academic Interests, Focus Areas, Or Study Objectives..."
                    rows={3}
                    className="w-full rounded-2xl border border-border bg-background p-3 text-xs focus:border-primary focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Primary Academic Focus / Elective Area
                    </label>
                    <input
                      type="text"
                      value={academicFocus}
                      onChange={(e) => setAcademicFocus(e.target.value)}
                      placeholder="E.g. Artificial Intelligence, Data Science, Cyber Security, FinTech..."
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Career Goal &amp; Target Track
                    </label>
                    <select
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                      className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none font-medium"
                    >
                      <option value="">Select Target Track (Optional)...</option>
                      <option value="Corporate Industry & Top MNCs">Corporate Industry &amp; Top MNCs</option>
                      <option value="Higher Studies & Research (MS / M.Tech / MBA / MD)">Higher Studies &amp; Research (MS / M.Tech / MBA / MD)</option>
                      <option value="Government & Competitive Exams (UPSC / GATE / NET / PSU)">Government &amp; Competitive Exams (UPSC / GATE / NET / PSU)</option>
                      <option value="Healthcare & Clinical Hospital Practice">Healthcare &amp; Clinical Hospital Practice</option>
                      <option value="Judicial / Legal Services & Corporate Counsel">Judicial / Legal Services &amp; Corporate Counsel</option>
                      <option value="Entrepreneurship & Startup Incubation">Entrepreneurship &amp; Startup Incubation</option>
                      <option value="Core Sector / Research & Development">Core Sector / Research &amp; Development</option>
                      <option value="Open / Exploring Opportunities">Open / Exploring Opportunities</option>
                    </select>
                  </div>
                </div>

                {/* Target CGPA Goal Range Slider */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">Target Semester CGPA Goal</span>
                    <span className="font-mono font-bold text-primary">{targetCgpa.toFixed(2)} / 10.00</span>
                  </div>
                  <input
                    type="range"
                    min="7.0"
                    max="10.0"
                    step="0.05"
                    value={targetCgpa}
                    onChange={(e) => setTargetCgpa(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[0.65rem] font-mono text-muted-foreground">
                    <span>7.0 (First Class)</span>
                    <span>8.5 (Distinction)</span>
                    <span>10.0 (Gold Medalist)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Save Student Profile Details</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: ENROLLED SUBJECT FOLDERS ================= */}
        {activeProfileFolder === "subjects" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <LibraryBig className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h2 className="font-display font-bold text-lg text-foreground">
                  {selectedSubjectFolder
                    ? `${selectedSubjectFolder.code}: ${selectedSubjectFolder.name} Folder`
                    : `Enrolled Courseware Subject Folders (Semester ${enrolledSemester})`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedSubjectFolder) {
                    setSelectedSubjectFolder(null);
                  } else {
                    setActiveProfileFolder("all");
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{selectedSubjectFolder ? "All Subject Folders" : "Return To All Folders"}</span>
              </button>
            </div>

            {/* List of Subject Folders */}
            {!selectedSubjectFolder ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {enrolledSubjects.map((sub) => {
                    const subMaterials = materialsList.filter((m) => m.subject_code === sub.code || m.subject === sub.id);
                    return (
                      <div
                        key={sub.code}
                        onClick={() => setSelectedSubjectFolder(sub)}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg cursor-pointer min-w-0"
                      >
                        <div className="space-y-3 min-w-0">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-2xs group-hover:scale-105 transition-transform">
                                <Folder className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[0.68rem] font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                                  {sub.code} · Subject Folder
                                </span>
                                <h4 className="font-display text-sm font-bold text-foreground truncate">
                                  {sub.name}
                                </h4>
                              </div>
                            </div>
                            <span className="rounded-full bg-surface border border-border/80 px-2 py-0.5 text-[0.65rem] font-mono font-bold text-foreground shrink-0">
                              {subMaterials.length} Docs
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                            {sub.syllabus_summary || `Official Course Curriculum & Verified Handwritten Notes Repository For ${sub.name}.`}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-mono text-[0.7rem]">{sub.credits ? `${sub.credits} Credits` : "Core Course"}</span>
                          <div className="inline-flex items-center gap-1 font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform text-xs">
                            <span>Open Subject Folder</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Inside Selected Subject Folder: Show Documents */
              <div className="space-y-4">
                <div className="rounded-2xl bg-surface/60 border border-border/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      {selectedSubjectFolder.name} ({selectedSubjectFolder.code})
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Showing All Verified DRM Study Documents &amp; Question Papers In This Subject Folder.
                    </p>
                  </div>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab("notes")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary-deep cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Open Notes Hub</span>
                    </button>
                  )}
                </div>

                {/* Materials in this subject */}
                {(() => {
                  const subMaterials = materialsList.filter(
                    (m) => m.subject_code === selectedSubjectFolder.code || m.subject === selectedSubjectFolder.id
                  );
                  if (subMaterials.length === 0) {
                    return (
                      <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center space-y-3">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
                        <h4 className="font-bold text-sm text-foreground">No Published Documents In This Subject Folder Yet</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          New handwritten unit notes, solved university PYQs, and lab manuals will be synchronized here when published by faculty.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {subMaterials.map((mat) => (
                        <div
                          key={mat.id}
                          className="rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/30 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-violet-500/50 hover:shadow-md transition-all"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                              <span className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                                {mat.material_type || "NOTES"} {mat.unit_number ? `· Unit ${mat.unit_number}` : ""}
                              </span>
                              {mat.file && (
                                <span className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[0.68rem] font-bold font-mono text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  <span>PDF</span>
                                </span>
                              )}
                            </div>
                            <h4 className="font-display text-sm font-bold text-foreground leading-snug">{mat.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{mat.summary || "Faculty verified study guide & notes."}</p>
                          </div>

                          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                            <span className="font-mono text-[0.7rem] text-muted-foreground">{mat.page_count || 1} Pages</span>
                            {onOpenReader && (
                              <button
                                type="button"
                                onClick={() => onOpenReader(mat.id)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                              >
                                <span>Preview Document</span>
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 5: SECURITY FOLDER ================= */}
        {activeProfileFolder === "security" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="font-display font-bold text-lg text-foreground">
                  Academic Security &amp; DRM Governance Folder
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveProfileFolder("all")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return To All Folders</span>
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {/* Account Security Standing Box */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>Academic Security Standing</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    VERIFIED SCHOLAR
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your Academic Account Is In Good Standing. All Courseware Access, Exam Question Banks, And Unit Manuscripts Are Authorized For Semester {enrolledSemester}.
                </p>

                <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface">
                    <span className="text-muted-foreground">Violations Recorded:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">0 (Clean Record)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface">
                    <span className="text-muted-foreground">Active Session Watermark:</span>
                    <span className="font-mono font-bold text-foreground truncate max-w-[200px]">
                      {user?.roll_number || "24BCSE102"} · {user?.full_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface">
                    <span className="text-muted-foreground">DRM Protection Status:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {isDrmDisabled ? "Temporarily Paused" : "Active & Enforced"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Master DRM Protection Setting Box */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      <h3 className="font-display font-bold text-base text-foreground">
                        Master DRM Sandbox Engine
                      </h3>
                    </div>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border font-mono",
                      isDrmDisabled
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    )}>
                      {isDrmDisabled ? "DRM OFF" : "DRM ARMED"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Toggles the forensic background watermark overlay, tab-switch blur guard, and copy-prevention sandbox for testing or unrestricted presentation.
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleToggleDrm}
                    className={cn(
                      "h-11 w-full rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98",
                      isDrmDisabled
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{isDrmDisabled ? "Re-Enable Master DRM Protection" : "Temporarily Disable Master DRM Sandbox"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
