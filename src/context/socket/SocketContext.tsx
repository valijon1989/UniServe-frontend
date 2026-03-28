"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { ensureValidAccessToken } from "@/api/client";
import { useAuthStore } from "@/store/auth";

type SocketEventHandler = (...args: unknown[]) => void;

export type ServerToClientEvents = Record<string, SocketEventHandler>;
export type ClientToServerEvents = Record<string, SocketEventHandler>;
export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: AppSocket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue | undefined>(undefined);

const TOKEN_KEY = "accessToken";
const SOCKET_PATH = "/ws";
const IS_DEV = process.env.NODE_ENV !== "production";
const SOCKET_TOKEN_REFRESH_BUFFER_MS = 15_000;

type SocketWindow = Window & {
  __UNISERVE_SOCKET__?: AppSocket | null;
  __UNISERVE_SOCKET_TOKEN__?: string | null;
  __UNISERVE_SOCKET_URL__?: string | null;
};

const getSocketWindow = () => (window as SocketWindow);

const normalizeSocketUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const getSocketBaseUrl = () => {
  const rawUrl = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!rawUrl) {
    if (IS_DEV) {
      console.warn("Socket.IO URL topilmadi. REACT_APP_API_URL yoki NEXT_PUBLIC_API_URL ni sozlang.");
    }
    return null;
  }

  return normalizeSocketUrl(rawUrl);
};

const readAccessToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

const setSingletonSocketToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  getSocketWindow().__UNISERVE_SOCKET_TOKEN__ = token;
};

const resolveSocketToken = async (fallbackToken?: string | null) => {
  const refreshedToken = await ensureValidAccessToken({ minTtlMs: SOCKET_TOKEN_REFRESH_BUFFER_MS });
  const nextToken = refreshedToken || readAccessToken() || fallbackToken || null;
  setSingletonSocketToken(nextToken);
  return nextToken;
};

const createSocketAuth = (fallbackToken?: string | null) => {
  return (cb: (data: object) => void) => {
    void resolveSocketToken(fallbackToken)
      .then((token) => {
        cb(token ? { token } : {});
      })
      .catch((error) => {
        if (IS_DEV) {
          console.error("Socket.IO auth refresh failed", error);
        }
        cb({});
      });
  };
};

const disconnectSingletonSocket = () => {
  if (typeof window === "undefined") return;

  const socketWindow = getSocketWindow();
  if (socketWindow.__UNISERVE_SOCKET__) {
    if (IS_DEV) {
      console.info("Socket.IO disconnected");
    }
    socketWindow.__UNISERVE_SOCKET__.disconnect();
  }

  socketWindow.__UNISERVE_SOCKET__ = null;
  setSingletonSocketToken(null);
  socketWindow.__UNISERVE_SOCKET_URL__ = null;
};

const ensureSingletonSocket = (token: string) => {
  if (typeof window === "undefined") return null;

  const socketUrl = getSocketBaseUrl();
  if (!socketUrl) return null;

  const socketWindow = getSocketWindow();
  const currentSocket = socketWindow.__UNISERVE_SOCKET__ || null;
  const currentToken = socketWindow.__UNISERVE_SOCKET_TOKEN__ || null;
  const currentUrl = socketWindow.__UNISERVE_SOCKET_URL__ || null;

  if (currentSocket && currentToken === token && currentUrl === socketUrl) {
    currentSocket.auth = createSocketAuth(token);
    setSingletonSocketToken(token);
    return currentSocket;
  }

  if (currentSocket) {
    currentSocket.disconnect();
  }

  const nextSocket: AppSocket = io(socketUrl, {
    path: SOCKET_PATH,
    transports: ["websocket"],
    reconnection: true,
    autoConnect: false,
    auth: createSocketAuth(token)
  });

  socketWindow.__UNISERVE_SOCKET__ = nextSocket;
  setSingletonSocketToken(token);
  socketWindow.__UNISERVE_SOCKET_URL__ = socketUrl;

  if (IS_DEV) {
    console.info("Socket.IO initialized", {
      url: socketUrl,
      path: SOCKET_PATH
    });
  }

  return nextSocket;
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    const resolvedToken = readAccessToken() || token;

    if (!resolvedToken) {
      disconnectSingletonSocket();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const activeSocket = ensureSingletonSocket(resolvedToken);
    if (!activeSocket) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    setSocket(activeSocket);
    setIsConnected(activeSocket.connected);

    const handleConnect = () => {
      if (IS_DEV) {
        console.info("Socket.IO connected", activeSocket.id);
      }
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      if (IS_DEV) {
        console.info("Socket.IO disconnected");
      }
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      if (IS_DEV) {
        console.error("Socket.IO connect_error", error);
      }
      setIsConnected(false);
    };

    activeSocket.on("connect", handleConnect);
    activeSocket.on("disconnect", handleDisconnect);
    activeSocket.on("connect_error", handleConnectError);

    if (!activeSocket.connected) {
      activeSocket.connect();
    }

    return () => {
      activeSocket.off("connect", handleConnect);
      activeSocket.off("disconnect", handleDisconnect);
      activeSocket.off("connect_error", handleConnectError);
    };
  }, [isHydrated, token]);

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }

  return context;
}
