"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { DashboardPath } from "@/lib/roles";
import { Spinner } from "@/components/ui/Spinner";

export function GuestOnly({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token && user) router.replace(DashboardPath[user.role]);
  }, [token, user, router]);

  if (token && user) return <Spinner full />;
  return <>{children}</>;
}
