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
import { apiFetch, toTitleCase } from "@/Lib/Api";
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
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phone_number || "+91 98111 22334");
  const [targetCgpa, setTargetCgpa] = useState<number>(user?.target_cgpa ? Number(user.target_cgpa) : 10.0);
  const [bio, setBio] = useState<string>("B.Tech AI & ML Student Focusing On Heuristic Search Algorithms And Deep Learning Architectures.");
  const [minorSpecialization, setMinorSpecialization] = useState<string>("Cloud Computing & MLOps");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("Python 3.10");
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

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
        target_cgpa: String(targetCgpa),
      });
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
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-emerald-500/10 via-surface to-teal-500/10 p-6 sm:p-8 backdrop-blur-md shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            {/* Clickable Profile Avatar with Real Upload */}
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile photo"
            >
              <div className="grid h-20 w-20 place-items-center rounded-3xl text-white font-bold text-2xl shadow-lg transition-transform group-hover:scale-105 bg-gradient-to-tr from-emerald-600 to-teal-500 overflow-hidden">
                {uploadingAvatar ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
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
                {!uploadingAvatar && (
                  <span className="font-bold">{(user?.full_name || "A").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute inset-0 grid place-items-center rounded-3xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground border-2 border-card text-[0.65rem] shadow-xs">
                <Upload className="h-3 w-3" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground truncate">
                  {user?.full_name || "Student Scholar"}
                </h1>
                <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-3 py-0.5 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                  {user?.access_tier?.replace("_", " ") || "SEMESTER TOPPER"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                {user?.email} · Student ID: {user?.roll_number || "ADMIN01"}
              </p>
              <p className="text-xs text-foreground/80 mt-1 max-w-xl font-medium line-clamp-1">
                {bio}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-surface hover:border-primary/50 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 text-primary" />}
              <span>{uploadingAvatar ? "Uploading..." : "Change Avatar"}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= Symmetrical 2-Column Grid ================= */}
      <div className="grid gap-6 lg:grid-cols-12 min-w-0 items-stretch">
        {/* Left Column: Institutional Record Card (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold text-base text-foreground">
                  Institutional Academic Record
                </h2>
              </div>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[0.65rem] font-bold border border-emerald-500/20">
                Verified Student
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-border/60">
                <span className="text-muted-foreground font-medium">University Campus</span>
                <span className="font-bold text-foreground">{user?.university || "NIMS University, Rajasthan"}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-border/60">
                <span className="text-muted-foreground font-medium">Department</span>
                <span className="font-bold text-foreground text-right max-w-[240px] truncate">
                  {user?.department || "Department Of Computer Science & Engineering"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-border/60">
                <span className="text-muted-foreground font-medium">Degree Program</span>
                <span className="font-bold text-foreground">{user?.program || "B.Tech AI & ML"}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-border/60">
                <span className="text-muted-foreground font-medium">Semester &amp; Section</span>
                <span className="font-bold text-foreground">
                  Semester {user?.semester || 1} · Section {user?.section || "A"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-border/60">
                <span className="text-muted-foreground font-medium">Student ID</span>
                <span className="font-mono font-bold text-foreground">{user?.roll_number || "ADMIN01"}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-border/60">
                <span className="text-muted-foreground font-medium">Official Enrollment ID</span>
                <span className="font-mono font-bold text-foreground">{user?.enrollment_no || "NIMS2026-CS-8942"}</span>
              </div>
            </div>
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
                placeholder="+91 98765 43210"
                className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Academic Statement / Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter Your Academic Interests..."
                rows={3}
                className="w-full rounded-2xl border border-border bg-background p-3 text-xs focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Minor Specialization</label>
                <select
                  value={minorSpecialization}
                  onChange={(e) => setMinorSpecialization(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                >
                  <option value="Cloud Computing & MLOps">Cloud Computing &amp; MLOps</option>
                  <option value="Cybersecurity & Forensics">Cybersecurity &amp; Forensics</option>
                  <option value="Data Science & Big Data">Data Science &amp; Big Data</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Core Coding Language</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                >
                  <option value="Python 3.10">Python 3.10</option>
                  <option value="C++ 20">C++ 20</option>
                  <option value="Java 17">Java 17</option>
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
