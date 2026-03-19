"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getAdmins,
  getAdminPermissionCatalog,
  inviteAdmin,
  updateAdminPermissions,
  updateAdminOrg,
  updateAdminRole,
  updateAdminScopes,
  updateAdminStatus
} from "@/api/admin";
import { AdminDetailCard } from "@/components/admin/AdminDetailCard";
import { AdminStatGrid } from "@/components/admin/AdminStatGrid";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import type { AdminAccessStatus, AdminLevel, AdminListItem, AdminPermissionCatalogItem, AdminScope } from "@/types/admin";

const SCOPE_TREE: Array<{
  module: string;
  categories: Array<{ category: string; subcategories: string[] }>;
}> = [
  {
    module: "listings",
    categories: [
      { category: "translation", subcategories: ["visa", "documents", "certificate"] },
      { category: "education", subcategories: ["language", "course"] },
      { category: "construction", subcategories: ["repair", "interior"] }
    ]
  },
  {
    module: "community",
    categories: [
      { category: "posts", subcategories: ["reported", "spam"] },
      { category: "groups", subcategories: ["private", "public"] }
    ]
  }
];

const statusClass = (status: AdminAccessStatus) => {
  if (status === "APPROVED") return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";
  if (status === "SUSPENDED" || status === "REVOKED") return "bg-rose-500/15 text-rose-200 ring-rose-500/30";
  return "bg-amber-500/15 text-amber-200 ring-amber-500/30";
};

const normalizeError = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (message) return message;
  return (error as { message?: string })?.message || "Request failed";
};

