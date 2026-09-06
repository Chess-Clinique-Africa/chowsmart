import { FavoriteType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginationMeta } from '../validators/common.js';
import type { PaginationQuery } from '../validators/common.js';
import type { FavoriteCreateInput } from '../validators/favorite.js';

async function assertFavoriteTarget(itemType: FavoriteType, itemId: string) {
  let exists = false;
  switch (itemType) {
    case FavoriteType.RESTAURANT:
      exists = !!(await prisma.restaurant.findUnique({ where: { id: itemId }, select: { id: true } }));
      break;
    case FavoriteType.RECIPE:
      exists = !!(await prisma.recipe.findUnique({ where: { id: itemId }, select: { id: true } }));
      break;
    case FavoriteType.BREAD:
      exists = !!(await prisma.bread.findUnique({ where: { id: itemId }, select: { id: true } }));
      break;
    case FavoriteType.MENU_ITEM:
      exists = !!(await prisma.menuItem.findUnique({ where: { id: itemId }, select: { id: true } }));
      break;
  }
  if (!exists) {
    throw new AppError('Favorite target not found', 404, 'NOT_FOUND');
  }
}

export async function list(
  userId: string,
  query: PaginationQuery & { itemType?: FavoriteType }
) {
  const { page, limit, itemType } = query;
  const where = {
    userId,
    ...(itemType ? { itemType } : {}),
  };

  const [total, favorites] = await Promise.all([
    prisma.favorite.count({ where }),
    prisma.favorite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const enriched = await Promise.all(
    favorites.map(async (fav) => {
      let item: unknown = null;
      if (fav.itemType === FavoriteType.RESTAURANT) {
        item = await prisma.restaurant.findUnique({
          where: { id: fav.itemId },
          include: { cuisines: { include: { cuisine: true } } },
        });
      } else if (fav.itemType === FavoriteType.RECIPE) {
        item = await prisma.recipe.findUnique({
          where: { id: fav.itemId },
          include: { cuisine: true },
        });
      } else if (fav.itemType === FavoriteType.BREAD) {
        item = await prisma.bread.findUnique({ where: { id: fav.itemId } });
      } else if (fav.itemType === FavoriteType.MENU_ITEM) {
        item = await prisma.menuItem.findUnique({
          where: { id: fav.itemId },
          include: {
            restaurant: { select: { id: true, name: true, slug: true } },
          },
        });
      }
      return { ...fav, item };
    })
  );

  return {
    items: enriched,
    meta: paginationMeta(total, page, limit),
  };
}

export async function create(userId: string, input: FavoriteCreateInput) {
  await assertFavoriteTarget(input.itemType, input.itemId);

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_itemType_itemId: {
        userId,
        itemType: input.itemType,
        itemId: input.itemId,
      },
    },
  });
  if (existing) {
    throw new AppError('Already favorited', 409, 'CONFLICT');
  }

  return prisma.favorite.create({
    data: {
      userId,
      itemType: input.itemType,
      itemId: input.itemId,
    },
  });
}

export async function remove(userId: string, id: string) {
  const favorite = await prisma.favorite.findFirst({ where: { id, userId } });
  if (!favorite) {
    throw new AppError('Favorite not found', 404, 'NOT_FOUND');
  }
  await prisma.favorite.delete({ where: { id } });
  return { id };
}
