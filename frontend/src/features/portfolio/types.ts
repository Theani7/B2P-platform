export interface PortfolioMedia {
  id: string;
  portfolio_item_id: string;
  file_path: string;
  media_type: "image" | "video";
  display_order: number;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  promoter_profile_id: string;
  title: string;
  client_name: string | null;
  campaign_type: string | null;
  description: string | null;
  cover_image: string | null;
  featured: boolean;
  views: number;
  likes: number;
  engagement_rate: number | null;
  platforms: string[];
  tags: string[];
  media: PortfolioMedia[];
  created_at: string;
  updated_at: string;
}

export interface PortfolioItemCreate {
  title: string;
  client_name?: string;
  campaign_type?: string;
  description?: string;
  cover_image?: string;
  featured?: boolean;
  views?: number;
  likes?: number;
  engagement_rate?: number;
  platforms?: string[];
  tags?: string[];
}

export interface PortfolioItemUpdate extends Partial<PortfolioItemCreate> {}
