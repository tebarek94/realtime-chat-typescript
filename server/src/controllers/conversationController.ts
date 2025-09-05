import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User, Conversation, ConversationParticipant, Message } from '../models';
import { CreateConversationRequest, ConversationWithParticipants } from '../types';
import sequelize from '../config/database';

export const getConversations = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;

    let whereClause: any = {};
    
    // If search query is provided, search in conversation names and participant names
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          {
            '$conversationParticipants.user.username$': { [Op.like]: `%${search}%` },
            '$conversationParticipants.user.first_name$': { [Op.like]: `%${search}%` },
            '$conversationParticipants.user.last_name$': { [Op.like]: `%${search}%` }
          }
        ]
      };
    }

    const conversations = await Conversation.findAll({
      where: whereClause,
      include: [
        {
          model: ConversationParticipant,
          as: 'conversationParticipants',
          where: { user_id: userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: { exclude: ['password'] }
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: { exclude: ['password'] }
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: { exclude: ['password'] }
            }
          ]
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    // Transform the data to match our response format
    const formattedConversations: ConversationWithParticipants[] = conversations.map(conv => {
      const participants = (conv as any).conversationParticipants?.map((cp: any) => ({
        ...cp.toJSON(),
        user: cp.user
      })) || [];

      const lastMessage = (conv as any).messages?.[0] ? {
        ...(conv as any).messages[0].toJSON(),
        sender: (conv as any).messages[0].sender
      } : undefined;

      return {
        ...conv.toJSON(),
        participants,
        last_message: lastMessage,
        unread_count: 0 // TODO: Implement unread count logic
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createConversation = async (req: any, res: Response) => {
  try {
    const { type, name, participant_ids }: CreateConversationRequest = req.body;
    const userId = req.user.id;

    // Validate participants
    const participants = await User.findAll({
      where: { id: { [Op.in]: participant_ids } }
    });

    if (participants.length !== participant_ids.length) {
      return res.status(400).json({ error: 'One or more participants not found' });
    }

    // For direct messages, check if conversation already exists between these two users
    if (type === 'direct' && participant_ids.length === 1) {
      const targetUserId = participant_ids[0];
      
      // Prevent self-chat
      if (targetUserId === userId) {
        return res.status(400).json({ error: 'Cannot create conversation with yourself' });
      }

      // Find existing direct conversation between these two users
      const existingConversation = await Conversation.findOne({
        where: { 
          type: 'direct'
        },
        include: [
          {
            model: ConversationParticipant,
            as: 'conversationParticipants',
            where: {
              user_id: { [Op.in]: [userId, targetUserId] }
            },
            required: true
          }
        ],
        having: sequelize.literal(`COUNT(DISTINCT conversation_participants.user_id) = 2`)
      });

      if (existingConversation) {
        // Return the existing conversation with full data
        const formattedConversation: ConversationWithParticipants = {
          ...existingConversation.toJSON(),
          participants: (existingConversation as any).conversationParticipants?.map((cp: any) => ({
            ...cp.toJSON(),
            user: cp.user
          })) || []
        };
        return res.json(formattedConversation);
      }
    }

    // Create new conversation
    const conversation = await Conversation.create({
      type,
      name: type === 'group' ? name : undefined,
      created_by: userId
    });

    // Add participants (current user + selected participants)
    const allParticipants = [userId, ...participant_ids];
    const participantData = allParticipants.map(pid => ({
      conversation_id: conversation.id,
      user_id: pid,
      is_admin: pid === userId
    }));

    await ConversationParticipant.bulkCreate(participantData);

    // Fetch the created conversation with all data
    const createdConversation = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: ConversationParticipant,
          as: 'conversationParticipants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: { exclude: ['password'] }
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    const formattedConversation: ConversationWithParticipants = {
      ...createdConversation!.toJSON(),
      participants: (createdConversation as any).conversationParticipants?.map((cp: any) => ({
        ...cp.toJSON(),
        user: cp.user
      })) || []
    };

    res.status(201).json(formattedConversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversation = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const conversation = await Conversation.findByPk(id, {
      include: [
        {
          model: ConversationParticipant,
          as: 'conversationParticipants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: { exclude: ['password'] }
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const formattedConversation: ConversationWithParticipants = {
      ...conversation.toJSON(),
      participants: (conversation as any).conversationParticipants?.map((cp: any) => ({
        ...cp.toJSON(),
        user: cp.user
      })) || []
    };

    res.json(formattedConversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateConversation = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: id, user_id: userId, is_admin: true }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Only admins can update conversation' });
    }

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ error: 'Only group conversations can be updated' });
    }

    await conversation.update({ name });

    res.json(conversation);
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addParticipant = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const userId = req.user.id;

    // Check if user is admin
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: id, user_id: userId, is_admin: true }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Only admins can add participants' });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a participant
    const existingParticipant = await ConversationParticipant.findOne({
      where: { conversation_id: id, user_id }
    });

    if (existingParticipant) {
      return res.status(400).json({ error: 'User is already a participant' });
    }

    await ConversationParticipant.create({
      conversation_id: parseInt(id),
      user_id,
      is_admin: false
    });

    res.json({ message: 'Participant added successfully' });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeParticipant = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const userId = req.user.id;

    // Check if user is admin or removing themselves
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (user_id !== userId && !participant.is_admin) {
      return res.status(403).json({ error: 'Only admins can remove other participants' });
    }

    await ConversationParticipant.destroy({
      where: { conversation_id: id, user_id }
    });

    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// New endpoint to get or create a direct conversation with a specific user
export const getOrCreateDirectConversation = async (req: any, res: Response) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user.id;

    // Prevent self-chat
    if (parseInt(targetUserId) === currentUserId) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Check if target user exists
    const targetUser = await User.findByPk(targetUserId, {
      attributes: { exclude: ['password'] }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find existing direct conversation between these two users
    const existingConversation = await Conversation.findOne({
      where: { 
        type: 'direct'
      },
      include: [
        {
          model: ConversationParticipant,
          as: 'conversationParticipants',
          where: {
            user_id: { [Op.in]: [currentUserId, parseInt(targetUserId)] }
          },
          required: true
        }
      ],
      having: sequelize.literal(`COUNT(DISTINCT conversation_participants.user_id) = 2`)
    });

    if (existingConversation) {
      // Return the existing conversation with full data
      const formattedConversation: ConversationWithParticipants = {
        ...existingConversation.toJSON(),
        participants: (existingConversation as any).conversationParticipants?.map((cp: any) => ({
          ...cp.toJSON(),
          user: cp.user
        })) || []
      };
      return res.json(formattedConversation);
    }

    // Create new direct conversation
    const conversation = await Conversation.create({
      type: 'direct',
      created_by: currentUserId
    });

    // Add both users as participants
    await ConversationParticipant.bulkCreate([
      {
        conversation_id: conversation.id,
        user_id: currentUserId,
        is_admin: true
      },
      {
        conversation_id: conversation.id,
        user_id: parseInt(targetUserId),
        is_admin: false
      }
    ]);

    // Fetch the created conversation with all data
    const createdConversation = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: ConversationParticipant,
          as: 'conversationParticipants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: { exclude: ['password'] }
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    const formattedConversation: ConversationWithParticipants = {
      ...createdConversation!.toJSON(),
      participants: (createdConversation as any).conversationParticipants?.map((cp: any) => ({
        ...cp.toJSON(),
        user: cp.user
      })) || []
    };

    res.status(201).json(formattedConversation);
  } catch (error) {
    console.error('Get or create direct conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
