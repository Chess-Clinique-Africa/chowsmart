import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginationMeta } from '../validators/common.js';
import type { PaginationQuery } from '../validators/common.js';
import type {
  MenuPlanCreateInput,
  MenuPlanUpdateInput,
} from '../validators/menuPlan.js';

const itemsInclude = {
  items: { orderBy: { sortOrder: 'asc' as const } },
};

export async function list(userId: string, query: PaginationQuery) {
  const { page, limit } = query;
  const where = { userId };

  const [total, items] = await Promise.all([
    prisma.menuPlan.count({ where }),
    prisma.menuPlan.findMany({
      where,
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items,
    meta: paginationMeta(total, page, limit),
  };
}

export async function getById(userId: string, id: string) {
  const plan = await prisma.menuPlan.findFirst({
    where: { id, userId },
    include: itemsInclude,
  });
  if (!plan) {
    throw new AppError('Menu plan not found', 404, 'NOT_FOUND');
  }
  return plan;
}

export async function create(userId: string, input: MenuPlanCreateInput) {
  return prisma.menuPlan.create({
    data: {
      userId,
      name: input.name,
      description: input.description ?? undefined,
      items: input.items.length
        ? {
            create: input.items.map((item, index) => ({
              itemType: item.itemType,
              itemId: item.itemId,
              name: item.name,
              quantity: item.quantity,
              notes: item.notes ?? undefined,
              sortOrder: item.sortOrder ?? index,
              calories: item.calories ?? undefined,
              price: item.price ?? undefined,
            })),
          }
        : undefined,
    },
    include: itemsInclude,
  });
}

export async function update(userId: string, id: string, input: MenuPlanUpdateInput) {
  const existing = await prisma.menuPlan.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new AppError('Menu plan not found', 404, 'NOT_FOUND');
  }

  return prisma.$transaction(async (tx) => {
    if (input.items) {
      await tx.menuPlanItem.deleteMany({ where: { menuPlanId: id } });
      if (input.items.length) {
        await tx.menuPlanItem.createMany({
          data: input.items.map((item, index) => ({
            menuPlanId: id,
            itemType: item.itemType,
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            notes: item.notes ?? undefined,
            sortOrder: item.sortOrder ?? index,
            calories: item.calories ?? undefined,
            price: item.price ?? undefined,
          })),
        });
      }
    }

    return tx.menuPlan.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description === null ? null : input.description,
      },
      include: itemsInclude,
    });
  });
}

export async function remove(userId: string, id: string) {
  const existing = await prisma.menuPlan.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new AppError('Menu plan not found', 404, 'NOT_FOUND');
  }
  await prisma.menuPlan.delete({ where: { id } });
  return { id };
}
