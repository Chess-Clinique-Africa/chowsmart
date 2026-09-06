import { Router } from 'express';
import * as recipeController from '../controllers/recipe.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  recipeCreateSchema,
  recipeListQuerySchema,
  recipeUpdateSchema,
} from '../validators/recipe.js';

const router = Router();

router.get('/', validateQuery(recipeListQuerySchema), recipeController.list);
router.get('/:slug', recipeController.getBySlug);
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(recipeCreateSchema),
  recipeController.create
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateBody(recipeUpdateSchema),
  recipeController.update
);
router.delete('/:id', authenticate, requireAdmin, recipeController.remove);

export default router;
