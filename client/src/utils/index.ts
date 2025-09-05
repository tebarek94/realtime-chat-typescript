// Utility functions for the chat application

import { User, MessageWithSender, ConversationWithParticipants } from '../types';

// Date formatting utilities
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

// User utilities
export const getUserDisplayName = (user: User | null): string => {
  if (!user) {
    return 'Unknown User';
  }
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.username || 'Unknown User';
};

export const getUserInitials = (user: User | null): string => {
  if (!user) {
    return '??';
  }
  
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  return (user.username || 'Unknown').substring(0, 2).toUpperCase();
};

export const isUserOnline = (user: User): boolean => {
  if (!user.is_online) return false;
  
  const lastSeen = new Date(user.last_seen);
  const now = new Date();
  const diffInMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
  
  return diffInMinutes < 5; // Consider online if last seen within 5 minutes
};

// Message utilities
export const getMessageSender = (message: MessageWithSender, currentUserId: number): string => {
  if (message.sender_id === currentUserId) {
    return 'You';
  }
  return getUserDisplayName(message.sender);
};

export const isMessageFromCurrentUser = (message: MessageWithSender, currentUserId: number): boolean => {
  return message.sender_id === currentUserId;
};

export const formatMessageContent = (content: string): string => {
  // Simple URL detection and formatting
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
};

// Conversation utilities
export const getConversationName = (conversation: ConversationWithParticipants, currentUserId: number): string => {
  if (conversation.type === 'group') {
    return conversation.name || 'Group Chat';
  }

  // For direct messages, find the other participant
  const otherParticipant = (conversation.participants || []).find(p => p.user_id !== currentUserId);
  return otherParticipant ? getUserDisplayName(otherParticipant.user) : 'Unknown User';
};

export const getConversationAvatar = (conversation: ConversationWithParticipants, currentUserId: number): string | null => {
  if (conversation.type === 'group') {
    return null; // Use group icon for group chats
  }

  const otherParticipant = (conversation.participants || []).find(p => p.user_id !== currentUserId);
  return otherParticipant?.user.avatar_url || null;
};

export const getConversationParticipants = (conversation: ConversationWithParticipants, currentUserId: number): User[] => {
  return (conversation.participants || [])
    .filter(p => p.user_id !== currentUserId)
    .map(p => p.user);
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 50) {
    errors.push('Username must be less than 50 characters');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
};

// Local storage utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
