const API_BASE = (import.meta.env as any)["VITE_API_BASE_URL"] || "/api";

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  head_of_department?: string;
  programs?: ProgramSpecialization[];
  subjects_count?: number;
  created_at?: string;
}

export interface ProgramSpecialization {
  id: string;
  department: string;
  department_name?: string;
  department_code?: string;
  name: string;
  code: string;
  degree_level: string;
  duration_years: number;
  total_semesters: number;
  created_at?: string;
}

export interface SectionBatch {
  id: string;
  program: string;
  program_name?: string;
  program_code?: string;
  semester: number;
  section?: string;
  section_name?: string;
  batch_code?: string;
  academic_year: string;
  max_capacity: number;
  created_at?: string;
}

export interface StudentUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone_number: string;
  bio?: string;
  academic_focus?: string;
  career_goal?: string;
  university: string;
  department: string;
  program: string;
  program_code?: string;
  program_name?: string;
  semester: number;
  section: string;
  roll_number: string;
  enrollment_no: string;
  avatar_url: string;
  access_tier: "FREE" | "BASIC" | "PREMIUM" | "ELITE" | "STARTER" | "SCHOLAR" | "ACHIEVER" | "ELITE_PLUS" | "SEMESTER_TOPPER" | "VIP" | (string & {});
  target_cgpa: string;
  current_cgpa: string;
  is_verified: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
  is_drm_blocked?: boolean;
  is_login_blocked?: boolean;
  cooldown_until?: string | null;
  block_reason?: string;
  security_warning_note?: string;
  drm_violations_count?: number;
  active_sessions_count?: number;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  actor: string | null;
  actor_email: string;
  actor_name: string;
  target_user: string | null;
  target_email: string;
  target_name: string;
  action_type: string;
  reason: string;
  metadata: Record<string, any>;
  ip_address?: string;
  timestamp: string;
}

