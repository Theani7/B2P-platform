"use client";

import { type ReactNode, Suspense, useEffect, useState } from "react";
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
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isNavigating) {
      setShowSkeleton(false);
      return;
    }

    // Only display the skeleton if navigation takes longer than 100ms
    // to prevent rapid jarring flashes on cached/instant transitions.
    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isNavigating]);

  return (
    <div className="min-h-screen bg-linen-canvas flex">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {showSkeleton ? (
            <AppLoadingSkeleton />
          ) : (
            <Suspense fallback={<AppLoadingSkeleton />}>
              {children}
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
