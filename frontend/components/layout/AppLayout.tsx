"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Role, DashboardPath } from "@/lib/roles";
import { Spinner } from "@/components/ui/Spinner";
import { PageShell } from "./PageShell";
import { AIAssistant } from "@/components/ai/AIAssistant";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, token, isLoading, hasProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token && !isLoading) router.replace("/login");
  }, [token, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const isProfilePage = pathname === "/business/profile" || pathname === "/promoter/profile";
    if (!hasProfile && !isProfilePage && user.role !== Role.ADMIN) {
      const profilePath = user.role === Role.BUSINESS ? "/business/profile" : "/promoter/profile";
      router.replace(profilePath);
    }
  }, [user, hasProfile, pathname, router]);

  if (isLoading) return <Spinner full />;
  if (!token) return <Spinner full />;

  const role = user?.role ?? Role.BUSINESS;
  return (
    <PageShell role={role}>
      {children}
      <AIAssistant />
    </PageShell>
  );
}
