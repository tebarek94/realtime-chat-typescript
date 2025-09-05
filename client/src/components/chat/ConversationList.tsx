import React from 'react';
import { ConversationWithParticipants } from '../../types';
import ConversationItem from './ConversationItem';
import { getConversationName, getConversationAvatar, formatDate } from '../../utils';

interface ConversationListProps {
  conversations: ConversationWithParticipants[];
  currentConversation: ConversationWithParticipants | null;
  onSelectConversation: (conversationId: number) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversation,
  onSelectConversation,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Conversations
        </h2>
        
        <div className="space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={currentConversation?.id === conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
