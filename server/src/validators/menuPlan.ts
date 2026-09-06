import { z } from 'zod';
import { MenuItemType } from '@prisma/client';
import { paginationSchema } from './common.js';

export const menuPlanListQuerySchema = paginationSchema;

const menuPlanItemSchema = z.object({
  itemType: z.nativeEnum(MenuItemType),
  itemId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  notes: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  calories: z.number().int().optional().nullable(),
  price: z.number().optional().nullable(),
});

export const menuPlanCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  items: z.array(menuPlanItemSchema).default([]),
});

export const menuPlanUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  items: z.array(menuPlanItemSchema).optional(),
});

export type MenuPlanCreateInput = z.infer<typeof menuPlanCreateSchema>;
export type MenuPlanUpdateInput = z.infer<typeof menuPlanUpdateSchema>;
