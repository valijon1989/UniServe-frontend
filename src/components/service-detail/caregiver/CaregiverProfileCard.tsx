"use client";

import { Avatar } from "@/components/ui/Avatar";

type CaregiverProfileCardProps = {
  avatarSrc?: string;
  avatarAlt?: string;
  fallbackText: string;
  name: string;
  username: string;
  ratingLabel: string;
  experienceLabel: string;
  location: string;
  bio?: string;
};

export function CaregiverProfileCard({
  avatarSrc,
  avatarAlt,
  fallbackText,
  name,
  username,
  ratingLabel,
  experienceLabel,
  location,
  bio
}: CaregiverProfileCardProps) {
  return (
    <section className="rounded-[1.85rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Avatar
          src={avatarSrc}
          alt={avatarAlt || name}
          fallbackText={fallbackText}
          size={64}
          className="border border-slate-200"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-black tracking-tight text-slate-950">{name}</h2>
          <p className="mt-1 text-sm text-slate-500">@{username}</p>
          <p className="mt-3 text-sm font-medium text-slate-700">{ratingLabel}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Experience</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{experienceLabel}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Location</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{location}</p>
        </div>
      </div>

      {bio ? <p className="mt-4 text-sm leading-6 text-slate-600">{bio}</p> : null}
    </section>
  );
}
