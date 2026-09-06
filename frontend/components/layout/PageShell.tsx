"use client";

import { type ReactNode, Suspense } from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./TopHeader";
import { useNavigation } from "@/providers/NavigationProvider";
import { AppLoadingSkeleton } from "@/components/common/AppLoadingSkeleton";

interface PageShellProps {
  role: string;
  children: ReactNode;
}

export function PageShell({ role, children }: PageShellProps) {
  const { isNavigating } = useNavigation();

  return (
    <div className="min-h-screen bg-linen-canvas flex">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<AppLoadingSkeleton />}>
            {isNavigating ? <AppLoadingSkeleton /> : children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
