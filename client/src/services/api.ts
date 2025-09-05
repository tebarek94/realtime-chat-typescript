import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  ConversationWithParticipants, 
  CreateConversationRequest, 
  MessageWithSender, 
  SendMessageRequest,
  SendCommentRequest,
  CommentWithSender,
  ApiResponse,
  PaginatedResponse
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // Conversation methods
  async getConversations(search?: string): Promise<ConversationWithParticipants[]> {
    const endpoint = search ? `/conversations?search=${encodeURIComponent(search)}` : '/conversations';
    return this.request<ConversationWithParticipants[]>(endpoint);
  }

  async getConversation(id: number): Promise<ConversationWithParticipants> {
    return this.request<ConversationWithParticipants>(`/conversations/${id}`);
  }

  async createConversation(data: CreateConversationRequest): Promise<ConversationWithParticipants> {
    return this.request<ConversationWithParticipants>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrCreateDirectConversation(userId: number): Promise<ConversationWithParticipants> {
    return this.request<ConversationWithParticipants>(`/conversations/direct/${userId}`);
  }

  async updateConversation(id: number, data: { name?: string }): Promise<ConversationWithParticipants> {
    return this.request<ConversationWithParticipants>(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addParticipant(conversationId: number, userId: number): Promise<void> {
    return this.request<void>(`/conversations/${conversationId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async removeParticipant(conversationId: number, userId: number): Promise<void> {
    return this.request<void>(`/conversations/${conversationId}/participants`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  // Message methods
  async getMessages(conversationId: number, page: number = 1, limit: number = 50, before?: string): Promise<PaginatedResponse<MessageWithSender>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (before) {
      params.append('before', before);
    }
    
    return this.request<PaginatedResponse<MessageWithSender>>(
      `/messages/conversation/${conversationId}?${params.toString()}`
    );
  }

  async sendMessage(data: SendMessageRequest): Promise<MessageWithSender> {
    return this.request<MessageWithSender>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async editMessage(messageId: number, content: string): Promise<MessageWithSender> {
    return this.request<MessageWithSender>(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(messageId: number): Promise<void> {
    return this.request<void>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async markAsRead(messageId: number): Promise<void> {
    return this.request<void>(`/messages/${messageId}/read`, {
      method: 'POST',
    });
  }

  async markConversationAsRead(conversationId: number): Promise<void> {
    return this.request<void>(`/messages/conversation/${conversationId}/read`, {
      method: 'POST',
    });
  }

  // User methods
  async getUsers(search?: string): Promise<User[]> {
    const endpoint = search ? `/auth/users?search=${encodeURIComponent(search)}` : '/auth/users';
    return this.request<User[]>(endpoint);
  }

  async getUserById(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  // Comment methods
  async getComments(messageId: number): Promise<CommentWithSender[]> {
    return this.request<CommentWithSender[]>(`/messages/${messageId}/comments`);
  }

  async sendComment(data: SendCommentRequest): Promise<CommentWithSender> {
    return this.request<CommentWithSender>('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async editComment(commentId: number, content: string): Promise<CommentWithSender> {
    return this.request<CommentWithSender>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: number): Promise<void> {
    return this.request<void>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Search methods
  async searchMessages(conversationId: number, query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<MessageWithSender>> {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString()
    });
    
    return this.request<PaginatedResponse<MessageWithSender>>(
      `/messages/conversation/${conversationId}/search?${params.toString()}`
    );
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Check if token is valid
  isTokenValid(): boolean {
    if (!this.token) return false;
    
    try {
      // Basic JWT token validation (check if it's not expired)
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
