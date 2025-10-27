import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  applyRateLimit,
  getRateLimitIdentifier,
} from "@/src/middleware/rate-limit";
import { applyCors } from "@/src/middleware/cors";
import { validateApiKey, validatePublicKey } from "@/src/middleware/api-key";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  // Example: Apply CORS for all API routes
  if (pathname.startsWith("/api")) {
    const corsResponse = applyCors(request);
    if (corsResponse) return corsResponse;
  }

  // Example: Apply rate limiting for public API routes
  if (pathname.startsWith("/api/public")) {
    const identifier = getRateLimitIdentifier(request);
    try {
      applyRateLimit(request, identifier);
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 429 }
      );
    }
  }

  // Example: API key validation for certain endpoints
  if (pathname.startsWith("/api/secure")) {
    try {
      await validateApiKey(request);
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 401 }
      );
    }
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/pricing",
    "/api",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Protected dashboard routes
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // If trying to access dashboard without auth, redirect to login
  if (isDashboardRoute && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ...add more middleware composition as needed

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
