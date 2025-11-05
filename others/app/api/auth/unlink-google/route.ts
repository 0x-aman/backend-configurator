// Unlink Google OAuth account
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { prisma } from "@/src/lib/prisma";
import { success, fail } from "@/src/lib/response";

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);

    // Check if user has a password set
    if (!client.passwordHash) {
      return fail(
        "Cannot unlink Google account without a password. Please add a password first.",
        "VALIDATION_ERROR",
        400
      );
    }

    // Check if user has Google linked
    if (!client.googleId) {
      return fail("No Google account is linked", "VALIDATION_ERROR", 400);
    }

    // Remove Google ID and related Account records
    // Account is linked to User (via userId), and User has clientId.
    // Find the user for this client and delete the account rows by userId.
    const user = await prisma.user.findUnique({
      where: { clientId: client.id },
    });

    await prisma.$transaction([
      prisma.client.update({
        where: { id: client.id },
        data: { googleId: null },
      }),
      prisma.account.deleteMany({
        where: {
          userId: user?.id,
          provider: "google",
        },
      }),
    ]);

    return success(
      { message: "Google account unlinked successfully" },
      "Google account unlinked successfully"
    );
  } catch (error: any) {
    console.error("Unlink Google error:", error);
    return fail(error.message, "UNLINK_ERROR", error.statusCode || 500);
  }
}
