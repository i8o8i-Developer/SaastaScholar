import React, { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  Users,
  Plus,
  Search,
  Key,
  Trash2,
  Check,
  X,
  RefreshCw,
  Sliders,
  Sparkles,
  CheckCircle2,
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
    id: "roles",
    name: "Admin Staff Users & Roles Governance",
    description: "Administrative Accounts, Security Clearance, And Access Matrix",
    category: "System",
  },
];

type ActionType = "view" | "manage" | "delete" | "security";

export function AdminUsersRolesTab() {
  const [subTab, setSubTab] = useState<"roles" | "users">("roles");
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
      toast.error(err.message || "Failed To Load Roles And Staff Users.");
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
        phone_number: createUserForm.phone_number.trim() || undefined,
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
    <div className="space-y-6">
      {/* Top Header & Navigation Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
            Admin Staff Users &amp; Roles Governance
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure Granular Section-Level Permissions Across All 17 Admin Portal Stations.
          </p>
        </div>

        {/* Tab Controls & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center p-1 rounded-xl bg-card border border-border shadow-2xs">
            <button
              type="button"
              onClick={() => setSubTab("roles")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                subTab === "roles"
                  ? "bg-primary text-zinc-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Roles &amp; Permissions ({roles.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab("users")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                subTab === "users"
                  ? "bg-primary text-zinc-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Users ({users.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="h-9 px-3 rounded-xl border border-border bg-card hover:bg-surface text-foreground font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            title="Refresh Roles And Staff Directory"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin text-emerald-400")} />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: ROLES & PERMISSIONS GOVERNANCE MATRIX */}
      {/* ===================================================================== */}
      {subTab === "roles" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Roles Selector Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card/80">
              <span className="text-xs font-bold font-display text-foreground">
                Defined Roles ({roles.length})
              </span>
              <button
                type="button"
                onClick={() => setShowCreateRoleModal(true)}
                className="h-8 px-3 rounded-xl bg-primary hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Role</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {roles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => selectRoleForEditing(role)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative",
                      isSelected
                        ? "bg-card border-primary/70 shadow-lg shadow-emerald-950/20 ring-1 ring-primary/30"
                        : "bg-card/65 border-border/70 hover:border-border hover:bg-card/90"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-sm text-foreground">
                            {toTitleCase(role.name)}
                          </h4>
                          {role.is_system_role ? (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              System
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {role.description || "Administrative Role Clearance."}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 mt-1 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                      <span>Users Assigned: <strong className="text-foreground">{role.users_count ?? 0}</strong></span>
                      {!role.is_system_role && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role.id, role.name);
                          }}
                          className="text-muted-foreground hover:text-rose-400 transition-colors p-1"
                          title="Delete Custom Role"
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
          <div className="lg:col-span-8">
            {selectedRole ? (
              <div className="rounded-2xl border border-border/80 bg-card/75 p-5 space-y-5 backdrop-blur-xs shadow-xs">
                {/* Header for Active Role */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                        {toTitleCase(selectedRole.name)} Permissions Matrix
                      </h3>
                      {selectedRole.is_system_role && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Default System Template
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Toggle Capabilities Per Admin Section. Changes Will Apply Immediately Upon Saving.
                    </p>
                  </div>

                  {/* Bulk Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkMatrixAction("all-view")}
                      className="h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface/80 text-foreground font-semibold text-xs flex items-center transition-all cursor-pointer shadow-2xs"
                    >
                      View All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkMatrixAction("full-grant")}
                      className="h-8 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs flex items-center transition-all cursor-pointer"
                    >
                      Grant All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkMatrixAction("full-clear")}
                      className="h-8 px-3 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center transition-all cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Matrix Table */}
                <div className="rounded-xl border border-border/80 overflow-hidden bg-card/40">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-surface/60 text-muted-foreground font-semibold text-xs">
                          <th className="py-3 px-3.5">Admin Section</th>
                          <th className="py-3 px-3 text-center">View</th>
                          <th className="py-3 px-3 text-center">Manage</th>
                          <th className="py-3 px-3 text-center">Delete</th>
                          <th className="py-3 px-3 text-center">Security</th>
                          <th className="py-3 px-3 text-right">Quick Toggle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {ADMIN_STATIONS.map((station) => {
                          const perms = editingPermissions[station.id] || {
                            view: false,
                            manage: false,
                            delete: false,
                            security: false,
                          };
                          const isAllGranted = perms.view && perms.manage && perms.delete && perms.security;

                          return (
                            <tr key={station.id} className="hover:bg-surface/30 transition-colors">
                              <td className="py-2.5 px-3.5">
                                <div className="font-semibold text-foreground text-xs">{station.name}</div>
                                <div className="inline-block px-1.5 py-0.2 rounded text-[10px] font-mono text-muted-foreground bg-surface/80 border border-border/50 mt-0.5">
                                  Station ID: {station.id}
                                </div>
                              </td>

                              {/* View Checkbox */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => togglePermission(station.id, "view")}
                                  className={cn(
                                    "w-7 h-7 rounded-lg inline-flex items-center justify-center border transition-all cursor-pointer",
                                    perms.view
                                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/20"
                                      : "bg-surface/40 border-border text-muted-foreground/30 hover:border-border/80 hover:text-muted-foreground"
                                  )}
                                  title="Toggle View Permission"
                                >
                                  {perms.view && <Check className="w-4 h-4 stroke-[2.5]" />}
                                </button>
                              </td>

                              {/* Manage Checkbox */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => togglePermission(station.id, "manage")}
                                  className={cn(
                                    "w-7 h-7 rounded-lg inline-flex items-center justify-center border transition-all cursor-pointer",
                                    perms.manage
                                      ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-sm shadow-blue-500/20"
                                      : "bg-surface/40 border-border text-muted-foreground/30 hover:border-border/80 hover:text-muted-foreground"
                                  )}
                                  title="Toggle Manage Permission"
                                >
                                  {perms.manage && <Check className="w-4 h-4 stroke-[2.5]" />}
                                </button>
                              </td>

                              {/* Delete Checkbox */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => togglePermission(station.id, "delete")}
                                  className={cn(
                                    "w-7 h-7 rounded-lg inline-flex items-center justify-center border transition-all cursor-pointer",
                                    perms.delete
                                      ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/20"
                                      : "bg-surface/40 border-border text-muted-foreground/30 hover:border-border/80 hover:text-muted-foreground"
                                  )}
                                  title="Toggle Delete Permission"
                                >
                                  {perms.delete && <Check className="w-4 h-4 stroke-[2.5]" />}
                                </button>
                              </td>

                              {/* Security Checkbox */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => togglePermission(station.id, "security")}
                                  className={cn(
                                    "w-7 h-7 rounded-lg inline-flex items-center justify-center border transition-all cursor-pointer",
                                    perms.security
                                      ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-sm shadow-rose-500/20"
                                      : "bg-surface/40 border-border text-muted-foreground/30 hover:border-border/80 hover:text-muted-foreground"
                                  )}
                                  title="Toggle Security Clearance"
                                >
                                  {perms.security && <Check className="w-4 h-4 stroke-[2.5]" />}
                                </button>
                              </td>

                              {/* Row Quick Toggle */}
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => toggleAllForStation(station.id, !isAllGranted)}
                                  className={cn(
                                    "h-7 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                                    isAllGranted
                                      ? "border-border bg-surface/60 text-muted-foreground hover:text-foreground"
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
                </div>

                {/* Footer Save Action */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-muted-foreground">
                    Role Identifier: <span className="font-mono text-foreground font-semibold">{selectedRole.id}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={isSavingPermissions}
                    className="h-9 px-5 rounded-xl bg-primary hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSavingPermissions ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Save Permissions Matrix</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center space-y-3">
                <Sliders className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <h4 className="font-display font-bold text-base text-foreground">No Role Selected</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Select A Role On The Left To Inspect And Adjust Its Granular Permissions Matrix.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: STAFF USERS DIRECTORY */}
      {/* ===================================================================== */}
      {subTab === "users" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card/80">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Administrator By Name, Email, Or Role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-surface/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowCreateUserModal(true)}
              className="h-9 px-4 rounded-xl bg-primary hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Admin User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-border/80 bg-card/75 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/60 text-muted-foreground font-semibold text-xs">
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Contact Number</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>No Administrative Accounts Match The Filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSuper = u.is_superuser;
                      return (
                        <tr key={u.id} className="hover:bg-surface/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold font-display text-xs">
                                {u.full_name?.charAt(0) || u.email?.charAt(0) || "A"}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  <span>{u.full_name || "Administrator"}</span>
                                  {isSuper && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                      Superadmin
                                    </span>
                                  )}
                                </div>
                                <div className="text-muted-foreground text-[11px] font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-muted-foreground">
                            {u.phone_number || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            {isSuper ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold text-xs">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Super Administrator</span>
                              </span>
                            ) : u.admin_role_name ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-xs">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{toTitleCase(u.admin_role_name)}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface text-muted-foreground border border-border font-semibold text-xs">
                                <span>Standard Staff Member</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.is_active ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-muted-foreground text-xs">
                            {new Date(u.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForPassword(u);
                                  setNewPasswordValue("");
                                  setShowResetPasswordModal(true);
                                }}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
                                title="Reset Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {!isSuper && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeClearance(u)}
                                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
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
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATE ADMIN USER */}
      {/* ===================================================================== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-foreground text-base">Create New Administrator</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateUserModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1 text-xs">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Sharma"
                  value={createUserForm.full_name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface/60 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1 text-xs">
                  Administrative Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.sharma@nimsuniversity.org"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface/60 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1 text-xs">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 Characters"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface/60 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1 text-xs">
                  Contact Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={createUserForm.phone_number}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, phone_number: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface/60 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1 text-xs">
                  Assign Administrative Role
                </label>
                <select
                  value={createUserForm.admin_role_id}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, admin_role_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface/60 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">Standard Staff (No Specific Role)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {toTitleCase(r.name)} {r.is_system_role ? "(System Template)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-surface text-foreground font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-primary hover:bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer shadow-sm transition-all active:scale-95"
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
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-foreground text-base">Create Custom Role</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateRoleModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1 text-xs">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Technician Coordinator"
                  value={createRoleForm.name}
                  onChange={(e) => setCreateRoleForm({ ...createRoleForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface/60 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1 text-xs">
                  Role Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain Responsibilities And Departmental Scope..."
                  value={createRoleForm.description}
                  onChange={(e) => setCreateRoleForm({ ...createRoleForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border bg-surface/60 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-surface text-foreground font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-primary hover:bg-emerald-500 text-zinc-950 font-bold text-xs cursor-pointer shadow-sm transition-all active:scale-95"
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
          <div className="w-full max-w-sm rounded-3xl border border-border/80 bg-card p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-foreground text-base">Reset Admin Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetPasswordModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <p className="text-muted-foreground">
                Enter A New Secure Password For{" "}
                <span className="text-foreground font-semibold">
                  {selectedUserForPassword.full_name || selectedUserForPassword.email}
                </span>
                .
              </p>

              <div>
                <label className="block text-foreground font-semibold mb-1 text-xs">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 Characters"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface/60 text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-surface text-foreground font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer shadow-sm transition-all active:scale-95"
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
