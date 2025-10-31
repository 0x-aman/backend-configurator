// CORS handling utilities
import { NextRequest, NextResponse } from "next/server";

export function corsHeaders(origin?: string, allowedOrigins?: string[]) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-API-Key, X-Public-Key",
    "Access-Control-Max-Age": "86400",
  };

  if (origin) {
    if (allowedOrigins && allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        headers["Access-Control-Allow-Origin"] = origin;
        headers["Access-Control-Allow-Credentials"] = "true";
      }
    } else {
      headers["Access-Control-Allow-Origin"] = "http://localhost:8080";
    }
  }

  return headers;
}

export function handleCors(request: NextRequest, allowedOrigins?: string[]) {
  const origin = request.headers.get("origin") || "";

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin, allowedOrigins),
    });
  }

  return null;
}

export function addCorsHeaders(
  response: NextResponse,
  origin?: any,
  allowedOrigins?: string[]
) {
  const headers = corsHeaders(origin, allowedOrigins);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
