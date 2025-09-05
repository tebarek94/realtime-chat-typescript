import express from 'express';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  markConversationAsRead,
  searchMessages
} from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';
import { validateSendMessage } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/conversation/:conversationId', getMessages);
router.get('/conversation/:conversationId/search', searchMessages);
router.post('/', validateSendMessage, sendMessage);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.post('/:messageId/read', markAsRead);
router.post('/conversation/:conversationId/read', markConversationAsRead);

export default router;
