"use client";

import { useEffect, useMemo, useState } from "react";
import { toAbsoluteMediaUrl } from "@/lib/mediaUrl";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackText?: string;
}

const getInitials = (value?: string) => {
  const clean = String(value || "").trim();
  if (!clean) return "";
  const parts = clean
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

export function Avatar({
  src,
  alt = "Avatar",
  size = 40,
  className = "",
  fallbackText
}: AvatarProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  const resolvedSrc = useMemo(() => (loadFailed ? "" : toAbsoluteMediaUrl(src)), [loadFailed, src]);
  const initials = useMemo(() => getInitials(fallbackText || alt), [alt, fallbackText]);

  useEffect(() => {
    setLoadFailed(false);
  }, [src]);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 ${className}`}
      style={{ width: size, height: size }}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          onError={() => setLoadFailed(true)}
        />
      ) : initials ? (
        <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-100">
          {initials}
        </span>
      ) : (
        <img src="/avatar-default.svg" alt={alt} className="h-full w-full rounded-full object-cover" />
      )}
    </span>
  );
}

