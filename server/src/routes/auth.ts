import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  getUsers
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);
router.get('/users', authenticateToken, getUsers);

export default router;
