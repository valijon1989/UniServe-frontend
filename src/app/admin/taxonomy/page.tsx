"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getTaxonomyNodes, saveTaxonomyNode } from "@/api/adminEnterprise";
import { AdminAccessDeniedState } from "@/components/admin/AdminAccessDeniedState";
import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminDetailCard } from "@/components/admin/AdminDetailCard";
import { AdminEntityTable } from "@/components/admin/AdminEntityTable";
import { AdminKeyValueList } from "@/components/admin/AdminKeyValueList";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { AdminSegmentedTabs } from "@/components/admin/AdminSegmentedTabs";
import { AdminStatGrid } from "@/components/admin/AdminStatGrid";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { formatAdminDate, summarizeObject } from "@/lib/adminFormatters";
import type { TaxonomyNodeItem } from "@/types/admin";

const emptyForm = {
  id: "",
  module: "products",
  kind: "category",
  key: "",
  label: "",
  slug: "",
  parentId: "",
  status: "ACTIVE",
  sortOrder: 0,
  reason: "",
  metadataText: "{\n  \"description\": \"\",\n  \"filters\": []\n}"
};

export default function AdminTaxonomyPage() {
  const admin = useAdminAccess();
  const [items, setItems] = useState<TaxonomyNodeItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getTaxonomyNodes({
        module: moduleFilter === "all" ? undefined : moduleFilter,
        kind: kindFilter === "all" ? undefined : kindFilter
      });
      setItems(next);
      setSelectedId((current) => {
        if (current && next.some((item) => item.id === current)) return current;
        return next[0]?.id || null;
      });
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to load taxonomy nodes");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [kindFilter, moduleFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);
  const canEdit = admin.can("taxonomy.manage") && admin.requireFreshMode();

  const selectItem = (item: TaxonomyNodeItem) => {
    setSelectedId(item.id);
    setForm({
      id: item.id,
      module: item.module,
      kind: item.kind,
      key: item.key,
      label: item.label,
      slug: item.slug || "",
      parentId: item.parentId || "",
      status: item.status,
      sortOrder: item.sortOrder,
      reason: "",
      metadataText: JSON.stringify(item.metadata || {}, null, 2)
    });
  };

  const submit = async () => {
    try {
      setSaving(true);
      await saveTaxonomyNode({
        id: form.id || undefined,
        module: form.module.trim(),
        kind: form.kind.trim(),
        key: form.key.trim(),
        label: form.label.trim(),
        slug: form.slug.trim() || undefined,
        parentId: form.parentId.trim() || null,
        status: form.status,
        sortOrder: Number(form.sortOrder || 0),
        reason: form.reason.trim(),
        metadata: JSON.parse(form.metadataText || "{}")
      });
      toast.success("Taxonomy node saved");
      setForm(emptyForm);
      await load();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Failed to save taxonomy node");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: items.length,
      categories: items.filter((item) => item.kind === "category").length,
      tags: items.filter((item) => item.kind === "tag").length,
      attributes: items.filter((item) => item.kind === "attribute").length
    }),
    [items]
  );

  return (
    <AdminPermissionGate permissionsAny={["taxonomy.view", "taxonomy.manage"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <h1 className="text-xl font-semibold text-slate-100">Taxonomy</h1>
              <p className="mt-1 text-sm text-slate-400">
                Categories, subcategories, tags, filters, and product/service attribute templates with backend-persisted save flow.
              </p>
            </div>
            <select
              value={kindFilter}
              onChange={(event) => setKindFilter(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            >
              <option value="all">All kinds</option>
              <option value="category">Category</option>
              <option value="subcategory">Subcategory</option>
              <option value="tag">Tag</option>
              <option value="filter">Filter</option>
              <option value="attribute">Attribute</option>
            </select>
          </div>
        </section>

        <AdminSegmentedTabs
          value={moduleFilter}
          onChange={setModuleFilter}
          items={[
            { id: "all", label: "All", count: stats.total },
            { id: "products", label: "Products", count: items.filter((item) => item.module === "products").length },
            { id: "services", label: "Services", count: items.filter((item) => item.module === "services").length },
            { id: "community", label: "Community", count: items.filter((item) => item.module === "community").length }
          ]}
        />

        <AdminStatGrid
          items={[
            { label: "Total", value: stats.total },
            { label: "Categories", value: stats.categories },
            { label: "Tags", value: stats.tags },
            { label: "Attributes", value: stats.attributes }
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
                    key: "node",
                    label: "Node",
                    render: (item) => (
                      <div>
                        <p className="font-medium text-slate-100">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.key}</p>
                      </div>
                    )
                  },
                  {
                    key: "type",
                    label: "Module / Kind",
                    className: "w-[200px]",
                    render: (item) => (
                      <div className="space-y-2">
                        <AdminStatusBadge value={item.module} tone="neutral" />
                        <AdminStatusBadge value={item.kind} tone="neutral" />
                      </div>
                    )
                  },
                  {
                    key: "parent",
                    label: "Parent / Children",
                    className: "w-[220px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>{item.parentLabel || "Root node"}</p>
                        <p className="mt-1 text-slate-500">children {item.childCount || 0}</p>
                      </div>
                    )
                  },
                  {
                    key: "meta",
                    label: "Metadata",
                    className: "w-[220px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>{(item.metadataKeys || Object.keys(item.metadata || {})).slice(0, 3).join(", ") || "No metadata"}</p>
                        <p className="mt-1 text-slate-500">{formatAdminDate(item.updatedAt)}</p>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </AdminDataState>

          <AdminDetailCard title={form.id ? "Edit taxonomy node" : "Create taxonomy node"} subtitle="Operational category structure">
            {selected ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <h3 className="text-sm font-semibold text-slate-100">Current node</h3>
                <AdminKeyValueList
                  items={[
                    { label: "Module", value: selected.module },
                    { label: "Kind", value: selected.kind },
                    { label: "Parent", value: selected.parentLabel || "Root node" },
                    { label: "Children", value: selected.childCount || 0 },
                    { label: "Updated", value: formatAdminDate(selected.updatedAt) }
                  ]}
                />
                <p className="mt-3 text-xs text-slate-500">{summarizeObject(selected.metadata, 4)}</p>
              </div>
            ) : null}

            {!canEdit ? (
              <AdminAccessDeniedState
                title="Read-only access"
                description={
                  admin.requireFreshMode()
                    ? "This admin can inspect taxonomy structure but cannot change it."
                    : "Re-enter admin mode to add categories, tags, filters, or attribute templates."
                }
              />
            ) : (
              <div className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={form.module}
                    onChange={(event) => setForm((prev) => ({ ...prev, module: event.target.value }))}
                    placeholder="Module"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <select
                    value={form.kind}
                    onChange={(event) => setForm((prev) => ({ ...prev, kind: event.target.value }))}
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="category">Category</option>
                    <option value="subcategory">Subcategory</option>
                    <option value="tag">Tag</option>
                    <option value="filter">Filter</option>
                    <option value="attribute">Attribute</option>
                  </select>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={form.key}
                    onChange={(event) => setForm((prev) => ({ ...prev, key: event.target.value }))}
                    placeholder="Key"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <input
                    value={form.label}
                    onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                    placeholder="Label"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={form.slug}
                    onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                    placeholder="Slug"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <input
                    value={form.parentId}
                    onChange={(event) => setForm((prev) => ({ ...prev, parentId: event.target.value }))}
                    placeholder="Parent ID"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value || 0) }))}
                    placeholder="Sort order"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                  />
                </div>

                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="HIDDEN">Hidden</option>
                </select>

                <textarea
                  value={form.reason}
                  onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                  rows={2}
                  placeholder="Audit reason"
                  className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                />

                <textarea
                  value={form.metadataText}
                  onChange={(event) => setForm((prev) => ({ ...prev, metadataText: event.target.value }))}
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
                    {saving ? "Saving…" : "Save node"}
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
