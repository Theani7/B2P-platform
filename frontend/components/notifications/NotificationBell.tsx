"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead, useDeleteNotification } from "@/features/notifications/api";
import { useSocketEvent } from "@/lib/socket";
import { Bell, Check, X, MessageSquare, Briefcase, Star, CheckCircle, XCircle, Info, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";
function timeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const getIcon = (type: string) => {
  switch (type) {
    case "NEW_MESSAGE": return <MessageSquare size={16} className="text-signal-blue" />;
    case "APPLICATION_RECEIVED":
    case "COLLABORATION_STARTED": return <Briefcase size={16} className="text-signal-blue" />;
    case "APPLICATION_ACCEPTED":
    case "INVITATION_ACCEPTED": return <CheckCircle size={16} className="text-emerald-status" />;
    case "APPLICATION_REJECTED":
    case "INVITATION_DECLINED": return <XCircle size={16} className="text-coral-alert" />;
    case "REVIEW_RECEIVED": return <Star size={16} className="text-amber-tag" />;
    default: return <Info size={16} className="text-steel" />;
  }
};

export function NotificationBell() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications({ limit: 10 });
  const unread = useUnreadCount();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const del = useDeleteNotification();

  useSocketEvent("NEW_NOTIFICATION", () => {
    unread.refetch();
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!token) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${open ? 'bg-signal-blue/10 text-signal-blue' : 'text-graphite hover:bg-sky-wash'}`}
        aria-label="Notifications"
      >
        <Bell size={20} className={open ? 'text-signal-blue' : 'text-graphite'} />
        {unread.data && unread.data.count > 0 && (
          <span className="absolute right-2 top-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-coral-alert ring-2 ring-white">
            <span className="absolute h-full w-full animate-ping rounded-full bg-coral-alert opacity-75"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-96 rounded-2xl border border-white/40 bg-white/95 backdrop-blur-xl p-0 shadow-2xl shadow-midnight-ink/5 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-custom/10 bg-linen-canvas/50 px-5 py-4">
              <h3 className="text-sm font-semibold text-graphite">Notifications</h3>
              {unread.data && unread.data.count > 0 && (
                <button
                  className="text-xs font-medium text-signal-blue hover:text-signal-blue/80 transition-colors flex items-center gap-1"
                  onClick={() => markAll.mutate()}
                  disabled={markAll.isPending}
                >
                  {markAll.isPending ? <div className="scale-50"><Spinner /></div> : <Check size={14} />}
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              {isLoading && (
                <div className="flex justify-center p-8 scale-150">
                  <Spinner />
                </div>
              )}
              {data && data.items.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-sky-wash flex items-center justify-center mb-3">
                    <Bell size={20} className="text-fog" />
                  </div>
                  <p className="text-sm font-medium text-graphite">All caught up!</p>
                  <p className="text-xs text-ash mt-1">You have no new notifications.</p>
                </div>
              )}
              
              <ul className="flex flex-col">
                {data?.items.map((n) => (
                  <motion.li
                    layout
                    key={n.id}
                    className={`group relative flex items-start gap-4 border-b border-slate-custom/5 px-5 py-4 transition-colors hover:bg-sky-wash/50 ${!n.isRead ? 'bg-signal-blue/[0.02]' : ''}`}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-1 rounded-r-full bg-signal-blue"></div>
                    )}
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${!n.isRead ? 'bg-signal-blue/10' : 'bg-linen-canvas border border-slate-custom/10'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <p className={`text-sm ${!n.isRead ? 'font-semibold text-midnight-ink' : 'font-medium text-graphite'}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-ash line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="mt-1.5 text-[10px] font-medium text-steel uppercase tracking-wider">
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="absolute right-4 top-4 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!n.isRead && (
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-signal-blue shadow-sm hover:bg-signal-blue hover:text-white transition-colors border border-slate-custom/10"
                          onClick={(e) => { e.preventDefault(); markRead.mutate(n.id); }}
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {data && data.items.length > 0 && (
              <div className="border-t border-slate-custom/10 bg-white p-3">
                <Link 
                  href="/notifications" 
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-linen-canvas py-2.5 text-center text-xs font-semibold text-graphite transition-colors hover:bg-sky-wash hover:text-midnight-ink"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
