"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAdminSettings, saveAdminSettings } from "@/api/adminEnterprise";
import { AdminAccessDeniedState } from "@/components/admin/AdminAccessDeniedState";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { AdminStatGrid } from "@/components/admin/AdminStatGrid";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import type { AdminSystemSettings } from "@/types/admin";

const defaultSettings: AdminSystemSettings = {
  security: {
    requireMfaForAdmins: true,
    revokeSessionsOnAccessChange: true,
    adminModeTtlMinutes: 15,
    sessionIdleTimeoutMinutes: 60
  },
  moderation: {
    flagThreshold: 3,
    autoEscalateRepeatedOffender: true,
    maxWarningsBeforeSuspend: 3,
    agentComplaintSuspendThreshold: 5
  },
  notifications: {
    queueDigestEnabled: true,
    urgentAlertsEmail: true,
    paymentFailureAlerts: true,
    suspensionAlertsEnabled: true
  },
  features: {
    communityEnabled: true,
    escrowEnabled: true,
    bookingsEnabled: true,
    dynamicPricingEnabled: false
  },
  platform: {
    supportInboxEmail: "",
    defaultCurrency: "USD",
    defaultLocale: "en",
    allowNewRegistrations: true,
    maintenanceMode: false
  },
  content: {
    homepageAutoRotate: false,
    defaultFeaturedDurationDays: 14,
    announcementsRequireApproval: true
  }
};

const mergeSettings = (incoming?: AdminSystemSettings): AdminSystemSettings => ({
  ...defaultSettings,
  ...incoming,
  security: { ...defaultSettings.security, ...incoming?.security },
  moderation: { ...defaultSettings.moderation, ...incoming?.moderation },
  notifications: { ...defaultSettings.notifications, ...incoming?.notifications },
  features: { ...defaultSettings.features, ...incoming?.features },
  platform: { ...defaultSettings.platform, ...incoming?.platform },
  content: { ...defaultSettings.content, ...incoming?.content }
});

