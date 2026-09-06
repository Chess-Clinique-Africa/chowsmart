import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  restaurantCreateSchema,
  restaurantListQuerySchema,
  restaurantUpdateSchema,
} from '../validators/restaurant.js';

const router = Router();

router.get('/', validateQuery(restaurantListQuerySchema), restaurantController.list);
router.get('/:slug', restaurantController.getBySlug);
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(restaurantCreateSchema),
  restaurantController.create
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateBody(restaurantUpdateSchema),
  restaurantController.update
);
router.delete('/:id', authenticate, requireAdmin, restaurantController.remove);

export default router;
