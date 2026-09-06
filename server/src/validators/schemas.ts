import { z } from 'zod';
import { Difficulty, FavoriteType, MenuItemType } from '@prisma/client';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const restaurantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string().min(10),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().default('Nigeria'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  openingHours: z.record(z.string()).optional(),
  priceRange: z.enum(['₦', '₦₦', '₦₦₦']),
  rating: z.number().min(0).max(5).optional(),
  image: z.string().url(),
  featured: z.boolean().optional(),
  cuisineIds: z.array(z.string()).optional(),
});

export const menuItemSchema = z.object({
  restaurantId: z.string(),
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  category: z.string(),
  image: z.string().url().optional().nullable(),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  calories: z.number().int().optional().nullable(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const breadSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  subtitle: z.string(),
  description: z.string(),
  image: z.string().url(),
  category: z.string(),
  number: z.number().int(),
  allergens: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
  portionNote: z.string().optional(),
  prepMinutes: z.number().int().optional(),
  reference: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        ingredient: z.string(),
        quantity: z.number(),
        unit: z.string(),
        sortOrder: z.number().int().optional(),
      })
    )
    .optional(),
  nutrition: z
    .object({
      calories: z.number(),
      protein: z.number(),
      carbohydrates: z.number(),
      fat: z.number(),
      fibre: z.number(),
      sodium: z.number(),
      perNote: z.string().optional(),
    })
    .optional(),
  pairings: z
    .array(
      z.object({
        foodName: z.string(),
        description: z.string(),
        image: z.string().optional().nullable(),
        category: z.string(),
      })
    )
    .optional(),
});

export const recipeSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  description: z.string(),
  image: z.string().url(),
  prepTime: z.number().int(),
  cookTime: z.number().int(),
  servings: z.number().int(),
  difficulty: z.nativeEnum(Difficulty),
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
  ingredients: z
    .array(
      z.object({
        ingredient: z.string(),
        quantity: z.string(),
        unit: z.string(),
        sortOrder: z.number().int().optional(),
      })
    )
    .optional(),
});

export const favoriteSchema = z.object({
  itemType: z.nativeEnum(FavoriteType),
  itemId: z.string(),
});

export const menuPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        itemType: z.nativeEnum(MenuItemType),
        itemId: z.string(),
        name: z.string(),
        quantity: z.number().int().min(1).default(1),
        notes: z.string().optional().nullable(),
        sortOrder: z.number().int().optional(),
        calories: z.number().int().optional().nullable(),
        price: z.number().optional().nullable(),
      })
    )
    .default([]),
});

export const listQuerySchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  cuisine: z.string().optional(),
  priceRange: z.string().optional(),
  rating: z.coerce.number().optional(),
  featured: z.enum(['true', 'false']).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  maxPrep: z.coerce.number().optional(),
  dietary: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RestaurantInput = z.infer<typeof restaurantSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type BreadInput = z.infer<typeof breadSchema>;
export type RecipeInput = z.infer<typeof recipeSchema>;
export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type MenuPlanInput = z.infer<typeof menuPlanSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
