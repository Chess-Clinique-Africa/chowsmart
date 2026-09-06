import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/stats', adminController.stats);

export default router;
