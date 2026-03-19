"use client";

import type { ReactNode } from "react";

export type SystemMediaItem = {
  src: string;
  alt: string;
  caption?: string;
};

export type SystemSpecRow = {
  label: string;
  value: string;
  hint?: string;
  tone?: "emerald" | "sky" | "amber" | "slate";
};

export type SystemGallerySection = {
  title: string;
  description?: string;
  items: SystemMediaItem[];
};

export type SystemMetaRow = {
  label: string;
  value: string;
};

export type SystemAction = {
  key: string;
  label: string;
  onClick?: () => void;
  href?: string;
  tone?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  busy?: boolean;
};

export type SystemUtilityAction = {
  key: string;
  label: string;
  onClick: () => void;
  active?: boolean;
};

export type SystemSectionProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};
