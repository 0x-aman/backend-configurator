// Delete configurator
import { NextRequest } from "next/server";
import { ConfiguratorService } from "@/src/services/configurator.service";
import { success, fail, unauthorized, notFound } from "@/src/lib/response";
import { verifyEditToken } from "@/src/lib/verify-edit-token";
import { prisma } from "@/src/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const token = searchParams.get("token") || "";

    if (!id) {
      return fail("Configurator ID is required", "VALIDATION_ERROR");
    }

    if (!token) {
      return fail("Edit token is required", "VALIDATION_ERROR", 400);
    }

    // 🔒 Verify token validity and decode client/configurator info
    const payload = await verifyEditToken(token);

    if (!payload || !payload.clientId || !payload.configuratorId) {
      return unauthorized("Invalid or expired edit token");
    }

    // Verify that the configuratorId in the token matches the one being deleted
    if (String(payload.configuratorId) !== String(id)) {
      return unauthorized("Configurator mismatch");
    }

    // Verify configurator exists and ownership matches
    const configurator = await prisma.configurator.findUnique({
      where: { id },
      select: { id: true, clientId: true },
    });

    if (!configurator) {
      return notFound("Configurator not found");
    }

    if (configurator.clientId !== payload.clientId) {
      return unauthorized("Ownership mismatch");
    }

    await ConfiguratorService.delete(id, payload.clientId);

    return success(null, "Configurator deleted");
  } catch (error: any) {
    console.error("Configurator delete error:", error);
    return fail(
      error.message || "Failed to delete configurator",
      "DELETE_ERROR",
      error.statusCode || 500
    );
  }
}
