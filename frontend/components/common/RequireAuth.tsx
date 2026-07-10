"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Role, DashboardPath } from "@/lib/roles";
import { Spinner } from "@/components/ui/Spinner";

export function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (role && user && user.role !== role) {
      router.replace(DashboardPath[user.role]);
    }
  }, [token, user, role, router]);

  if (!token) return <Spinner full />;
  if (role && user && user.role !== role) return <Spinner full />;
  return <>{children}</>;
}
