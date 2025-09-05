import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import OnlineStatus from './OnlineStatus';

interface UserListProps {
  currentUserId: number;
  onUserSelect: (user: User) => void;
  className?: string;
}

const UserList: React.FC<UserListProps> = ({
  currentUserId,
  onUserSelect,
  className = ''
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

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
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (search: string) => {
    setLoading(true);
    try {
      const searchResults = await apiService.getUsers(search);
      setUsers(searchResults);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };


  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="p-2">
            <div className="text-xs text-gray-500 font-medium mb-2 px-2">
              {searchTerm ? `Search results (${users.length})` : `All Users (${users.length})`}
            </div>
            <div className="space-y-1">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => onUserSelect(user)}
                  className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={getUserDisplayName(user)}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-sm">
                          {getUserDisplayName(user).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <OnlineStatus user={user} size="sm" />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {getUserDisplayName(user)}
                      </p>
                      <span className="text-xs font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        @{user.username}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <OnlineStatus user={user} showLastSeen={true} size="sm" />
                    </div>
                  </div>

                  {/* Chat Button */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserSelect(user);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Start chat"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
