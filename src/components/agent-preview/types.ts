"use client";

export type AgentQuickStat = {
  label: string;
  value: string;
  tone?: "sky" | "emerald" | "amber" | "slate";
};

export type AgentOfferPreview = {
  title: string;
  description?: string;
  meta?: string;
  priceLabel?: string;
  badge?: string;
};

export type AgentQuickAction = {
  key: string;
  label: string;
  onClick?: () => void;
  href?: string;
  tone?: "primary" | "secondary" | "ghost" | "danger";
};
