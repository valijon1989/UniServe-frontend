"use client";

import { api } from "./client";

export type DetailTargetType = "product" | "service";
export type DetailFeedbackValue = "helpful" | "unhelpful";

export interface DetailFeedbackSummary {
  helpfulCount: number;
  unhelpfulCount: number;
  feedback: DetailFeedbackValue | null;
}

export interface DetailInquiryTarget {
  targetType: DetailTargetType;
  targetId?: string | null;
  targetIdentifier?: string | null;
  targetTitle?: string | null;
  ownerId?: string | null;
}

export interface DetailInquiryThread {
  id: string;
  agentId: string;
  agentName?: string;
  customerId: string;
  customerName?: string;
  targetType?: "PRODUCT" | "SERVICE" | null;
  targetId?: string | null;
  targetIdentifier?: string | null;
  targetTitle?: string | null;
  serviceId?: string | null;
  serviceIdentifier?: string | null;
  serviceTitle?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
}

export interface DetailInquiryMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;
  recipientId: string;
  text: string;
  createdAt?: string;
}

const SAVED_ITEMS_KEY = "uniserve-detail-saved-v1";

const asRecord = (value: unknown): Record<string, any> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, any>;
};

const asString = (value: unknown, fallback = "") => {
  const normalized = String(value || "").trim();
  return normalized || fallback;
};

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildAuthHeaders = (token?: string | null) => {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const toFeedbackSummary = (targetType: DetailTargetType, raw: unknown): DetailFeedbackSummary => {
  const root = asRecord(raw) || {};
  const data = asRecord(root.data) || root;
  if (targetType === "service") {
    const reaction = asString(data.reaction).toLowerCase();
    return {
      helpfulCount: asNumber(data.likes),
      unhelpfulCount: asNumber(data.dislikes),
      feedback: reaction === "like" ? "helpful" : reaction === "dislike" ? "unhelpful" : null
    };
  }
  const feedback = asString(data.feedback).toLowerCase();
  return {
    helpfulCount: asNumber(data.helpfulCount ?? data.likeCount ?? data.likes),
    unhelpfulCount: asNumber(data.unhelpfulCount),
    feedback: feedback === "helpful" || feedback === "unhelpful" ? feedback : null
  };
};

const toInquiryThread = (raw: unknown): DetailInquiryThread => {
  const data = asRecord(raw) || {};
  return {
    id: asString(data.id || data._id),
    agentId: asString(data.agentId),
    agentName: asString(data.agentName) || undefined,
    customerId: asString(data.customerId),
    customerName: asString(data.customerName) || undefined,
    targetType: asString(data.targetType).toUpperCase() as "PRODUCT" | "SERVICE" | null,
    targetId: asString(data.targetId) || null,
    targetIdentifier: asString(data.targetIdentifier) || null,
    targetTitle: asString(data.targetTitle) || null,
    serviceId: asString(data.serviceId) || null,
    serviceIdentifier: asString(data.serviceIdentifier) || null,
    serviceTitle: asString(data.serviceTitle) || null,
    lastMessageText: asString(data.lastMessageText) || null,
    lastMessageAt: asString(data.lastMessageAt) || null
  };
};

const toInquiryMessage = (raw: unknown): DetailInquiryMessage => {
  const data = asRecord(raw) || {};
  return {
    id: asString(data.id || data._id),
    threadId: asString(data.threadId),
    senderId: asString(data.senderId),
    senderName: asString(data.senderName) || undefined,
    recipientId: asString(data.recipientId),
    text: asString(data.text),
    createdAt: asString(data.createdAt) || undefined
  };
};

const normalizeTargetIdentifier = (target: DetailInquiryTarget) =>
  asString(target.targetIdentifier || target.targetId || target.targetTitle);

export async function getDetailFeedbackSummary(
  targetType: DetailTargetType,
  identifier: string,
  token?: string | null
): Promise<DetailFeedbackSummary> {
  const path = targetType === "service" ? `/services/${identifier}/reactions` : `/products/${identifier}/feedback`;
  const res = await api.get(path, { headers: buildAuthHeaders(token) });
  return toFeedbackSummary(targetType, res.data);
}

export async function toggleDetailFeedback(
  targetType: DetailTargetType,
  identifier: string,
  feedback: DetailFeedbackValue,
  token: string
): Promise<DetailFeedbackSummary> {
  if (targetType === "service") {
    const reaction = feedback === "helpful" ? "like" : "dislike";
    const res = await api.post(
      `/services/${identifier}/reactions`,
      { reaction },
      { headers: buildAuthHeaders(token) }
    );
    return toFeedbackSummary(targetType, res.data);
  }

  const res = await api.post(
    `/products/${identifier}/feedback`,
    { feedback },
    { headers: buildAuthHeaders(token) }
  );
  return toFeedbackSummary(targetType, res.data);
}

export async function startDetailInquiry(
  target: DetailInquiryTarget,
  token: string
): Promise<{ thread: DetailInquiryThread; messages: DetailInquiryMessage[] }> {
  const payload = {
    agentId: target.ownerId || undefined,
    targetContext: {
      targetType: target.targetType.toUpperCase(),
      targetId: target.targetId || undefined,
      targetIdentifier: normalizeTargetIdentifier(target) || undefined,
      targetTitle: target.targetTitle || undefined
    },
    serviceContext:
      target.targetType === "service"
        ? {
            serviceId: target.targetId || undefined,
            serviceIdentifier: normalizeTargetIdentifier(target) || undefined,
            serviceTitle: target.targetTitle || undefined
          }
        : undefined
  };

  const res = await api.post("/chat/start", payload, {
    headers: buildAuthHeaders(token)
  });
  const data = asRecord(res.data) || {};
  const messages = Array.isArray(data.messages) ? data.messages : [];
  return {
    thread: toInquiryThread(data.thread),
    messages: messages.map((item) => toInquiryMessage(item))
  };
}

export async function sendDetailInquiryMessage(
  threadId: string,
  text: string,
  token: string
): Promise<DetailInquiryMessage> {
  const res = await api.post(
    "/chat/messages",
    { threadId, text },
    { headers: buildAuthHeaders(token) }
  );
  return toInquiryMessage((asRecord(res.data) || {}).message || res.data);
}

export async function reportDetailTarget(
  targetType: DetailTargetType,
  identifier: string,
  payload: { reason: string; note?: string; targetTitle?: string },
  token: string
) {
  const path = targetType === "service" ? `/services/${identifier}/report` : `/products/${identifier}/report`;
  const res = await api.post(path, payload, {
    headers: buildAuthHeaders(token)
  });
  return asRecord(res.data) || {};
}

const readSavedStore = (): Record<string, boolean> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SAVED_ITEMS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeSavedStore = (value: Record<string, boolean>) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(value));
  } catch {
    // ignore local storage failures
  }
};

const buildSavedKey = (targetType: DetailTargetType, identifier: string) => `${targetType}:${identifier}`;

export const isDetailSaved = (targetType: DetailTargetType, identifier: string) =>
  Boolean(readSavedStore()[buildSavedKey(targetType, identifier)]);

export const toggleDetailSaved = (targetType: DetailTargetType, identifier: string) => {
  const store = readSavedStore();
  const key = buildSavedKey(targetType, identifier);
  const next = !store[key];
  store[key] = next;
  writeSavedStore(store);
  return next;
};
