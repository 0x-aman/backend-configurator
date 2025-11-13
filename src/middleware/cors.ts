/**
 * CORS Middleware
 *
 * Provides middleware functions for applying CORS to Next.js routes.
 * Uses centralized configuration from cors.config.ts
 */

import { NextRequest, NextResponse } from "next/server";
import {
  handleCors,
  addCorsHeaders as addCorsHeadersUtil,
} from "@/src/lib/cors";

/**
 * Apply CORS middleware to a request
 * Handles OPTIONS preflight requests automatically
 *
 * @param request - The incoming Next.js request
 * @param allowedOrigins - Optional array of allowed origins (overrides default config)
 * @returns NextResponse for OPTIONS requests, null for other methods
 */
export function applyCors(
  request: NextRequest,
  allowedOrigins?: string[]
): NextResponse | null {
  return handleCors(request, allowedOrigins);
}

/**
 * Add CORS headers to an existing response
 *
 * @param response - The response to add CORS headers to
 * @param request - The incoming request
 * @param allowedOrigins - Optional array of allowed origins (overrides default config)
 * @returns The response with CORS headers added
 */
export function addCorsToResponse(
  response: NextResponse,
  request: NextRequest,
  allowedOrigins?: string[]
): NextResponse {
  return addCorsHeadersUtil(response, request, allowedOrigins);
}
