import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './projects.controller';

const router = Router();

router.get('/projects', asyncHandler(controller.list)); // public

// admin only ("/projects/reorder" must stay above "/projects/:id")
router.post('/projects/reorder', requireAdmin, asyncHandler(controller.reorder));
router.post('/projects', requireAdmin, asyncHandler(controller.create));
router.put('/projects/:id', requireAdmin, asyncHandler(controller.update));
router.delete('/projects/:id', requireAdmin, asyncHandler(controller.remove));

export default router;
