import { Router } from 'express';
import { listPendingMembers, rejectMember, verifyMember } from '../controllers/membership.controller';
import { authenticateToken, requireActiveMember, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken, requireActiveMember, requireAdmin);

router.get('/pending', listPendingMembers);
router.patch('/verify', verifyMember);
router.patch('/reject', rejectMember);

export default router;
