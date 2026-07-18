import { Badge } from "@/components/ui/Card";
import { CampaignStatus, type CampaignRead } from "@/features/campaigns/types";

const tone: Record<CampaignStatus, "slate" | "signal" | "emerald" | "coral" | "amber"> = {
  [CampaignStatus.DRAFT]: "slate",
  [CampaignStatus.OPEN]: "signal",
  [CampaignStatus.ACTIVE]: "emerald",
  [CampaignStatus.COMPLETED]: "emerald",
  [CampaignStatus.ARCHIVED]: "amber",
  [CampaignStatus.CANCELLED]: "coral",
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge tone={tone[status]}>{status}</Badge>;
}

export function formatBudget(n: number) {
  return `$${n.toLocaleString()}`;
}

export function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export const campaignStatuses: CampaignStatus[] = [
  CampaignStatus.DRAFT,
  CampaignStatus.OPEN,
  CampaignStatus.ACTIVE,
  CampaignStatus.COMPLETED,
  CampaignStatus.ARCHIVED,
  CampaignStatus.CANCELLED,
];

export type { CampaignRead };
