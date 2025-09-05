import React, { useState, useEffect } from 'react';
import { User, CreateConversationRequest } from '../../types';
import { apiService } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (conversation: any) => void;
  currentUserId: number;
}

const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
  currentUserId,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    } else {
      // Reset state when modal closes
      setUsers([]);
      setSearchTerm('');
      setSelectedUser(null);
    }
  }, [isOpen]);

  // Search users when search term changes
  useEffect(() => {
    if (searchTerm.length > 0) {
      const timeoutId = setTimeout(() => {
        searchUsers(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      loadUsers();
    }
  }, [searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await apiService.getUsers();
      // Filter out current user
      const otherUsers = allUsers.filter(user => user.id !== currentUserId);
      setUsers(otherUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (search: string) => {
    setLoading(true);
    try {
      // If search starts with @, search specifically by username
      const searchQuery = search.startsWith('@') ? search.slice(1) : search;
      const searchResults = await apiService.getUsers(searchQuery);
      
      // Filter out current user
      let otherUsers = searchResults.filter(user => user.id !== currentUserId);
      
      // If searching with @, prioritize exact username matches
      if (search.startsWith('@')) {
        otherUsers = otherUsers.sort((a, b) => {
          const aMatch = a.username.toLowerCase() === searchQuery.toLowerCase();
          const bMatch = b.username.toLowerCase() === searchQuery.toLowerCase();
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }
      
      setUsers(otherUsers);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDirectChat = async () => {
    if (!selectedUser) return;

    setCreating(true);
    try {
      const conversationData: CreateConversationRequest = {
        type: 'direct',
        participant_ids: [selectedUser.id],
      };

      const conversation = await apiService.createConversation(conversationData);
      onCreateConversation(conversation);
      onClose();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Start New Chat</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by username or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Type a username (e.g., @john) or name to find users
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={getUserDisplayName(user)}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {getUserDisplayName(user).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {getUserDisplayName(user)}
                          </p>
                          <span className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            @{user.username}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            user.is_online ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-xs text-gray-500">
                            {user.is_online ? 'Online' : 'Offline'}
                          </span>
                          {user.email && (
                            <span className="text-xs text-gray-400">
                              • {user.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            handleCreateDirectChat();
                          }}
                          className="px-3 py-1 text-xs"
                        >
                          Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDirectChat}
              disabled={!selectedUser || creating}
              loading={creating}
            >
              Start Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
