import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatMain from '../components/chat/ChatMain';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import UserSearchShortcut from '../components/chat/UserSearchShortcut';
import NotificationCenter from '../components/ui/NotificationCenter';
import { socketService } from '../services/socket';
import { apiService } from '../services/api';
import { notificationService } from '../services/notification';

const ChatPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    messages, 
    loading, 
    error,
    selectConversation,
    createConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    clearError
  } = useChat(user);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Monitor socket connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  // Monitor notification count
  useEffect(() => {
    const unsubscribe = notificationService.addListener((notifications) => {
      setNotificationCount(notifications.length);
    });

    return unsubscribe;
  }, []);

  // Handle notification clicks
  useEffect(() => {
    const handleNotificationClick = (event: CustomEvent) => {
      const { conversationId } = event.detail;
      if (conversationId) {
        selectConversation(conversationId);
      }
    };

    window.addEventListener('notificationClick', handleNotificationClick as EventListener);
    return () => {
      window.removeEventListener('notificationClick', handleNotificationClick as EventListener);
    };
  }, [selectConversation]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleQuickUserSelect = async (selectedUser: any) => {
    try {
      const conversationData = {
        type: 'direct' as const,
        participant_ids: [selectedUser.id],
      };
      
      const conversation = await apiService.createConversation(conversationData);
      createConversation(conversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <ChatSidebar
          user={user}
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={selectConversation}
          onLogout={handleLogout}
          onCreateConversation={createConversation}
          onUpdateProfile={updateProfile}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <ChatMain
            conversation={currentConversation}
            messages={messages}
            currentUser={user!}
            onSendMessage={sendMessage}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
            onMarkAsRead={markAsRead}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Chat
              </h3>
              <p className="text-gray-500">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="fixed top-4 left-4 z-50">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>

      {/* Notification Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsNotificationCenterOpen(true)}
          className="relative p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Notifications"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Search Shortcut */}
      <UserSearchShortcut onUserSelect={handleQuickUserSelect} />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onNotificationClick={(data) => {
          if (data.conversationId) {
            selectConversation(data.conversationId);
          }
        }}
      />
    </div>
  );
};

export default ChatPage;
