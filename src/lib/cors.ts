/**
 * CORS Utility Functions
 *
 * Provides reusable utilities for handling CORS in Next.js API routes.
 * Uses centralized configuration from cors.config.ts
 */

import { NextRequest, NextResponse } from "next/server";
import {
  corsConfig,
  getCORSHeaders,
  isOriginAllowed,
} from "@/src/config/cors.config";

/**
 * Legacy function - kept for backward compatibility
 * Use getCORSHeaders from cors.config.ts instead
 */
export function corsHeaders(origin: string | null, allowedOrigins?: string[]) {
  return getCORSHeaders(origin, allowedOrigins);
}

/**
 * Handle CORS preflight (OPTIONS) requests
 * Returns a NextResponse with CORS headers for OPTIONS, or null for other methods
 *
 * @param request - The incoming Next.js request
 * @param allowedOrigins - Optional array of allowed origins (overrides default config)
 * @returns NextResponse with 204 status for OPTIONS requests, null otherwise
 */
export function handleCors(
  request: NextRequest,
  allowedOrigins?: string[]
): NextResponse | null {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCORSHeaders(origin, allowedOrigins),
    });
  }

  return null;
}

/**
 * Add CORS headers to an existing NextResponse
 *
 * @param response - The response to add CORS headers to
 * @param request - The incoming request (to extract origin)
 * @param allowedOrigins - Optional array of allowed origins (overrides default config)
 * @returns The response with CORS headers added
 */
export function addCorsHeaders(
  response: NextResponse,
  request: NextRequest | Request,
  allowedOrigins?: string[]
): NextResponse {
  const origin = request.headers.get("origin");
  const headers = getCORSHeaders(origin, allowedOrigins);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Check if the request origin is allowed
 *
 * @param request - The incoming request
 * @param allowedOrigins - Optional array of allowed origins (overrides default config)
 * @returns true if origin is allowed, false otherwise
 */
export function isRequestOriginAllowed(
  request: NextRequest | Request,
  allowedOrigins?: string[]
): boolean {
  const origin = request.headers.get("origin");
  return isOriginAllowed(origin, allowedOrigins);
}

/**
 * Create a CORS-enabled response with data
 * Convenience function for API routes
 *
 * @param data - The response data
 * @param request - The incoming request
 * @param status - HTTP status code (default: 200)
 * @param allowedOrigins - Optional array of allowed origins
 * @returns NextResponse with CORS headers and JSON data
 */
export function corsResponse(
  data: any,
  request: NextRequest | Request,
  status: number = 200,
  allowedOrigins?: string[]
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response, request, allowedOrigins);
}
