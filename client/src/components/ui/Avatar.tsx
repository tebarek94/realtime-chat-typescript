import React from 'react';
import { User } from '../../types';
import { getUserInitials } from '../../utils';

interface AvatarProps {
  user?: User;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  user,
  src,
  alt,
  size = 'md',
  className = '',
  showOnlineStatus = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const imageSrc = src || user?.avatar_url;
  const imageAlt = alt || (user ? `${user.username || 'user'}'s avatar` : 'Avatar');
  const initials = user ? getUserInitials(user) : '?';

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
          {initials}
        </div>
      )}
      
      {showOnlineStatus && user && (
        <div
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} rounded-full border-2 border-white ${
            user.is_online ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
