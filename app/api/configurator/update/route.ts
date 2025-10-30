import { NextRequest } from "next/server";
import { ConfiguratorService } from "@/src/services/configurator.service";
import { success, fail } from "@/src/lib/response";
import { verifyEditToken } from "@/src/lib/verify-edit-token";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...data } = body;

    if (!token) {
      return fail("Edit token is required", "VALIDATION_ERROR", 400);
    }

    // 🔒 Verify token validity and decode client/configurator info
    const payload = await verifyEditToken(token);

    // Check before destructuring anything
    if (!payload || !payload.clientId || !payload.configuratorId) {
      return fail("Invalid or expired edit token", "UNAUTHORIZED", 401);
    }

    const id = payload.configuratorId;

    // Optional: ensure this token actually belongs to the configurator being edited
    if (String(payload.configuratorId) !== String(id)) {
      return fail("Configurator mismatch", "UNAUTHORIZED", 401);
    }

    // ✅ Perform the update
    const updatedConfigurator = await ConfiguratorService.update(
      id,
      payload.clientId,
      data
    );

    return success(updatedConfigurator, "Configurator updated successfully");
  } catch (error: any) {
    console.error("Configurator update error:", error);
    return fail(
      error.message || "Failed to update configurator",
      "UPDATE_ERROR",
      500
    );
  }
}
