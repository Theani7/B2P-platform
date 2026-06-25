export type ScoreBreakdown = {
  niche: number;
  location: number;
  followers: number;
  experience: number;
  engagement: number;
};

export type MatchResultPromoter = {
  id: string;
  username: string;
  headline: string | null;
  avatar_url: string | null;
  niche: string;
  location: string | null;
  followers_count: number;
  engagement_rate: number;
  years_experience: number | null;
  verified: boolean;
};

export type MatchResultRead = {
  id: string;
  campaign_id: string;
  promoter: MatchResultPromoter;
  score: number;
  classification: "EXCELLENT_MATCH" | "GOOD_MATCH" | "AVERAGE_MATCH" | "LOW_MATCH";
  score_breakdown: ScoreBreakdown;
  created_at: string;
  explanation: string;
};

export type MatchResultListResponse = {
  items: MatchResultRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type MatchGenerateResponse = {
  success: boolean;
  message: string;
  total_matches: number;
};
