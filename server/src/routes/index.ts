import { Router } from 'express';
import authRoutes from './auth.routes.js';
import restaurantRoutes from './restaurant.routes.js';
import menuItemRoutes from './menuItem.routes.js';
import breadRoutes from './bread.routes.js';
import recipeRoutes from './recipe.routes.js';
import menuPlanRoutes from './menuPlan.routes.js';
import favoriteRoutes from './favorite.routes.js';
import searchRoutes from './search.routes.js';
import adminRoutes from './admin.routes.js';
import aiRoutes from './ai.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/breads', breadRoutes);
router.use('/recipes', recipeRoutes);
router.use('/menu-plans', menuPlanRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);

export default router;
