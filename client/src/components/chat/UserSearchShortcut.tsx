import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/api';
import Button from '../ui/Button';

interface UserSearchShortcutProps {
  onUserSelect: (user: User) => void;
  className?: string;
}

const UserSearchShortcut: React.FC<UserSearchShortcutProps> = ({
  onUserSelect,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
        setUsers([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search users when search term changes
  useEffect(() => {
    if (searchTerm.length > 1) {
      const timeoutId = setTimeout(() => {
        searchUsers(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async (search: string) => {
    setLoading(true);
    try {
      const cleanSearch = search.startsWith('@') ? search.slice(1) : search;
      const searchResults = await apiService.getUsers(cleanSearch);
      
      // Sort by exact username match first
      const sortedUsers = searchResults.sort((a, b) => {
        const aExact = a.username.toLowerCase() === cleanSearch.toLowerCase();
        const bExact = b.username.toLowerCase() === cleanSearch.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });
      
      setUsers(sortedUsers.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Failed to search users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setIsOpen(false);
    setSearchTerm('');
    setUsers([]);
  };

  const getUserDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick User Search</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Type username or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+K</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Cmd+K</kbd> to open this search
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm.length > 1 ? 'No users found' : 'Start typing to search users'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3 text-left transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">
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
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearchShortcut;
