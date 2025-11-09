// CORS handling utilities
import { NextRequest, NextResponse } from "next/server";

export function corsHeaders(origin: string | null, allowedOrigins?: string[]) {
  const defaults = [
    "https://localhost:3000",
    "http://localhost:8080",
    "https://product-configurator-frontend.netlify.app",
  ];

  const origins = allowedOrigins?.length ? allowedOrigins : defaults;
  const normalizedOrigin = origin || "";

  const isAllowed =
    origins.includes("*") ||
    origins.includes(normalizedOrigin) ||
    origins.some((o) => normalizedOrigin.endsWith(o.replace(/^\*\./, "")));

  return {
    // ✅ Fix: never return null; default to the request origin if allowed, else "*"
    "Access-Control-Allow-Origin": isAllowed
      ? normalizedOrigin
      : "https://product-configurator-frontend.netlify.app",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Embed-Origin",
    "Access-Control-Allow-Credentials": "true",
  };
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
