import { NavLink } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
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
  Zap
} from "lucide-react";

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
  const { user, openLogoutDialog } = useAuth();
  const links = getLinks(role);

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
                  <>
                    <Icon size={18} className={isActive ? "text-primary-600" : "text-gray-400"} />
                    {link.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4 space-y-1">
        <NavLink
          to={role === Role.BUSINESS ? "/business/profile" : "/promoter/settings"}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isActive ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <Settings size={18} className="text-gray-400" />
          Settings
        </NavLink>
        <button
          onClick={() => openLogoutDialog()}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
          Sign out
        </button>

        <div className="mt-4 pt-4 border-t border-gray-100 px-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium border border-primary-200">
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || "User"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
