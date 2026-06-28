export type ReviewerInfo = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
};

export type ReviewRead = {
  id: string;
  collaboration_id: string;
  reviewer: ReviewerInfo;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewListResponse = {
  items: ReviewRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type RatingDistribution = {
  star_1: number;
  star_2: number;
  star_3: number;
  star_4: number;
  star_5: number;
};

export type RatingSummary = {
  average_rating: number;
  total_reviews: number;
  distribution: RatingDistribution;
};

export type ReceivedReviewRead = {
  id: string;
  collaboration_id: string;
  reviewer: ReviewerInfo;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  business_name: string;
  campaign_title: string;
};

export type ReceivedReviewListResponse = {
  items: ReceivedReviewRead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};
