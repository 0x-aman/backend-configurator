// Forgot password endpoint
import { NextRequest } from 'next/server';
import { ClientService } from '@/src/services/client.service';
import { generateResetToken } from '@/src/utils/hash';
import { sendEmail } from '@/src/lib/email';
import { success, fail } from '@/src/lib/response';
import { validate } from '@/src/utils/validation';
import { env } from '@/src/config/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const validation = validate([
      { field: 'email', value: email, rules: ['required', 'email'] },
    ]);

    if (!validation.valid) {
      return fail(validation.errors.join(', '), 'VALIDATION_ERROR');
    }

    const client = await ClientService.getByEmail(email);
    if (!client) {
      // Don't reveal if email exists
      return success(null, 'If the email exists, a reset link has been sent');
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await ClientService.update(client.id, {
      resetToken,
      resetTokenExpires,
    });

    // Send reset email
    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return success(null, 'If the email exists, a reset link has been sent');
  } catch (error: any) {
    return fail('Failed to process request', 'FORGOT_PASSWORD_ERROR', 500);
  }
}
