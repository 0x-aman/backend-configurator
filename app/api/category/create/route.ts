// Create category
import { NextRequest } from "next/server";
import { CategoryService } from "@/src/services/category.service";
import {
  success,
  fail,
  created,
  unauthorized,
  notFound,
} from "@/src/lib/response";
import { verifyEditToken } from "@/src/lib/verify-edit-token";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      configuratorId,
      name,
      categoryType,
      description,
      isPrimary,
      isRequired,
    } = body;

    if (!token) {
      return fail("Edit token is required", "VALIDATION_ERROR", 400);
    }

    if (!configuratorId || !name) {
      return fail(
        "Configurator ID and name are required",
        "VALIDATION_ERROR",
        400
      );
    }

    // 🔒 Verify token validity
    const payload = await verifyEditToken(token);
    if (!payload?.clientId || !payload?.configuratorId) {
      return unauthorized("Invalid or expired edit token");
    }

    // 🔒 Validate configurator match
    if (String(payload.configuratorId) !== String(configuratorId)) {
      return unauthorized("Configurator mismatch");
    }

    // 🔒 Verify configurator exists & belongs to client
    const configurator = await prisma.configurator.findUnique({
      where: { id: configuratorId },
      select: { id: true, clientId: true },
    });

    if (!configurator) return notFound("Configurator not found");
    if (configurator.clientId !== payload.clientId) {
      return unauthorized("Ownership mismatch");
    }

    // ✅ Enforce only one primary category per configurator
    if (isPrimary === true) {
      const existingPrimary = await prisma.category.findFirst({
        where: {
          configuratorId,
          isPrimary: true,
        },
        select: { id: true },
      });

      if (existingPrimary) {
        return fail(
          "Primary category already exists. Please upgrade to add more.",
          "PLAN_LIMIT",
          403
        );
      }
    }

    // ✅ Create category
    const category = await CategoryService.create(configuratorId, {
      name,
      categoryType,
      description,
      isPrimary,
      isRequired,
    });

    return created(category, "Category created");
  } catch (error: any) {
    console.error("Category create error:", error);
    return fail(
      error.message || "Failed to create category",
      "CREATE_ERROR",
      error.statusCode || 500
    );
  }
}
