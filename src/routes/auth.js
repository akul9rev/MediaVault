import { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/auth.controller.js';
import protect from '../middleware/authentication/auth.js';
import { registerRules, loginRules } from '../validations/auth.validation.js';
import validate from '../middleware/validation/validate.js';

const router = Router();

// Public routes with validation schemas attached
router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginRules, validate, loginUser);

// Protected routes
router.get('/me', protect, getMe);

export default router;
