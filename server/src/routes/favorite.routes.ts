import { Router } from 'express';
import * as favoriteController from '../controllers/favorite.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  favoriteCreateSchema,
  favoriteListQuerySchema,
} from '../validators/favorite.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(favoriteListQuerySchema), favoriteController.list);
router.post('/', validateBody(favoriteCreateSchema), favoriteController.create);
router.delete('/:id', favoriteController.remove);

export default router;
