export interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  url: string;
  followers_count: number | null;
  is_verified: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLinkCreate {
  platform: string;
  username: string;
  url: string;
  followers_count?: number;
}

export interface SocialLinkUpdate extends Partial<SocialLinkCreate> {}

export interface SocialLinkReorder {
  link_ids: string[];
}
