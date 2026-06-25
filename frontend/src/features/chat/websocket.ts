import { useState, useEffect, useCallback, useRef } from 'react';
import type { WebSocketMessage } from './types';

export function useChatWebSocket(conversationId: string | undefined, token: string | undefined) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!conversationId || !token) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
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
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    return ws;
  }, [conversationId, token]);

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

  return { isConnected, lastMessage, sendMessage };
}
