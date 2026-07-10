export interface BusinessProfileRead {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  description?: string;
  location?: string;
  website?: string;
  logo_url?: string;
  company_size?: string;
  created_at: string;
  updated_at: string;
}

export interface PromoterProfileRead {
  id: string;
  user_id: string;
  username: string;
  headline?: string;
  bio?: string;
  niche: string;
  location?: string;
  avatar_url?: string;
  followers_count: number;
  engagement_rate: number;
  years_experience?: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}