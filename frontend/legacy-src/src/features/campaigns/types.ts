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
  business_profile_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  target_audience?: string | null;
  requirements?: string | null;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  visibility: CampaignVisibility;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreatePayload {
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  target_audience?: string | null;
  requirements?: string | null;
  start_date: string;
  end_date: string;
  visibility?: CampaignVisibility;
  status?: CampaignStatus;
}

export interface CampaignUpdatePayload {
  title?: string;
  description?: string;
  category?: string;
  budget?: number;
  location?: string;
  target_audience?: string | null;
  requirements?: string | null;
  start_date?: string;
  end_date?: string;
  visibility?: CampaignVisibility;
  status?: CampaignStatus;
}

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
  recent_campaigns: {
    id: string;
    title: string;
    status: CampaignStatus;
    budget: number;
    created_at: string;
  }[];
}
