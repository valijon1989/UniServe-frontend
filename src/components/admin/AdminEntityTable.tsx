"use client";

import type { ReactNode } from "react";

interface AdminEntityTableColumn<T> {
  key: string;
  label: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface Props<T extends { id: string }> {
  items: T[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  columns: AdminEntityTableColumn<T>[];
  emptyLabel?: string;
  minWidthClassName?: string;
}

export function AdminEntityTable<T extends { id: string }>({
  items,
  selectedId,
  onSelect,
  columns,
  emptyLabel = "No records found.",
  minWidthClassName = "min-w-[920px]"
}: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${minWidthClassName}`}>
        <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-3 py-3 font-medium ${column.className || ""}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((item) => {
              const active = item.id === selectedId;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`cursor-pointer border-t border-slate-800/70 transition ${
                    active ? "bg-sky-500/10" : "hover:bg-slate-900/60"
                  }`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={`px-3 py-3 align-top ${column.className || ""}`}>
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-slate-400">
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
