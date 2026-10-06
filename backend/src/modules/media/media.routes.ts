import express, { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import * as controller from './media.controller';
import { ALLOWED_MEDIA_TYPES } from './media.types';

const router = Router();

// admin only; express.raw reads the file bytes (max 4 MB)
router.post('/upload', requireAdmin, express.raw({ type: ALLOWED_MEDIA_TYPES, limit: '4mb' }), asyncHandler(controller.upload));
router.get('/media/:id', asyncHandler(controller.serve)); // public

export default router;
