import React, { useState, useEffect } from 'react';
import { ConversationWithParticipants } from '../../types';
import { apiService } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ConversationSearchProps {
  onSelectConversation: (conversationId: number) => void;
  onClose: () => void;
}

const ConversationSearch: React.FC<ConversationSearchProps> = ({
  onSelectConversation,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const timeoutId = setTimeout(() => {
        searchConversations(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setConversations([]);
    }
  }, [searchTerm]);

  const searchConversations = async (query: string) => {
    setLoading(true);
    try {
      const results = await apiService.getConversations(query);
      setConversations(results);
    } catch (error) {
      console.error('Failed to search conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConversationName = (conversation: ConversationWithParticipants) => {
    if (conversation.name) {
      return conversation.name;
    }
    
    // For direct messages, show the other participant's name
    const otherParticipant = conversation.participants?.find(p => p.user.username !== 'current_user');
    if (otherParticipant) {
      const user = otherParticipant.user;
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      }
      return user.username;
    }
    
    return 'Unknown';
  };

  const getConversationAvatar = (conversation: ConversationWithParticipants) => {
    if (conversation.type === 'group') {
      return null; // Use default group avatar
    }
    
    const otherParticipant = conversation.participants?.find(p => p.user.username !== 'current_user');
    return otherParticipant?.user.avatar_url;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Search Conversations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : searchTerm.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Type to search conversations</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    onClose();
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {getConversationAvatar(conversation) ? (
                      <img
                        src={getConversationAvatar(conversation)!}
                        alt={getConversationName(conversation)}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium text-sm">
                        {getConversationName(conversation).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {getConversationName(conversation)}
                    </p>
                    {conversation.last_message && (
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>

                  {/* Type indicator */}
                  <div className="text-xs text-gray-400">
                    {conversation.type === 'group' ? 'Group' : 'Direct'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationSearch;
