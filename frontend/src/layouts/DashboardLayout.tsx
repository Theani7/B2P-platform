import { ReactNode } from "react";
import { useAuth } from "../providers/AuthProvider";
import { PageShell } from "../components/layout/PageShell";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageShell role={role}>
        <div className="max-w-5xl">{children}</div>
        <div className="fixed bottom-4 right-4">
          <button onClick={logout} className="text-xs text-gray-500 hover:text-brand-coral transition-colors">
            Sign out
          </button>
        </div>
      </PageShell>
    </div>
  );
}