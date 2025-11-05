// Create option
import { NextRequest } from "next/server";
import { OptionService } from "@/src/services/option.service";
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
      categoryId,
      label,
      description,
      price,
      sku,
      imageUrl,
      isDefault,
    } = body;

    if (!token) {
      return fail("Edit token is required", "VALIDATION_ERROR", 400);
    }

    if (!categoryId || !label || price === undefined) {
      return fail(
        "Category ID, label, and price are required",
        "VALIDATION_ERROR",
        400
      );
    }

    // 🔒 Verify token validity and decode client/configurator info
    const payload = await verifyEditToken(token);

    if (!payload || !payload.clientId || !payload.configuratorId) {
      return unauthorized("Invalid or expired edit token");
    }

    // ✅ Verify category belongs to configurator & client
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        isPrimary: true,
        configurator: { select: { id: true, clientId: true } },
      },
    });

    if (!category) return notFound("Category not found");

    if (
      category.configurator.id !== payload.configuratorId ||
      category.configurator.clientId !== payload.clientId
    ) {
      return unauthorized("Ownership mismatch");
    }

    // ✅ Enforce one primary category limit is already elsewhere
    // Here we enforce primary-option cap if adding to primary category

    if (category.isPrimary) {
      const totalPrimaryOptions = await prisma.option.count({
        where: {
          category: {
            isPrimary: true,
            configurator: {
              clientId: payload.clientId,
            },
          },
        },
      });

      // ✅ Hard stop at 10 options
      if (totalPrimaryOptions >= 10) {
        return fail(
          "You hit your limit of 10 options. Please upgrade to add more.",
          "PLAN_LIMIT",
          403
        );
      }
    }

    // ✅ Create option
    const option = await OptionService.create(categoryId, {
      label,
      description,
      price: parseFloat(price),
      sku,
      imageUrl,
      isDefault,
    });

    return created(option, "Option created");
  } catch (error: any) {
    console.error("Option create error:", error);
    return fail(
      error.message || "Failed to create option",
      "CREATE_ERROR",
      500
    );
  }
}
