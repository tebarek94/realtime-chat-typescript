import { Request, Response } from 'express';
import { Comment, Message, User } from '../models';
import { validationResult } from 'express-validator';

// Get comments for a specific message
export const getComments = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = (req as any).user.id;

    // Verify the message exists and user has access to it
    const message = await Message.findOne({
      where: { id: messageId },
      include: [
        {
          model: Conversation,
          include: [
            {
              model: ConversationParticipant,
              where: { user_id: userId },
              required: true,
            },
          ],
        },
      ],
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Get comments with sender information
    const comments = await Comment.findAll({
      where: { message_id: messageId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'is_online', 'last_seen'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Create a new comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message_id, content } = req.body;
    const userId = (req as any).user.id;

    // Verify the message exists and user has access to it
    const message = await Message.findOne({
      where: { id: message_id },
      include: [
        {
          model: Conversation,
          include: [
            {
              model: ConversationParticipant,
              where: { user_id: userId },
              required: true,
            },
          ],
        },
      ],
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Create the comment
    const comment = await Comment.create({
      message_id,
      sender_id: userId,
      content,
    });

    // Fetch the comment with sender information
    const commentWithSender = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'is_online', 'last_seen'],
        },
      ],
    });

    res.status(201).json(commentWithSender);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

// Update a comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { commentId } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.id;

    // Find the comment and verify ownership
    const comment = await Comment.findOne({
      where: { id: commentId, sender_id: userId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    // Update the comment
    await comment.update({ content });

    // Fetch the updated comment with sender information
    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'is_online', 'last_seen'],
        },
      ],
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = (req as any).user.id;

    // Find the comment and verify ownership
    const comment = await Comment.findOne({
      where: { id: commentId, sender_id: userId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    // Delete the comment
    await comment.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
