// Frontend TypeScript types for the chat application

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  name?: string;
  type: 'direct' | 'group';
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: number;
  conversation_id: number;
  user_id: number;
  joined_at: string;
  left_at?: string;
  is_admin: boolean;
  user: User;
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
  edited_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageWithSender extends Message {
  sender: User;
  read_by: MessageRead[];
  comments?: CommentWithSender[];
}

export interface MessageRead {
  id: number;
  message_id: number;
  user_id: number;
  read_at: string;
  user: User;
}

export interface Comment {
  id: number;
  message_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithSender extends Comment {
  sender: User;
}

export interface ConversationWithParticipants extends Conversation {
  participants: ConversationParticipant[];
  last_message?: MessageWithSender;
  unread_count?: number;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
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

export interface SendCommentRequest {
  message_id: number;
  content: string;
}

// Socket.IO event types
export interface SocketEvents {
  // Client to Server
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  sendMessage: (data: { conversationId: number; content: string; messageType?: string }) => void;
  sendComment: (data: { messageId: number; content: string }) => void;
  typing: (data: { conversationId: number; isTyping: boolean }) => void;
  markAsRead: (messageId: number) => void;

  // Server to Client
  message: (message: MessageWithSender) => void;
  comment: (comment: CommentWithSender) => void;
  userTyping: (data: { user: User; isTyping: boolean }) => void;
  userOnline: (user: User) => void;
  userOffline: (user: User) => void;
  userStatusUpdate: (data: { userId: number; isOnline: boolean; lastSeen: Date }) => void;
  conversationUpdated: (conversation: ConversationWithParticipants) => void;
  messageRead: (data: { messageId: number; userId: number }) => void;
  messageStatus: (data: { messageId: number; status: 'sent' | 'delivered' | 'read' }) => void;
}

// UI State types
export interface ChatState {
  conversations: ConversationWithParticipants[];
  currentConversation: ConversationWithParticipants | null;
  messages: MessageWithSender[];
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface TypingUser {
  user: User;
  isTyping: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name?: string;
  last_name?: string;
}

export interface MessageFormData {
  content: string;
}

export interface CreateGroupFormData {
  name: string;
  participant_ids: number[];
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
