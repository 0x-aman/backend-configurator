// ID generation utilities
import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 12);

export function generateId(): string {
  return nanoid();
}

export function generateQuoteCode(): string {
  const prefix = 'Q';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateAccessToken(): string {
  return customAlphabet(alphabet, 32)();
}
