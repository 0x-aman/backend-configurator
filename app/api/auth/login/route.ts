// Login endpoint (for custom JWT auth alongside NextAuth)
import { NextRequest } from 'next/server';
import { ClientService } from '@/src/services/client.service';
import { verifyPassword, generateJWT } from '@/src/lib/auth';
import { success, fail } from '@/src/lib/response';
import { validate } from '@/src/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    const validation = validate([
      { field: 'email', value: email, rules: ['required', 'email'] },
      { field: 'password', value: password, rules: ['required'] },
    ]);

    if (!validation.valid) {
      return fail(validation.errors.join(', '), 'VALIDATION_ERROR');
    }

    // Find client
    const client = await ClientService.getByEmail(email);
    if (!client || !client.passwordHash) {
      return fail('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, client.passwordHash);
    if (!isValid) {
      // Increment failed attempts
      await ClientService.update(client.id, {
        failedLoginAttempts: client.failedLoginAttempts + 1,
      });
      return fail('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Reset failed attempts and update last login
    await ClientService.update(client.id, {
      failedLoginAttempts: 0,
      lastLoginAt: new Date(),
    });

    // Generate JWT
    const token = generateJWT(client);
    const safeClient = await ClientService.getSafeClient(client.id);

    return success(
      {
        user: safeClient,
        token,
      },
      'Login successful'
    );
  } catch (error: any) {
    return fail(error.message || 'Login failed', 'LOGIN_ERROR', 500);
  }
}
