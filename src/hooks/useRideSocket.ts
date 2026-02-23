import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type RideEventType =
  | "ride_requested"
  | "ride_assigned"
  | "ride_taken"
  | "ride_confirmed"
  | "ride_completed";

export type RideRequestedPayload = {
  rideId: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  seatCount?: number;
  taxiClass?: string;
  offeredFare?: number;
  estimatedFare?: number;
  currency?: string;
};

export type RideAssignedPayload = { rideId: string; agentId?: string };
export type RideSimplePayload = { rideId: string };
export type RideCompletedPayload = {
  rideId: string;
  finalFare?: number;
  platformFeeAmount?: number;
  payoutAmount?: number;
};

export type RidePayload =
  | RideRequestedPayload
  | RideAssignedPayload
  | RideSimplePayload
  | RideCompletedPayload;

export type RideStatus = "requested" | "assigned" | "taken" | "confirmed" | "completed";

export type RideRecord = {
  rideId: string;
  status: RideStatus;
  pickupLocation?: string;
  dropoffLocation?: string;
  seatCount?: number;
  taxiClass?: string;
  offeredFare?: number;
  estimatedFare?: number;
  currency?: string;
  agentId?: string;
  finalFare?: number;
  platformFeeAmount?: number;
  payoutAmount?: number;
  updatedAt: number;
};

export type RideEventMessage = {
  type: RideEventType;
  payload: RidePayload;
  receivedAt: number;
};

type RideSocketState = {
  status: "idle" | "connecting" | "open" | "closed" | "error";
  rides: RideRecord[];
  lastEvent: RideEventMessage | null;
  error: string | null;
};

type RideSocketOptions = {
  token?: string | null;
  enabled?: boolean;
};

const rideEventTypes: RideEventType[] = [
  "ride_requested",
  "ride_assigned",
  "ride_taken",
  "ride_confirmed",
  "ride_completed"
];

const getDefaultWsUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envUrl) return envUrl;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return "";
  if (process.env.NODE_ENV !== "production") return "";
  const normalized = apiUrl.replace(/\/+$/, "");
  const withoutApi = normalized.replace(/\/api$/, "");
  if (withoutApi.startsWith("https://")) {
    return `wss://${withoutApi.slice("https://".length)}/ws`;
  }
  if (withoutApi.startsWith("http://")) {
    return `ws://${withoutApi.slice("http://".length)}/ws`;
  }
  return `${withoutApi}/ws`;
};

const buildWsUrl = (token?: string | null) => {
  const baseUrl = getDefaultWsUrl();
  if (!baseUrl) return "";
  if (!token) return baseUrl;
  const hasQuery = baseUrl.includes("?");
  return `${baseUrl}${hasQuery ? "&" : "?"}token=${encodeURIComponent(token)}`;
};

const isWsBlocked = () =>
  typeof window !== "undefined" && Boolean((window as Window & { __UNISERVE_WS_BLOCKED?: boolean }).__UNISERVE_WS_BLOCKED);

const blockWs = () => {
  if (typeof window === "undefined") return;
  (window as Window & { __UNISERVE_WS_BLOCKED?: boolean }).__UNISERVE_WS_BLOCKED = true;
};

const normalizeMessage = (raw: unknown): { type: RideEventType; payload: RidePayload } | null => {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const typeCandidate = (value.event || value.type) as RideEventType | undefined;
  const isKnown = typeCandidate && rideEventTypes.includes(typeCandidate);
  if (!isKnown) return null;
  const payloadCandidate =
    (value.data as RidePayload | undefined) ||
    (value.payload as RidePayload | undefined) ||
    (value.message as RidePayload | undefined);

  if (payloadCandidate) return { type: typeCandidate, payload: payloadCandidate };
  return { type: typeCandidate, payload: value as RidePayload };
};

