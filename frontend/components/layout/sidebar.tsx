"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useConversations } from "@/features/chat/api";
import { Role } from "@/lib/roles";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Handshake,
  Bookmark,
  Mail,
  MessageSquare,
  Store,
  FileText,
  ShieldCheck,
  Lock,
  Star,
  Download,
  Clock,
  Settings,
  Plus,
  LogOut,
  Inbox,
} from "lucide-react";
import { notifyError } from "@/lib/notify";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";

interface PrefetchEntry {
  queryKey: string[];
  path: string;
}

const PREFETCH_KEYS: Record<string, PrefetchEntry[]> = {
  BUSINESS: [
    { queryKey: ["business-profile"], path: "/business/profile" },
    { queryKey: ["campaign-dashboard-stats"], path: "/campaigns/dashboard/stats" },
  ],
  PROMOTER: [
    { queryKey: ["promoter-profile"], path: "/promoter/profile" },
    { queryKey: ["profile-completion"], path: "/profile-completion" },
  ],
  ADMIN: [{ queryKey: ["admin-dashboard"], path: "/admin/dashboard" }],
};

interface SidebarProps {
  role: string;
}

const businessSections = [
  {
    title: "Overview",
    links: [{ to: "/business/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Campaigns",
    links: [
      { to: "/business/campaigns", label: "My Campaigns", icon: Megaphone },
      { to: "/business/campaigns/create", label: "Create Campaign", icon: Plus },
      { to: "/business/applications", label: "Applications", icon: FileText },
    ],
  },
  {
    title: "Promoters",
    links: [
      { to: "/business/promoters", label: "Find Promoters", icon: Users },
      { to: "/business/saved-promoters", label: "Saved Promoters", icon: Bookmark },
    ],
  },
  {
    title: "Collaboration",
    links: [
      { to: "/business/collaborations", label: "Collaborations", icon: Handshake },
      { to: "/business/invitations", label: "Invitations", icon: Mail },
      { to: "/business/reviews", label: "Reviews", icon: Star },
      { to: "/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    title: "Tools",
    links: [
      { to: "/export", label: "Export", icon: Download },
    ],
  },
];

const promoterSections = [
  {
    title: "Overview",
    links: [{ to: "/promoter/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Work",
    links: [
      { to: "/promoter/marketplace", label: "Marketplace", icon: Store },
      { to: "/promoter/opportunities", label: "Opportunities", icon: Inbox },
    ],
  },
  {
    title: "Activity",
    links: [
      { to: "/promoter/collaborations", label: "Collaborations", icon: Handshake },
      { to: "/promoter/reviews", label: "My Reviews", icon: Star },
      { to: "/messages", label: "Messages", icon: MessageSquare },
    ],
  },
];

const adminSections = [
  {
    title: "Overview",
    links: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "User Management",
    links: [
      { to: "/admin/users", label: "All Users", icon: Users },
      { to: "/admin/verification", label: "Verification", icon: ShieldCheck },
    ],
  },
  {
    title: "Content",
    links: [
      { to: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
      { to: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    title: "System",
    links: [
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    title: "Tools",
    links: [
      { to: "/export", label: "Export", icon: Download },
    ],
  },
];

function getSections(role: string) {
  switch (role) {
    case Role.ADMIN:
      return adminSections;
    case Role.PROMOTER:
      return promoterSections;
    default:
      return businessSections;
  }
}

export function Sidebar({ role }: SidebarProps) {
  const { user, hasProfile, openLogoutDialog } = useAuth();
  const sections = getSections(role);
  const pathname = usePathname();
  const prefetchedRef = useRef(false);

  const isMessagesPage = pathname === "/messages";
  const { data: conversationsData } = useConversations({ enabled: isMessagesPage });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (prefetchedRef.current || !user) return;
    prefetchedRef.current = true;
    const keys = PREFETCH_KEYS[user.role] || [];
    keys.forEach(({ queryKey, path }) => {
      queryClient.prefetchQuery({ queryKey, queryFn: () => api.get(path).then((r) => r.data) });
    });
  }, [user, queryClient]);

  const unreadMessagesCount =
    conversationsData?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;

  const avatarSrc = (user as any)?.promoterProfile?.avatarUrl || (user as any)?.businessProfile?.logoUrl || null;
  const initials =
    user?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r border-slate-custom/10 flex-col h-screen fixed left-0 top-0 z-[200]">
      <div className="px-5 pt-6 pb-5">
        <Link
          href={user ? `/${user.role.toLowerCase()}/dashboard` : "/"}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-signal-blue to-azure-info text-base font-semibold text-white shadow-product-card">B</span>
          <span>
            <span className="block font-display text-lg font-semibold tracking-tight text-midnight-ink">Byparsathy</span>
            <span className="font-roboto-mono block text-[10px] uppercase tracking-[0.18em] text-fog">{role}</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <nav className="space-y-7">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="font-roboto-mono px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-fog">{section.title}</div>
              {section.links.map((link) => {
                const Icon = link.icon;
                const isLocked = !hasProfile && role !== Role.ADMIN;

                if (isLocked) {
                  return (
                    <button
                      key={link.to}
                      onClick={() => notifyError("Please complete and save your profile to unlock this section.")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-fog hover:bg-sky-wash/60 transition-all duration-150 group"
                      title="Complete profile to unlock"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-fog" />
                        {link.label}
                      </div>
                      <Lock size={14} className="text-fog/70 group-hover:text-amber-tag transition-colors" />
                    </button>
                  );
                }

                const isActive = pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    href={link.to}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? "bg-midnight-ink text-white shadow-product-card"
                        : "text-steel hover:bg-sky-wash/60 hover:text-graphite"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? "text-white" : "text-ash group-hover:text-signal-blue"} />
                        {link.label}
                      </div>
                      {link.to === "/messages" && unreadMessagesCount > 0 && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center ${isActive ? "bg-white text-midnight-ink" : "bg-coral-alert text-white"}`}>
                          {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {user && (
        <div className="p-3">
          <div className="flex items-center gap-3 rounded-xl bg-linen-canvas border border-slate-custom/10 p-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-wash text-xs font-semibold text-signal-blue">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-graphite">{user.fullName || user.username}</span>
              <span className="block truncate text-xs text-ash">{user.email}</span>
            </span>
            <button
              onClick={openLogoutDialog}
              title="Sign out"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-ash transition-colors hover:bg-coral-alert/10 hover:text-coral-alert"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
