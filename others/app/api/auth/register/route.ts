// Register endpoint - Creates both Client and User for NextAuth compatibility
import { NextRequest } from 'next/server';
import { ClientService } from '@/src/services/client.service';
import { success, fail } from '@/src/lib/response';
import { validate } from '@/src/utils/validation';
import { prisma } from '@/src/lib/prisma';
import { generateVerifyToken } from '@/src/utils/hash';
import { sendEmail } from '@/src/lib/email';
import { env } from '@/src/config/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, companyName } = body;

    // Validate input
    const validation = validate([
      { field: 'email', value: email, rules: ['required', 'email'] },
      { field: 'password', value: password, rules: ['required', 'password'] },
      { field: 'name', value: name, rules: ['required'] },
    ]);

    if (!validation.valid) {
      return fail(validation.errors.join(', '), 'VALIDATION_ERROR', 400);
    }

    // Check if user already exists
    const existingClient = await prisma.client.findUnique({
      where: { email },
    });

    if (existingClient) {
      return fail('Email already registered', 'CONFLICT', 409);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return fail('Email already registered', 'CONFLICT', 409);
    }

    // ✅ Generate verification token
    const verifyToken = generateVerifyToken();

    // Create client
    const client = await ClientService.create({
      email,
      password,
      name,
      companyName,
    });

    // Update with verification token
    await prisma.client.update({
      where: { id: client.id },
      data: {
        emailVerifyToken: verifyToken,
        emailVerifySentAt: new Date(),
      },
    });

    // Create corresponding User for NextAuth (NOT verified yet)
    await prisma.user.create({
      data: {
        email: client.email,
        name: client.name,
        emailVerified: null, // ✅ Fixed: Not verified until email confirmation
        clientId: client.id,
      },
    });

    // ✅ Send verification email
    try {
      const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
      await sendEmail({
        to: email,
        subject: `Welcome to ${env.APP_NAME} - Verify your email`,
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
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to ${env.APP_NAME}!</h1>
                </div>
                <div class="content">
                  <p>Hello ${name},</p>
                  <p>Thank you for registering! Please verify your email address to activate your account:</p>
                  <div style="text-align: center;">
                    <a href="${verifyUrl}" class="button">Verify Email</a>
                  </div>
                  <p>Or copy this link: ${verifyUrl}</p>
                  <p>This link expires in 24 hours.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    const safeClient = await ClientService.getSafeClient(client.id);

    return success(
      {
        user: safeClient,
        message: 'Registration successful. Please check your email to verify your account.',
      },
      'Registration successful',
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message && error.message.includes('already registered')) {
      return fail(error.message, 'CONFLICT', 409);
    }
    
    return fail(
      error.message || 'Registration failed. Please try again.',
      'REGISTER_ERROR',
      500
    );
  }
}
