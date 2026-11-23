import { Router } from 'express';
import { createLoan } from '../controllers/loan.controller';
import { authenticateToken, requireActiveMember } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, requireActiveMember, createLoan);

export default router;
