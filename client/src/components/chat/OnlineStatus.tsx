import React from 'react';
import { User } from '../../types';

interface OnlineStatusProps {
  user: User;
  showLastSeen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  user, 
  showLastSeen = false, 
  size = 'md' 
}) => {
  const getStatusColor = () => {
    if (user.is_online) {
      return 'bg-green-500';
    }
    return 'bg-gray-400';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${getSizeClasses()} ${getStatusColor()} rounded-full border-2 border-white`} />
      {showLastSeen && !user.is_online && (
        <span className="text-xs text-gray-500">
          {formatLastSeen(user.last_seen)}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
