import React from "react";

type BadgeVariant =
  | "active"
  | "verified"
  | "pending"
  | "completed"
  | "rejected"
  | "draft"
  | "business"
  | "promoter";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: "bg-brand-purple-50 text-brand-purple-900",
  verified: "bg-brand-teal-50 text-brand-teal-900",
  pending: "bg-brand-amber-50 text-brand-amber-900",
  completed: "bg-green-50 text-green-800",
  rejected: "bg-brand-coral-50 text-brand-coral-900",
  draft: "bg-stone-100 text-stone-900",
  business: "bg-brand-purple-50 text-brand-purple-900",
  promoter: "bg-brand-teal-50 text-brand-teal-900",
};

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}