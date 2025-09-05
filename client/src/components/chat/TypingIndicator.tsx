import React from 'react';
import { TypingUser } from '../../types';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  currentUserId: number;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, currentUserId }) => {
  // Filter out current user from typing users
  const otherTypingUsers = typingUsers.filter(tu => tu.user.id !== currentUserId);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].user.username} is typing...`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].user.username} and ${otherTypingUsers[1].user.username} are typing...`;
    } else {
      return `${otherTypingUsers.length} people are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;
