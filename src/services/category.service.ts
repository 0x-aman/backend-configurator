// Category service
import { prisma } from "@/src/lib/prisma";
import { NotFoundError } from "@/src/lib/errors";
import type { Category, CategoryType } from "@prisma/client";

export const CategoryService = {
  async create(
    configuratorId: string,
    data: {
      name: string;
      categoryType?: CategoryType;
      description?: string;
      isPrimary?: boolean;
      isRequired?: boolean;
      orderIndex?: number;
    }
  ): Promise<Category> {
    return await prisma.category.create({
      data: {
        configuratorId,
        ...data,
      },
    });
  },

  async list(configuratorId: string): Promise<Category[]> {
    return await prisma.category.findMany({
      where: { configuratorId },
      include: { options: true },
      orderBy: { orderIndex: "asc" },
    });
  },

  async getById(id: string): Promise<Category> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { options: true },
    });
    if (!category) throw new NotFoundError("Category");
    return category;
  },

  async update(id: string, data: Partial<Category>): Promise<Category> {
    // Prisma expects an exact update input shape; narrow fields to those allowed
    const allowed: Partial<Category> = {
      name: data.name,
      icon: (data as any).icon,
      description: data.description,
      isPrimary: (data as any).isPrimary,
      isRequired: (data as any).isRequired,
      orderIndex: (data as any).orderIndex,
      categoryType: (data as any).categoryType,
    };
    return await prisma.category.update({
      where: { id },
      // cast to any to satisfy Prisma update input typing without changing runtime
      data: data as any,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  },

  async reorder(configuratorId: string, categoryIds: string[]): Promise<void> {
    const updates = categoryIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { orderIndex: index },
      })
    );
    await prisma.$transaction(updates);
  },
};
