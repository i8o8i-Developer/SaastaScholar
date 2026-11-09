import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  Users,
  Plus,
  Search,
  Key,
  Trash2,
  Edit3,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminRole,
  AdminStaffUser,
  adminRolesApi,
  adminStaffUsersApi,
  toTitleCase,
} from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

interface StationDefinition {
  id: string;
  name: string;
  description: string;
  category: "Academic" | "Monetization" | "Student Affairs" | "System";
}

const ADMIN_STATIONS: StationDefinition[] = [
  {
    id: "overview",
    name: "Admin Overview & Live Telemetry",
    description: "System Telemetry, Live Statistics, And Activity Overview",
    category: "System",
  },
  {
    id: "structure",
    name: "Academic Structure Hierarchy",
    description: "Departments, Programs, Sections, Subjects, And Units",
    category: "Academic",
  },
  {
    id: "publisher",
    name: "Study Material Publishing Hub",
    description: "Upload Notes, Solved PYQs, Syllabi, And Lab Manuals",
    category: "Academic",
  },
  {
    id: "timetable",
    name: "Class Timetables & Schedules",
    description: "Day-Wise Lecture Timetables And Faculty Allocations",
    category: "Academic",
  },
  {
    id: "assignments",
    name: "Student Assignments & Submissions",
    description: "Assignment Briefs, Rubrics, And AI Outlines",
    category: "Academic",
  },
  {
    id: "notices",
    name: "College Circulars & Notices",
    description: "Broadcast Official Department Notices And Announcements",
    category: "Academic",
  },
  {
    id: "milestones",
    name: "Exam Dates & Milestones",
    description: "University Exam Countdown Timers And Academic Schedules",
    category: "Academic",
  },
  {
    id: "students",
    name: "Student Directory & DRM Security",
    description: "Student User Registry, DRM Locks, And Disciplinary Controls",
    category: "Student Affairs",
  },
  {
    id: "subscriptions",
    name: "Payments, Invoices & Orders",
    description: "Razorpay Transactions, Invoices, And Order Reconciliation",
    category: "Monetization",
  },
  {
    id: "coupons",
    name: "Discount Coupons & Promo Codes",
    description: "Student Promo Codes, Flat Discounts, And Expiry Management",
    category: "Monetization",
  },
  {
    id: "plan-matrix",
    name: "Academic Plan Access Matrix",
    description: "Pricing Tier Definitions, Feature Gates, And Quotas",
    category: "Monetization",
  },
  {
    id: "banners",
    name: "Campus Broadcast Banners",
    description: "Top Banner Notifications And University Broadcasts",
    category: "Student Affairs",
  },
  {
    id: "badges",
    name: "Navigation Sidebar Badges",
    description: "Sidebar Tag Customization And Highlight Chips",
    category: "System",
  },
  {
    id: "support",
    name: "Help Desk Support Tickets",
    description: "Student Issue Resolution, Ticket Reassignment, And Replies",
    category: "Student Affairs",
  },
  {
    id: "forum",
    name: "Scholar Discussions & Moderation",
    description: "Student Community Forum Moderation And Resolution",
    category: "Student Affairs",
  },
  {
    id: "marketing",
    name: "Marketing & Broadcast Dispatches",
    description: "Weekly Academic Digests, Cohort Broadcasts, And Email Marketing",
    category: "Monetization",
  },
  {
    id: "email-studio",
    name: "Official Email Templates Studio",
    description: "Preview, Customize, And Dispatch All 16 Branded Templates",
    category: "System",
  },
  {
    id: "roles",
    name: "Admin Users & Roles Governance",
    description: "Administrative Accounts, Security Clearance, And Access Matrix",
    category: "System",
  },
];

type ActionType = "view" | "manage" | "delete" | "security";

