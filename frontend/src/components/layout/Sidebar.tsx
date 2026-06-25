import { NavLink } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { useLogout } from "../../features/auth/api";
import { Role } from "../../constants/roles";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Handshake,
  Bookmark,
  Mail,
  Store,
  FileText,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  role: string;
}

const businessLinks = [
  { to: "/business/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/business/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/business/promoters", label: "Find Promoters", icon: Users },
  { to: "/business/collaborations", label: "Collaborations", icon: Handshake },
  { to: "/business/saved-promoters", label: "Saved", icon: Bookmark },
  { to: "/business/invitations", label: "Invitations", icon: Mail },
  { to: "/business/profile", label: "Settings", icon: Settings },
];

const promoterLinks = [
  { to: "/promoter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/promoter/marketplace", label: "Marketplace", icon: Store },
  { to: "/promoter/applications", label: "Applications", icon: FileText },
  { to: "/promoter/collaborations", label: "Collaborations", icon: Handshake },
  { to: "/promoter/invitations", label: "Invitations", icon: Mail },
  { to: "/my/reviews", label: "Reviews", icon: BarChart3 },
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
  const { user } = useAuth();
  const logout = useLogout();
  const links = getLinks(role);

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <NavLink to="/" className="flex items-center gap-0.5 text-lg font-medium">
          <span className="text-brand-purple">B2P</span>
          <span className="text-gray-900">Connect</span>
        </NavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-brand-indigo/8 text-brand-indigo font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-purple-50 text-brand-purple-900 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {user?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "??"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || "User"}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
