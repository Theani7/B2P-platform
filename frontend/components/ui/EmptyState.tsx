import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-cards-lg border border-dashed border-slate-custom/10 bg-white p-10 text-center">
      <h3 className="text-base font-medium text-graphite">{title}</h3>
      {description && <p className="mt-2 text-sm text-steel">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
