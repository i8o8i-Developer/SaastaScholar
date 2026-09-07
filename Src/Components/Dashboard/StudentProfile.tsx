import React, { useEffect, useRef, useState } from "react";
import {
  Award,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  Code2,
  GraduationCap,
  Image as ImageIcon,
  Key,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  User,
  Zap,
} from "lucide-react";
import { useAuth } from "@/Hooks/UseAuth";
import { apiFetch, toTitleCase, Department, ProgramSpecialization, SectionBatch } from "@/Lib/Api";
import { toast } from "sonner";
import { cn } from "@/Lib/Utils";

import { isDrmGloballyDisabled, setDrmGloballyDisabled } from "@/Hooks/UseDrmProtection";

export function StudentProfile() {
  const { user, updateProfile, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  const [isEditingAcademicRecord, setIsEditingAcademicRecord] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savingAcademic, setSavingAcademic] = useState<boolean>(false);

  useEffect(() => {
    async function loadAcademicCatalogue() {
      try {
        const [deptsRes, progsRes, secsRes] = await Promise.allSettled([
          apiFetch<Department[]>("/academic/departments/"),
          apiFetch<ProgramSpecialization[]>("/academic/programs/"),
          apiFetch<SectionBatch[]>("/academic/sections/"),
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

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar Image Must Be Under 5MB.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const token = localStorage.getItem("nimswallah_access_token");
      const res = await fetch("/api/auth/avatar/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload avatar image.");
      }

      const data = await res.json();
      if (data.avatar_url) {
        await updateProfile({ avatar_url: data.avatar_url });
        toast.success("Profile Avatar Photo Uploaded & Synced Successfully!");
      }
    } catch (err: any) {
      toast.error(toTitleCase(err.message || "Failed To Upload Avatar Photo."));
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

      {/* ================= Symmetrical 2-Column Grid ================= */}
      <div className="grid gap-6 lg:grid-cols-12 min-w-0 items-stretch">
        {/* Left Column: Institutional Record Card (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold text-base text-foreground">
                  Institutional Academic Record
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAcademicRecord(!isEditingAcademicRecord)}
                  className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-0.5 text-[0.68rem] font-bold transition-all cursor-pointer"
                >
                  {isEditingAcademicRecord ? "Close Edit" : "Edit Details"}
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
                        (p) => p.department_name === newDept || p.department === newDept || p.department === departmentsList.find((d) => d.name === newDept)?.id
                      );
                      if (matching.length > 0 && matching[0]?.name) {
                        const newProg = matching[0];
                        setProgram(newProg.name);
                        const matchingSecs = sectionsList.filter(
                          (s) => (s.program === newProg.id || s.program_name === newProg.name || s.program_code === newProg.code) && Number(s.semester) === Number(semester)
                        );
                        if (matchingSecs.length > 0 && matchingSecs[0]) {
                          setSection((matchingSecs[0]?.section || matchingSecs[0]?.section_name || "A").toUpperCase());
                        }
                      }
                    }}
                    className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                  >
                    {departmentsList.length > 0 ? (
                      departmentsList.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))
                    ) : (
                      <option value={department}>{department || "Department Of Computer Science & Engineering"}</option>
                    )}
                  </select>
                </div>

                {/* Degree Program / Specialization Dropdown */}
                <div>
                  <label className="block text-[0.68rem] font-bold text-muted-foreground mb-1">Degree Program / Specialization</label>
                  <select
                    value={program}
                    onChange={(e) => {
                      const newProgName = e.target.value;
                      setProgram(newProgName);
                      const newProg = programsList.find((p) => p.name === newProgName);
                      const matchingSecs = sectionsList.filter(
                        (s) => (!newProg || s.program === newProg.id || s.program_name === newProg.name || s.program_code === newProg.code) && Number(s.semester) === Number(semester)
                      );
                      if (matchingSecs.length > 0 && matchingSecs[0]) {
                        setSection((matchingSecs[0]?.section || matchingSecs[0]?.section_name || "A").toUpperCase());
                      }
                    }}
                    className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                  >
                    {programsList.length > 0 ? (
                      programsList
                        .filter(
                          (p) =>
                            !department ||
                            p.department_name === department ||
                            p.department === department ||
                            p.department === departmentsList.find((d) => d.name === department)?.id
                        )
                        .map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} ({p.code})
                          </option>
                        ))
                    ) : (
                      <option value={program}>{program || "B.Tech Computer Science & Engineering"}</option>
                    )}
                  </select>
                </div>

                {/* Semester & Listed Sections (Cascading from Department & Program) */}
                {(() => {
                  const selectedProgObj = programsList.find(
                    (p) => p.name === program || p.id === program || p.code === program
                  );
                  const availableSectionsForProfile = sectionsList.filter(
                    (s) =>
                      (!selectedProgObj ||
                        s.program === selectedProgObj.id ||
                        s.program_name === selectedProgObj.name ||
                        s.program_code === selectedProgObj.code) &&
                      Number(s.semester) === Number(semester)
                  );
                  const distinctListedSections = Array.from(
                    new Set(
                      availableSectionsForProfile
                        .map((s) => (s.section || s.section_name || "").trim().toUpperCase())
                        .filter(Boolean)
                    )
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
                              const semSections = sectionsList.filter(
                                (s) =>
                                  (!selectedProgObj ||
                                    s.program === selectedProgObj.id ||
                                    s.program_name === selectedProgObj.name ||
                                    s.program_code === selectedProgObj.code) &&
                                  Number(s.semester) === newSem
                              );
                              if (semSections.length > 0 && semSections[0]) {
                                setSection((semSections[0]?.section || semSections[0]?.section_name || "A").toUpperCase());
                              }
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

                        {/* Listed Sections Selector for this Department -> Program -> Semester */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[0.68rem] font-bold text-muted-foreground">
                              Cohort Section
                            </label>
                            <span className="text-[0.62rem] font-mono font-bold text-primary">
                              {distinctListedSections.length > 0
                                ? `${distinctListedSections.length} Listed Sections`
                                : "Standard Sections"}
                            </span>
                          </div>

                          <select
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            className="h-10 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-semibold focus:border-primary focus:outline-none"
                          >
                            {distinctListedSections.length > 0 ? (
                              <>
                                {availableSectionsForProfile.map((sec) => {
                                  const secVal = (sec.section || sec.section_name || "A").toUpperCase();
                                  return (
                                    <option key={sec.id} value={secVal}>
                                      Section {secVal} {sec.batch_code ? `(${sec.batch_code})` : ""} {sec.max_capacity ? `· Cap: ${sec.max_capacity}` : ""}
                                    </option>
                                  );
                                })}
                                <option value="CUSTOM">Custom / Unlisted Section...</option>
                              </>
                            ) : (
                              <>
                                {["A", "B", "C", "D", "E"].map((secVal) => (
                                  <option key={secVal} value={secVal}>
                                    Section {secVal}
                                  </option>
                                ))}
                                <option value="CUSTOM">Custom / Unlisted Section...</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Custom Section Input if CUSTOM is selected or typed */}
                      {(section === "CUSTOM" || (!distinctListedSections.includes(section) && !["A", "B", "C", "D", "E"].includes(section))) && (
                        <div>
                          <label className="block text-[0.68rem] font-bold text-muted-foreground mb-1">
                            Enter Custom Section Name
                          </label>
                          <input
                            type="text"
                            value={section === "CUSTOM" ? "" : section}
                            onChange={(e) => setSection(e.target.value.toUpperCase())}
                            placeholder="e.g. G, H, Honors, Batch-B"
                            maxLength={10}
                            className="h-10 w-full rounded-xl border border-primary/50 bg-background px-3 text-xs font-mono font-bold uppercase focus:border-primary focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleSaveAcademicRecord}
                    disabled={savingAcademic}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary-deep cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {savingAcademic ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    <span>{savingAcademic ? "Updating Cohort..." : "Apply Academic &amp; Section Changes"}</span>
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
              <div className="space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-2xl bg-surface/60 border border-border/60">
                  <span className="text-muted-foreground font-medium shrink-0">University Campus</span>
                  <span className="font-bold text-foreground sm:text-right">{user?.university || "NIMS University, Rajasthan"}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-2xl bg-surface/60 border border-border/60">
                  <span className="text-muted-foreground font-medium shrink-0">Department</span>
                  <span className="font-bold text-foreground sm:text-right">
                    {user?.department || "Registered Department"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-2xl bg-surface/60 border border-border/60">
                  <span className="text-muted-foreground font-medium shrink-0">Degree Program</span>
                  <span className="font-bold text-foreground sm:text-right">{user?.program || "Registered Program"}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-surface/60 border border-border/60">
                  <span className="text-muted-foreground font-medium shrink-0">Semester &amp; Section</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground font-mono">
                      Semester {user?.semester || 1} · Section {user?.section || "A"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingAcademicRecord(true)}
                      className="inline-flex items-center gap-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-[0.68rem] font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <span>Change Section / Cohort</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-border/60">
                  <span className="text-muted-foreground font-medium shrink-0">Student ID</span>
                  <span className="font-mono font-bold text-foreground">{user?.roll_number || "STU01"}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-border/60">
                  <span className="text-muted-foreground font-medium shrink-0">Official Enrollment ID</span>
                  <span className="font-mono font-bold text-foreground">{user?.enrollment_no || "NIMS-ENR-2026"}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-3">
            {/* Official Academic Security Standing Box */}
            <div className="rounded-2xl border border-border/80 bg-surface/40 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Academic Security Standing</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  VERIFIED SCHOLAR
                </span>
              </div>
              <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
                Your Academic Account Is In Good Standing. All Courseware Access, Exam Question Banks, And Unit Manuscripts Are Authorized For Semester {user?.semester || 1}.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Details (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold text-base text-foreground">
                Personal Student Preferences
              </h2>
            </div>
            <span className="text-xs font-bold text-primary">Editable Profile</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
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
                  placeholder="E.g. Pharmacology, Corporate Law, AI & Data, FinTech, Anatomy..."
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
    </div>
  );
}
