import { Router } from 'express';
import { listPendingMembers, rejectMember, updateMember, verifyMember } from '../controllers/membership.controller';
import { authenticateToken, requireActiveMember, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken, requireActiveMember, requireAdmin);

router.get('/pending', listPendingMembers);
router.patch('/verify', verifyMember);
router.patch('/reject', rejectMember);
router.put('/:id', updateMember);

export default router;
