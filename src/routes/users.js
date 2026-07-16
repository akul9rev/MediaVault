import { Router } from 'express';
import { getUserProfile } from '../controllers/users.controller.js';
import protect from '../middleware/authentication/auth.js';

const router = Router();

router.get('/:id', protect, getUserProfile);

export default router;
