// Add password for OAuth-only users
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { hashPassword } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { success, fail } from "@/src/lib/response";

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 8) {
      return fail("Password must be at least 8 characters", "VALIDATION_ERROR");
    }

    // Check if user already has a password
    if (client.passwordHash) {
      return fail(
        "Account already has a password. Use change password instead.",
        "CONFLICT",
        409
      );
    }

    // Hash and set the password
    const passwordHash = await hashPassword(password);
    await prisma.client.update({
      where: { id: client.id },
      data: { passwordHash },
    });

    return success(
      { message: "Password added successfully" },
      "Password added successfully"
    );
  } catch (error: any) {
    console.error("Add password error:", error);
    return fail(error.message, "PASSWORD_ERROR", error.statusCode || 500);
  }
}
