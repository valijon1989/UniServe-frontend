"use client";

export type CaregiverTrustBadgeItem = {
  label: string;
  value: string;
  tone?: "emerald" | "sky" | "amber" | "rose";
};

export type CaregiverAvailabilityDay = {
  key: string;
  label: string;
  dateLabel: string;
  available: boolean;
};

export type CaregiverProcessStep = {
  step: string;
  title: string;
  description: string;
};
