"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8000";

let socket: Socket | null = null;
let isConnecting = false;

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
}

export function getSocket(): Socket {
  if (!socket && !isConnecting) {
    isConnecting = true;
    socket = io(WS_URL, {
      autoConnect: false,
      auth: { token: getToken() ?? undefined },
      transports: ["websocket", "polling"],
    });
  }
  return socket!;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (s && !s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}

export function useSocketEvent(event: string, handler: (payload: any) => void) {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    const s = connectSocket();
    const listener = (payload: any) => ref.current(payload);
    s.on(event, listener);
    return () => {
      s.off(event, listener);
    };
  }, [event]);
}
