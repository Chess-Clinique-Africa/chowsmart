import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { slugify } from '../utils/slugify.js';
import { paginationMeta } from '../validators/common.js';
import type {
  RestaurantCreateInput,
  RestaurantListQuery,
  RestaurantUpdateInput,
} from '../validators/restaurant.js';

const cuisineInclude = {
  cuisines: {
    include: { cuisine: true },
  },
} satisfies Prisma.RestaurantInclude;

export async function list(query: RestaurantListQuery) {
  const { page, limit, search, cuisine, city, price, rating, featured } = query;
  const where: Prisma.RestaurantWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (city) where.city = { equals: city, mode: 'insensitive' };
  if (price) where.priceRange = price;
  if (rating !== undefined) where.rating = { gte: rating };
  if (featured !== undefined) where.featured = featured;
  if (cuisine) {
    where.cuisines = {
      some: {
        cuisine: {
          OR: [
            { slug: { equals: cuisine, mode: 'insensitive' } },
            { name: { equals: cuisine, mode: 'insensitive' } },
          ],
        },
      },
    };
  }

  const [total, items] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.findMany({
      where,
      include: {
        ...cuisineInclude,
        menuItems: {
          where: { available: true },
          orderBy: [{ featured: 'desc' }, { name: 'asc' }],
          take: 3,
        },
      },
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }, { name: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items,
    meta: paginationMeta(total, page, limit),
  };
}

export async function getBySlug(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      ...cuisineInclude,
      menuItems: {
        where: { available: true },
        orderBy: [{ featured: 'desc' }, { category: 'asc' }, { name: 'asc' }],
      },
    },
  });
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
  }
  return restaurant;
}

export async function create(input: RestaurantCreateInput) {
  const slug = input.slug?.trim() || slugify(input.name);
  const { cuisineIds, openingHours, ...rest } = input;

  return prisma.restaurant.create({
    data: {
      ...rest,
      slug,
      openingHours: openingHours === null || openingHours === undefined
        ? undefined
        : (openingHours as Prisma.InputJsonValue),
      cuisines: cuisineIds?.length
        ? {
            create: cuisineIds.map((cuisineId) => ({ cuisineId })),
          }
        : undefined,
    },
    include: cuisineInclude,
  });
}

export async function update(id: string, input: RestaurantUpdateInput) {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
  }

  const { cuisineIds, openingHours, ...rest } = input;
  const slug =
    rest.slug?.trim() ||
    (rest.name ? slugify(rest.name) : undefined);

  return prisma.$transaction(async (tx) => {
    if (cuisineIds) {
      await tx.restaurantCuisine.deleteMany({ where: { restaurantId: id } });
      if (cuisineIds.length) {
        await tx.restaurantCuisine.createMany({
          data: cuisineIds.map((cuisineId) => ({ restaurantId: id, cuisineId })),
        });
      }
    }

    return tx.restaurant.update({
      where: { id },
      data: {
        ...rest,
        ...(slug ? { slug } : {}),
        ...(openingHours !== undefined
          ? {
              openingHours:
                openingHours === null
                  ? Prisma.DbNull
                  : (openingHours as Prisma.InputJsonValue),
            }
          : {}),
      },
      include: cuisineInclude,
    });
  });
}

export async function remove(id: string) {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Restaurant not found', 404, 'NOT_FOUND');
  }
  await prisma.restaurant.delete({ where: { id } });
  return { id };
}
