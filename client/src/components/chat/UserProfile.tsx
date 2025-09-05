import React, { useState } from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { getUserDisplayName } from '../../utils';
import ProfileSettingsModal from './ProfileSettingsModal';

interface UserProfileProps {
  user: User | null;
  onLogout: () => void;
  onUpdateProfile?: (updatedUser: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Early return if user is null or undefined
  if (!user) {
    return (
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="ml-3">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-16 mt-1 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Additional safety check - show user even if username is missing
  if (!user.username && !user.first_name && !user.last_name) {
    return (
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="ml-3">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-16 mt-1 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar user={user} size="md" showOnlineStatus />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {getUserDisplayName(user)}
            </p>
            <p className="text-xs text-gray-500 truncate">
              @{user?.username || user?.email?.split('@')[0] || 'user'}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 animate-slide-down">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowProfileModal(true);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Profile Settings</span>
                </div>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onLogout();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateProfile={onUpdateProfile || (() => {})}
      />
    </div>
  );
};

export default UserProfile;
