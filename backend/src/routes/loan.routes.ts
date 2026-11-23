import { Router } from 'express';
import { createLoan } from '../controllers/loan.controller';
import { approveLoan, cancelLoan, rejectLoan } from '../controllers/loan-decision.controller';
import { getAllLoans, getMyLoans } from '../controllers/loan-query.controller';
import { returnLoan } from '../controllers/loan-return.controller';
import { authenticateToken, requireActiveMember, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', authenticateToken, requireActiveMember, getMyLoans);
router.get('/', authenticateToken, requireActiveMember, requireAdmin, getAllLoans);
router.post('/', authenticateToken, requireActiveMember, createLoan);
router.patch('/:id/approve', authenticateToken, requireActiveMember, approveLoan);
router.patch('/:id/reject', authenticateToken, requireActiveMember, rejectLoan);
router.patch('/:id/cancel', authenticateToken, requireActiveMember, cancelLoan);
router.patch('/:id/return', authenticateToken, requireActiveMember, returnLoan);

export default router;
