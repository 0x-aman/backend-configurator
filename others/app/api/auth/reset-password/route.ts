import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { hashPassword } from "@/src/lib/auth";
import { AppError } from "@/src/lib/errors";
import { fail, success } from "@/src/lib/response";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      throw new AppError("Token and password are required", 400);
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }

    // ✅ Fixed: Use transaction to prevent token reuse
    const result = await prisma.$transaction(async (tx) => {
      // First, find and verify token is still valid
      const client = await tx.client.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: {
            gt: new Date(),
          },
        },
      });

      if (!client) {
        throw new AppError("Invalid or expired reset token", 400);
      }

      // Hash new password
      const passwordHash = await hashPassword(password);

      // Update password, clear token, and reset failed attempts
      await tx.client.update({
        where: { id: client.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpires: null,
          failedLoginAttempts: 0, // ✅ Reset failed attempts
          lockedUntil: null, // ✅ Unlock account if locked
        },
      });

      return client;
    });

    return success({
      message: "Password reset successfully",
    });
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, "RESET_ERROR", error.statusCode);
    }
    console.error("Reset password error:", error);
    return fail("Internal server error", "RESET_ERROR", 500);
  }
}
