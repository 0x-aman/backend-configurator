// Hashing utilities
import { createHash, randomBytes } from 'crypto';

export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function md5(data: string): string {
  return createHash('md5').update(data).digest('hex');
}

export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function generateResetToken(): string {
  return generateToken(32);
}

export function generateVerifyToken(): string {
  return generateToken(32);
}
