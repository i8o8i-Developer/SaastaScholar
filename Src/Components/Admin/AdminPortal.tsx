import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  ArrowLeft,
  Database,
  Edit3,
  FileCheck2,
  FileText,
  Filter,
  FlaskConical,
  Folder,
  FolderOpen,
  FolderPlus,
  GraduationCap,
  HelpCircle,
  Pin,
  Lock,
  LifeBuoy,
  CornerDownRight,
  Layers,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  ScrollText,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Tag,
  Terminal,
  Trash2,
  User,
  Upload,
  UserCheck,
  UserX,
  Users,
  Unlock,
  Timer,
  History,
  ShieldAlert,
  AlertTriangle,
  X,
  Menu,
  Sun,
  Moon,
  Zap,
  Eye,
  Bold,
  Italic,
  Link,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Radio,
  Camera,
  Key,
  EyeOff,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/Hooks/UseAuth";
import { useTheme } from "@/Hooks/UseTheme";
import { isDrmGloballyDisabled, setDrmGloballyDisabled } from "@/Hooks/UseDrmProtection";
import { DrmSecureReader } from "../Dashboard/DrmSecureReader";
import { MarkdownContent } from "../Ui/MarkdownContent";
import { BroadcastBanner } from "../Ui/BroadcastBanner";
import {
  AcademicMaterial,
  AdminAuditLog,
  apiFetch,
  Department,
  DepartmentNotice,
  DrmSecurityIncident,
  getAccessToken,
  LabExperiment,
  MilestoneCountdown,
  ProgramSpecialization,
  removeAccessToken,
  SectionBatch,
  SidebarBadgeConfig,
  SiteBanner,
  StudentAssignment,
  studentSecurityApi,
  StudentUser,
  Subject,
  TimetableSlot,
  SupportTicket,
  ForumPost,
  communityApi,
  globalDrmApi,
  toTitleCase,
} from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { ArrowUpRight, Check, Compass, Globe, Server, TrendingUp } from "lucide-react";

type AdminStation =
  | "overview"
  | "structure"
  | "publisher"
  | "timetable"
  | "assignments"
  | "notices"
  | "milestones"
  | "students"
  | "badges"
  | "banners"
  | "support"
  | "forum";

type PublisherContentType =
  | "NOTES"
  | "SOLVED_PYQ"
  | "SYLLABUS"
  | "LAB_MANUAL"
  | "FORMULA_SHEET"
  | "FACULTY";

function extractArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AdminPortal() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [activeStation, setActiveStation] = useState<AdminStation>("overview");
  const [structureSubTab, setStructureSubTab] = useState<"departments" | "programs" | "sections" | "subjects">("departments");
  const [publisherType, setPublisherType] = useState<PublisherContentType>("NOTES");
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>("Mon");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const [loading, setLoading] = useState<boolean>(true);

  // Core Data Stores
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<ProgramSpecialization[]>([]);
  const [sections, setSections] = useState<SectionBatch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [labs, setLabs] = useState<LabExperiment[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [milestones, setMilestones] = useState<MilestoneCountdown[]>([]);
  const [notices, setNotices] = useState<DepartmentNotice[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [drmIncidents, setDrmIncidents] = useState<DrmSecurityIncident[]>([]);
  const [isDrmDisabled, setIsDrmDisabled] = useState<boolean>(isDrmGloballyDisabled);
  const [studentSubTab, setStudentSubTab] = useState<"registry" | "audit" | "incidents">("registry");
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<StudentUser | null>(null);
  const [securityActionForm, setSecurityActionForm] = useState({
    action_type: "BLOCK_DRM",
    reason: "",
    cooldown_hours: 24,
    warning_message: "",
    access_tier: "SEMESTER_TOPPER",
  });
  const [auditFilterAction, setAuditFilterAction] = useState<string>("ALL");
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>("");
  const [incidentFilterType, setIncidentFilterType] = useState<string>("ALL");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [badges, setBadges] = useState<SidebarBadgeConfig[]>([]);
  const [editingBadge, setEditingBadge] = useState<Record<string, { badge_text: string; badge_variant: string; is_active: boolean }>>({});
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [showBannerModal, setShowBannerModal] = useState<boolean>(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerPreviewTab, setBannerPreviewTab] = useState<"write" | "preview">("write");
  const [newBanner, setNewBanner] = useState<Omit<SiteBanner, "id">>({
    title: "",
    message: "",
    tag: "Announcement",
    variant: "emerald",
    target: "ALL",
    link_url: "",
    link_text: "Learn More",
    is_active: true,
    is_dismissible: true,
    priority: 10,
  });

  // ================= Cascading Selection State =================
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  // Modals & Editing State Containers
  const [showDeptModal, setShowDeptModal] = useState<boolean>(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  const [showProgramModal, setShowProgramModal] = useState<boolean>(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);

  const [showSectionModal, setShowSectionModal] = useState<boolean>(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const [showMaterialModal, setShowMaterialModal] = useState<boolean>(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<"IDLE" | "PREPARING" | "UPLOADING" | "PROCESSING" | "COMPLETE">("IDLE");
  const [uploadedBytesText, setUploadedBytesText] = useState<string>("");
  const [uploadSpeedText, setUploadSpeedText] = useState<string>("");

  const [showLabModal, setShowLabModal] = useState<boolean>(false);
  const [editingLabId, setEditingLabId] = useState<string | null>(null);

  const [showAssignmentModal, setShowAssignmentModal] = useState<boolean>(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);

  const [showTimetableModal, setShowTimetableModal] = useState<boolean>(false);
  const [editingTimetableId, setEditingTimetableId] = useState<string | null>(null);
  const [showDeleteAllTimetableModal, setShowDeleteAllTimetableModal] = useState<boolean>(false);
  const [isDeletingAllTimetable, setIsDeletingAllTimetable] = useState<boolean>(false);
  const [deleteAllScope, setDeleteAllScope] = useState<"filtered" | "all">("filtered");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState<string>("");

  // Gemini AI Photo Timetable Scanner States
  const [showAiTimetableModal, setShowAiTimetableModal] = useState<boolean>(false);
  const [aiTimetableImage, setAiTimetableImage] = useState<string | null>(null);
  const [aiTimetableMime, setAiTimetableMime] = useState<string>("image/jpeg");
  const [aiTimetableFileName, setAiTimetableFileName] = useState<string>("");
  const [aiExtracting, setAiExtracting] = useState<boolean>(false);
  const [aiExtractedSlots, setAiExtractedSlots] = useState<Array<any>>([]);
  const [aiTargetSemester, setAiTargetSemester] = useState<number>(1);
  const [aiTargetSection, setAiTargetSection] = useState<string>("");
  const [aiGeminiKey, setAiGeminiKey] = useState<string>(() => localStorage.getItem("nimswallah_gemini_key") || "");
  const [showAiKeyInput, setShowAiKeyInput] = useState<boolean>(false);
  const [isSavingAiSlots, setIsSavingAiSlots] = useState<boolean>(false);

  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);

  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticePreviewTab, setNoticePreviewTab] = useState<"write" | "preview">("write");

  const [previewMaterialId, setPreviewMaterialId] = useState<string | null>(null);
  const [viewingNotice, setViewingNotice] = useState<DepartmentNotice | null>(null);
  const [viewingBanner, setViewingBanner] = useState<SiteBanner | null>(null);

  // Academic Architecture Folder Explorer States
  const [programFolderDeptId, setProgramFolderDeptId] = useState<string | null>(null);
  const [sectionFolderProgramId, setSectionFolderProgramId] = useState<string | null>(null);
  const [sectionFolderSemesterFilter, setSectionFolderSemesterFilter] = useState<number | "all">("all");
  const [subjectFolderProgramId, setSubjectFolderProgramId] = useState<string | null>(null);
  const [subjectFolderSemesterFilter, setSubjectFolderSemesterFilter] = useState<number | "all">("all");
  const [academicSearchQuery, setAcademicSearchQuery] = useState<string>("");

  // Form State Containers
  const [newDept, setNewDept] = useState({ name: "", code: "", description: "", head_of_department: "" });
  const [newProgram, setNewProgram] = useState({ department: "", name: "", code: "", degree_level: "Undergraduate", duration_years: 4, total_semesters: 8 });
  const [newSection, setNewSection] = useState({ program: "", semester: 1, section: "A", academic_year: "2026-2027", max_capacity: 60 });
  const [newSubject, setNewSubject] = useState<{
    programs: string[];
    semester: number;
    name: string;
    code: string;
    short_name: string;
    faculty_name: string;
    credits: number;
    syllabus_summary: string;
  }>({
    programs: [],
    semester: 1,
    name: "",
    code: "",
    short_name: "",
    faculty_name: "",
    credits: 4,
    syllabus_summary: "",
  });
  
  const [materialUploadMode, setMaterialUploadMode] = useState<"STUDIO" | "FILE">("STUDIO");
  const [materialPages, setMaterialPages] = useState<Array<{ page_number: number; page_title: string; content_html: string }>>([
    {
      page_number: 1,
      page_title: "Unit 1: Foundations & Core Concepts",
      content_html: "## 1. Core Architectural Concepts\n- **Definition**: Theoretical foundations and analytical models.\n- **Complexity**: $O(N \\log N)$ asymptotic bounds.\n\n```python\n# Implementation Sample\ndef compute_solution(data):\n    return sorted(data)\n```",
    },
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  const [newMaterial, setNewMaterial] = useState({
    subject: "",
    title: "",
    material_type: "NOTES",
    unit_number: 1,
    academic_year: "2026-2027",
    summary: "",
    page_count: 1,
    is_topper_verified: true,
    tag_input: "",
    file: null as File | null,
  });

  const [newLab, setNewLab] = useState({
    subject: "",
    experiment_number: 1,
    title: "",
    aim: "",
  });

  const [labCodes, setLabCodes] = useState<Array<{ lang: string; code: string }>>([
    { lang: "python", code: "" },
  ]);

  const [vivaList, setVivaList] = useState<Array<{ question: string; answer: string }>>([
    { question: "What Is the Computational Complexity of This Algorithmic Procedure?", answer: "Time Complexity Is O(V+E) and Auxiliary Space Complexity Is O(V)." },
  ]);

  const [newAssignment, setNewAssignment] = useState({
    subject: "",
    title: "",
    description: "",
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    total_marks: 20,
    weightage_percentage: 10,
  });

  const [newTimetableSlot, setNewTimetableSlot] = useState({
    semester: 1,
    section: "A",
    day_of_week: "Mon",
    start_time: "09:00",
    end_time: "10:30",
    title: "",
    subject: "",
    room_number: "LT-01",
    faculty_name: "",
    event_type: "Class",
    tone: "green",
  });

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    target_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    category: "Mid-Semester Theory Exams",
    semester: 1,
    tag: "Term 1",
  });

  const [noticeFilterScope, setNoticeFilterScope] = useState<"context" | "all">("context");

  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    category: "Examination",
    priority: "HIGH",
    department: "",
    program: "",
    target_semester: null as number | null,
    target_section: "",
    is_broadcast_all: true,
  });

  // Load All Admin Stores
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [
        deptsRes,
        progsRes,
        secsRes,
        subsRes,
        matsRes,
        labsRes,
        assignsRes,
        timesRes,
        milesRes,
        noticesRes,
        usersRes,
        badgesRes,
        ticketsRes,
        postsRes,
        auditRes,
        incidentsRes,
        drmConfigRes,
        bannersRes,
      ] = await Promise.all([
        apiFetch("/academic/admin/departments/"),
        apiFetch("/academic/admin/programs/"),
        apiFetch("/academic/admin/sections/"),
        apiFetch("/academic/admin/subjects/"),
        apiFetch("/academic/admin/materials/"),
        apiFetch("/academic/admin/labs/"),
        apiFetch("/assignments/admin/assignments/"),
        apiFetch("/planner/admin/timetable/"),
        apiFetch("/planner/admin/milestones/"),
        apiFetch("/academic/admin/notices/"),
        studentSecurityApi.getStudents(),
        apiFetch("/academic/admin/badges/"),
        communityApi.getTickets(),
        communityApi.getPosts(),
        studentSecurityApi.getAuditLogs(),
        studentSecurityApi.getDrmIncidents(),
        globalDrmApi.getConfig().catch(() => ({ is_drm_enabled: true })),
        apiFetch("/academic/admin/banners/").catch(() => []),
      ]);

      if (drmConfigRes && typeof (drmConfigRes as any).is_drm_enabled === "boolean") {
        const disabled = !(drmConfigRes as any).is_drm_enabled;
        setIsDrmDisabled(disabled);
        setDrmGloballyDisabled(disabled);
      }

      setDepartments(extractArray<Department>(deptsRes));
      setPrograms(extractArray<ProgramSpecialization>(progsRes));
      setSections(extractArray<SectionBatch>(secsRes));
      setSubjects(extractArray<Subject>(subsRes));
      setMaterials(extractArray<AcademicMaterial>(matsRes));
      setLabs(extractArray<LabExperiment>(labsRes));
      setAssignments(extractArray<StudentAssignment>(assignsRes));
      setTimetableSlots(extractArray<TimetableSlot>(timesRes));
      setMilestones(extractArray<MilestoneCountdown>(milesRes));
      setNotices(extractArray<DepartmentNotice>(noticesRes));
      setStudents(extractArray<StudentUser>(usersRes));
      setAuditLogs(extractArray<AdminAuditLog>(auditRes));
      setDrmIncidents(extractArray<DrmSecurityIncident>(incidentsRes));
      setBanners(extractArray<SiteBanner>(bannersRes));
      
      // Community
      setTickets(Array.isArray(ticketsRes) ? ticketsRes : (ticketsRes as any)?.results || []);
      setPosts(Array.isArray(postsRes) ? postsRes : (postsRes as any)?.results || []);

      const loadedBadges = extractArray<SidebarBadgeConfig>(badgesRes);
      setBadges(loadedBadges);
      const draftMap: Record<string, { badge_text: string; badge_variant: string; is_active: boolean }> = {};
      loadedBadges.forEach((b) => {
        draftMap[b.id] = {
          badge_text: b.badge_text || "",
          badge_variant: b.badge_variant || "emerald",
          is_active: b.is_active,
        };
      });
      setEditingBadge(draftMap);
    } catch (err: any) {
      const errMsg = err.message || "";
      if (errMsg.includes("Credentials Were Not Provided") || errMsg.includes("token") || errMsg.includes("401")) {
        removeAccessToken();
        window.location.href = "/login?mode=admin";
        return;
      }
      toast.error(err.message || "Failed To Load Academic Records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const isMasterAdmin = (user as any)?.is_staff || (user as any)?.is_superuser || user?.email === "admin@nims.edu.in";
      if (!isAuthenticated || !getAccessToken() || !isMasterAdmin) {
        if (isAuthenticated && !isMasterAdmin) {
          toast.error("Access Denied: Administrative Clearance Required. Redirecting To Student Dashboard.");
          window.location.href = "/dashboard";
          return;
        }
        window.location.href = "/login?mode=admin";
        return;
      }
      loadAdminData();
    }
  }, [isLoading, isAuthenticated, user]);

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

  const handleSaveBadge = async (badgeId: string) => {
    const draft = editingBadge[badgeId];
    if (!draft) return;
    try {
      await apiFetch(`/academic/admin/badges/${badgeId}/`, {
        method: "PATCH",
        body: JSON.stringify(draft),
      });
      toast.success("Navigation Badge Configuration Saved Successfully.");
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed To Update Badge.");
    }
  };

  const handleExecuteSecurityAction = async () => {
    if (!selectedStudentForAction) return;
    if (!securityActionForm.reason.trim()) {
      toast.error("Mandatory Administrative Justification Is Required For Security Audit.");
      return;
    }

    if (securityActionForm.action_type === "HARD_DELETE_USER") {
      const confirmed = confirm(
        `⚠️ CRITICAL HARD DELETE CONFIRMATION:\n\nAre You Absolutely Sure You Want To Permanently Delete Student Account "${selectedStudentForAction.full_name || selectedStudentForAction.email}"?\n\nAll Credentials, Assignments, And DRM Status Will Be Permanently Purged And Lost Forever.`
      );
      if (!confirmed) return;
    }

    try {
      const res = await studentSecurityApi.performSecurityAction(selectedStudentForAction.id, {
        action_type: securityActionForm.action_type,
        reason: securityActionForm.reason.trim(),
        cooldown_hours: securityActionForm.cooldown_hours,
        warning_message: securityActionForm.warning_message.trim(),
        access_tier: securityActionForm.access_tier,
      });
      toast.success(toTitleCase(res.message || "Security Action Executed & Logged."));

      if (securityActionForm.action_type === "HARD_DELETE_USER") {
        setStudents((prev) => prev.filter((s) => s.id !== selectedStudentForAction.id));
      }

      setShowSecurityModal(false);
      setSelectedStudentForAction(null);
      setSecurityActionForm({
        action_type: "BLOCK_DRM",
        reason: "",
        cooldown_hours: 24,
        warning_message: "",
        access_tier: "SEMESTER_TOPPER",
      });
      loadAdminData();
    } catch (err: any) {
      toast.error(toTitleCase(err.message || "Failed To Execute Security Action."));
    }
  };

  const handleClearAuditLogs = async () => {
    const filterLabel = auditFilterAction === "ALL" ? "All" : auditFilterAction.replace(/_/g, " ");
    const confirmed = confirm(
      `⚠️ CLEAR AUDIT LOG VAULT CONFIRMATION:\n\nAre You Sure You Want To Permanently Clear And Purge ${filterLabel} Audit Records From The Immutable Audit Vault?`
    );
    if (!confirmed) return;

    try {
      const res = await studentSecurityApi.clearAuditLogs({
        action_filter: auditFilterAction,
        reason: `Administrative Audit Vault Purge (${filterLabel})`,
      });
      toast.success(toTitleCase(res.message || "Audit Logs Cleared Successfully."));
      loadAdminData();
    } catch (err: any) {
      toast.error(toTitleCase(err.message || "Failed To Clear Audit Logs."));
    }
  };

  const handleClearDrmIncidents = async () => {
    const filterLabel = incidentFilterType === "ALL" ? "All" : incidentFilterType.replace(/_/g, " ");
    const confirmed = confirm(
      `⚠️ CLEAR DRM SECURITY TELEMETRY CONFIRMATION:\n\nAre You Sure You Want To Permanently Clear And Purge ${filterLabel} DRM Security Telemetry Incidents?`
    );
    if (!confirmed) return;

    try {
      const res = await studentSecurityApi.clearDrmIncidents({
        event_filter: incidentFilterType,
        reason: `Administrative DRM Telemetry Purge (${filterLabel})`,
      });
      toast.success(toTitleCase(res.message || "DRM Security Telemetry Cleared Successfully."));
      loadAdminData();
    } catch (err: any) {
      toast.error(toTitleCase(err.message || "Failed To Clear DRM Telemetry."));
    }
  };

  // Filter Cascade Computations
  const filteredPrograms = programs.filter((p) => {
    if (selectedDeptId && p.department !== selectedDeptId) return false;
    return true;
  });

  const filteredSections = sections.filter((s) => {
    if (selectedProgramId && s.program && s.program !== selectedProgramId) return false;
    if (selectedSemester && s.semester && s.semester !== selectedSemester) return false;
    return true;
  });

  const filteredSubjects = subjects.filter((sub) => {
    if (selectedDeptId && sub.department && sub.department !== selectedDeptId) {
      return false;
    }
    if (selectedProgramId) {
      const subProgIds = sub.program_ids || (Array.isArray(sub.programs) ? sub.programs : (sub.program ? [sub.program] : []));
      if (subProgIds.length > 0) {
        if (!subProgIds.includes(selectedProgramId)) {
          return false;
        }
      } else {
        const progObj = programs.find((p) => p.id === selectedProgramId);
        if (sub.department && progObj?.department && sub.department !== progObj.department) {
          return false;
        }
      }
    }
    if (selectedSemester && sub.semester && sub.semester !== selectedSemester) {
      return false;
    }
    return true;
  });

  // Filtered Materials
  const filteredMaterials = materials.filter((mat) => {
    if (selectedSubjectId && mat.subject !== selectedSubjectId) return false;
    if (!selectedSubjectId && selectedSemester) {
      const allowedSubjectIds = new Set(filteredSubjects.map((s) => s.id));
      if (allowedSubjectIds.size > 0 && !allowedSubjectIds.has(mat.subject)) return false;
    }
    return true;
  });

  // Filtered Timetable Slots
  const filteredTimetableSlots = timetableSlots.filter((slot) => {
    if (selectedSemester && slot.semester !== selectedSemester) return false;
    if (selectedSectionId) {
      const targetSec = sections.find((s) => s.id === selectedSectionId);
      const targetSecCode = targetSec?.section || targetSec?.section_name;
      if (targetSecCode && slot.section?.trim().toUpperCase() !== targetSecCode.trim().toUpperCase()) return false;
    }
    if (selectedTimetableDay && selectedTimetableDay !== "All") {
      const slotDay = (slot.day_of_week || "").trim().toLowerCase();
      const targetDay = selectedTimetableDay.trim().toLowerCase();
      if (!slotDay.startsWith(targetDay) && slotDay !== targetDay) return false;
    }
    return true;
  });

  // Real-time computed metrics for Weekly Class Schedule
  const weeklyScheduleData = useMemo(() => {
    const isDayMatch = (val: string, prefix: string) =>
      (val || "").trim().toLowerCase().startsWith(prefix.toLowerCase());

    const days = [
      { day: "Monday", shortDay: "Mon", prefix: "mon" },
      { day: "Tuesday", shortDay: "Tue", prefix: "tue" },
      { day: "Wednesday", shortDay: "Wed", prefix: "wed" },
      { day: "Thursday", shortDay: "Thu", prefix: "thu" },
      { day: "Friday", shortDay: "Fri", prefix: "fri" },
      { day: "Saturday", shortDay: "Sat", prefix: "sat" },
    ];

    return days.map(({ day, shortDay, prefix }) => {
      const daySlots = timetableSlots.filter((s) => isDayMatch(s.day_of_week, prefix));
      const hours = daySlots.reduce((acc, s) => {
        if (s.start_time && s.end_time) {
          const partsStart = s.start_time.split(":").map(Number);
          const partsEnd = s.end_time.split(":").map(Number);
          const sh = partsStart[0] ?? 0;
          const sm = partsStart[1] ?? 0;
          const eh = partsEnd[0] ?? 0;
          const em = partsEnd[1] ?? 0;
          if (!Number.isNaN(sh) && !Number.isNaN(eh) && (eh * 60 + em) > (sh * 60 + sm)) {
            const diff = (eh * 60 + em) - (sh * 60 + sm);
            if (diff > 0) return acc + diff / 60;
          }
        }
        return acc + 1.5;
      }, 0);
      return {
        day,
        shortDay,
        periods: daySlots.length,
        hours: +hours.toFixed(1),
      };
    });
  }, [timetableSlots]);

  const peakScheduleDay = useMemo(() => {
    if (timetableSlots.length === 0) return "No Periods Scheduled";
    const sorted = [...weeklyScheduleData].sort((a, b) => b.periods - a.periods);
    const top = sorted[0];
    if (!top || top.periods === 0) return "No Periods Scheduled";
    return `${top.day} (${top.periods} Periods)`;
  }, [timetableSlots, weeklyScheduleData]);

  const totalWeeklyAcademicHours = useMemo(() => {
    const sum = weeklyScheduleData.reduce((acc, d) => acc + d.hours, 0);
    return sum.toFixed(1);
  }, [weeklyScheduleData]);

  const activeCohortsCount = useMemo(() => {
    if (timetableSlots.length === 0) return 0;
    const unique = new Set(timetableSlots.map((s) => `Sem${s.semester}-Sec${s.section}`));
    return unique.size;
  }, [timetableSlots]);

  // Filtered Assignments
  const filteredAssignments = assignments.filter((assign) => {
    if (selectedSubjectId && assign.subject !== selectedSubjectId) return false;
    if (!selectedSubjectId && selectedSemester) {
      const allowedSubjectIds = new Set(filteredSubjects.map((s) => s.id));
      if (!allowedSubjectIds.has(assign.subject)) return false;
    }
    return true;
  });

  // Filtered Notices with Cascading Curriculum Context Logic
  const filteredNotices = notices.filter((n) => {
    if (noticeFilterScope === "all") return true;

    // 1. Department Cascading Match
    if (selectedDeptId) {
      // If notice belongs to another department, exclude
      if (n.department && n.department !== selectedDeptId) return false;
      const deptObj = departments.find((d) => d.id === selectedDeptId);
      if (deptObj && n.department_code && n.department_code !== deptObj.code) return false;
    }

    // 2. Specialization / Program Cascading Match
    if (selectedProgramId) {
      if (n.program && n.program !== selectedProgramId) return false;
    }

    // 3. Semester Cascading Match
    if (selectedSemester) {
      if (n.target_semester && n.target_semester !== selectedSemester) return false;
    }

    // In Context mode, if a specific department/specialization is chosen, hide generic campus broadcasts to show only targeted circulars
    if ((selectedDeptId || selectedProgramId) && n.is_broadcast_all && !n.department && !n.program && noticeFilterScope === "context") {
      return false;
    }

    return true;
  });

  // Filtered Milestones (Station 6 Cascading Filter)
  const filteredMilestones = milestones.filter((m) => {
    if (selectedSemester && m.semester !== selectedSemester) return false;
    return true;
  });

  // Filtered Students (Station 7 Cascading Filter)
  const filteredStudents = students.filter((stu) => {
    if (selectedDeptId && stu.department) {
      const deptObj = departments.find((d) => d.id === selectedDeptId);
      if (deptObj && stu.department !== deptObj.name && stu.department !== deptObj.code && stu.department !== deptObj.id) return false;
    }
    if (selectedProgramId && stu.program) {
      const progObj = programs.find((p) => p.id === selectedProgramId);
      if (progObj && stu.program !== progObj.name && stu.program !== progObj.code && stu.program !== progObj.id) return false;
    }
    if (selectedSemester && stu.semester !== selectedSemester) return false;
    if (selectedSectionId) {
      const targetSec = sections.find((s) => s.id === selectedSectionId);
      const targetSecCode = targetSec?.section || targetSec?.section_name;
      if (targetSecCode && stu.section !== targetSecCode) return false;
    }
    return true;
  });

  // ================= Edit Triggers for Every Entity =================
  const handleEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setNewDept({
      name: dept.name,
      code: dept.code,
      description: dept.description || "",
      head_of_department: dept.head_of_department || "",
    });
    setShowDeptModal(true);
  };

  const handleEditProgram = (prog: ProgramSpecialization) => {
    setEditingProgramId(prog.id);
    let dl = prog.degree_level || "Undergraduate";
    if (dl.includes("Undergraduate")) dl = "Undergraduate";
    else if (dl.includes("Postgraduate")) dl = "Postgraduate";
    else if (dl.includes("Diploma")) dl = "Diploma";
    else if (dl.includes("Doctoral") || dl.includes("Ph.D")) dl = "Doctoral";

    setNewProgram({
      department: prog.department || selectedDeptId || "",
      name: prog.name,
      code: prog.code,
      degree_level: dl,
      duration_years: prog.duration_years || 4,
      total_semesters: prog.total_semesters || 8,
    });
    setShowProgramModal(true);
  };

  const handleEditSection = (sec: SectionBatch) => {
    setEditingSectionId(sec.id);
    setNewSection({
      program: sec.program || selectedProgramId || "",
      semester: sec.semester || 1,
      section: sec.section || sec.section_name || "A",
      academic_year: sec.academic_year || "2026-2027",
      max_capacity: sec.max_capacity || 60,
    });
    setShowSectionModal(true);
  };

  const handleEditSubject = (sub: Subject) => {
    setEditingSubjectId(sub.id);
    const progList: string[] = [];
    if (Array.isArray(sub.program_ids) && sub.program_ids.length > 0) {
      progList.push(...sub.program_ids);
    } else if (Array.isArray(sub.programs) && sub.programs.length > 0) {
      progList.push(...sub.programs);
    } else if (sub.program) {
      progList.push(sub.program);
    } else if (selectedProgramId) {
      progList.push(selectedProgramId);
    }

    setNewSubject({
      programs: progList,
      semester: sub.semester || 1,
      name: sub.name,
      code: sub.code,
      short_name: sub.short_name || "",
      faculty_name: sub.faculty_name || "",
      credits: sub.credits || 4,
      syllabus_summary: sub.syllabus_summary || "",
    });
    setShowSubjectModal(true);
  };

  const handleEditMaterial = (mat: AcademicMaterial) => {
    setEditingMaterialId(mat.id);
    setNewMaterial({
      subject: mat.subject || selectedSubjectId || "",
      title: mat.title,
      material_type: mat.material_type || publisherType || "NOTES",
      unit_number: mat.unit_number || 1,
      academic_year: mat.academic_year || "2026-2027",
      summary: mat.summary || "",
      page_count: mat.page_count || 1,
      is_topper_verified: mat.is_topper_verified ?? true,
      tag_input: Array.isArray(mat.tags) ? mat.tags.join(", ") : "",
      file: null,
    });
    if (Array.isArray(mat.pages) && mat.pages.length > 0) {
      setMaterialPages(mat.pages.map((p) => ({
        page_number: p.page_number,
        page_title: p.page_title || `Page ${p.page_number}`,
        content_html: p.content_html || "",
      })));
      setMaterialUploadMode("STUDIO");
    } else {
      setMaterialUploadMode(mat.file ? "FILE" : "STUDIO");
    }
    setActivePageIndex(0);
    setShowMaterialModal(true);
  };

  const handleEditLab = (lab: LabExperiment) => {
    setEditingLabId(lab.id);
    setNewLab({
      subject: lab.subject || selectedSubjectId || "",
      experiment_number: lab.experiment_number || 1,
      title: lab.title,
      aim: lab.aim || "",
    });
    if (lab.code_snippets && typeof lab.code_snippets === "object") {
      const entries = Object.entries(lab.code_snippets).map(([lang, code]) => ({ lang, code: String(code) }));
      setLabCodes(entries.length > 0 ? entries : [{ lang: "python", code: "" }]);
    }
    if (Array.isArray(lab.viva_questions) && lab.viva_questions.length > 0) {
      setVivaList(lab.viva_questions.map((v: any) => ({
        question: v.question || v.q || "",
        answer: v.answer || v.a || "",
      })));
    }
    setShowLabModal(true);
  };

  const handleEditAssignment = (ass: StudentAssignment) => {
    setEditingAssignmentId(ass.id);
    setNewAssignment({
      subject: ass.subject || selectedSubjectId || "",
      title: ass.title,
      description: ass.description || "",
      due_date: ass.due_date ? ass.due_date.split("T")[0] : new Date().toISOString().split("T")[0],
      total_marks: ass.total_marks || 20,
      weightage_percentage: ass.weightage_percentage || 10,
    });
    setShowAssignmentModal(true);
  };

  const handleEditTimetable = (slot: TimetableSlot) => {
    setEditingTimetableId(slot.id);
    setNewTimetableSlot({
      semester: slot.semester || 1,
      section: slot.section || "A",
      day_of_week: slot.day_of_week || "Mon",
      start_time: slot.start_time || "09:00",
      end_time: slot.end_time || "10:30",
      title: slot.title || "",
      subject: slot.subject || "",
      room_number: slot.room_number || "LT-01",
      faculty_name: slot.faculty_name || "",
      event_type: slot.event_type || "Class",
      tone: slot.tone || "green",
    });
    setShowTimetableModal(true);
  };

  const handleEditMilestone = (ms: MilestoneCountdown) => {
    setEditingMilestoneId(ms.id);
    setNewMilestone({
      title: ms.title,
      target_date: ms.target_date ? ms.target_date.split("T")[0] : new Date().toISOString().split("T")[0],
      category: ms.category || "Mid-Semester Theory Exams",
      semester: ms.semester || 1,
      tag: ms.tag || "Term 1",
    });
    setShowMilestoneModal(true);
  };

  const handleEditNotice = (notice: DepartmentNotice) => {
    setEditingNoticeId(notice.id);
    setNewNotice({
      title: notice.title,
      content: notice.content || "",
      category: notice.category || "Examination",
      priority: notice.priority || "HIGH",
      department: notice.department || "",
      program: notice.program || "",
      target_semester: notice.target_semester ?? null,
      target_section: notice.target_section || "",
      is_broadcast_all: notice.is_broadcast_all ?? (!notice.department && !notice.program),
    });
    setShowNoticeModal(true);
  };

  // Handlers for Creation & Mutation
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeptId) {
        await apiFetch(`/academic/admin/departments/${editingDeptId}/`, {
          method: "PATCH",
          body: JSON.stringify(newDept),
        });
        toast.success("Academic Department Updated Successfully.");
      } else {
        await apiFetch("/academic/admin/departments/", {
          method: "POST",
          body: JSON.stringify(newDept),
        });
        toast.success("Academic Department Registered Successfully.");
      }
      setShowDeptModal(false);
      setEditingDeptId(null);
      setNewDept({ name: "", code: "", description: "", head_of_department: "" });
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed To Save Department.");
    }
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProgramId) {
        await apiFetch(`/academic/admin/programs/${editingProgramId}/`, {
          method: "PATCH",
          body: JSON.stringify(newProgram),
        });
        toast.success("Degree Program Specialization Updated.");
      } else {
        await apiFetch("/academic/admin/programs/", {
          method: "POST",
          body: JSON.stringify(newProgram),
        });
        toast.success("Degree Program Specialization Created.");
      }
      setShowProgramModal(false);
      setEditingProgramId(null);
      setNewProgram({ department: selectedDeptId || "", name: "", code: "", degree_level: "Undergraduate", duration_years: 4, total_semesters: 8 });
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed To Save Program.");
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        program: newSection.program || selectedProgramId || (programs[0]?.id || ""),
        semester: Number(newSection.semester) || 1,
        section: (newSection.section || "A").trim().toUpperCase(),
        section_name: (newSection.section || "A").trim().toUpperCase(),
        academic_year: newSection.academic_year || "2025-2026",
        batch_code: `${newSection.academic_year || "2025-2026"} Batch`,
        max_capacity: Number(newSection.max_capacity) || 60,
      };
      if (editingSectionId) {
        await apiFetch(`/academic/admin/sections/${editingSectionId}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Semester Section Batch Updated Successfully.");
      } else {
        await apiFetch("/academic/admin/sections/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Semester Section Batch Created Successfully.");
      }
      setShowSectionModal(false);
      setEditingSectionId(null);
      setNewSection({ program: selectedProgramId || "", semester: selectedSemester || 1, section: "B", academic_year: "2026-2027", max_capacity: 60 });
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed To Save Section.");
    }
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.programs || newSubject.programs.length === 0) {
      toast.error("Please Select At Least One Parent Degree Program / Specialization.");
      return;
    }
    try {
      const firstProgId = newSubject.programs[0];
      const targetProg = programs.find((p) => p.id === firstProgId) || programs[0];
      const payload = {
        name: newSubject.name.trim(),
        code: newSubject.code.trim().toUpperCase(),
        short_name: (newSubject.short_name || "").trim().toUpperCase(),
        faculty_name: (newSubject.faculty_name || "").trim(),
        semester: Number(newSubject.semester) || 1,
        credits: Number(newSubject.credits) || 4,
        programs: newSubject.programs,
        program: firstProgId,
        department: targetProg?.department || selectedDeptId || (departments[0]?.id || ""),
        syllabus_summary: newSubject.syllabus_summary || "",
      };
      if (editingSubjectId) {
        await apiFetch(`/academic/admin/subjects/${editingSubjectId}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Course Subject Updated Successfully.");
      } else {
        await apiFetch("/academic/admin/subjects/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Course Subject Registered Successfully.");
      }
      setShowSubjectModal(false);
      setEditingSubjectId(null);
      setNewSubject({
        programs: selectedProgramId ? [selectedProgramId] : (programs[0]?.id ? [programs[0].id] : []),
        semester: selectedSemester || 1,
        name: "",
        code: "",
        short_name: "",
        faculty_name: "",
        credits: 4,
        syllabus_summary: "",
      });
      loadAdminData();
    } catch (err: any) {
      toast.error(toTitleCase(err.message || "Failed To Save Subject."));
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetSubjectId = newMaterial.subject || selectedSubjectId || (subjects[0]?.id || "");
      if (!targetSubjectId) {
        toast.error("Please Select a Target Course Subject.");
        return;
      }

      const targetMatType = newMaterial.material_type || (publisherType === "SOLVED_PYQ" ? "SOLVED_PYQ" : "NOTES");

      const formData = new FormData();
      formData.append("subject", targetSubjectId);
      formData.append("title", newMaterial.title.trim() || (targetMatType === "SOLVED_PYQ" ? "University Solved PYQ" : "Unit Notes"));
      formData.append("material_type", targetMatType);
      formData.append("unit_number", String(newMaterial.unit_number || 1));
      formData.append("academic_year", newMaterial.academic_year || "2026-2027");
      formData.append("summary", newMaterial.summary || "");
      formData.append("is_topper_verified", String(newMaterial.is_topper_verified));
      
      const tags = newMaterial.tag_input
        ? newMaterial.tag_input
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      formData.append("tags", JSON.stringify(tags));

      if (materialUploadMode === "STUDIO") {
        formData.append("pages_input", JSON.stringify(materialPages));
        formData.append("page_count", String(materialPages.length || 1));
      } else {
        formData.append("page_count", String(newMaterial.page_count || 1));
        if (newMaterial.file) {
          formData.append("file", newMaterial.file);
        }
      }

      const token = localStorage.getItem("nimswallah_access_token");
      const url = editingMaterialId ? `/api/academic/admin/materials/${editingMaterialId}/` : "/api/academic/admin/materials/";
      const method = editingMaterialId ? "PATCH" : "POST";

      setIsUploadingMaterial(true);
      setUploadProgress(0);
      setUploadStage("PREPARING");
      setUploadedBytesText("Preparing Document Package...");
      setUploadSpeedText("");

      const startTime = Date.now();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(Math.round((event.loaded / event.total) * 100), 99);
            const loadedMB = (event.loaded / (1024 * 1024)).toFixed(1);
            const totalMB = (event.total / (1024 * 1024)).toFixed(1);
            const elapsedSec = Math.max((Date.now() - startTime) / 1000, 0.1);
            const speedMBps = (event.loaded / (1024 * 1024) / elapsedSec).toFixed(1);

            setUploadProgress(percent);
            setUploadStage("UPLOADING");
            setUploadedBytesText(`${loadedMB} MB of ${totalMB} MB`);
            setUploadSpeedText(`${speedMBps} MB/s`);

            if (event.loaded >= event.total) {
              setUploadProgress(100);
              setUploadStage("PROCESSING");
              setUploadedBytesText("Processing Document & Building DRM Pages...");
              setUploadSpeedText("");
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            setUploadStage("COMPLETE");
            resolve();
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              let msg = err.error || err.detail;
              if (!msg && typeof err === "object") {
                msg = Object.entries(err)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                  .join(" | ");
              }
              reject(new Error(msg || `Upload Failed With HTTP ${xhr.status}`));
            } catch {
              reject(new Error(`Server Responded With HTTP ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network Connection Interrupted During Document Upload."));
        };

        xhr.ontimeout = () => {
          reject(new Error("Document Upload Timed Out. Please Try Again."));
        };

        xhr.send(formData);
      });

      toast.success(editingMaterialId ? "Study Material Updated Successfully." : "Academic Study Material Published Successfully.");
      setShowMaterialModal(false);
      setEditingMaterialId(null);
      setNewMaterial({
        subject: selectedSubjectId || (subjects[0]?.id || ""),
        title: "",
        material_type: publisherType,
        unit_number: 1,
        academic_year: "2026-2027",
        summary: "",
        page_count: 1,
        is_topper_verified: true,
        tag_input: "",
        file: null,
      });
      setMaterialPages([
        {
          page_number: 1,
          page_title: "Unit 1: Foundations & Core Concepts",
          content_html: "## 1. Core Architectural Concepts\n- **Definition**: Theoretical Foundations And Analytical Models.\n- **Complexity**: $O(N \\log N)$ asymptotic bounds.\n\n```python\n# Implementation Sample\ndef compute_solution(data):\n    return sorted(data)\n```",
        },
      ]);
      setActivePageIndex(0);
      loadAdminData();
    } catch (err: any) {
      toast.error(toTitleCase(err.message || "Failed To Save Material."));
    } finally {
      setIsUploadingMaterial(false);
      setUploadStage("IDLE");
      setUploadProgress(0);
    }
  };

  const handleSaveLab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const filteredViva = vivaList.filter((v) => v.question.trim() || v.answer.trim());
      const payload = {
        subject: newLab.subject || selectedSubjectId,
        experiment_number: Number(newLab.experiment_number) || 1,
        title: newLab.title.trim(),
        aim: newLab.aim.trim() || "Verified Practical Laboratory Experiment",
        code_snippets: labCodes.reduce((acc, curr) => ({ ...acc, [curr.lang.toLowerCase()]: curr.code }), {}),
        viva_questions: filteredViva.length > 0 ? filteredViva : [
          { question: "Explain the Algorithmic Working Principle and Edge Cases.", answer: "The Procedure Utilizes Standard Recursive/Iterative State Traversal." },
        ],
      };

      if (editingLabId) {
        await apiFetch(`/academic/admin/labs/${editingLabId}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Practical Lab Experiment & Viva Drills Updated.");
      } else {
        await apiFetch("/academic/admin/labs/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Practical Lab Experiment & Viva Drills Published.");
      }
      setShowLabModal(false);
      setEditingLabId(null);
      setNewLab({
        subject: selectedSubjectId || "",
        experiment_number: 1,
        title: "",
        aim: "",
      });
      setLabCodes([{ lang: "python", code: "" }]);
      setVivaList([
        { question: "What Is the Computational Complexity of This Algorithmic Procedure?", answer: "Time Complexity Is O(V+E) and Auxiliary Space Complexity Is O(V)." },
      ]);
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save lab experiment.");
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newAssignment,
        subject: newAssignment.subject || selectedSubjectId,
      };
      if (editingAssignmentId) {
        await apiFetch(`/assignments/admin/assignments/${editingAssignmentId}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Course Assignment Updated Successfully.");
      } else {
        await apiFetch("/assignments/admin/assignments/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Course Assignment Broadcasted to Students.");
      }
      setShowAssignmentModal(false);
      setEditingAssignmentId(null);
      setNewAssignment({
        subject: selectedSubjectId || "",
        title: "",
        description: "",
        due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        total_marks: 20,
        weightage_percentage: 10,
      });
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save assignment.");
    }
  };

  const handleSaveTimetableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTimetableId) {
        await apiFetch(`/planner/admin/timetable/${editingTimetableId}/`, {
          method: "PATCH",
          body: JSON.stringify(newTimetableSlot),
        });
        toast.success("Timetable Lecture Slot Updated.");
      } else {
        await apiFetch("/planner/admin/timetable/", {
          method: "POST",
          body: JSON.stringify(newTimetableSlot),
        });
        toast.success("Timetable Lecture Slot Added.");
      }
      setShowTimetableModal(false);
      setEditingTimetableId(null);
      setNewTimetableSlot({
        semester: selectedSemester || 1,
        section: sections.find((s) => s.id === selectedSectionId)?.section || "A",
        day_of_week: "Mon",
        start_time: "09:00",
        end_time: "10:30",
        title: "",
        subject: selectedSubjectId || "",
        room_number: "LT-01",
        faculty_name: "",
        event_type: "Class",
        tone: "green",
      });
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save timetable slot.");
    }
  };

  const handleDeleteAllTimetable = async () => {
    try {
      setIsDeletingAllTimetable(true);
      if (deleteAllScope === "all") {
        if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") {
          toast.error("Please Type 'DELETE' To Confirm Purging The Entire Timetable.");
          setIsDeletingAllTimetable(false);
          return;
        }
        await apiFetch("/planner/admin/timetable/bulk-delete/", {
          method: "POST",
          body: JSON.stringify({ purge_all: true }),
        });
        toast.success("Entire Timetable Database Purged Successfully.");
      } else {
        if (filteredTimetableSlots.length === 0) {
          toast.error("No Timetable Slots Match The Current Filter.");
          setIsDeletingAllTimetable(false);
          return;
        }
        const targetSec = sections.find((s) => s.id === selectedSectionId);
        const targetSecCode = targetSec?.section || targetSec?.section_name || "";
        const payload: { semester?: number; section?: string; day_of_week?: string; ids?: string[] } = {};
        if (selectedSemester) payload.semester = selectedSemester;
        if (targetSecCode) payload.section = targetSecCode;
        if (selectedTimetableDay && selectedTimetableDay !== "All") payload.day_of_week = selectedTimetableDay;
        payload.ids = filteredTimetableSlots.map((s) => s.id);

        await apiFetch("/planner/admin/timetable/bulk-delete/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success(`Successfully Deleted ${filteredTimetableSlots.length} Filtered Timetable Slots.`);
      }
      setShowDeleteAllTimetableModal(false);
      setDeleteConfirmationText("");
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed To Delete Timetable Slots.");
    } finally {
      setIsDeletingAllTimetable(false);
    }
  };

  const handleAiPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please Upload A Valid Timetable Image (PNG, JPG, WEBP).");
      return;
    }
    setAiTimetableFileName(file.name);
    setAiTimetableMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAiTimetableImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleConsumeTimetablePhotoWithAi = async () => {
    if (!aiTimetableImage) {
      toast.error("Please Upload Or Capture A Timetable Schedule Photo.");
      return;
    }
    try {
      setAiExtracting(true);
      if (aiGeminiKey.trim()) {
        localStorage.setItem("nimswallah_gemini_key", aiGeminiKey.trim());
      }
      const targetSec = aiTargetSection || sections.find((s) => s.id === selectedSectionId)?.section || sections[0]?.section || "A";
      const res = await apiFetch<{
        success: boolean;
        slots: Array<any>;
        count: number;
        summary?: string;
        model_used?: string;
      }>("/planner/admin/timetable/ai-photo-consume/", {
        method: "POST",
        body: JSON.stringify({
          image: aiTimetableImage,
          mime_type: aiTimetableMime,
          semester: aiTargetSemester || selectedSemester || 1,
          section: targetSec,
          gemini_api_key: aiGeminiKey.trim(),
        }),
      });

      if (res.slots && res.slots.length > 0) {
        setAiExtractedSlots(res.slots);
        toast.success(res.summary || `Extracted ${res.slots.length} Timetable Slots With Gemini AI!`);
      } else {
        toast.error("No Schedule Slots Could Be Extracted From The Provided Image. Try A Clearer Photo.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed To Consume Timetable Photo With Gemini AI.");
    } finally {
      setAiExtracting(false);
    }
  };

  const handleSaveAiExtractedSlots = async () => {
    if (aiExtractedSlots.length === 0) {
      toast.error("No Timetable Slots To Save.");
      return;
    }
    try {
      setIsSavingAiSlots(true);
      const res = await apiFetch<{ success: boolean; created_count: number }>("/planner/admin/timetable/bulk-create/", {
        method: "POST",
        body: JSON.stringify({ slots: aiExtractedSlots }),
      });
      toast.success(`Successfully Imported ${res.created_count || aiExtractedSlots.length} Timetable Slots!`);
      setShowAiTimetableModal(false);
      setAiTimetableImage(null);
      setAiExtractedSlots([]);
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed To Save Extracted Timetable Slots.");
    } finally {
      setIsSavingAiSlots(false);
    }
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMilestoneId) {
        await apiFetch(`/planner/admin/milestones/${editingMilestoneId}/`, {
          method: "PATCH",
          body: JSON.stringify(newMilestone),
        });
        toast.success("Exam Milestone Countdown Updated Live.");
      } else {
        await apiFetch("/planner/admin/milestones/", {
          method: "POST",
          body: JSON.stringify(newMilestone),
        });
        toast.success("Exam Milestone Countdown Added Live.");
      }
      setShowMilestoneModal(false);
      setEditingMilestoneId(null);
      setNewMilestone({
        title: "",
        target_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        category: "Mid-Semester Theory Exams",
        semester: selectedSemester || 1,
        tag: "Term 1",
      });
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save milestone.");
    }
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isBroadcast = Boolean(newNotice.is_broadcast_all);
      const payload = {
        title: newNotice.title.trim(),
        content: newNotice.content.trim(),
        category: newNotice.category,
        priority: newNotice.priority,
        department: isBroadcast ? null : (newNotice.department || selectedDeptId || null),
        program: isBroadcast ? null : (newNotice.program || selectedProgramId || null),
        target_semester: isBroadcast ? null : (newNotice.target_semester ? Number(newNotice.target_semester) : (selectedSemester || null)),
        target_section: isBroadcast ? "" : (newNotice.target_section || ""),
        is_broadcast_all: isBroadcast,
      };
      if (editingNoticeId) {
        await apiFetch(`/academic/admin/notices/${editingNoticeId}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Department Circular Updated Live.");
      } else {
        await apiFetch("/academic/admin/notices/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Department Circular Broadcasted Live.");
      }
      setShowNoticeModal(false);
      setEditingNoticeId(null);
      setNewNotice({
        title: "",
        content: "",
        category: "Examination",
        priority: "HIGH",
        department: "",
        program: "",
        target_semester: null,
        target_section: "",
        is_broadcast_all: true,
      });
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save notice.");
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBannerId) {
        await apiFetch(`/academic/admin/banners/${editingBannerId}/`, {
          method: "PATCH",
          body: JSON.stringify(newBanner),
        });
        toast.success("Broadcast Banner Updated Live.");
      } else {
        await apiFetch("/academic/admin/banners/", {
          method: "POST",
          body: JSON.stringify(newBanner),
        });
        toast.success("Broadcast Banner Published Live.");
      }
      setShowBannerModal(false);
      setEditingBannerId(null);
      setNewBanner({
        title: "",
        message: "",
        tag: "Announcement",
        variant: "emerald",
        target: "ALL",
        link_url: "",
        link_text: "Learn More",
        is_active: true,
        is_dismissible: true,
        priority: 10,
      });
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed To Save Banner.");
    }
  };

  const handleEditBanner = (banner: SiteBanner) => {
    setEditingBannerId(banner.id);
    setNewBanner({
      title: banner.title,
      message: banner.message || "",
      tag: banner.tag || "Announcement",
      variant: banner.variant || "emerald",
      target: banner.target || "ALL",
      link_url: banner.link_url || "",
      link_text: banner.link_text || "Learn More",
      is_active: banner.is_active,
      is_dismissible: banner.is_dismissible,
      priority: banner.priority || 10,
    });
    setBannerPreviewTab("write");
    setShowBannerModal(true);
  };

  const handleToggleBannerActive = async (banner: SiteBanner) => {
    try {
      await apiFetch(`/academic/admin/banners/${banner.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !banner.is_active }),
      });
      toast.success(`Banner is now ${!banner.is_active ? "Active & Broadcasting Live" : "Deactivated"}.`);
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed To Update Banner Status.");
    }
  };

  const handleDeleteItem = async (endpoint: string, id: string, name: string, callback: () => void) => {
    if (!confirm(`Are You Sure You Want To Delete "${name}"? This Action Is Permanent.`)) {
      return;
    }
    try {
      await apiFetch(`${endpoint}${id}/`, { method: "DELETE" });
      toast.success(`"${name}" Deleted Successfully.`);
      if (endpoint.includes("banners")) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
      callback();
    } catch (err: any) {
      toast.error(err.message || `Failed To Delete "${name}".`);
    }
  };

  const calculateDaysRemaining = (targetDate: string): string => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Completed";
    if (days === 0) return "Today!";
    return `${days} Days`;
  };

  // Reusable Cascading Context Selector Component
  const renderCascadingContextBar = (options: {
    showSection?: boolean;
    showSubject?: boolean;
  }) => (
    <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>Cascading Curriculum Context Selector</span>
        </div>
        {(selectedDeptId || selectedProgramId || selectedSubjectId || selectedSectionId) && (
          <button
            onClick={() => {
              setSelectedDeptId("");
              setSelectedProgramId("");
              setSelectedSectionId("");
              setSelectedSubjectId("");
            }}
            className="text-[0.65rem] font-bold text-muted-foreground hover:text-rose-500 cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className={cn(
        "grid gap-3 text-xs",
        options.showSection || options.showSubject
          ? "sm:grid-cols-2 lg:grid-cols-4"
          : "sm:grid-cols-3"
      )}>
        {/* 1. Department */}
        <div>
          <label className="block text-[0.65rem] font-bold text-muted-foreground uppercase mb-1">1. Department</label>
          <select
            value={selectedDeptId}
            onChange={(e) => {
              setSelectedDeptId(e.target.value);
              setSelectedProgramId("");
              setSelectedSectionId("");
              setSelectedSubjectId("");
            }}
            className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>

        {/* 2. Specialization */}
        <div>
          <label className="block text-[0.65rem] font-bold text-muted-foreground uppercase mb-1">2. Specialization</label>
          <select
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setSelectedSectionId("");
              setSelectedSubjectId("");
            }}
            className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Specializations</option>
            {filteredPrograms.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>
        </div>

        {/* 3. Semester */}
        <div>
          <label className="block text-[0.65rem] font-bold text-muted-foreground uppercase mb-1">3. Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(Number(e.target.value));
              setSelectedSectionId("");
              setSelectedSubjectId("");
            }}
            className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        {/* 4A. Section (For Timetable) */}
        {options.showSection && (
          <div>
            <label className="block text-[0.65rem] font-bold text-muted-foreground uppercase mb-1">4. Section Cohort</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All Sections ({filteredSections.length})</option>
              {filteredSections.map((sec) => (
                <option key={sec.id} value={sec.id}>Section {sec.section} ({sec.academic_year})</option>
              ))}
            </select>
          </div>
        )}

        {/* 4B. Active Subject (For Publishing & Assignments) */}
        {options.showSubject && (
          <div>
            <label className="block text-[0.65rem] font-bold text-muted-foreground uppercase mb-1">4. Active Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">All Filtered Subjects ({filteredSubjects.length})</option>
              {filteredSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.code}: {sub.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* ===================== Mobile Drawer ===================== */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs">
          <div className="flex h-full w-[85vw] max-w-xs flex-col justify-between bg-card p-4 xs:p-5 shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="/NIMSWallah.png"
                    onError={(e) => {
                      e.currentTarget.src = "/favicon.png";
                    }}
                    alt="NimsWallah Logo"
                    className="h-7 w-7 object-contain shrink-0"
                  />
                  <span className="font-bold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent truncate">
                    NimsWallah Admin
                  </span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-xl p-1.5 hover:bg-surface text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Station Navigation List */}
              <nav className="mt-4 space-y-1">
                {[
                  { id: "overview", label: "Executive Overview", icon: LayoutDashboard, count: "Live" },
                  { id: "structure", label: "Academic Blueprint", icon: Building2, count: departments.length },
                  { id: "publisher", label: "Publishing Studio", icon: Upload, count: materials.length + labs.length },
                  { id: "timetable", label: "Timetable Grid", icon: Clock, count: timetableSlots.length },
                  { id: "assignments", label: "Course Assignments", icon: FileText, count: assignments.length },
                  { id: "notices", label: "Notice Dispatcher", icon: Megaphone, count: notices.length },
                  { id: "milestones", label: "Exam Milestones", icon: Calendar, count: milestones.length },
                  { id: "students", label: "Student Registry", icon: Users, count: students.length },
                  { id: "banners", label: "Broadcast Banners", icon: Radio, count: banners.filter((b) => b.is_active).length },
                  { id: "badges", label: "Navigation Badges", icon: Sparkles, count: badges.filter((b) => b.is_active && b.badge_text).length },
                  { id: "support", label: "Support Desk", icon: HelpCircle, count: tickets.length },
                  { id: "forum", label: "Community Forum", icon: MessageSquare, count: posts.length },
                ].map((station) => {
                  const Icon = station.icon;
                  const isActive = activeStation === station.id;
                  return (
                    <button
                      key={station.id}
                      onClick={() => {
                        setActiveStation(station.id as AdminStation);
                        setMobileNavOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-all",
                        isActive
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/25"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{station.label}</span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.65rem] font-mono font-bold shrink-0",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {station.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out Of Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Desktop Admin Sidebar ===================== */}
      <aside
        className={cn(
          "hidden lg:flex flex-col justify-between border-r border-border/80 bg-card/85 p-3.5 backdrop-blur-xl shrink-0 shadow-sm transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-64 lg:w-72"
        )}
      >
        <div>
          {/* Brand Logo & Title */}
          <div className={cn("flex items-center", sidebarCollapsed ? "px-1 justify-center" : "px-2 py-1.5")}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src="/NIMSWallah.png"
                  onError={(e) => {
                    e.currentTarget.src = "/favicon.png";
                  }}
                  alt="NimsWallah Logo"
                  className="h-9 w-9 object-contain drop-shadow-md"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500 shadow-xs" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h2 className="font-display text-base font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent truncate">
                    NimsWallah
                  </h2>
                  <p className="text-[0.62rem] font-bold text-muted-foreground uppercase tracking-widest truncate">
                    Academic Command
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Controller Quick Card */}
          <div
            className={cn(
              "mt-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/5 via-surface/80 to-teal-500/5 shadow-2xs transition-all",
              sidebarCollapsed ? "p-2 text-center" : "p-3"
            )}
          >
            <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-3")}>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-xs shrink-0">
                <span>AD</span>
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {user?.full_name || "Academic Controller"}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.6rem] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Master Admin</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Station Navigation List */}
          <nav className="mt-4 space-y-1">
            {[
              { id: "overview", label: "Executive Overview", icon: LayoutDashboard, count: "Live" },
              { id: "structure", label: "Academic Blueprint", icon: Building2, count: departments.length },
              { id: "publisher", label: "Publishing Studio", icon: Upload, count: materials.length + labs.length },
              { id: "timetable", label: "Timetable Grid", icon: Clock, count: timetableSlots.length },
              { id: "assignments", label: "Course Assignments", icon: FileText, count: assignments.length },
              { id: "notices", label: "Notice Dispatcher", icon: Megaphone, count: notices.length },
              { id: "milestones", label: "Exam Milestones", icon: Calendar, count: milestones.length },
              { id: "students", label: "Student Registry", icon: Users, count: students.length },
              { id: "banners", label: "Broadcast Banners", icon: Radio, count: banners.filter((b) => b.is_active).length },
              { id: "badges", label: "Navigation Badges", icon: Sparkles, count: badges.filter((b) => b.is_active && b.badge_text).length },
              { id: "support", label: "Support Desk", icon: HelpCircle, count: tickets.length },
              { id: "forum", label: "Community Forum", icon: MessageSquare, count: posts.length },
            ].map((station) => {
              const Icon = station.icon;
              const isActive = activeStation === station.id;
              return (
                <button
                  key={station.id}
                  onClick={() => setActiveStation(station.id as AdminStation)}
                  title={sidebarCollapsed ? `${station.label} (${station.count})` : undefined}
                  className={cn(
                    "flex w-full items-center rounded-2xl cursor-pointer transition-all active:scale-[0.98]",
                    sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5 text-xs font-semibold",
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/25"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{station.label}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[0.65rem] font-mono font-bold shrink-0",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {station.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-border/80 pt-3">
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            title={sidebarCollapsed ? "Sign Out Of Workspace" : undefined}
            className={cn(
              "flex w-full items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all active:scale-95 shadow-2xs",
              sidebarCollapsed ? "p-2.5" : "gap-2 p-2.5"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out Of Workspace</span>}
          </button>
        </div>
      </aside>

      {/* ===================== Main Workspace ===================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-card/85 px-3 xs:px-4 sm:px-6 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 xs:gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="grid h-8 w-8 xs:h-9 xs:w-9 place-items-center rounded-xl border border-border bg-surface text-foreground lg:hidden cursor-pointer shrink-0"
            >
              <Menu className="h-4 w-4 xs:h-5 xs:w-5" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="hidden lg:grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-foreground hover:bg-card cursor-pointer transition-colors shrink-0"
              title={sidebarCollapsed ? "Expand Sidebar (Desktop)" : "Collapse Sidebar (Desktop)"}
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="font-display text-xs xs:text-sm sm:text-lg font-bold text-foreground truncate">
              {activeStation === "overview" && (
                <>
                  <span className="sm:hidden">Executive Overview</span>
                  <span className="hidden sm:inline">Executive Overview &amp; Academic Intelligence Command</span>
                </>
              )}
              {activeStation === "structure" && (
                <>
                  <span className="sm:hidden">Academic Blueprint</span>
                  <span className="hidden sm:inline">Academic Blueprint &amp; Infrastructure Matrix</span>
                </>
              )}
              {activeStation === "publisher" && (
                <>
                  <span className="sm:hidden">Publishing Studio</span>
                  <span className="hidden sm:inline">Unified Cascading Publishing Studio</span>
                </>
              )}
              {activeStation === "timetable" && (
                <>
                  <span className="sm:hidden">Timetable Grid</span>
                  <span className="hidden sm:inline">Section Timetable &amp; Lecture Schedule Matrix</span>
                </>
              )}
              {activeStation === "assignments" && (
                <>
                  <span className="sm:hidden">Course Assignments</span>
                  <span className="hidden sm:inline">Academic Assignments &amp; Submission Rubrics</span>
                </>
              )}
              {activeStation === "notices" && (
                <>
                  <span className="sm:hidden">Notice Dispatcher</span>
                  <span className="hidden sm:inline">Official Circular Dispatcher</span>
                </>
              )}
              {activeStation === "milestones" && (
                <>
                  <span className="sm:hidden">Exam Milestones</span>
                  <span className="hidden sm:inline">Examination Milestones Countdown</span>
                </>
              )}
              {activeStation === "students" && (
                <>
                  <span className="sm:hidden">Student Registry</span>
                  <span className="hidden sm:inline">Active Student Registry &amp; User Base</span>
                </>
              )}
              {activeStation === "banners" && (
                <>
                  <span className="sm:hidden">Broadcast Banners</span>
                  <span className="hidden sm:inline">Announcement &amp; Promotional Broadcast Banners</span>
                </>
              )}
              {activeStation === "badges" && (
                <>
                  <span className="sm:hidden">Navigation Badges</span>
                  <span className="hidden sm:inline">Sidebar Dynamic Badges Matrix</span>
                </>
              )}
              {activeStation === "support" && (
                <>
                  <span className="sm:hidden">Support Desk</span>
                  <span className="hidden sm:inline">Student Support Desk &amp; Query Resolution</span>
                </>
              )}
              {activeStation === "forum" && (
                <>
                  <span className="sm:hidden">Community Forum</span>
                  <span className="hidden sm:inline">Community Forum Moderation Hub</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-8 w-8 xs:h-9 xs:w-9 rounded-xl xs:rounded-2xl border border-border bg-surface text-foreground hover:bg-card cursor-pointer transition-all shadow-2xs shrink-0"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            <button
              onClick={loadAdminData}
              className="inline-flex items-center gap-1.5 xs:gap-2 rounded-xl xs:rounded-2xl border border-border bg-surface px-2.5 xs:px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all shadow-2xs shrink-0"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              <span className="hidden xs:inline">Refresh Data</span>
            </button>
          </div>
        </header>

        {/* Station Body Canvas */}
        <div className="flex-1 overflow-y-auto p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
          {/* ========================================================================= */}
          {/* STATION 0: EXECUTIVE COMMAND CENTER & HOME ANALYTICS */}
          {/* ========================================================================= */}
          {activeStation === "overview" && (
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* Executive Welcome Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/25 dark:border-border/80 bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-teal-500/10 dark:from-emerald-500/15 dark:via-card dark:to-teal-500/10 p-5 sm:p-7 shadow-xs backdrop-blur-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 font-mono whitespace-nowrap shadow-2xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Institutional Master Command</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 dark:bg-surface/90 border border-border px-3 py-1 text-xs font-mono text-slate-700 dark:text-muted-foreground whitespace-nowrap shadow-2xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Telemetry Synced</span>
                      </span>
                    </div>

                    <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                      Academic Intelligence &amp; Operations Command
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
                      Real-Time Institutional Oversight Across Student Authentication, Forensic DRM Security, Courseware Publishing, And Timetable Orchestration.
                    </p>
                  </div>

                  {/* Top Action Quick Buttons */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 pt-1 sm:pt-0">
                    <button
                      onClick={() => setActiveStation("publisher")}
                      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Publish Material</span>
                    </button>
                    <button
                      onClick={() => setActiveStation("structure")}
                      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-surface cursor-pointer transition-all shadow-2xs active:scale-95 whitespace-nowrap"
                    >
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>Curriculum Matrix</span>
                    </button>
                    <button
                      onClick={() => setActiveStation("notices")}
                      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-surface cursor-pointer transition-all shadow-2xs active:scale-95 whitespace-nowrap col-span-2 sm:col-span-1"
                    >
                      <Megaphone className="h-4 w-4 text-amber-500" />
                      <span>Broadcast Circular</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Executive KPI Metric Cards (2x2 on Mobile, 4x1 on Desktop) */}
              <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4 min-w-0">
                {/* 1. Scholars Metric */}
                <div
                  onClick={() => setActiveStation("students")}
                  className="rounded-2xl sm:rounded-3xl border border-border/90 bg-card p-3 sm:p-5 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group space-y-2 sm:space-y-3 min-w-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl sm:rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 text-[0.58rem] sm:text-[0.65rem] font-bold text-emerald-800 dark:text-emerald-300 truncate shrink-0 shadow-2xs">
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="truncate">Live Sync</span>
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-foreground font-mono truncate">
                      {students.length || 1}
                    </h3>
                    <p className="text-[0.68rem] sm:text-xs text-muted-foreground font-semibold mt-0.5 truncate">
                      Enrolled Scholars
                    </p>
                  </div>
                  <div className="text-[0.6rem] sm:text-[0.68rem] text-muted-foreground pt-1.5 sm:pt-2 border-t border-border/80 flex items-center justify-between font-mono gap-1 min-w-0">
                    <span className="truncate">DRM Security</span>
                    <span className="font-bold text-foreground shrink-0">{students.length || 1} Verified</span>
                  </div>
                </div>

                {/* 2. Courseware Vault Metric */}
                <div
                  onClick={() => setActiveStation("publisher")}
                  className="rounded-2xl sm:rounded-3xl border border-border/90 bg-card p-3 sm:p-5 shadow-xs hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer group space-y-2 sm:space-y-3 min-w-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl sm:rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 px-1.5 sm:px-2 py-0.5 text-[0.58rem] sm:text-[0.65rem] font-bold text-cyan-800 dark:text-cyan-300 truncate shrink-0 shadow-2xs">
                      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-cyan-600 dark:text-cyan-400" />
                      <span className="truncate">{materials.length + labs.length} Units</span>
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-foreground font-mono truncate">
                      {materials.length + labs.length}
                    </h3>
                    <p className="text-[0.68rem] sm:text-xs text-muted-foreground font-semibold mt-0.5 truncate">
                      Study Materials
                    </p>
                  </div>
                  <div className="text-[0.6rem] sm:text-[0.68rem] text-muted-foreground pt-1.5 sm:pt-2 border-t border-border/80 flex items-center justify-between font-mono gap-1 min-w-0">
                    <span className="truncate">Vault</span>
                    <span className="font-bold text-cyan-700 dark:text-cyan-400 shrink-0">
                      {materials.filter(m => m.material_type === "NOTES").length} Notes · {labs.length} Labs
                    </span>
                  </div>
                </div>

                {/* 3. Academic Structure Metric */}
                <div
                  onClick={() => setActiveStation("structure")}
                  className="rounded-2xl sm:rounded-3xl border border-border/90 bg-card p-3 sm:p-5 shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer group space-y-2 sm:space-y-3 min-w-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl sm:rounded-2xl bg-purple-500/10 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 px-1.5 sm:px-2 py-0.5 text-[0.58rem] sm:text-[0.65rem] font-bold text-purple-800 dark:text-purple-300 truncate shrink-0 shadow-2xs">
                      <span className="truncate">{programs.length} Branches</span>
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-foreground font-mono truncate">
                      {subjects.length}
                    </h3>
                    <p className="text-[0.68rem] sm:text-xs text-muted-foreground font-semibold mt-0.5 truncate">
                      Course Modules
                    </p>
                  </div>
                  <div className="text-[0.6rem] sm:text-[0.68rem] text-muted-foreground pt-1.5 sm:pt-2 border-t border-border/80 flex items-center justify-between font-mono gap-1 min-w-0">
                    <span className="truncate">Blueprint</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400 shrink-0">
                      {departments.length} Depts Active
                    </span>
                  </div>
                </div>

                {/* 4. Timetable & Schedule Density */}
                <div
                  onClick={() => setActiveStation("timetable")}
                  className="rounded-2xl sm:rounded-3xl border border-border/90 bg-card p-3 sm:p-5 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group space-y-2 sm:space-y-3 min-w-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-1 min-w-0">
                    <div className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-xl sm:rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 px-1.5 sm:px-2 py-0.5 text-[0.58rem] sm:text-[0.65rem] font-bold text-amber-800 dark:text-amber-300 truncate shrink-0 shadow-2xs">
                      <span className="truncate">6-Day Grid</span>
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-foreground font-mono truncate">
                      {timetableSlots.length}
                    </h3>
                    <p className="text-[0.68rem] sm:text-xs text-muted-foreground font-semibold mt-0.5 truncate">
                      Weekly Periods
                    </p>
                  </div>
                  <div className="text-[0.6rem] sm:text-[0.68rem] text-muted-foreground pt-1.5 sm:pt-2 border-t border-border/80 flex items-center justify-between font-mono gap-1 min-w-0">
                    <span className="truncate">Sections</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">
                      {sections.length} Cohorts
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Charts Canvas Section */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-12 min-w-0">
                {/* Chart 1: Study Materials by Category (7 Cols) */}
                <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/80 pb-3 gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="font-display font-bold text-xs sm:text-base text-foreground flex items-center gap-1.5 sm:gap-2 truncate">
                          <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                          <span className="truncate">Uploaded Study Materials By Category</span>
                        </h3>
                        <p className="text-[0.68rem] sm:text-xs text-muted-foreground truncate">
                          Live Count Of Active PDFs, Notes &amp; Solved Papers Across All {subjects.length} Courses
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 shrink-0 whitespace-nowrap">
                        {materials.length + labs.length} Total Uploads
                      </span>
                    </div>

                    {/* Bar Chart Container */}
                    <div className="h-56 sm:h-64 w-full pt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: "Lecture Notes", shortName: "Notes", count: materials.filter((m) => m.material_type === "NOTES").length, color: "#10b981", grad: "url(#barGradEmerald)" },
                            { name: "Solved PYQs", shortName: "PYQs", count: materials.filter((m) => m.material_type === "SOLVED_PYQ").length, color: "#8b5cf6", grad: "url(#barGradPurple)" },
                            { name: "Syllabus Maps", shortName: "Syllabus", count: materials.filter((m) => m.material_type === "SYLLABUS").length, color: "#06b6d4", grad: "url(#barGradCyan)" },
                            { name: "Lab Manuals", shortName: "Labs", count: labs.length, color: "#f59e0b", grad: "url(#barGradAmber)" },
                            { name: "Faculty Banks", shortName: "Faculty", count: materials.filter((m) => m.material_type === "FACULTY").length, color: "#ec4899", grad: "url(#barGradRose)" },
                          ]}
                          margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                          barSize={36}
                        >
                          <defs>
                            <linearGradient id="barGradEmerald" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                              <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
                            </linearGradient>
                            <linearGradient id="barGradPurple" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                              <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.85} />
                            </linearGradient>
                            <linearGradient id="barGradCyan" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                              <stop offset="100%" stopColor="#0891b2" stopOpacity={0.85} />
                            </linearGradient>
                            <linearGradient id="barGradAmber" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                              <stop offset="100%" stopColor="#d97706" stopOpacity={0.85} />
                            </linearGradient>
                            <linearGradient id="barGradRose" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity={1} />
                              <stop offset="100%" stopColor="#db2777" stopOpacity={0.85} />
                            </linearGradient>
                          </defs>

                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="currentColor" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fontWeight: 700, fill: "currentColor" }}
                            className="text-slate-800 dark:text-slate-200"
                            tickLine={false}
                            axisLine={{ stroke: "currentColor", opacity: 0.2 }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "currentColor" }}
                            className="text-slate-500 dark:text-muted-foreground"
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: "currentColor", opacity: 0.05, radius: 8 }}
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length > 0 && payload[0]?.payload) {
                                const data = payload[0].payload;
                                return (
                                  <div className="rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-md space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
                                      <span className="text-xs font-bold text-foreground">{data.name}</span>
                                    </div>
                                    <div className="text-base font-extrabold font-mono" style={{ color: data.color }}>
                                      {data.count} <span className="text-xs font-normal text-muted-foreground font-sans">Uploaded Files</span>
                                    </div>
                                    <span className="text-[0.65rem] text-muted-foreground block">
                                      {data.count > 0 ? "Live in Student Portal" : "Awaiting Admin Upload"}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="count"
                            radius={[8, 8, 2, 2]}
                          >
                            {[
                              { fill: "url(#barGradEmerald)" },
                              { fill: "url(#barGradPurple)" },
                              { fill: "url(#barGradCyan)" },
                              { fill: "url(#barGradAmber)" },
                              { fill: "url(#barGradRose)" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* High-Contrast Category Count Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-3 border-t border-border/80">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300/80 dark:border-emerald-500/25 text-center shadow-2xs">
                      <span className="text-[0.62rem] text-emerald-900 dark:text-emerald-300 font-extrabold uppercase block">Notes</span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{materials.filter((m) => m.material_type === "NOTES").length}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-300/80 dark:border-purple-500/25 text-center shadow-2xs">
                      <span className="text-[0.62rem] text-purple-900 dark:text-purple-300 font-extrabold uppercase block">PYQs</span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{materials.filter((m) => m.material_type === "SOLVED_PYQ").length}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300/80 dark:border-cyan-500/25 text-center shadow-2xs">
                      <span className="text-[0.62rem] text-cyan-900 dark:text-cyan-300 font-extrabold uppercase block">Syllabus</span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{materials.filter((m) => m.material_type === "SYLLABUS").length}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300/80 dark:border-amber-500/25 text-center shadow-2xs">
                      <span className="text-[0.62rem] text-amber-900 dark:text-amber-300 font-extrabold uppercase block">Labs</span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{labs.length}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-500/10 border border-pink-300/80 dark:border-pink-500/25 text-center col-span-2 sm:col-span-1 shadow-2xs">
                      <span className="text-[0.62rem] text-pink-900 dark:text-pink-300 font-extrabold uppercase block">Faculty</span>
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{materials.filter((m) => m.material_type === "FACULTY").length}</span>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Degree Program Breakdown (5 Cols) */}
                <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/80 pb-3">
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="font-display font-bold text-xs sm:text-base text-foreground flex items-center gap-1.5 sm:gap-2 truncate">
                          <GraduationCap className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span className="truncate">Degree Specializations</span>
                        </h3>
                        <p className="text-[0.68rem] sm:text-xs text-muted-foreground truncate">
                          Active Degree Programs Configured In Blueprint
                        </p>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-mono font-bold text-cyan-800 dark:text-cyan-300 shrink-0 whitespace-nowrap">
                        {programs.length} Programs
                      </span>
                    </div>

                    {/* Donut Chart with Center Metric */}
                    <div className="relative h-48 sm:h-56 w-full flex items-center justify-center mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <linearGradient id="pieGrad0" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                            <linearGradient id="pieGrad1" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#0284c7" />
                            </linearGradient>
                            <linearGradient id="pieGrad2" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#6d28d9" />
                            </linearGradient>
                            <linearGradient id="pieGrad3" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                            <linearGradient id="pieGrad4" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#ec4899" />
                              <stop offset="100%" stopColor="#db2777" />
                            </linearGradient>
                          </defs>

                          <Pie
                            data={
                              programs.length > 0
                                ? programs.map((p, idx) => {
                                    const fills = ["url(#pieGrad0)", "url(#pieGrad1)", "url(#pieGrad2)", "url(#pieGrad3)", "url(#pieGrad4)"];
                                    const rawColors = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899"];
                                    return {
                                      name: p.name || p.code,
                                      shortCode: p.code || p.name,
                                      value: subjects.filter((s) => s.program_codes?.includes(p.code) || s.department === p.department).length || 1,
                                      fill: fills[idx % fills.length],
                                      color: rawColors[idx % rawColors.length],
                                    };
                                  })
                                : [{ name: "Artificial Intelligence & Data Science", shortCode: "B.Tech AI & ML", value: 8, fill: "url(#pieGrad0)", color: "#10b981" }]
                            }
                            innerRadius={52}
                            outerRadius={78}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="var(--color-card, #ffffff)"
                            strokeWidth={3}
                          >
                            {(programs.length > 0 ? programs : [{ name: "AI & ML" }]).map((_, index: number) => {
                              const fills = ["url(#pieGrad0)", "url(#pieGrad1)", "url(#pieGrad2)", "url(#pieGrad3)", "url(#pieGrad4)"];
                              return <Cell key={`cell-${index}`} fill={fills[index % fills.length]} />;
                            })}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length > 0 && payload[0]?.payload) {
                                const data = payload[0].payload;
                                return (
                                  <div className="rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-md space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
                                      <span className="text-xs font-bold text-foreground">{data.name}</span>
                                    </div>
                                    <div className="text-sm font-extrabold font-mono" style={{ color: data.color }}>
                                      {data.value} Enrolled Courses
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Central Metric in Donut Hole */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="font-display font-black text-2xl text-foreground font-mono">
                          {subjects.length}
                        </span>
                        <span className="text-[0.62rem] font-bold text-muted-foreground uppercase tracking-wider">
                          Courses
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Program Breakdown Cards */}
                  <div className="space-y-1.5 pt-2 border-t border-border/80">
                    {programs.slice(0, 3).map((p, idx) => {
                      const colors = ["bg-emerald-500", "bg-cyan-500", "bg-purple-500", "bg-amber-500", "bg-pink-500"];
                      const modCount = subjects.filter((s) => s.program_codes?.includes(p.code) || s.department === p.department).length || 0;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-3 py-2 rounded-2xl bg-surface/80 dark:bg-surface/60 border border-border/80 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn("h-2.5 w-2.5 rounded-full shrink-0 shadow-xs", colors[idx % colors.length])} />
                            <span className="font-bold text-foreground truncate">{p.name || p.code}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-card dark:bg-surface px-2 py-0.5 rounded-lg border border-border/60 shrink-0 text-xs">
                            {modCount} Courses
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 2 Analytics Charts: Timetable Schedule & DRM Security Matrix */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-12 min-w-0">
                {/* Chart 3: Weekly Class Schedule (7 Cols) */}
                <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/80 pb-3 gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="font-display font-bold text-xs sm:text-base text-foreground flex items-center gap-1.5 sm:gap-2 truncate">
                          <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span className="truncate">Weekly Class Schedule (Periods Per Day)</span>
                        </h3>
                        <p className="text-[0.68rem] sm:text-xs text-muted-foreground truncate">
                          Total Active Lecture Slots Scheduled Across All {sections.length} Student Cohorts (Mon – Sat)
                        </p>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-mono font-bold text-cyan-800 dark:text-cyan-300 shrink-0 whitespace-nowrap">
                        {timetableSlots.length} Periods / Week
                      </span>
                    </div>

                    <div className="h-56 sm:h-64 w-full pt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={weeklyScheduleData}
                          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="areaGradPeriods" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="currentColor" />
                          <XAxis
                            dataKey="shortDay"
                            tick={{ fontSize: 11, fontWeight: 700, fill: "currentColor" }}
                            className="text-slate-800 dark:text-slate-200"
                            tickLine={false}
                            axisLine={{ stroke: "currentColor", opacity: 0.2 }}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "currentColor" }}
                            className="text-slate-500 dark:text-muted-foreground"
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            cursor={{ stroke: "#06b6d4", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length > 0 && payload[0]?.payload) {
                                const d = payload[0].payload;
                                return (
                                  <div className="rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-md space-y-1.5">
                                    <span className="font-display font-bold text-xs text-foreground block border-b border-border/60 pb-1">
                                      {d.day} Class Load
                                    </span>
                                    <div className="flex items-center justify-between gap-4 text-xs font-mono">
                                      <span className="text-cyan-600 dark:text-cyan-400 font-bold">{d.periods} Scheduled Periods</span>
                                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{d.hours} Academic Hours</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="periods"
                            stroke="#0891b2"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#areaGradPeriods)"
                            dot={{ r: 4, fill: "#0891b2", strokeWidth: 2, stroke: "var(--color-card, #ffffff)" }}
                            activeDot={{ r: 6, fill: "#0891b2", stroke: "#ffffff", strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Summary Ticker */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/80 text-center">
                    <div className="p-2.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/25 shadow-2xs">
                      <span className="text-[0.62rem] uppercase font-extrabold text-cyan-900 dark:text-cyan-300 block">Peak Load Day</span>
                      <span className="font-mono font-black text-xs text-cyan-800 dark:text-cyan-400 mt-0.5 block truncate">
                        {peakScheduleDay}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 shadow-2xs">
                      <span className="text-[0.62rem] uppercase font-extrabold text-emerald-900 dark:text-emerald-300 block">Weekly Hours</span>
                      <span className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-400 mt-0.5 block truncate">
                        {totalWeeklyAcademicHours} Total Hours
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-purple-50/70 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/25 shadow-2xs">
                      <span className="text-[0.62rem] uppercase font-extrabold text-purple-900 dark:text-purple-300 block">Mapped Cohorts</span>
                      <span className="font-mono font-black text-xs text-purple-800 dark:text-purple-400 mt-0.5 block truncate">
                        {activeCohortsCount > 0 ? `${activeCohortsCount} Cohorts Mapped` : `${sections.length} Sections Active`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel 4: Forensic DRM Security & Document Protection Matrix (5 Cols) */}
                <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/80 pb-3 gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="font-display font-bold text-xs sm:text-base text-foreground flex items-center gap-1.5 sm:gap-2 truncate">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                          <span className="truncate">Forensic DRM Document Security</span>
                        </h3>
                        <p className="text-[0.68rem] sm:text-xs text-muted-foreground truncate">
                          Active Anti-Piracy Protection Across {materials.length + labs.length} Published Manuscripts
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 shrink-0 whitespace-nowrap">
                        100% DRM Armed
                      </span>
                    </div>

                    {/* 4 Real Live Security Telemetry Cards */}
                    <div className="space-y-2.5 py-2.5">
                      {/* 1. Dynamic Canvas Watermarking */}
                      <div className="rounded-2xl bg-surface/80 dark:bg-surface/60 p-3 border border-border/80 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                            <span className="font-bold text-foreground truncate">Dynamic Canvas Watermarking</span>
                          </div>
                          <span className="font-mono font-extrabold text-[0.68rem] text-emerald-800 dark:text-emerald-300 shrink-0">
                            Enforced
                          </span>
                        </div>
                        <p className="text-[0.65rem] text-muted-foreground leading-tight">
                          Encrypted Scholar Roll No + Client IP Hash stamped per rendered page
                        </p>
                      </div>

                      {/* 2. Anti-Exfiltration & Print Shield */}
                      <div className="rounded-2xl bg-surface/80 dark:bg-surface/60 p-3 border border-border/80 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 shrink-0" />
                            <span className="font-bold text-foreground truncate">Anti-Exfiltration &amp; Print Shield</span>
                          </div>
                          <span className="font-mono font-extrabold text-[0.68rem] text-cyan-800 dark:text-cyan-300 shrink-0">
                            Active
                          </span>
                        </div>
                        <p className="text-[0.65rem] text-muted-foreground leading-tight">
                          Right-click, screenshot keybinds, print &amp; devtools extraction blocked
                        </p>
                      </div>

                      {/* 3. Encrypted Documents Vault */}
                      <div className="rounded-2xl bg-surface/80 dark:bg-surface/60 p-3 border border-border/80 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
                            <span className="font-bold text-foreground truncate">Protected Course Vault</span>
                          </div>
                          <span className="font-mono font-extrabold text-[0.68rem] text-purple-800 dark:text-purple-300 shrink-0">
                            {materials.length + labs.length} Files
                          </span>
                        </div>
                        <p className="text-[0.65rem] text-muted-foreground leading-tight">
                          {materials.filter(m => m.material_type === "NOTES").length} Notes · {materials.filter(m => m.material_type === "SOLVED_PYQ").length} Solved PYQs · {labs.length + materials.filter(m => m.material_type === "LAB_MANUAL").length} Lab Manuals
                        </p>
                      </div>

                      {/* 4. Security Incident Telemetry */}
                      <div className="rounded-2xl bg-surface/80 dark:bg-surface/60 p-3 border border-border/80 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-bold text-foreground truncate">Incident Telemetry</span>
                          </div>
                          <span className="font-mono font-extrabold text-[0.68rem] text-emerald-800 dark:text-emerald-300 shrink-0">
                            {drmIncidents.length} Violations
                          </span>
                        </div>
                        <p className="text-[0.65rem] text-muted-foreground leading-tight">
                          All {students.length} enrolled scholars operating in verified DRM sessions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Security Footer */}
                  <div className="rounded-2xl bg-surface/90 dark:bg-surface/80 p-3 border border-border/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[0.7rem]">
                      <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Security Engine:</span>
                      <strong className="text-foreground font-mono">Dynamic WebGL DRM</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStation("students")}
                      className="text-[0.68rem] font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Manage Security</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATION 1: ACADEMIC BLUEPRINT */}
          {/* ========================================================================= */}
          {activeStation === "structure" && (
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* Executive Blueprint Header Summary Card */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/5 p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        Curriculum Architecture
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">Live Hierarchy</span>
                    </div>
                    <h2 className="font-display text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                      Academic Blueprint &amp; Infrastructure Matrix
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-xl">
                      Manage Institutional Departments, Degree Specializations, Student Cohort Sections, And Core Syllabus Modules.
                    </p>
                  </div>

                  {/* 4-Metric Live Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                    <div className="rounded-2xl border border-border/70 bg-surface/80 p-2.5 sm:p-3 text-center min-w-[85px]">
                      <span className="text-[0.62rem] uppercase font-bold text-muted-foreground block">Depts</span>
                      <span className="font-display font-extrabold text-base sm:text-lg text-emerald-600 dark:text-emerald-400 font-mono">
                        {departments.length}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-surface/80 p-2.5 sm:p-3 text-center min-w-[85px]">
                      <span className="text-[0.62rem] uppercase font-bold text-muted-foreground block">Programs</span>
                      <span className="font-display font-extrabold text-base sm:text-lg text-cyan-600 dark:text-cyan-400 font-mono">
                        {programs.length}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-surface/80 p-2.5 sm:p-3 text-center min-w-[85px]">
                      <span className="text-[0.62rem] uppercase font-bold text-muted-foreground block">Sections</span>
                      <span className="font-display font-extrabold text-base sm:text-lg text-purple-600 dark:text-purple-400 font-mono">
                        {sections.length}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-surface/80 p-2.5 sm:p-3 text-center min-w-[85px]">
                      <span className="text-[0.62rem] uppercase font-bold text-muted-foreground block">Modules</span>
                      <span className="font-display font-extrabold text-base sm:text-lg text-amber-600 dark:text-amber-400 font-mono">
                        {subjects.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Sub-Station Segmented Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 w-full">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 p-1.5 rounded-2xl sm:rounded-3xl bg-surface/80 border border-border/80 shadow-2xs flex-1">
                  <button
                    type="button"
                    onClick={() => setStructureSubTab("departments")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer min-w-0",
                      structureSubTab === "departments"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Departments</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      structureSubTab === "departments" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {departments.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStructureSubTab("programs")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer min-w-0",
                      structureSubTab === "programs"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Programs</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      structureSubTab === "programs" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {programs.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStructureSubTab("sections")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer min-w-0",
                      structureSubTab === "sections"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Sections</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      structureSubTab === "sections" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {sections.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStructureSubTab("subjects")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer min-w-0",
                      structureSubTab === "subjects"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Modules</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      structureSubTab === "subjects" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {subjects.length}
                    </span>
                  </button>
                </div>

                {/* Prominent Action Button */}
                <div className="flex justify-end shrink-0">
                  {structureSubTab === "departments" && (
                    <button
                      onClick={() => setShowDeptModal(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 cursor-pointer w-full sm:w-auto transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Department</span>
                    </button>
                  )}
                  {structureSubTab === "programs" && (
                    <button
                      onClick={() => {
                        setNewProgram({ ...newProgram, department: selectedDeptId || (departments[0]?.id || "") });
                        setShowProgramModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 cursor-pointer w-full sm:w-auto transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Specialization Program</span>
                    </button>
                  )}
                  {structureSubTab === "sections" && (
                    <button
                      onClick={() => {
                        setNewSection({ ...newSection, program: selectedProgramId || (programs[0]?.id || ""), semester: selectedSemester || 1 });
                        setShowSectionModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 cursor-pointer w-full sm:w-auto transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Section Cohort</span>
                    </button>
                  )}
                  {structureSubTab === "subjects" && (
                    <button
                      onClick={() => {
                        setEditingSubjectId(null);
                        setNewSubject({
                          programs: selectedProgramId ? [selectedProgramId] : (programs[0]?.id ? [programs[0].id] : []),
                          semester: selectedSemester || 1,
                          name: "",
                          code: "",
                          short_name: "",
                          faculty_name: "",
                          credits: 4,
                          syllabus_summary: "",
                        });
                        setShowSubjectModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 cursor-pointer w-full sm:w-auto transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Register Subject</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Departments Sub-View */}
              {structureSubTab === "departments" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {departments.length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Departments Created Yet</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Create Your First Academic Department (E.g. Department Of Computer Science &amp; Engineering).
                      </p>
                      <button
                        onClick={() => {
                          setEditingDeptId(null);
                          setNewDept({ name: "", code: "", description: "", head_of_department: "" });
                          setShowDeptModal(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Department Now</span>
                      </button>
                    </div>
                  ) : (
                    departments.map((dept) => {
                      const deptPrograms = programs.filter((p) => p.department === dept.id);
                      const deptSubjects = subjects.filter((s) => s.department === dept.id || deptPrograms.some(dp => s.program_codes?.includes(dp.code)));

                      return (
                        <div
                          key={dept.id}
                          className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-5 shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 min-w-0"
                        >
                          <div className="space-y-3.5 min-w-0">
                            {/* Department Header Badge & Actions */}
                            <div className="flex items-center justify-between border-b border-border/60 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-mono font-bold text-xs shadow-xs">
                                  <Building2 className="h-4 w-4" />
                                </div>
                                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                  {dept.code}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditDept(dept)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  title="Edit Department"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem("/academic/admin/departments/", dept.id, dept.name, loadAdminData)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer transition-colors"
                                  title="Delete Department"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Department Name & Description */}
                            <div className="min-w-0">
                              <h3 className="font-display text-base font-bold text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                {dept.name}
                              </h3>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {dept.description || "Active Academic Department."}
                              </p>
                            </div>

                            {/* Dean / HOD Card */}
                            {dept.head_of_department && (
                              <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-surface/70 p-2.5 text-xs">
                                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <Award className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-muted-foreground block text-[0.62rem] uppercase font-bold tracking-wider">
                                    Head Of Department / Dean
                                  </span>
                                  <span className="font-bold text-foreground truncate block">{dept.head_of_department}</span>
                                </div>
                              </div>
                            )}

                            {/* Configured Specializations List */}
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider block">
                                Linked Degree Specializations ({deptPrograms.length})
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {deptPrograms.length > 0 ? (
                                  deptPrograms.map((p) => (
                                    <span
                                      key={p.id}
                                      className="rounded-lg bg-surface border border-border/70 px-2 py-0.5 text-[0.68rem] font-mono font-medium text-foreground truncate max-w-full"
                                    >
                                      {p.code || p.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">No Specializations Configured Yet.</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Footer Stats */}
                          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground font-mono">
                            <span className="font-semibold">{deptPrograms.length} Programs</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{deptSubjects.length} Modules</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Programs / Specializations Sub-View with Folder Explorer */}
              {structureSubTab === "programs" && (() => {
                const query = academicSearchQuery.trim().toLowerCase();
                const filteredPrograms = programs.filter((p) => {
                  if (!query) return true;
                  return (
                    p.name.toLowerCase().includes(query) ||
                    p.code.toLowerCase().includes(query) ||
                    (p.department_name && p.department_name.toLowerCase().includes(query)) ||
                    (p.degree_level && p.degree_level.toLowerCase().includes(query))
                  );
                });

                const currentDept = departments.find((d) => d.id === programFolderDeptId);
                const deptPrograms = programFolderDeptId
                  ? filteredPrograms.filter((p) => p.department === programFolderDeptId || p.department_name === currentDept?.name)
                  : filteredPrograms;

                return (
                  <div className="space-y-4">
                    {/* Top Folder Controls Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/60 p-3 sm:p-4 shadow-2xs">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {programFolderDeptId ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setProgramFolderDeptId(null)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-foreground hover:bg-surface font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                              <span>All Department Folders</span>
                            </button>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20 shadow-2xs">
                              <FolderOpen className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[200px] sm:max-w-xs">{currentDept?.name || "Department"}</span>
                              <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[0.62rem] font-mono">
                                {deptPrograms.length}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="inline-flex items-center gap-2 font-bold text-foreground">
                            <Folder className="h-4 w-4 text-cyan-500 fill-cyan-500/20" />
                            <span>Department Program Folders ({departments.length} Folders)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={academicSearchQuery}
                            onChange={(e) => setAcademicSearchQuery(e.target.value)}
                            placeholder="Filter programs..."
                            className="h-8.5 pl-8.5 pr-3 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary w-full sm:w-44"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FOLDER VIEW: Top-level Department Folders */}
                    {!programFolderDeptId && (
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {departments.map((dept) => {
                          const progsInDept = filteredPrograms.filter((p) => p.department === dept.id || p.department_name === dept.name);
                          return (
                            <div
                              key={dept.id}
                              onClick={() => setProgramFolderDeptId(dept.id)}
                              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-lg cursor-pointer min-w-0"
                            >
                              <div className="space-y-3 min-w-0">
                                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs">
                                      <Folder className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <span className="text-[0.68rem] font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                                        Department Folder
                                      </span>
                                      <h4 className="font-display text-sm font-bold text-foreground truncate max-w-[180px] sm:max-w-[220px]">
                                        {dept.name}
                                      </h4>
                                    </div>
                                  </div>
                                  <span className="rounded-full bg-surface border border-border/80 px-2 py-0.5 text-[0.68rem] font-mono font-bold text-foreground">
                                    {progsInDept.length} Programs
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                  {dept.description || "Academic department and degree curriculum architecture."}
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="font-mono text-[0.7rem]">{dept.code}</span>
                                <div className="inline-flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform text-xs">
                                  <span>Open Folder</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* FOLDER VIEW: Inside a Selected Department Folder */}
                    {programFolderDeptId !== null && (
                      <div className="space-y-3">
                        {programFolderDeptId && currentDept && (
                          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Showing {deptPrograms.length} degree specializations in {currentDept.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewProgram({ ...newProgram, department: currentDept.id });
                                setShowProgramModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add Specialization Here</span>
                            </button>
                          </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {deptPrograms.length === 0 ? (
                            <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                              <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/40" />
                              <h3 className="font-display font-bold text-base text-foreground">No Specializations In This Folder</h3>
                              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                Add Degree Programs Under This Department (E.g. B.Tech Artificial Intelligence &amp; Machine Learning).
                              </p>
                            </div>
                          ) : (
                            deptPrograms.map((prog) => (
                              <div
                                key={prog.id}
                                className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-5 shadow-xs hover:shadow-md hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">
                                        {prog.code}
                                      </span>
                                      {prog.degree_level && (
                                        <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[0.62rem] font-semibold text-muted-foreground">
                                          {prog.degree_level}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleEditProgram(prog)}
                                        className="rounded-xl p-1.5 text-muted-foreground hover:bg-cyan-500/10 hover:text-cyan-500 cursor-pointer transition-colors"
                                        title="Edit Specialization"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem("/academic/admin/programs/", prog.id, prog.name, loadAdminData)}
                                        className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer transition-colors"
                                        title="Delete Specialization"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-display text-base font-bold text-foreground leading-snug group-hover:text-cyan-600 transition-colors">
                                      {prog.name}
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground font-semibold">
                                      {prog.department_name || "Degree Program Specialization"}
                                    </p>
                                  </div>
                                </div>
                                <div className="rounded-2xl border border-border/60 bg-surface/70 p-3 flex items-center justify-between text-xs font-mono">
                                  <span className="text-muted-foreground font-semibold">Duration: {prog.duration_years} Years</span>
                                  <span className="font-bold text-primary">{prog.total_semesters} Semesters</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Sections Sub-View with Folder Explorer */}
              {structureSubTab === "sections" && (() => {
                const query = academicSearchQuery.trim().toLowerCase();

                const isSectionInProgram = (sec: SectionBatch, prog: ProgramSpecialization) => {
                  if (sec.program === prog.id) return true;
                  if (sec.program_code && (sec.program_code === prog.code || sec.program_code === prog.name)) return true;
                  if (sec.program_name && sec.program_name === prog.name) return true;
                  return false;
                };

                const filteredSections = sections.filter((sec) => {
                  if (!query) return true;
                  return (
                    (sec.section && sec.section.toLowerCase().includes(query)) ||
                    (sec.section_name && sec.section_name.toLowerCase().includes(query)) ||
                    (sec.program_code && sec.program_code.toLowerCase().includes(query)) ||
                    (sec.program_name && sec.program_name.toLowerCase().includes(query)) ||
                    (sec.academic_year && sec.academic_year.toLowerCase().includes(query))
                  );
                });

                const currentProgram = programs.find((p) => p.id === sectionFolderProgramId);
                const isUnassignedFolder = sectionFolderProgramId === "__unassigned__";

                let activeFolderSections = filteredSections;
                if (sectionFolderProgramId) {
                  if (isUnassignedFolder) {
                    activeFolderSections = filteredSections.filter((sec) => !programs.some((p) => isSectionInProgram(sec, p)));
                  } else if (currentProgram) {
                    activeFolderSections = filteredSections.filter((sec) => isSectionInProgram(sec, currentProgram));
                  }
                }

                const displayedSections = sectionFolderSemesterFilter === "all"
                  ? activeFolderSections
                  : activeFolderSections.filter((sec) => sec.semester === sectionFolderSemesterFilter);

                const unassignedSections = filteredSections.filter((sec) => !programs.some((p) => isSectionInProgram(sec, p)));

                return (
                  <div className="space-y-4">
                    {/* Top Folder Controls Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/60 p-3 sm:p-4 shadow-2xs">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {sectionFolderProgramId ? (
                          <>
                            <button
                              type="button"
                              onClick={() => { setSectionFolderProgramId(null); setSectionFolderSemesterFilter("all"); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-foreground hover:bg-surface font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                              <span>All Program Folders</span>
                            </button>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/20 shadow-2xs">
                              <FolderOpen className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[200px] sm:max-w-xs">
                                {isUnassignedFolder ? "General Cohorts" : currentProgram?.name || "Program"}
                              </span>
                              <span className="rounded-full bg-teal-500/20 px-1.5 py-0.2 text-[0.62rem] font-mono">
                                {activeFolderSections.length}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="inline-flex items-center gap-2 font-bold text-foreground">
                            <Folder className="h-4 w-4 text-teal-500 fill-teal-500/20" />
                            <span>Program Section Folders ({programs.length} Programs · {sections.length} Sections)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={academicSearchQuery}
                            onChange={(e) => setAcademicSearchQuery(e.target.value)}
                            placeholder="Filter sections..."
                            className="h-8.5 pl-8.5 pr-3 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary w-full sm:w-44"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FOLDER VIEW: Top-level Program Folders for Sections */}
                    {!sectionFolderProgramId && (
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {programs.map((prog) => {
                          const progSections = filteredSections.filter((s) => isSectionInProgram(s, prog));
                          const totalCapacity = progSections.reduce((sum, s) => sum + (Number(s.max_capacity) || 0), 0);

                          return (
                            <div
                              key={prog.id}
                              onClick={() => {
                                setSectionFolderProgramId(prog.id);
                                setSectionFolderSemesterFilter("all");
                              }}
                              className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-5 shadow-xs hover:shadow-lg hover:border-teal-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-500 group-hover:scale-110 transition-transform">
                                    <Folder className="h-6 w-6 fill-teal-500/20" />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-xs font-bold font-mono text-teal-600 dark:text-teal-400">
                                      {prog.code}
                                    </span>
                                    {prog.degree_level && (
                                      <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[0.62rem] font-semibold text-muted-foreground">
                                        {prog.degree_level}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-display text-base font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                    {prog.name}
                                  </h3>
                                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1 font-semibold">
                                    {prog.department_name || "Degree Cohort Sections"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs font-mono">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-foreground">{progSections.length} Sections</span>
                                  <span className="text-teal-600 dark:text-teal-400 font-bold">· {totalCapacity} Capacity</span>
                                </div>
                                <span className="text-muted-foreground group-hover:text-foreground font-semibold flex items-center gap-1 transition-colors">
                                  Open Folder <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Unassigned Cohorts Folder if any exist */}
                        {unassignedSections.length > 0 && (
                          <div
                            onClick={() => {
                              setSectionFolderProgramId("__unassigned__");
                              setSectionFolderSemesterFilter("all");
                            }}
                            className="group relative rounded-3xl border border-dashed border-border/80 bg-surface/40 p-5 shadow-xs hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                                  <Folder className="h-6 w-6 fill-primary/20" />
                                </div>
                                <span className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs font-mono font-bold text-muted-foreground">
                                  CORE
                                </span>
                              </div>
                              <div>
                                <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                  General &amp; Unassigned Sections
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-1 font-semibold">
                                  Cohort sections not mapped to a specific specialization
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs font-mono">
                              <span className="font-bold text-foreground">{unassignedSections.length} Sections</span>
                              <span className="text-muted-foreground group-hover:text-foreground font-semibold flex items-center gap-1 transition-colors">
                                Open Folder <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* INSIDE PROGRAM FOLDER: Semester Sub-Filters + Section Cards */}
                    {sectionFolderProgramId !== null && (
                      <div className="space-y-4">
                        {sectionFolderProgramId && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border">
                            <div>
                              <h4 className="font-display font-bold text-sm text-foreground">
                                {isUnassignedFolder ? "General Cohort Batches" : currentProgram?.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {isUnassignedFolder ? "Unassigned Sections" : `${currentProgram?.degree_level} · ${currentProgram?.duration_years} Years (${currentProgram?.total_semesters} Semesters)`}
                              </p>
                            </div>

                            {/* Semester Quick Pills */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSectionFolderSemesterFilter("all")}
                                className={cn(
                                  "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                  sectionFolderSemesterFilter === "all"
                                    ? "bg-primary text-primary-foreground shadow-2xs"
                                    : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                                )}
                              >
                                All ({activeFolderSections.length})
                              </button>
                              {Array.from({ length: currentProgram?.total_semesters || 8 }).map((_, idx) => {
                                const semNum = idx + 1;
                                const semCount = activeFolderSections.filter((s) => s.semester === semNum).length;
                                if (semCount === 0 && sectionFolderSemesterFilter !== semNum) return null;
                                return (
                                  <button
                                    key={semNum}
                                    type="button"
                                    onClick={() => setSectionFolderSemesterFilter(semNum)}
                                    className={cn(
                                      "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                      sectionFolderSemesterFilter === semNum
                                        ? "bg-teal-600 text-white shadow-2xs"
                                        : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    Sem {semNum} ({semCount})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                          {displayedSections.length === 0 ? (
                            <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                              <Layers className="h-10 w-10 mx-auto text-muted-foreground/40" />
                              <h3 className="font-display font-bold text-base text-foreground">
                                {sectionFolderProgramId ? "No Sections Configured In This Program / Semester" : "No Sections Configured Yet"}
                              </h3>
                              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                Configure Semester Cohorts And Section Batches (E.g. Semester 1, Section A).
                              </p>
                              {currentProgram && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewSection({
                                      ...newSection,
                                      program: currentProgram.id,
                                      semester: typeof sectionFolderSemesterFilter === "number" ? sectionFolderSemesterFilter : 1,
                                    });
                                    setShowSectionModal(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-md cursor-pointer"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Add Section In {currentProgram.code}</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            displayedSections.map((sec) => (
                              <div
                                key={sec.id}
                                className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-5 shadow-xs hover:shadow-lg hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-4"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-mono font-bold text-xs shadow-xs">
                                        {sec.section || sec.section_name || "A"}
                                      </div>
                                      <div>
                                        <span className="text-[0.65rem] font-bold text-muted-foreground block uppercase tracking-wider">Cohort Section</span>
                                        <span className="font-mono font-bold text-foreground text-xs">Section {sec.section || sec.section_name || "A"}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleEditSection(sec)}
                                        className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                        title="Edit Section Cohort"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem("/academic/admin/sections/", sec.id, `Section ${sec.section || sec.section_name || "A"}`, loadAdminData)}
                                        className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer transition-colors"
                                        title="Delete Section Cohort"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-[0.65rem] font-bold text-teal-600 dark:text-teal-400">
                                        Semester {sec.semester}
                                      </span>
                                      {sec.program_code && (
                                        <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[0.65rem] font-mono font-bold text-muted-foreground">
                                          {sec.program_code}
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="font-display font-bold text-sm text-foreground leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                      {sec.program_name || "Academic Specialization Cohort"}
                                    </h3>
                                  </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-border/60">
                                  <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-muted-foreground text-[0.68rem]">Batch / Academic Year</span>
                                    <span className="font-bold text-foreground text-[0.7rem]">{sec.academic_year || "2026-2027"}</span>
                                  </div>
                                  <div className="flex items-center justify-between rounded-xl bg-surface/80 px-2.5 py-1.5 text-xs font-mono">
                                    <span className="text-muted-foreground text-[0.68rem]">Capacity Limit</span>
                                    <span className="font-bold text-primary text-[0.72rem]">{sec.max_capacity || 60} Scholars</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Subjects Sub-View with Folder Explorer */}
              {structureSubTab === "subjects" && (() => {
                const query = academicSearchQuery.trim().toLowerCase();

                const isSubjectInProgram = (sub: Subject, prog: ProgramSpecialization) => {
                  if (sub.program === prog.id) return true;
                  if (sub.programs && Array.isArray(sub.programs) && sub.programs.includes(prog.id)) return true;
                  if (sub.program_ids && Array.isArray(sub.program_ids) && sub.program_ids.includes(prog.id)) return true;
                  if (sub.program_codes && Array.isArray(sub.program_codes) && (sub.program_codes.includes(prog.code) || sub.program_codes.includes(prog.name))) return true;
                  if (sub.program_name === prog.name) return true;
                  return false;
                };

                const filteredSubjects = subjects.filter((s) => {
                  if (!query) return true;
                  return (
                    s.name.toLowerCase().includes(query) ||
                    s.code.toLowerCase().includes(query) ||
                    (s.short_name && s.short_name.toLowerCase().includes(query)) ||
                    (s.faculty_name && s.faculty_name.toLowerCase().includes(query)) ||
                    (s.program_codes && s.program_codes.some((c) => c.toLowerCase().includes(query)))
                  );
                });

                const currentProgram = programs.find((p) => p.id === subjectFolderProgramId);
                const isUnassignedFolder = subjectFolderProgramId === "__unassigned__";

                let activeFolderSubjects = filteredSubjects;
                if (subjectFolderProgramId) {
                  if (isUnassignedFolder) {
                    activeFolderSubjects = filteredSubjects.filter((s) => !programs.some((p) => isSubjectInProgram(s, p)));
                  } else if (currentProgram) {
                    activeFolderSubjects = filteredSubjects.filter((s) => isSubjectInProgram(s, currentProgram));
                  }
                }

                const displayedSubjects = subjectFolderSemesterFilter === "all"
                  ? activeFolderSubjects
                  : activeFolderSubjects.filter((s) => s.semester === subjectFolderSemesterFilter);

                const unassignedSubjects = filteredSubjects.filter((s) => !programs.some((p) => isSubjectInProgram(s, p)));

                return (
                  <div className="space-y-4">
                    {/* Top Folder Controls Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl border border-border/80 bg-surface/60 p-3 sm:p-4 shadow-2xs">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {subjectFolderProgramId ? (
                          <>
                            <button
                              type="button"
                              onClick={() => { setSubjectFolderProgramId(null); setSubjectFolderSemesterFilter("all"); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-foreground hover:bg-surface font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                              <span>All Program Folders</span>
                            </button>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shadow-2xs">
                              <FolderOpen className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[200px] sm:max-w-xs">
                                {isUnassignedFolder ? "General & Core Modules" : currentProgram?.name || "Program"}
                              </span>
                              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[0.62rem] font-mono">
                                {activeFolderSubjects.length}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="inline-flex items-center gap-2 font-bold text-foreground">
                            <Folder className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                            <span>Program Curriculum Folders ({programs.length} Programs · {subjects.length} Modules)</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={academicSearchQuery}
                            onChange={(e) => setAcademicSearchQuery(e.target.value)}
                            placeholder="Filter modules..."
                            className="h-8.5 pl-8.5 pr-3 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary w-full sm:w-44"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FOLDER VIEW: Top-level Program Specialization Folders */}
                    {!subjectFolderProgramId && (
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {programs.map((prog) => {
                          const progSubjects = filteredSubjects.filter((s) => isSubjectInProgram(s, prog));
                          const totalCredits = progSubjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);

                          return (
                            <div
                              key={prog.id}
                              onClick={() => {
                                setSubjectFolderProgramId(prog.id);
                                setSubjectFolderSemesterFilter("all");
                              }}
                              className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-5 shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-hover:scale-110 transition-transform">
                                    <Folder className="h-6 w-6 fill-emerald-500/20" />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                      {prog.code}
                                    </span>
                                    {prog.degree_level && (
                                      <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[0.62rem] font-semibold text-muted-foreground">
                                        {prog.degree_level}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-display text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {prog.name}
                                  </h3>
                                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1 font-semibold">
                                    {prog.department_name || "Specialization Curriculum"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs font-mono">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {progSubjects.length} Modules · {totalCredits} Credits
                                </span>
                                <span className="text-muted-foreground group-hover:text-foreground font-semibold flex items-center gap-1 transition-colors">
                                  Open Folder <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Unassigned Modules Folder (If Any) */}
                        {unassignedSubjects.length > 0 && (
                          <div
                            onClick={() => {
                              setSubjectFolderProgramId("unassigned");
                              setSubjectFolderSemesterFilter("all");
                            }}
                            className="group relative rounded-3xl border border-dashed border-border/80 bg-surface/30 p-5 shadow-xs hover:shadow-lg hover:border-foreground/40 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface border border-border text-muted-foreground group-hover:scale-110 transition-transform">
                                  <Folder className="h-6 w-6" />
                                </div>
                                <span className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs font-bold font-mono text-muted-foreground">
                                  CORE
                                </span>
                              </div>
                              <div>
                                <h3 className="font-display text-base font-bold text-foreground">
                                  General &amp; Core Curriculum
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  Unassigned University Modules &amp; Foundation Electives.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs font-mono">
                              <span className="font-bold text-foreground">{unassignedSubjects.length} Modules</span>
                              <span className="text-muted-foreground group-hover:text-foreground font-semibold flex items-center gap-1 transition-colors">
                                Open Folder <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* INSIDE PROGRAM FOLDER: Semester Sub-Filters + Subject Cards */}
                    {subjectFolderProgramId !== null && (
                      <div className="space-y-4">
                        {subjectFolderProgramId && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border">
                            <div>
                              <h4 className="font-display font-bold text-sm text-foreground">
                                {isUnassignedFolder ? "General Course Modules" : currentProgram?.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {isUnassignedFolder ? "Common University Curriculum" : `${currentProgram?.degree_level} · ${currentProgram?.duration_years} Years (${currentProgram?.total_semesters} Semesters)`}
                              </p>
                            </div>

                            {/* Semester Quick Pills */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSubjectFolderSemesterFilter("all")}
                                className={cn(
                                  "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                  subjectFolderSemesterFilter === "all"
                                    ? "bg-primary text-primary-foreground shadow-2xs"
                                    : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                                )}
                              >
                                All ({activeFolderSubjects.length})
                              </button>
                              {Array.from({ length: currentProgram?.total_semesters || 8 }).map((_, idx) => {
                                const semNum = idx + 1;
                                const semCount = activeFolderSubjects.filter((s) => s.semester === semNum).length;
                                if (semCount === 0 && subjectFolderSemesterFilter !== semNum) return null;
                                return (
                                  <button
                                    key={semNum}
                                    type="button"
                                    onClick={() => setSubjectFolderSemesterFilter(semNum)}
                                    className={cn(
                                      "px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                      subjectFolderSemesterFilter === semNum
                                        ? "bg-emerald-600 text-white shadow-2xs"
                                        : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    Sem {semNum} ({semCount})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {displayedSubjects.length === 0 ? (
                            <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40" />
                              <h3 className="font-display font-bold text-base text-foreground">
                                {subjectFolderProgramId ? "No Subjects In This Program / Semester" : "No Subjects Registered Yet"}
                              </h3>
                              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                Register Course Modules To Add Lecture Notes, Question Papers, And Practical Guides.
                              </p>
                              {currentProgram && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSubjectId(null);
                                    setNewSubject({
                                      programs: [currentProgram.id],
                                      semester: typeof subjectFolderSemesterFilter === "number" ? subjectFolderSemesterFilter : 1,
                                      name: "",
                                      code: "",
                                      short_name: "",
                                      faculty_name: "",
                                      credits: 4,
                                      syllabus_summary: "",
                                    });
                                    setShowSubjectModal(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-md cursor-pointer"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Register Subject In {currentProgram.code}</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            displayedSubjects.map((sub) => (
                              <div
                                key={sub.id}
                                className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-5.5 shadow-xs hover:shadow-lg hover:border-primary/50 transition-all duration-200 flex flex-col justify-between space-y-4"
                              >
                                <div className="space-y-3.5">
                                  {/* Card Header: Subject Code & Short Name Badges + Actions */}
                                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="rounded-xl bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold font-mono text-primary shadow-2xs">
                                        {sub.code}
                                      </span>
                                      {sub.short_name && (
                                        <span className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-xs font-bold font-mono text-violet-600 dark:text-violet-400">
                                          {sub.short_name}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleEditSubject(sub)}
                                        className="rounded-xl p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                        title="Edit Course Subject"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem("/academic/admin/subjects/", sub.id, sub.name, loadAdminData)}
                                        className="rounded-xl p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer transition-colors"
                                        title="Delete Subject"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Subject Name & Faculty */}
                                  <div className="space-y-2">
                                    <h3 className="font-display text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                                      {sub.name}
                                    </h3>

                                    {/* Faculty Instructor Tag */}
                                    {sub.faculty_name && (
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground/90">
                                        <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span className="truncate">{sub.faculty_name}</span>
                                      </div>
                                    )}

                                    {/* Linked Degree Programs Badges */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      {sub.program_codes && sub.program_codes.length > 0 ? (
                                        sub.program_codes.map((code, cIdx) => (
                                          <span
                                            key={cIdx}
                                            className="rounded-lg bg-surface/80 border border-border/80 px-2 py-0.5 text-[0.68rem] font-mono font-bold text-muted-foreground"
                                          >
                                            {code}
                                          </span>
                                        ))
                                      ) : sub.program_name ? (
                                        <span className="rounded-lg bg-surface/80 border border-border/80 px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground">
                                          {sub.program_name}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground font-semibold">
                                          {sub.department_name || "All Specializations"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Card Footer: Semester, Credits, & Content Stats */}
                                <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs font-mono">
                                  <span className="rounded-lg bg-surface px-2 py-0.5 text-[0.7rem] font-bold text-muted-foreground">
                                    Semester {sub.semester}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {Number(sub.materials_count) > 0 && (
                                      <span className="text-[0.68rem] text-muted-foreground">
                                        {sub.materials_count} Notes
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 font-bold text-primary text-[0.72rem]">
                                      <Sparkles className="h-3 w-3" />
                                      {sub.credits} Credits
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATION 2: UNIFIED PUBLISHING STUDIO */}
          {/* ========================================================================= */}
          {activeStation === "publisher" && (
            <div className="space-y-6">
              {renderCascadingContextBar({ showSubject: true })}

              {/* Publisher Mode Switcher & Add Button */}
              <div className="flex flex-col gap-3 border-b border-border pb-4 w-full">
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl sm:rounded-3xl bg-surface/80 border border-border/80 shadow-2xs w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setPublisherType("NOTES");
                      setMaterialPages([{
                        page_number: 1,
                        page_title: "Unit 1: Foundations & Core Concepts",
                        content_html: "## 1. Core Architectural Concepts\n- **Definition**: Theoretical foundations and analytical models.\n- **Complexity**: $O(N \\log N)$ asymptotic bounds.",
                      }]);
                      setActivePageIndex(0);
                    }}
                    className={cn(
                      "flex-1 min-w-[105px] flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer",
                      publisherType === "NOTES"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Notes</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      publisherType === "NOTES" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {filteredMaterials.filter((m) => m.material_type === "NOTES").length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPublisherType("SOLVED_PYQ");
                      setMaterialPages([{
                        page_number: 1,
                        page_title: "Question 1",
                        content_html: "## Question 1\nDefine the principles of...",
                      }]);
                      setActivePageIndex(0);
                    }}
                    className={cn(
                      "flex-1 min-w-[105px] flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer",
                      publisherType === "SOLVED_PYQ"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <Award className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">PYQs</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      publisherType === "SOLVED_PYQ" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {filteredMaterials.filter((m) => m.material_type === "SOLVED_PYQ").length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPublisherType("SYLLABUS");
                      setMaterialPages([{
                        page_number: 1,
                        page_title: "Module 1: Curriculum Breakdown & Objectives",
                        content_html: "## Module 1: Course Overview\n- **Course Objectives**: Theoretical foundation and learning outcomes.",
                      }]);
                      setActivePageIndex(0);
                    }}
                    className={cn(
                      "flex-1 min-w-[105px] flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer",
                      publisherType === "SYLLABUS"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <ScrollText className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Syllabus</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      publisherType === "SYLLABUS" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {filteredMaterials.filter((m) => m.material_type === "SYLLABUS").length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublisherType("LAB_MANUAL")}
                    className={cn(
                      "flex-1 min-w-[105px] flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer",
                      publisherType === "LAB_MANUAL"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Labs &amp; Viva</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      publisherType === "LAB_MANUAL" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {labs.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPublisherType("FACULTY");
                      setMaterialPages([{
                        page_number: 1,
                        page_title: "Faculty Handout",
                        content_html: "## Faculty Materials\nUpload Your Document Below.",
                      }]);
                      setActivePageIndex(0);
                    }}
                    className={cn(
                      "flex-1 min-w-[105px] flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer",
                      publisherType === "FACULTY"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Faculty</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      publisherType === "FACULTY" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {filteredMaterials.filter((m) => m.material_type === "FACULTY").length}
                    </span>
                  </button>
                </div>

                {/* Prominent Action Button */}
                <div className="flex justify-end">
                  {publisherType === "NOTES" && (
                    <button
                      onClick={() => {
                        setNewMaterial({ ...newMaterial, material_type: "NOTES", subject: selectedSubjectId || (subjects[0]?.id || "") });
                        setShowMaterialModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Publish Unit Notes</span>
                    </button>
                  )}
                  {publisherType === "SOLVED_PYQ" && (
                    <button
                      onClick={() => {
                        setNewMaterial({ ...newMaterial, material_type: "SOLVED_PYQ", subject: selectedSubjectId || (subjects[0]?.id || "") });
                        setShowMaterialModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Publish Solved PYQ</span>
                    </button>
                  )}
                  {publisherType === "SYLLABUS" && (
                    <button
                      onClick={() => {
                        setNewMaterial({ ...newMaterial, material_type: "SYLLABUS", subject: selectedSubjectId || (subjects[0]?.id || "") });
                        setShowMaterialModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Publish Official Syllabus</span>
                    </button>
                  )}
                  {publisherType === "LAB_MANUAL" && (
                    <button
                      onClick={() => {
                        setNewLab({ ...newLab, subject: selectedSubjectId || (subjects[0]?.id || "") });
                        setShowLabModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Practical Lab Experiment</span>
                    </button>
                  )}
                  {publisherType === "FACULTY" && (
                    <button
                      onClick={() => {
                        setNewMaterial({ ...newMaterial, material_type: "FACULTY", subject: selectedSubjectId || (subjects[0]?.id || "") });
                        setShowMaterialModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Publish Faculty Material</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notes List */}
              {publisherType === "NOTES" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMaterials.filter((m) => m.material_type === "NOTES").length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Notes Published For This Filter</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Click "Publish Unit Notes" Above To Add Real Handwritten Or Typed Notes.
                      </p>
                    </div>
                  ) : (
                    filteredMaterials
                      .filter((m) => m.material_type === "NOTES")
                      .map((mat) => (
                        <div key={mat.id} className="rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/30 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 hover:shadow-lg transition-all">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                                  {mat.subject_code} · Unit {mat.unit_number || 1}
                                </span>
                                {mat.file ? (
                                  <span className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[0.68rem] font-bold font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap inline-flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {mat.file.endsWith(".pdf") ? "PDF Doc" : mat.file.endsWith(".docx") ? "Word Doc" : "Doc File"}
                                  </span>
                                ) : (
                                  <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[0.68rem] font-bold font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap inline-flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Studio Notes
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleEditMaterial(mat)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  title="Edit Notes"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setPreviewMaterialId(mat.id)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  title="Preview in DRM Secure Reader"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem("/academic/admin/materials/", mat.id, mat.title, loadAdminData)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                                  title="Delete Study Material"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <h3 className="font-display text-base font-bold text-foreground leading-snug">{mat.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">{mat.summary || "Faculty verified study guide & notes."}</p>
                            {mat.tags && mat.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {mat.tags.map((t, idx) => (
                                  <span key={idx} className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.65rem] font-mono text-muted-foreground">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                            <span className="font-mono text-[0.7rem]">{mat.page_count} Pages · {mat.is_topper_verified ? "Topper Verified" : "Standard"}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-[0.68rem]">{mat.academic_year || "2026-2027"}</span>
                              <button
                                onClick={() => setPreviewMaterialId(mat.id)}
                                className="font-bold text-primary hover:underline text-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <span>Preview</span>
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* Solved PYQs List */}
              {publisherType === "SOLVED_PYQ" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMaterials.filter((m) => m.material_type === "SOLVED_PYQ").length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <FileCheck2 className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Solved PYQs Published For This Filter</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Click "Publish Solved PYQ" Above To Add University Previous Year Papers With Model Solutions.
                      </p>
                    </div>
                  ) : (
                    filteredMaterials
                      .filter((m) => m.material_type === "SOLVED_PYQ")
                      .map((mat) => (
                        <div key={mat.id} className="rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/30 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 hover:shadow-lg transition-all">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-xs font-bold font-mono text-cyan-700 dark:text-cyan-300 whitespace-nowrap">
                                  {mat.subject_code} · {mat.academic_year}
                                </span>
                                {mat.file ? (
                                  <span className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[0.68rem] font-bold font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap inline-flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {mat.file.endsWith(".pdf") ? "PDF Doc" : mat.file.endsWith(".docx") ? "Word Doc" : "Doc File"}
                                  </span>
                                ) : (
                                  <span className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-[0.68rem] font-bold font-mono text-cyan-600 dark:text-cyan-400 whitespace-nowrap inline-flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Solved Key
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleEditMaterial(mat)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-cyan-500/10 hover:text-cyan-500 cursor-pointer transition-colors"
                                  title="Edit Solved PYQ"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setPreviewMaterialId(mat.id)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  title="Preview in DRM Secure Reader"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem("/academic/admin/materials/", mat.id, mat.title, loadAdminData)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                                  title="Delete Solved Paper"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <h3 className="font-display text-base font-bold text-foreground leading-snug">{mat.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">{mat.summary || "Complete verified solutions and exam keys."}</p>
                            {mat.tags && mat.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {mat.tags.map((t, idx) => (
                                  <span key={idx} className="rounded-lg bg-surface border border-border/60 px-2 py-0.5 text-[0.65rem] font-mono text-muted-foreground">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                            <span className="font-mono text-[0.7rem]">{mat.page_count} Pages · Solved Solutions</span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">Verified</span>
                              <button
                                onClick={() => setPreviewMaterialId(mat.id)}
                                className="font-bold text-primary hover:underline text-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <span>Preview</span>
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* Official Syllabus List */}
              {publisherType === "SYLLABUS" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMaterials.filter((m) => m.material_type === "SYLLABUS").length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <ScrollText className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Official Syllabus Published For This Filter</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Click "Publish Official Syllabus" Above To Upload Course Curriculum Breakdown &amp; Objectives.
                      </p>
                    </div>
                  ) : (
                    filteredMaterials
                      .filter((m) => m.material_type === "SYLLABUS")
                      .map((mat) => (
                        <div key={mat.id} className="rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/30 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 hover:shadow-lg transition-all">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="rounded-xl bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 text-xs font-bold font-mono text-teal-700 dark:text-teal-300 whitespace-nowrap">
                                  {mat.subject_code} {mat.unit_number ? `· Unit ${mat.unit_number}` : "· Full Syllabus"}
                                </span>
                                {mat.file ? (
                                  <span className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[0.68rem] font-bold font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap inline-flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {mat.file.endsWith(".pdf") ? "PDF Doc" : "Doc File"}
                                  </span>
                                ) : (
                                  <span className="rounded-xl bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 text-[0.68rem] font-bold font-mono text-teal-600 dark:text-teal-400 whitespace-nowrap inline-flex items-center gap-1">
                                    <ScrollText className="h-3 w-3" />
                                    Studio Syllabus
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleEditMaterial(mat)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  title="Edit Syllabus"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setPreviewMaterialId(mat.id)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  title="Preview in DRM Secure Reader"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem("/academic/admin/materials/", mat.id, mat.title, loadAdminData)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                                  title="Delete Syllabus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <h3 className="font-display text-base font-bold text-foreground leading-snug">{mat.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">{mat.summary || "Official university curriculum breakdown & module reference."}</p>
                          </div>
                          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                            <span className="font-mono text-[0.7rem]">{mat.page_count} Pages · Official Syllabus</span>
                            <button
                              onClick={() => setPreviewMaterialId(mat.id)}
                              className="font-bold text-primary hover:underline text-xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Preview</span>
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* Faculty Materials List */}
              {publisherType === "FACULTY" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMaterials.filter((m) => m.material_type === "FACULTY").length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface shadow-xs">
                        <LibraryBig className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">No Faculty Materials</h3>
                      <p className="text-xs text-muted-foreground">Upload PPTs, DOCXs, Or PDFs For Faculty Resources.</p>
                    </div>
                  ) : (
                    filteredMaterials
                      .filter((m) => m.material_type === "FACULTY")
                      .map((material) => (
                        <div key={material.id} className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30 flex flex-col h-full">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-[0.65rem] font-bold text-blue-600 dark:text-blue-400">
                                <LibraryBig className="h-3 w-3" />
                                Faculty Upload
                              </span>
                              <span className="text-[0.7rem] font-bold text-muted-foreground">
                                {material.page_count} Pages
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground line-clamp-2">{material.title}</h4>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                {material.summary || "No summary provided."}
                              </p>
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-[0.65rem] font-mono text-muted-foreground">
                              {new Date(material.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleEditMaterial(material)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 cursor-pointer transition-colors"
                                  title="Edit Faculty Material"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setPreviewMaterialId(material.id)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  title="Preview in DRM Secure Reader"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem("/academic/admin/materials/", material.id, material.title, loadAdminData)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                                  title="Delete Study Material"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
              {/* Lab Experiments List */}
              {publisherType === "LAB_MANUAL" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {labs.length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Practical Lab Experiments Added Yet</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Add Practical Experiments With Multi-Language Code Snippets And Viva Questions.
                      </p>
                    </div>
                  ) : (
                    labs.map((lab) => (
                      <div key={lab.id} className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all">
                        <div>
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                              {lab.subject_code} · Exp {lab.experiment_number}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditLab(lab)}
                                className="rounded-xl p-1.5 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer transition-colors"
                                title="Edit Practical Lab Experiment"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem("/academic/admin/labs/", lab.id, lab.title, loadAdminData)}
                                className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <h3 className="mt-3 font-display text-base font-bold text-foreground">{lab.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{lab.aim}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                          <span>{lab.viva_questions?.length || 0} Viva Q&amp;A Drills</span>
                          <span className="font-mono text-cyan-600 dark:text-cyan-400">Code Verified</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATION 3: TIMETABLE GRID & TIMELINE */}
          {/* ========================================================================= */}
          {activeStation === "timetable" && (
            <div className="space-y-6">
              {renderCascadingContextBar({ showSection: true })}

              {/* Day Selector (6-Day Grid) & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="grid grid-cols-6 gap-1 bg-surface p-1 rounded-2xl border border-border w-full sm:w-auto">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedTimetableDay(d)}
                      className={cn(
                        "px-1.5 xs:px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center whitespace-nowrap",
                        selectedTimetableDay === d
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => {
                      setAiTargetSemester(selectedSemester || 1);
                      const sec = sections.find((s) => s.id === selectedSectionId)?.section || sections[0]?.section || "A";
                      setAiTargetSection(sec);
                      setShowAiTimetableModal(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 cursor-pointer shrink-0 transition-colors shadow-xs"
                    title="Scan Timetable Photo with Gemini AI"
                  >
                    <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
                    <span>Scan Timetable Photo (Gemini AI)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (timetableSlots.length === 0) {
                        toast.error("No Timetable Slots Exist To Delete.");
                        return;
                      }
                      setDeleteAllScope("filtered");
                      setDeleteConfirmationText("");
                      setShowDeleteAllTimetableModal(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 cursor-pointer shrink-0 transition-colors shadow-xs"
                    title="Delete Timetable Slots"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    <span>Delete All Timetable</span>
                  </button>

                  <button
                    onClick={() => {
                      const secObj = sections.find((s) => s.id === selectedSectionId);
                      setNewTimetableSlot({
                        ...newTimetableSlot,
                        semester: selectedSemester || 1,
                        section: secObj?.section || sections[0]?.section || "A",
                        subject: selectedSubjectId || (subjects[0]?.id || ""),
                      });
                      setShowTimetableModal(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl bg-primary px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>Add Timetable Slot</span>
                  </button>
                </div>
              </div>

              {/* Slots Timeline List */}
              {filteredTimetableSlots.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                  <Clock className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <h3 className="font-display font-bold text-base text-foreground">No Timetable Slots For {selectedTimetableDay}</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Add Weekly Timetable Periods For Semesters And Sections On {selectedTimetableDay}.
                  </p>
                </div>
              ) : (
                /* Connected Vertical Timeline View */
                <div className="relative pl-4 sm:pl-6 border-l-2 border-dashed border-border/80 space-y-4 ml-2 sm:ml-3">
                  {filteredTimetableSlots.map((slot) => {
                    const isLab = (slot.event_type || "").toLowerCase().includes("lab") || (slot.title || "").toLowerCase().includes("lab");

                    return (
                      <div key={slot.id} className="relative group">
                        {/* Timeline Node Bullet */}
                        <div className={cn(
                          "absolute -left-[23px] sm:-left-[31px] top-5 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 bg-background flex items-center justify-center shadow-xs z-10",
                          isLab ? "border-cyan-500" : "border-emerald-500"
                        )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", isLab ? "bg-cyan-500" : "bg-emerald-500")} />
                        </div>

                        {/* Timeline Card */}
                        <div className={cn(
                          "rounded-2xl sm:rounded-3xl border bg-card p-4 sm:p-5 shadow-xs space-y-3 transition-all hover:shadow-md",
                          isLab ? "border-cyan-500/30 hover:border-cyan-500/60" : "border-emerald-500/30 hover:border-emerald-500/60"
                        )}>
                          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "rounded-full px-2.5 py-0.5 text-xs font-bold font-mono border",
                                isLab
                                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
                                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                              )}>
                                {slot.day_of_week} · {slot.start_time} - {slot.end_time}
                              </span>
                              <span className="rounded-xl bg-surface border border-border/70 px-2 py-0.5 text-[0.65rem] font-bold text-muted-foreground">
                                {slot.event_type || "Lecture"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditTimetable(slot)}
                                className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                title="Edit Timetable Slot"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem("/planner/admin/timetable/", slot.id, slot.title, loadAdminData)}
                                className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                                title="Delete Timetable Slot"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-bold text-sm sm:text-base text-foreground leading-snug">{slot.title}</h4>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <span className="font-semibold text-primary">Sem {slot.semester} · Sec {slot.section}</span>
                            <span className="font-mono bg-surface px-2.5 py-1 rounded-xl border border-border/60 font-bold text-foreground">
                              {slot.room_number || "LT-01"}
                            </span>
                          </div>

                          {slot.faculty_name && (
                            <p className="text-[0.72rem] text-muted-foreground pt-2 border-t border-border/60">
                              Faculty Instructor: <strong className="text-foreground">{slot.faculty_name}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATION 4: COURSE ASSIGNMENTS */}
          {/* ========================================================================= */}
          {activeStation === "assignments" && (
            <div className="space-y-6">
              {renderCascadingContextBar({ showSubject: true })}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">Academic Course Assignments</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Broadcast Homework, Laboratory Submissions, And Project Milestones.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingAssignmentId(null);
                    setNewAssignment({
                      subject: selectedSubjectId || (subjects[0]?.id || ""),
                      title: "",
                      description: "",
                      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
                      total_marks: 20,
                      weightage_percentage: 10,
                    });
                    setShowAssignmentModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Course Assignment</span>
                </button>
              </div>

              {/* Assignments Grid */}
              {filteredAssignments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <h3 className="font-display font-bold text-base text-foreground">No Assignments Created Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Publish Continuous Evaluation Assignments For Your Subjects.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredAssignments.map((a) => (
                    <div key={a.id} className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all">
                      <div>
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                            {a.subject_code} · Due {a.due_date}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditAssignment(a)}
                              className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                              title="Edit Assignment"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("/assignments/admin/assignments/", a.id, a.title, loadAdminData)}
                              className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                              title="Delete Assignment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="mt-3 font-display text-base font-bold text-foreground">{a.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-3 leading-relaxed">{a.description || "Official course evaluation."}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground font-mono">
                        <span>Marks: {a.total_marks}</span>
                        <span className="font-bold text-primary">Weight: {a.weightage_percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATION 5: NOTICE DISPATCHER */}
          {/* ========================================================================= */}
          {activeStation === "notices" && (
            <div className="space-y-6">
              {renderCascadingContextBar({})}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">Official Department Circulars</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Broadcast Institutional Notices And Examination Schedules.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl border border-border text-xs shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setNoticeFilterScope("context")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer",
                        noticeFilterScope === "context"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      🎯 Context Filtered ({filteredNotices.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoticeFilterScope("all")}
                      className={cn(
                        "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer",
                        noticeFilterScope === "all"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      🌐 All Campus ({notices.length})
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setEditingNoticeId(null);
                      setNewNotice({
                        title: "",
                        content: "",
                        category: "Examination",
                        priority: "HIGH",
                        department: selectedDeptId || "",
                        program: selectedProgramId || "",
                        target_semester: selectedSemester || null,
                        target_section: "",
                        is_broadcast_all: !selectedDeptId && !selectedProgramId,
                      });
                      setShowNoticeModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Broadcast New Notice</span>
                  </button>
                </div>
              </div>

              {/* Notices List */}
              {filteredNotices.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                  <Megaphone className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <h3 className="font-display font-bold text-base text-foreground">No Official Circulars In This Scope</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {noticeFilterScope === "context"
                      ? "No notices currently targeted to this specific Department / Specialization. Switch to 'All Campus' or broadcast a new notice."
                      : "Broadcast Examination Notifications And Department Updates To Student Dashboards."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredNotices.map((n) => {
                    const snippet = (n.content || "")
                      .replace(/!\[.*?\]\(.*?\)/g, "")
                      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
                      .replace(/[#*`_~>-]/g, " ")
                      .replace(/\s+/g, " ")
                      .trim();

                    return (
                      <div
                        key={n.id}
                        className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-all min-h-[220px]"
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {n.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setViewingNotice(n)}
                                className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                title="View Full Circular"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditNotice(n)}
                                className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                title="Edit Notice"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem("/academic/admin/notices/", n.id, n.title, loadAdminData)}
                                className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                                title="Delete Notice"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <h4 className="mt-3 font-display text-sm sm:text-base font-bold text-foreground line-clamp-2 leading-snug">
                            {n.title}
                          </h4>

                          <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {snippet || "Official department circular details."}
                          </p>

                          <button
                            type="button"
                            onClick={() => setViewingNotice(n)}
                            className="mt-2.5 font-bold text-primary hover:underline text-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Read Full Circular...</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground mt-4">
                          <div className="flex flex-wrap items-center gap-1.5 font-medium">
                            <span className="font-semibold text-foreground text-[0.68rem]">Target:</span>
                            {n.is_broadcast_all ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400">
                                🌐 Universal All
                              </span>
                            ) : (
                              <>
                                {(n.department_code || n.department_name) && (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                                    🏢 {n.department_code || n.department_name}
                                  </span>
                                )}
                                {n.program_name && (
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-surface border border-border px-2 py-0.5 text-[0.68rem] font-bold text-foreground truncate max-w-[150px]">
                                    🎓 {n.program_name}
                                  </span>
                                )}
                                {n.target_semester && (
                                  <span className="inline-flex items-center rounded-lg bg-surface border border-border px-2 py-0.5 text-[0.68rem] font-bold text-foreground">
                                    Sem {n.target_semester}
                                  </span>
                                )}
                                {n.target_section && (
                                  <span className="inline-flex items-center rounded-lg bg-surface border border-border px-2 py-0.5 text-[0.68rem] font-bold text-foreground">
                                    Sec {n.target_section}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <span className="font-mono text-[0.65rem] font-bold px-1.5 py-0.5 rounded bg-surface border border-border">{n.priority}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATION 6: EXAMINATION MILESTONES & COUNTDOWNS */}
          {/* ========================================================================= */}
          {activeStation === "milestones" && (
            <div className="space-y-6">
              {renderCascadingContextBar({})}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">Examination Milestone Countdowns</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure Real Examination Dates Broadcasted Live To Student Timetable &amp; Planner Dashboards.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary font-mono">
                    Showing {filteredMilestones.length} Of {milestones.length} Milestones
                  </span>
                  <button
                    onClick={() => {
                      setEditingMilestoneId(null);
                      setNewMilestone({
                        title: "",
                        target_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
                        category: "Mid-Semester Theory Exams",
                        semester: selectedSemester || 1,
                        tag: "Term 1",
                      });
                      setShowMilestoneModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Exam Milestone Countdown</span>
                  </button>
                </div>
              </div>

              {/* Milestones Cards Grid */}
              {filteredMilestones.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <h3 className="font-display font-bold text-base text-foreground">No Exam Milestone Countdowns Added Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Add Official Examination Countdowns (E.g. Mid-Semester Theory Exams, Final Viva Voce) To Broadcast Live Remaining Days On Student Dashboards.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMilestones.map((m) => (
                    <div key={m.id} className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all">
                      <div>
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                          <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 font-mono">
                            {m.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditMilestone(m)}
                              className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                              title="Edit Milestone"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem("/planner/admin/milestones/", m.id, m.title, loadAdminData)}
                              className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                              title="Delete Milestone"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <h4 className="mt-3 font-display font-bold text-base text-foreground">{m.title}</h4>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
                          <span>Date: {m.target_date}</span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-bold">Sem {m.semester}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                        <span className="text-muted-foreground font-semibold">Remaining Countdown:</span>
                        <span className="rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 text-xs font-bold font-mono">
                          {calculateDaysRemaining(m.target_date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATION 7: STUDENT REGISTRY & SECURITY SHIELD */}
          {/* ========================================================================= */}
          {activeStation === "students" && (
            <div className="space-y-6">
              {renderCascadingContextBar({ showSection: true })}

              {/* Platform-Wide Master DRM Protection Control Card */}
              <div className={cn(
                "rounded-3xl border p-5 sm:p-6 transition-all shadow-xs space-y-4",
                isDrmDisabled
                  ? "border-amber-500/50 bg-amber-500/5"
                  : "border-emerald-500/40 bg-emerald-500/5"
              )}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border",
                      isDrmDisabled
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    )}>
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-bold text-sm sm:text-base text-foreground leading-snug">
                          Platform-Wide Master DRM Document Protection Engine
                        </h3>
                        <span className={cn(
                          "inline-flex items-center whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border shadow-2xs",
                          isDrmDisabled
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        )}>
                          {isDrmDisabled ? "DRM CURRENTLY STOPPED" : "DRM ACTIVELY ENFORCED"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isDrmDisabled
                          ? "All DRM Document Protections, Screenshot Blocker Shields, Blur Overlays, and Keyboard Shortcut Restrictions Are Completely STOPPED For All Users."
                          : "DRM Document Protections Are Actively Securing PDFs, Notes Manuscripts, Preventing Screenshots, Blocking PrintScreen, And Sanitizing Clipboards."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const nextState = !isDrmDisabled;
                      setIsDrmDisabled(nextState);
                      setDrmGloballyDisabled(nextState);
                      try {
                        const res = await globalDrmApi.updateConfig(!nextState);
                        if (nextState) {
                          toast.warning("Master DRM Protection Stopped Platform-Wide For All Users.");
                        } else {
                          toast.success("Master DRM Protection Actively Enforced Platform-Wide.");
                        }
                        loadAdminData();
                      } catch (err: any) {
                        toast.error(toTitleCase(err.message || "Failed To Update Global DRM Engine Status."));
                      }
                    }}
                    className={cn(
                      "h-10 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap",
                      isDrmDisabled
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-amber-600 hover:bg-amber-500 text-white"
                    )}
                  >
                    <Zap className="h-4 w-4" />
                    <span>{isDrmDisabled ? "Activate Master DRM Platform-Wide" : "Completely Stop DRM Platform-Wide"}</span>
                  </button>
                </div>
              </div>

              {/* Station 7 Navigation Sub-Tabs & Context Actions */}
              <div className="flex flex-col gap-4 border-b border-border pb-5 w-full">
                {/* Executive Segmented Navigation Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 rounded-2xl sm:rounded-3xl bg-surface/90 dark:bg-zinc-900/90 border border-border/80 shadow-2xs backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setStudentSubTab("registry")}
                    className={cn(
                      "flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      studentSubTab === "registry"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                    )}
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="truncate">Scholars Registry &amp; DRM</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[0.62rem] font-mono font-bold shrink-0",
                      studentSubTab === "registry"
                        ? "bg-white/20 text-white"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {filteredStudents.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentSubTab("audit")}
                    className={cn(
                      "flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      studentSubTab === "audit"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                    )}
                  >
                    <History className="h-4 w-4 shrink-0" />
                    <span className="truncate">Audit Log Vault</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[0.62rem] font-mono font-bold shrink-0",
                      studentSubTab === "audit"
                        ? "bg-white/20 text-white"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {auditLogs.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentSubTab("incidents")}
                    className={cn(
                      "flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      studentSubTab === "incidents"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                    )}
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span className="truncate">DRM Telemetry</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[0.62rem] font-mono font-bold shrink-0",
                      studentSubTab === "incidents"
                        ? "bg-white/20 text-white"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {drmIncidents.length}
                    </span>
                  </button>
                </div>

                {/* Sub-Station Operational Actions Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {studentSubTab === "audit" && (
                      <button
                        type="button"
                        onClick={handleClearAuditLogs}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 shadow-2xs hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear Audit Vault ({auditLogs.length})</span>
                      </button>
                    )}

                    {studentSubTab === "incidents" && (
                      <button
                        type="button"
                        onClick={handleClearDrmIncidents}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 shadow-2xs hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear DRM Telemetry ({drmIncidents.length})</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const confirmed = confirm(
                          "✨ GLOBAL CLEAN SLATE CONFIRMATION:\n\nAre You Sure You Want To Reset And Clear All DRM Locks, Login Suspensions, Cooldown Periods, Warning Banners, And Security Violation Counters For EVERY Registered Student Across The Entire Platform?"
                        );
                        if (!confirmed) return;

                        try {
                          const res = await studentSecurityApi.bulkResetSecurity(
                            "Global Administrative Clean Slate Reset For All Students"
                          );
                          toast.success(toTitleCase(res.message || "Global Clean Slate Reset Completed Successfully."));
                          loadAdminData();
                        } catch (err: any) {
                          toast.error(toTitleCase(err.message || "Failed To Execute Global Reset."));
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Global Clean Slate (Reset All)</span>
                    </button>

                    <button
                      type="button"
                      onClick={loadAdminData}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs hover:bg-surface active:scale-95 transition-all cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh Registry</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* TAB 1: SCHOLARS REGISTRY */}
              {studentSubTab === "registry" && (
                <div className="space-y-4">
                  {filteredStudents.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Registered Scholars Found For Active Filter</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Scholars Enrolled In The Selected Department, Program, And Cohort Section Will Appear Here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface/80 border-b border-border/80 text-[0.65rem] uppercase font-bold text-muted-foreground tracking-wider">
                          <tr>
                            <th className="p-4">Scholar &amp; Credentials</th>
                            <th className="p-4">Cohort &amp; Program</th>
                            <th className="p-4">DRM Access</th>
                            <th className="p-4">Login Status</th>
                            <th className="p-4">Cooldown / Lock</th>
                            <th className="p-4">Violations</th>
                            <th className="p-4 text-right">Security Shield</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {filteredStudents.map((st) => {
                            const hasActiveCooldown = st.cooldown_until && new Date(st.cooldown_until) > new Date();
                            return (
                              <tr key={st.id} className="hover:bg-surface/50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold text-xs shrink-0">
                                      {st.full_name?.charAt(0) || "S"}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-bold text-foreground block truncate">{st.full_name || "Scholar"}</span>
                                      <span className="text-[0.65rem] text-muted-foreground block truncate">{st.email}</span>
                                      <span className="text-[0.65rem] font-mono text-primary font-semibold">{st.roll_number || "—"}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-0.5">
                                    <span className="font-semibold text-foreground block">{st.program || "B.Tech"}</span>
                                    <span className="font-mono text-muted-foreground text-[0.68rem]">
                                      Sem {st.semester} · Sec {st.section}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  {st.is_drm_blocked ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 text-[0.65rem] font-bold">
                                      <Lock className="h-3 w-3" />
                                      <span>Blocked</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[0.65rem] font-bold">
                                      <ShieldCheck className="h-3 w-3" />
                                      <span>Allowed</span>
                                    </span>
                                  )}
                                </td>
                                <td className="p-4">
                                  {st.is_login_blocked || st.is_active === false ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 text-[0.65rem] font-bold">
                                      <UserX className="h-3 w-3" />
                                      <span>Suspended</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[0.65rem] font-bold">
                                      <UserCheck className="h-3 w-3" />
                                      <span>Active</span>
                                    </span>
                                  )}
                                </td>
                                <td className="p-4">
                                  {hasActiveCooldown ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-[0.65rem] font-bold font-mono">
                                      <Timer className="h-3 w-3" />
                                      <span>In Cooldown</span>
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-[0.7rem]">—</span>
                                  )}
                                </td>
                                <td className="p-4 font-mono">
                                  {(st.drm_violations_count || 0) > 0 ? (
                                    <span className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 text-[0.65rem] font-bold">
                                      {st.drm_violations_count} Alerts
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-[0.7rem]">0 Clean</span>
                                  )}
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedStudentForAction(st);
                                        setSecurityActionForm({
                                          action_type: st.is_drm_blocked ? "UNBLOCK_DRM" : "BLOCK_DRM",
                                          reason: "",
                                          cooldown_hours: 24,
                                          warning_message: "",
                                          access_tier: st.access_tier || "SEMESTER_TOPPER",
                                        });
                                        setShowSecurityModal(true);
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                                    >
                                      <Shield className="h-3.5 w-3.5" />
                                      <span>Security Controls</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedStudentForAction(st);
                                        setSecurityActionForm({
                                          action_type: "RESET_FRESH_USER",
                                          reason: "Reset student account to 100% fresh clean slate.",
                                          cooldown_hours: 24,
                                          warning_message: "",
                                          access_tier: st.access_tier || "SEMESTER_TOPPER",
                                        });
                                        setShowSecurityModal(true);
                                      }}
                                      title="Make Account Fresh (Clear All Locks, Cooldowns & Violations)"
                                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 p-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shadow-2xs"
                                    >
                                      <Sparkles className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedStudentForAction(st);
                                        setSecurityActionForm({
                                          action_type: "HARD_DELETE_USER",
                                          reason: "Permanent Administrative Hard Delete",
                                          cooldown_hours: 24,
                                          warning_message: "",
                                          access_tier: st.access_tier || "SEMESTER_TOPPER",
                                        });
                                        setShowSecurityModal(true);
                                      }}
                                      title="Permanent Hard Delete Account"
                                      className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 p-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-2xs"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: IMMUTABLE AUDIT LOG VAULT */}
              {studentSubTab === "audit" && (
                <div className="space-y-4">
                  {/* Audit Filters Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/50 p-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        placeholder="Search By Admin, Scholar Email, Or Justification Reason..."
                        value={auditSearchQuery}
                        onChange={(e) => setAuditSearchQuery(e.target.value)}
                        className="h-8 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={auditFilterAction}
                        onChange={(e) => setAuditFilterAction(e.target.value)}
                        className="h-8 rounded-xl border border-border bg-card px-2.5 text-xs font-bold focus:border-primary focus:outline-none"
                      >
                        <option value="ALL">All Action Types</option>
                        <option value="RESET_FRESH_USER">Reset User To Fresh Slate</option>
                        <option value="GLOBAL_BULK_RESET">Global Reset Of All Security Locks</option>
                        <option value="BLOCK_DRM">Block DRM Content Access</option>
                        <option value="UNBLOCK_DRM">Unblock DRM Content Access</option>
                        <option value="SUSPEND_LOGIN">Suspend User Login</option>
                        <option value="UNBAN_LOGIN">Reactivate User Login</option>
                        <option value="SET_COOLDOWN">Set Security Cooldown</option>
                        <option value="REMOVE_COOLDOWN">Remove Security Cooldown</option>
                        <option value="DISPATCH_WARNING">Dispatch Disciplinary Warning</option>
                        <option value="REVOKE_SESSIONS">Revoke All Security Sessions</option>
                        <option value="RESET_VIOLATIONS">Reset Violations Counter</option>
                        <option value="CHANGE_TIER">Change Access Tier</option>
                        <option value="HARD_DELETE_USER">Hard Delete User Account</option>
                      </select>

                      <button
                        onClick={handleClearAuditLogs}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                        title="Permanently Purge Audit Records"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear Logs</span>
                      </button>
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  {auditLogs.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <History className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Audit Records Logged Yet</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Every Administrative Security Action, Cooldown Setting, And Disciplinary Warning Will Be Persisted Immutably Here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface/80 border-b border-border/80 text-[0.65rem] uppercase font-bold text-muted-foreground tracking-wider">
                          <tr>
                            <th className="p-4">Timestamp &amp; IP</th>
                            <th className="p-4">Administrative Actor</th>
                            <th className="p-4">Action Type</th>
                            <th className="p-4">Target Scholar</th>
                            <th className="p-4">Mandatory Justification Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {auditLogs
                            .filter((log) => {
                              const matchesAction = auditFilterAction === "ALL" || log.action_type === auditFilterAction;
                              const matchesSearch =
                                !auditSearchQuery.trim() ||
                                (log.actor_email || "").toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                                (log.target_email || "").toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                                (log.reason || "").toLowerCase().includes(auditSearchQuery.toLowerCase());
                              return matchesAction && matchesSearch;
                            })
                            .map((log) => (
                              <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                                <td className="p-4">
                                  <div className="space-y-0.5 font-mono">
                                    <span className="font-bold text-foreground block">
                                      {new Date(log.timestamp).toLocaleString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <span className="text-[0.65rem] text-muted-foreground">{log.ip_address || "127.0.0.1"}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-foreground block">{log.actor_name || "Admin Staff"}</span>
                                    <span className="text-[0.65rem] text-muted-foreground font-mono">{log.actor_email}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span
                                    className={cn(
                                      "inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold",
                                      log.action_type.includes("BLOCK") || log.action_type.includes("SUSPEND")
                                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                        : log.action_type.includes("UNBLOCK") || log.action_type.includes("UNBAN")
                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                        : "bg-primary/10 text-primary"
                                    )}
                                  >
                                    {log.action_type.replace(/_/g, " ")}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-foreground block">{log.target_name || "Scholar"}</span>
                                    <span className="text-[0.65rem] text-muted-foreground font-mono">{log.target_email}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <p className="text-xs text-foreground/90 max-w-md line-clamp-2 leading-relaxed">
                                    {log.reason}
                                  </p>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DRM SECURITY INCIDENT TELEMETRY */}
              {studentSubTab === "incidents" && (
                <div className="space-y-4">
                  {/* Incident Filters Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/50 p-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={incidentFilterType}
                        onChange={(e) => setIncidentFilterType(e.target.value)}
                        className="h-8 rounded-xl border border-border bg-card px-2.5 text-xs font-bold focus:border-primary focus:outline-none"
                      >
                        <option value="ALL">All Telemetry Events</option>
                        <option value="DEVTOOLS_DETECTED">DevTools Inspector Opened</option>
                        <option value="SCREEN_CAPTURE_ATTEMPT">Screen Capture Attempt</option>
                        <option value="RAPID_PRINT_ATTEMPT">Print Key Shortcut Blocked</option>
                        <option value="BLUR_PROTECTION">Canvas Window Focus Lost</option>
                      </select>

                      <button
                        onClick={handleClearDrmIncidents}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                        title="Permanently Purge DRM Telemetry Incidents"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear Telemetry</span>
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      Real-Time Forensic Watermark Triggers
                    </span>
                  </div>

                  {drmIncidents.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <ShieldCheck className="h-10 w-10 mx-auto text-emerald-500/40" />
                      <h3 className="font-display font-bold text-base text-foreground">Zero DRM Violations Detected</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Forensic Watermark Canvas Is Active. Any Browser Inspection, Screen Capture, Or Print Attempt Will Trigger Real-Time Security Alerts Here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface/80 border-b border-border/80 text-[0.65rem] uppercase font-bold text-muted-foreground tracking-wider">
                          <tr>
                            <th className="p-4">Timestamp &amp; IP</th>
                            <th className="p-4">Scholar</th>
                            <th className="p-4">Material Document</th>
                            <th className="p-4">Security Incident Event</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {drmIncidents
                            .filter((inc) => incidentFilterType === "ALL" || inc.event_type === incidentFilterType)
                            .map((inc) => (
                              <tr key={inc.id} className="hover:bg-surface/50 transition-colors">
                                <td className="p-4 font-mono">
                                  <span className="font-bold text-foreground block">
                                    {new Date(inc.timestamp).toLocaleString("en-IN", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="text-[0.65rem] text-muted-foreground">{inc.client_ip || "127.0.0.1"}</span>
                                </td>
                                <td className="p-4">
                                  <span className="font-bold text-foreground block">{inc.user_name || "Scholar"}</span>
                                  <span className="text-[0.65rem] text-muted-foreground font-mono">{inc.user_email}</span>
                                </td>
                                <td className="p-4">
                                  <span className="font-semibold text-foreground">{inc.material_title || "Protected Document"}</span>
                                </td>
                                <td className="p-4">
                                  <span className="rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 text-[0.65rem] font-bold font-mono">
                                    {inc.event_type}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATION 8: SIDEBAR BADGES & LIVE TAGS */}
          {/* ========================================================================= */}
          {activeStation === "badges" && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">Student Sidebar Navigation Badges</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customize Live Highlight Pills, Badges, And Feature Tags Displayed In The Student Workspace Sidebar.
                  </p>
                </div>
                <button
                  onClick={loadAdminData}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-xs hover:bg-surface cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reload Badge State</span>
                </button>
              </div>

              {/* Badges Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { id: "notes", label: "Handwritten Notes", icon: BookOpen, desc: "Notes & Unit Summaries" },
                  { id: "pyqs", label: "Solved PYQs", icon: FileCheck2, desc: "Previous Year Question Papers" },
                  { id: "faculty", label: "Faculty Resources", icon: LibraryBig, desc: "Official Professor Handouts" },
                  { id: "labs", label: "Labs & Viva Voce", icon: FlaskConical, desc: "Practical Experiments & Flashcards" },
                  { id: "assignments", label: "Assignment Tracker", icon: FileText, desc: "Continuous Evaluation & AI Outlines" },
                  { id: "planner", label: "Timetable & Planner", icon: Calendar, desc: "Live Schedule & Milestone Countdowns" },
                  { id: "notices", label: "Department Notices", icon: Bell, desc: "Official Circulars & Exam Notifications" },
                  { id: "community-forum", label: "Community Forum", icon: MessageSquare, desc: "Public Discussion Threads" },
                  { id: "student-desk", label: "Student Support Desk", icon: HelpCircle, desc: "Direct Query Resolution" },
                ].map((item) => {
                  const Icon = item.icon;
                  const currentDraft = editingBadge[item.id] || {
                    badge_text: "",
                    badge_variant: "emerald",
                    is_active: false,
                  };

                  return (
                    <div key={item.id} className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-sm text-foreground">{item.label}</h4>
                              <p className="text-[0.65rem] text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[0.6rem] font-bold",
                              currentDraft.is_active
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted/40 text-muted-foreground",
                            )}
                          >
                            {currentDraft.is_active ? "Active" : "Hidden"}
                          </span>
                        </div>

                        {/* Live Simulation Preview */}
                        <div className="rounded-2xl border border-border/60 bg-surface/50 p-3 space-y-1.5">
                          <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider block">
                            Student Sidebar Simulation:
                          </span>
                          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{item.label}</span>
                            </div>
                            {currentDraft.is_active && currentDraft.badge_text ? (
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[0.6rem] font-bold tracking-wide",
                                  currentDraft.badge_variant === "amber"
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                    : currentDraft.badge_variant === "purple"
                                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                    : currentDraft.badge_variant === "rose"
                                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                    : currentDraft.badge_variant === "cyan"
                                    ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                                    : currentDraft.badge_variant === "blue"
                                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                                )}
                              >
                                {currentDraft.badge_text}
                              </span>
                            ) : (
                              <span className="text-[0.65rem] text-muted-foreground/60 italic font-normal">No Badge</span>
                            )}
                          </div>
                        </div>

                        {/* Form Inputs */}
                        <div className="space-y-2.5 pt-1 text-xs">
                          <div>
                            <label className="block font-bold mb-1 text-muted-foreground">Badge Text / Label</label>
                            <input
                              type="text"
                              value={currentDraft.badge_text}
                              onChange={(e) =>
                                setEditingBadge({
                                  ...editingBadge,
                                  [item.id]: {
                                    ...currentDraft,
                                    badge_text: e.target.value,
                                  },
                                })
                              }
                              placeholder="E.g. Topper, 2020–25, 50+ Q&A, AI Tool, Live, New..."
                              className="h-9 w-full rounded-xl border border-border bg-background px-3 font-semibold text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block font-bold mb-1 text-muted-foreground">Badge Color Variant</label>
                              <select
                                value={currentDraft.badge_variant}
                                onChange={(e) =>
                                  setEditingBadge({
                                    ...editingBadge,
                                    [item.id]: {
                                      ...currentDraft,
                                      badge_variant: e.target.value,
                                    },
                                  })
                                }
                                className="h-9 w-full rounded-xl border border-border bg-background px-2.5 font-semibold text-foreground focus:border-primary focus:outline-none"
                              >
                                <option value="emerald">Emerald Green</option>
                                <option value="amber">Amber Gold</option>
                                <option value="purple">Royal Purple</option>
                                <option value="rose">Crimson Rose</option>
                                <option value="cyan">Cyan Tech</option>
                                <option value="blue">Sapphire Blue</option>
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold mb-1 text-muted-foreground">Display Visibility</label>
                              <select
                                value={currentDraft.is_active ? "true" : "false"}
                                onChange={(e) =>
                                  setEditingBadge({
                                    ...editingBadge,
                                    [item.id]: {
                                      ...currentDraft,
                                      is_active: e.target.value === "true",
                                    },
                                  })
                                }
                                className="h-9 w-full rounded-xl border border-border bg-background px-2.5 font-semibold text-foreground focus:border-primary focus:outline-none"
                              >
                                <option value="true">Visible (Active)</option>
                                <option value="false">Hidden (Disabled)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSaveBadge(item.id)}
                        className="h-9 w-full rounded-xl bg-primary font-bold text-xs text-primary-foreground shadow-xs hover:bg-primary-deep cursor-pointer transition-all active:scale-[0.98]"
                      >
                        Save Badge Configuration
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATION 8: BROADCAST & PROMOTIONAL BANNERS */}
          {/* ========================================================================= */}
          {activeStation === "banners" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-w-0">
              {/* Header Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                    <Radio className="h-3.5 w-3.5" />
                    <span>Real-Time Broadcast Network</span>
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                    Announcement &amp; Promotional Broadcast Banners
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Deploy Glowing Multi-Color Announcement Strips, Hackathon Promos, and Urgent Alerts across Student Dashboards &amp; Public Site.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingBannerId(null);
                      setNewBanner({
                        title: "",
                        message: "",
                        tag: "Announcement",
                        variant: "emerald",
                        target: "ALL",
                        link_url: "",
                        link_text: "Learn More",
                        is_active: true,
                        is_dismissible: true,
                        priority: 10,
                      });
                      setBannerPreviewTab("write");
                      setShowBannerModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Deploy New Banner</span>
                  </button>
                </div>
              </div>

              {/* Live Real-Time Interactive Simulation Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Live Simulation (How Students See It Right Now)</span>
                  </span>
                  <span className="text-[0.68rem] font-mono text-muted-foreground">
                    Active Streams: {banners.filter((b) => b.is_active).length}
                  </span>
                </div>
                <div className="rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-5 shadow-xs">
                  {banners.filter((b) => b.is_active).length > 0 ? (
                    <BroadcastBanner
                      target="ALL"
                      previewBanners={banners.filter((b) => b.is_active)}
                      ignoreDismissed={true}
                    />
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground italic">
                      No Active Banners Broadcasting Right Now. Click "Deploy New Banner" Or Activate An Existing Banner Below.
                    </div>
                  )}
                </div>
              </div>

              {/* KPI Summary Metric Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                  <span className="block text-[0.65rem] font-bold uppercase text-muted-foreground">Total Banners</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-foreground mt-0.5 block">{banners.length}</span>
                  <span className="text-[0.65rem] text-muted-foreground">All Time Configured</span>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-xs">
                  <span className="block text-[0.65rem] font-bold uppercase text-emerald-700 dark:text-emerald-300">Live Active</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {banners.filter((b) => b.is_active).length}
                  </span>
                  <span className="text-[0.65rem] text-emerald-700/80 dark:text-emerald-300/80">Broadcasting Live</span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                  <span className="block text-[0.65rem] font-bold uppercase text-muted-foreground">Dashboard Targets</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-foreground mt-0.5 block">
                    {banners.filter((b) => b.target === "ALL" || b.target === "DASHBOARD").length}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground">Student Portal streams</span>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                  <span className="block text-[0.65rem] font-bold uppercase text-muted-foreground">Landing Site Targets</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-foreground mt-0.5 block">
                    {banners.filter((b) => b.target === "ALL" || b.target === "WEBSITE").length}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground">Public Website Strips</span>
                </div>
              </div>

              {/* Banners Feed Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-foreground">Configured Banner Streams ({banners.length})</h4>
                  <span className="text-[0.68rem] text-muted-foreground font-mono">1-Click Toggle to Activate / Deactivate</span>
                </div>

                {banners.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                    <Radio className="h-10 w-10 mx-auto text-muted-foreground/40" />
                    <h4 className="font-display font-bold text-base text-foreground">No Broadcast Banners Created Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Create Your First Promotional Or Announcement Banner To Broadcast Hackathons, Exam Countdowns, Or Alerts.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {banners.map((b) => {
                      const bannerSnippet = (b.message || "")
                        .replace(/!\[.*?\]\(.*?\)/g, "")
                        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
                        .replace(/[#*`_~>-]/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();

                      return (
                        <div
                          key={b.id}
                          className={cn(
                            "rounded-3xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all min-h-[220px]",
                            b.is_active
                              ? "border-emerald-500/40 bg-card hover:border-emerald-500/70"
                              : "border-border/80 bg-card/50 opacity-85 hover:opacity-100"
                          )}
                        >
                          <div className="space-y-3">
                            {/* Card Top: Badges + Action Buttons */}
                            <div className="flex items-center justify-between border-b border-border/60 pb-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase",
                                    b.variant === "amber" && "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
                                    b.variant === "rose" && "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
                                    b.variant === "purple" && "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
                                    b.variant === "cyan" && "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30",
                                    b.variant === "gradient" && "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-teal-300 border border-emerald-500/30",
                                    b.variant === "emerald" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  )}
                                >
                                  {b.tag || b.variant}
                                </span>

                                <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[0.62rem] font-mono font-bold text-muted-foreground">
                                  {b.target === "ALL" ? "All Channels" : b.target === "DASHBOARD" ? "Dashboard" : "Website"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setViewingBanner(b)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  title="View Banner Card"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditBanner(b)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                                  title="Edit Banner"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem("/academic/admin/banners/", b.id, b.title, loadAdminData)}
                                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                                  title="Delete Banner"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Banner Headline & Message */}
                            <div>
                              <h4 className="font-display font-bold text-sm text-foreground leading-snug">{b.title}</h4>
                              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {bannerSnippet || "Live promotional banner announcement."}
                              </p>
                              <button
                                type="button"
                                onClick={() => setViewingBanner(b)}
                                className="mt-1 font-bold text-primary hover:underline text-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span>View Live Card...</span>
                              </button>
                            </div>

                          {/* Link Preview if exists */}
                          {b.link_url && (
                            <div className="rounded-xl border border-border/60 bg-surface/60 px-3 py-2 text-[0.7rem] flex items-center justify-between gap-2">
                              <span className="font-semibold text-foreground truncate">
                                Button: "{b.link_text || "Learn More"}"
                              </span>
                              <span className="font-mono text-muted-foreground text-[0.62rem] truncate max-w-[120px]">
                                {b.link_url}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Priority & 1-Click Toggle */}
                        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                          <span className="font-mono text-[0.68rem] text-muted-foreground">
                            Priority: {b.priority || 10}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleBannerActive(b)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] font-bold transition-all cursor-pointer shadow-2xs",
                              b.is_active
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                                : "bg-muted/50 text-muted-foreground border border-border hover:bg-surface"
                            )}
                          >
                            <span className={cn("h-2 w-2 rounded-full", b.is_active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40")} />
                            <span>{b.is_active ? "Live Active" : "Deactivated"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeStation === "support" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Student Support Desk &amp; Grievance Manager ({tickets.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Review Inquiries, Send Official Resolutions, And Chat Live On Ticket Threads
                  </p>
                </div>
                <button
                  onClick={() => loadAdminData()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>

              {/* Support Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-2xs">
                  <span className="text-[0.62rem] sm:text-[0.65rem] font-bold text-muted-foreground uppercase truncate block">Total Tickets</span>
                  <div className="text-lg sm:text-xl font-extrabold text-foreground mt-0.5">{tickets.length}</div>
                </div>
                <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-2xs">
                  <span className="text-[0.62rem] sm:text-[0.65rem] font-bold text-muted-foreground uppercase truncate block">Open (Pending)</span>
                  <div className="text-lg sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                    {tickets.filter((t) => t.status === "OPEN").length}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-2xs">
                  <span className="text-[0.62rem] sm:text-[0.65rem] font-bold text-muted-foreground uppercase truncate block">In Progress</span>
                  <div className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                    {tickets.filter((t) => t.status === "IN_PROGRESS").length}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-2xs">
                  <span className="text-[0.62rem] sm:text-[0.65rem] font-bold text-muted-foreground uppercase truncate block">Resolved</span>
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {tickets.filter((t) => t.status === "RESOLVED").length}
                  </div>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-4">
                {tickets.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                    <LifeBuoy className="mx-auto h-10 w-10 opacity-40 mb-2" />
                    <p className="font-bold text-sm">No Student Support Tickets In Queue</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
                      {/* Ticket Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-primary">{ticket.ticket_number || "NW-TKT"}</span>
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[0.65rem] font-bold">
                            {ticket.category || "GENERAL"}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold",
                              ticket.priority === "URGENT" ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" :
                              ticket.priority === "HIGH" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                              "bg-surface text-muted-foreground"
                            )}
                          >
                            {ticket.priority} Priority
                          </span>
                          <span className="text-[0.7rem] text-muted-foreground">
                            • Submitted by <strong>{ticket.user_name}</strong> ({ticket.user_email})
                            {ticket.user_program && ` • ${ticket.user_program} Sem ${ticket.user_semester || 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={ticket.status}
                            onChange={async (e) => {
                              try {
                                await communityApi.updateTicketStatus(ticket.id, e.target.value);
                                toast.success(`Ticket Status Updated To ${e.target.value}`);
                                loadAdminData();
                              } catch (err: any) {
                                toast.error("Failed To Update Status");
                              }
                            }}
                            className={cn(
                              "h-8 rounded-xl px-2.5 text-xs font-extrabold border cursor-pointer focus:outline-none",
                              ticket.status === "RESOLVED" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" :
                              ticket.status === "IN_PROGRESS" ? "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400" :
                              "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                            )}
                          >
                            <option value="OPEN">OPEN (Pending)</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>
                      </div>

                      {/* Ticket Body */}
                      <div className="space-y-1.5">
                        <h4 className="font-display text-base font-bold text-foreground">{ticket.subject}</h4>
                        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed bg-surface/40 p-3.5 rounded-2xl border border-border/50">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Follow-Up Messages Timeline */}
                      {(ticket.messages || []).length > 0 && (
                        <div className="space-y-2 border-l-2 border-primary/20 pl-4 py-1">
                          <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider block">
                            Conversation & Follow-Up Timeline:
                          </span>
                          {ticket.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={cn(
                                "rounded-xl p-3 text-xs shadow-2xs max-w-xl",
                                msg.is_staff_reply
                                  ? "bg-emerald-500/10 border border-emerald-500/25"
                                  : "bg-surface border border-border/80"
                              )}
                            >
                              <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground mb-1">
                                <span className="font-bold text-foreground">
                                  {msg.is_staff_reply ? "Staff / Support Admin" : msg.sender_name}
                                </span>
                                <span>{new Date(msg.created_at).toLocaleString()}</span>
                              </div>
                              <p className="text-foreground/90 whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Admin Quick Action Bar: Send Message & Formal Resolution */}
                      <div className="border-t border-border/50 pt-3 space-y-3">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const form = e.target as HTMLFormElement;
                              const input = form.elements.namedItem("reply_text") as HTMLInputElement;
                              const val = input.value.trim();
                              if (!val) return;
                              try {
                                await communityApi.sendTicketMessage(ticket.id, val);
                                toast.success("Staff Message Sent To Student!");
                                input.value = "";
                                loadAdminData();
                              } catch (err: any) {
                                toast.error("Failed To Send Message");
                              }
                            }}
                            className="flex items-center gap-2 w-full sm:flex-1"
                          >
                            <input
                              type="text"
                              name="reply_text"
                              placeholder="Send A Follow-Up Message Directly To Student..."
                              className="h-9 flex-1 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:border-primary"
                            />
                            <button
                              type="submit"
                              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-deep cursor-pointer"
                            >
                              Reply
                            </button>
                          </form>

                          {ticket.status !== "RESOLVED" && (
                            <button
                              onClick={async () => {
                                const resText = prompt("Enter Official Resolution Statement Sent To Student:", "Query Has Been Resolved By Department Admin.");
                                if (resText !== null) {
                                  try {
                                    await communityApi.resolveTicket(ticket.id, {
                                      admin_response: resText,
                                      status: "RESOLVED",
                                    });
                                    toast.success("Ticket Resolved With Official Resolution!");
                                    loadAdminData();
                                  } catch (err: any) {
                                    toast.error("Failed To Resolve Ticket");
                                  }
                                }
                              }}
                              className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer whitespace-nowrap shadow-xs"
                            >
                              Mark Resolved & Publish Resolution
                            </button>
                          )}
                        </div>

                        {ticket.admin_response && (
                          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs">
                            <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                              Current Official Resolution:
                            </span>
                            <p className="text-emerald-950 dark:text-emerald-100">{ticket.admin_response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeStation === "forum" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Community Forum Moderation &amp; Channel Studio ({posts.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pin Important Announcements, Lock Spam Threads, Delete Inappropriate Posts & Comments
                  </p>
                </div>
                <button
                  onClick={() => loadAdminData()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Forum</span>
                </button>
              </div>

              {/* Discussions List */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto h-10 w-10 opacity-40 mb-2" />
                    <p className="font-bold text-sm">No Forum Discussions To Moderate</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className={cn(
                        "rounded-3xl border bg-card p-5 sm:p-6 shadow-sm space-y-4",
                        post.is_pinned ? "border-amber-500/40 bg-amber-500/5" : "border-border"
                      )}
                    >
                      {/* Post Header & Control Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.is_pinned && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[0.65rem] font-extrabold text-amber-600 dark:text-amber-400">
                              <Pin className="h-3 w-3" /> Pinned
                            </span>
                          )}
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[0.65rem] font-bold">
                            #{post.category}
                          </span>
                          {post.is_locked && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[0.65rem] font-bold text-rose-500">
                              <Lock className="h-3 w-3" /> Locked
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            By <strong>{post.author_name}</strong> ({post.author_role || "Student"}) • {new Date(post.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={async () => {
                              try {
                                await communityApi.togglePinPost(post.id);
                                toast.success(post.is_pinned ? "Post Unpinned" : "Post Pinned!");
                                loadAdminData();
                              } catch {
                                toast.error("Pin Action Failed");
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-bold text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer"
                          >
                            <Pin className="h-3 w-3" />
                            <span>{post.is_pinned ? "Unpin" : "Pin"}</span>
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                await communityApi.toggleLockPost(post.id);
                                toast.success(post.is_locked ? "Post Unlocked" : "Post Locked!");
                                loadAdminData();
                              } catch {
                                toast.error("Lock Action Failed");
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-bold text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Lock className="h-3 w-3" />
                            <span>{post.is_locked ? "Unlock" : "Lock"}</span>
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm(`Permanently Delete Discussion: "${post.title}"?`)) {
                                try {
                                  await communityApi.deletePost(post.id);
                                  toast.success("Thread Deleted By Admin");
                                  loadAdminData();
                                } catch {
                                  toast.error("Failed To Delete Post");
                                }
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        <h4 className="font-display text-base font-bold text-foreground">{post.title}</h4>
                        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                        <div className="flex items-center gap-3 text-[0.7rem] text-muted-foreground pt-1">
                          <span>👍 {post.upvotes} Upvotes</span>
                          <span>💬 {post.comments_count || post.comments?.length || 0} Comments</span>
                        </div>
                      </div>

                      {/* Comments & Moderate Individual Comments */}
                      {(post.comments || []).length > 0 && (
                        <div className="border-t border-border/50 pt-3 space-y-2 bg-surface/30 p-3.5 rounded-2xl">
                          <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider block">
                            User Comments (Moderation Tree):
                          </span>
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="space-y-1.5">
                              <div className="rounded-xl border border-border/80 bg-card p-3 text-xs flex items-start justify-between gap-2 shadow-2xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-foreground">{comment.author_name}</span>
                                    {comment.is_staff && (
                                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[0.55rem] font-extrabold text-emerald-600 dark:text-emerald-400">
                                        Admin
                                      </span>
                                    )}
                                    <span className="text-[0.65rem] text-muted-foreground">
                                      • {new Date(comment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                  <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                                <button
                                  onClick={async () => {
                                    if (confirm("Delete this comment?")) {
                                      try {
                                        await communityApi.deleteComment(comment.id);
                                        toast.success("Comment Removed");
                                        loadAdminData();
                                      } catch {
                                        toast.error("Failed To Delete Comment");
                                      }
                                    }
                                  }}
                                  className="text-muted-foreground hover:text-rose-500 p-1 cursor-pointer"
                                  title="Delete Comment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Nested Replies Moderation */}
                              {(comment.replies || []).map((reply) => (
                                <div key={reply.id} className="ml-6 pl-3 border-l-2 border-primary/20">
                                  <div className="rounded-xl border border-border/60 bg-card/80 p-2.5 text-xs flex items-start justify-between gap-2 shadow-2xs">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-foreground">{reply.author_name}</span>
                                        <span className="text-[0.65rem] text-muted-foreground">
                                          • {new Date(reply.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                      </div>
                                      <p className="text-foreground/90 whitespace-pre-wrap">{reply.content}</p>
                                    </div>
                                    <button
                                      onClick={async () => {
                                        if (confirm("Delete this reply?")) {
                                          try {
                                            await communityApi.deleteComment(reply.id);
                                            toast.success("Reply Removed");
                                            loadAdminData();
                                          } catch {
                                            toast.error("Failed To Delete Reply");
                                          }
                                        }
                                      }}
                                      className="text-muted-foreground hover:text-rose-500 p-1 cursor-pointer"
                                      title="Delete Reply"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ===================== Creation Modals ===================== */}

      {/* Modal: Create / Edit Department */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                {editingDeptId ? "Edit Department" : "Add Academic Department"}
              </h3>
              <button
                onClick={() => {
                  setShowDeptModal(false);
                  setEditingDeptId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDept} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Department Name</label>
                <input
                  type="text"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="Department of Computer Science & Engineering"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold mb-1">Code (Abbreviation)</label>
                  <input
                    type="text"
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                    placeholder="CSE"
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Head Of Department</label>
                  <input
                    type="text"
                    value={newDept.head_of_department}
                    onChange={(e) => setNewDept({ ...newDept, head_of_department: e.target.value })}
                    placeholder="Dr. Rajeshwar Sen"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  placeholder="Enter Department Scope and Curriculum Overview..."
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs focus:border-primary focus:outline-none"
                />
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer text-xs">
                {editingDeptId ? "Save Department Changes" : "Create Department"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Program / Specialization */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                {editingProgramId ? "Edit Degree Program / Specialization" : "Add Degree Program / Specialization"}
              </h3>
              <button
                onClick={() => {
                  setShowProgramModal(false);
                  setEditingProgramId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProgram} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Parent Department</label>
                <select
                  value={newProgram.department}
                  onChange={(e) => setNewProgram({ ...newProgram, department: e.target.value })}
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Specialization Full Name</label>
                <input
                  type="text"
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                  placeholder="e.g. B.Sc Forensic Science / B.Tech Computer Science"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Degree Level</label>
                <select
                  value={newProgram.degree_level}
                  onChange={(e) => setNewProgram({ ...newProgram, degree_level: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-semibold focus:border-primary focus:outline-none"
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Doctoral">Doctoral</option>
                  <option value="Certificate">Certificate</option>
                  {!["Undergraduate", "Postgraduate", "Diploma", "Doctoral", "Certificate"].includes(newProgram.degree_level) && (
                    <option value={newProgram.degree_level}>{newProgram.degree_level}</option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold mb-1">Code</label>
                  <input
                    type="text"
                    value={newProgram.code}
                    onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. BSC-FS / BTECH-CSE"
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    value={newProgram.duration_years}
                    onChange={(e) => setNewProgram({ ...newProgram, duration_years: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Total Semesters</label>
                  <input
                    type="number"
                    value={newProgram.total_semesters}
                    onChange={(e) => setNewProgram({ ...newProgram, total_semesters: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer text-xs">
                {editingProgramId ? "Save Specialization Changes" : "Create Specialization Program"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Section */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                {editingSectionId ? "Edit Semester Section Batch" : "Configure Semester Section Batch"}
              </h3>
              <button
                onClick={() => {
                  setShowSectionModal(false);
                  setEditingSectionId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSection} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Parent Program</label>
                <select
                  value={newSection.program}
                  onChange={(e) => setNewSection({ ...newSection, program: e.target.value })}
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                >
                  <option value="">Select Specialization...</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold mb-1">Semester (1–8)</label>
                  <select
                    value={newSection.semester}
                    onChange={(e) => setNewSection({ ...newSection, semester: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Section Code (A, B, C...)</label>
                  <input
                    type="text"
                    value={newSection.section}
                    onChange={(e) => setNewSection({ ...newSection, section: e.target.value.toUpperCase() })}
                    placeholder="A"
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono font-bold text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={newSection.academic_year}
                    onChange={(e) => setNewSection({ ...newSection, academic_year: e.target.value })}
                    placeholder="2026-2027"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono font-bold text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newSection.max_capacity}
                    onChange={(e) => setNewSection({ ...newSection, max_capacity: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer text-xs">
                {editingSectionId ? "Save Section Changes" : "Create Section Cohort"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register / Edit Subject */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="min-w-0 pr-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                  {editingSubjectId ? "Edit Course Subject" : "Register Course Subject"}
                </h3>
                <p className="text-[0.68rem] text-muted-foreground truncate">
                  Associate This Subject With One Or Multiple Degree Specializations.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSubjectModal(false);
                  setEditingSubjectId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} className="space-y-3.5 text-xs">
              {/* Multi-Select Parent Programs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold">
                    Parent Programs / Specializations
                    <span className="ml-1.5 text-xs text-primary font-mono">
                      ({newSubject.programs.length} selected)
                    </span>
                  </label>
                  <div className="flex items-center gap-2 text-[0.7rem]">
                    <button
                      type="button"
                      onClick={() => setNewSubject({ ...newSubject, programs: programs.map((p) => p.id) })}
                      className="text-primary hover:underline font-bold cursor-pointer"
                    >
                      Select All ({programs.length})
                    </button>
                    <span className="text-muted-foreground">·</span>
                    <button
                      type="button"
                      onClick={() => setNewSubject({ ...newSubject, programs: [] })}
                      className="text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Selected Programs Badges Preview */}
                {newSubject.programs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-surface/60 border border-border/80">
                    {newSubject.programs.map((pid) => {
                      const prog = programs.find((p) => p.id === pid);
                      if (!prog) return null;
                      return (
                        <span
                          key={pid}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs shadow-2xs"
                        >
                          <span className="font-mono">{prog.code}</span>
                          <span className="text-[0.7rem] text-muted-foreground font-normal max-w-[130px] truncate">
                            {prog.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setNewSubject({
                                ...newSubject,
                                programs: newSubject.programs.filter((id) => id !== pid),
                              })
                            }
                            className="hover:text-rose-500 cursor-pointer p-0.5 rounded ml-0.5"
                            title="Remove Program"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Program Selection Checkbox List */}
                <div className="max-h-44 overflow-y-auto space-y-1.5 p-1.5 rounded-2xl border border-border bg-background scrollbar-thin">
                  {programs.map((p) => {
                    const isSelected = newSubject.programs.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          const updated = isSelected
                            ? newSubject.programs.filter((id) => id !== p.id)
                            : [...newSubject.programs, p.id];
                          setNewSubject({ ...newSubject, programs: updated });
                        }}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none",
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground font-bold shadow-2xs"
                            : "border-border/60 bg-surface/30 hover:bg-surface text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // 
                            className="h-4 w-4 rounded accent-primary cursor-pointer shrink-0"
                          />
                          <div className="truncate text-left">
                            <p className="text-xs truncate">{p.name}</p>
                            <p className="text-[0.65rem] text-muted-foreground font-mono">
                              {p.code} · {p.degree_level}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[0.65rem] font-mono shrink-0 ml-2 font-bold",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface border border-border text-muted-foreground"
                          )}
                        >
                          {p.code}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Subject Full Name</label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="Programming For Problem Solving With C"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none font-semibold text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                    placeholder="CSM101B"
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono font-bold focus:border-primary focus:outline-none text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Short Name / Abbreviation</label>
                  <input
                    type="text"
                    value={newSubject.short_name}
                    onChange={(e) => setNewSubject({ ...newSubject, short_name: e.target.value.toUpperCase() })}
                    placeholder="PSC"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono font-bold text-violet-600 dark:text-violet-400 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Faculty Instructor Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newSubject.faculty_name}
                      onChange={(e) => setNewSubject({ ...newSubject, faculty_name: e.target.value })}
                      placeholder="Dr. Satyanand Gora"
                      className="h-10 w-full rounded-2xl border border-border bg-background pl-9 pr-3 focus:border-primary focus:outline-none text-foreground font-medium"
                    />
                    <GraduationCap className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">Semester</label>
                    <select
                      value={newSubject.semester}
                      onChange={(e) => setNewSubject({ ...newSubject, semester: Number(e.target.value) })}
                      className="h-10 w-full rounded-2xl border border-border bg-background px-2.5 focus:border-primary focus:outline-none font-semibold text-foreground"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Credits</label>
                    <input
                      type="number"
                      value={newSubject.credits}
                      onChange={(e) => setNewSubject({ ...newSubject, credits: Number(e.target.value) })}
                      min={1}
                      max={12}
                      className="h-10 w-full rounded-2xl border border-border bg-background px-2.5 font-bold focus:border-primary focus:outline-none text-foreground"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>{editingSubjectId ? "Save Subject Changes" : "Register Subject"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Publish / Edit Academic Study Material (Dual-Mode Studio: Multi-Page Composition & Direct Document Upload) */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl sm:max-w-3xl rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="min-w-0 pr-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                  {editingMaterialId
                    ? "Edit Academic Study Material"
                    : `Publish ${publisherType === "NOTES" ? "Unit Handwritten Notes" : publisherType === "SYLLABUS" ? "Official Syllabus Breakdown" : publisherType === "FACULTY" ? "Faculty Material" : "Solved University PYQ"}`}
                </h3>
                <p className="text-[0.68rem] text-muted-foreground truncate">
                  Compose page-by-page DRM manuscripts or upload full PDF/PPT courseware documents.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMaterialModal(false);
                  setEditingMaterialId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Publishing Mode Switcher Tab Bar */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface rounded-2xl border border-border">
              <button
                type="button"
                onClick={() => setMaterialUploadMode("STUDIO")}
                className={cn(
                  "py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer",
                  materialUploadMode === "STUDIO"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="h-4 w-4" />
                <span>Multi-Page Composition Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setMaterialUploadMode("FILE")}
                className={cn(
                  "py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer",
                  materialUploadMode === "FILE"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Upload className="h-4 w-4" />
                <span>Direct File Upload (PDF, PPT, DOC, TXT, MD)</span>
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
              {/* Primary Material Metadata (Subject, Unit/Year, Title) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Target Subject</label>
                  <select
                    value={newMaterial.subject || selectedSubjectId}
                    onChange={(e) => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  >
                    <option value="">Select Target Subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">
                    {publisherType === "NOTES" ? "Curriculum Unit (1–5)" : publisherType === "SYLLABUS" ? "Curriculum Unit / Module" : "Paper Unit / Module"}
                  </label>
                  <select
                    value={newMaterial.unit_number}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unit_number: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none font-semibold text-foreground"
                  >
                    {[1, 2, 3, 4, 5].map((u) => (
                      <option key={u} value={u}>Unit {u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Academic Session / Exam Year</label>
                  <input
                    type="text"
                    value={newMaterial.academic_year}
                    onChange={(e) => setNewMaterial({ ...newMaterial, academic_year: e.target.value })}
                    placeholder="2026-2027"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono font-bold text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Material Title</label>
                <input
                  type="text"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  placeholder="Unit 1: Intelligent Agents & State Space Heuristic Models"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Mode 1: Multi-Page Interactive Composition Studio */}
              {materialUploadMode === "STUDIO" && (
                <div className="space-y-3 border border-border rounded-2xl p-4 bg-surface/40">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                      <Layers className="h-4 w-4 text-primary" />
                      Document Pages ({materialPages.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextNum = materialPages.length > 0 
                          ? Math.max(...materialPages.map((p) => p.page_number)) + 1 
                          : 1;
                        const isPyq = publisherType === "SOLVED_PYQ";
                        const updated = [
                          ...materialPages,
                          {
                            page_number: nextNum,
                            page_title: isPyq ? `Question ${nextNum}` : `Unit ${newMaterial.unit_number || 1}: Section ${nextNum}`,
                            content_html: "",
                          },
                        ];
                        setMaterialPages(updated);
                        setActivePageIndex(updated.length - 1);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Next Page</span>
                    </button>
                  </div>

                  {/* Page Navigator Tabs Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                    {materialPages.map((p, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border",
                          activePageIndex === idx
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-card text-muted-foreground border-border hover:text-foreground"
                        )}
                        onClick={() => setActivePageIndex(idx)}
                      >
                        <span className="shrink-0">{publisherType === "SOLVED_PYQ" ? `Q${p.page_number}` : `Page ${p.page_number}`}</span>
                        {materialPages.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = materialPages.filter((_, i) => i !== idx);
                              setMaterialPages(updated);
                              setActivePageIndex(Math.max(0, idx - 1));
                            }}
                            className="hover:text-red-400 p-0.5 rounded ml-0.5"
                            title="Remove this page"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Active Page Editor Box */}
                  {materialPages[activePageIndex] && (() => {
                    const activePage = materialPages[activePageIndex]!;
                    return (
                      <div className="space-y-3 pt-3 border-t border-border/70">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="block font-bold mb-1 text-[0.7rem] text-muted-foreground">
                              {publisherType === "SOLVED_PYQ" ? "Question Number (e.g. 1, 2, etc.)" : "Page Number (e.g. 11, 12, etc.)"}
                            </label>
                            <input
                              type="number"
                              value={activePage.page_number}
                              onChange={(e) => {
                                const updated = [...materialPages];
                                if (updated[activePageIndex]) {
                                  updated[activePageIndex] = {
                                    ...updated[activePageIndex]!,
                                    page_number: Number(e.target.value) || 1,
                                  };
                                  setMaterialPages(updated);
                                }
                              }}
                              required
                              className="h-9 w-full rounded-xl border border-border bg-background px-2.5 font-bold focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block font-bold mb-1 text-[0.7rem] text-muted-foreground">
                              {publisherType === "SOLVED_PYQ" ? "Question Title / Subheading" : "Page Section Title"}
                            </label>
                            <input
                              type="text"
                              value={activePage.page_title}
                              onChange={(e) => {
                                const updated = [...materialPages];
                                if (updated[activePageIndex]) {
                                  updated[activePageIndex] = {
                                    ...updated[activePageIndex]!,
                                    page_title: e.target.value,
                                  };
                                  setMaterialPages(updated);
                                }
                              }}
                              placeholder="e.g.  Asymptotic Complexity & Proof Derivations"
                              className="h-9 w-full rounded-xl border border-border bg-background px-2.5 focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block font-bold text-[0.7rem] text-muted-foreground">
                              Page Manuscript Content (Markdown Supported)
                            </label>
                            {/* Quick Formatting Toolbar */}
                            <div className="flex items-center gap-1 text-[0.65rem]">
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = activePage.content_html;
                                  const updated = [...materialPages];
                                  if (updated[activePageIndex]) {
                                    updated[activePageIndex] = {
                                      ...updated[activePageIndex]!,
                                      content_html: cur + "\n**Bold Concept**: Description here",
                                    };
                                    setMaterialPages(updated);
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded bg-surface hover:bg-surface/80 border border-border font-bold"
                              >
                                **Bold**
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = activePage.content_html;
                                  const updated = [...materialPages];
                                  if (updated[activePageIndex]) {
                                    updated[activePageIndex] = {
                                      ...updated[activePageIndex]!,
                                      content_html: cur + "\n## Section Heading\n",
                                    };
                                    setMaterialPages(updated);
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded bg-surface hover:bg-surface/80 border border-border font-bold"
                              >
                                ## Header
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = activePage.content_html;
                                  const updated = [...materialPages];
                                  if (updated[activePageIndex]) {
                                    updated[activePageIndex] = {
                                      ...updated[activePageIndex]!,
                                      content_html: cur + "\n- Key derivation point\n- Model property",
                                    };
                                    setMaterialPages(updated);
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded bg-surface hover:bg-surface/80 border border-border font-bold"
                              >
                                • List
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = activePage.content_html;
                                  const updated = [...materialPages];
                                  if (updated[activePageIndex]) {
                                    updated[activePageIndex] = {
                                      ...updated[activePageIndex]!,
                                      content_html: cur + "\n```python\n# Algorithm Implementation\ndef algorithm():\n    pass\n```\n",
                                    };
                                    setMaterialPages(updated);
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded bg-surface hover:bg-surface/80 border border-border font-mono font-bold text-primary"
                              >
                                &lt;/&gt; Code
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={activePage.content_html}
                            onChange={(e) => {
                              const updated = [...materialPages];
                              if (updated[activePageIndex]) {
                                updated[activePageIndex] = {
                                  ...updated[activePageIndex]!,
                                  content_html: e.target.value,
                                };
                                setMaterialPages(updated);
                              }
                            }}
                            placeholder="Enter Formatted Study Material, Derivations, Code Blocks, or Exam Solutions for This Page..."
                            rows={6}
                            required
                            className="w-full rounded-2xl border border-border bg-background p-3 font-mono text-xs focus:border-primary focus:outline-none leading-relaxed"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Mode 2: Direct File Upload Zone */}
              {materialUploadMode === "FILE" && (
                <div className="space-y-3 border border-dashed border-border rounded-2xl p-6 bg-surface/40 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <label className="block font-bold text-sm text-foreground">
                      Upload Document / Slide Deck
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Supported formats: PDF, PPT, PPTX, DOC, DOCX, TXT, MD
                    </p>
                  </div>
                  <input
                    type="file"
                    id="materialFileInput"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setNewMaterial({ ...newMaterial, file: f });
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="materialFileInput"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer hover:bg-primary-deep shadow-sm transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{newMaterial.file ? "Change Attached Document" : "Browse & Select Document"}</span>
                  </label>

                  {newMaterial.file && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border text-left mt-2 max-w-md mx-auto">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-xs truncate text-foreground">{newMaterial.file.name}</p>
                          <p className="text-[0.65rem] text-muted-foreground font-mono">
                            {(newMaterial.file.size / 1024).toFixed(1)} KB · Ready For Secure DRM Delivery
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewMaterial({ ...newMaterial, file: null })}
                        className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-surface cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold mb-1">Summary / Key Topics Covered</label>
                <textarea
                  value={newMaterial.summary}
                  onChange={(e) => setNewMaterial({ ...newMaterial, summary: e.target.value })}
                  placeholder="Enter Key Derivations, Theorems, 10-Mark Questions and Syllabus Breakdown..."
                  rows={2}
                  className="w-full rounded-2xl border border-border bg-background p-3 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={newMaterial.tag_input}
                  onChange={(e) => setNewMaterial({ ...newMaterial, tag_input: e.target.value })}
                  placeholder="HighYield, Unit1, 10Marks, Verified"
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">
                    {materialUploadMode === "STUDIO" ? "Total Manuscript Pages" : "Estimated Page Count"}
                  </label>
                  <input
                    type="number"
                    value={materialUploadMode === "STUDIO" ? materialPages.length : newMaterial.page_count}
                    onChange={(e) => setNewMaterial({ ...newMaterial, page_count: Number(e.target.value) })}
                    disabled={materialUploadMode === "STUDIO"}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none disabled:opacity-60"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="topperVerifiedMat"
                    checked={newMaterial.is_topper_verified}
                    onChange={(e) => setNewMaterial({ ...newMaterial, is_topper_verified: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <label htmlFor="topperVerifiedMat" className="font-bold cursor-pointer">Topper Verified Badge</label>
                </div>
              </div>

              {/* Real-Time Document Upload Progress & Status Bar */}
              {isUploadingMaterial && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/20 text-primary">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">
                          {uploadStage === "PREPARING" && "Preparing Document Package..."}
                          {uploadStage === "UPLOADING" && `Uploading Document (${uploadProgress}%)...`}
                          {uploadStage === "PROCESSING" && "Processing DRM Protection & Generating Pages..."}
                          {uploadStage === "COMPLETE" && "Upload Completed Successfully!"}
                        </span>
                        <span className="text-[0.68rem] text-muted-foreground font-mono">
                          {uploadedBytesText} {uploadSpeedText ? `· ${uploadSpeedText}` : ""}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-base font-extrabold text-primary">
                      {uploadProgress}%
                    </span>
                  </div>

                  {/* Dynamic Animated Glowing Progress Bar */}
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface border border-border/80 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-primary transition-all duration-200 ease-out shadow-sm rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Encrypted High-Speed Chunked Transfer</span>
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">Please Do Not Close This Window</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploadingMaterial}
                className={cn(
                  "h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer flex items-center justify-center gap-2 text-sm transition-all active:scale-98",
                  isUploadingMaterial && "opacity-60 cursor-not-allowed"
                )}
              >
                {isUploadingMaterial ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>
                      {uploadStage === "PROCESSING"
                        ? "Processing DRM Security & Pages..."
                        : `Uploading (${uploadProgress}%)...`}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{editingMaterialId ? "Save Study Material Changes" : "Publish Study Material Live"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Lab Experiment & Multiple Viva Drills */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="min-w-0 pr-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                  {editingLabId ? "Edit Practical Experiment & Viva Drills" : "Add Practical Experiment & Viva Drills"}
                </h3>
                <p className="text-[0.68rem] text-muted-foreground truncate">Register full laboratory algorithms and multiple interactive viva examination questions.</p>
              </div>
              <button
                onClick={() => {
                  setShowLabModal(false);
                  setEditingLabId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLab} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Target Subject</label>
                  <select
                    value={newLab.subject || selectedSubjectId}
                    onChange={(e) => setNewLab({ ...newLab, subject: e.target.value })}
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  >
                    <option value="">Select Target Subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Experiment No.</label>
                  <input
                    type="number"
                    value={newLab.experiment_number}
                    onChange={(e) => setNewLab({ ...newLab, experiment_number: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Experiment Title</label>
                <input
                  type="text"
                  value={newLab.title}
                  onChange={(e) => setNewLab({ ...newLab, title: e.target.value })}
                  placeholder="Implementation of Breadth-First Search (BFS) for Water Jug Problem"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Objective / Aim</label>
                <textarea
                  value={newLab.aim}
                  onChange={(e) => setNewLab({ ...newLab, aim: e.target.value })}
                  placeholder="To Formulate State Space Graph and Find Shortest Sequence..."
                  rows={2}
                  required
                  className="w-full rounded-2xl border border-border bg-background p-3 focus:border-primary focus:outline-none"
                />
              </div>
              {/* Dynamic Multiple Verified Source Code Snippets Section */}
              <div className="space-y-3 pt-3 border-t border-border/70">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                    <Code2 className="h-4 w-4" />
                    Verified Source Code Snippets ({labCodes.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setLabCodes([...labCodes, { lang: "cpp", code: "" }])}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Language</span>
                  </button>
                </div>
                
                <div className="rounded-2xl border border-border/60 bg-surface/50 p-4 space-y-4">
                  {labCodes.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[0.7rem] font-bold text-muted-foreground flex items-center gap-2">
                          Language Name:
                          <input
                            type="text"
                            value={item.lang}
                            onChange={(e) => {
                              const newList = [...labCodes];
                              if (newList[index]) {
                                newList[index].lang = e.target.value;
                              }
                              setLabCodes(newList);
                            }}
                            placeholder="e.g.  Python, Cpp, Java"
                            className="bg-background border border-border rounded-lg px-2 py-1 focus:border-primary focus:outline-none w-32"
                          />
                        </label>
                        {labCodes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newList = [...labCodes];
                              newList.splice(index, 1);
                              setLabCodes(newList);
                            }}
                            className="text-muted-foreground hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={item.code}
                        onChange={(e) => {
                          const newList = [...labCodes];
                          if (newList[index]) {
                            newList[index].code = e.target.value;
                          }
                          setLabCodes(newList);
                        }}
                        placeholder={`Paste Verified ${item.lang || 'Source'} Code Implementation...`}
                        rows={4}
                        className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-mono focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Multiple Viva Voce Questions Section */}
              <div className="space-y-3 pt-3 border-t border-border/70">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-primary">
                    <Sparkles className="h-4 w-4" />
                    Interactive Viva Voce Drill Q&amp;A Cards ({vivaList.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setVivaList([...vivaList, { question: "", answer: "" }])}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Viva Question</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {vivaList.map((viva, vIdx) => (
                    <div key={vIdx} className="p-3.5 rounded-2xl border border-border bg-surface/40 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[0.7rem] text-muted-foreground">Viva Question #{vIdx + 1}</span>
                        {vivaList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setVivaList(vivaList.filter((_, i) => i !== vIdx))}
                            className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-surface cursor-pointer"
                            title="Delete this question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={viva.question}
                        onChange={(e) => {
                          const updated = [...vivaList];
                          if (updated[vIdx]) {
                            updated[vIdx] = { ...updated[vIdx]!, question: e.target.value };
                            setVivaList(updated);
                          }
                        }}
                        placeholder={`Viva Question #${vIdx + 1} (e.g. What is the time complexity?)`}
                        className="h-9 w-full rounded-xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                      />
                      <textarea
                        value={viva.answer}
                        onChange={(e) => {
                          const updated = [...vivaList];
                          if (updated[vIdx]) {
                            updated[vIdx] = { ...updated[vIdx]!, answer: e.target.value };
                            setVivaList(updated);
                          }
                        }}
                        placeholder="Expected Model Answer & Key Conceptual Explanation..."
                        rows={2}
                        className="w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer flex items-center justify-center gap-2 text-sm">
                <Sparkles className="h-4 w-4" />
                <span>{editingLabId ? "Save Lab Experiment & Viva Changes" : "Create Lab Experiment & Viva Drills"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Assignment */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                {editingAssignmentId ? "Edit Course Assignment" : "Create Course Assignment"}
              </h3>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setEditingAssignmentId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Subject</label>
                <select
                  value={newAssignment.subject || selectedSubjectId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                >
                  <option value="">Select Target Subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Assignment Title</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Continuous Evaluation: Heuristic Search & Alpha-Beta Pruning"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold mb-1">Submission Due Date</label>
                  <input
                    type="date"
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={newAssignment.total_marks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, total_marks: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Description &amp; Guidelines</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Enter Problem Specifications, Rubric Guidelines, and Formatting Requirements..."
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-background p-3 focus:border-primary focus:outline-none"
                />
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer">
                {editingAssignmentId ? "Save Assignment Changes" : "Broadcast Assignment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Timetable Slot */}
      {showTimetableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                {editingTimetableId ? "Edit Timetable Lecture Slot" : "Add Timetable Lecture Slot"}
              </h3>
              <button
                onClick={() => {
                  setShowTimetableModal(false);
                  setEditingTimetableId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* AI Photo Scanner Quick Shortcut Banner */}
            {!editingTimetableId && (
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-2.5 sm:p-3 text-xs text-purple-700 dark:text-purple-300">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="h-4 w-4 shrink-0 text-purple-500" />
                  <span className="text-[0.72rem] leading-tight">Have a photo of the schedule? Let Gemini AI extract all slots automatically.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowTimetableModal(false);
                    setAiTargetSemester(newTimetableSlot.semester || selectedSemester || 1);
                    setAiTargetSection(newTimetableSlot.section || sections.find((s) => s.id === selectedSectionId)?.section || "A");
                    setShowAiTimetableModal(true);
                  }}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 px-2.5 py-1 text-[0.68rem] font-bold text-white shadow-xs cursor-pointer shrink-0"
                >
                  AI Photo Scan ✨
                </button>
              </div>
            )}

            <form onSubmit={handleSaveTimetableSlot} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Subject</label>
                <select
                  value={newTimetableSlot.subject || selectedSubjectId}
                  onChange={(e) => {
                    const subId = e.target.value;
                    const subObj = subjects.find((s) => s.id === subId);
                    setNewTimetableSlot({
                      ...newTimetableSlot,
                      subject: subId,
                      title: subObj ? `${subObj.name} (${subObj.code})` : newTimetableSlot.title,
                    });
                  }}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                >
                  <option value="">Select Target Subject (Optional)...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Lecture / Event Title</label>
                <input
                  type="text"
                  value={newTimetableSlot.title}
                  onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, title: e.target.value })}
                  placeholder="Artificial Intelligence Theory (LT-01)"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              {/* Day, Start Time, End Time - Fully Responsive for 280px+ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold mb-1">Day Of Week</label>
                  <select
                    value={newTimetableSlot.day_of_week}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, day_of_week: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newTimetableSlot.start_time}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, start_time: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">End Time</label>
                  <input
                    type="time"
                    value={newTimetableSlot.end_time}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, end_time: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Semester and Section Cohort From Database - Fully Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold mb-1">Semester (1–8)</label>
                  <select
                    value={newTimetableSlot.semester}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, semester: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Section Cohort (From DB)</label>
                  <select
                    value={newTimetableSlot.section}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, section: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs font-bold focus:border-primary focus:outline-none"
                    required
                  >
                    <option value="">Select Created Section...</option>
                    {/* Matching semester sections */}
                    {sections
                      .filter((s) => Number(s.semester) === Number(newTimetableSlot.semester))
                      .map((sec) => (
                        <option key={sec.id} value={sec.section || sec.section_name}>
                          Section {sec.section || sec.section_name} (Sem {sec.semester}{programs.find(p => p.id === sec.program)?.name ? ` · ${programs.find(p => p.id === sec.program)?.name}` : ""})
                        </option>
                      ))}
                    {/* Other semester sections */}
                    {sections
                      .filter((s) => Number(s.semester) !== Number(newTimetableSlot.semester))
                      .map((sec) => (
                        <option key={sec.id} value={sec.section || sec.section_name}>
                          Section {sec.section || sec.section_name} (Sem {sec.semester})
                        </option>
                      ))}
                    {sections.length === 0 && (
                      <option value="A">Section A (No sections in DB yet)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Room and Faculty - Fully Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block font-bold mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={newTimetableSlot.room_number}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, room_number: e.target.value })}
                    placeholder="LT-01"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Faculty</label>
                  <input
                    type="text"
                    value={newTimetableSlot.faculty_name}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, faculty_name: e.target.value })}
                    placeholder="Dr. Meera Raghav"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer text-xs">
                {editingTimetableId ? "Save Slot Changes" : "Add Timetable Slot"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gemini AI Timetable Photo Scanner */}
      {showAiTimetableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 shrink-0">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground truncate">
                    Gemini AI Timetable Scanner
                  </h3>
                  <p className="text-[0.68rem] text-muted-foreground truncate">
                    Photo Consumption &amp; Automatic Timetable Schedule Transcription
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAiTimetableModal(false);
                  setAiTimetableImage(null);
                  setAiExtractedSlots([]);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Cohort & DB Section Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 p-3 rounded-2xl border border-border bg-surface/50">
              <div>
                <label className="block text-[0.68rem] font-bold text-muted-foreground mb-1">
                  Default Target Semester
                </label>
                <select
                  value={aiTargetSemester}
                  onChange={(e) => setAiTargetSemester(Number(e.target.value))}
                  className="h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs focus:border-primary focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[0.68rem] font-bold text-muted-foreground mb-1">
                  Default Target Section (From DB)
                </label>
                <select
                  value={aiTargetSection}
                  onChange={(e) => setAiTargetSection(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-bold focus:border-primary focus:outline-none"
                >
                  <option value="">Select Section From Database...</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.section || sec.section_name}>
                      Section {sec.section || sec.section_name} (Sem {sec.semester}{programs.find(p => p.id === sec.program)?.name ? ` · ${programs.find(p => p.id === sec.program)?.name}` : ""})
                    </option>
                  ))}
                  {sections.length === 0 && (
                    <option value="A">Section A (No sections in DB yet)</option>
                  )}
                </select>
              </div>
            </div>

            {/* Step 1: Photo Upload Dropzone / Camera Area */}
            {aiExtractedSlots.length === 0 ? (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Upload Or Capture Timetable Schedule Photo
                  </label>
                  <p className="text-[0.68rem] text-muted-foreground">
                    Accepts Printed Charts, Whiteboard Snapshots, Notice Board Pictures, PDFs, Or Screenshots.
                  </p>
                </div>

                {aiTimetableImage ? (
                  <div className="relative rounded-2xl border border-border bg-surface/50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Camera className="h-4 w-4 text-purple-500 shrink-0" />
                        <span className="text-xs font-bold text-foreground truncate">{aiTimetableFileName || "Timetable Image"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAiTimetableImage(null);
                          setAiTimetableFileName("");
                        }}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-border/80 max-h-56 flex items-center justify-center bg-black/5 dark:bg-white/5">
                      <img
                        src={aiTimetableImage}
                        alt="Timetable Preview"
                        className="max-h-56 w-auto object-contain rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer text-center space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleAiPhotoUpload}
                      className="hidden"
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs sm:text-sm font-bold text-foreground block">
                        Click To Take Photo Or Browse Files
                      </span>
                      <span className="text-[0.68rem] text-muted-foreground block">
                        PNG, JPG, JPEG, WEBP · Mobile Camera Supported
                      </span>
                    </div>
                  </label>
                )}

                {/* Optional Custom Gemini API Key configuration */}
                <div className="rounded-2xl border border-border/80 bg-surface/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] font-bold text-foreground flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-purple-500" />
                      <span>Gemini API Key (Optional)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAiKeyInput(!showAiKeyInput)}
                      className="text-[0.68rem] text-purple-600 dark:text-purple-400 hover:underline font-bold cursor-pointer"
                    >
                      {showAiKeyInput ? "Hide Key Input" : aiGeminiKey ? "Custom Key Saved ✓" : "Enter Key"}
                    </button>
                  </div>
                  {showAiKeyInput && (
                    <div className="space-y-1 pt-1">
                      <input
                        type="password"
                        value={aiGeminiKey}
                        onChange={(e) => setAiGeminiKey(e.target.value)}
                        placeholder="AIzaSy... (Leave Blank To Use Server Environment Key)"
                        className="h-9 w-full rounded-xl border border-border bg-background px-3 font-mono text-xs focus:border-purple-500 focus:outline-none"
                      />
                      <p className="text-[0.62rem] text-muted-foreground">
                        Your Key Is Saved Locally In Your Browser For Seamless Future Timetable Scans.
                      </p>
                    </div>
                  )}
                </div>

                {/* Consume Action Button */}
                <button
                  type="button"
                  onClick={handleConsumeTimetablePhotoWithAi}
                  disabled={!aiTimetableImage || aiExtracting}
                  className="h-11 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {aiExtracting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Analyzing &amp; Consuming Photo with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Consume &amp; Extract Timetable (Gemini AI)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Step 2: Review Extracted Slots & Batch Import */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ {aiExtractedSlots.length} Slots Extracted
                    </span>
                    <span className="text-xs text-muted-foreground">Review &amp; Adjust Before Saving</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiExtractedSlots([]);
                    }}
                    className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                  >
                    Rescan Another Photo
                  </button>
                </div>

                {/* Slots List */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {aiExtractedSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border bg-surface/50 p-3 space-y-2.5 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                            Period #{idx + 1}
                          </span>
                          <span className="font-bold text-foreground">{slot.day_of_week}</span>
                          <span className="text-muted-foreground">{slot.start_time} - {slot.end_time}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAiExtractedSlots(aiExtractedSlots.filter((_, i) => i !== idx));
                          }}
                          className="rounded-lg p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          title="Remove Slot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Title & Subject */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[0.65rem] font-bold text-muted-foreground mb-0.5">Title / Course</label>
                          <input
                            type="text"
                            value={slot.title || ""}
                            onChange={(e) => {
                              const updated = [...aiExtractedSlots];
                              updated[idx].title = e.target.value;
                              setAiExtractedSlots(updated);
                            }}
                            className="h-8 w-full rounded-xl border border-border bg-background px-2.5 text-xs focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-bold text-muted-foreground mb-0.5">Matched Subject (DB)</label>
                          <select
                            value={slot.subject_id || ""}
                            onChange={(e) => {
                              const updated = [...aiExtractedSlots];
                              updated[idx].subject_id = e.target.value || null;
                              setAiExtractedSlots(updated);
                            }}
                            className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs focus:border-primary focus:outline-none"
                          >
                            <option value="">No Direct Subject Match</option>
                            {subjects.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.code}: {sub.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Day, Times, Section From DB, Room */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[0.65rem] font-bold text-muted-foreground mb-0.5">Day</label>
                          <select
                            value={slot.day_of_week}
                            onChange={(e) => {
                              const updated = [...aiExtractedSlots];
                              updated[idx].day_of_week = e.target.value;
                              setAiExtractedSlots(updated);
                            }}
                            className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs focus:border-primary focus:outline-none"
                          >
                            {WEEKDAYS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-bold text-muted-foreground mb-0.5">Time</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => {
                                const updated = [...aiExtractedSlots];
                                updated[idx].start_time = e.target.value;
                                setAiExtractedSlots(updated);
                              }}
                              className="h-8 w-full rounded-xl border border-border bg-background px-1.5 text-xs focus:border-primary focus:outline-none"
                            />
                            <span className="text-muted-foreground">-</span>
                            <input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => {
                                const updated = [...aiExtractedSlots];
                                updated[idx].end_time = e.target.value;
                                setAiExtractedSlots(updated);
                              }}
                              className="h-8 w-full rounded-xl border border-border bg-background px-1.5 text-xs focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-bold text-muted-foreground mb-0.5">Section (From DB)</label>
                          <select
                            value={slot.section}
                            onChange={(e) => {
                              const updated = [...aiExtractedSlots];
                              updated[idx].section = e.target.value;
                              setAiExtractedSlots(updated);
                            }}
                            className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs font-bold focus:border-primary focus:outline-none"
                          >
                            {sections.map((sec) => (
                              <option key={sec.id} value={sec.section || sec.section_name}>
                                Section {sec.section || sec.section_name}
                              </option>
                            ))}
                            {sections.length === 0 && (
                              <option value="A">Section A</option>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[0.65rem] font-bold text-muted-foreground mb-0.5">Room / Hall</label>
                          <input
                            type="text"
                            value={slot.room_number || ""}
                            onChange={(e) => {
                              const updated = [...aiExtractedSlots];
                              updated[idx].room_number = e.target.value;
                              setAiExtractedSlots(updated);
                            }}
                            className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Save Button */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAiTimetableModal(false);
                      setAiTimetableImage(null);
                      setAiExtractedSlots([]);
                    }}
                    className="h-10 w-full sm:w-auto px-4 rounded-xl border border-border bg-surface text-xs font-bold text-foreground hover:bg-surface/80 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAiExtractedSlots}
                    disabled={isSavingAiSlots || aiExtractedSlots.length === 0}
                    className="h-10 w-full sm:w-auto px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavingAiSlots ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Saving {aiExtractedSlots.length} Slots To Database...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Save All {aiExtractedSlots.length} Slots To Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Delete All Timetable Slots Confirmation */}
      {showDeleteAllTimetableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 xs:p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                    Delete Timetable Slots
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Bulk Delete Timetable Slots With Scoped Precision Or Full Database Purge.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteAllTimetableModal(false);
                  setDeleteConfirmationText("");
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scope Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-foreground">
                Select Deletion Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteAllScope("filtered")}
                  className={cn(
                    "flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer",
                    deleteAllScope === "filtered"
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border bg-surface/50 hover:bg-surface"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-foreground">Current Filter Only</span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[0.68rem] font-bold text-primary">
                      {filteredTimetableSlots.length} Slots
                    </span>
                  </div>
                  <span className="text-[0.7rem] text-muted-foreground leading-tight">
                    Semester {selectedSemester || "All"} · Section {sections.find((s) => s.id === selectedSectionId)?.section || "All"} · Day {selectedTimetableDay || "All"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteAllScope("all")}
                  className={cn(
                    "flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer",
                    deleteAllScope === "all"
                      ? "border-rose-500 bg-rose-500/10 shadow-xs"
                      : "border-border bg-surface/50 hover:bg-surface"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-rose-600 dark:text-rose-400">Purge Entire Database</span>
                    <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[0.68rem] font-bold text-rose-600 dark:text-rose-400">
                      {timetableSlots.length} Total Slots
                    </span>
                  </div>
                  <span className="text-[0.7rem] text-muted-foreground leading-tight">
                    Permanently Wipes Every Slot Across All Departments, Programs, And Semesters.
                  </span>
                </button>
              </div>
            </div>

            {/* Warning Message */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="space-y-1">
                <p className="font-bold">
                  {deleteAllScope === "all"
                    ? "Warning: This will permanently wipe ALL timetable slots university-wide!"
                    : `Warning: This will permanently delete ${filteredTimetableSlots.length} timetable slot(s) matching the active filter.`}
                </p>
                <p className="text-[0.72rem] opacity-90">
                  This Action Immediately Purges Records From The Database And Flushes Redis Cache So All Student Dashboards Update Instantly.
                </p>
              </div>
            </div>

            {deleteAllScope === "all" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  Type <span className="font-mono text-rose-600 dark:text-rose-400 font-black">DELETE</span> To Confirm Full Purge:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE..."
                  className="h-10 w-full rounded-2xl border border-rose-500/40 bg-background px-3 font-mono text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col-reverse xs:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAllTimetableModal(false);
                  setDeleteConfirmationText("");
                }}
                disabled={isDeletingAllTimetable}
                className="h-10 w-full xs:w-auto px-4 rounded-2xl border border-border bg-surface text-xs font-bold text-foreground hover:bg-surface/80 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllTimetable}
                disabled={
                  isDeletingAllTimetable ||
                  (deleteAllScope === "all" && deleteConfirmationText.trim().toUpperCase() !== "DELETE") ||
                  (deleteAllScope === "filtered" && filteredTimetableSlots.length === 0)
                }
                className="h-10 w-full xs:w-auto px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeletingAllTimetable ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>
                      {deleteAllScope === "all"
                        ? `Purge Entire Timetable (${timetableSlots.length})`
                        : `Delete Filtered Slots (${filteredTimetableSlots.length})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Broadcast / Edit Notice */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/80 pb-3.5">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                  {editingNoticeId ? "Edit Department Notice / Circular" : "Broadcast Official Notice"}
                </h3>
                <p className="text-[0.68rem] text-muted-foreground mt-0.5 font-mono">
                  Full Markdown Support · Links, Images, Lists &amp; Tables
                </p>
              </div>
              <button
                onClick={() => {
                  setShowNoticeModal(false);
                  setEditingNoticeId(null);
                  setNoticePreviewTab("write");
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1.5 text-foreground">Headline</label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="End-Term Practical Examination Schedule"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3.5 focus:border-primary focus:outline-none text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1.5 text-foreground">Category</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="Examination">Examination</option>
                    <option value="Academic Update">Academic Update</option>
                    <option value="Lab Circular">Lab Circular</option>
                    <option value="General Circular">General Circular</option>
                    <option value="Hackathon & Events">Hackathon &amp; Events</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1.5 text-foreground">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Circular</option>
                    <option value="STANDARD">Standard Notice</option>
                  </select>
                </div>
              </div>

              {/* Cascading Audience Target Controls */}
              <div className="rounded-2xl border border-border bg-surface/50 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <Megaphone className="h-3.5 w-3.5 text-primary" />
                    <span>Target Audience &amp; Dispatch Scope</span>
                  </label>
                  <div className="flex items-center gap-1 bg-card p-0.5 rounded-xl border border-border text-[0.68rem]">
                    <button
                      type="button"
                      onClick={() => setNewNotice({ ...newNotice, is_broadcast_all: false, department: newNotice.department || selectedDeptId || (departments[0]?.id ?? "") })}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                        !newNotice.is_broadcast_all
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      🎯 Scoped Context
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNotice({ ...newNotice, is_broadcast_all: true })}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                        newNotice.is_broadcast_all
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      🌐 Campus-Wide
                    </button>
                  </div>
                </div>

                {!newNotice.is_broadcast_all ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold mb-1 text-muted-foreground text-[0.68rem]">Department</label>
                      <select
                        value={newNotice.department || selectedDeptId}
                        onChange={(e) => {
                          const deptVal = e.target.value;
                          const deptProgs = programs.filter((p) => p.department === deptVal);
                          setNewNotice({
                            ...newNotice,
                            department: deptVal,
                            program: deptProgs[0]?.id || "",
                          });
                        }}
                        className="h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs focus:border-primary focus:outline-none"
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-muted-foreground text-[0.68rem]">Specialization / Program</label>
                      <select
                        value={newNotice.program || selectedProgramId}
                        onChange={(e) => setNewNotice({ ...newNotice, program: e.target.value })}
                        className="h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs focus:border-primary focus:outline-none"
                      >
                        <option value="">All Programs In Department</option>
                        {programs
                          .filter((p) => !newNotice.department || p.department === newNotice.department)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.code})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-muted-foreground text-[0.68rem]">Target Semester</label>
                      <select
                        value={newNotice.target_semester ?? ""}
                        onChange={(e) => setNewNotice({ ...newNotice, target_semester: e.target.value ? Number(e.target.value) : null })}
                        className="h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs focus:border-primary focus:outline-none"
                      >
                        <option value="">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1 text-muted-foreground text-[0.68rem]">Target Section (From DB)</label>
                      <select
                        value={newNotice.target_section || ""}
                        onChange={(e) => setNewNotice({ ...newNotice, target_section: e.target.value })}
                        className="h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs focus:border-primary focus:outline-none font-bold"
                      >
                        <option value="">All Cohort Sections (Broadcast All)</option>
                        {sections
                          .filter((s) => !newNotice.target_semester || Number(s.semester) === Number(newNotice.target_semester))
                          .map((sec) => (
                            <option key={sec.id} value={sec.section || sec.section_name}>
                              Section {sec.section || sec.section_name} (Sem {sec.semester})
                            </option>
                          ))}
                        {sections
                          .filter((s) => newNotice.target_semester && Number(s.semester) !== Number(newNotice.target_semester))
                          .map((sec) => (
                            <option key={sec.id} value={sec.section || sec.section_name}>
                              Section {sec.section || sec.section_name} (Sem {sec.semester})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-[0.68rem] text-muted-foreground italic">
                    Universal Broadcast Will Be Dispatched To All Student Dashboards Across All Departments, Specializations, And Semesters.
                  </p>
                )}
              </div>

              {/* Markdown Content Field with Toolbar and Live Preview Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <span>Circular Content</span>
                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[0.62rem] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      .MD Format
                    </span>
                  </label>

                  {/* Write vs Preview Toggle Switcher */}
                  <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border text-[0.68rem] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setNoticePreviewTab("write")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                        noticePreviewTab === "write"
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ✏️ Write (.md)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoticePreviewTab("preview")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                        noticePreviewTab === "preview"
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      👁️ Live Preview
                    </button>
                  </div>
                </div>

                {noticePreviewTab === "write" ? (
                  <div className="space-y-1.5">
                    {/* Markdown Quick Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl border border-border/80 bg-surface/70 text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => {
                          setNewNotice((prev) => ({
                            ...prev,
                            content: prev.content + "**Bold Text**",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Add Bold Text"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewNotice((prev) => ({
                            ...prev,
                            content: prev.content + "*Italic Text*",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Add Italic Text"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewNotice((prev) => ({
                            ...prev,
                            content: prev.content + "\n[Link Title](https://example.com)",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Insert Web Link"
                      >
                        <Link className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewNotice((prev) => ({
                            ...prev,
                            content: prev.content + "\n![Image Alt Text](https://images.unsplash.com/...)",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Insert Image"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewNotice((prev) => ({
                            ...prev,
                            content: prev.content + "\n- Item 1\n- Item 2\n- Item 3",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Insert Bullet List"
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewNotice((prev) => ({
                            ...prev,
                            content: prev.content + "\n1. Step 1\n2. Step 2",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Insert Numbered List"
                      >
                        <ListOrdered className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewNotice((prev) => ({
                            ...prev,
                            content: prev.content + "\n> Important Announcement Note",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Insert Blockquote"
                      >
                        <Quote className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <textarea
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                      placeholder={"# Important Circular\n\nAll Students Are Advised To Check The Official Portal: [SIH Portal](https://www.sih.gov.in/)\n\n![Poster](https://...)\n\n- Deadline: 15th Sep\n- Requirement: All Teams Registered"}
                      rows={6}
                      required
                      className="w-full rounded-2xl border border-border bg-background p-3.5 font-mono text-xs focus:border-primary focus:outline-none leading-relaxed"
                    />
                    <p className="text-[0.65rem] text-muted-foreground">
                      💡 <strong>Tip:</strong> Plain URLs Like <code className="text-primary font-mono">https://www.sih.gov.in/</code>, Markdown Links <code className="text-primary font-mono">[Title](URL)</code>, And Images <code className="text-primary font-mono">![Alt](Image_URL)</code> Render Interactively.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 min-h-[160px] max-h-64 overflow-y-auto">
                    {newNotice.content.trim().length > 0 ? (
                      <MarkdownContent content={newNotice.content} />
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No Markdown Content Typed Yet. Switch To Write Tab To Compose Your Notice.</p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-md hover:opacity-95 cursor-pointer transition-all"
              >
                {editingNoticeId ? "Save Notice Changes" : "Broadcast Circular"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Exam Milestone Countdown */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg text-foreground">
                {editingMilestoneId ? "Edit Examination Milestone Countdown" : "Add Examination Milestone Countdown"}
              </h3>
              <button
                onClick={() => {
                  setShowMilestoneModal(false);
                  setEditingMilestoneId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMilestone} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Milestone Event Title</label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="Mid-Semester Theory Examinations"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Target Examination Date</label>
                  <input
                    type="date"
                    value={newMilestone.target_date}
                    onChange={(e) => setNewMilestone({ ...newMilestone, target_date: e.target.value })}
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={newMilestone.category}
                    onChange={(e) => setNewMilestone({ ...newMilestone, category: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  >
                    <option value="Mid-Semester Theory Exams">Mid-Semester Theory Exams</option>
                    <option value="End-Term University Exams">End-Term University Exams</option>
                    <option value="Practical Lab Viva Voce">Practical Lab Viva Voce</option>
                    <option value="Final Project Demonstration">Final Project Demonstration</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Semester (1–8)</label>
                  <select
                    value={newMilestone.semester}
                    onChange={(e) => setNewMilestone({ ...newMilestone, semester: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Milestone Tag</label>
                  <input
                    type="text"
                    value={newMilestone.tag}
                    onChange={(e) => setNewMilestone({ ...newMilestone, tag: e.target.value })}
                    placeholder="Term 1"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer">
                {editingMilestoneId ? "Save Milestone Changes" : "Add Exam Milestone Countdown"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Broadcast / Edit Banner */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/80 pb-3.5">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                  {editingBannerId ? "Edit Broadcast Banner" : "Deploy New Broadcast Banner"}
                </h3>
                <p className="text-[0.68rem] text-muted-foreground mt-0.5 font-mono">
                  Full Markdown Support · Multi-Color Variants · Real-Time Sync
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBannerModal(false);
                  setEditingBannerId(null);
                  setBannerPreviewTab("write");
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1.5 text-foreground">Headline Title</label>
                  <input
                    type="text"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    placeholder="E.g. Smart India Hackathon (SIH) 2026"
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3.5 focus:border-primary focus:outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-foreground">Badge Tag Text</label>
                  <input
                    type="text"
                    value={newBanner.tag}
                    onChange={(e) => setNewBanner({ ...newBanner, tag: e.target.value })}
                    placeholder="E.g. SIH 2026, URGENT, NEW"
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3.5 focus:border-primary focus:outline-none text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Color Variant & Target Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1.5 text-foreground">Color Glow Variant</label>
                  <select
                    value={newBanner.variant}
                    onChange={(e) => setNewBanner({ ...newBanner, variant: e.target.value as any })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="emerald">🟢 Emerald Glow (Academic &amp; Announcements)</option>
                    <option value="amber">🟠 Amber Glow (Warning &amp; Deadlines)</option>
                    <option value="rose">🔴 Rose Glow (Urgent Alerts &amp; Critical Notice)</option>
                    <option value="purple">🟣 Purple Glow (Events &amp; Competitions)</option>
                    <option value="cyan">🔵 Cyan Glow (Tech Updates &amp; Support)</option>
                    <option value="gradient">🌈 Multi-Color Rainbow Gradient</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-foreground">Target Audience</label>
                  <select
                    value={newBanner.target}
                    onChange={(e) => setNewBanner({ ...newBanner, target: e.target.value as any })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="ALL">🌐 Everywhere (Student Dashboard + Landing Page)</option>
                    <option value="DASHBOARD">🎓 Student Dashboard Only</option>
                    <option value="WEBSITE">🚀 Public Landing Website Only</option>
                  </select>
                </div>
              </div>

              {/* CTA Link Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1.5 text-foreground">Destination Link URL (Optional)</label>
                  <input
                    type="text"
                    value={newBanner.link_url || ""}
                    onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
                    placeholder="https://... or /login or /dashboard?tab=notices"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3.5 focus:border-primary focus:outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-foreground">Action Button Text</label>
                  <input
                    type="text"
                    value={newBanner.link_text || ""}
                    onChange={(e) => setNewBanner({ ...newBanner, link_text: e.target.value })}
                    placeholder="Register Now / Learn More / View Notice"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3.5 focus:border-primary focus:outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Switches & Priority */}
              <div className="grid grid-cols-3 gap-3 items-center rounded-2xl border border-border/80 bg-surface/50 p-3">
                <div>
                  <label className="block font-bold text-[0.7rem] text-foreground mb-1">Live Active</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBanner.is_active}
                      onChange={(e) => setNewBanner({ ...newBanner, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-[0.7rem] text-foreground mb-1">Dismissible (X)</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBanner.is_dismissible}
                      onChange={(e) => setNewBanner({ ...newBanner, is_dismissible: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-[0.7rem] text-foreground mb-1">Display Priority</label>
                  <input
                    type="number"
                    value={newBanner.priority}
                    onChange={(e) => setNewBanner({ ...newBanner, priority: Number(e.target.value) || 1 })}
                    className="h-8 w-full rounded-xl border border-border bg-background px-2.5 font-mono text-xs font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Markdown Message Field with Toolbar and Live Preview Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <span>Banner Message Statement</span>
                    <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[0.62rem] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      .MD Format
                    </span>
                  </label>

                  {/* Write vs Preview Toggle Switcher */}
                  <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border text-[0.68rem] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBannerPreviewTab("write")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                        bannerPreviewTab === "write"
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ✏️ Write (.md)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerPreviewTab("preview")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                        bannerPreviewTab === "preview"
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      👁️ Live Preview
                    </button>
                  </div>
                </div>

                {bannerPreviewTab === "write" ? (
                  <div className="space-y-1.5">
                    {/* Markdown Quick Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl border border-border/80 bg-surface/70 text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => {
                          setNewBanner((prev) => ({
                            ...prev,
                            message: prev.message + "**Bold Text**",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Add Bold Text"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewBanner((prev) => ({
                            ...prev,
                            message: prev.message + "*Italic Text*",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Add Italic Text"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewBanner((prev) => ({
                            ...prev,
                            message: prev.message + " [Link](https://...)",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Insert Web Link"
                      >
                        <Link className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewBanner((prev) => ({
                            ...prev,
                            message: prev.message + "\n- Item",
                          }));
                        }}
                        className="rounded-lg p-1.5 hover:bg-card hover:text-foreground transition-colors cursor-pointer"
                        title="Insert List Item"
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <textarea
                      value={newBanner.message}
                      onChange={(e) => setNewBanner({ ...newBanner, message: e.target.value })}
                      placeholder="Internal Registrations Are Open For All Engineering Branches. Form Teams And Submit Your Proposal Before 15th September!"
                      rows={3}
                      required
                      className="w-full rounded-2xl border border-border bg-background p-3.5 font-mono text-xs focus:border-primary focus:outline-none leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 min-h-[100px] max-h-48 overflow-y-auto">
                    {newBanner.message.trim().length > 0 ? (
                      <MarkdownContent content={newBanner.message} />
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No Message Typed Yet.</p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-md hover:opacity-95 cursor-pointer transition-all"
              >
                {editingBannerId ? "Save Banner Changes" : "Deploy Broadcast Banner Live"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Security & DRM Control Hub */}
      {showSecurityModal && selectedStudentForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">Scholar Security &amp; DRM Shield</h3>
                  <p className="text-xs text-muted-foreground">
                    Target: <strong className="text-foreground">{selectedStudentForAction.full_name || selectedStudentForAction.email}</strong> ({selectedStudentForAction.roll_number || "—"})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSecurityModal(false);
                  setSelectedStudentForAction(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Scholar Current Snapshot */}
              <div className="grid grid-cols-3 gap-2.5 rounded-2xl border border-border/80 bg-surface/50 p-3 text-center">
                <div>
                  <span className="text-[0.65rem] text-muted-foreground block">DRM Status</span>
                  <span className={cn("font-bold text-xs", selectedStudentForAction.is_drm_blocked ? "text-rose-500" : "text-emerald-500")}>
                    {selectedStudentForAction.is_drm_blocked ? "Blocked" : "Active"}
                  </span>
                </div>
                <div>
                  <span className="text-[0.65rem] text-muted-foreground block">Login Status</span>
                  <span className={cn("font-bold text-xs", selectedStudentForAction.is_login_blocked || selectedStudentForAction.is_active === false ? "text-rose-500" : "text-emerald-500")}>
                    {selectedStudentForAction.is_login_blocked || selectedStudentForAction.is_active === false ? "Suspended" : "Active"}
                  </span>
                </div>
                <div>
                  <span className="text-[0.65rem] text-muted-foreground block">Violations Count</span>
                  <span className="font-bold text-xs font-mono text-primary">
                    {selectedStudentForAction.drm_violations_count || 0} Alerts
                  </span>
                </div>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block font-bold mb-1.5 text-foreground">Select Administrative Security Action</label>
                <select
                  value={securityActionForm.action_type}
                  onChange={(e) => setSecurityActionForm({ ...securityActionForm, action_type: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold focus:border-primary focus:outline-none"
                >
                  <option value="RESET_FRESH_USER" className="text-emerald-600 font-bold">✨ Reset Account To Fresh Slate (Clear All Locks, Cooldowns &amp; Violations)</option>
                  <option value="BLOCK_DRM">🚫 Block DRM Content Access (Lock Reading Vault)</option>
                  <option value="UNBLOCK_DRM">✅ Unblock DRM Content Access (Restore Reading)</option>
                  <option value="SUSPEND_LOGIN">⛔ Suspend User Login (Full Account Lockout)</option>
                  <option value="UNBAN_LOGIN">🔓 Reactivate User Login (Restore Account)</option>
                  <option value="SET_COOLDOWN">⏳ Set Security Cooldown Period (Temporary Lock)</option>
                  <option value="REMOVE_COOLDOWN">🕒 Remove Active Security Cooldown</option>
                  <option value="DISPATCH_WARNING">⚠️ Dispatch Disciplinary Warning (Student Banner)</option>
                  <option value="CLEAR_WARNING">🧹 Clear Disciplinary Warning Notice</option>
                  <option value="REVOKE_SESSIONS">🔄 Revoke All Active Browser Sessions</option>
                  <option value="RESET_VIOLATIONS">0️⃣ Reset Violations Counter to Zero</option>
                  <option value="CHANGE_TIER">👑 Change Scholar Access Tier</option>
                  <option value="HARD_DELETE_USER" className="text-rose-600 font-bold">🗑️ Permanent Hard Delete Account (Purge All Records &amp; DRM)</option>
                </select>
              </div>

              {/* Informative Alert Box for Fresh Reset */}
              {securityActionForm.action_type === "RESET_FRESH_USER" && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 space-y-1.5 text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>Account Fresh Slate Reset</span>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
                    This will immediately clear all active DRM reading locks, unban login status, lift cooldown periods, wipe disciplinary warnings, and reset the security violations counter to zero.
                  </p>
                </div>
              )}

              {/* Critical Alert Box for Hard Delete */}
              {securityActionForm.action_type === "HARD_DELETE_USER" && (
                <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 p-3.5 space-y-1.5 text-rose-600 dark:text-rose-400">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>Irrevocable Permanent Hard Delete</span>
                  </div>
                  <p className="text-[0.7rem] text-zinc-300 leading-relaxed">
                    This Will Permanently Delete The Student Account From The Database. All User Profile Records, DRM Access Permissions, Session Histories, And Disciplinary Records Will Be Lost Forever.
                  </p>
                </div>
              )}

              {/* Conditional Field: Cooldown Hours */}
              {securityActionForm.action_type === "SET_COOLDOWN" && (
                <div>
                  <label className="block font-bold mb-1 text-foreground">Cooldown Duration (Hours)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 6, 24, 168].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSecurityActionForm({ ...securityActionForm, cooldown_hours: h })}
                        className={cn(
                          "h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                          securityActionForm.cooldown_hours === h
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border bg-background text-foreground hover:bg-surface"
                        )}
                      >
                        {h === 168 ? "7 Days" : `${h} Hours`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditional Field: Access Tier */}
              {securityActionForm.action_type === "CHANGE_TIER" && (
                <div>
                  <label className="block font-bold mb-1 text-foreground">Target Access Tier</label>
                  <select
                    value={securityActionForm.access_tier}
                    onChange={(e) => setSecurityActionForm({ ...securityActionForm, access_tier: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold focus:border-primary focus:outline-none"
                  >
                    <option value="FREE">Free Starter</option>
                    <option value="SEMESTER_TOPPER">Semester Topper</option>
                    <option value="VIP">VIP All-Access</option>
                  </select>
                </div>
              )}

              {/* Conditional Field: Warning Note */}
              {securityActionForm.action_type === "DISPATCH_WARNING" && (
                <div>
                  <label className="block font-bold mb-1 text-foreground">Official Warning Notice For Student</label>
                  <textarea
                    rows={2}
                    value={securityActionForm.warning_message}
                    onChange={(e) => setSecurityActionForm({ ...securityActionForm, warning_message: e.target.value })}
                    placeholder="E.g., Repeated Unauthorized Screen Inspection Detected. Continued Violation Will Trigger Account Suspension."
                    className="w-full rounded-2xl border border-border bg-background p-3 focus:border-primary focus:outline-none leading-relaxed"
                  />
                </div>
              )}

              {/* Mandatory Reason Field (Audit Compliance) */}
              <div>
                <label className="block font-bold mb-1 text-foreground">
                  Administrative Justification Reason <span className="text-rose-500">* (Logged In Audit Vault)</span>
                </label>
                <textarea
                  rows={3}
                  value={securityActionForm.reason}
                  onChange={(e) => setSecurityActionForm({ ...securityActionForm, reason: e.target.value })}
                  placeholder={
                    securityActionForm.action_type === "HARD_DELETE_USER"
                      ? "Explain Why This User Account Is Being Permanently Purged From Database..."
                      : "Explain Why This Security Action Or Lock Is Being Enforced..."
                  }
                  required
                  className="w-full rounded-2xl border border-border bg-background p-3 focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleExecuteSecurityAction}
                className={cn(
                  "h-11 w-full rounded-2xl font-bold text-white shadow-md transition-all cursor-pointer",
                  securityActionForm.action_type === "HARD_DELETE_USER"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-primary text-primary-foreground hover:bg-primary-deep"
                )}
              >
                {securityActionForm.action_type === "HARD_DELETE_USER"
                  ? "Permanently Hard Delete User Account"
                  : "Confirm & Execute Security Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full DRM Document & Material Live Preview */}
      {previewMaterialId && (
        <DrmSecureReader materialId={previewMaterialId} onClose={() => setPreviewMaterialId(null)} />
      )}

      {/* Modal: Full Official Circular Viewer */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {viewingNotice.category}
                </span>
                <span className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs font-mono font-bold text-muted-foreground">
                  {viewingNotice.priority} Priority
                </span>
                <span className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
                  Target: {viewingNotice.is_broadcast_all ? "All Students" : `Semester ${viewingNotice.target_semester}`}
                </span>
              </div>
              <button
                onClick={() => setViewingNotice(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-display font-bold text-lg sm:text-xl text-foreground leading-snug">
                {viewingNotice.title}
              </h3>
              <div className="rounded-2xl border border-border/80 bg-surface/50 p-5 text-sm text-foreground/90 leading-relaxed font-sans">
                <MarkdownContent content={viewingNotice.content} />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/80 pt-4 text-xs">
              <span className="text-muted-foreground font-mono text-[0.7rem]">
                Published: {new Date(viewingNotice.published_at || viewingNotice.created_at || Date.now()).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleEditNotice(viewingNotice);
                    setViewingNotice(null);
                  }}
                  className="rounded-xl border border-border bg-surface px-4 py-2 font-bold text-foreground hover:bg-card cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Circular</span>
                </button>
                <button
                  onClick={() => setViewingNotice(null)}
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground shadow-xs hover:bg-primary-deep cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Live Banner Card Viewer */}
      {viewingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {viewingBanner.tag || "Announcement"}
                </span>
                <span className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs font-mono font-bold text-muted-foreground">
                  Channel: {viewingBanner.target}
                </span>
                <span className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs font-mono text-muted-foreground">
                  Priority: {viewingBanner.priority}
                </span>
              </div>
              <button
                onClick={() => setViewingBanner(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Live Render in Modal */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block font-mono">
                Live Broadcast Card Preview
              </span>
              <BroadcastBanner
                target="ALL"
                previewBanners={[viewingBanner]}
                ignoreDismissed={true}
              />
            </div>

            <div className="flex items-center justify-between border-t border-border/80 pt-4 text-xs">
              <span className="text-muted-foreground font-mono text-[0.7rem]">
                Status: {viewingBanner.is_active ? "Active & Broadcasting" : "Deactivated"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleEditBanner(viewingBanner);
                    setViewingBanner(null);
                  }}
                  className="rounded-xl border border-border bg-surface px-4 py-2 font-bold text-foreground hover:bg-card cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Banner</span>
                </button>
                <button
                  onClick={() => setViewingBanner(null)}
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground shadow-xs hover:bg-primary-deep cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
