export enum CampaignStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
  CANCELLED = "CANCELLED",
}

export enum CampaignVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export interface CampaignRead {
  id: string;
  businessProfileId: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  targetAudience?: string | null;
  requirements?: string | null;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  visibility: CampaignVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignCreatePayload {
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  targetAudience?: string | null;
  requirements?: string | null;
  startDate: string;
  endDate: string;
  visibility?: CampaignVisibility;
  status?: CampaignStatus;
}

export type CampaignUpdatePayload = Partial<CampaignCreatePayload>;

export interface CampaignListRead {
  items: CampaignRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CampaignDashboardStats {
  total_campaigns: number;
  open_campaigns: number;
  active_campaigns: number;
  completed_campaigns: number;
  draft_campaigns?: number;
  recent_campaigns: { id: string; title: string; status: CampaignStatus; budget: number; created_at: string }[];
}
