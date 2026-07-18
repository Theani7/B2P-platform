import { ReactNode } from "react";
import { PageShell } from "../components/layout/PageShell";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <PageShell role={role}>
      {children}
    </PageShell>
  );
}