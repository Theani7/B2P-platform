"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead, useDeleteNotification } from "@/features/notifications/api";
import { useSocketEvent } from "@/lib/socket";
import { Bell, Check, X } from "lucide-react";

export function NotificationBell() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useNotifications({ limit: 10 });
  const unread = useUnreadCount();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const del = useDeleteNotification();

  // Realtime: refresh on new notification
  useSocketEvent("NEW_NOTIFICATION", () => {
    unread.refetch();
  });

  if (!token) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-pill px-3 py-1.5 text-body text-graphite hover:bg-sky-wash"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-graphite" />
        {unread.data && unread.data.count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-alert px-1 text-[10px] font-semibold text-white">
            {unread.data.count > 9 ? "9+" : unread.data.count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-modals border border-steel/10 bg-white p-3 shadow-elevated">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-caption font-medium uppercase tracking-wide text-steel">Notifications</span>
            <button
              className="text-caption text-primary hover:underline"
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </button>
          </div>
          {isLoading && <p className="text-caption text-steel">Loading…</p>}
          {data && data.items.length === 0 && <p className="text-body text-steel">No notifications yet.</p>}
          <ul className="grid max-h-96 gap-1 overflow-y-auto">
            {data?.items.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-2 rounded-inputs p-2 ${n.isRead ? "" : "bg-sky-wash"}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body text-midnight-ink">{n.title}</p>
                  <p className="truncate text-caption text-steel">{n.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  {!n.isRead && (
                    <button
                      className="text-caption text-primary hover:underline"
                      onClick={() => markRead.mutate(n.id)}
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    className="text-caption text-steel hover:text-coral-alert"
                    onClick={() => del.mutate(n.id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <a href="/notifications" className="mt-2 block text-center text-caption text-primary hover:underline">
            View all
          </a>
        </div>
      )}
    </div>
  );
}
