export interface AnalyticsMetadata {
  generated_at: string;
  period: string;
}

export interface BusinessAnalyticsResponse {
  summary: {
    total_campaigns: number;
    active_campaigns: number;
    completed_campaigns: number;
    draft_campaigns: number;
    total_applications: number;
    accepted_applications: number;
    rejected_applications: number;
    pending_applications: number;
    active_collaborations: number;
    completed_collaborations: number;
    saved_promoters: number;
    average_campaign_match_score: number;
  };
  charts: {
    monthly_campaign_creation: { month: string; value: number }[];
    monthly_applications: { month: string; value: number }[];
    monthly_collaborations: { month: string; value: number }[];
    top_campaigns_by_applications: { name: string; value: number }[];
    applications_per_campaign: { name: string; value: number }[];
    application_status_distribution: { name: string; value: number }[];
  };
  growth: {
    campaign_growth: number;
    application_growth: number;
    collaboration_growth: number;
  };
  recent: Record<string, any>;
  metadata: AnalyticsMetadata;
}

export interface PromoterAnalyticsResponse {
  summary: {
    profile_views: number;
    applications_submitted: number;
    accepted_applications: number;
    pending_applications: number;
    rejected_applications: number;
    invitations_received: number;
    invitations_accepted: number;
    invitations_pending: number;
    active_collaborations: number;
    completed_collaborations: number;
    average_rating: number;
    reviews_received: number;
    recommendation_percent: number;
    portfolio_items: number;
    profile_completion: number;
  };
  charts: {
    monthly_applications: { month: string; value: number }[];
    monthly_collaborations: { month: string; value: number }[];
    monthly_reviews: { month: string; value: number }[];
    invitation_acceptance_trend: { month: string; value: number }[];
    application_success_trend: { month: string; value: number }[];
    rating_trend: { month: string; value: number }[];
    category_breakdown: { name: string; value: number }[];
  };
  growth: {
    application_growth: number;
    collaboration_growth: number;
  };
  recent: Record<string, any>;
  metadata: AnalyticsMetadata;
}

export interface AdminAnalyticsResponse {
  summary: {
    users: number;
    businesses: number;
    promoters: number;
    campaigns: number;
    applications: number;
    collaborations: number;
    reviews: number;
    active_users: number;
    verified_users: number;
  };
  charts: {
    monthly_registrations: { month: string; value: number }[];
    monthly_campaigns: { month: string; value: number }[];
    monthly_collaborations: { month: string; value: number }[];
    monthly_reviews: { month: string; value: number }[];
    top_businesses: { name: string; value: number }[];
    top_promoters: { name: string; value: number }[];
    platform_growth: { month: string; value: number }[];
    role_distribution: { name: string; value: number }[];
  };
  growth: {
    user_growth: number;
    campaign_growth: number;
    collaboration_growth: number;
  };
  recent: Record<string, any>;
  metadata: AnalyticsMetadata;
}
