import React, { useState, useEffect } from 'react';
import { CommentWithSender, SendCommentRequest } from '../../types';
import { apiService } from '../../services/api';
import { socketService } from '../../services/socket';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import { getUserDisplayName, formatDate } from '../../utils';

interface CommentSectionProps {
  messageId: number;
  currentUserId: number;
  onCommentAdded?: (comment: CommentWithSender) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  messageId,
  currentUserId,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<CommentWithSender[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Load comments when component mounts or messageId changes
  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [messageId, showComments]);

  // Socket listener for new comments
  useEffect(() => {
    const handleNewComment = (comment: CommentWithSender) => {
      if (comment.message_id === messageId) {
        setComments(prev => [...prev, comment]);
        onCommentAdded?.(comment);
      }
    };

    socketService.onComment(handleNewComment);

    return () => {
      socketService.offComment(handleNewComment);
    };
  }, [messageId, onCommentAdded]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const commentsData = await apiService.getComments(messageId);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData: SendCommentRequest = {
      message_id: messageId,
      content: newComment.trim(),
    };

    try {
      const comment = await apiService.sendComment(commentData);
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
      // Also send via socket for real-time delivery
      socketService.sendComment({
        messageId: comment.message_id,
        content: comment.content,
      });
      
      onCommentAdded?.(comment);
    } catch (error) {
      console.error('Failed to send comment:', error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="mt-2 border-t border-gray-100 pt-2">
      {/* Comments Toggle Button */}
      <button
        onClick={toggleComments}
        className="flex items-center space-x-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>
          {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}` : 'Add comment'}
        </span>
      </button>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {/* Comments List */}
          {loading ? (
            <div className="text-center py-2">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Avatar user={comment.sender} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getUserDisplayName(comment.sender)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleSendComment} className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-sm"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim()}
              className="px-3 py-1"
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
