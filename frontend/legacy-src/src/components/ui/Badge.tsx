import React from "react";

type BadgeVariant =
  | "active"
  | "verified"
  | "pending"
  | "completed"
  | "rejected"
  | "draft"
  | "business"
  | "promoter"
  | "open"
  | "archived";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: "bg-emerald-status/10 text-emerald-status",
  verified: "bg-emerald-status/10 text-emerald-status",
  pending: "bg-amber-tag/10 text-amber-tag",
  completed: "bg-emerald-status/10 text-emerald-status",
  rejected: "bg-coral-alert/10 text-coral-alert",
  draft: "bg-slate-custom/10 text-slate-custom",
  business: "bg-signal-blue/10 text-signal-blue",
  promoter: "bg-emerald-status/10 text-emerald-status",
  open: "bg-signal-blue/10 text-signal-blue",
  archived: "bg-amber-tag/10 text-amber-tag",
};

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-badges text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
