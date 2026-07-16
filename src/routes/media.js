import { Router } from 'express';
import { 
  uploadMedia, 
  getMediaFeed, 
  getMediaDetails, 
  unlockMedia, 
  getOriginalMedia,
  getPurchasedMedia
} from '../controllers/media.controller.js';
import protect from '../middleware/authentication/auth.js';
import upload from '../config/multer.js';
import { uploadMediaRules } from '../validations/media.validation.js';
import validate from '../middleware/validation/validate.js';

const router = Router();

// Protect all media endpoints via JWT verification middleware
router.use(protect);

router.post('/upload', upload.single('image'), uploadMediaRules, validate, uploadMedia);
router.get('/', getMediaFeed);

// CRITICAL: Declare '/purchased' route BEFORE '/:id' to avoid route conflict parsing
router.get('/purchased', getPurchasedMedia);

router.get('/:id', getMediaDetails);
router.post('/:id/unlock', unlockMedia);
router.get('/:id/original', getOriginalMedia);

export default router;