const applyRideEvent = (
  prev: RideRecord | undefined,
  type: RideEventType,
  payload: RidePayload
): RideRecord | null => {
  const rideId = (payload as RideRequestedPayload).rideId || prev?.rideId;
  if (!rideId) return null;
  const updatedAt = Date.now();
  const base: RideRecord = prev
    ? { ...prev, updatedAt }
    : { rideId, status: "requested", updatedAt };

  switch (type) {
    case "ride_requested": {
      const data = payload as RideRequestedPayload;
      return {
        ...base,
        status: "requested",
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        seatCount: data.seatCount,
        taxiClass: data.taxiClass,
        offeredFare: data.offeredFare,
        estimatedFare: data.estimatedFare,
        currency: data.currency
      };
    }
    case "ride_assigned": {
      const data = payload as RideAssignedPayload;
      return {
        ...base,
        status: "assigned",
        agentId: data.agentId ?? base.agentId
      };
    }
    case "ride_taken":
      return { ...base, status: "taken" };
    case "ride_confirmed":
      return { ...base, status: "confirmed" };
    case "ride_completed": {
      const data = payload as RideCompletedPayload;
      return {
        ...base,
        status: "completed",
        finalFare: data.finalFare,
        platformFeeAmount: data.platformFeeAmount,
        payoutAmount: data.payoutAmount
      };
    }
    default:
      return base;
  }
};

export const useRideSocket = ({ token, enabled = true }: RideSocketOptions = {}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<RideSocketState>({
    status: "idle",
    rides: [],
    lastEvent: null,
    error: null
  });

  useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setState((prev) => ({ ...prev, status: "idle" }));
      return;
    }

    const resolvedToken =
      token ?? (typeof window !== "undefined" ? window.localStorage.getItem("uniserve_token") : null);
    const wsUrl = buildWsUrl(resolvedToken);
    if (!wsUrl || typeof window === "undefined" || isWsBlocked()) {
      setState((prev) => ({ ...prev, status: "idle", error: null }));
      return;
    }

    setState((prev) => ({ ...prev, status: "connecting", error: null }));

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    let didOpen = false;

    ws.onopen = () => {
      didOpen = true;
      setState((prev) => ({ ...prev, status: "open" }));
    };

    ws.onerror = () => {
      if (!didOpen) blockWs();
      setState((prev) => ({ ...prev, status: "error", error: "WebSocket ulanishida xatolik." }));
    };

    ws.onclose = () => {
      if (!didOpen) blockWs();
      setState((prev) => ({ ...prev, status: "closed" }));
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const normalized = normalizeMessage(parsed);
        if (!normalized) return;
        setState((prev) => {
          const { type, payload } = normalized;
          const nextEvent: RideEventMessage = {
            type,
            payload,
            receivedAt: Date.now()
          };
          const rideId = (payload as RideRequestedPayload).rideId;
          const existing = prev.rides.find((ride) => ride.rideId === rideId);
          const updated = applyRideEvent(existing, type, payload);
          if (!updated) return { ...prev, lastEvent: nextEvent };
          const nextRides = existing
            ? prev.rides.map((ride) => (ride.rideId === rideId ? updated : ride))
            : [updated, ...prev.rides];
          return {
            ...prev,
            rides: nextRides,
            lastEvent: nextEvent
          };
        });
      } catch {
        setState((prev) => ({ ...prev, error: "WebSocket xabari o'qilmadi." }));
      }
    };

    return () => {
      ws.close();
    };
  }, [enabled, token]);

  const sendRideEvent = useCallback(
    (type: RideEventType, payload: RidePayload) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setState((prev) => ({ ...prev, error: "WebSocket hali tayyor emas." }));
        return false;
      }
      const message = JSON.stringify({ type, payload });
      ws.send(message);
      setState((prev) => {
        const rideId = (payload as RideRequestedPayload).rideId;
        const existing = prev.rides.find((ride) => ride.rideId === rideId);
        const updated = applyRideEvent(existing, type, payload);
        if (!updated) return prev;
        const nextRides = existing
          ? prev.rides.map((ride) => (ride.rideId === rideId ? updated : ride))
          : [updated, ...prev.rides];
        return { ...prev, rides: nextRides };
      });
      return true;
    },
    []
  );

  const sortedRides = useMemo(
    () => [...state.rides].sort((a, b) => b.updatedAt - a.updatedAt),
    [state.rides]
  );

  const latestRide = sortedRides[0] ?? null;

  return {
    ...state,
    rides: sortedRides,
    latestRide,
    sendRideEvent
  };
};
