import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';

interface QuickUserSearchProps {
  onUserSelect: (user: User) => void;
  placeholder?: string;
  className?: string;
}

const QuickUserSearch: React.FC<QuickUserSearchProps> = ({
  onUserSelect,
  placeholder = "Type @username to find user",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Search users when search term changes
  useEffect(() => {
    if (searchTerm.length > 1) {
      const timeoutId = setTimeout(() => {
        searchUsers(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setUsers([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const searchUsers = async (search: string) => {
    setLoading(true);
    setShowResults(true);
    try {
      // Remove @ if present
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
      
      setUsers(sortedUsers.slice(0, 5)); // Limit to 5 results
    } catch (error) {
      console.error('Failed to search users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setSearchTerm('');
    setUsers([]);
    setShowResults(false);
  };

  const getUserDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {users.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              {loading ? 'Searching...' : 'No users found'}
            </div>
          ) : (
            <div className="py-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={getUserDisplayName(user)}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium text-sm">
                        {getUserDisplayName(user).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 truncate">
                        {getUserDisplayName(user)}
                      </p>
                      <span className="text-sm font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
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
      )}
    </div>
  );
};

export default QuickUserSearch;
