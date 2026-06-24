import { CampaignStatus } from "../features/campaigns/types";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-300",
  OPEN: "bg-blue-100 text-blue-700 border-blue-300",
  ACTIVE: "bg-green-100 text-green-700 border-green-300",
  COMPLETED: "bg-purple-100 text-purple-700 border-purple-300",
  ARCHIVED: "bg-yellow-100 text-yellow-700 border-yellow-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
};

interface StatusBadgeProps {
  status: CampaignStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? statusStyles.DRAFT}`}
    >
      {status}
    </span>
  );
}
