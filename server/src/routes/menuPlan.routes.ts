import { Router } from 'express';
import * as menuPlanController from '../controllers/menuPlan.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { paginationSchema } from '../validators/common.js';
import {
  menuPlanCreateSchema,
  menuPlanUpdateSchema,
} from '../validators/menuPlan.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(paginationSchema), menuPlanController.list);
router.get('/:id', menuPlanController.getById);
router.post('/', validateBody(menuPlanCreateSchema), menuPlanController.create);
router.put('/:id', validateBody(menuPlanUpdateSchema), menuPlanController.update);
router.delete('/:id', menuPlanController.remove);

export default router;
