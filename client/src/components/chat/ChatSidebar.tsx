import React, { useState } from 'react';
import { User, ConversationWithParticipants } from '../../types';
import ConversationList from './ConversationList';
import UserProfile from './UserProfile';
import QuickUserSearch from './QuickUserSearch';
import UserList from './UserList';
import ConversationSearch from './ConversationSearch';
import { apiService } from '../../services/api';

interface ChatSidebarProps {
  user: User | null;
  conversations: ConversationWithParticipants[];
  currentConversation: ConversationWithParticipants | null;
  onSelectConversation: (conversationId: number) => void;
  onLogout: () => void;
  onCreateConversation: (conversation: ConversationWithParticipants) => void;
  onUpdateProfile?: (updatedUser: User) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  user,
  conversations,
  currentConversation,
  onSelectConversation,
  onLogout,
  onCreateConversation,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'conversations' | 'users'>('conversations');
  const [showConversationSearch, setShowConversationSearch] = useState(false);

  const handleQuickUserSelect = async (selectedUser: User) => {
    try {
      // Use the new endpoint that handles duplicate prevention
      const conversation = await apiService.getOrCreateDirectConversation(selectedUser.id);
      onCreateConversation(conversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleUserSelect = async (selectedUser: User) => {
    try {
      // Use the new endpoint that handles duplicate prevention
      const conversation = await apiService.getOrCreateDirectConversation(selectedUser.id);
      onCreateConversation(conversation);
      // Switch to conversations tab after creating
      setActiveTab('conversations');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Header */}
      <UserProfile user={user} onLogout={onLogout} onUpdateProfile={onUpdateProfile} />
      
      {/* Quick User Search */}
      <div className="p-4 border-b border-gray-200">
        <QuickUserSearch
          onUserSelect={handleQuickUserSelect}
          placeholder="Type @username to chat"
          className="mb-3"
        />
        
        {/* Search Button */}
        <button
          onClick={() => setShowConversationSearch(true)}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search conversations</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'conversations'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Chats</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>Users</span>
          </div>
        </button>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'conversations' ? (
          <ConversationList
            conversations={conversations}
            currentConversation={currentConversation}
            onSelectConversation={onSelectConversation}
          />
        ) : (
          <UserList
            currentUserId={user?.id || 0}
            onUserSelect={handleUserSelect}
          />
        )}
      </div>

      {/* Conversation Search Modal */}
      {showConversationSearch && (
        <ConversationSearch
          onSelectConversation={onSelectConversation}
          onClose={() => setShowConversationSearch(false)}
        />
      )}
    </div>
  );
};

export default ChatSidebar;
