import { Router } from 'express';
import * as menuItemController from '../controllers/menuItem.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  menuItemCreateSchema,
  menuItemListQuerySchema,
  menuItemUpdateSchema,
} from '../validators/menuItem.js';

const router = Router();

router.get('/', validateQuery(menuItemListQuerySchema), menuItemController.list);
router.get('/restaurant/:restaurantId', menuItemController.listByRestaurant);
router.get('/:id', menuItemController.getById);
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(menuItemCreateSchema),
  menuItemController.create
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateBody(menuItemUpdateSchema),
  menuItemController.update
);
router.delete('/:id', authenticate, requireAdmin, menuItemController.remove);

export default router;
