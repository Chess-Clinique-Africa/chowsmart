import { z } from 'zod';
import { Difficulty } from '@prisma/client';
import { paginationSchema } from './common.js';

export const recipeListQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  cuisine: z.string().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  dietaryTag: z.string().optional(),
  maxPrep: z.coerce.number().int().positive().optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  breadSlug: z.string().optional(),
});

const recipeIngredientSchema = z.object({
  ingredient: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

export const recipeCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().min(1),
  image: z.string().min(1),
  prepTime: z.number().int().nonnegative(),
  cookTime: z.number().int().nonnegative(),
  servings: z.number().int().positive(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  instructions: z.array(z.string()).min(1),
  calories: z.number().int().optional().nullable(),
  protein: z.number().optional().nullable(),
  carbohydrates: z.number().optional().nullable(),
  fat: z.number().optional().nullable(),
  allergens: z.array(z.string()).default([]),
  dietaryTags: z.array(z.string()).default([]),
  cuisineId: z.string().optional().nullable(),
  breadSlug: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  ingredients: z.array(recipeIngredientSchema).optional(),
});

export const recipeUpdateSchema = recipeCreateSchema.partial();

export type RecipeListQuery = z.infer<typeof recipeListQuerySchema>;
export type RecipeCreateInput = z.infer<typeof recipeCreateSchema>;
export type RecipeUpdateInput = z.infer<typeof recipeUpdateSchema>;
