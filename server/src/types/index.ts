// Type definitions for the chat application

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Conversation {
  id: number;
  name?: string;
  type: 'direct' | 'group';
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationParticipant {
  id: number;
  conversation_id: number;
  user_id: number;
  joined_at: Date;
  left_at?: Date;
  is_admin: boolean;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_edited: boolean;
  edited_at?: Date;
  is_deleted: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MessageRead {
  id: number;
  message_id: number;
  user_id: number;
  read_at: Date;
}

export interface TypingIndicator {
  id: number;
  conversation_id: number;
  user_id: number;
  is_typing: boolean;
  updated_at: Date;
}

// Request/Response types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface CreateConversationRequest {
  type: 'direct' | 'group';
  name?: string;
  participant_ids: number[];
}

export interface SendMessageRequest {
  conversation_id: number;
  content: string;
  message_type?: 'text' | 'image' | 'file';
}

export interface SocketUser {
  id: number;
  username: string;
  socket_id: string;
}

// Extended types for API responses
export interface ConversationWithParticipants extends Conversation {
  participants: (ConversationParticipant & { user: Omit<User, 'password'> })[];
  last_message?: Message & { sender: Omit<User, 'password'> };
  unread_count?: number;
}

export interface MessageWithSender extends Message {
  sender: Omit<User, 'password'>;
  read_by: (MessageRead & { user: Omit<User, 'password'> })[];
}

// JWT Payload
export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
}
