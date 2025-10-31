// Create theme
import { NextRequest } from "next/server";
import { ThemeService } from "@/src/services/theme.service";
import { success, fail, created, unauthorized } from "@/src/lib/response";
import { verifyEditToken } from "@/src/lib/verify-edit-token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...themeData } = body;

    if (!token) {
      return fail("Edit token is required", "VALIDATION_ERROR", 400);
    }

    // 🔒 Verify token validity and decode client info
    const payload = await verifyEditToken(token);

    if (!payload || !payload.clientId) {
      return unauthorized("Invalid or expired edit token");
    }

    // ✅ Create theme for the client from the token
    const theme = await ThemeService.create(payload.clientId, themeData);

    return created(theme, "Theme created");
  } catch (error: any) {
    console.error("Theme create error:", error);
    return fail(error.message || "Failed to create theme", "CREATE_ERROR", 500);
  }
}
