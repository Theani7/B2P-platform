export type DashboardStats = {
  total_users: number;
  total_businesses: number;
  total_promoters: number;
  verified_promoters: number;
  total_campaigns: number;
  total_applications: number;
  total_collaborations: number;
  total_reviews: number;
  average_rating: number;
  open_verification_requests: number;
};

export type AdminUserRead = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at: string | null;
  has_business_profile: boolean;
  has_promoter_profile: boolean;
};

export type AdminUserListResponse = {
  items: AdminUserRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type VerificationRequestRead = {
  id: string;
  promoter_profile_id: string | null;
  business_profile_id: string | null;
  requester_name: string;
  requester_headline: string | null;
  requester_type: string;
  profile_data: Record<string, any> | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
};

export type VerificationRequestListResponse = {
  items: VerificationRequestRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type AdminCampaignRead = {
  id: string;
  title: string;
  business_company_name: string;
  category: string;
  budget: number;
  location: string;
  status: string;
  visibility: string;
  created_at: string;
};

export type AdminCampaignListResponse = {
  items: AdminCampaignRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type AdminReviewRead = {
  id: string;
  collaboration_id: string;
  reviewer_username: string;
  reviewee_username: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type AdminReviewListResponse = {
  items: AdminReviewRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type AuditLogRead = {
  id: string;
  user_id: string | null;
  username: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  extra_data: Record<string, unknown> | null;
  created_at: string;
};

export type AuditLogListResponse = {
  items: AuditLogRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type PlatformSettingRead = {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  updated_at: string;
};

export type PlatformSettingListResponse = {
  items: PlatformSettingRead[];
};

export type AnalyticsData = {
  total_users: number;
  total_businesses: number;
  total_promoters: number;
  verified_promoters: number;
  total_campaigns: number;
  total_applications: number;
  total_collaborations: number;
  total_reviews: number;
  acceptance_rate: number;
  average_rating: number;
  top_niches: Record<string, number>;
  top_locations: Record<string, number>;
  top_rated_promoters: Record<string, unknown>[];
  top_businesses: Record<string, unknown>[];
  most_active_promoters: Record<string, unknown>[];
  most_active_businesses: Record<string, unknown>[];
};
