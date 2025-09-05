import express from 'express';
import {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
  addParticipant,
  removeParticipant,
  getOrCreateDirectConversation
} from '../controllers/conversationController';
import { authenticateToken } from '../middleware/auth';
import { validateCreateConversation } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getConversations);
router.post('/', validateCreateConversation, createConversation);
router.get('/direct/:userId', getOrCreateDirectConversation);
router.get('/:id', getConversation);
router.put('/:id', updateConversation);
router.post('/:id/participants', addParticipant);
router.delete('/:id/participants', removeParticipant);

export default router;
