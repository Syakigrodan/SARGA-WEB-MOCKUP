import { Router } from 'express';
import { getCatalog, getItemById, createItem } from '../controllers/item.controller';
import { authenticateToken, requireActiveMember } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, requireActiveMember, getCatalog);
router.get('/:id', authenticateToken, requireActiveMember, getItemById);
router.post('/', authenticateToken, requireActiveMember, createItem);

export default router;
