"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8000";

let socket: Socket | null = null;

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: true,
      auth: { token: getToken() ?? undefined },
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

/** Update the auth token on the live socket (e.g. after login/refresh). */
export function refreshSocketToken() {
  const s = socket;
  if (s) s.auth = { token: getToken() ?? undefined };
}

export function useSocketEvent(event: string, handler: (payload: any) => void) {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    const s = getSocket();
    const listener = (payload: any) => ref.current(payload);
    s.on(event, listener);
    return () => {
      s.off(event, listener);
    };
  }, [event]);
}
