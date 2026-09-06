import { z } from 'zod';
import { paginationSchema } from './common.js';

export const menuItemListQuerySchema = paginationSchema.extend({
  restaurantId: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  available: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export const menuItemCreateSchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  category: z.string().min(1),
  image: z.string().optional().nullable(),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  calories: z.number().int().optional().nullable(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const menuItemUpdateSchema = menuItemCreateSchema.partial();

export type MenuItemListQuery = z.infer<typeof menuItemListQuerySchema>;
export type MenuItemCreateInput = z.infer<typeof menuItemCreateSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;
