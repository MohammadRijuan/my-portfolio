import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './settings.controller';

const router = Router();

router.put('/settings', requireAdmin, asyncHandler(controller.update));

export default router;
