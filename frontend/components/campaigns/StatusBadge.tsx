import { CampaignStatus, type CampaignRead } from "@/features/campaigns/types";

const statusConfig: Record<CampaignStatus, { bg: string; text: string; dot: string }> = {
  [CampaignStatus.DRAFT]: {
    bg: "bg-steel/10",
    text: "text-steel",
    dot: "bg-steel",
  },
  [CampaignStatus.OPEN]: {
    bg: "bg-signal-blue/10",
    text: "text-signal-blue",
    dot: "bg-signal-blue",
  },
  [CampaignStatus.ACTIVE]: {
    bg: "bg-emerald-status/10",
    text: "text-emerald-status",
    dot: "bg-emerald-status",
  },
  [CampaignStatus.COMPLETED]: {
    bg: "bg-emerald-status/10",
    text: "text-emerald-status",
    dot: "bg-emerald-status",
  },
  [CampaignStatus.ARCHIVED]: {
    bg: "bg-amber-tag/15",
    text: "text-amber-tag",
    dot: "bg-amber-tag",
  },
  [CampaignStatus.CANCELLED]: {
    bg: "bg-coral-alert/10",
    text: "text-coral-alert",
    dot: "bg-coral-alert",
  },
};

export function StatusBadge({ status, className = "" }: { status: CampaignStatus; className?: string }) {
  const cfg = statusConfig[status] || statusConfig[CampaignStatus.DRAFT];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${cfg.bg} ${cfg.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span>{status}</span>
    </span>
  );
}

export function formatBudget(n: number) {
  if (n == null) return "Rs. 0";
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(n);
  return `Rs. ${formatted}`;
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
