// src/app/api/option/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { OptionService } from "@/src/services/option.service";
import { success, fail, unauthorized, notFound } from "@/src/lib/response";
import { verifyEditToken } from "@/src/lib/verify-edit-token";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, token, ...data } = body;

    if (!id) return fail("Option ID is required", "VALIDATION_ERROR");

    const { clientId, configuratorId } = await verifyEditToken(token);

    // Fetch option to confirm ownership through category -> configurator -> client
    const option = await prisma.option.findUnique({
      where: { id },
      select: {
        id: true,
        category: {
          select: { configurator: { select: { id: true, clientId: true } } },
        },
      },
    });

    if (!option) return notFound("Option not found");

    const belongsToConfigurator =
      option.category.configurator.id === configuratorId;
    const belongsToClient = option.category.configurator.clientId === clientId;

    if (!belongsToConfigurator || !belongsToClient)
      return unauthorized("Ownership mismatch");

    if (data.price !== undefined) data.price = parseFloat(data.price);

    const updated = await OptionService.update(id, data);
    return success(updated, "Option updated");
  } catch (error: any) {
    console.error("option update error:", error);
    return fail(error.message, "UPDATE_ERROR", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const token = searchParams.get("token") || "";

    if (!id) return fail("Option ID is required", "VALIDATION_ERROR");

    const { clientId, configuratorId } = await verifyEditToken(token);

    const option = await prisma.option.findUnique({
      where: { id },
      select: {
        id: true,
        category: {
          select: { configurator: { select: { id: true, clientId: true } } },
        },
      },
    });

    if (!option) return notFound("Option not found");

    if (
      option.category.configurator.id !== configuratorId ||
      option.category.configurator.clientId !== clientId
    ) {
      return unauthorized("Ownership mismatch");
    }

    await OptionService.delete(id);
    return success(null, "Option deleted");
  } catch (error: any) {
    console.error("option delete error:", error);
    return fail(error.message, "DELETE_ERROR", 500);
  }
}
