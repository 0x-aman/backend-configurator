// CORS middleware
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, handleCors } from '@/src/lib/cors';

export function applyCors(request: NextRequest, allowedOrigins?: string[]): NextResponse | null {
  return handleCors(request, allowedOrigins);
}

export function addCorsToResponse(
  response: NextResponse,
  request: NextRequest,
  allowedOrigins?: string[]
): NextResponse {
  const origin = request.headers.get('origin') || '';
  const headers = corsHeaders(origin, allowedOrigins);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
