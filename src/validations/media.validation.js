import { body } from 'express-validator';

/**
 * Media Input Validation Rules
 */
export const uploadMediaRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('unlock_price')
    .notEmpty()
    .withMessage('Unlock price is required')
    .isInt({ min: 0 })
    .withMessage('Unlock price must be a non-negative integer')
];
