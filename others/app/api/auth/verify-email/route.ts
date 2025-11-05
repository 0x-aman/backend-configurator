// Email verification endpoint
import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { success, fail } from "@/src/lib/response";
import { AppError } from "@/src/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      throw new AppError("Verification token is required", 400);
    }

    // Find client with this verification token
    const client = await prisma.client.findFirst({
      where: {
        emailVerifyToken: token,
      },
    });

    if (!client) {
      return fail(
        "Invalid or expired verification token",
        "INVALID_TOKEN",
        400
      );
    }

    // Check if email is already verified
    if (client.emailVerified) {
      return success(
        { message: "Email is already verified" },
        "Email already verified"
      );
    }

    // Update client to mark email as verified
    await prisma.client.update({
      where: { id: client.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifySentAt: null,
      },
    });

    // Also update the User record if it exists
    const user = await prisma.user.findUnique({
      where: { email: client.email },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    }

    return success(
      { message: "Email verified successfully" },
      "Email verified successfully"
    );
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, "VERIFICATION_ERROR", error.statusCode);
    }
    console.error("Email verification error:", error);
    return fail("Internal server error", "VERIFICATION_ERROR", 500);
  }
}