export default function AdminSettingsPage() {
  const admin = useAdminAccess();
  const [settings, setSettings] = useState<AdminSystemSettings>(defaultSettings);
  const [loadedSettings, setLoadedSettings] = useState<AdminSystemSettings>(defaultSettings);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminSettings()
      .then((next) => {
        if (!active) return;
        const merged = mergeSettings(next);
        setSettings(merged);
        setLoadedSettings(merged);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error((err as { message?: string })?.message || "Failed to load settings");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const canUpdate = admin.requireFreshMode() && admin.canAny(["settings.manage", "settings.update", "technical.manage"]);
  const canManageSensitive = admin.requireFreshMode() && admin.isPrimary;

  const updateSection = <K extends keyof AdminSystemSettings, F extends keyof NonNullable<AdminSystemSettings[K]>>(
    section: K,
    field: F,
    value: NonNullable<AdminSystemSettings[K]>[F]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...((typeof prev[section] === "object" && prev[section] !== null ? prev[section] : {}) as Record<string, unknown>),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveAdminSettings({
        ...(canManageSensitive
          ? {
              platform: settings.platform,
              security: settings.security,
              moderation: settings.moderation
            }
          : {}),
        ...(canUpdate
          ? {
              notifications: settings.notifications,
              features: settings.features,
              content: settings.content
            }
          : {}),
        reason: reason.trim()
      });
      toast.success("Settings saved");
      setLoadedSettings(settings);
      setReason("");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPermissionGate permissionsAny={["settings.manage", "settings.update", "technical.manage"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <h1 className="text-xl font-semibold text-slate-100">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Backend-persisted platform config, moderation thresholds, feature toggles, content automation, and notification routing.
          </p>
        </section>

        <AdminStatGrid
          items={[
            { label: "Security", value: canManageSensitive ? "Full access" : "Restricted" },
            { label: "General Save", value: canUpdate ? "Enabled" : "Read-only" },
            { label: "Primary Admin", value: admin.isPrimary ? "Yes" : "No" },
            { label: "Admin Mode", value: admin.requireFreshMode() ? "Active" : "Expired" }
          ]}
        />

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">Loading…</div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Platform Config</h2>
              <div className="mt-4 grid gap-3">
                <input
                  value={String(settings.platform?.supportInboxEmail || settings.platform?.supportEmail || "")}
                  onChange={(event) => updateSection("platform", "supportInboxEmail", event.target.value)}
                  placeholder="Support inbox email"
                  disabled={!canUpdate}
                  className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={String(settings.platform?.defaultCurrency || "USD")}
                    onChange={(event) => updateSection("platform", "defaultCurrency", event.target.value)}
                    placeholder="Default currency"
                    disabled={!canUpdate}
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
                  />
                  <input
                    value={String(settings.platform?.defaultLocale || settings.platform?.locale || "en")}
                    onChange={(event) => updateSection("platform", "defaultLocale", event.target.value)}
                    placeholder="Default locale"
                    disabled={!canUpdate}
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
                  />
                </div>
                <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
                  <span>Allow new registrations</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.platform?.allowNewRegistrations)}
                    onChange={(event) => updateSection("platform", "allowNewRegistrations", event.target.checked)}
                    disabled={!canUpdate}
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
                  <span>Maintenance mode</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.platform?.maintenanceMode)}
                    onChange={(event) => updateSection("platform", "maintenanceMode", event.target.checked)}
                    disabled={!canUpdate}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Moderation Thresholds</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  type="number"
                  value={Number(settings.moderation?.flagThreshold || 0)}
                  onChange={(event) => updateSection("moderation", "flagThreshold", Number(event.target.value || 0))}
                  disabled={!canUpdate}
                  className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
                />
                <input
                  type="number"
                  value={Number(settings.moderation?.maxWarningsBeforeSuspend || 0)}
                  onChange={(event) =>
                    updateSection("moderation", "maxWarningsBeforeSuspend", Number(event.target.value || 0))
                  }
                  disabled={!canUpdate}
                  className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
                />
                <input
                  type="number"
                  value={Number(settings.moderation?.agentComplaintSuspendThreshold || 0)}
                  onChange={(event) =>
                    updateSection("moderation", "agentComplaintSuspendThreshold", Number(event.target.value || 0))
                  }
                  disabled={!canUpdate}
                  className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
                />
                <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 md:col-span-2">
                  <span>Auto-escalate repeated offenders</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.moderation?.autoEscalateRepeatedOffender)}
                    onChange={(event) =>
                      updateSection("moderation", "autoEscalateRepeatedOffender", event.target.checked)
                    }
                    disabled={!canUpdate}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Feature Toggles</h2>
              <div className="mt-4 space-y-3">
                {[
                  ["communityEnabled", "Community enabled"],
                  ["escrowEnabled", "Escrow enabled"],
                  ["bookingsEnabled", "Bookings enabled"],
                  ["dynamicPricingEnabled", "Dynamic pricing enabled"]
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                  >
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings.features?.[key])}
                      onChange={(event) => updateSection("features", key as any, event.target.checked)}
                      disabled={!canUpdate}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Notification Config</h2>
              <div className="mt-4 grid gap-3">
                {[
                  ["urgentAlertsEmail", "Urgent alerts email"],
                  ["queueDigestEnabled", "Queue digest notifications"],
                  ["paymentFailureAlerts", "Payment failure alerts"],
                  ["suspensionAlertsEnabled", "Suspension alerts"]
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                  >
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings.notifications?.[key])}
                      onChange={(event) => updateSection("notifications", key as any, event.target.checked)}
                      disabled={!canUpdate}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Security Controls</h2>
              {canManageSensitive ? (
                <div className="mt-4 space-y-3">
                  {[
                    ["requireMfaForAdmins", "Require MFA for all admins"],
                    ["revokeSessionsOnAccessChange", "Revoke sessions on access change"]
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                    >
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(settings.security?.[key])}
                        onChange={(event) => updateSection("security", key as any, event.target.checked)}
                      />
                    </label>
                  ))}
                  <input
                    type="number"
                    value={Number(settings.security?.adminModeTtlMinutes || 0)}
                    onChange={(event) => updateSection("security", "adminModeTtlMinutes", Number(event.target.value || 0))}
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <input
                    type="number"
                    value={Number(settings.security?.sessionIdleTimeoutMinutes || 0)}
                    onChange={(event) =>
                      updateSection("security", "sessionIdleTimeoutMinutes", Number(event.target.value || 0))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              ) : (
                <AdminAccessDeniedState
                  title="Primary admin control"
                  description="Security policy settings are visible here but only the primary admin can change them."
                />
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Content Automation</h2>
              {canUpdate ? (
                <div className="mt-4 space-y-3">
                  <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
                    <span>Homepage auto rotate</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings.content?.homepageAutoRotate)}
                      onChange={(event) => updateSection("content", "homepageAutoRotate", event.target.checked)}
                    />
                  </label>
                  <input
                    type="number"
                    value={Number(settings.content?.defaultFeaturedDurationDays || 0)}
                    onChange={(event) =>
                      updateSection("content", "defaultFeaturedDurationDays", Number(event.target.value || 0))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
                    <span>Announcements require approval</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings.content?.announcementsRequireApproval)}
                      onChange={(event) =>
                        updateSection("content", "announcementsRequireApproval", event.target.checked)
                      }
                    />
                  </label>
                </div>
              ) : (
                <AdminAccessDeniedState
                  title="Restricted content automation"
                  description="Re-enter admin mode to change homepage rotation and featured-content automation."
                />
              )}
            </section>
          </div>
        )}

        {!canUpdate ? (
          <AdminAccessDeniedState
            title="Read-only access"
            description={
              admin.requireFreshMode()
                ? "This admin can review settings but cannot persist changes."
                : "Re-enter admin mode to save settings changes."
            }
          />
        ) : (
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
              placeholder="Audit reason for settings change"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving || !reason.trim()}
                onClick={() => void handleSave()}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save settings"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSettings(loadedSettings);
                  setReason("");
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800"
              >
                Reset changes
              </button>
            </div>
          </section>
        )}
      </div>
    </AdminPermissionGate>
  );
}
