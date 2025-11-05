// Rate limiting middleware
import { NextRequest } from 'next/server';
import { rateLimit, RateLimitConfig } from '@/src/lib/rate-limit';
import { RateLimitError } from '@/src/lib/errors';

export function applyRateLimit(
  request: NextRequest,
  identifier: string,
  config: RateLimitConfig = { max: 100, windowMs: 60000 }
) {
  const result = rateLimit(identifier, config);

  if (!result.success) {
    const resetDate = new Date(result.resetAt).toISOString();
    throw new RateLimitError(`Rate limit exceeded. Resets at ${resetDate}`);
  }

  return {
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}

export function getRateLimitIdentifier(request: NextRequest, clientId?: string): string {
  if (clientId) return `client:${clientId}`;
  
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  return `ip:${ip}`;
}
