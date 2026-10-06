import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './experiences.controller';

const router = Router();

router.get('/experiences', asyncHandler(controller.list)); // public

// admin only
router.post('/experiences', requireAdmin, asyncHandler(controller.create));
router.put('/experiences/:id', requireAdmin, asyncHandler(controller.update));
router.delete('/experiences/:id', requireAdmin, asyncHandler(controller.remove));

export default router;