export interface DrmSecurityIncident {
  id: string;
  user?: string;
  user_email?: string;
  user_name?: string;
  material?: string;
  material_title?: string;
  event_type: string;
  client_ip?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface Subject {
  id: string;
  department?: string;
  department_name?: string;
  program?: string;
  program_name?: string;
  programs?: string[];
  program_ids?: string[];
  program_names?: string[];
  program_codes?: string[];
  name: string;
  code: string;
  short_name?: string;
  semester: number;
  credits: number;
  syllabus_summary?: string;
  faculty_name?: string;
  icon_name?: string;
  materials_count?: number;
  experiments_count?: number;
  units_count?: number;
}

export interface SubjectUnit {
  id: string;
  subject: string;
  subject_code?: string;
  subject_name?: string;
  department_name?: string;
  semester?: number;
  unit_number: number;
  title: string;
  description?: string;
  topics?: string[];
  marks_weightage?: number;
  estimated_hours?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicMaterial {
  id: string;
  subject: string;
  subject_code: string;
  subject_name: string;
  semester: number;
  title: string;
  material_type: "NOTES" | "SOLVED_PYQ" | "FORMULA_SHEET" | "LAB_MANUAL" | "VIVA_BANK" | "SYLLABUS" | "FACULTY";
  academic_year: string;
  unit_number?: number;
  summary: string;
  page_count: number;
  preview_pages_count: number;
  is_free: boolean;
  is_topper_verified: boolean;
  is_drm_protected?: boolean;
  file?: string;
  tags?: string[];
  pages?: Array<{ page_number: number; page_title?: string; content_html?: string }>;
  views_count: number;
  is_bookmarked?: boolean;
  created_at: string;
}

export interface LabExperiment {
  id: string;
  subject: string;
  subject_code: string;
  subject_name: string;
  experiment_number: number;
  title: string;
  aim: string;
  apparatus_required?: string;
  theory?: string;
  procedure_steps?: string[];
  code_snippets?: Record<string, string>;
  output_sample?: string;
  viva_questions?: Array<{ question?: string; answer?: string; q?: string; a?: string }>;
  theory_procedure?: string;
}

export interface StudentAssignment {
  id: string;
  subject: string;
  subject_code: string;
  subject_name: string;
  title: string;
  description: string;
  due_date: string;
  total_marks: number;
  obtained_marks?: number;
  weightage_percentage?: number;
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "EVALUATED";
  ai_outline_json?: any[];
  citation_format?: string;
  citations_list?: string[];
  created_at: string;
  updated_at: string;
}

export interface TimetableSlot {
  id: string;
  semester: number;
  section: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  title: string;
  subject?: string;
  subject_code?: string;
  room_number: string;
  faculty_name: string;
  meta_info: string;
  event_type: "Class" | "Practical" | "Task" | "Deadline" | "Project";
  tone: string;
}

export interface PersonalStudyTask {
  id: string;
  title: string;
  date: string;
  time: string;
  is_completed: boolean;
  priority: string;
  created_at: string;
}

export interface MilestoneCountdown {
  id: string;
  title: string;
  target_date: string;
  category: string;
  semester: number;
  tag: string;
  is_active: boolean;
  created_at: string;
}

export interface DepartmentNotice {
  id: string;
  department?: string;
  department_name?: string;
  department_code?: string;
  target_department?: string;
  program?: string;
  program_name?: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  tag?: string;
  target_semester?: number | null;
  target_section?: string;
  is_broadcast_all?: boolean;
  reference_number?: string;
  published_by?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SidebarBadgeConfig {
  id: string;
  label: string;
  badge_text: string;
  badge_variant: string;
  is_active: boolean;
  display_order: number;
  updated_at?: string;
}

export interface SiteBanner {
  id: string;
  title: string;
  message: string;
  tag: string;
  variant: "emerald" | "amber" | "rose" | "purple" | "cyan" | "gradient";
  target: "ALL" | "DASHBOARD" | "WEBSITE";
  link_url?: string;
  link_text?: string;
  is_active: boolean;
  is_dismissible: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardSummary {
  user_name: string;
  roll_number: string;
  program: string;
  semester: number;
  section: string;
  access_tier: string;
  target_cgpa: number;
  current_cgpa?: number;
  avatar_url?: string;
  is_drm_blocked?: boolean;
  is_login_blocked?: boolean;
  cooldown_until?: string | null;
  block_reason?: string;
  security_warning_note?: string;
  metrics: {
    enrolled_subjects: number;
    total_notes_available: number;
    solved_pyqs_count: number;
    lab_manuals_count?: number;
    completed_assignments: number;
    pending_assignments: number;
    viva_questions_bank: number;
  };
  next_lecture?: {
    title: string;
    time: string;
    start_time?: string;
    end_time?: string;
    room: string;
    faculty: string;
    topic: string;
    day?: string;
    day_code?: string;
    is_ongoing?: boolean;
    day_status?: "LIVE_IN_SESSION" | "UPCOMING_TODAY" | "DAY_ENDED" | "NO_CLASSES_TODAY";
    today_name?: string;
    current_ist_time?: string;
  };
  recent_materials: AcademicMaterial[];
  notices: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    tag: string;
    created_at?: string;
  }>;
}

export interface DrmMaterialPayload {
  session_token: string;
  material_id: string;
  title: string;
  subject_code: string;
  subject_name: string;
  total_pages: number;
  access_tier: string;
  watermark: {
    student_name: string;
    roll_number: string;
    enrollment_no: string;
    ip_address: string;
    timestamp: string;
    session_hash: string;
  };
  file_url?: string;
  file_name?: string;
  file_ext?: string;
}

export interface DrmPageVector {
  page_number: number;
  page_title: string;
  content_html: string;
  diagram_svg?: string;
  vector_elements?: any[];
  is_preview?: boolean;
  file_url?: string;
  file_name?: string;
  file_ext?: string;
}

export interface DRMSessionResponse {
  drm_token: string;
  material: {
    id: string;
    title: string;
    subject_code: string;
    subject_name: string;
    material_type: string;
    page_count: number;
    preview_pages_count: number;
    is_preview_only: boolean;
  };
  watermark: {
    text_lines: string[];
    single_line: string;
    student_name: string;
    roll_number: string;
    timestamp: string;
    ip_address: string;
    rotation_deg: number;
    opacity: number;
  };
  expires_at: string;
  protection_policy: {
    allow_download: boolean;
    allow_print: boolean;
    allow_copy: boolean;
    blur_on_focus_loss: boolean;
    devtools_detection: boolean;
  };
}

export interface DRMPageResponse {
  page: {
    page_number: number;
    page_title: string;
    content_html: string;
    diagram_svg?: string;
    vector_elements?: any[];
    is_preview: boolean;
  };
  total_pages: number;
  watermark: DRMSessionResponse["watermark"];
}

// Token storage helpers
export function getAccessToken(): string | null {
  return localStorage.getItem("nimswallah_access_token");
}

export function setAccessToken(token: string) {
  localStorage.setItem("nimswallah_access_token", token);
}

export function removeAccessToken() {
  localStorage.removeItem("nimswallah_access_token");
  localStorage.removeItem("nimswallah_refresh_token");
  localStorage.removeItem("nimswallah_user");
}

export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => {
      if (!word) return "";
      if (
        (word.startsWith("'") || word.startsWith('"')) &&
        (word.endsWith("'") || word.endsWith('"')) &&
        word.length > 2
      ) {
        const quote = word[0];
        const inner = word.slice(1, -1).replace(/_/g, " ");
        const formattedInner = toTitleCase(inner);
        return `${quote}${formattedInner}${quote}`;
      }
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (
        [
          "cgpa",
          "drm",
          "pyq",
          "pyqs",
          "ai",
          "ieee",
          "apa",
          "pdf",
          "zip",
          "nims",
          "nimswallah",
          "cse",
          "aiml",
          "id",
          "api",
          "url",
          "utc",
          "ip",
          "lt-01",
        ].includes(clean)
      ) {
        return word.toUpperCase();
      }
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""))
          .join("-");
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

// Universal Authenticated Fetch Wrapper With Auto Token Refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("nimswallah_refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.access) {
        setAccessToken(data.access);
        if (data.refresh) {
          localStorage.setItem("nimswallah_refresh_token", data.refresh);
        }
        return data.access;
      }
    }
  } catch (e) {
    console.error("Token refresh failed:", e);
  }
  return null;
}

