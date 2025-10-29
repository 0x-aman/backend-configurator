// Register endpoint - Creates both Client and User for NextAuth compatibility
import { NextRequest } from 'next/server';
import { ClientService } from '@/src/services/client.service';
import { success, fail } from '@/src/lib/response';
import { validate } from '@/src/utils/validation';
import { prisma } from '@/src/lib/prisma';

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

    // Create client
    const client = await ClientService.create({
      email,
      password,
      name,
      companyName,
    });

    // Create corresponding User for NextAuth
    await prisma.user.create({
      data: {
        email: client.email,
        name: client.name,
        emailVerified: new Date(), // Mark as verified since they registered with password
        clientId: client.id,
      },
    });

    const safeClient = await ClientService.getSafeClient(client.id);

    return success(
      {
        user: safeClient,
        message: 'Registration successful. You can now sign in.',
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
