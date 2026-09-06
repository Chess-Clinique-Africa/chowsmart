import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { slugify } from '../utils/slugify.js';
import { paginationMeta } from '../validators/common.js';
import type {
  BreadCreateInput,
  BreadListQuery,
  BreadUpdateInput,
} from '../validators/bread.js';

const breadDetailInclude = {
  ingredients: { orderBy: { sortOrder: 'asc' as const } },
  nutrition: true,
  pairings: { orderBy: { foodName: 'asc' as const } },
} satisfies Prisma.BreadInclude;

export async function list(query: BreadListQuery) {
  const { page, limit, search, category, featured } = query;
  const where: Prisma.BreadWhereInput = {};

  if (category) where.category = { equals: category, mode: 'insensitive' };
  if (featured !== undefined) where.featured = featured;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { subtitle: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.bread.count({ where }),
    prisma.bread.findMany({
      where,
      include: {
        nutrition: true,
        _count: { select: { ingredients: true, pairings: true } },
      },
      orderBy: [{ number: 'asc' }, { name: 'asc' }],
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
  const bread = await prisma.bread.findUnique({
    where: { slug },
    include: breadDetailInclude,
  });
  if (!bread) {
    throw new AppError('Bread not found', 404, 'NOT_FOUND');
  }
  return bread;
}

export async function create(input: BreadCreateInput) {
  const slug = input.slug?.trim() || slugify(input.name);
  const { ingredients, nutrition, pairings, ...rest } = input;

  return prisma.bread.create({
    data: {
      ...rest,
      slug,
      portionNote: rest.portionNote ?? undefined,
      prepMinutes: rest.prepMinutes ?? undefined,
      reference: rest.reference ?? undefined,
      ingredients: ingredients?.length
        ? {
            create: ingredients.map((item, index) => ({
              ingredient: item.ingredient,
              quantity: item.quantity,
              unit: item.unit,
              sortOrder: item.sortOrder ?? index,
            })),
          }
        : undefined,
      nutrition: nutrition
        ? {
            create: {
              ...nutrition,
              perNote: nutrition.perNote ?? 'Per modelled portion',
            },
          }
        : undefined,
      pairings: pairings?.length
        ? {
            create: pairings.map((p) => ({
              foodName: p.foodName,
              description: p.description,
              image: p.image ?? undefined,
              category: p.category,
            })),
          }
        : undefined,
    },
    include: breadDetailInclude,
  });
}

export async function update(id: string, input: BreadUpdateInput) {
  const existing = await prisma.bread.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Bread not found', 404, 'NOT_FOUND');
  }

  const { ingredients, nutrition, pairings, ...rest } = input;
  const slug =
    rest.slug?.trim() ||
    (rest.name ? slugify(rest.name) : undefined);

  return prisma.$transaction(async (tx) => {
    if (ingredients) {
      await tx.breadIngredient.deleteMany({ where: { breadId: id } });
      if (ingredients.length) {
        await tx.breadIngredient.createMany({
          data: ingredients.map((item, index) => ({
            breadId: id,
            ingredient: item.ingredient,
            quantity: item.quantity,
            unit: item.unit,
            sortOrder: item.sortOrder ?? index,
          })),
        });
      }
    }

    if (nutrition) {
      await tx.breadNutrition.upsert({
        where: { breadId: id },
        create: {
          breadId: id,
          ...nutrition,
          perNote: nutrition.perNote ?? 'Per modelled portion',
        },
        update: {
          ...nutrition,
          perNote: nutrition.perNote ?? undefined,
        },
      });
    }

    if (pairings) {
      await tx.pairing.deleteMany({ where: { breadId: id } });
      if (pairings.length) {
        await tx.pairing.createMany({
          data: pairings.map((p) => ({
            breadId: id,
            foodName: p.foodName,
            description: p.description,
            image: p.image ?? undefined,
            category: p.category,
          })),
        });
      }
    }

    return tx.bread.update({
      where: { id },
      data: {
        ...rest,
        ...(slug ? { slug } : {}),
        portionNote: rest.portionNote === null ? null : rest.portionNote,
        prepMinutes: rest.prepMinutes === null ? null : rest.prepMinutes,
        reference: rest.reference === null ? null : rest.reference,
      },
      include: breadDetailInclude,
    });
  });
}

export async function remove(id: string) {
  const existing = await prisma.bread.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Bread not found', 404, 'NOT_FOUND');
  }
  await prisma.bread.delete({ where: { id } });
  return { id };
}
