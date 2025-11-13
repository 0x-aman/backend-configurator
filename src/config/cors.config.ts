/**
 * Centralized CORS Configuration
 *
 * This file manages all CORS settings for the application.
 * Configure allowed origins via CORS_ALLOWED_ORIGINS environment variable.
 */

import { env } from "./env";

export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

/**
 * Default CORS configuration
 */
export const corsConfig: CORSConfig = {
  // Allowed origins - configured via environment variable
  allowedOrigins: env.CORS_ALLOWED_ORIGINS,

  // Allowed HTTP methods
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  // Allowed request headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Embed-Origin", // Critical for embed functionality
    "X-Public-Key", // For public API authentication
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  // Headers exposed to the client
  exposedHeaders: ["Content-Length", "Content-Type"],

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Preflight cache duration (24 hours)
  maxAge: 86400,
};

/**
 * Check if an origin is allowed
 * Supports:
 * - Exact matches: https://example.com
 * - Wildcards: *
 * - Subdomain wildcards: *.example.com
 */
export function isOriginAllowed(
  origin: string | null,
  allowedOrigins?: string[]
): boolean {
  if (!origin) return false;

  const origins = allowedOrigins || corsConfig.allowedOrigins;

  // Allow all origins if '*' is in the list
  if (origins.includes("*")) return true;

  // Normalize origin (remove trailing slash)
  const normalizedOrigin = origin.replace(/\/$/, "");

  // Check for exact match
  if (origins.includes(normalizedOrigin)) return true;

  // Check for wildcard subdomain match (e.g., *.example.com)
  return origins.some((allowed) => {
    if (allowed.startsWith("*.")) {
      const domain = allowed.slice(2); // Remove '*.'
      return (
        normalizedOrigin.endsWith(`.${domain}`) ||
        normalizedOrigin === `https://${domain}` ||
        normalizedOrigin === `http://${domain}`
      );
    }
    return false;
  });
}

/**
 * Get CORS headers for a response
 */
export function getCORSHeaders(
  origin: string | null,
  allowedOrigins?: string[]
): Record<string, string> {
  const isAllowed = isOriginAllowed(origin, allowedOrigins);

  // If origin is allowed, use it; otherwise use first allowed origin or '*'
  const allowOrigin =
    isAllowed && origin
      ? origin
      : corsConfig.allowedOrigins.includes("*")
        ? "*"
        : corsConfig.allowedOrigins[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": corsConfig.allowedMethods.join(", "),
    "Access-Control-Allow-Headers": corsConfig.allowedHeaders.join(", "),
    "Access-Control-Expose-Headers": corsConfig.exposedHeaders.join(", "),
    "Access-Control-Allow-Credentials": corsConfig.credentials.toString(),
    "Access-Control-Max-Age": corsConfig.maxAge.toString(),
  };
}
