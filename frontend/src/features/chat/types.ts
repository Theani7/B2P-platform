export type MessageType = "TEXT" | "IMAGE" | "SYSTEM";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_avatar?: string;
  message: string;
  message_type: MessageType;
  edited_at: string | null;
  read_at: string | null;
  created_at: string;
  is_deleted: boolean;
}

export interface Conversation {
  id: string;
  collaboration_id: string;
  created_at: string;
  updated_at: string;
  unread_count: number;
  last_message?: Message;
  participants: { id: string; name: string; avatar: string; role: string }[];
}

export interface WebSocketMessage {
  type: "MESSAGE" | "TYPING_START" | "TYPING_STOP" | "READ_RECEIPT";
  payload: any;
}