export default function AdminManagementPage() {
  const admin = useAdminAccess();
  const [statusFilter, setStatusFilter] = useState<AdminAccessStatus | "ALL">("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [items, setItems] = useState<AdminListItem[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [scopeModalFor, setScopeModalFor] = useState<AdminListItem | null>(null);
  const [scopeDraft, setScopeDraft] = useState<AdminScope[]>([]);
  const [permissionModalFor, setPermissionModalFor] = useState<AdminListItem | null>(null);
  const [permissionDraft, setPermissionDraft] = useState<string[]>([]);
  const [permissionReason, setPermissionReason] = useState("");
  const [permissionCatalog, setPermissionCatalog] = useState<AdminPermissionCatalogItem[]>([]);
  const [permissionCatalogLoading, setPermissionCatalogLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "", department: "", position: "", reason: "" });
  const [reviewModal, setReviewModal] = useState<{ admin: AdminListItem; status: AdminAccessStatus } | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [scopeReason, setScopeReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdmins({
        status: statusFilter,
        department: departmentFilter || undefined,
        limit: 50,
        page: 1
      });
      setItems(res.items);
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, departmentFilter]);

  useEffect(() => {
    if (!items.length) {
      setSelectedAdminId(null);
      return;
    }
    if (!selectedAdminId || !items.some((item) => item.id === selectedAdminId)) {
      setSelectedAdminId(items[0].id);
    }
  }, [items, selectedAdminId]);

  const requireFreshForSensitive = () => {
    if (!admin.mfaEnabled) return true;
    if (admin.requireFreshMode()) return true;
    toast.error("Re-enter admin mode to continue sensitive action.");
    admin.clearMode();
    return false;
  };

  const departments = useMemo(() => {
    const set = new Set(items.map((item) => item.department).filter(Boolean));
    return Array.from(set) as string[];
  }, [items]);
  const canGovernAdmins = admin.isPrimary;

  const selectedAdmin = useMemo(
    () => items.find((item) => item.id === selectedAdminId) || items[0] || null,
    [items, selectedAdminId]
  );

  const stats = useMemo(
    () => [
      { label: "Total admins", value: items.length, helper: "Approved, pending, suspended, revoked" },
      { label: "Pending review", value: items.filter((item) => item.status === "PENDING").length, helper: "Needs primary approval" },
      { label: "Live sessions", value: items.reduce((sum, item) => sum + (item.activeSessionCount || 0), 0), helper: "Active admin sessions" },
      { label: "Admin mode active", value: items.filter((item) => item.adminModeActive).length, helper: "Sensitive actions currently unlocked" }
    ],
    [items]
  );

  const selectedScopePreview = selectedAdmin?.scopes?.length
    ? selectedAdmin.scopes.map((scope) => `${scope.module}/${scope.category || "*"}/${scope.subcategory || "*"}`)
    : [];
  const selectedPermissionPreview = selectedAdmin?.permissionKeys || [];
  const selectedAssignedPermissionPreview = selectedAdmin?.assignedPermissionKeys || [];

  const openPermissionModal = async (item: AdminListItem) => {
    setPermissionModalFor(item);
    setPermissionDraft(item.assignedPermissionKeys || []);
    setPermissionReason("");
    if (permissionCatalog.length || permissionCatalogLoading) return;
    setPermissionCatalogLoading(true);
    try {
      const nextCatalog = await getAdminPermissionCatalog();
      setPermissionCatalog(nextCatalog);
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setPermissionCatalogLoading(false);
    }
  };

  return (
    <AdminPermissionGate permissionsAny={["admins.view", "admins.read", "admins.create", "admins.assign_permissions"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Admin Management</h1>
              <p className="text-sm text-slate-400">Invite, approve/reject, assign role/scope/department/position.</p>
            </div>
            {canGovernAdmins ? (
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400"
              >
                Invite admin
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-[220px,1fr]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdminAccessStatus | "ALL")}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            >
              <option value="ALL">All status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="REVOKED">REVOKED</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">All departments</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
        </section>

        <AdminStatGrid items={stats} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr),380px]">
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            {loading ? (
              <p className="text-sm text-slate-400">Loading admins...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-slate-400">No admins found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-2 py-2">Admin</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2">Level</th>
                      <th className="px-2 py-2">Department / Position</th>
                      <th className="px-2 py-2">Scopes</th>
                      <th className="px-2 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const scopePreview = item.scopes
                        .slice(0, 2)
                        .map((s) => `${s.module}/${s.category || "*"}/${s.subcategory || "*"}`);
                      const isSelected = item.id === selectedAdmin?.id;
                      const levelOptions: AdminLevel[] = item.level === "PRIMARY" ? ["PRIMARY"] : ["MANAGER", "STAFF"];
                      return (
                        <tr
                          key={item.id}
                          className={`border-t border-slate-800/70 ${isSelected ? "bg-sky-500/5" : ""}`}
                        >
                          <td className="px-2 py-3">
                            <button
                              type="button"
                              onClick={() => setSelectedAdminId(item.id)}
                              className="text-left"
                            >
                              <p className="font-medium text-slate-100">{item.name}</p>
                              <p className="text-xs text-slate-400">{item.email}</p>
                            </button>
                          </td>
                          <td className="px-2 py-3">
                            <span className={`inline-flex rounded-full px-2 py-1 text-[11px] ring-1 ${statusClass(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <select
                              value={item.level}
                              disabled={!canGovernAdmins || item.level === "PRIMARY"}
                              onChange={async (event) => {
                                if (!canGovernAdmins || item.level === "PRIMARY") return;
                                if (!requireFreshForSensitive()) return;
                                const level = event.target.value as AdminLevel;
                                const reason = window.prompt("Audit reason for role change")?.trim();
                                if (!reason) return;
                                try {
                                  await updateAdminRole(item.id, { level, department: item.department, reason });
                                  toast.success("Role updated");
                                  void fetchData();
                                } catch (error) {
                                  toast.error(normalizeError(error));
                                }
                              }}
                              className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {levelOptions.map((level) => (
                                <option key={level} value={level}>
                                  {level}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-3">
                            <p className="text-xs text-slate-300">{item.department || "—"}</p>
                            <p className="text-xs text-slate-500">{item.position || "—"}</p>
                            <div className="mt-1 flex gap-1">
                            {canGovernAdmins ? (
                              <button
                                type="button"
                                className="rounded border border-slate-700 px-2 py-0.5 text-[11px] text-slate-200"
                                onClick={async () => {
                                  if (!requireFreshForSensitive()) return;
                                  const department = window.prompt("Department", item.department || "") || "";
                                  const position = window.prompt("Position", item.position || "") || "";
                                  const reason = window.prompt("Audit reason for org update")?.trim();
                                  if (!reason) return;
                                  try {
                                    await updateAdminOrg(item.id, {
                                      department: department.trim(),
                                      position: position.trim(),
                                      reason
                                    });
                                    toast.success("Department/position updated");
                                    void fetchData();
                                  } catch (error) {
                                    toast.error(normalizeError(error));
                                  }
                                }}
                              >
                                Edit
                              </button>
                            ) : null}
                          </div>
                        </td>
                          <td className="px-2 py-3 text-xs text-slate-300">
                            {scopePreview.length ? scopePreview.join(", ") : "No scopes"}
                            {item.scopes.length > 2 ? ` +${item.scopes.length - 2}` : ""}
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex justify-end gap-2">
                              {canGovernAdmins ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAdminId(item.id);
                                      setScopeModalFor(item);
                                      setScopeDraft(item.scopes);
                                      setScopeReason("");
                                    }}
                                    className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800"
                                  >
                                    Scope
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAdminId(item.id);
                                      void openPermissionModal(item);
                                    }}
                                    className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800"
                                  >
                                    Permissions
                                  </button>
                                </>
                              ) : null}
                              {canGovernAdmins && item.status === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAdminId(item.id);
                                      setReviewModal({ admin: item, status: "APPROVED" });
                                      setReviewReason("");
                                    }}
                                    className="rounded border border-emerald-500/40 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/15"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAdminId(item.id);
                                      setReviewModal({ admin: item, status: "REVOKED" });
                                      setReviewReason("");
                                    }}
                                    className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/15"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {canGovernAdmins && item.status === "APPROVED" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAdminId(item.id);
                                      setReviewModal({ admin: item, status: "SUSPENDED" });
                                      setReviewReason("");
                                    }}
                                    className="rounded border border-amber-500/40 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/15"
                                  >
                                    Suspend
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAdminId(item.id);
                                      setReviewModal({ admin: item, status: "REVOKED" });
                                      setReviewReason("");
                                    }}
                                    className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/15"
                                  >
                                    Revoke
                                  </button>
                                </>
                              )}
                              {canGovernAdmins && (item.status === "SUSPENDED" || item.status === "REVOKED") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAdminId(item.id);
                                    setReviewModal({ admin: item, status: "APPROVED" });
                                    setReviewReason("");
                                  }}
                                  className="rounded border border-emerald-500/40 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/15"
                                >
                                  Restore
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <AdminDetailCard
            title={selectedAdmin ? selectedAdmin.name : "Admin detail"}
            subtitle={selectedAdmin ? `${selectedAdmin.email} · ${selectedAdmin.roleBadge || selectedAdmin.level}` : "Select an admin"}
          >
            {selectedAdmin ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Access</p>
                    <p className="mt-2 text-sm text-slate-100">{selectedAdmin.status}</p>
                    <p className="text-xs text-slate-400">{selectedAdmin.level}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">MFA / Sessions</p>
                    <p className="mt-2 text-sm text-slate-100">
                      {selectedAdmin.mfaEnabled ? "MFA enabled" : "MFA not enabled"}
                    </p>
                    <p className="text-xs text-slate-400">{selectedAdmin.activeSessionCount || 0} active sessions</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Governance trail</p>
                  <div className="mt-3 space-y-2 text-slate-300">
                    <p>Created by: {selectedAdmin.createdByName || selectedAdmin.invitedByName || "System / bootstrap"}</p>
                    <p>Approved by: {selectedAdmin.approvedByName || selectedAdmin.approvedBy || "—"}</p>
                    <p>Approved at: {selectedAdmin.approvedAt ? new Date(selectedAdmin.approvedAt).toLocaleString() : "—"}</p>
                    <p>Last activity: {selectedAdmin.lastActivityAt ? new Date(selectedAdmin.lastActivityAt).toLocaleString() : "No session activity"}</p>
                    <p>
                      Admin mode:{" "}
                      {selectedAdmin.adminModeActive && selectedAdmin.adminModeUntil
                        ? `Active until ${new Date(selectedAdmin.adminModeUntil).toLocaleString()}`
                        : "Inactive"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Assignment</p>
                  <div className="mt-3 space-y-2 text-slate-300">
                    <p>Department: {selectedAdmin.department || "—"}</p>
                    <p>Position: {selectedAdmin.position || "—"}</p>
                    <p>Roles: {selectedAdmin.roleNames?.length ? selectedAdmin.roleNames.join(", ") : "—"}</p>
                    <p>Scopes: {selectedScopePreview.length ? `${selectedScopePreview.length} assigned` : "No scopes"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Permissions</p>
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Directly assigned</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedAssignedPermissionPreview.length ? (
                        selectedAssignedPermissionPreview.map((permission) => (
                          <span
                            key={permission}
                            className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-100"
                          >
                            {permission}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">No direct overrides.</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedPermissionPreview.length ? (
                      selectedPermissionPreview.slice(0, 16).map((permission) => (
                        <span
                          key={permission}
                          className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-200"
                        >
                          {permission}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">No explicit permissions resolved.</span>
                    )}
                  </div>
                  {selectedPermissionPreview.length > 16 ? (
                    <p className="mt-2 text-xs text-slate-500">+{selectedPermissionPreview.length - 16} more permissions</p>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">No admin selected.</p>
            )}
          </AdminDetailCard>
        </div>

        {inviteOpen && (
          <div className="fixed inset-0 z-40">
            <button className="absolute inset-0 bg-black/70" onClick={() => setInviteOpen(false)} />
            <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Invite admin</h2>
              <div className="mt-3 space-y-2">
                <input
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                />
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                />
                <input
                  value={inviteForm.department}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="Department"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                />
                <input
                  value={inviteForm.position}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, position: e.target.value }))}
                  placeholder="Position"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                />
                <textarea
                  value={inviteForm.reason}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Audit reason"
                  className="min-h-[88px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={!inviteForm.reason.trim()}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
                  onClick={async () => {
                    if (!requireFreshForSensitive()) return;
                    try {
                      await inviteAdmin(inviteForm);
                      toast.success("Invite sent");
                      setInviteOpen(false);
                      setInviteForm({ email: "", name: "", department: "", position: "", reason: "" });
                      void fetchData();
                    } catch (error) {
                      toast.error(normalizeError(error));
                    }
                  }}
                >
                  Send invite
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100"
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {reviewModal && (
          <div className="fixed inset-0 z-40">
            <button className="absolute inset-0 bg-black/70" onClick={() => setReviewModal(null)} />
            <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h2 className="text-lg font-semibold text-slate-100">{reviewModal.status} admin access</h2>
              <p className="mt-1 text-sm text-slate-400">{reviewModal.admin.name} ({reviewModal.admin.email})</p>
              <textarea
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder="Reason"
                className="mt-3 min-h-[90px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={!reviewReason.trim()}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
                  onClick={async () => {
                    if (!requireFreshForSensitive()) return;
                    try {
                      await updateAdminStatus(reviewModal.admin.id, { status: reviewModal.status, reason: reviewReason.trim() || undefined });
                      toast.success("Status updated");
                      setReviewModal(null);
                      setReviewReason("");
                      void fetchData();
                    } catch (error) {
                      toast.error(normalizeError(error));
                    }
                  }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100"
                  onClick={() => setReviewModal(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {scopeModalFor && (
          <div className="fixed inset-0 z-40">
            <button className="absolute inset-0 bg-black/70" onClick={() => setScopeModalFor(null)} />
            <div className="absolute left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Scope assignment</h2>
              <p className="text-sm text-slate-400">{scopeModalFor.name} ({scopeModalFor.email})</p>

              <div className="mt-3 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                {SCOPE_TREE.map((moduleNode) => (
                  <div key={moduleNode.module} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                    <p className="text-sm font-medium text-slate-100">{moduleNode.module}</p>
                    <div className="mt-2 space-y-2">
                      {moduleNode.categories.map((categoryNode) => (
                        <div key={`${moduleNode.module}-${categoryNode.category}`}>
                          <p className="text-xs text-slate-400">{categoryNode.category}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {categoryNode.subcategories.map((subcategory) => {
                              const value = `${moduleNode.module}|${categoryNode.category}|${subcategory}`;
                              const checked = scopeDraft.some(
                                (scope) =>
                                  scope.module === moduleNode.module &&
                                  scope.category === categoryNode.category &&
                                  scope.subcategory === subcategory
                              );
                              return (
                                <label
                                  key={value}
                                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                      setScopeDraft((prev) => {
                                        if (event.target.checked) {
                                          return [
                                            ...prev,
                                            { module: moduleNode.module, category: categoryNode.category, subcategory }
                                          ];
                                        }
                                        return prev.filter(
                                          (scope) =>
                                            !(
                                              scope.module === moduleNode.module &&
                                              scope.category === categoryNode.category &&
                                              scope.subcategory === subcategory
                                            )
                                        );
                                      });
                                    }}
                                  />
                                  {subcategory}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <textarea
                value={scopeReason}
                onChange={(event) => setScopeReason(event.target.value)}
                placeholder="Audit reason"
                className="mt-3 min-h-[88px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              />

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={!scopeReason.trim()}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
                  onClick={async () => {
                    if (!requireFreshForSensitive()) return;
                    try {
                      await updateAdminScopes(scopeModalFor.id, { scopes: scopeDraft, reason: scopeReason.trim() });
                      toast.success("Scopes updated");
                      setScopeModalFor(null);
                      setScopeReason("");
                      void fetchData();
                    } catch (error) {
                      toast.error(normalizeError(error));
                    }
                  }}
                >
                  Save scopes
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100"
                  onClick={() => setScopeModalFor(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {permissionModalFor && (
          <div className="fixed inset-0 z-40">
            <button className="absolute inset-0 bg-black/70" onClick={() => setPermissionModalFor(null)} />
            <div className="absolute left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Custom permission assignment</h2>
              <p className="text-sm text-slate-400">
                {permissionModalFor.name} ({permissionModalFor.email})
              </p>

              <div className="mt-3 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                {permissionCatalogLoading ? (
                  <p className="text-sm text-slate-400">Loading permission catalog…</p>
                ) : permissionCatalog.length ? (
                  Array.from(new Set(permissionCatalog.map((item) => item.groupLabel))).map((groupLabel) => (
                    <div key={groupLabel} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                      <p className="text-sm font-medium text-slate-100">{groupLabel}</p>
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        {permissionCatalog
                          .filter((item) => item.groupLabel === groupLabel && !item.legacy)
                          .map((item) => {
                            const checked = permissionDraft.includes(item.key);
                            return (
                              <label
                                key={item.key}
                                className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) => {
                                    setPermissionDraft((prev) => {
                                      if (event.target.checked) {
                                        return Array.from(new Set([...prev, item.key]));
                                      }
                                      return prev.filter((entry) => entry !== item.key);
                                    });
                                  }}
                                />
                                <span>
                                  <span className="font-medium text-slate-100">{item.label}</span>
                                  <span className="mt-1 block text-xs text-slate-400">{item.description}</span>
                                </span>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No permission catalog available.</p>
                )}
              </div>

              <textarea
                value={permissionReason}
                onChange={(event) => setPermissionReason(event.target.value)}
                placeholder="Audit reason"
                className="mt-3 min-h-[88px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              />

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={!permissionReason.trim()}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
                  onClick={async () => {
                    if (!requireFreshForSensitive()) return;
                    try {
                      await updateAdminPermissions(permissionModalFor.id, {
                        permissionKeys: permissionDraft,
                        reason: permissionReason.trim()
                      });
                      toast.success("Custom permissions updated");
                      setPermissionModalFor(null);
                      setPermissionReason("");
                      void fetchData();
                    } catch (error) {
                      toast.error(normalizeError(error));
                    }
                  }}
                >
                  Save permissions
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100"
                  onClick={() => setPermissionModalFor(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminPermissionGate>
  );
}
