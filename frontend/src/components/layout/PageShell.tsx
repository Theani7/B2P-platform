import React from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

interface PageShellProps {
  role: string;
  children: React.ReactNode;
}

export function PageShell({ role, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-[280px]">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}