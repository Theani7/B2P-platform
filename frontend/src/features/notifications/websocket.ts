import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from './api';
import { notifyAchievement } from '../../hooks/useToast';
import { achievementKeys } from '../achievements';

export function useNotificationWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    // Retrieve token directly from localStorage since getAuthToken is missing
    const token = localStorage.getItem('b2p_token');
    if (!token) {
      console.error('WebSocket connection failed: No auth token');
      return;
    }

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
        } else if (data.type === "ACHIEVEMENT_UNLOCKED") {
          notifyAchievement(data.data.achievement);
          queryClient.invalidateQueries({ queryKey: achievementKeys.all });
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
