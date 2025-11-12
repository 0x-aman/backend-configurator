// Option service
import { prisma } from "@/src/lib/prisma";
import { NotFoundError } from "@/src/lib/errors";
import type { Option } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export const OptionService = {
  async create(
    categoryId: string,
    data: {
      label: string;
      description?: string;
      price: number | Decimal;
      sku?: string;
      imageUrl?: string;
      orderIndex?: number;
      isDefault?: boolean;
    }
  ): Promise<Option> {
    return await prisma.option.create({
      data: {
        categoryId,
        ...data,
        price: new Decimal(data.price.toString()),
      },
    });
  },

  async list(categoryId: string): Promise<Option[]> {
    return await prisma.option.findMany({
      where: { categoryId },
      orderBy: { orderIndex: "asc" },
    });
  },

  async getById(id: string): Promise<Option> {
    const option = await prisma.option.findUnique({ where: { id } });
    if (!option) throw new NotFoundError("Option");
    return option;
  },

  async update(id: string, data: Partial<Option>): Promise<Option> {
    if (data.price) {
      data.price = new Decimal(data.price.toString());
    }
    return await prisma.option.update({
      where: { id },
      data: data as any,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.option.delete({ where: { id } });
  },

  async reorder(categoryId: string, optionIds: string[]): Promise<void> {
    const updates = optionIds.map((id, index) =>
      prisma.option.update({
        where: { id },
        data: { orderIndex: index },
      })
    );
    await prisma.$transaction(updates);
  },

  async addIncompatibility(
    optionId: string,
    incompatibleOptionId: string,
    message?: string
  ): Promise<void> {
    await prisma.optionIncompatibility.create({
      data: {
        optionId,
        incompatibleOptionId,
        message,
      },
    });
  },

  async removeIncompatibility(
    optionId: string,
    incompatibleOptionId: string
  ): Promise<void> {
    await prisma.optionIncompatibility.deleteMany({
      where: {
        optionId,
        incompatibleOptionId,
      },
    });
  },

  async addDependency(
    optionId: string,
    dependsOnOptionId: string,
    type: string = "requires"
  ): Promise<void> {
    await prisma.optionDependency.create({
      data: {
        optionId,
        dependsOnOptionId,
        dependencyType: type,
      },
    });
  },
};
