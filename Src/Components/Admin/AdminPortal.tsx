import React, { useEffect, useState } from "react";
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
  Database,
  Edit3,
  FileCheck2,
  FileText,
  Filter,
  FlaskConical,
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
  Zap,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/Hooks/UseAuth";
import { isDrmGloballyDisabled, setDrmGloballyDisabled } from "@/Hooks/UseDrmProtection";
import { DrmSecureReader } from "../Dashboard/DrmSecureReader";
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

type AdminStation =
  | "structure"
  | "publisher"
  | "timetable"
  | "assignments"
  | "notices"
  | "milestones"
  | "students"
  | "badges"
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
  const [activeStation, setActiveStation] = useState<AdminStation>("structure");
  const [structureSubTab, setStructureSubTab] = useState<"departments" | "programs" | "sections" | "subjects">("departments");
  const [publisherType, setPublisherType] = useState<PublisherContentType>("NOTES");
  const [selectedTimetableDay, setSelectedTimetableDay] = useState<string>("Mon");
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
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

  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);

  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  const [previewMaterialId, setPreviewMaterialId] = useState<string | null>(null);

  // Form State Containers
  const [newDept, setNewDept] = useState({ name: "", code: "", description: "", head_of_department: "" });
  const [newProgram, setNewProgram] = useState({ department: "", name: "", code: "", degree_level: "Undergraduate (B.Tech)", duration_years: 4, total_semesters: 8 });
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

  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    category: "Examination",
    priority: "HIGH",
    target_department: "",
    target_semester: 1,
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
      if (targetSecCode && slot.section !== targetSecCode) return false;
    }
    if (selectedTimetableDay && slot.day_of_week !== selectedTimetableDay) return false;
    return true;
  });

  // Filtered Assignments
  const filteredAssignments = assignments.filter((assign) => {
    if (selectedSubjectId && assign.subject !== selectedSubjectId) return false;
    if (!selectedSubjectId && selectedSemester) {
      const allowedSubjectIds = new Set(filteredSubjects.map((s) => s.id));
      if (!allowedSubjectIds.has(assign.subject)) return false;
    }
    return true;
  });

  // Filtered Notices
  const filteredNotices = notices.filter((n) => {
    if (selectedDeptId && n.target_department && n.target_department !== selectedDeptId) return false;
    if (selectedSemester && !n.is_broadcast_all && n.target_semester !== selectedSemester) return false;
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
    setNewProgram({
      department: prog.department || selectedDeptId || "",
      name: prog.name,
      code: prog.code,
      degree_level: prog.degree_level || "Undergraduate (B.Tech)",
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
      target_department: notice.target_department || "",
      target_semester: notice.target_semester || 1,
      is_broadcast_all: notice.is_broadcast_all ?? true,
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
      setNewProgram({ department: selectedDeptId || "", name: "", code: "", degree_level: "Undergraduate (B.Tech)", duration_years: 4, total_semesters: 8 });
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
      const payload = {
        ...newNotice,
        target_department: selectedDeptId || null,
        target_semester: selectedSemester || 1,
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
        target_department: "",
        target_semester: 1,
        is_broadcast_all: true,
      });
      loadAdminData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save notice.");
    }
  };

  const handleDeleteItem = async (endpoint: string, id: string, name: string, callback: () => void) => {
    if (!confirm(`Are You Sure You Want To Delete "${name}"? This Action Is Permanent.`)) {
      return;
    }
    try {
      await apiFetch(`${endpoint}${id}/`, { method: "DELETE" });
      toast.success(`"${name}" Deleted Successfully.`);
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
                  { id: "structure", label: "1. Academic Blueprint", icon: Building2, count: departments.length },
                  { id: "publisher", label: "2. Publishing Studio", icon: Upload, count: materials.length + labs.length },
                  { id: "timetable", label: "3. Timetable Grid", icon: Clock, count: timetableSlots.length },
                  { id: "assignments", label: "4. Course Assignments", icon: FileText, count: assignments.length },
                  { id: "notices", label: "5. Notice Dispatcher", icon: Megaphone, count: notices.length },
                  { id: "milestones", label: "6. Exam Milestones", icon: Calendar, count: milestones.length },
                  { id: "students", label: "7. Student Registry", icon: Users, count: students.length },
                  { id: "badges", label: "8. Navigation Badges", icon: Sparkles, count: badges.filter((b) => b.is_active && b.badge_text).length },
                  { id: "support", label: "9. Support Desk", icon: HelpCircle, count: tickets.length },
                  { id: "forum", label: "10. Community Forum", icon: MessageSquare, count: posts.length },
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
      <aside className="hidden lg:flex w-64 lg:w-72 flex-col justify-between border-r border-border/80 bg-card/85 p-5 backdrop-blur-xl shrink-0 shadow-sm">
        <div>
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3.5 px-2 py-1.5">
            <div className="relative">
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
            <div>
              <h2 className="font-display text-base font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                NimsWallah
              </h2>
              <p className="text-[0.62rem] font-bold text-muted-foreground uppercase tracking-widest">
                Academic Command Engine
              </p>
            </div>
          </div>

          {/* Admin Controller Quick Card */}
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/5 via-surface/80 to-teal-500/5 p-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-xs">
                <span>AD</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-foreground truncate">
                  {user?.full_name || "Academic Controller"}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.6rem] font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Master Administrator</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Station Navigation List */}
          <nav className="mt-5 space-y-1">
            {[
              { id: "structure", label: "1. Academic Blueprint", icon: Building2, count: departments.length },
              { id: "publisher", label: "2. Publishing Studio", icon: Upload, count: materials.length + labs.length },
              { id: "timetable", label: "3. Timetable Grid", icon: Clock, count: timetableSlots.length },
              { id: "assignments", label: "4. Course Assignments", icon: FileText, count: assignments.length },
              { id: "notices", label: "5. Notice Dispatcher", icon: Megaphone, count: notices.length },
              { id: "milestones", label: "6. Exam Milestones", icon: Calendar, count: milestones.length },
              { id: "students", label: "7. Student Registry", icon: Users, count: students.length },
              { id: "badges", label: "8. Navigation Badges", icon: Sparkles, count: badges.filter((b) => b.is_active && b.badge_text).length },
              { id: "support", label: "9. Support Desk", icon: HelpCircle, count: tickets.length },
              { id: "forum", label: "10. Community Forum", icon: MessageSquare, count: posts.length },
            ].map((station) => {
              const Icon = station.icon;
              const isActive = activeStation === station.id;
              return (
                <button
                  key={station.id}
                  onClick={() => setActiveStation(station.id as AdminStation)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/25"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{station.label}</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.65rem] font-mono font-bold",
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

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-border/80 pt-4">
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all active:scale-95 shadow-2xs"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Of Workspace</span>
          </button>
        </div>
      </aside>

      {/* ===================== Main Workspace ===================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-border bg-card/85 px-3 xs:px-4 sm:px-6 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 xs:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="grid h-8 w-8 xs:h-9 xs:w-9 place-items-center rounded-xl border border-border bg-surface text-foreground lg:hidden cursor-pointer shrink-0"
            >
              <Menu className="h-4 w-4 xs:h-5 xs:w-5" />
            </button>
            <span className="font-display text-xs xs:text-sm sm:text-lg font-bold text-foreground truncate">
              {activeStation === "structure" && (
                <>
                  <span className="sm:hidden">Station 1: Academic Matrix</span>
                  <span className="hidden sm:inline">Station 1: Academic Blueprint &amp; Infrastructure Matrix</span>
                </>
              )}
              {activeStation === "publisher" && (
                <>
                  <span className="sm:hidden">Station 2: Publishing Studio</span>
                  <span className="hidden sm:inline">Station 2: Unified Cascading Publishing Studio</span>
                </>
              )}
              {activeStation === "timetable" && (
                <>
                  <span className="sm:hidden">Station 3: Section Timetable</span>
                  <span className="hidden sm:inline">Station 3: Section Timetable &amp; Lecture Schedule Matrix</span>
                </>
              )}
              {activeStation === "assignments" && (
                <>
                  <span className="sm:hidden">Station 4: Academic Rubrics</span>
                  <span className="hidden sm:inline">Station 4: Academic Assignments &amp; Submission Rubrics</span>
                </>
              )}
              {activeStation === "notices" && (
                <>
                  <span className="sm:hidden">Station 5: Circulars Dispatch</span>
                  <span className="hidden sm:inline">Station 5: Official Circular Dispatcher</span>
                </>
              )}
              {activeStation === "milestones" && (
                <>
                  <span className="sm:hidden">Station 6: Exam Countdown</span>
                  <span className="hidden sm:inline">Station 6: Examination Milestones Countdown</span>
                </>
              )}
              {activeStation === "students" && (
                <>
                  <span className="sm:hidden">Station 7: Scholar Registry</span>
                  <span className="hidden sm:inline">Station 7: Active Student Registry &amp; User Base</span>
                </>
              )}
              {activeStation === "badges" && (
                <>
                  <span className="sm:hidden">Station 8: Sidebar Badges</span>
                  <span className="hidden sm:inline">Station 8: Sidebar Dynamic Badges Matrix</span>
                </>
              )}
              {activeStation === "support" && (
                <>
                  <span className="sm:hidden">Station 9: Support Desk</span>
                  <span className="hidden sm:inline">Station 9: Student Support Desk &amp; Query Resolution</span>
                </>
              )}
              {activeStation === "forum" && (
                <>
                  <span className="sm:hidden">Station 10: Forum Hub</span>
                  <span className="hidden sm:inline">Station 10: Community Forum Moderation Hub</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
          {/* STATION 1: ACADEMIC BLUEPRINT */}
          {/* ========================================================================= */}
          {activeStation === "structure" && (
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* Executive Sub-Station Segmented Bar (2 cols on mobile, 4 cols on desktop) */}
              <div className="flex flex-col gap-3 border-b border-border pb-4 w-full">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-2xl sm:rounded-3xl bg-surface/80 border border-border/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setStructureSubTab("departments")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      structureSubTab === "departments"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">1. Departments</span>
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
                      "flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      structureSubTab === "programs"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">2. Specializations</span>
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
                      "flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      structureSubTab === "sections"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">3. Sections</span>
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
                      "flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      structureSubTab === "subjects"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">4. Course Modules</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.2 text-[0.62rem] font-mono font-bold shrink-0",
                      structureSubTab === "subjects" ? "bg-white/25 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {subjects.length}
                    </span>
                  </button>
                </div>

                {/* Prominent Action Button */}
                <div className="flex justify-end">
                  {structureSubTab === "departments" && (
                    <button
                      onClick={() => setShowDeptModal(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer w-full sm:w-auto"
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
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer w-full sm:w-auto"
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
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer w-full sm:w-auto"
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
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer w-full sm:w-auto"
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
                    departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-5 shadow-xs hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div className="flex items-center gap-2">
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

                          <div>
                            <h3 className="font-display text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                              {dept.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {dept.description || "Active Academic Department."}
                            </p>
                          </div>

                          {dept.head_of_department && (
                            <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-surface/70 p-2.5 text-xs">
                              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
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
                        </div>

                        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground font-mono">
                          <span>Programs: {programs.filter((p) => p.department === dept.id).length}</span>
                          <span className="font-bold text-primary">Subjects: {subjects.filter((s) => s.department === dept.id).length}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Programs / Specializations Sub-View */}
              {structureSubTab === "programs" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {programs.length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Specializations Added Yet</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Add Degree Programs Under Departments (E.g. B.Tech Artificial Intelligence &amp; Machine Learning).
                      </p>
                    </div>
                  ) : (
                    programs.map((prog) => (
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
              )}

              {/* Sections Sub-View */}
              {structureSubTab === "sections" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {sections.length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <Layers className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Sections Configured Yet</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Configure Semester Cohorts And Section Batches (E.g. Semester 1, Section A).
                      </p>
                    </div>
                  ) : (
                    sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="group relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-surface/40 p-5 shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-mono font-bold text-xs shadow-xs">
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
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400">
                                Semester {sec.semester}
                              </span>
                              {sec.program_code && (
                                <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[0.65rem] font-mono font-bold text-muted-foreground">
                                  {sec.program_code}
                                </span>
                              )}
                            </div>
                            <h3 className="font-display font-bold text-sm text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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
              )}

              {/* Subjects Sub-View */}
              {structureSubTab === "subjects" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.length === 0 ? (
                    <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                      <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40" />
                      <h3 className="font-display font-bold text-base text-foreground">No Subjects Registered Yet</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Add Subjects And Course Modules To Your Curriculum.
                      </p>
                    </div>
                  ) : (
                    subjects.map((sub) => (
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
              )}
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
                <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 rounded-2xl sm:rounded-3xl bg-surface/80 border border-border/80 shadow-2xs">
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
                      "flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      publisherType === "NOTES"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Notes</span>
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
                      "flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      publisherType === "SOLVED_PYQ"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <Award className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">PYQs</span>
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
                      "flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      publisherType === "SYLLABUS"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <ScrollText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Syllabus</span>
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
                      "flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2.5 text-xs font-bold transition-all cursor-pointer",
                      publisherType === "LAB_MANUAL"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Labs &amp; Viva</span>
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
                      "flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl px-2.5 py-2.5 text-xs font-bold transition-all cursor-pointer col-span-2 xs:col-span-1",
                      publisherType === "FACULTY"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
                    )}
                  >
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Faculty</span>
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

                <button
                  onClick={() => {
                    const secObj = sections.find((s) => s.id === selectedSectionId);
                    setNewTimetableSlot({
                      ...newTimetableSlot,
                      semester: selectedSemester || 1,
                      section: secObj?.section || "A",
                      subject: selectedSubjectId || (subjects[0]?.id || ""),
                    });
                    setShowTimetableModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Timetable Slot</span>
                </button>
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
                <button
                  onClick={() => {
                    setEditingNoticeId(null);
                    setNewNotice({
                      title: "",
                      content: "",
                      category: "Examination",
                      priority: "HIGH",
                      target_department: selectedDeptId || "",
                      target_semester: selectedSemester || 1,
                      is_broadcast_all: true,
                    });
                    setShowNoticeModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Broadcast New Notice</span>
                </button>
              </div>

              {/* Notices List */}
              {filteredNotices.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                  <Megaphone className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <h3 className="font-display font-bold text-base text-foreground">No Official Circulars Dispatched Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Broadcast Examination Notifications And Department Updates To Student Dashboards.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredNotices.map((n) => (
                    <div key={n.id} className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all">
                      <div>
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                            {n.category}
                          </span>
                          <div className="flex items-center gap-1">
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
                        <h3 className="mt-3 font-display text-base font-bold text-foreground">{n.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-3 leading-relaxed">{n.content}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                        <span>Target: {n.is_broadcast_all ? "All Students" : `Sem ${n.target_semester}`}</span>
                        <span className="font-mono text-[0.65rem]">{n.priority}</span>
                      </div>
                    </div>
                  ))}
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

          {activeStation === "support" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Station 9: Student Support Desk & Grievance Manager ({tickets.length})
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
                    Station 10: Community Forum Moderation & Channel Studio ({posts.length})
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg text-foreground">
                {editingDeptId ? "Edit Academic Department" : "Create Academic Department"}
              </h3>
              <button
                onClick={() => {
                  setShowDeptModal(false);
                  setEditingDeptId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
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
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Code (Abbreviation)</label>
                  <input
                    type="text"
                    value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                    placeholder="CSE"
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Head Of Department</label>
                  <input
                    type="text"
                    value={newDept.head_of_department}
                    onChange={(e) => setNewDept({ ...newDept, head_of_department: e.target.value })}
                    placeholder="Dr. Rajeshwar Sen"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
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
                  className="w-full rounded-2xl border border-border bg-background p-3 focus:border-primary focus:outline-none"
                />
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer">
                {editingDeptId ? "Save Department Changes" : "Create Department"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Program / Specialization */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg text-foreground">
                {editingProgramId ? "Edit Degree Program / Specialization" : "Add Degree Program / Specialization"}
              </h3>
              <button
                onClick={() => {
                  setShowProgramModal(false);
                  setEditingProgramId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
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
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
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
                  placeholder="B.Tech Artificial Intelligence & Machine Learning"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Degree Level</label>
                <select
                  value={newProgram.degree_level}
                  onChange={(e) => setNewProgram({ ...newProgram, degree_level: e.target.value })}
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-semibold focus:border-primary focus:outline-none"
                >
                  <option value="Undergraduate (B.Tech)">Undergraduate (B.Tech)</option>
                  <option value="Postgraduate (M.Tech / MCA / M.Sc)">Postgraduate (M.Tech / MCA / M.Sc)</option>
                  <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                  <option value="Doctoral (Ph.D)">Doctoral (Ph.D)</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Code</label>
                  <input
                    type="text"
                    value={newProgram.code}
                    onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value.toUpperCase() })}
                    placeholder="BTECH-AIML"
                    required
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    value={newProgram.duration_years}
                    onChange={(e) => setNewProgram({ ...newProgram, duration_years: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Total Semesters</label>
                  <input
                    type="number"
                    value={newProgram.total_semesters}
                    onChange={(e) => setNewProgram({ ...newProgram, total_semesters: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer">
                {editingProgramId ? "Save Specialization Changes" : "Create Specialization Program"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Section */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg text-foreground">
                {editingSectionId ? "Edit Semester Section Batch" : "Configure Semester Section Batch"}
              </h3>
              <button
                onClick={() => {
                  setShowSectionModal(false);
                  setEditingSectionId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
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
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                >
                  <option value="">Select Specialization...</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Semester (1–8)</label>
                  <select
                    value={newSection.semester}
                    onChange={(e) => setNewSection({ ...newSection, semester: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
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
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={newSection.academic_year}
                    onChange={(e) => setNewSection({ ...newSection, academic_year: e.target.value })}
                    placeholder="2026-2027"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono font-bold focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newSection.max_capacity}
                    onChange={(e) => setNewSection({ ...newSection, max_capacity: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer">
                {editingSectionId ? "Save Section Changes" : "Create Section Cohort"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register / Edit Subject */}
      {/* Modal: Register / Edit Subject */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  {editingSubjectId ? "Edit Course Subject" : "Register Course Subject"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Associate This Subject With One Or Multiple Degree Specializations.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSubjectModal(false);
                  setEditingSubjectId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl sm:max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  {editingMaterialId
                    ? "Edit Academic Study Material"
                    : `Publish ${publisherType === "NOTES" ? "Unit Handwritten Notes" : publisherType === "SYLLABUS" ? "Official Syllabus Breakdown" : publisherType === "FACULTY" ? "Faculty Material" : "Solved University PYQ"}`}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Compose page-by-page DRM manuscripts or upload full PDF/PPT courseware documents.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMaterialModal(false);
                  setEditingMaterialId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  {editingLabId ? "Edit Practical Experiment & Viva Drills" : "Add Practical Experiment & Viva Drills"}
                </h3>
                <p className="text-xs text-muted-foreground">Register full laboratory algorithms and multiple interactive viva examination questions.</p>
              </div>
              <button
                onClick={() => {
                  setShowLabModal(false);
                  setEditingLabId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg text-foreground">
                {editingAssignmentId ? "Edit Course Assignment" : "Create Course Assignment"}
              </h3>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setEditingAssignmentId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
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
              <div className="grid grid-cols-2 gap-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg text-foreground">
                {editingTimetableId ? "Edit Timetable Lecture Slot" : "Add Timetable Lecture Slot"}
              </h3>
              <button
                onClick={() => {
                  setShowTimetableModal(false);
                  setEditingTimetableId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
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
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Day Of Week</label>
                  <select
                    value={newTimetableSlot.day_of_week}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, day_of_week: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
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
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">End Time</label>
                  <input
                    type="time"
                    value={newTimetableSlot.end_time}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, end_time: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Semester (1–8)</label>
                  <select
                    value={newTimetableSlot.semester}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, semester: Number(e.target.value) })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Section Cohort</label>
                  <input
                    type="text"
                    value={newTimetableSlot.section}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, section: e.target.value.toUpperCase() })}
                    placeholder="A"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 font-mono font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={newTimetableSlot.room_number}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, room_number: e.target.value })}
                    placeholder="LT-01"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Faculty</label>
                  <input
                    type="text"
                    value={newTimetableSlot.faculty_name}
                    onChange={(e) => setNewTimetableSlot({ ...newTimetableSlot, faculty_name: e.target.value })}
                    placeholder="Dr. Meera Raghav"
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer">
                {editingTimetableId ? "Save Slot Changes" : "Add Timetable Slot"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Broadcast / Edit Notice */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg text-foreground">
                {editingNoticeId ? "Edit Department Notice / Circular" : "Broadcast Official Notice"}
              </h3>
              <button
                onClick={() => {
                  setShowNoticeModal(false);
                  setEditingNoticeId(null);
                }}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveNotice} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Headline</label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  placeholder="End-Term Practical Examination Schedule"
                  required
                  className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  >
                    <option value="Examination">Examination</option>
                    <option value="Academic Update">Academic Update</option>
                    <option value="Lab Circular">Lab Circular</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 focus:border-primary focus:outline-none"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Circular</option>
                    <option value="STANDARD">Standard Notice</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Circular Content</label>
                <textarea
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  placeholder="Enter Full Official Notice Statement..."
                  rows={4}
                  required
                  className="w-full rounded-2xl border border-border bg-background p-3 focus:border-primary focus:outline-none"
                />
              </div>
              <button type="submit" className="h-11 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-md hover:bg-primary-deep cursor-pointer">
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
    </div>
  );
}
