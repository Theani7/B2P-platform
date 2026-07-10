import { NavLink } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { useConversations } from "../../features/chat";
import { Role } from "../../constants/roles";
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
  BarChart3,
  Lock,
  Star,
  Clock,
  Settings,
  Plus,
} from "lucide-react";
import { notifyError } from "../../hooks/useToast";

interface SidebarProps {
  role: string;
}

const businessSections = [
  {
    title: "Overview",
    links: [
      { to: "/business/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Campaigns",
    links: [
      { to: "/business/campaigns", label: "My Campaigns", icon: Megaphone },
      { to: "/business/campaigns/create", label: "Create Campaign", icon: Plus },
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
      { to: "/messages", label: "Messages", icon: MessageSquare },
    ],
  },
];

const promoterSections = [
  {
    title: "Overview",
    links: [
      { to: "/promoter/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Work",
    links: [
      { to: "/promoter/marketplace", label: "Marketplace", icon: Store },
      { to: "/promoter/applications", label: "Applications", icon: FileText },
      { to: "/promoter/invitations", label: "Invitations", icon: Mail },
    ],
  },
  {
    title: "Activity",
    links: [
      { to: "/promoter/collaborations", label: "Collaborations", icon: Handshake },
      { to: "/my/reviews", label: "My Reviews", icon: Star },
      { to: "/messages", label: "Messages", icon: MessageSquare },
    ],
  },
];

const adminSections = [
  {
    title: "Overview",
    links: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
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
      { to: "/admin/audit-logs", label: "Audit Logs", icon: Clock },
      { to: "/admin/settings", label: "Settings", icon: Settings },
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
  const { user } = useAuth();
  const { data: conversationsData } = useConversations();
  const sections = getSections(role);

  const unreadMessagesCount = conversationsData?.items?.reduce((acc, conv) => acc + conv.unread_count, 0) || 0;

  return (
    <aside className="hidden md:flex w-56 flex-shrink-0 bg-white border-r border-slate-custom/10 flex-col h-screen fixed left-0 top-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-slate-custom/10">
        <NavLink
          to={user ? `/${user.role.toLowerCase()}/dashboard` : "/"}
          className="flex items-center gap-2 text-lg font-medium text-signal-blue"
        >
          Byparsathy
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 mb-2 text-caption font-medium uppercase tracking-wider text-ash">
                {section.title}
              </div>
              {section.links.map((link) => {
                const Icon = link.icon;
                const isLocked = !user?.has_profile && role !== Role.ADMIN;

                if (isLocked) {
                  return (
                    <button
                      key={link.to}
                      onClick={() => notifyError("Please complete and save your profile to unlock this section.")}
                      className="w-full flex items-center justify-between px-4 py-2 rounded-button text-sm font-medium text-slate-custom hover:bg-sky-wash cursor-not-allowed transition-all duration-150 group"
                      title="Complete profile to unlock"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-slate-custom group-hover:text-signal-blue" />
                        {link.label}
                      </div>
                      <Lock size={14} className="text-slate-custom group-hover:text-amber-tag transition-colors" />
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 rounded-button text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-sky-wash text-signal-blue font-medium"
                          : "text-slate-custom hover:bg-sky-wash hover:text-signal-blue"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? "text-signal-blue" : "text-slate-custom"} />
                          {link.label}
                        </div>
                        {link.to === "/messages" && unreadMessagesCount > 0 && (
                          <span className="bg-coral-alert text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
