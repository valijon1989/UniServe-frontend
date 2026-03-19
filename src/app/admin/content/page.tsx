"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getContentItems, saveContentItem } from "@/api/adminEnterprise";
import { AdminAccessDeniedState } from "@/components/admin/AdminAccessDeniedState";
import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminDetailCard } from "@/components/admin/AdminDetailCard";
import { AdminEntityTable } from "@/components/admin/AdminEntityTable";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { AdminSegmentedTabs } from "@/components/admin/AdminSegmentedTabs";
import { AdminStatGrid } from "@/components/admin/AdminStatGrid";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { formatAdminDate, summarizeObject } from "@/lib/adminFormatters";
import type { AdminContentItem } from "@/types/admin";

const emptyForm = {
  id: "",
  key: "",
  title: "",
  kind: "banner",
  status: "DRAFT",
  audience: "",
  priority: 0,
  slot: "",
  placement: "",
  startsAt: "",
  endsAt: "",
  reason: "",
  payloadText: "{\n  \"headline\": \"\",\n  \"ctaLabel\": \"\",\n  \"ctaHref\": \"\"\n}"
};

export default function AdminContentPage() {
  const admin = useAdminAccess();
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getContentItems({
        kind: kindFilter === "all" ? undefined : kindFilter,
        status: statusFilter === "all" ? undefined : statusFilter
      });
      setItems(next);
      setSelectedId((current) => {
        if (current && next.some((item) => item.id === current)) return current;
        return next[0]?.id || null;
      });
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to load content items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [kindFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);
  const canEdit = admin.can("content.manage") && admin.requireFreshMode();

  const selectItem = (item: AdminContentItem) => {
    setSelectedId(item.id);
    setForm({
      id: item.id,
      key: item.key,
      title: item.title,
      kind: item.kind,
      status: item.status,
      audience: item.audience || "",
      priority: item.priority,
      slot: item.slot || "",
      placement: item.placement || "",
      startsAt: item.startsAt ? item.startsAt.slice(0, 16) : "",
      endsAt: item.endsAt ? item.endsAt.slice(0, 16) : "",
      reason: "",
      payloadText: JSON.stringify(item.payload || {}, null, 2)
    });
  };

  const submit = async () => {
    try {
      setSaving(true);
      await saveContentItem({
        id: form.id || undefined,
        key: form.key.trim(),
        title: form.title.trim(),
        kind: form.kind,
        status: form.status,
        audience: form.audience.trim() || undefined,
        priority: Number(form.priority || 0),
        slot: form.slot.trim() || undefined,
        placement: form.placement.trim() || undefined,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
        reason: form.reason.trim(),
        payload: JSON.parse(form.payloadText || "{}")
      });
      toast.success("Content item saved");
      setForm(emptyForm);
      await load();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Failed to save content item");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: items.length,
      published: items.filter((item) => item.status === "PUBLISHED").length,
      banners: items.filter((item) => item.kind === "banner").length,
      scheduled: items.filter((item) => item.startsAt || item.endsAt).length
    }),
    [items]
  );

  return (
    <AdminPermissionGate permissionsAny={["content.view", "content.manage", "content.moderate"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <h1 className="text-xl font-semibold text-slate-100">Content Hub</h1>
              <p className="mt-1 text-sm text-slate-400">
                Manage banners, homepage sections, featured blocks, announcements, and static content with backend-persisted save actions.
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            >
              <option value="all">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </section>

        <AdminSegmentedTabs
          value={kindFilter}
          onChange={setKindFilter}
          items={[
            { id: "all", label: "All", count: stats.total },
            { id: "banner", label: "Banners", count: items.filter((item) => item.kind === "banner").length },
            {
              id: "homepage_section",
              label: "Homepage sections",
              count: items.filter((item) => item.kind === "homepage_section").length
            },
            { id: "featured", label: "Featured", count: items.filter((item) => item.kind === "featured").length },
            {
              id: "announcement",
              label: "Announcements",
              count: items.filter((item) => item.kind === "announcement").length
            },
            { id: "static", label: "Static", count: items.filter((item) => item.kind === "static").length }
          ]}
        />

        <AdminStatGrid
          items={[
            { label: "Total", value: stats.total },
            { label: "Published", value: stats.published },
            { label: "Banners", value: stats.banners },
            { label: "Scheduled", value: stats.scheduled }
          ]}
        />

        <section className="grid gap-4 xl:grid-cols-[1.35fr,0.95fr]">
          <AdminDataState loading={loading} error={error} empty={!items.length}>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-2">
              <AdminEntityTable
                items={items}
                selectedId={selectedId}
                onSelect={(id) => {
                  const item = items.find((entry) => entry.id === id);
                  if (item) selectItem(item);
                }}
                columns={[
                  {
                    key: "title",
                    label: "Content",
                    render: (item) => (
                      <div>
                        <p className="font-medium text-slate-100">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.key}</p>
                      </div>
                    )
                  },
                  {
                    key: "kind",
                    label: "Kind",
                    className: "w-[190px]",
                    render: (item) => (
                      <div className="space-y-2">
                        <AdminStatusBadge value={item.kind} tone="neutral" />
                        <AdminStatusBadge value={item.status} />
                      </div>
                    )
                  },
                  {
                    key: "placement",
                    label: "Placement",
                    className: "w-[190px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>{item.slot || "No slot"}</p>
                        <p className="mt-1 text-slate-500">{item.placement || item.audience || "No placement"}</p>
                      </div>
                    )
                  },
                  {
                    key: "schedule",
                    label: "Schedule",
                    className: "w-[220px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>priority {item.priority}</p>
                        <p className="mt-1 text-slate-500">
                          {item.startsAt || item.endsAt ? `${formatAdminDate(item.startsAt)} → ${formatAdminDate(item.endsAt)}` : "Always on"}
                        </p>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </AdminDataState>

          <AdminDetailCard title={form.id ? "Edit content item" : "Create content item"} subtitle="Structured content entry">
            {selected ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <h3 className="text-sm font-semibold text-slate-100">Current item</h3>
                <p className="mt-2 text-sm text-slate-300">{selected.title}</p>
                <p className="mt-1 text-xs text-slate-500">{summarizeObject(selected.payload)}</p>
              </div>
            ) : null}

            {!canEdit ? (
              <AdminAccessDeniedState
                title="Read-only access"
                description={
                  admin.requireFreshMode()
                    ? "This admin can review content inventory but cannot edit content entries."
                    : "Re-enter admin mode to publish or edit banners, homepage sections, and announcements."
                }
              />
            ) : (
              <div className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={form.key}
                    onChange={(event) => setForm((prev) => ({ ...prev, key: event.target.value }))}
                    placeholder="Key"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Title"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    value={form.kind}
                    onChange={(event) => setForm((prev) => ({ ...prev, kind: event.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="banner">Banner</option>
                    <option value="homepage_section">Homepage section</option>
                    <option value="featured">Featured</option>
                    <option value="announcement">Announcement</option>
                    <option value="static">Static</option>
                  </select>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(event) => setForm((prev) => ({ ...prev, priority: Number(event.target.value || 0) }))}
                    placeholder="Priority"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={form.slot}
                    onChange={(event) => setForm((prev) => ({ ...prev, slot: event.target.value }))}
                    placeholder="Slot"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <input
                    value={form.placement}
                    onChange={(event) => setForm((prev) => ({ ...prev, placement: event.target.value }))}
                    placeholder="Placement"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={form.audience}
                    onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value }))}
                    placeholder="Audience"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(event) => setForm((prev) => ({ ...prev, endsAt: event.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                </div>

                <textarea
                  value={form.reason}
                  onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                  rows={2}
                  placeholder="Audit reason"
                  className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                />

                <textarea
                  value={form.payloadText}
                  onChange={(event) => setForm((prev) => ({ ...prev, payloadText: event.target.value }))}
                  rows={12}
                  className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 font-mono text-sm text-slate-100"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving || !form.reason.trim()}
                    onClick={() => void submit()}
                    className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save content"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(emptyForm)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800"
                  >
                    Reset form
                  </button>
                </div>
              </div>
            )}
          </AdminDetailCard>
        </section>
      </div>
    </AdminPermissionGate>
  );
}
