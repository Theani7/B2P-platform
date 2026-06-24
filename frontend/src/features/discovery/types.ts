export interface PromoterDirectoryItem {
  id: string;
  user_id: string;
  username: string;
  headline?: string | null;
  niche: string;
  location?: string | null;
  avatar_url?: string | null;
  followers_count: number;
  engagement_rate: number;
  years_experience?: number | null;
  verified: boolean;
  created_at: string;
}

export interface PromoterDirectoryResponse {
  items: PromoterDirectoryItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PortfolioItemRead {
  id: string;
  promoter_profile_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  external_link?: string | null;
  created_at: string;
}

export interface SocialLinkRead {
  id: string;
  promoter_profile_id: string;
  platform: string;
  url: string;
  created_at: string;
}

export interface PromoterPublicProfile {
  id: string;
  user_id: string;
  username: string;
  headline?: string | null;
  bio?: string | null;
  niche: string;
  location?: string | null;
  avatar_url?: string | null;
  followers_count: number;
  engagement_rate: number;
  years_experience?: number | null;
  verified: boolean;
  portfolio_items: PortfolioItemRead[];
  social_links: SocialLinkRead[];
  created_at: string;
  updated_at: string;
}

export interface SavedPromoterRead {
  id: string;
  business_profile_id: string;
  promoter_profile_id: string;
  promoter: PromoterDirectoryItem;
  created_at: string;
}

export interface DirectorySearchParams {
  search?: string;
  niche?: string;
  location?: string;
  verified?: boolean;
  followers_min?: number;
  followers_max?: number;
  experience_min?: number;
  experience_max?: number;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}
