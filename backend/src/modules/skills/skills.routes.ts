import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './skills.controller';

const router = Router();

router.get('/skills', asyncHandler(controller.list)); // public

// admin only
router.post('/skills', requireAdmin, asyncHandler(controller.create));
router.put('/skills/:id', requireAdmin, asyncHandler(controller.update));
router.delete('/skills/:id', requireAdmin, asyncHandler(controller.remove));

export default router;
