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
      return fail("Configurator ID and name are required", "VALIDATION_ERROR");
    }

    // 🔒 Verify token validity and decode client/configurator info
    const payload = await verifyEditToken(token);

    if (!payload || !payload.clientId || !payload.configuratorId) {
      return unauthorized("Invalid or expired edit token");
    }

    // Verify that the configuratorId in the token matches the one in the request
    if (String(payload.configuratorId) !== String(configuratorId)) {
      return unauthorized("Configurator mismatch");
    }

    // Verify configurator exists and ownership matches
    const configurator = await prisma.configurator.findUnique({
      where: { id: configuratorId },
      select: { id: true, clientId: true },
    });

    if (!configurator) {
      return notFound("Configurator not found");
    }

    if (configurator.clientId !== payload.clientId) {
      return unauthorized("Ownership mismatch");
    }

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
