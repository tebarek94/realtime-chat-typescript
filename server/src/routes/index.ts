import express from 'express';
import authRoutes from './auth';
import conversationRoutes from './conversations';
import messageRoutes from './messages';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
