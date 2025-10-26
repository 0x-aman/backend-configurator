// Authentication middleware
import { NextRequest } from 'next/server';
import { verifyJWT, extractToken } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { AuthenticationError } from '@/src/lib/errors';
import type { Client } from '@prisma/client';

export async function authenticateRequest(request: NextRequest): Promise<Client> {
  const authHeader = request.headers.get('authorization');
  const token = extractToken(authHeader);

  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  const payload = verifyJWT(token);
  if (!payload || !payload.id) {
    throw new AuthenticationError('Invalid or expired token');
  }

  const client = await prisma.client.findUnique({
    where: { id: payload.id },
  });

  if (!client) {
    throw new AuthenticationError('Client not found');
  }

  if (client.lockedUntil && client.lockedUntil > new Date()) {
    throw new AuthenticationError('Account is locked');
  }

  return client;
}

export async function optionalAuth(request: NextRequest): Promise<Client | null> {
  try {
    return await authenticateRequest(request);
  } catch {
    return null;
  }
}
