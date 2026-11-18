import { Router } from 'express';
import { getCatalog, getItemById, createItem } from '../controllers/item.controller';
import { authenticateToken, requireActiveMember } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getCatalog);
router.get('/:id', authenticateToken, getItemById);
router.post('/', authenticateToken, requireActiveMember, createItem);

export default router;
