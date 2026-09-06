import { z } from 'zod';
import { paginationSchema } from './common.js';

export const breadListQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

const breadIngredientSchema = z.object({
  ingredient: z.string().min(1),
  quantity: z.number(),
  unit: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

const breadNutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbohydrates: z.number(),
  fat: z.number(),
  fibre: z.number(),
  sodium: z.number(),
  perNote: z.string().optional(),
});

const pairingSchema = z.object({
  foodName: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional().nullable(),
  category: z.string().min(1),
});

export const breadCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  category: z.string().min(1),
  number: z.number().int(),
  allergens: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
  portionNote: z.string().optional().nullable(),
  prepMinutes: z.number().int().optional().nullable(),
  reference: z.string().optional().nullable(),
  ingredients: z.array(breadIngredientSchema).optional(),
  nutrition: breadNutritionSchema.optional(),
  pairings: z.array(pairingSchema).optional(),
});

export const breadUpdateSchema = breadCreateSchema.partial();

export type BreadListQuery = z.infer<typeof breadListQuerySchema>;
export type BreadCreateInput = z.infer<typeof breadCreateSchema>;
export type BreadUpdateInput = z.infer<typeof breadUpdateSchema>;
