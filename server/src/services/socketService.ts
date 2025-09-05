import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../utils/auth';
import { User, ConversationParticipant } from '../models';
import { SocketUser } from '../types';

interface ServerToClientEvents {
  message: (message: any) => void;
  comment: (comment: any) => void;
  typing: (data: { user: any; isTyping: boolean }) => void;
  userOnline: (user: any) => void;
  userOffline: (user: any) => void;
  userStatusUpdate: (data: { userId: number; isOnline: boolean; lastSeen: Date }) => void;
  conversationUpdated: (conversation: any) => void;
  messageRead: (data: { messageId: number; userId: number }) => void;
  messageStatus: (data: { messageId: number; status: 'sent' | 'delivered' | 'read' }) => void;
}

interface ClientToServerEvents {
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  sendMessage: (data: { conversationId: number; content: string; messageType?: string }) => void;
  sendComment: (data: { messageId: number; content: string }) => void;
  typing: (data: { conversationId: number; isTyping: boolean }) => void;
  markAsRead: (messageId: number) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  user: SocketUser;
}

class SocketService {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private connectedUsers: Map<number, string> = new Map(); // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = verifyToken(token);
        const user = await User.findByPk(decoded.userId, {
          attributes: { exclude: ['password'] }
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data.user = {
          id: user.id,
          username: user.username,
          socket_id: socket.id
        };

        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      console.log(`User ${user.username} connected with socket ${socket.id}`);

      // Store user connection
      this.connectedUsers.set(user.id, socket.id);

      // Update user online status
      this.updateUserOnlineStatus(user.id, true);

      // Notify other users that this user is online
      socket.broadcast.emit('userOnline', { id: user.id, username: user.username });

      // Handle joining conversation
      socket.on('joinConversation', async (conversationId) => {
        try {
          console.log(`User ${user.username} attempting to join conversation ${conversationId}`);
          const participant = await ConversationParticipant.findOne({
            where: { conversation_id: conversationId, user_id: user.id }
          });

          if (participant) {
            socket.join(`conversation_${conversationId}`);
            console.log(`User ${user.username} successfully joined conversation ${conversationId}`);
          } else {
            console.log(`User ${user.username} is not a participant in conversation ${conversationId}`);
          }
        } catch (error) {
          console.error('Error joining conversation:', error);
        }
      });

      // Handle leaving conversation
      socket.on('leaveConversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${user.username} left conversation ${conversationId}`);
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        socket.to(`conversation_${data.conversationId}`).emit('typing', {
          user: { id: user.id, username: user.username },
          isTyping: data.isTyping
        });
      });

      // Handle marking messages as read
      socket.on('markAsRead', async (messageId) => {
        try {
          // Emit to conversation participants
          const message = await require('../models').Message.findByPk(messageId);
          if (message) {
            socket.to(`conversation_${message.conversation_id}`).emit('messageRead', {
              messageId,
              userId: user.id
            });
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${user.username} disconnected`);
        
        // Remove user connection
        this.connectedUsers.delete(user.id);

        // Update user offline status
        this.updateUserOnlineStatus(user.id, false);

        // Notify other users that this user is offline
        socket.broadcast.emit('userOffline', { id: user.id, username: user.username });
      });
    });
  }

  private async updateUserOnlineStatus(userId: number, isOnline: boolean) {
    try {
      const updateData: any = { 
        is_online: isOnline,
        last_seen: new Date()
      };

      await User.update(updateData, { where: { id: userId } });

      // Emit user status update to all connected users
      this.io.emit('userStatusUpdate', {
        userId,
        isOnline,
        lastSeen: updateData.last_seen
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  // Method to emit new message to conversation participants
  public emitNewMessage(conversationId: number, message: any) {
    console.log(`Emitting message ${message.id} to conversation ${conversationId}`);
    this.io.to(`conversation_${conversationId}`).emit('message', message);
  }

  // Method to emit conversation updates
  public emitConversationUpdate(conversationId: number, conversation: any) {
    this.io.to(`conversation_${conversationId}`).emit('conversationUpdated', conversation);
  }

  // Method to emit message read status
  public emitMessageRead(messageId: number, userId: number) {
    this.io.emit('messageRead', { messageId, userId });
  }

  // Method to emit new comment
  public emitNewComment(conversationId: number, comment: any) {
    this.io.to(`conversation_${conversationId}`).emit('comment', comment);
  }

  // Method to emit message status (sent, delivered, read)
  public emitMessageStatus(messageId: number, status: 'sent' | 'delivered' | 'read', conversationId?: number) {
    if (conversationId) {
      this.io.to(`conversation_${conversationId}`).emit('messageStatus', { messageId, status });
    } else {
      this.io.emit('messageStatus', { messageId, status });
    }
  }

  // Method to get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Method to check if user is online
  public isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  // Method to get user's socket ID
  public getUserSocketId(userId: number): string | undefined {
    return this.connectedUsers.get(userId);
  }
}

export default SocketService;
