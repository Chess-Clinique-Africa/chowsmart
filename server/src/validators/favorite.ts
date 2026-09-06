import { z } from 'zod';
import { FavoriteType } from '@prisma/client';
import { paginationSchema } from './common.js';

export const favoriteListQuerySchema = paginationSchema.extend({
  itemType: z.nativeEnum(FavoriteType).optional(),
});

export const favoriteCreateSchema = z.object({
  itemType: z.nativeEnum(FavoriteType),
  itemId: z.string().min(1),
});

export type FavoriteCreateInput = z.infer<typeof favoriteCreateSchema>;
