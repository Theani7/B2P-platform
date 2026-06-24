import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { Role } from "../constants/roles";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
}

const BUSINESS_NAV = [
  { to: "/business/dashboard", label: "Dashboard" },
  { to: "/business/promoters", label: "Discover" },
  { to: "/business/saved-promoters", label: "Shortlist" },
  { to: "/business/campaigns", label: "Campaigns" },
  { to: "/business/profile", label: "Profile" },
];

const PROMOTER_NAV = [
  { to: "/promoter/dashboard", label: "Dashboard" },
  { to: "/promoter/profile", label: "Profile" },
];

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navItems = role === Role.BUSINESS ? BUSINESS_NAV : PROMOTER_NAV;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-text">B2P Connect</Link>
          <div className="flex items-center gap-4">
            <span className="rounded bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{role}</span>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-danger">
              Logout
            </button>
          </div>
        </div>
        <nav className="mt-3 flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm font-medium ${pathname === item.to ? "text-primary" : "text-gray-500 hover:text-text"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
    </div>
  );
}
