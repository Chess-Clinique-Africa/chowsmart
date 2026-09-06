import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginationMeta } from '../validators/common.js';
import type {
  MenuItemCreateInput,
  MenuItemListQuery,
  MenuItemUpdateInput,
} from '../validators/menuItem.js';

export async function list(query: MenuItemListQuery) {
  const { page, limit, restaurantId, category, search, featured, available } = query;
  const where: Prisma.MenuItemWhereInput = {};

  if (restaurantId) where.restaurantId = restaurantId;
  if (category) where.category = { equals: category, mode: 'insensitive' };
  if (featured !== undefined) where.featured = featured;
  if (available !== undefined) where.available = available;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.menuItem.count({ where }),
    prisma.menuItem.findMany({
      where,
      include: {
        restaurant: {
          select: { id: true, name: true, slug: true, city: true },
        },
      },
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items,
    meta: paginationMeta(total, page, limit),
  };
}

export async function getById(id: string) {
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      restaurant: {
        select: { id: true, name: true, slug: true, city: true, image: true },
      },
    },
  });
  if (!item) {
    throw new AppError('Menu item not found', 404, 'NOT_FOUND');
  }
  return item;
}

export async function listByRestaurant(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
  }
  return prisma.menuItem.findMany({
    where: { restaurantId },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

export async function create(input: MenuItemCreateInput) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: input.restaurantId } });
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
  }

  return prisma.menuItem.create({
    data: {
      ...input,
      image: input.image ?? undefined,
      calories: input.calories ?? undefined,
    },
    include: {
      restaurant: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function update(id: string, input: MenuItemUpdateInput) {
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Menu item not found', 404, 'NOT_FOUND');
  }

  if (input.restaurantId) {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: input.restaurantId } });
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
    }
  }

  return prisma.menuItem.update({
    where: { id },
    data: {
      ...input,
      image: input.image === null ? null : input.image,
      calories: input.calories === null ? null : input.calories,
    },
    include: {
      restaurant: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function remove(id: string) {
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Menu item not found', 404, 'NOT_FOUND');
  }
  await prisma.menuItem.delete({ where: { id } });
  return { id };
}
