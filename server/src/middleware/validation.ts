import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

export const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('last_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateCreateConversation = [
  body('type')
    .isIn(['direct', 'group'])
    .withMessage('Type must be either direct or group'),
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('participant_ids')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  handleValidationErrors
];

export const validateSendMessage = [
  body('conversation_id')
    .isInt({ min: 1 })
    .withMessage('Valid conversation ID is required'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required'),
  body('message_type')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Message type must be text, image, or file'),
  handleValidationErrors
];
