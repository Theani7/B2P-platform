import { CampaignStatus } from "../features/campaigns/types";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  OPEN: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  ACTIVE: { bg: "bg-brand-teal-50", text: "text-brand-teal-900", dot: "bg-brand-teal" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  ARCHIVED: { bg: "bg-brand-amber-50", text: "text-brand-amber-900", dot: "bg-brand-amber" },
  CANCELLED: { bg: "bg-brand-coral-50", text: "text-brand-coral-900", dot: "bg-brand-coral" },
};

interface StatusBadgeProps {
  status: CampaignStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
