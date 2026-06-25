import React from "react";
import { Sidebar } from "./Sidebar";

interface PageShellProps {
  role: string;
  children: React.ReactNode;
}

export function PageShell({ role, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <main className="ml-[220px] flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}