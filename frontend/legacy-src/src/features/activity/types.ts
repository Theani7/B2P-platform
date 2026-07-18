export interface ActivityLog {
  id: string;
  actor_id: string;
  actor_role: string;
  entity_type: string;
  entity_id: string;
  action: string;
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
  actor_name?: string;
  actor_avatar?: string;
}

export interface ActivityResponse {
  items: ActivityLog[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ActivityFilters {
  page?: number;
  size?: number;
  entity_type?: string;
  action?: string;
}
