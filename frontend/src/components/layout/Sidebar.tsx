import { NavLink } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { Role } from "../../constants/roles";

interface SidebarProps {
  role: string;
}

const businessLinks = [
  { to: "/business/dashboard", label: "Dashboard" },
  { to: "/business/campaigns", label: "Campaigns" },
  { to: "/business/promoters", label: "Find Promoters" },
  { to: "/business/collaborations", label: "Collaborations" },
  { to: "/business/saved-promoters", label: "Saved Promoters" },
  { to: "/business/invitations", label: "Invitations" },
];

const promoterLinks = [
  { to: "/promoter/dashboard", label: "Dashboard" },
  { to: "/promoter/marketplace", label: "Marketplace" },
  { to: "/promoter/applications", label: "My Applications" },
  { to: "/promoter/collaborations", label: "Collaborations" },
  { to: "/promoter/invitations", label: "Invitations" },
  { to: "/my/reviews", label: "Reviews" },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/verification", label: "Verification" },
  { to: "/admin/analytics", label: "Analytics" },
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
  const links = getLinks(role);

  return (
    <aside className="w-[200px] flex-shrink-0 bg-white border-r border-gray-100 py-4 flex flex-col h-screen fixed left-0 top-0">
      <div className="px-4 mb-6">
        <span className="text-brand-purple font-medium text-base">B2P</span>
        <span className="text-gray-900 font-medium text-base">Connect</span>
      </div>
      <nav className="flex-1 px-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 text-sm mb-1 rounded-lg transition-colors ${
                isActive
                  ? "font-medium text-brand-purple-900 bg-brand-purple-50"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="text-sm text-gray-500 truncate">{user?.full_name || user?.email}</div>
        <div className="text-xs text-gray-400 mt-0.5">{role}</div>
      </div>
    </aside>
  );
}