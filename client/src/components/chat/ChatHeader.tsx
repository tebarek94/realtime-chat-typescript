import React from 'react';
import { ConversationWithParticipants, User } from '../../types';
import Avatar from '../ui/Avatar';
import { getConversationName, getConversationAvatar } from '../../utils';

interface ChatHeaderProps {
  conversation: ConversationWithParticipants;
  currentUser: User;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, currentUser }) => {
  const name = getConversationName(conversation, currentUser.id);
  const avatarUrl = getConversationAvatar(conversation, currentUser.id);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <Avatar
          src={avatarUrl || undefined}
          alt={`${name} avatar`}
          size="md"
          showOnlineStatus={conversation.type === 'direct'}
        />
        <div>
          <h2 className="text-lg font-medium text-gray-900">{name}</h2>
          <p className="text-sm text-gray-500">
            {conversation.type === 'group' 
              ? `${conversation.participants.length} members`
              : 'Online'
            }
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
