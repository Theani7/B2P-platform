import React, { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  useNotifications, 
  useUnreadNotificationCount, 
  useMarkAllNotificationsRead,
  useNotificationWebSocket 
} from "../../features/notifications";
import { NotificationCard } from "./NotificationCard";

export function NotificationBell() {
  useNotificationWebSocket(); // Initialize websocket
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: notificationsData, isLoading } = useNotifications(1, 10);
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = notificationsData?.items || [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount && unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
          </span>
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount && unreadCount > 0 ? (
              <button 
                onClick={() => markAllRead.mutate()}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            ) : null}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
                  <Bell size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1">We'll let you know when something happens.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(notification => (
                  <NotificationCard 
                    key={notification.id} 
                    notification={notification} 
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50 hover:bg-gray-100 transition-colors">
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 block"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
