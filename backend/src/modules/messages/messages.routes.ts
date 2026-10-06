import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './messages.controller';

const router = Router();

// admin only
router.get('/messages', requireAdmin, asyncHandler(controller.list));
router.patch('/messages/:id', requireAdmin, asyncHandler(controller.markRead));
router.delete('/messages/:id', requireAdmin, asyncHandler(controller.remove));

export default router;
