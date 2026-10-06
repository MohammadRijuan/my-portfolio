import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './site.controller';

const router = Router();

router.get('/health', controller.health);
router.get('/site', asyncHandler(controller.getSite));
router.get('/site/version', asyncHandler(controller.getVersion));

export default router;
