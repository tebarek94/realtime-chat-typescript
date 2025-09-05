import React, { useState, useEffect } from 'react';
import { MessageWithSender } from '../../types';
import { apiService } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatDate } from '../../utils';

interface MessageSearchProps {
  conversationId: number;
  onClose: () => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({
  conversationId,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 0) {
      setPage(1);
      setMessages([]);
      searchMessages(searchTerm, 1);
    } else {
      setMessages([]);
    }
  }, [searchTerm]);

  const searchMessages = async (query: string, pageNum: number = 1) => {
    setLoading(true);
    try {
      const response = await apiService.searchMessages(conversationId, query, pageNum, 20);
      
      if (pageNum === 1) {
        setMessages(response.data);
      } else {
        setMessages(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.page < response.totalPages);
    } catch (error) {
      console.error('Failed to search messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchMessages(searchTerm, nextPage);
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Search Messages</h2>
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
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : searchTerm.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Type to search messages</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No messages found</p>
            </div>
          ) : (
            <div className="p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="border-b border-gray-100 pb-4 mb-4 last:border-b-0"
                >
                  {/* Message Header */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {message.sender.avatar_url ? (
                        <img
                          src={message.sender.avatar_url}
                          alt={message.sender.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-xs">
                          {message.sender.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {message.sender.first_name && message.sender.last_name
                          ? `${message.sender.first_name} ${message.sender.last_name}`
                          : message.sender.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="pl-10">
                    <p className="text-sm text-gray-800">
                      {highlightText(message.content, searchTerm)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center py-4">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSearch;
