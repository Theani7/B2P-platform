import React, { useState } from "react";
import { useNotifications, useMarkAllNotificationsRead } from "../features/notifications";
import { NotificationCard } from "../components/notifications";
import { Bell, Check } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications(1, 50, filter === "unread");
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.items || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on your collaborations and activity.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button 
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("unread")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === "unread" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              Unread
            </button>
          </div>
          <button 
            onClick={() => markAllRead.mutate()}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
          >
            <Check size={16} /> Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Bell size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">No notifications</h2>
            <p className="text-gray-500 mt-1 max-w-sm">
              {filter === "unread" ? "You're all caught up! There are no unread notifications right now." : "You don't have any notifications yet. We'll let you know when something happens."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
            
            {/* Pagination placeholder if needed, normally infinite query */}
          </div>
        )}
      </div>
    </div>
  );
}
