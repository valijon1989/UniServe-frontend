"use client";

import { api } from "./client";

const normalizeServiceApiIdentifier = (value: string) => String(value || "").trim().replace(/-v\d+$/i, "");

export type ServiceReactionKind = "like" | "dislike";
export type ServiceOrderStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED";

export interface ServiceReactionSummary {
  likes: number;
  dislikes: number;
  reaction: ServiceReactionKind | null;
}

export interface ServiceOrder {
  id: string;
  serviceId: string;
  serviceIdentifier: string;
  serviceTitle: string;
  agentId: string;
  agentName?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  destinationAddress?: string;
  note?: string;
  status: ServiceOrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;
  recipientId: string;
  text: string;
  createdAt?: string;
}

export interface ChatThread {
  id: string;
  agentId: string;
  agentName?: string;
  customerId: string;
  customerName?: string;
  serviceId?: string | null;
  serviceIdentifier?: string | null;
  serviceTitle?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
}

const buildAuthHeaders = (token?: string | null) => {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeReaction = (value: unknown): ServiceReactionKind | null => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "like" || normalized === "dislike") return normalized;
  return null;
};

const normalizeServiceReactionSummary = (data: any): ServiceReactionSummary => ({
  likes: toNumber(data?.likes, 0),
  dislikes: toNumber(data?.dislikes, 0),
  reaction: normalizeReaction(data?.reaction)
});

const normalizeServiceOrder = (data: any): ServiceOrder => ({
  id: String(data?.id || data?._id || ""),
  serviceId: String(data?.serviceId || ""),
  serviceIdentifier: String(data?.serviceIdentifier || ""),
  serviceTitle: String(data?.serviceTitle || ""),
  agentId: String(data?.agentId || ""),
  agentName: typeof data?.agentName === "string" ? data.agentName : undefined,
  customerId: String(data?.customerId || ""),
  customerName: String(data?.customerName || ""),
  customerPhone: String(data?.customerPhone || ""),
  customerAddress: String(data?.customerAddress || ""),
  destinationAddress: data?.destinationAddress ? String(data.destinationAddress) : undefined,
  note: data?.note ? String(data.note) : undefined,
  status: String(data?.status || "PENDING").toUpperCase() as ServiceOrderStatus,
  createdAt: typeof data?.createdAt === "string" ? data.createdAt : undefined,
  updatedAt: typeof data?.updatedAt === "string" ? data.updatedAt : undefined
});

const normalizeChatThread = (data: any): ChatThread => ({
  id: String(data?.id || data?._id || ""),
  agentId: String(data?.agentId || ""),
  agentName: typeof data?.agentName === "string" ? data.agentName : undefined,
  customerId: String(data?.customerId || ""),
  customerName: typeof data?.customerName === "string" ? data.customerName : undefined,
  serviceId: data?.serviceId ? String(data.serviceId) : null,
  serviceIdentifier: data?.serviceIdentifier ? String(data.serviceIdentifier) : null,
  serviceTitle: data?.serviceTitle ? String(data.serviceTitle) : null,
  lastMessageText: typeof data?.lastMessageText === "string" ? data.lastMessageText : null,
  lastMessageAt: typeof data?.lastMessageAt === "string" ? data.lastMessageAt : null
});

const normalizeChatMessage = (data: any): ChatMessage => ({
  id: String(data?.id || data?._id || ""),
  threadId: String(data?.threadId || ""),
  senderId: String(data?.senderId || ""),
  senderName: typeof data?.senderName === "string" ? data.senderName : undefined,
  recipientId: String(data?.recipientId || ""),
  text: String(data?.text || ""),
  createdAt: typeof data?.createdAt === "string" ? data.createdAt : undefined
});

export async function getServiceReactionSummary(
  identifier: string,
  token?: string | null
): Promise<ServiceReactionSummary> {
  const normalizedIdentifier = normalizeServiceApiIdentifier(identifier);
  const res = await api.get(`/services/${normalizedIdentifier}/reactions`, {
    headers: buildAuthHeaders(token)
  });
  return normalizeServiceReactionSummary(res.data);
}

export async function toggleServiceReaction(
  identifier: string,
  reaction: ServiceReactionKind,
  token: string
): Promise<ServiceReactionSummary> {
  const normalizedIdentifier = normalizeServiceApiIdentifier(identifier);
  const res = await api.post(
    `/services/${normalizedIdentifier}/reactions`,
    { reaction },
    {
      headers: buildAuthHeaders(token)
    }
  );
  return normalizeServiceReactionSummary(res.data);
}

export async function createServiceOrder(
  identifier: string,
  payload: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    destinationAddress?: string;
    note?: string;
  },
  token: string
): Promise<ServiceOrder> {
  const normalizedIdentifier = normalizeServiceApiIdentifier(identifier);
  const res = await api.post(`/services/${normalizedIdentifier}/orders`, payload, {
    headers: buildAuthHeaders(token)
  });
  return normalizeServiceOrder(res.data?.order || res.data);
}

export async function getIncomingServiceOrders(token: string): Promise<ServiceOrder[]> {
  const res = await api.get("/services/orders/incoming", {
    headers: buildAuthHeaders(token)
  });
  const items = Array.isArray(res.data?.orders) ? res.data.orders : [];
  return items.map((item: any) => normalizeServiceOrder(item));
}

export async function updateIncomingServiceOrderStatus(
  orderId: string,
  status: ServiceOrderStatus,
  token: string
): Promise<ServiceOrder> {
  const res = await api.patch(
    `/services/orders/${orderId}/status`,
    { status },
    { headers: buildAuthHeaders(token) }
  );
  return normalizeServiceOrder(res.data?.order || res.data);
}

export async function startServiceChat(
  payload: {
    agentId?: string;
    serviceContext?: {
      serviceId?: string;
      serviceIdentifier?: string;
      serviceTitle?: string;
    };
  },
  token: string
): Promise<{ thread: ChatThread; messages: ChatMessage[] }> {
  const serviceContext = payload.serviceContext
    ? {
        ...payload.serviceContext,
        serviceIdentifier: payload.serviceContext.serviceIdentifier
          ? normalizeServiceApiIdentifier(payload.serviceContext.serviceIdentifier)
          : payload.serviceContext.serviceIdentifier
      }
    : payload.serviceContext;
  const res = await api.post("/chat/start", { ...payload, serviceContext }, {
    headers: buildAuthHeaders(token)
  });
  const messages = Array.isArray(res.data?.messages) ? res.data.messages : [];
  return {
    thread: normalizeChatThread(res.data?.thread || {}),
    messages: messages.map((item: any) => normalizeChatMessage(item))
  };
}

export async function sendServiceChatMessage(
  threadId: string,
  text: string,
  token: string
): Promise<ChatMessage> {
  const res = await api.post(
    "/chat/messages",
    { threadId, text },
    {
      headers: buildAuthHeaders(token)
    }
  );
  return normalizeChatMessage(res.data?.message || res.data);
}
