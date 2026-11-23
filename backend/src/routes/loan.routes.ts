import { Router } from 'express';
import { createLoan } from '../controllers/loan.controller';
import { getAllLoans, getMyLoans } from '../controllers/loan-query.controller';
import { authenticateToken, requireActiveMember, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', authenticateToken, requireActiveMember, getMyLoans);
router.get('/', authenticateToken, requireActiveMember, requireAdmin, getAllLoans);
router.post('/', authenticateToken, requireActiveMember, createLoan);

export default router;
