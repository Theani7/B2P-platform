import React from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

interface PageShellProps {
  role: string;
  children: React.ReactNode;
}

export function PageShell({ role, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-56">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}