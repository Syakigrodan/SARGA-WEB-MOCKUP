import { Router } from 'express';
import { getOrganizationStructure } from '../controllers/organization.controller';
import { authenticateToken, requireActiveMember } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken, requireActiveMember);

router.get('/:id/structure', getOrganizationStructure);

export default router;
