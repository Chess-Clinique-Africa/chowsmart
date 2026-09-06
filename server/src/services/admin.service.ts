import { prisma } from '../config/prisma.js';

export async function getStats() {
  const [
    users,
    restaurants,
    recipes,
    breads,
    menuItems,
    menuPlans,
    favorites,
    cuisines,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.restaurant.count(),
    prisma.recipe.count(),
    prisma.bread.count(),
    prisma.menuItem.count(),
    prisma.menuPlan.count(),
    prisma.favorite.count(),
    prisma.cuisine.count(),
  ]);

  return {
    users,
    restaurants,
    recipes,
    breads,
    menuItems,
    menuPlans,
    favorites,
    cuisines,
  };
}
