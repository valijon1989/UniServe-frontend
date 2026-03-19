"use client";

import { Avatar } from "@/components/ui/Avatar";

type CreatorSidebarCardProps = {
  avatarSrc?: string;
  avatarAlt?: string;
  fallbackText: string;
  fullName: string;
  username: string;
  verified?: boolean;
  specialty: string;
  experienceLabel: string;
  location: string;
  ratingLabel: string;
  completedProjectsLabel: string;
  responseSpeed?: string;
  bio?: string;
};

export function CreatorSidebarCard({
  avatarSrc,
  avatarAlt,
  fallbackText,
  fullName,
  username,
  verified = false,
  specialty,
  experienceLabel,
  location,
  ratingLabel,
  completedProjectsLabel,
  responseSpeed,
  bio
}: CreatorSidebarCardProps) {
  return (
    <section className="rounded-[1.9rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Avatar
          src={avatarSrc}
          alt={avatarAlt || fullName}
          fallbackText={fallbackText}
          size={64}
          className="border border-slate-200"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-black tracking-tight text-slate-950">{fullName}</h2>
            {verified ? (
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                Verified
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">@{username}</p>
          <p className="mt-2 text-sm font-medium text-slate-700">{specialty}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Experience</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{experienceLabel}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Location</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{location}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Rating</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{ratingLabel}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Projects</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{completedProjectsLabel}</p>
        </div>
      </div>

      {responseSpeed ? (
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <span className="font-semibold">Response speed:</span> {responseSpeed}
        </div>
      ) : null}

      {bio ? <p className="mt-4 text-sm leading-6 text-slate-600">{bio}</p> : null}
    </section>
  );
}
