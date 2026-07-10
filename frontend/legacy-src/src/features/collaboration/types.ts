export enum ApplicationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum CollaborationStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum DeliverableStatus {
  DRAFT = "DRAFT",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REVISION_REQUESTED = "REVISION_REQUESTED",
  PUBLISHED = "PUBLISHED",
}

export interface Deliverable {
  id: string;
  collaboration_id: string;
  title: string;
  description?: string;
  content_url: string;
  status: DeliverableStatus;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliverableCreate {
  title: string;
  description?: string;
  content_url: string;
}

export interface DeliverableReview {
  status: DeliverableStatus;
  feedback?: string;
}

export interface CampaignMarketplaceItem {
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
  created_at: string;
  business_name: string;
  has_applied?: boolean;
}

export interface CampaignMarketplaceResponse {
  items: CampaignMarketplaceItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CampaignApplicationWithCampaign {
  id: string;
  campaign_id: string;
  promoter_profile_id: string;
  message?: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  campaign_title: string;
  campaign_category: string;
  campaign_budget: number;
  campaign_location: string;
  campaign_status: string;
}

export interface CampaignApplicationFullRead {
  id: string;
  campaign_id: string;
  promoter_profile_id: string;
  message?: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  promoter_username: string;
  promoter_avatar_url?: string | null;
  campaign_title: string;
}

export interface CampaignApplicationWithPromoter {
  id: string;
  campaign_id: string;
  promoter_profile_id: string;
  message?: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  promoter_username: string;
  promoter_headline?: string | null;
  promoter_avatar_url?: string | null;
  promoter_niche: string;
  promoter_location?: string | null;
  promoter_followers_count: number;
  promoter_engagement_rate: number;
  promoter_years_experience?: number | null;
  promoter_verified: boolean;
}

export interface CampaignApplicationListResponse {
  items: CampaignApplicationWithPromoter[] | CampaignApplicationWithCampaign[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CampaignInvitationWithCampaign {
  id: string;
  campaign_id: string;
  promoter_profile_id: string;
  message?: string | null;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
  campaign_title: string;
  campaign_category: string;
  campaign_budget: number;
  campaign_location: string;
  business_name: string;
}

export interface CampaignInvitationListResponse {
  items: CampaignInvitationWithCampaign[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CollaborationRead {
  id: string;
  campaign_id: string;
  business_profile_id: string;
  promoter_profile_id: string;
  application_id?: string | null;
  invitation_id?: string | null;
  status: CollaborationStatus;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  campaign_title: string;
  campaign_category: string;
  campaign_budget: number;
  partner_name: string;
  partner_username: string;
  partner_avatar_url?: string | null;
}

export interface CollaborationListResponse {
  items: CollaborationRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
