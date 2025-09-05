import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Message, User, ConversationParticipant, MessageRead } from '../models';
import { SendMessageRequest, MessageWithSender } from '../types';
import { socketService } from '../index';

export const getMessages = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    const userId = req.user.id;

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: conversationId, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const limitNum = parseInt(limit as string);

    // Build where clause for pagination
    let whereClause: any = { 
      conversation_id: conversationId,
      is_deleted: false
    };

    // If 'before' parameter is provided, get messages before that timestamp
    if (before) {
      whereClause.created_at = { [Op.lt]: new Date(before as string) };
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] }
        },
        {
          model: MessageRead,
          as: 'reads',
          include: [
            {
              model: User,
              as: 'user',
              attributes: { exclude: ['password'] }
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: before ? 0 : offset // If using 'before', don't use offset
    });

    const formattedMessages: MessageWithSender[] = messages.rows.map(msg => ({
      ...msg.toJSON(),
      sender: (msg as any).sender,
      read_by: (msg as any).reads?.map((read: any) => ({
        ...read.toJSON(),
        user: read.user
      })) || []
    }));

    // Mark messages as delivered when user views them
    const unreadMessageIds = formattedMessages
      .filter(msg => msg.sender_id !== userId)
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      // Mark as delivered (not read yet, just delivered)
      for (const messageId of unreadMessageIds) {
        socketService.emitMessageStatus(messageId, 'delivered', parseInt(conversationId));
      }
    }

    res.json({
      data: formattedMessages.reverse(), // Reverse to show oldest first
      total: messages.count,
      page: parseInt(page as string),
      limit: limitNum,
      totalPages: Math.ceil(messages.count / limitNum),
      hasMore: before ? messages.rows.length === limitNum : (offset + limitNum) < messages.count
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { conversation_id, content, message_type = 'text' }: SendMessageRequest = req.body;
    const userId = req.user.id;

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message
    const message = await Message.create({
      conversation_id,
      sender_id: userId,
      content,
      message_type
    });

    // Fetch message with sender info
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    const formattedMessage: MessageWithSender = {
      ...messageWithSender!.toJSON(),
      sender: (messageWithSender as any).sender,
      read_by: []
    };

    // Emit message to conversation participants via Socket.IO
    socketService.emitNewMessage(conversation_id, formattedMessage);
    
    // Emit message status as 'sent'
    socketService.emitMessageStatus(message.id, 'sent', conversation_id);

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const editMessage = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    await message.update({
      content,
      is_edited: true,
      edited_at: new Date()
    });

    const updatedMessage = await Message.findByPk(id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    const formattedMessage: MessageWithSender = {
      ...updatedMessage!.toJSON(),
      sender: (updatedMessage as any).sender,
      read_by: []
    };

    res.json(formattedMessage);
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMessage = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    await message.update({
      is_deleted: true,
      deleted_at: new Date()
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is participant in the conversation
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: message.conversation_id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if already read
    const existingRead = await MessageRead.findOne({
      where: { message_id: messageId, user_id: userId }
    });

    if (!existingRead) {
      await MessageRead.create({
        message_id: parseInt(messageId),
        user_id: userId
      });
      
      // Emit message read status
      socketService.emitMessageRead(parseInt(messageId), userId);
      socketService.emitMessageStatus(parseInt(messageId), 'read', message.conversation_id);
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markConversationAsRead = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: conversationId, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all unread messages in the conversation
    const unreadMessages = await Message.findAll({
      where: {
        conversation_id: conversationId,
        sender_id: { [Op.ne]: userId }, // Not sent by current user
        is_deleted: false
      },
      include: [
        {
          model: MessageRead,
          as: 'reads',
          where: { user_id: userId },
          required: false
        }
      ]
    });

    // Mark unread messages as read
    const messagesToMark = unreadMessages.filter(msg => !(msg as any).reads || (msg as any).reads.length === 0);

    for (const message of messagesToMark) {
      await MessageRead.findOrCreate({
        where: { message_id: message.id, user_id: userId },
        defaults: { message_id: message.id, user_id: userId }
      });
    }

    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchMessages = async (req: any, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { query, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: conversationId, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const limitNum = parseInt(limit as string);

    const messages = await Message.findAndCountAll({
      where: {
        conversation_id: conversationId,
        content: { [Op.like]: `%${query}%` },
        is_deleted: false
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: { exclude: ['password'] }
        },
        {
          model: MessageRead,
          as: 'reads',
          include: [
            {
              model: User,
              as: 'user',
              attributes: { exclude: ['password'] }
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset
    });

    const formattedMessages: MessageWithSender[] = messages.rows.map(msg => ({
      ...msg.toJSON(),
      sender: (msg as any).sender,
      read_by: (msg as any).reads?.map((read: any) => ({
        ...read.toJSON(),
        user: read.user
      })) || []
    }));

    res.json({
      data: formattedMessages,
      total: messages.count,
      page: parseInt(page as string),
      limit: limitNum,
      totalPages: Math.ceil(messages.count / limitNum),
      query: query
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
