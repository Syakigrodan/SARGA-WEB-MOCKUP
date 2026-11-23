import { Router } from 'express';
import { uploadImageHandler } from '../controllers/upload.controller';
import { authenticateToken, requireActiveMember } from '../middlewares/auth.middleware';
import { uploadImage, watermarkImage } from '../middlewares/upload.middleware';

const router = Router();

router.post(
  '/',
  authenticateToken,
  requireActiveMember,
  uploadImage,
  watermarkImage,
  uploadImageHandler
);

export default router;
