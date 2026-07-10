import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./TopHeader";

interface PageShellProps {
  role: string;
  children: ReactNode;
}

export function PageShell({ role, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-linen-canvas flex">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-56">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
