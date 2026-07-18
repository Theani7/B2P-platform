import React from "react";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  DRAFT: { bg: "bg-sky-wash", text: "text-fog", dot: "bg-ash" },
  OPEN: { bg: "bg-sky-wash", text: "text-signal-blue", dot: "bg-signal-blue" },
  ACTIVE: { bg: "bg-emerald-status/10", text: "text-emerald-status", dot: "bg-emerald-status" },
  COMPLETED: { bg: "bg-emerald-status/10", text: "text-emerald-status", dot: "bg-emerald-status" },
  ARCHIVED: { bg: "bg-amber-tag/10", text: "text-amber-tag", dot: "bg-amber-tag" },
  CANCELLED: { bg: "bg-coral-alert/10", text: "text-coral-alert", dot: "bg-coral-alert" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-badges text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
