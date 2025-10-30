// src/app/api/category/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { CategoryService } from "@/src/services/category.service";
import { success, fail, unauthorized, notFound } from "@/src/lib/response";
import { verifyEditToken } from "@/src/lib/verify-edit-token";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, token, ...data } = body;

    if (!id) return fail("Category ID is required", "VALIDATION_ERROR");

    const { clientId, configuratorId } = await verifyEditToken(token);

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        configurator: { select: { id: true, clientId: true } },
      },
    });

    if (!category) return notFound("Category not found");

    if (
      category.configurator.id !== configuratorId ||
      category.configurator.clientId !== clientId
    ) {
      return unauthorized("Ownership mismatch");
    }

    const updated = await CategoryService.update(id, data);
    return success(updated, "Category updated");
  } catch (error: any) {
    console.error("category update error:", error);
    return fail(error.message, "UPDATE_ERROR", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const token = searchParams.get("token") || "";

    if (!id) return fail("Category ID is required", "VALIDATION_ERROR");

    const { clientId, configuratorId } = await verifyEditToken(token);

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        configurator: { select: { id: true, clientId: true } },
      },
    });

    if (!category) return notFound("Category not found");

    if (
      category.configurator.id !== configuratorId ||
      category.configurator.clientId !== clientId
    ) {
      return unauthorized("Ownership mismatch");
    }

    await CategoryService.delete(id);
    return success(null, "Category deleted");
  } catch (error: any) {
    console.error("category delete error:", error);
    return fail(error.message, "DELETE_ERROR", 500);
  }
}
