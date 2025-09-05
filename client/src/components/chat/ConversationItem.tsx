import React from 'react';
import { ConversationWithParticipants } from '../../types';
import Avatar from '../ui/Avatar';
import { getConversationName, getConversationAvatar, formatDate, truncateText } from '../../utils';

interface ConversationItemProps {
  conversation: ConversationWithParticipants;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const name = getConversationName(conversation, 0); // TODO: Pass current user ID
  const avatarUrl = getConversationAvatar(conversation, 0); // TODO: Pass current user ID
  const lastMessage = conversation.last_message;
  const unreadCount = conversation.unread_count || 0;

  return (
    <div
      onClick={onClick}
      className={`conversation-item ${
        isActive ? 'conversation-item-active' : ''
      }`}
    >
      <div className="flex-shrink-0 mr-3">
        <Avatar
          src={avatarUrl || undefined}
          alt={`${name} avatar`}
          size="md"
          showOnlineStatus={conversation.type === 'direct'}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`text-sm font-semibold truncate ${
            isActive ? 'text-primary-900' : 'text-gray-900'
          }`}>
            {name}
          </h3>
          {lastMessage && (
            <span className={`text-xs ml-2 flex-shrink-0 ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`}>
              {formatDate(lastMessage.created_at)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${
            isActive ? 'text-primary-700' : 'text-gray-500'
          }`}>
            {lastMessage ? (
              <>
                {conversation.type === 'group' && (
                  <span className={`font-medium ${
                    isActive ? 'text-primary-800' : 'text-gray-600'
                  }`}>
                    {lastMessage.sender.username}:{' '}
                  </span>
                )}
                {truncateText(lastMessage.content, 30)}
              </>
            ) : (
              <span className="italic">No messages yet</span>
            )}
          </p>
          
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-bold leading-none text-white bg-primary-600 rounded-full flex-shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
