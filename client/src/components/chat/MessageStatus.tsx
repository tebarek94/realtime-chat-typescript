import React from 'react';

interface MessageStatusProps {
  messageId: number;
  readBy: Array<{ user_id: number; read_at: string }>;
  currentUserId: number;
  senderId: number;
  status?: 'sent' | 'delivered' | 'read';
}

const MessageStatus: React.FC<MessageStatusProps> = ({
  messageId,
  readBy,
  currentUserId,
  senderId,
  status = 'sent'
}) => {
  // Only show status for messages sent by current user
  if (senderId !== currentUserId) {
    return null;
  }

  const isRead = readBy.some(read => read.user_id !== currentUserId);
  const isDelivered = status === 'delivered' || status === 'read' || isRead;

  return (
    <div className="flex items-center ml-1">
      {isRead ? (
        // Double checkmark for read
        <div className="flex items-center">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <svg className="w-4 h-4 text-blue-500 -ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      ) : isDelivered ? (
        // Single checkmark for delivered
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        // Clock icon for sent
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );
};

export default MessageStatus;
