export type NotificationType = 
  | "APPLICATION_RECEIVED" 
  | "APPLICATION_ACCEPTED" 
  | "APPLICATION_REJECTED" 
  | "INVITATION_RECEIVED" 
  | "INVITATION_ACCEPTED" 
  | "INVITATION_DECLINED" 
  | "NEW_MESSAGE" 
  | "REVIEW_RECEIVED" 
  | "COLLABORATION_STARTED" 
  | "COLLABORATION_COMPLETED" 
  | "CAMPAIGN_MATCH_READY" 
  | "SYSTEM";

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  metadata: any | null;
  created_at: string;
}

export interface UnreadCountResponse {
  count: number;
}
