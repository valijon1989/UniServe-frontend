"use client";

import type { KeyboardEventHandler, MouseEventHandler, ReactNode } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

type ChipTone = "emerald" | "sky" | "amber" | "rose" | "slate";

type CardChip = {
  label: string;
  tone?: ChipTone;
};

type CardAction = {
  key?: string;
  label?: string;
  srLabel?: string;
  badge?: string;
  icon?: ReactNode;
  tone?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

type PreviewImage = {
  src: string;
  alt: string;
};

type VerticalServiceCardProps = {
  title: string;
  description: string;
  priceLabel: string;
  unitLabel?: string;
  agentName: string;
  agentHandle?: string;
  agentHref?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  avatarFallback: string;
  identityMeta?: string[];
  descriptor?: string;
  topChips?: CardChip[];
  metaChips?: CardChip[];
  trustChips?: CardChip[];
  stats?: CardChip[];
  previewImages?: PreviewImage[];
  previewSlot?: ReactNode;
  footerSlot?: ReactNode;
  actions?: CardAction[];
  onOpen?: MouseEventHandler<HTMLDivElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
};

const chipToneClasses: Record<ChipTone, string> = {
  emerald: "bg-emerald-500/16 text-emerald-100 ring-1 ring-emerald-500/25",
  sky: "bg-sky-500/16 text-sky-100 ring-1 ring-sky-500/25",
  amber: "bg-amber-500/16 text-amber-100 ring-1 ring-amber-500/25",
  rose: "bg-rose-500/16 text-rose-100 ring-1 ring-rose-500/25",
  slate: "bg-slate-900/85 text-slate-300 ring-1 ring-slate-800"
};

const actionToneClasses = {
  primary: "bg-emerald-400/90 text-slate-950 hover:bg-emerald-300",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  ghost: "border border-slate-700 bg-transparent text-slate-300 hover:border-slate-500 hover:text-white"
};

export function VerticalServiceCard({
  title,
  description,
  priceLabel,
  unitLabel,
  agentName,
  agentHandle,
  agentHref,
  avatarSrc,
  avatarAlt,
  avatarFallback,
  identityMeta,
  descriptor,
  topChips,
  metaChips,
  trustChips,
  stats,
  previewImages,
  previewSlot,
  footerSlot,
  actions,
  onOpen,
  onKeyDown
}: VerticalServiceCardProps) {
  const cardBody = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {agentHref ? (
            <Link
              href={agentHref}
              onClick={(event) => event.stopPropagation()}
              className="flex items-center gap-3"
            >
              <Avatar
                src={avatarSrc}
                alt={avatarAlt || agentName}
                fallbackText={avatarFallback}
                size={42}
                className="border border-slate-700/80"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{agentName}</p>
                {agentHandle ? <p className="truncate text-[11px] text-slate-500">@{agentHandle}</p> : null}
                {identityMeta?.length ? (
                  <p className="truncate text-[11px] text-slate-500">{identityMeta.join(" · ")}</p>
                ) : null}
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar
                src={avatarSrc}
                alt={avatarAlt || agentName}
                fallbackText={avatarFallback}
                size={42}
                className="border border-slate-700/80"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">{agentName}</p>
                {agentHandle ? <p className="truncate text-[11px] text-slate-500">@{agentHandle}</p> : null}
                {identityMeta?.length ? (
                  <p className="truncate text-[11px] text-slate-500">{identityMeta.join(" · ")}</p>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {topChips?.length ? (
          <div className="flex flex-wrap justify-end gap-2">
            {topChips.map((chip) => (
              <span
                key={`${chip.label}-${chip.tone || "slate"}`}
                className={`rounded-full px-3 py-1 text-[11px] ${chipToneClasses[chip.tone || "slate"]}`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-lg font-semibold text-white">{title}</h3>
          {descriptor ? <p className="mt-1 text-xs font-medium text-emerald-200">{descriptor}</p> : null}
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{description}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold text-emerald-200">{priceLabel}</p>
          {unitLabel ? <p className="text-[11px] text-slate-500">{unitLabel}</p> : null}
        </div>
      </div>

      {metaChips?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {metaChips.map((chip) => (
            <span
              key={`${chip.label}-${chip.tone || "slate"}`}
              className={`rounded-full px-3 py-1 text-[11px] ${chipToneClasses[chip.tone || "slate"]}`}
            >
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}

      {previewSlot ? (
        <div className="mt-4">{previewSlot}</div>
      ) : previewImages?.length ? (
        <div className={`mt-4 grid gap-2 ${previewImages.length <= 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {previewImages.slice(0, 3).map((image) => (
            <img
              key={`${image.src}-${image.alt}`}
              src={image.src}
              alt={image.alt}
              className="h-20 w-full rounded-xl object-cover"
              loading="lazy"
            />
          ))}
        </div>
      ) : null}

      {trustChips?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {trustChips.map((chip) => (
            <span
              key={`${chip.label}-${chip.tone || "slate"}`}
              className={`rounded-full px-3 py-1 text-[11px] ${chipToneClasses[chip.tone || "slate"]}`}
            >
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}

      {stats?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {stats.map((chip) => (
            <span
              key={`${chip.label}-${chip.tone || "slate"}`}
              className={`rounded-full px-3 py-1 text-[11px] ${chipToneClasses[chip.tone || "slate"]}`}
            >
              {chip.label}
            </span>
          ))}
        </div>
      ) : null}

      {footerSlot ? <div className="mt-4">{footerSlot}</div> : null}

      {actions?.length ? (
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {actions.map((action, index) => {
            const actionKey = action.key || action.label || action.srLabel || `action-${index}`;
            const accessibilityLabel = action.srLabel || action.label;
            const iconOnly = Boolean(action.icon) && !action.label;
            const sizingClass = iconOnly && !action.badge ? "h-10 w-10 px-0" : "px-4 py-2";
            const content = (
              <>
                {action.icon ? <span aria-hidden="true" className="shrink-0">{action.icon}</span> : null}
                {action.label ? <span>{action.label}</span> : null}
                {!action.label && accessibilityLabel ? <span className="sr-only">{accessibilityLabel}</span> : null}
                {action.badge ? (
                  <span className="inline-flex min-w-[1.35rem] items-center justify-center rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-black leading-none">
                    {action.badge}
                  </span>
                ) : null}
              </>
            );

            return action.href ? (
              <Link
                key={`${actionKey}-${action.href}`}
                href={action.href}
                onClick={(event) => event.stopPropagation()}
                aria-label={accessibilityLabel}
                title={accessibilityLabel}
                className={`inline-flex items-center justify-center gap-2 rounded-full text-xs font-semibold transition ${
                  sizingClass
                } ${
                  actionToneClasses[action.tone || "secondary"]
                }`}
              >
                {content}
              </Link>
            ) : (
              <button
                key={actionKey}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  action.onClick?.(event);
                }}
                aria-label={accessibilityLabel}
                title={accessibilityLabel}
                className={`inline-flex items-center justify-center gap-2 rounded-full text-xs font-semibold transition ${
                  sizingClass
                } ${
                  actionToneClasses[action.tone || "secondary"]
                }`}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className="flex h-full min-h-[440px] flex-col rounded-[1.8rem] border border-slate-800 bg-slate-950/72 p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-sky-500/40"
    >
      {cardBody}
    </div>
  );
}
