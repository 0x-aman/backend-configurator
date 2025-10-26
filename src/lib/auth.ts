// Authentication utilities
import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { env } from '@/src/config/env';
import { Client } from '@prisma/client';

const JWT_SECRET = env.NEXTAUTH_SECRET || 'fallback-secret-change-this';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export function generateJWT(client: Partial<Client>): string {
  return sign(
    {
      id: client.id,
      email: client.email,
      name: client.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyJWT(token: string): any {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function extractToken(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return authHeader;
}
