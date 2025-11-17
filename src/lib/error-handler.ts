/**
 * Centralized Error Handler
 * 
 * Provides consistent error handling and logging across all API routes
 */

import { NextRequest } from "next/server";
import { failWithCors, unauthorizedWithCors, forbiddenWithCors, notFoundWithCors, serverErrorWithCors } from "./response";
import { AuthenticationError, AuthorizationError } from "./errors";
import { ZodError } from "zod";
import { formatValidationErrors } from "./validation";
import { Prisma } from "@prisma/client";

/**
 * Handle API errors with proper logging and response formatting
 * 
 * @param error - The error to handle
 * @param request - The request object for CORS
 * @param context - Additional context for logging
 * @returns Formatted error response with CORS
 */
export function handleApiError(
  error: unknown,
  request: NextRequest,
  context?: string
) {
  // Log error with context
  console.error(`[API Error${context ? ` - ${context}` : ""}]:`, {
    error,
    path: request.nextUrl.pathname,
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  // Authentication errors
  if (error instanceof AuthenticationError) {
    return unauthorizedWithCors(request, error.message);
  }

  // Authorization errors
  if (error instanceof AuthorizationError) {
    return forbiddenWithCors(request, error.message);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = formatValidationErrors(error);
    return failWithCors(request, formattedErrors, "VALIDATION_ERROR", 400);
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, request);
  }

  // Standard Error objects
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development"
        ? error.message
        : "An unexpected error occurred";

    return serverErrorWithCors(request, message);
  }

  // Unknown error type
  return serverErrorWithCors(
    request,
    "An unexpected error occurred. Please try again later."
  );
}

/**
 * Handle Prisma-specific errors
 * 
 * @param error - Prisma error
 * @param request - Request object for CORS
 * @returns Formatted error response
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  request: NextRequest
) {
  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(", ") || "field";
      return failWithCors(
        request,
        `A record with this ${field} already exists`,
        "DUPLICATE_ERROR",
        409
      );

    case "P2025":
      // Record not found
      return notFoundWithCors(request, "The requested resource was not found");

    case "P2003":
      // Foreign key constraint violation
      return failWithCors(
        request,
        "Cannot perform this action due to related records",
        "CONSTRAINT_ERROR",
        400
      );

    case "P2014":
      // Invalid relation
      return failWithCors(
        request,
        "Invalid relationship between records",
        "RELATION_ERROR",
        400
      );

    default:
      // Other Prisma errors
      if (process.env.NODE_ENV === "development") {
        return serverErrorWithCors(
          request,
          `Database error: ${error.message}`
        );
      }
      return serverErrorWithCors(request, "A database error occurred");
  }
}

/**
 * Async error handler wrapper for route handlers
 * Catches all errors and returns proper response
 * 
 * Usage:
 * export const GET = withErrorHandler(async (request) => {
 *   // Your handler code
 * });
 * 
 * @param handler - The route handler function
 * @param context - Context string for logging
 * @returns Wrapped handler with error handling
 */
export function withErrorHandler<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>,
  context?: string
) {
  return async (request: NextRequest, ...args: T) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleApiError(error, request, context);
    }
  };
}

/**
 * Try-catch wrapper for safe execution
 * Returns result or null if error occurs
 * 
 * @param fn - Function to execute
 * @param fallback - Fallback value if error occurs
 * @returns Result or fallback
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  fallback: T | null = null
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error("tryCatch error:", error);
    return fallback;
  }
}
