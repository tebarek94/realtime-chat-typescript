import { io, Socket } from 'socket.io-client';
import { SocketEvents, MessageWithSender, CommentWithSender, User } from '../types';

class SocketService {
  private socket: Socket<SocketEvents, SocketEvents> | null = null;
  private token: string | null = null;
  private activeConversations: Set<number> = new Set();

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.token = token;
    const serverURL = 'http://localhost:5000'

    this.socket = io(serverURL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      // Rejoin any active conversations
      this.rejoinActiveConversations();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    (this.socket as any).on('reconnect', (attemptNumber: number) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });

    (this.socket as any).on('reconnect_error', (error: Error) => {
      console.error('Reconnection error:', error);
    });

    (this.socket as any).on('reconnect_failed', () => {
      console.error('Failed to reconnect to server');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.activeConversations.clear();
    }
  }

  // Conversation events
  joinConversation(conversationId: number): void {
    if (this.socket) {
      this.socket.emit('joinConversation', conversationId);
      this.activeConversations.add(conversationId);
    }
  }

  leaveConversation(conversationId: number): void {
    if (this.socket) {
      this.socket.emit('leaveConversation', conversationId);
      this.activeConversations.delete(conversationId);
    }
  }

  private rejoinActiveConversations(): void {
    this.activeConversations.forEach(conversationId => {
      this.joinConversation(conversationId);
    });
  }

  // Message events
  sendMessage(data: { conversationId: number; content: string; messageType?: string }): void {
    if (this.socket) {
      this.socket.emit('sendMessage', data);
    }
  }

  // Comment events
  sendComment(data: { messageId: number; content: string }): void {
    if (this.socket) {
      this.socket.emit('sendComment', data);
    }
  }

  // Typing events
  startTyping(conversationId: number): void {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, isTyping: true });
    }
  }

  stopTyping(conversationId: number): void {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, isTyping: false });
    }
  }

  // Read receipt events
  markAsRead(messageId: number): void {
    if (this.socket) {
      this.socket.emit('markAsRead', messageId);
    }
  }

  // Event listeners
  onMessage(callback: (message: MessageWithSender) => void): void {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }

  onComment(callback: (comment: CommentWithSender) => void): void {
    if (this.socket) {
      this.socket.on('comment', callback);
    }
  }

  onTyping(callback: (data: { user: User; isTyping: boolean }) => void): void {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onUserOnline(callback: (user: User) => void): void {
    if (this.socket) {
      this.socket.on('userOnline', callback);
    }
  }

  onUserOffline(callback: (user: User) => void): void {
    if (this.socket) {
      this.socket.on('userOffline', callback);
    }
  }

  onConversationUpdated(callback: (conversation: any) => void): void {
    if (this.socket) {
      this.socket.on('conversationUpdated', callback);
    }
  }

  onMessageRead(callback: (data: { messageId: number; userId: number }) => void): void {
    if (this.socket) {
      this.socket.on('messageRead', callback);
    }
  }

  onMessageStatus(callback: (data: { messageId: number; status: 'sent' | 'delivered' | 'read' }) => void): void {
    if (this.socket) {
      this.socket.on('messageStatus', callback);
    }
  }

  onUserStatusUpdate(callback: (data: { userId: number; isOnline: boolean; lastSeen: Date }) => void): void {
    if (this.socket) {
      this.socket.on('userStatusUpdate', callback);
    }
  }

  // Remove event listeners
  offMessage(callback?: (message: MessageWithSender) => void): void {
    if (this.socket) {
      this.socket.off('message', callback);
    }
  }

  offComment(callback?: (comment: CommentWithSender) => void): void {
    if (this.socket) {
      this.socket.off('comment', callback);
    }
  }

  offTyping(callback?: (data: { user: User; isTyping: boolean }) => void): void {
    if (this.socket) {
      this.socket.off('userTyping', callback);
    }
  }

  offUserOnline(callback?: (user: User) => void): void {
    if (this.socket) {
      this.socket.off('userOnline', callback);
    }
  }

  offUserOffline(callback?: (user: User) => void): void {
    if (this.socket) {
      this.socket.off('userOffline', callback);
    }
  }

  offConversationUpdated(callback?: (conversation: any) => void): void {
    if (this.socket) {
      this.socket.off('conversationUpdated', callback);
    }
  }

  offMessageRead(callback?: (data: { messageId: number; userId: number }) => void): void {
    if (this.socket) {
      this.socket.off('messageRead', callback);
    }
  }

  offMessageStatus(callback?: (data: { messageId: number; status: 'sent' | 'delivered' | 'read' }) => void): void {
    if (this.socket) {
      this.socket.off('messageStatus', callback);
    }
  }

  offUserStatusUpdate(callback?: (data: { userId: number; isOnline: boolean; lastSeen: Date }) => void): void {
    if (this.socket) {
      this.socket.off('userStatusUpdate', callback);
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket<SocketEvents, SocketEvents> | null {
    return this.socket;
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'reconnecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.disconnected) return 'disconnected';
    return 'reconnecting';
  }

  getActiveConversations(): number[] {
    return Array.from(this.activeConversations);
  }
}

// Create and export a singleton instance
export const socketService = new SocketService();
export default socketService;
