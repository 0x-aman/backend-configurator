// Register endpoint
import { NextRequest } from 'next/server';
import { ClientService } from '@/src/services/client.service';
import { generateJWT } from '@/src/lib/auth';
import { success, fail } from '@/src/lib/response';
import { validate } from '@/src/utils/validation';

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
      return fail(validation.errors.join(', '), 'VALIDATION_ERROR');
    }

    // Create client
    const client = await ClientService.create({
      email,
      password,
      name,
      companyName,
    });

    // Generate JWT
    const token = generateJWT(client);
    const safeClient = await ClientService.getSafeClient(client.id);

    return success(
      {
        user: safeClient,
        token,
      },
      'Registration successful',
      201
    );
  } catch (error: any) {
    if (error.message.includes('already registered')) {
      return fail(error.message, 'CONFLICT', 409);
    }
    return fail(error.message || 'Registration failed', 'REGISTER_ERROR', 500);
  }
}
