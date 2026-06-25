import React from "react";
import { useAuth } from "../../providers/AuthProvider";
import { Avatar } from "../ui/Avatar";

interface TopBarProps {
  pageTitle: string;
  children?: React.ReactNode;
}

export function TopBar({ pageTitle, children }: TopBarProps) {
  const { user } = useAuth();
  const initials = user?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";
  const colorIndex = user?.id ? Math.floor(parseInt(user.id) % 5) : 0;

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-medium text-gray-900">{pageTitle}</h1>
      <div className="flex items-center gap-3">
        {children}
        <div className="text-xs text-gray-500">{user?.full_name || user?.email}</div>
        <Avatar initials={initials} size="sm" colorIndex={colorIndex} />
      </div>
    </div>
  );
}