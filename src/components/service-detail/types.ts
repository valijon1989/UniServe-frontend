"use client";

export type DetailMediaItem = {
  src: string;
  alt: string;
};

export type DetailAction = {
  key: string;
  label: string;
  tone?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
};

export type DetailReview = {
  id: string;
  author: string;
  role?: string;
  rating: number;
  text: string;
  dateLabel: string;
};

export type DetailTrustIndicator = {
  label: string;
  value: string;
  tone?: "emerald" | "sky" | "amber";
};

export type DetailContactMethod = {
  key: string;
  label: string;
  value: string;
  href?: string;
  locked?: boolean;
};

export type RelatedDetailItem = {
  id: string;
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  priceLabel?: string;
  rating?: number;
  meta?: string;
  tag?: string;
};
