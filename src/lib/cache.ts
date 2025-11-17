/**
 * Response Caching Utilities
 * 
 * Provides cache control headers for API responses
 */

import { NextResponse } from "next/server";

export interface CacheOptions {
  /**
   * Cache duration in seconds
   */
  maxAge?: number;
  
  /**
   * Stale-while-revalidate duration in seconds
   */
  swr?: number;
  
  /**
   * Make response public (CDN cacheable)
   */
  public?: boolean;
  
  /**
   * Make response private (browser only)
   */
  private?: boolean;
  
  /**
   * Disable caching
   */
  noCache?: boolean;
  
  /**
   * Must revalidate with server before using
   */
  mustRevalidate?: boolean;
}

/**
 * Cache presets for common scenarios
 */
export const CachePresets = {
  /**
   * No caching - always fetch fresh
   */
  NONE: {
    noCache: true,
  },
  
  /**
   * Short cache - 1 minute (good for frequently changing data)
   */
  SHORT: {
    maxAge: 60,
    swr: 30,
    public: true,
  },
  
  /**
   * Medium cache - 5 minutes (good for moderately changing data)
   */
  MEDIUM: {
    maxAge: 300,
    swr: 60,
    public: true,
  },
  
  /**
   * Long cache - 1 hour (good for rarely changing data)
   */
  LONG: {
    maxAge: 3600,
    swr: 300,
    public: true,
  },
  
  /**
   * Very long cache - 1 day (good for static data)
   */
  VERY_LONG: {
    maxAge: 86400,
    swr: 3600,
    public: true,
  },
  
  /**
   * Private cache - browser only (good for user-specific data)
   */
  PRIVATE: {
    maxAge: 300,
    private: true,
  },
  
  /**
   * Must revalidate - always check with server first
   */
  MUST_REVALIDATE: {
    maxAge: 300,
    mustRevalidate: true,
    public: true,
  },
} as const;

/**
 * Build Cache-Control header value from options
 * 
 * @param options - Cache options
 * @returns Cache-Control header value
 */
export function buildCacheControl(options: CacheOptions): string {
  const directives: string[] = [];

  if (options.noCache) {
    return "no-cache, no-store, must-revalidate";
  }

  if (options.public) {
    directives.push("public");
  }

  if (options.private) {
    directives.push("private");
  }

  if (options.maxAge !== undefined) {
    directives.push(`max-age=${options.maxAge}`);
  }

  if (options.swr !== undefined) {
    directives.push(`stale-while-revalidate=${options.swr}`);
  }

  if (options.mustRevalidate) {
    directives.push("must-revalidate");
  }

  return directives.join(", ") || "no-cache";
}

/**
 * Add cache headers to a response
 * 
 * @param response - The response to add cache headers to
 * @param options - Cache options or preset name
 * @returns Response with cache headers
 */
export function addCacheHeaders(
  response: NextResponse,
  options: CacheOptions | keyof typeof CachePresets
): NextResponse {
  const cacheOptions =
    typeof options === "string" ? CachePresets[options] : options;

  const cacheControl = buildCacheControl(cacheOptions);
  response.headers.set("Cache-Control", cacheControl);

  // Add ETag support hint
  if (!cacheOptions.noCache) {
    response.headers.set("Vary", "Accept-Encoding, Origin");
  }

  return response;
}

/**
 * Create cache key from request
 * Useful for server-side caching implementation
 * 
 * @param request - The request to create cache key from
 * @param additionalKeys - Additional keys to include
 * @returns Cache key string
 */
export function createCacheKey(
  request: Request,
  additionalKeys: string[] = []
): string {
  const url = new URL(request.url);
  const path = url.pathname;
  const query = url.search;
  const method = request.method;

  return [method, path, query, ...additionalKeys].join(":");
}
