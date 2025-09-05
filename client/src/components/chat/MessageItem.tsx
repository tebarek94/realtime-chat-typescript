import React from 'react';
import { MessageWithSender, User } from '../../types';
import Avatar from '../ui/Avatar';
import CommentSection from './CommentSection';
import { getMessageSender, isMessageFromCurrentUser, formatMessageDate } from '../../utils';

interface MessageItemProps {
  message: MessageWithSender;
  currentUser: User;
  showAvatar: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUser,
  showAvatar,
}) => {
  const isFromCurrentUser = isMessageFromCurrentUser(message, currentUser.id);
  const senderName = getMessageSender(message, currentUser.id);

  return (
    <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && !isFromCurrentUser && (
          <div className="flex-shrink-0 mr-2">
            <Avatar user={message.sender} size="sm" showOnlineStatus />
          </div>
        )}
        
        {/* Message Content */}
        <div className={`flex flex-col ${isFromCurrentUser ? 'items-end' : 'items-start'}`}>
          {/* Sender Name (for group chats) */}
          {!isFromCurrentUser && showAvatar && (
            <p className="text-xs text-gray-500 mb-1 px-2">
              {senderName}
            </p>
          )}
          
          {/* Message Bubble */}
          <div
            className={`message-bubble ${
              isFromCurrentUser
                ? 'message-sent'
                : 'message-received'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          
          {/* Message Meta */}
          <div className={`flex items-center mt-1 space-x-1 ${isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-gray-500">
              {formatMessageDate(message.created_at)}
            </span>
            
            {message.is_edited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
            
            {/* Read Receipts */}
            {isFromCurrentUser && message.read_by.length > 0 && (
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-gray-400">
                  {message.read_by.length}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Spacer for current user messages */}
        {isFromCurrentUser && (
          <div className="flex-shrink-0 ml-2 w-8" />
        )}
      </div>
      
      {/* Comment Section */}
      <div className="mt-2 ml-12">
        <CommentSection
          messageId={message.id}
          currentUserId={currentUser.id}
        />
      </div>
    </div>
  );
};

export default MessageItem;
