import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { slugify } from '../utils/slugify.js';
import { paginationMeta } from '../validators/common.js';
import type {
  RecipeCreateInput,
  RecipeListQuery,
  RecipeUpdateInput,
} from '../validators/recipe.js';

const recipeDetailInclude = {
  cuisine: true,
  ingredients: { orderBy: { sortOrder: 'asc' as const } },
} satisfies Prisma.RecipeInclude;

export async function list(query: RecipeListQuery & { maxPrep?: number }) {
  const { page, limit, search, cuisine, difficulty, dietaryTag, featured, breadSlug, maxPrep } =
    query;
  const where: Prisma.RecipeWhereInput = {};

  if (difficulty) where.difficulty = difficulty;
  if (featured !== undefined) where.featured = featured;
  if (breadSlug) where.breadSlug = breadSlug;
  if (dietaryTag) where.dietaryTags = { has: dietaryTag };
  if (maxPrep !== undefined) where.prepTime = { lte: maxPrep };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (cuisine) {
    where.cuisine = {
      OR: [
        { slug: { equals: cuisine, mode: 'insensitive' } },
        { name: { equals: cuisine, mode: 'insensitive' } },
      ],
    };
  }

  const [total, items] = await Promise.all([
    prisma.recipe.count({ where }),
    prisma.recipe.findMany({
      where,
      include: {
        cuisine: true,
        _count: { select: { ingredients: true } },
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

export async function getBySlug(slug: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: recipeDetailInclude,
  });
  if (!recipe) {
    throw new AppError('Recipe not found', 404, 'NOT_FOUND');
  }
  return recipe;
}

export async function create(input: RecipeCreateInput) {
  const slug = input.slug?.trim() || slugify(input.name);
  const { ingredients, ...rest } = input;

  return prisma.recipe.create({
    data: {
      ...rest,
      slug,
      cuisineId: rest.cuisineId ?? undefined,
      breadSlug: rest.breadSlug ?? undefined,
      calories: rest.calories ?? undefined,
      protein: rest.protein ?? undefined,
      carbohydrates: rest.carbohydrates ?? undefined,
      fat: rest.fat ?? undefined,
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
    },
    include: recipeDetailInclude,
  });
}

export async function update(id: string, input: RecipeUpdateInput) {
  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Recipe not found', 404, 'NOT_FOUND');
  }

  const { ingredients, ...rest } = input;
  const slug =
    rest.slug?.trim() ||
    (rest.name ? slugify(rest.name) : undefined);

  return prisma.$transaction(async (tx) => {
    if (ingredients) {
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      if (ingredients.length) {
        await tx.recipeIngredient.createMany({
          data: ingredients.map((item, index) => ({
            recipeId: id,
            ingredient: item.ingredient,
            quantity: item.quantity,
            unit: item.unit,
            sortOrder: item.sortOrder ?? index,
          })),
        });
      }
    }

    return tx.recipe.update({
      where: { id },
      data: {
        ...rest,
        ...(slug ? { slug } : {}),
        cuisineId: rest.cuisineId === null ? null : rest.cuisineId,
        breadSlug: rest.breadSlug === null ? null : rest.breadSlug,
        calories: rest.calories === null ? null : rest.calories,
        protein: rest.protein === null ? null : rest.protein,
        carbohydrates: rest.carbohydrates === null ? null : rest.carbohydrates,
        fat: rest.fat === null ? null : rest.fat,
      },
      include: recipeDetailInclude,
    });
  });
}

export async function remove(id: string) {
  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Recipe not found', 404, 'NOT_FOUND');
  }
  await prisma.recipe.delete({ where: { id } });
  return { id };
}
