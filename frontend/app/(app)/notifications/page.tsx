"use client";

import { useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@/components/common/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import { Role } from "@/lib/roles";
import { Card, PageHeader, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { notifySuccess, notifyError } from "@/lib/notify";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/notifications/api";
import { Bell, Check, ChevronLeft, ChevronRight, MessageSquare, Briefcase, Star, CheckCircle, XCircle, Info, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function timeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const getIcon = (type: string) => {
  switch (type) {
    case "NEW_MESSAGE": return <MessageSquare size={18} className="text-signal-blue" />;
    case "APPLICATION_RECEIVED":
    case "COLLABORATION_STARTED": return <Briefcase size={18} className="text-signal-blue" />;
    case "APPLICATION_ACCEPTED":
    case "INVITATION_ACCEPTED": return <CheckCircle size={18} className="text-emerald-status" />;
    case "APPLICATION_REJECTED":
    case "INVITATION_DECLINED": return <XCircle size={18} className="text-coral-alert" />;
    case "REVIEW_RECEIVED": return <Star size={18} className="text-amber-tag" />;
    default: return <Info size={18} className="text-steel" />;
  }
};

const getLink = (type: string, role?: Role) => {
  switch (type) {
    case "NEW_MESSAGE": return "/messages";
    case "REVIEW_RECEIVED": return role === Role.BUSINESS ? "/business/reviews" : "/promoter/reviews";
    case "APPLICATION_RECEIVED": return "/business/campaigns";
    case "COLLABORATION_STARTED": return "/business/collaborations";
    default: return "#";
  }
};

function NotificationsInner() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const { user } = useAuth();

  const { data, isLoading } = useNotifications({ page, limit: 50, unread_only: filter === "unread" });
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const del = useDeleteNotification();
  const prefs = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const notifications = data?.items ?? [];

  const togglePref = (type: string, enabled: boolean) => {
    updatePrefs.mutate(
      { preferences: [{ type, enabled: !enabled }] },
      {
        onSuccess: () => notifySuccess("Preference updated"),
        onError: (e: any) => notifyError(e?.response?.data?.message ?? "Update failed"),
      },
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Notifications</h1>
          <p className="mt-1 text-sm text-ash">Stay updated on your collaborations and activity.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="inline-flex rounded-lg bg-sky-wash p-1">
            <button
              onClick={() => { setFilter("all"); setPage(1); }}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${filter === "all" ? "bg-white text-graphite shadow-product-card-sm" : "text-ash hover:text-graphite"}`}
            >
              All
            </button>
            <button
              onClick={() => { setFilter("unread"); setPage(1); }}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${filter === "unread" ? "bg-white text-graphite shadow-product-card-sm" : "text-ash hover:text-graphite"}`}
            >
              Unread
            </button>
          </div>
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="flex items-center gap-1.5 text-sm font-semibold text-signal-blue hover:text-signal-blue"
          >
            <Check size={16} /> Mark all as read
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-custom/10 bg-white shadow-xl shadow-midnight-ink/5">
        {isLoading ? (
          <div className="flex justify-center p-16"><Spinner className="w-8 h-8 text-signal-blue" /></div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-16 text-center"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sky-wash">
              <Bell size={36} className="text-fog" />
            </div>
            <h2 className="text-xl font-bold text-graphite">No notifications</h2>
            <p className="mt-2 max-w-sm text-ash text-sm">
              {filter === "unread"
                ? "You're all caught up! There are no unread notifications right now."
                : "You don't have any notifications yet. We'll let you know when something happens."}
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={getLink(n.type, user?.role)}
                    onClick={() => { if (!n.isRead) markRead.mutate(n.id); }}
                    className={`group relative flex cursor-pointer items-start gap-4 border-b border-slate-custom/5 px-6 py-5 transition-all hover:bg-sky-wash/50 ${!n.isRead ? "bg-signal-blue/[0.02]" : ""}`}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-14 w-1 rounded-r-full bg-signal-blue"></div>
                    )}
                    <div className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${!n.isRead ? 'bg-signal-blue/10' : 'bg-linen-canvas border border-slate-custom/10'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="min-w-0 flex-1 pr-12">
                      <h4 className={`text-base ${n.isRead ? "font-semibold text-graphite" : "font-bold text-midnight-ink"}`}>
                        {n.title}
                      </h4>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-ash leading-relaxed">
                        {n.message}
                      </p>
                      <span className="mt-2 block text-[11px] font-medium uppercase tracking-wider text-steel">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    
                    <div className="absolute right-6 top-6 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {!n.isRead && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); markRead.mutate(n.id); }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-signal-blue shadow-sm hover:bg-signal-blue hover:text-white transition-colors border border-slate-custom/10"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {data && data.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-custom/10 bg-linen-canvas/50 px-6 py-4">
                <p className="text-sm font-medium text-ash">
                  Page <span className="text-graphite">{page}</span> of <span className="text-graphite">{data.pages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-custom/10 bg-white text-graphite shadow-sm transition-colors hover:bg-linen-canvas hover:text-midnight-ink disabled:opacity-40"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-custom/10 bg-white text-graphite shadow-sm transition-colors hover:bg-linen-canvas hover:text-midnight-ink disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {prefs.data && prefs.data.preferences.length > 0 && (
        <Card className="mt-6">
          <h2 className="mb-3 text-heading-sm font-semibold text-midnight-ink">Notification preferences</h2>
          <div className="grid gap-2">
            {prefs.data.preferences.map((p) => (
              <label key={p.id} className="flex items-center justify-between rounded-inputs border border-steel/10 px-3 py-2">
                <span className="text-body text-slate-custom">{p.type}</span>
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={() => togglePref(p.type, p.enabled)}
                  className="h-4 w-4 rounded border-steel/40 text-primary"
                />
              </label>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsInner />
    </RequireAuth>
  );
}
