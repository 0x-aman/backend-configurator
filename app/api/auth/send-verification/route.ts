// Send email verification endpoint
import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { generateVerifyToken } from "@/src/utils/hash";
import { sendEmail } from "@/src/lib/email";
import { success, fail } from "@/src/lib/response";
import { validate } from "@/src/utils/validation";
import { env } from "@/src/config/env";
import { AppError } from "@/src/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const validation = validate([
      { field: "email", value: email, rules: ["required", "email"] },
    ]);

    if (!validation.valid) {
      return fail(validation.errors.join(", "), "VALIDATION_ERROR", 400);
    }

    const client = await prisma.client.findUnique({
      where: { email },
    });

    // Don't reveal if email exists or is already verified
    if (!client || client.emailVerified) {
      return success(
        null,
        "If the email exists and is not verified, a verification link has been sent"
      );
    }

    // Check if verification email was sent recently (prevent spam)
    if (client.emailVerifySentAt) {
      const timeSinceLastSent =
        Date.now() - client.emailVerifySentAt.getTime();
      const cooldownMs = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastSent < cooldownMs) {
        const minutesRemaining = Math.ceil(
          (cooldownMs - timeSinceLastSent) / 60000
        );
        return fail(
          `Please wait ${minutesRemaining} minute(s) before requesting another verification email`,
          "RATE_LIMIT",
          429
        );
      }
    }

    // Generate verification token
    const verifyToken = generateVerifyToken();

    await prisma.client.update({
      where: { id: client.id },
      data: {
        emailVerifyToken: verifyToken,
        emailVerifySentAt: new Date(),
      },
    });

    // Send verification email
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
    await sendEmail({
      to: email,
      subject: `Verify your email - ${env.APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verify Your Email</h1>
              </div>
              <div class="content">
                <p>Hello ${client.name},</p>
                <p>Thank you for registering with ${env.APP_NAME}! Please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                  <a href="${verifyUrl}" class="button">Verify Email</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #4F46E5;">${verifyUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>&copy; ${new Date().getFullYear()} ${env.APP_NAME}. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return success(
      null,
      "Verification email sent successfully"
    );
  } catch (error: any) {
    console.error("Send verification error:", error);
    return fail(
      "Failed to send verification email",
      "VERIFICATION_ERROR",
      500
    );
  }
}
