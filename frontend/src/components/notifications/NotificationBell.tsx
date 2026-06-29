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
  const [page, setPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: notificationsData, isLoading } = useNotifications(page, 10);
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
        className="relative p-2 text-ash hover:text-graphite hover:bg-sky-wash rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-signal-blue focus:ring-offset-1"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount && unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-alert opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coral-alert border-2 border-white"></span>
          </span>
        ) : null}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-cards-lg shadow-product-card-product-card border border-slate-custom/10 overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-custom/10 bg-linen-canvas/50">
            <h3 className="font-bold text-graphite">Notifications</h3>
            {unreadCount && unreadCount > 0 ? (
              <button 
                onClick={() => markAllRead.mutate()}
                className="text-xs font-semibold text-signal-blue hover:text-signal-blue/80 flex items-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
            ) : null}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-ash">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-linen-canvas rounded-full flex items-center justify-center text-ash mb-3">
                  <Bell size={24} />
                </div>
                <p className="text-sm font-medium text-graphite">No notifications yet</p>
                <p className="text-xs text-ash mt-1">We'll let you know when something happens.</p>
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
                {notifications.length >= 10 && page < 5 && (
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="w-full py-2 text-sm text-ash hover:text-graphite hover:bg-sky-wash transition-colors"
                  >
                    Show more
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-custom/10 text-center bg-linen-canvas/50 hover:bg-sky-wash transition-colors">
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-signal-blue hover:text-signal-blue/80 block"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
