import { api } from "./client";

export interface TaxiAgentInfo {
  name?: string;
  avatarUrl?: string;
}

export interface TaxiListing {
  id: string;
  title?: string;
  city?: string;
  carType?: string;
  passengersMax?: number;
  priceNote?: string;
  languages?: string[] | string;
  availableHours?: string;
  description?: string;
  serviceArea?: string;
  agent?: TaxiAgentInfo | null;
}

export type TaxiOrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export interface TaxiOrder {
  id: string;
  status: TaxiOrderStatus;
  pickupAddress?: string;
  dropoffAddress?: string;
  rideTime?: string;
  note?: string;
  listingTitle?: string;
  listingId?: string;
  createdAt?: string;
  customerName?: string;
}

const normalizeListing = (data: any, idx = 0): TaxiListing => {
  const listing = data || {};
  const agentRaw = listing.agent || listing.owner || listing.createdBy || listing.user;
  return {
    id: listing.id || listing._id || String(idx),
    title: listing.title || listing.name || "Taxi xizmat",
    city: listing.city || listing.location || listing.area,
    carType: listing.carType || listing.vehicleType || listing.car || listing.transportType,
    passengersMax: listing.passengersMax || listing.capacity || listing.maxPassengers,
    priceNote: listing.priceNote || listing.price_note || "Kelishuv asosida",
    languages: listing.languages || listing.language || listing.langs,
    availableHours: listing.availableHours || listing.availableTime || listing.hours,
    description: listing.description || listing.details,
    serviceArea: listing.serviceArea || listing.service_zone || listing.area,
    agent: agentRaw
      ? {
        name: agentRaw.name || agentRaw.fullName || agentRaw.username,
        avatarUrl: agentRaw.avatarUrl || agentRaw.avatar
      }
      : null
  };
};

const normalizeOrderStatus = (value: any): TaxiOrderStatus => {
  const status = String(value || "pending").toLowerCase();
  const allowed: TaxiOrderStatus[] = ["pending", "accepted", "rejected", "cancelled", "completed"];
  return allowed.includes(status as TaxiOrderStatus) ? (status as TaxiOrderStatus) : "pending";
};

const normalizeOrder = (data: any, idx = 0): TaxiOrder => {
  const order = data || {};
  const listing = order.listing || order.listingId || order.listingRef;
  return {
    id: order.id || order._id || String(idx),
    status: normalizeOrderStatus(order.status || order.state),
    pickupAddress: order.pickupAddress || order.pickup || order.from,
    dropoffAddress: order.dropoffAddress || order.dropoff || order.to,
    rideTime: order.rideTime || order.schedule || order.time,
    note: order.note || order.notes,
    listingTitle: listing?.title || order.listingTitle || order.listingName,
    listingId: listing?.id || listing?._id || order.listingId,
    createdAt: order.createdAt,
    customerName: order.customer?.name || order.customerName
  };
};

const buildAuthHeaders = (token?: string | null) => {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export async function getTaxiListings(): Promise<TaxiListing[]> {
  const res = await api.get("/taxi/listings");
  const raw = res.data?.items || res.data?.listings || res.data || [];
  const items = Array.isArray(raw) ? raw : [];
  return items.map((item, idx) => normalizeListing(item, idx));
}

export async function getTaxiListing(id: string): Promise<TaxiListing | null> {
  const res = await api.get(`/taxi/listings/${id}`);
  const raw = res.data?.listing || res.data?.item || res.data;
  if (!raw) return null;
  return normalizeListing(raw, 0);
}

export async function createTaxiOrder(
  payload: {
    listingId: string;
    pickupAddress: string;
    dropoffAddress: string;
    rideTime: string;
    note?: string;
  },
  token: string
): Promise<TaxiOrder> {
  const res = await api.post("/taxi/orders", payload, {
    headers: buildAuthHeaders(token)
  });
  return normalizeOrder(res.data, 0);
}

export async function getMyTaxiOrders(token: string): Promise<TaxiOrder[]> {
  const res = await api.get("/taxi/orders/my", {
    headers: buildAuthHeaders(token)
  });
  const raw = res.data?.items || res.data?.orders || res.data || [];
  const items = Array.isArray(raw) ? raw : [];
  return items.map((item, idx) => normalizeOrder(item, idx));
}

export async function getAgentTaxiOrders(token: string): Promise<TaxiOrder[]> {
  const res = await api.get("/taxi/orders/agent", {
    headers: buildAuthHeaders(token)
  });
  const raw = res.data?.items || res.data?.orders || res.data || [];
  const items = Array.isArray(raw) ? raw : [];
  return items.map((item, idx) => normalizeOrder(item, idx));
}

export async function updateTaxiOrderStatus(
  id: string,
  status: TaxiOrderStatus,
  token: string
): Promise<TaxiOrder> {
  const res = await api.patch(
    `/taxi/orders/${id}/status`,
    { status },
    { headers: buildAuthHeaders(token) }
  );
  return normalizeOrder(res.data, 0);
}
