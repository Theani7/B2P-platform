import { useState, useEffect, useCallback, useRef } from 'react';
import type { WebSocketMessage } from './types';

export function useChatWebSocket(conversationId: string | undefined, token: string | undefined) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!conversationId) return;
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!storedToken) return;

    const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || "/api/v1";
    const wsHost =
      apiBase.startsWith("http")
        ? new URL(apiBase).host
        : (import.meta.env.VITE_BACKEND_URL as string | undefined)
          ? new URL((import.meta.env.VITE_BACKEND_URL as string)).host
          : "localhost:8000";
    const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${wsHost}/api/v1/chat/ws/chat/${conversationId}?token=${storedToken}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      setSocket(ws);
      reconnectAttemptsRef.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
      reconnectAttemptsRef.current += 1;
      const backoff = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 30000);
      reconnectTimeoutRef.current = setTimeout(connect, backoff);
    };

    ws.onerror = (err) => {
      setError("Connection failed. Retrying...");
      console.error("Chat WebSocket error:", err);
    };

    return ws;
  }, [conversationId]);

  useEffect(() => {
    const ws = connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((msg: WebSocketMessage) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(msg));
    }
  }, [socket, isConnected]);

  return { isConnected, lastMessage, sendMessage, error };
}