export function AdminUsersRolesTab() {
  const [subTab, setSubTab] = useState<"users" | "roles">("users");
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [users, setUsers] = useState<AdminStaffUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Role Selection & Editor State
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<
    Record<string, { view: boolean; manage: boolean; delete: boolean; security: boolean }>
  >({});
  const [isSavingPermissions, setIsSavingPermissions] = useState<boolean>(false);

  // Modals State
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState<boolean>(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<AdminStaffUser | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState<string>("");

  // Form State: Create Admin User
  const [createUserForm, setCreateUserForm] = useState<{
    email: string;
    full_name: string;
    password: string;
    phone_number: string;
    admin_role_id: string;
  }>({
    email: "",
    full_name: "",
    password: "",
    phone_number: "",
    admin_role_id: "",
  });

  // Form State: Create Role
  const [createRoleForm, setCreateRoleForm] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedRoles, fetchedUsers] = await Promise.all([
        adminRolesApi.list(),
        adminStaffUsersApi.list(),
      ]);
      setRoles(fetchedRoles);
      setUsers(fetchedUsers);

      if (fetchedRoles.length > 0 && !selectedRole && fetchedRoles[0]) {
        selectRoleForEditing(fetchedRoles[0]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed To Load Roles And Users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper: Synchronize selected role permissions into matrix state
  const selectRoleForEditing = (role: AdminRole) => {
    setSelectedRole(role);
    const matrix: Record<string, { view: boolean; manage: boolean; delete: boolean; security: boolean }> = {};

    ADMIN_STATIONS.forEach((station) => {
      const isSuper = role.permissions?.["*"] !== undefined;
      const raw = (role.permissions as any)?.[station.id];

      if (isSuper) {
        matrix[station.id] = { view: true, manage: true, delete: true, security: true };
      } else if (typeof raw === "object" && raw !== null) {
        matrix[station.id] = {
          view: Boolean(raw.view),
          manage: Boolean(raw.manage),
          delete: Boolean(raw.delete),
          security: Boolean(raw.security),
        };
      } else if (typeof raw === "boolean") {
        matrix[station.id] = {
          view: raw,
          manage: raw,
          delete: raw,
          security: raw,
        };
      } else {
        matrix[station.id] = {
          view: false,
          manage: false,
          delete: false,
          security: false,
        };
      }
    });

    setEditingPermissions(matrix);
  };

  // Toggle permission flag
  const togglePermission = (stationId: string, action: ActionType) => {
    setEditingPermissions((prev) => {
      const currentStation = prev[stationId] || { view: false, manage: false, delete: false, security: false };
      const nextVal = !currentStation[action];
      const updated = { ...currentStation, [action]: nextVal };

      // If user enables manage, delete, or security, automatically ensure view is enabled
      if (nextVal && action !== "view") {
        updated.view = true;
      }
      // If user disables view, automatically disable all other capabilities
      if (!nextVal && action === "view") {
        updated.manage = false;
        updated.delete = false;
        updated.security = false;
      }

      return {
        ...prev,
        [stationId]: updated,
      };
    });
  };

  // Bulk Row Actions
  const toggleAllForStation = (stationId: string, grant: boolean) => {
    setEditingPermissions((prev) => ({
      ...prev,
      [stationId]: {
        view: grant,
        manage: grant,
        delete: grant,
        security: grant,
      },
    }));
  };

  // Bulk Matrix Actions
  const handleBulkMatrixAction = (mode: "all-view" | "full-clear" | "full-grant") => {
    const updated: Record<string, { view: boolean; manage: boolean; delete: boolean; security: boolean }> = {};
    ADMIN_STATIONS.forEach((st) => {
      if (mode === "all-view") {
        updated[st.id] = { view: true, manage: false, delete: false, security: false };
      } else if (mode === "full-grant") {
        updated[st.id] = { view: true, manage: true, delete: true, security: true };
      } else {
        updated[st.id] = { view: false, manage: false, delete: false, security: false };
      }
    });
    setEditingPermissions(updated);
  };

  // Save Permissions to Backend
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSavingPermissions(true);
    try {
      const updated = await adminRolesApi.update(selectedRole.id, {
        permissions: editingPermissions,
      });
      toast.success(`Role Permissions For '${toTitleCase(updated.name)}' Saved Successfully!`);
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRole(updated);
    } catch (err: any) {
      toast.error(err.message || "Failed To Save Permissions.");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Create Role Handler
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createRoleForm.name.trim()) {
      toast.error("Role Name Is Required.");
      return;
    }

    try {
      const initialPermissions: Record<string, any> = {};
      ADMIN_STATIONS.forEach((st) => {
        initialPermissions[st.id] = { view: true, manage: false, delete: false, security: false };
      });

      const newRole = await adminRolesApi.create({
        name: toTitleCase(createRoleForm.name.trim()),
        description: createRoleForm.description.trim() || "Custom Administrative Role",
        permissions: initialPermissions,
      });

      toast.success(`Role '${newRole.name}' Created Successfully!`);
      setRoles((prev) => [...prev, newRole]);
      selectRoleForEditing(newRole);
      setShowCreateRoleModal(false);
      setCreateRoleForm({ name: "", description: "" });
      setSubTab("roles");
    } catch (err: any) {
      toast.error(err.message || "Failed To Create Role.");
    }
  };

  // Delete Role Handler
  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are You Sure You Want To Delete The Role '${roleName}'? This Cannot Be Undone.`)) {
      return;
    }
    try {
      await adminRolesApi.delete(roleId);
      toast.success(`Role '${roleName}' Has Been Deleted.`);
      const remaining = roles.filter((r) => r.id !== roleId);
      setRoles(remaining);
      if (selectedRole?.id === roleId) {
        if (remaining.length > 0 && remaining[0]) {
          selectRoleForEditing(remaining[0]);
        } else {
          setSelectedRole(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed To Delete Role.");
    }
  };

  // Create Admin User Handler
  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUserForm.email.trim() || !createUserForm.full_name.trim() || !createUserForm.password.trim()) {
      toast.error("Full Name, Email, And Initial Password Are Required.");
      return;
    }

    try {
      const newUser = await adminStaffUsersApi.create({
        email: createUserForm.email.trim().toLowerCase(),
        full_name: toTitleCase(createUserForm.full_name.trim()),
        password: createUserForm.password,
        phone_number: createUserForm.phone_number.trim(),
        admin_role_id: createUserForm.admin_role_id || undefined,
      });

      toast.success(`Admin User '${newUser.full_name}' Created Successfully!`);
      setUsers((prev) => [newUser, ...prev]);
      setShowCreateUserModal(false);
      setCreateUserForm({
        email: "",
        full_name: "",
        password: "",
        phone_number: "",
        admin_role_id: "",
      });
      // Refresh roles to update user count
      adminRolesApi.list().then(setRoles);
    } catch (err: any) {
      toast.error(err.message || "Failed To Create Admin User.");
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPasswordValue.trim()) return;

    if (newPasswordValue.length < 6) {
      toast.error("Password Must Be At Least 6 Characters.");
      return;
    }

    try {
      const res = await adminStaffUsersApi.resetPassword(selectedUserForPassword.id, newPasswordValue);
      toast.success(res.message || "Password Updated Successfully!");
      setShowResetPasswordModal(false);
      setSelectedUserForPassword(null);
      setNewPasswordValue("");
    } catch (err: any) {
      toast.error(err.message || "Failed To Reset Password.");
    }
  };

  // Revoke Admin Clearance Handler
  const handleRevokeClearance = async (user: AdminStaffUser) => {
    if (!confirm(`Are You Sure You Want To Revoke Admin Privileges For '${user.full_name || user.email}'?`)) {
      return;
    }
    try {
      await adminStaffUsersApi.delete(user.id);
      toast.success(`Admin Access Revoked For ${user.full_name || user.email}.`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      adminRolesApi.list().then(setRoles);
    } catch (err: any) {
      toast.error(err.message || "Failed To Revoke Admin Clearance.");
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.admin_role_name?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Station Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#141415] border border-white/10 rounded-none">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Admin Staff Users &amp; Roles Governance
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Configure Granular Section-Level Permissions Across All 18 Admin Portal Stations.
          </p>
        </div>

        {/* Top Action Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-[#1c1d20] border border-white/10">
            <button
              onClick={() => setSubTab("users")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold tracking-wider transition-all",
                subTab === "users"
                  ? "bg-emerald-500 text-black font-bold shadow-sm"
                  : "text-neutral-300 hover:text-white"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Users ({users.length})</span>
            </button>
            <button
              onClick={() => setSubTab("roles")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold tracking-wider transition-all",
                subTab === "roles"
                  ? "bg-emerald-500 text-black font-bold shadow-sm"
                  : "text-neutral-300 hover:text-white"
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Roles &amp; Permissions ({roles.length})</span>
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-white/10 bg-[#1c1d20] text-neutral-300 hover:text-white hover:border-white/20 transition-all"
            title="Refresh Roles And Users"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-emerald-400")} />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: STAFF USERS DIRECTORY */}
      {/* ===================================================================== */}
      {subTab === "users" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-[#141415] border border-white/10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search Administrator By Name, Email, Or Role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#1c1d20] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              onClick={() => setShowCreateUserModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Create Admin User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="border border-white/10 bg-[#141415] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#1a1b1e] text-neutral-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>No Administrative Accounts Match The Filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSuper = u.is_superuser;
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-none bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-xs">
                              {u.full_name?.charAt(0) || u.email?.charAt(0) || "A"}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{u.full_name || "Administrator"}</span>
                                {isSuper && (
                                  <span className="px-1.5 py-0.2 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Superadmin
                                  </span>
                                )}
                              </div>
                              <div className="text-neutral-400 text-[11px] font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-400">
                          {u.phone_number || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          {isSuper ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-[11px]">
                              <Sparkles className="w-3 h-3" />
                              <span>Super Administrator</span>
                            </span>
                          ) : u.admin_role_name ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{toTitleCase(u.admin_role_name)}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-white/10 font-mono text-[11px]">
                              <span>Standard Staff Member</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 font-mono text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              <span>Suspended</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                          {new Date(u.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUserForPassword(u);
                                setNewPasswordValue("");
                                setShowResetPasswordModal(true);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
                              title="Reset Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {!isSuper && (
                              <button
                                onClick={() => handleRevokeClearance(u)}
                                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                title="Revoke Administrative Access"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: ROLES & PERMISSIONS GOVERNANCE MATRIX */}
      {/* ===================================================================== */}
      {subTab === "roles" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Roles Selector Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-[#141415] border border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Defined Roles ({roles.length})
              </span>
              <button
                onClick={() => setShowCreateRoleModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors uppercase tracking-wider"
              >
                <Plus className="w-3 h-3" />
                <span>New Role</span>
              </button>
            </div>

            <div className="space-y-2">
              {roles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => selectRoleForEditing(role)}
                    className={cn(
                      "p-4 border transition-all cursor-pointer relative",
                      isSelected
                        ? "bg-[#1c1d20] border-emerald-500 shadow-sm"
                        : "bg-[#141415] border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{toTitleCase(role.name)}</h4>
                          {role.is_system_role ? (
                            <span className="px-1.5 py-0.2 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              System
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                          {role.description || "No Description Provided."}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-[11px] font-mono text-neutral-400">
                      <span>Users Assigned: {role.users_count ?? 0}</span>
                      {!role.is_system_role && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role.id, role.name);
                          }}
                          className="text-neutral-500 hover:text-red-400 transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix Column */}
          <div className="lg:col-span-8 space-y-4">
            {selectedRole ? (
              <div className="border border-white/10 bg-[#141415] p-5 space-y-5">
                {/* Header for Active Role */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">
                        {toTitleCase(selectedRole.name)} Permissions Matrix
                      </h3>
                      {selectedRole.is_system_role && (
                        <span className="px-2 py-0.5 text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Default System Template
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Toggle Capabilities Per Admin Section. Changes Will Apply Immediately Upon Saving.
                    </p>
                  </div>

                  {/* Bulk Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkMatrixAction("all-view")}
                      className="px-2 py-1 text-[11px] font-mono border border-white/10 bg-[#1c1d20] text-neutral-300 hover:text-white transition-colors"
                    >
                      View All
                    </button>
                    <button
                      onClick={() => handleBulkMatrixAction("full-grant")}
                      className="px-2 py-1 text-[11px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      Grant All
                    </button>
                    <button
                      onClick={() => handleBulkMatrixAction("full-clear")}
                      className="px-2 py-1 text-[11px] font-mono border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Matrix Table */}
                <div className="border border-white/10 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#1a1b1e] text-neutral-400 uppercase tracking-wider font-mono">
                        <th className="py-2.5 px-3">Admin Section</th>
                        <th className="py-2.5 px-3 text-center">View</th>
                        <th className="py-2.5 px-3 text-center">Manage</th>
                        <th className="py-2.5 px-3 text-center">Delete</th>
                        <th className="py-2.5 px-3 text-center">Security</th>
                        <th className="py-2.5 px-3 text-right">Quick Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {ADMIN_STATIONS.map((station) => {
                        const perms = editingPermissions[station.id] || {
                          view: false,
                          manage: false,
                          delete: false,
                          security: false,
                        };
                        const isAllGranted = perms.view && perms.manage && perms.delete && perms.security;

                        return (
                          <tr key={station.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-white">{station.name}</div>
                              <div className="text-[11px] text-neutral-500 font-mono">
                                Station ID: {station.id}
                              </div>
                            </td>

                            {/* View Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(station.id, "view")}
                                className={cn(
                                  "w-6 h-6 inline-flex items-center justify-center border transition-all",
                                  perms.view
                                    ? "bg-emerald-500 border-emerald-400 text-black font-bold"
                                    : "bg-[#1c1d20] border-white/10 text-neutral-600 hover:border-white/30"
                                )}
                              >
                                {perms.view && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                            </td>

                            {/* Manage Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(station.id, "manage")}
                                className={cn(
                                  "w-6 h-6 inline-flex items-center justify-center border transition-all",
                                  perms.manage
                                    ? "bg-blue-500 border-blue-400 text-black font-bold"
                                    : "bg-[#1c1d20] border-white/10 text-neutral-600 hover:border-white/30"
                                )}
                              >
                                {perms.manage && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                            </td>

                            {/* Delete Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(station.id, "delete")}
                                className={cn(
                                  "w-6 h-6 inline-flex items-center justify-center border transition-all",
                                  perms.delete
                                    ? "bg-amber-500 border-amber-400 text-black font-bold"
                                    : "bg-[#1c1d20] border-white/10 text-neutral-600 hover:border-white/30"
                                )}
                              >
                                {perms.delete && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                            </td>

                            {/* Security Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(station.id, "security")}
                                className={cn(
                                  "w-6 h-6 inline-flex items-center justify-center border transition-all",
                                  perms.security
                                    ? "bg-red-500 border-red-400 text-black font-bold"
                                    : "bg-[#1c1d20] border-white/10 text-neutral-600 hover:border-white/30"
                                )}
                              >
                                {perms.security && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                            </td>

                            {/* Row Bulk Toggle */}
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => toggleAllForStation(station.id, !isAllGranted)}
                                className={cn(
                                  "px-2 py-0.5 text-[10px] font-mono border transition-all uppercase",
                                  isAllGranted
                                    ? "border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white"
                                    : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                )}
                              >
                                {isAllGranted ? "Revoke Row" : "Grant Row"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Save Actions */}
                <div className="flex items-center justify-between pt-3">
                  <div className="text-xs text-neutral-400 font-mono">
                    Role ID: <span className="text-white">{selectedRole.id}</span>
                  </div>

                  <button
                    onClick={handleSavePermissions}
                    disabled={isSavingPermissions}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors uppercase tracking-wider"
                  >
                    {isSavingPermissions ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Save Permissions Matrix</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-white/10 bg-[#141415] p-12 text-center text-neutral-500">
                <Sliders className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Select A Role On The Left To Inspect And Adjust Its Permissions Matrix.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATE ADMIN USER */}
      {/* ===================================================================== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#141415] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Create New Administrator</h3>
              </div>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Sharma"
                  value={createUserForm.full_name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
                  className="w-full p-2.5 bg-[#1c1d20] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Work / Administrative Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.sharma@nimsuniversity.org"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  className="w-full p-2.5 bg-[#1c1d20] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 Characters"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  className="w-full p-2.5 bg-[#1c1d20] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Contact Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={createUserForm.phone_number}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, phone_number: e.target.value })}
                  className="w-full p-2.5 bg-[#1c1d20] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Assign Administrative Role
                </label>
                <select
                  value={createUserForm.admin_role_id}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, admin_role_id: e.target.value })}
                  className="w-full p-2.5 bg-[#1c1d20] border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">Standard Staff (No Specific Role)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {toTitleCase(r.name)} {r.is_system_role ? "(System Template)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 border border-white/10 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors uppercase tracking-wider"
                >
                  Create Admin User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATE ROLE */}
      {/* ===================================================================== */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#141415] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Create Custom Role</h3>
              </div>
              <button
                onClick={() => setShowCreateRoleModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Technician Coordinator"
                  value={createRoleForm.name}
                  onChange={(e) => setCreateRoleForm({ ...createRoleForm, name: e.target.value })}
                  className="w-full p-2.5 bg-[#1c1d20] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Role Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain Responsibilities And Departmental Scope..."
                  value={createRoleForm.description}
                  onChange={(e) => setCreateRoleForm({ ...createRoleForm, description: e.target.value })}
                  className="w-full p-2.5 bg-[#1c1d20] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-4 py-2 border border-white/10 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors uppercase tracking-wider"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: RESET PASSWORD */}
      {/* ===================================================================== */}
      {showResetPasswordModal && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#141415] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Reset Admin Password</h3>
              </div>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <p className="text-neutral-400">
                Enter A New Secure Password For{" "}
                <span className="text-white font-semibold">
                  {selectedUserForPassword.full_name || selectedUserForPassword.email}
                </span>
                .
              </p>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 Characters"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full p-2.5 bg-[#1c1d20] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2 border border-white/10 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors uppercase tracking-wider"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
