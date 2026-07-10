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
import { Bell, Check, ChevronLeft, ChevronRight, MessageSquare, Briefcase, Star, CheckCircle, XCircle, Trash2 } from "lucide-react";

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
    default: return <Bell size={18} className="text-steel" />;
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

      <div className="overflow-hidden rounded-2xl border border-slate-custom/10 bg-white shadow-product-card-sm">
        {isLoading ? (
          <div className="flex justify-center p-12"><Spinner /></div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linen-canvas text-gray-300">
              <Bell size={32} />
            </div>
            <h2 className="text-lg font-bold text-graphite">No notifications</h2>
            <p className="mt-1 max-w-sm text-ash">
              {filter === "unread"
                ? "You&apos;re all caught up! There are no unread notifications right now."
                : "You don't have any notifications yet. We'll let you know when something happens."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={getLink(n.type, user?.role)}
                onClick={() => { if (!n.isRead) markRead.mutate(n.id); }}
                className={`flex cursor-pointer items-start gap-4 border-b border-slate-custom/10 p-4 transition-colors hover:bg-linen-canvas/50 last:border-0 ${n.isRead ? "" : "bg-sky-wash/40"}`}
              >
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-custom/10 bg-white shadow-sm">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={`text-sm ${n.isRead ? "font-semibold text-graphite" : "font-bold text-midnight-ink"}`}>
                    {n.title}
                  </h4>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-custom">{n.message}</p>
                  <span className="mt-1 block text-xs text-steel">{timeAgo(n.createdAt)}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!n.isRead && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-signal-blue" />}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); del.mutate(n.id); }}
                    className="text-steel transition-colors hover:text-coral-alert"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Link>
            ))}

            {data && data.pages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-custom/10 bg-linen-canvas/50 p-4">
                <p className="text-sm text-ash">
                  Page <span className="font-semibold text-graphite">{page}</span> of{" "}
                  <span className="font-semibold text-graphite">{data.pages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-custom/10 bg-white p-2 text-ash transition-colors hover:bg-linen-canvas disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="rounded-lg border border-slate-custom/10 bg-white p-2 text-ash transition-colors hover:bg-linen-canvas disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
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
