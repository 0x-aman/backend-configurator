// Standardized API response helpers
import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

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
