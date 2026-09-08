import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/bootstrap-status', adminController.bootstrapStatus);
router.post('/db/migrate', adminController.requireAdminOrBootstrap, adminController.migrate);
router.post('/db/seed', adminController.requireAdminOrBootstrap, adminController.seed);
router.post('/db/setup', adminController.requireAdminOrBootstrap, adminController.setup);

router.use(authenticate, requireAdmin);
router.get('/stats', adminController.stats);

export default router;
