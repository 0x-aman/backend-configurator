// Login endpoint (for custom JWT auth alongside NextAuth)
import { NextRequest } from 'next/server';
import { ClientService } from '@/src/services/client.service';
import { verifyPassword, generateJWT } from '@/src/lib/auth';
import { success, fail } from '@/src/lib/response';
import { validate } from '@/src/utils/validation';
import { prisma } from '@/src/lib/prisma';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

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
      return fail(validation.errors.join(', '), 'VALIDATION_ERROR', 400);
    }

    // Find client
    const client = await ClientService.getByEmail(email);
    if (!client || !client.passwordHash) {
      return fail('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // ✅ Fixed: Check if account is locked
    if (client.lockedUntil && client.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (client.lockedUntil.getTime() - Date.now()) / 60000
      );
      return fail(
        `Account is locked due to too many failed login attempts. Try again in ${minutesRemaining} minutes.`,
        'ACCOUNT_LOCKED',
        403
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, client.passwordHash);
    
    if (!isValid) {
      // ✅ Fixed: Increment failed attempts and lock if needed
      const newAttempts = client.failedLoginAttempts + 1;
      const updateData: any = {
        failedLoginAttempts: newAttempts,
      };
      
      // Lock account after max attempts
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }
      
      await ClientService.update(client.id, updateData);
      
      const attemptsRemaining = Math.max(0, MAX_LOGIN_ATTEMPTS - newAttempts);
      const message = attemptsRemaining > 0
        ? `Invalid credentials. ${attemptsRemaining} attempt(s) remaining before account lockout.`
        : 'Account locked due to too many failed login attempts.';
      
      return fail(message, 'INVALID_CREDENTIALS', 401);
    }

    // ✅ Success: Reset failed attempts, update last login, unlock account
    await ClientService.update(client.id, {
      failedLoginAttempts: 0,
      lastLoginAt: new Date(),
      lockedUntil: null,
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
    console.error('Login error:', error);
    return fail(error.message || 'Login failed', 'LOGIN_ERROR', 500);
  }
}
