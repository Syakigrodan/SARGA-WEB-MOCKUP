import { Router } from 'express';
import { createAnnouncement, deleteAnnouncement, listAnnouncements } from '../controllers/announcement.controller';
import { authenticateToken, requireActiveMember, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken, requireActiveMember);

router.get('/', listAnnouncements);
router.post('/', requireAdmin, createAnnouncement);
router.delete('/:id', requireAdmin, deleteAnnouncement);

export default router;
