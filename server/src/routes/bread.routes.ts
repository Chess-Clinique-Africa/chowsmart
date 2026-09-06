import { Router } from 'express';
import * as breadController from '../controllers/bread.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  breadCreateSchema,
  breadListQuerySchema,
  breadUpdateSchema,
} from '../validators/bread.js';

const router = Router();

router.get('/', validateQuery(breadListQuerySchema), breadController.list);
router.get('/:slug', breadController.getBySlug);
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(breadCreateSchema),
  breadController.create
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateBody(breadUpdateSchema),
  breadController.update
);
router.delete('/:id', authenticate, requireAdmin, breadController.remove);

export default router;
