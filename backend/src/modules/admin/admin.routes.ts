import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './admin.controller';

const router = Router();

router.post('/admin/login', asyncHandler(controller.login));
router.get('/admin/verify', requireAdmin, controller.verify);
router.get('/admin/stats', requireAdmin, asyncHandler(controller.stats));

export default router;
