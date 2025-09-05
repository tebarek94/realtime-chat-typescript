import { MessageWithSender, User } from '../types';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  icon?: string;
  data?: any;
  timestamp: number;
}

class NotificationService {
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];
  private currentUser: User | null = null;

  constructor() {
    // Request notification permission on initialization
    this.requestPermission();
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  private async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  private canShowNotification(): boolean {
    return (
      'Notification' in window &&
      Notification.permission === 'granted' &&
      document.hidden // Only show when tab is not active
    );
  }

  private getUserDisplayName(user: User): string {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  }

  private getConversationName(message: MessageWithSender): string {
    // For now, we'll use the sender's name
    // In a full implementation, you'd want to get the conversation name
    return this.getUserDisplayName(message.sender);
  }

  showMessageNotification(message: MessageWithSender): void {
    // Don't show notification for messages from current user
    if (this.currentUser && message.sender.id === this.currentUser.id) {
      return;
    }

    // Don't show notification if user is viewing the conversation
    if (this.isUserViewingConversation(message.conversation_id)) {
      return;
    }

    const notificationData: NotificationData = {
      id: `msg_${message.id}_${Date.now()}`,
      title: this.getConversationName(message),
      body: this.truncateMessage(message.content),
      icon: message.sender.avatar_url || '/favicon.ico',
      data: {
        conversationId: message.conversation_id,
        messageId: message.id,
        type: 'message'
      },
      timestamp: Date.now()
    };

    this.addNotification(notificationData);

    // Show browser notification if possible
    if (this.canShowNotification()) {
      this.showBrowserNotification(notificationData);
    }
  }

  private isUserViewingConversation(conversationId: number): boolean {
    // Check if the current conversation matches the message's conversation
    // This would need to be passed from the chat component
    return false; // For now, always show notifications
  }

  private truncateMessage(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  private showBrowserNotification(notification: NotificationData): void {
    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      tag: notification.id, // Prevents duplicate notifications
      data: notification.data
    });

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      
      // Emit custom event to focus on conversation
      window.dispatchEvent(new CustomEvent('notificationClick', {
        detail: notification.data
      }));
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);
  }

  private addNotification(notification: NotificationData): void {
    this.notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Public methods
  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  addListener(listener: (notifications: NotificationData[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  markAsRead(notificationId: string): void {
    // For now, we'll just remove the notification
    // In a full implementation, you might want to mark as read instead
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  getUnreadCount(): number {
    return this.notifications.length;
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