// In-flight GET request deduplication map to prevent redundant concurrent fetches
const inFlightRequests = new Map<string, Promise<any>>();

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const token = getAccessToken();

  // Deduplicate identical concurrent GET requests
  const cacheKey = method === "GET" && !options.body ? `${endpoint}::${token || "anon"}` : null;
  if (cacheKey && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      let res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized With Automatic JWT Token Refresh & Retry
      if (res.status === 401 && token && !endpoint.includes("/auth/login/") && !endpoint.includes("/auth/refresh/")) {
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          if (newToken) {
            onRefreshed(newToken);
          } else {
            removeAccessToken();
            refreshSubscribers = [];
          }
        }

        // Wait For The Token Refresh To Complete
        const retryPromise = new Promise<Response>((resolve) => {
          subscribeTokenRefresh(async (newToken) => {
            const retryHeaders: HeadersInit = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
              ...options.headers,
            };
            const retryRes = await fetch(`${API_BASE}${endpoint}`, {
              ...options,
              headers: retryHeaders,
            });
            resolve(retryRes);
          });
        });

        const currentToken = getAccessToken();
        if (currentToken && currentToken !== token) {
          const retryHeaders: HeadersInit = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
            ...options.headers,
          };
          res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: retryHeaders,
          });
        } else if (isRefreshing) {
          res = await retryPromise;
        }
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const rawError =
          errorData.error ||
          errorData.detail ||
          (Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : null) ||
          (typeof errorData === "object" ? Object.values(errorData)[0] : null) ||
          `Request Failed With Status ${res.status}`;
        const errorMsg = Array.isArray(rawError) ? rawError[0] : typeof rawError === "string" ? rawError : JSON.stringify(rawError);
        throw new Error(toTitleCase(errorMsg));
      }

      if (res.status === 204) {
        return {} as T;
      }

      const text = await res.text();
      return text ? JSON.parse(text) : ({} as T);
    } finally {
      if (cacheKey) {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (cacheKey) {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

// --------------------------------------------------------
// Community (Forum & Student Desk)
// --------------------------------------------------------
export interface TicketMessage {
  id: string;
  ticket: string;
  sender: string;
  sender_name: string;
  sender_email: string;
  message: string;
  is_staff_reply: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user: string;
  user_name: string;
  user_email: string;
  user_program?: string;
  user_semester?: number;
  user_section?: string;
  subject: string;
  description: string;
  category: "ACADEMIC" | "EXAMS" | "LABS" | "TIMETABLE" | "FEE" | "TECHNICAL" | "GENERAL";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  admin_response: string;
  admin_notes: string;
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  id: string;
  post: string;
  author: string;
  author_name: string;
  author_role: string;
  is_staff: boolean;
  parent_comment?: string | null;
  content: string;
  upvotes: number;
  replies?: ForumComment[];
  created_at: string;
}

export interface ForumPost {
  id: string;
  author: string;
  author_name: string;
  author_role: string;
  author_program?: string;
  author_semester?: number;
  author_section?: string;
  is_staff: boolean;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  is_locked: boolean;
  upvotes: number;
  tags?: string;
  has_upvoted?: boolean;
  comments_count: number;
  comments: ForumComment[];
  created_at: string;
  updated_at: string;
}

export const communityApi = {
  // Student Desk
  getTickets: async (): Promise<SupportTicket[]> => {
    const res = await apiFetch<any>("/community/desk/");
    return Array.isArray(res) ? res : res?.results || [];
  },
  createTicket: (data: { subject: string; description: string; category?: string; priority?: string }) =>
    apiFetch<SupportTicket>("/community/desk/", { method: "POST", body: JSON.stringify(data) }),
  sendTicketMessage: (id: string, message: string) =>
    apiFetch<TicketMessage>(`/community/desk/${id}/message/`, { method: "POST", body: JSON.stringify({ message }) }),
  resolveTicket: (id: string, data: { admin_response?: string; admin_notes?: string; status: string }) =>
    apiFetch<SupportTicket>(`/community/desk/${id}/resolve/`, { method: "PATCH", body: JSON.stringify(data) }),
  updateTicketStatus: (id: string, status: string) =>
    apiFetch<SupportTicket>(`/community/desk/${id}/status_update/`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Forum
  getPosts: async (): Promise<ForumPost[]> => {
    const res = await apiFetch<any>("/community/forum/");
    return Array.isArray(res) ? res : res?.results || [];
  },
  createPost: (data: { title: string; content: string; category?: string; tags?: string }) =>
    apiFetch<ForumPost>("/community/forum/", { method: "POST", body: JSON.stringify(data) }),
  deletePost: (id: string) =>
    apiFetch<void>(`/community/forum/${id}/`, { method: "DELETE" }),
  upvotePost: (id: string) =>
    apiFetch<{ status: string; upvotes: number; has_upvoted: boolean }>(`/community/forum/${id}/upvote/`, { method: "POST" }),
  createComment: (postId: string, data: { content: string; parent_comment?: string | null | undefined }) =>
    apiFetch<ForumComment>(`/community/forum/${postId}/comment/`, { method: "POST", body: JSON.stringify(data) }),
  deleteComment: (commentId: string) =>
    apiFetch<void>(`/community/comments/${commentId}/`, { method: "DELETE" }),
  togglePinPost: (postId: string) =>
    apiFetch<{ status: string; is_pinned: boolean }>(`/community/forum/${postId}/pin/`, { method: "POST" }),
  toggleLockPost: (postId: string) =>
    apiFetch<{ status: string; is_locked: boolean }>(`/community/forum/${postId}/lock/`, { method: "POST" }),
};

// --------------------------------------------------------
// Student Management & Security Shield API
// --------------------------------------------------------
export const studentSecurityApi = {
  getStudents: async (params?: { semester?: number; program?: string; search?: string }): Promise<StudentUser[]> => {
    const query = new URLSearchParams();
    if (params?.semester) query.set("semester", String(params.semester));
    if (params?.program) query.set("program", params.program);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiFetch<any>(`/accounts/admin/users/${qs}`);
    return Array.isArray(res) ? res : res?.results || [];
  },
  registerStudent: (data: {
    email: string;
    full_name: string;
    roll_number: string;
    enrollment_no?: string | undefined;
    department?: string | undefined;
    program?: string | undefined;
    semester: number;
    section?: string | undefined;
    access_tier?: string | undefined;
    password?: string | undefined;
  }) =>
    apiFetch<{ message: string; user: StudentUser }>("/accounts/admin/users/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  upgradeSemester: (data: {
    mode: "single" | "bulk";
    student_id?: string | undefined;
    current_semester?: number | undefined;
    target_semester?: number | undefined;
    section?: string | undefined;
    program?: string | undefined;
    reason?: string | undefined;
  }) =>
    apiFetch<{ message: string; user?: StudentUser; affected_count?: number }>(
      "/academic/admin/students/semester-upgrade/",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
  performSecurityAction: (
    userId: string,
    data: {
      action_type: string;
      reason: string;
      section?: string;
      cooldown_hours?: number | null;
      warning_message?: string;
      access_tier?: string;
      new_password?: string;
    }
  ) =>
    apiFetch<{ message: string; user: StudentUser; metadata: Record<string, any> }>(
      `/accounts/admin/users/${userId}/security-action/`,
      { method: "POST", body: JSON.stringify(data) }
    ),
  changeSection: (
    userId: string,
    data: {
      section: string;
      program?: string | undefined;
      semester?: number | undefined;
      department?: string | undefined;
      reason?: string | undefined;
    }
  ) =>
    apiFetch<{ message: string; user: StudentUser; metadata: Record<string, any> }>(
      `/accounts/admin/users/${userId}/security-action/`,
      {
        method: "POST",
        body: JSON.stringify({
          action_type: "CHANGE_SECTION",
          section: data.section,
          program: data.program,
          semester: data.semester,
          department: data.department,
          reason: data.reason || "Class Section Reassigned By Administrator",
        }),
      }
    ),
  hardDeleteStudent: (userId: string) =>
    apiFetch<{ message: string; deleted_id: string }>(`/academic/admin/students/${userId}/`, { method: "DELETE" }),
  bulkResetSecurity: (reason?: string) =>
    apiFetch<{ message: string; affected_users_count: number }>("/accounts/admin/users/bulk-reset-security/", {
      method: "POST",
      body: JSON.stringify({ reason: reason || "Global Clean Slate Administrative Reset For All Users" }),
    }),
  getAuditLogs: async (params?: { action?: string; target_id?: string; search?: string }): Promise<AdminAuditLog[]> => {
    const query = new URLSearchParams();
    if (params?.action) query.set("action", params.action);
    if (params?.target_id) query.set("target_id", params.target_id);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiFetch<any>(`/accounts/admin/audit-logs/${qs}`);
    return Array.isArray(res) ? res : res?.results || [];
  },
  clearAuditLogs: (params?: { action_filter?: string; reason?: string }) =>
    apiFetch<{ message: string; deleted_count: number }>("/accounts/admin/audit-logs/clear/", {
      method: "POST",
      body: JSON.stringify(params || {}),
    }),
  getDrmIncidents: async (params?: { user_id?: string; event_type?: string }): Promise<DrmSecurityIncident[]> => {
    const query = new URLSearchParams();
    if (params?.user_id) query.set("user_id", params.user_id);
    if (params?.event_type) query.set("event_type", params.event_type);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiFetch<any>(`/drm/admin/incidents/${qs}`);
    return Array.isArray(res) ? res : res?.results || [];
  },
  clearDrmIncidents: (params?: { event_filter?: string; reason?: string }) =>
    apiFetch<{ message: string; deleted_count: number }>("/drm/admin/incidents/clear/", {
      method: "POST",
      body: JSON.stringify(params || {}),
    }),
  acknowledgeWarning: () =>
    apiFetch<{ message: string }>("/accounts/acknowledge-warning/", { method: "POST" }),
};

export const globalDrmApi = {
  getConfig: () => apiFetch<{ is_drm_enabled: boolean; updated_at?: string }>("/drm/config/"),
  updateConfig: (is_drm_enabled: boolean) =>
    apiFetch<{ is_drm_enabled: boolean; message: string }>("/drm/config/", {
      method: "POST",
      body: JSON.stringify({ is_drm_enabled }),
    }),
};

export const academicUnitApi = {
  getUnits: async (params?: { subject?: string; semester?: number; department?: string; search?: string }): Promise<SubjectUnit[]> => {
    const query = new URLSearchParams();
    if (params?.subject) query.set("subject", params.subject);
    if (params?.semester) query.set("semester", String(params.semester));
    if (params?.department) query.set("department", params.department);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiFetch<any>(`/academic/admin/units/${qs}`);
    return Array.isArray(res) ? res : res?.results || [];
  },
  createUnit: (data: Partial<SubjectUnit>) =>
    apiFetch<SubjectUnit>("/academic/admin/units/", { method: "POST", body: JSON.stringify(data) }),
  updateUnit: (id: string, data: Partial<SubjectUnit>) =>
    apiFetch<SubjectUnit>(`/academic/admin/units/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUnit: (id: string) =>
    apiFetch<void>(`/academic/admin/units/${id}/`, { method: "DELETE" }),
};

export interface DiscountCoupon {
  id: string;
  code: string;
  discount_percent: number;
  discount_amount: number;
  max_uses: number;
  times_used: number;
  is_active: boolean;
  applicable_tier: string;
  valid_until?: string | null;
  created_at: string;
}

export interface RazorpayOrderRecord {
  id: string;
  order_id: string;
  amount: number;
  amount_inr: number;
  discount_inr: number;
  currency: string;
  plan_tier: string;
  cycle: string;
  status: "created" | "paid" | "failed" | "refunded" | string;
  payment_id?: string;
  signature?: string;
  invoice_number?: string;
  discount_code?: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_name: string;
  user_roll?: string;
  user_tier?: string;
}

export const adminSubscriptionApi = {
  getOrders: async (params?: { status?: string; search?: string; tier?: string }): Promise<RazorpayOrderRecord[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.tier) query.set("tier", params.tier);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await apiFetch<any>(`/subscriptions/admin/orders/${qs}`);
    return Array.isArray(res) ? res : res?.results || [];
  },
  createOrder: (data: { user_email: string; plan_tier: string; cycle: string; amount_inr: number; status: string }) =>
    apiFetch<any>("/subscriptions/admin/orders/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateOrder: (id: string, data: { plan_tier?: string; cycle?: string; amount_inr?: number; status?: string; invoice_number?: string }) =>
    apiFetch<any>(`/subscriptions/admin/orders/${id}/action/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteOrder: (id: string) =>
    apiFetch<any>(`/subscriptions/admin/orders/${id}/action/`, {
      method: "DELETE",
    }),
  orderAction: (id: string, action: "MARK_PAID" | "REFUND" | "REGENERATE_INVOICE" | "MERGE_DUPLICATES", reason?: string) =>
    apiFetch<any>(`/subscriptions/admin/orders/${id}/action/`, {
      method: "POST",
      body: JSON.stringify({ action, reason }),
    }),
  getInvoice: (id: string) => apiFetch<any>(`/subscriptions/admin/invoices/${id}/`),
  getCoupons: async (): Promise<DiscountCoupon[]> => {
    const res = await apiFetch<any>("/subscriptions/admin/coupons/");
    return Array.isArray(res) ? res : res?.results || [];
  },
  createCoupon: (data: Partial<DiscountCoupon> & { valid_days?: number }) =>
    apiFetch<any>("/subscriptions/admin/coupons/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCoupon: (id: string, data: Partial<DiscountCoupon>) =>
    apiFetch<any>(`/subscriptions/admin/coupons/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteCoupon: (id: string) =>
    apiFetch<void>(`/subscriptions/admin/coupons/${id}/`, { method: "DELETE" }),
  applyCoupon: (code: string, plan_tier: string, cycle: string) =>
    apiFetch<any>("/subscriptions/apply-coupon/", {
      method: "POST",
      body: JSON.stringify({ code, plan_tier, cycle }),
    }),
};

export const studentSubscriptionApi = {
  getMyInvoices: () =>
    apiFetch<{ orders: any[]; latest_invoice: any }>("/subscriptions/my-invoices/"),
  getInvoice: (id: string) =>
    apiFetch<any>(`/subscriptions/my-invoices/${id}/`),
};




