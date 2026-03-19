"use client";

export type CreativePortfolioMetric = {
  label: string;
  value: string;
};

export type CreativePortfolioItem = {
  id: string;
  title: string;
  summary: string;
  mediaSrc: string;
  mediaAlt: string;
  mediaKind: "image" | "video";
  badge: string;
  projectType?: string;
  clientLabel?: string;
  metrics: CreativePortfolioMetric[];
};

export type CreativeDeliverable = {
  label: string;
  value: string;
  hint?: string;
};

export type CreativeProcessStep = {
  step: string;
  title: string;
  description: string;
  eta?: string;
};

export type CreativeStat = {
  label: string;
  value: string;
};
