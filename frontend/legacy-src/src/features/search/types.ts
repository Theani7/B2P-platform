export interface SearchQuery {
  q: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  metadata?: any;
  type: string;
  url: string;
  score?: number;
}

export interface SearchResponse {
  campaigns: SearchResultItem[];
  promoters: SearchResultItem[];
  businesses: SearchResultItem[];
  collaborations: SearchResultItem[];
  messages: SearchResultItem[];
  users: SearchResultItem[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  created_at: string;
}
