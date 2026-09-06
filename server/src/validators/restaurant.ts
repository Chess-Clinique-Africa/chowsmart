import { z } from 'zod';
import { paginationSchema } from './common.js';

export const restaurantListQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  cuisine: z.string().optional(),
  city: z.string().optional(),
  price: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export const restaurantCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional().nullable(),
  country: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  openingHours: z.unknown().optional().nullable(),
  priceRange: z.string().min(1),
  rating: z.number().min(0).max(5).optional(),
  image: z.string().min(1),
  featured: z.boolean().optional(),
  cuisineIds: z.array(z.string()).optional(),
});

export const restaurantUpdateSchema = restaurantCreateSchema.partial();

export type RestaurantListQuery = z.infer<typeof restaurantListQuerySchema>;
export type RestaurantCreateInput = z.infer<typeof restaurantCreateSchema>;
export type RestaurantUpdateInput = z.infer<typeof restaurantUpdateSchema>;
