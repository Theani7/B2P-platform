import React, { createContext, useContext, ReactNode } from "react";
import { useCurrentUser, useLogout } from "../features/auth/api";
import { User } from "../features/auth/types";

type AuthContextType = {
  user?: User;
  isLoading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const logout = () => logoutMutation.mutate();

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
