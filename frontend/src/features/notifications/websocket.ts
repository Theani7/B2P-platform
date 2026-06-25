import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from './api';
import { useAuth } from '../auth';

export function useNotificationWebSocket() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!token) return;

    const wsUrl = `ws://localhost:8000/ws/notifications?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      wsRef.current = ws;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NEW_NOTIFICATION") {
          // Invalidate queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message", e);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

  }, [token, queryClient]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);
}
