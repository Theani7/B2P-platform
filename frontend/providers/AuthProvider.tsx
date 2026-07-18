"use client";

import { createContext, useContext, type ReactNode, useState } from "react";
import { useCurrentUser, useLogout } from "@/features/auth/api";
import type { User } from "@/features/auth/types";
import { Role } from "@/lib/roles";
import { LogoutConfirmDialog } from "@/components/common/LogoutConfirmDialog";

type AuthContextType = {
  user?: User;
  hasProfile: boolean;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
  openLogoutDialog: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  );
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const logout = () => {
    logoutMutation.mutate();
    setToken(null);
  };
  const openLogoutDialog = () => setIsLogoutDialogOpen(true);
  const hasProfile = !!user && !!(user.promoterProfile || user.businessProfile);

  return (
    <AuthContext.Provider value={{ user, hasProfile, token, isLoading, logout, openLogoutDialog }}>
      {children}
      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useHasRole(role: Role) {
  const { user } = useAuth();
  return user?.role === role;
}
