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
  Settings,
  LogOut,
  Zap,
  Lock
} from "lucide-react";
import { notifyError } from "../../hooks/useToast";
import { Badge } from "../ui";

interface SidebarProps {
  role: string;
}

const businessLinks = [
  { to: "/business/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/business/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/business/promoters", label: "Find Promoters", icon: Users },
  { to: "/business/collaborations", label: "Collaborations", icon: Handshake },
  { to: "/business/saved-promoters", label: "Saved Promoters", icon: Bookmark },
  { to: "/business/invitations", label: "Invitations", icon: Mail },
  { to: "/messages", label: "Messages", icon: MessageSquare },
];

const promoterLinks = [
  { to: "/promoter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/promoter/marketplace", label: "Marketplace", icon: Store },
  { to: "/promoter/applications", label: "Applications", icon: FileText },
  { to: "/promoter/collaborations", label: "Collaborations", icon: Handshake },
  { to: "/promoter/invitations", label: "Invitations", icon: Mail },
  { to: "/my/reviews", label: "Reviews", icon: BarChart3 },
  { to: "/messages", label: "Messages", icon: MessageSquare },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/verification", label: "Verification", icon: ShieldCheck },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

function getLinks(role: string) {
  switch (role) {
    case Role.ADMIN:
      return adminLinks;
    case Role.PROMOTER:
      return promoterLinks;
    default:
      return businessLinks;
  }
}

export function Sidebar({ role }: SidebarProps) {
  const { user, openLogoutDialog } = useAuth();
  const { data: conversations } = useConversations();
  const links = getLinks(role);

  const unreadMessagesCount = conversations?.reduce((acc, conv) => acc + conv.unread_count, 0) || 0;

  return (
    <aside className="hidden md:flex w-[280px] flex-shrink-0 bg-white border-r border-gray-200 flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <NavLink to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
            <Zap size={18} />
          </div>
          Byparsathy
        </NavLink>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const isLocked = !user?.has_profile && role !== Role.ADMIN;

            if (isLocked) {
              return (
                <button
                  key={link.to}
                  onClick={() => notifyError("Please complete and save your profile to unlock this section.")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-50 cursor-not-allowed transition-all duration-200 group"
                  title="Complete profile to unlock"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-gray-300 group-hover:text-gray-400" />
                    {link.label}
                  </div>
                  <Lock size={14} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
                </button>
              );
            }

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? "text-primary-600" : "text-gray-400"} />
                      {link.label}
                    </div>
                    {link.to === "/messages" && unreadMessagesCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}
