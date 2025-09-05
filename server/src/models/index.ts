import sequelize from '../config/database';
import User from './User';
import Conversation from './Conversation';
import ConversationParticipant from './ConversationParticipant';
import Message from './Message';
import MessageRead from './MessageRead';
import Comment from './Comment';

// Define associations
User.hasMany(Conversation, { foreignKey: 'created_by', as: 'createdConversations' });
Conversation.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.belongsToMany(Conversation, { 
  through: ConversationParticipant, 
  foreignKey: 'user_id', 
  otherKey: 'conversation_id',
  as: 'conversations'
});
Conversation.belongsToMany(User, { 
  through: ConversationParticipant, 
  foreignKey: 'conversation_id', 
  otherKey: 'user_id',
  as: 'participants'
});

Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversation_id', as: 'conversationParticipants' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
ConversationParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

Message.hasMany(MessageRead, { foreignKey: 'message_id', as: 'reads' });
MessageRead.belongsTo(Message, { foreignKey: 'message_id', as: 'message' });
MessageRead.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(MessageRead, { foreignKey: 'user_id', as: 'messageReads' });

// Comment associations
User.hasMany(Comment, { foreignKey: 'sender_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

Message.hasMany(Comment, { foreignKey: 'message_id', as: 'comments' });
Comment.belongsTo(Message, { foreignKey: 'message_id', as: 'message' });

// Export models and sequelize instance
export {
  sequelize,
  User,
  Conversation,
  ConversationParticipant,
  Message,
  MessageRead,
  Comment
};

export default {
  sequelize,
  User,
  Conversation,
  ConversationParticipant,
  Message,
  MessageRead,
  Comment
};
