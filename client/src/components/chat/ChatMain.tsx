import React from 'react';
import { ConversationWithParticipants, MessageWithSender, User } from '../../types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatMainProps {
  conversation: ConversationWithParticipants;
  messages: MessageWithSender[];
  currentUser: User;
  onSendMessage: (data: { conversation_id: number; content: string; message_type?: 'text' | 'image' | 'file' }) => Promise<MessageWithSender>;
  onStartTyping: (conversationId: number) => void;
  onStopTyping: (conversationId: number) => void;
  onMarkAsRead: (messageId: number) => void;
}

const ChatMain: React.FC<ChatMainProps> = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onMarkAsRead,
}) => {
  const handleSendMessage = async (content: string) => {
    try {
      await onSendMessage({
        conversation_id: conversation.id,
        content,
        message_type: 'text' as const,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader conversation={conversation} currentUser={currentUser} />
      
      {/* Messages List */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          currentUser={currentUser}
          onMarkAsRead={onMarkAsRead}
        />
      </div>
      
      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onStartTyping={() => onStartTyping(conversation.id)}
          onStopTyping={() => onStopTyping(conversation.id)}
        />
      </div>
    </div>
  );
};

export default ChatMain;
