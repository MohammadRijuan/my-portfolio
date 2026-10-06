import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './contact.controller';

const router = Router();

router.post('/contact', asyncHandler(controller.submit));

export default router;
