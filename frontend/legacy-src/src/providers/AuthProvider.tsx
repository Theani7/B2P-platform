import { createContext, useContext, ReactNode, useState } from "react";
import { useCurrentUser, useLogout } from "../features/auth/api";
import { User } from "../features/auth/types";
import { Role } from "../constants/roles";
import { LogoutConfirmDialog } from "../components/common/LogoutConfirmDialog";

type AuthContextType = {
  user?: User;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
  openLogoutDialog: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const logout = () => {
    logoutMutation.mutate();
    setToken(null);
  };
  const openLogoutDialog = () => setIsLogoutDialogOpen(true);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, logout, openLogoutDialog }}>
      {children}
      <LogoutConfirmDialog 
        isOpen={isLogoutDialogOpen} 
        onClose={() => setIsLogoutDialogOpen(false)} 
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const useHasRole = (role: Role) => {
  const { user } = useAuth();
  return user?.role === role;
};
