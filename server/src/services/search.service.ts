import { prisma } from '../config/prisma.js';

export async function search(q: string, limit = 8) {
  const term = q.trim();
  if (!term) {
    return {
      restaurants: [],
      recipes: [],
      breads: [],
      menuItems: [],
      cuisines: [],
    };
  }

  const [restaurants, recipes, breads, menuItems, cuisines] = await Promise.all([
    prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { city: { contains: term, mode: 'insensitive' } },
        ],
      },
      include: { cuisines: { include: { cuisine: true } } },
      take: limit,
      orderBy: { rating: 'desc' },
    }),
    prisma.recipe.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { dietaryTags: { has: term } },
        ],
      },
      include: { cuisine: true },
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.bread.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { subtitle: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { number: 'asc' },
    }),
    prisma.menuItem.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
        ],
      },
      include: {
        restaurant: { select: { id: true, name: true, slug: true } },
      },
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.cuisine.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
    }),
  ]);

  return { restaurants, recipes, breads, menuItems, cuisines };
}
