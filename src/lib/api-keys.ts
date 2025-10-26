// API key generation and validation
import { randomBytes } from 'crypto';

export function generateApiKey(prefix: string = 'sk'): string {
  const random = randomBytes(32).toString('hex');
  return `${prefix}_${random}`;
}

export function generatePublicKey(prefix: string = 'pk'): string {
  const random = randomBytes(16).toString('hex');
  return `${prefix}_${random}`;
}

export function validateApiKeyFormat(key: string): boolean {
  return /^[a-z]{2}_[a-f0-9]{64}$/.test(key);
}

export function validatePublicKeyFormat(key: string): boolean {
  return /^[a-z]{2}_[a-f0-9]{32}$/.test(key);
}
