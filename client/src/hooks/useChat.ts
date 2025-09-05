import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ConversationWithParticipants, 
  MessageWithSender, 
  CreateConversationRequest,
  SendMessageRequest,
  SendCommentRequest,
  CommentWithSender,
  ChatState,
  TypingUser,
  User
} from '../types';
import { apiService } from '../services/api';
import { socketService } from '../services/socket';
import { notificationService } from '../services/notification';


export const useChat = (currentUser?: User | null) => {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversation: null,
    messages: [],
    loading: false,
    error: null,
  });

  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // Set current user in notification service
  useEffect(() => {
    if (currentUser) {
      notificationService.setCurrentUser(currentUser);
    }
  }, [currentUser]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Socket event listeners
  useEffect(() => {
    const handleNewMessage = (message: MessageWithSender) => {
      console.log('Received new message via socket:', message);
      
      setState(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.messages?.some(msg => msg.id === message.id);
        if (messageExists) {
          console.log('Message already exists, skipping:', message.id);
          return prev;
        }

        // Add message to current conversation if it matches
        if (prev.currentConversation?.id === message.conversation_id) {
          console.log('Adding message to current conversation:', message.id);
          return {
            ...prev,
            messages: [...(prev.messages || []), message],
          };
        }

        // Show notification for new message (only if not from current user)
        if (message.sender_id !== currentUser?.id) {
          console.log('Showing notification for message from other user:', message.id);
          notificationService.showMessageNotification(message);
        }

        // Update conversation list with new message
        const updatedConversations = (prev.conversations || []).map(conv => {
          if (conv.id === message.conversation_id) {
            return {
              ...conv,
              last_message: message,
              updated_at: message.created_at,
            };
          }
          return conv;
        });

        console.log('Updating conversation list with new message');
        return {
          ...prev,
          conversations: updatedConversations,
        };
      });
    };

    const handleTyping = (data: { user: any; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return [...prev.filter(u => u.user.id !== data.user.id), data];
        } else {
          return prev.filter(u => u.user.id !== data.user.id);
        }
      });
    };

    const handleUserOnline = (user: any) => {
      setState(prev => ({
        ...prev,
        conversations: (prev.conversations || []).map(conv => ({
          ...conv,
          participants: (conv.participants || []).map(p => 
            p.user.id === user.id ? { ...p, user: { ...p.user, is_online: true } } : p
          ),
        })),
      }));
    };

    const handleUserOffline = (user: any) => {
      setState(prev => ({
        ...prev,
        conversations: (prev.conversations || []).map(conv => ({
          ...conv,
          participants: (conv.participants || []).map(p => 
            p.user.id === user.id ? { ...p, user: { ...p.user, is_online: false } } : p
          ),
        })),
      }));
    };

    const handleConversationUpdated = (conversation: ConversationWithParticipants) => {
      setState(prev => ({
        ...prev,
        conversations: (prev.conversations || []).map(conv => 
          conv.id === conversation.id ? conversation : conv
        ),
      }));
    };

    const handleMessageRead = (data: { messageId: number; userId: number }) => {
      setState(prev => ({
        ...prev,
        messages: (prev.messages || []).map(msg => 
          msg.id === data.messageId 
            ? { ...msg, read_by: [...(msg.read_by || []), { id: 0, message_id: data.messageId, user_id: data.userId, read_at: new Date().toISOString(), user: { id: data.userId } as any }] }
            : msg
        ),
      }));
    };

    const handleMessageStatus = (data: { messageId: number; status: 'sent' | 'delivered' | 'read' }) => {
      // Update message status in the UI if needed
      console.log(`Message ${data.messageId} status: ${data.status}`);
    };

    const handleUserStatusUpdate = (data: { userId: number; isOnline: boolean; lastSeen: Date }) => {
      setState(prev => ({
        ...prev,
        conversations: (prev.conversations || []).map(conv => ({
          ...conv,
          participants: (conv.participants || []).map(p => 
            p.user.id === data.userId 
              ? { ...p, user: { ...p.user, is_online: data.isOnline, last_seen: data.lastSeen.toISOString() } }
              : p
          ),
        })),
      }));
    };

    const handleNewComment = (comment: CommentWithSender) => {
      setState(prev => ({
        ...prev,
        messages: (prev.messages || []).map(msg => 
          msg.id === comment.message_id 
            ? { ...msg, comments: [...(msg.comments || []), comment] }
            : msg
        ),
      }));
    };

    // Set up socket listeners
    socketService.onMessage(handleNewMessage);
    socketService.onComment(handleNewComment);
    socketService.onTyping(handleTyping);
    socketService.onUserOnline(handleUserOnline);
    socketService.onUserOffline(handleUserOffline);
    socketService.onConversationUpdated(handleConversationUpdated);
    socketService.onMessageRead(handleMessageRead);
    socketService.onMessageStatus(handleMessageStatus);
    socketService.onUserStatusUpdate(handleUserStatusUpdate);

    return () => {
      socketService.offMessage(handleNewMessage);
      socketService.offComment(handleNewComment);
      socketService.offTyping(handleTyping);
      socketService.offUserOnline(handleUserOnline);
      socketService.offUserOffline(handleUserOffline);
      socketService.offConversationUpdated(handleConversationUpdated);
      socketService.offMessageRead(handleMessageRead);
      socketService.offMessageStatus(handleMessageStatus);
      socketService.offUserStatusUpdate(handleUserStatusUpdate);
    };
  }, [currentUser]);

  const loadConversations = useCallback(async (retryCount = 0) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const conversations = await apiService.getConversations();
      setState(prev => ({
        ...prev,
        conversations,
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load conversations';
      
      // Retry logic for network errors
      if (retryCount < 3 && (errorMessage.includes('Network') || errorMessage.includes('fetch'))) {
        setTimeout(() => {
          loadConversations(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const selectConversation = useCallback(async (conversationId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Leave previous conversation
      if (state.currentConversation) {
        socketService.leaveConversation(state.currentConversation.id);
      }

      // Join new conversation
      socketService.joinConversation(conversationId);

      // Load conversation details and messages
      const [conversation, messagesResponse] = await Promise.all([
        apiService.getConversation(conversationId),
        apiService.getMessages(conversationId, 1, 50),
      ]);

      setState(prev => ({
        ...prev,
        currentConversation: conversation,
        messages: messagesResponse.data || [],
        loading: false,
      }));

      // Mark conversation as read
      await apiService.markConversationAsRead(conversationId);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load conversation',
      }));
    }
  }, [state.currentConversation]);

  const createConversation = useCallback(async (conversation: ConversationWithParticipants) => {
    setState(prev => ({
      ...prev,
      conversations: [conversation, ...(prev.conversations || [])],
    }));

    // Automatically select the new conversation
    await selectConversation(conversation.id);
  }, [selectConversation]);

  const sendMessage = useCallback(async (data: SendMessageRequest) => {
    if (!state.currentConversation) {
      throw new Error('No conversation selected');
    }

    // Check socket connection
    if (!socketService.isConnected()) {
      console.warn('Socket not connected, attempting to reconnect...');
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
      }
    }

    try {
      // Send message via API first
      const message = await apiService.sendMessage(data);
      
      // Update local state immediately for optimistic UI
      setState(prev => ({
        ...prev,
        messages: [...(prev.messages || []), message],
      }));

      // Update conversation list with new message
      setState(prev => ({
        ...prev,
        conversations: (prev.conversations || []).map(conv => 
          conv.id === data.conversation_id 
            ? { ...conv, last_message: message, updated_at: message.created_at }
            : conv
        ),
      }));

      console.log('Message sent successfully:', message);
      return message;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send message';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      
      // Show user-friendly error notification
      console.error('Send message error:', error);
      throw new Error(errorMessage);
    }
  }, [state.currentConversation]);

  const startTyping = useCallback((conversationId: number) => {
    socketService.startTyping(conversationId);
    
    // Clear existing timeout
    if (typingTimeoutRef.current[conversationId]) {
      clearTimeout(typingTimeoutRef.current[conversationId]);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current[conversationId] = setTimeout(() => {
      socketService.stopTyping(conversationId);
    }, 3000);
  }, []);

  const stopTyping = useCallback((conversationId: number) => {
    socketService.stopTyping(conversationId);
    
    if (typingTimeoutRef.current[conversationId]) {
      clearTimeout(typingTimeoutRef.current[conversationId]);
      delete typingTimeoutRef.current[conversationId];
    }
  }, []);

  const markAsRead = useCallback(async (messageId: number) => {
    try {
      await apiService.markAsRead(messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }, []);

  const sendComment = useCallback(async (data: SendCommentRequest) => {
    try {
      const comment = await apiService.sendComment(data);
      
      // Update messages with new comment
      setState(prev => ({
        ...prev,
        messages: (prev.messages || []).map(msg => 
          msg.id === data.message_id 
            ? { ...msg, comments: [...(msg.comments || []), comment] }
            : msg
        ),
      }));

      // Also send via socket for real-time delivery
      socketService.sendComment({
        messageId: data.message_id,
        content: data.content,
      });

      return comment;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to send comment',
      }));
      throw error;
    }
  }, []);

  const loadMoreMessages = useCallback(async (conversationId: number) => {
    if (!state.currentConversation || state.currentConversation.id !== conversationId) {
      return;
    }

    try {
      const oldestMessage = state.messages?.[0];
      const before = oldestMessage?.created_at;
      
      const messagesResponse = await apiService.getMessages(
        conversationId, 
        1, 
        50, 
        before
      );

      setState(prev => ({
        ...prev,
        messages: [...(messagesResponse.data || []), ...(prev.messages || [])],
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load more messages',
      }));
    }
  }, [state.currentConversation, state.messages]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    typingUsers,
    loadConversations,
    selectConversation,
    createConversation,
    sendMessage,
    sendComment,
    startTyping,
    stopTyping,
    markAsRead,
    loadMoreMessages,
    clearError,
  };
};
