// Update/Delete theme
import { NextRequest } from "next/server";
import { ThemeService } from "@/src/services/theme.service";
import { success, fail, unauthorized, notFound } from "@/src/lib/response";
import { verifyEditToken } from "@/src/lib/verify-edit-token";
import { prisma } from "@/src/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, id, ...data } = body;

    if (!id) {
      return fail("Theme ID is required", "VALIDATION_ERROR");
    }

    if (!token) {
      return fail("Edit token is required", "VALIDATION_ERROR", 400);
    }

    // 🔒 Verify token validity and decode client info
    const payload = await verifyEditToken(token);

    if (!payload || !payload.clientId) {
      return unauthorized("Invalid or expired edit token");
    }

    // Verify theme exists and ownership matches
    const theme = await prisma.theme.findUnique({
      where: { id },
      select: { id: true, clientId: true },
    });

    if (!theme) {
      return notFound("Theme not found");
    }

    if (theme.clientId !== payload.clientId) {
      return unauthorized("Ownership mismatch");
    }

    const updatedTheme = await ThemeService.update(id, data);

    return success(updatedTheme, "Theme updated");
  } catch (error: any) {
    console.error("Theme update error:", error);
    return fail(error.message || "Failed to update theme", "UPDATE_ERROR", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const token = searchParams.get("token") || "";

    if (!id) {
      return fail("Theme ID is required", "VALIDATION_ERROR");
    }

    if (!token) {
      return fail("Edit token is required", "VALIDATION_ERROR", 400);
    }

    // 🔒 Verify token validity and decode client info
    const payload = await verifyEditToken(token);

    if (!payload || !payload.clientId) {
      return unauthorized("Invalid or expired edit token");
    }

    // Verify theme exists and ownership matches
    const theme = await prisma.theme.findUnique({
      where: { id },
      select: { id: true, clientId: true },
    });

    if (!theme) {
      return notFound("Theme not found");
    }

    if (theme.clientId !== payload.clientId) {
      return unauthorized("Ownership mismatch");
    }

    await ThemeService.delete(id);

    return success(null, "Theme deleted");
  } catch (error: any) {
    console.error("Theme delete error:", error);
    return fail(error.message || "Failed to delete theme", "DELETE_ERROR", 500);
  }
}
