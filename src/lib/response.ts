// Standardized API response helpers with automatic CORS support
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { addCorsHeaders } from "./cors";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Wrapper to add CORS headers to any NextResponse
 * @param response - The response to wrap
 * @param request - Optional request object for CORS origin detection
 * @param allowedOrigins - Optional custom allowed origins
 */
export function withCors(
  response: NextResponse,
  request?: NextRequest | Request,
  allowedOrigins?: string[]
): NextResponse {
  if (request) {
    return addCorsHeaders(response, request, allowedOrigins);
  }
  return response;
}

// ==================== LEGACY FUNCTIONS (No CORS) ====================
// These are kept for backward compatibility but will be deprecated

export function success<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function fail(
  error: string,
  code?: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    },
    { status }
  );
}

export function created<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return success(data, message, 201);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function unauthorized(
  message: string = "Unauthorized"
): NextResponse<ApiResponse> {
  return fail(message, "UNAUTHORIZED", 401);
}

export function forbidden(
  message: string = "Forbidden"
): NextResponse<ApiResponse> {
  return fail(message, "FORBIDDEN", 403);
}

export function notFound(
  message: string = "Not found"
): NextResponse<ApiResponse> {
  return fail(message, "NOT_FOUND", 404);
}

export function conflict(message: string): NextResponse<ApiResponse> {
  return fail(message, "CONFLICT", 409);
}

export function serverError(
  message: string = "Internal server error"
): NextResponse<ApiResponse> {
  return fail(message, "INTERNAL_ERROR", 500);
}

// ==================== NEW FUNCTIONS (With Auto-CORS) ====================
// Use these for all new API routes

export function successWithCors<T>(
  request: NextRequest | Request,
  data?: T,
  message?: string,
  status: number = 200,
  allowedOrigins?: string[]
): NextResponse<ApiResponse<T>> {
  const response = NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
  return addCorsHeaders(response, request, allowedOrigins);
}

export function failWithCors(
  request: NextRequest | Request,
  error: string,
  code?: string,
  status: number = 400,
  allowedOrigins?: string[]
): NextResponse<ApiResponse> {
  const response = NextResponse.json(
    {
      success: false,
      error,
      code,
    },
    { status }
  );
  return addCorsHeaders(response, request, allowedOrigins);
}

export function createdWithCors<T>(
  request: NextRequest | Request,
  data: T,
  message?: string,
  allowedOrigins?: string[]
): NextResponse<ApiResponse<T>> {
  return successWithCors(request, data, message, 201, allowedOrigins);
}

export function noContentWithCors(
  request: NextRequest | Request,
  allowedOrigins?: string[]
): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, request, allowedOrigins);
}

export function unauthorizedWithCors(
  request: NextRequest | Request,
  message: string = "Unauthorized",
  allowedOrigins?: string[]
): NextResponse<ApiResponse> {
  return failWithCors(request, message, "UNAUTHORIZED", 401, allowedOrigins);
}

export function forbiddenWithCors(
  request: NextRequest | Request,
  message: string = "Forbidden",
  allowedOrigins?: string[]
): NextResponse<ApiResponse> {
  return failWithCors(request, message, "FORBIDDEN", 403, allowedOrigins);
}

export function notFoundWithCors(
  request: NextRequest | Request,
  message: string = "Not found",
  allowedOrigins?: string[]
): NextResponse<ApiResponse> {
  return failWithCors(request, message, "NOT_FOUND", 404, allowedOrigins);
}

export function conflictWithCors(
  request: NextRequest | Request,
  message: string,
  allowedOrigins?: string[]
): NextResponse<ApiResponse> {
  return failWithCors(request, message, "CONFLICT", 409, allowedOrigins);
}

export function serverErrorWithCors(
  request: NextRequest | Request,
  message: string = "Internal server error",
  allowedOrigins?: string[]
): NextResponse<ApiResponse> {
  return failWithCors(request, message, "INTERNAL_ERROR", 500, allowedOrigins);
}
