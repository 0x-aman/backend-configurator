/**
 * Flexible Authentication Middleware
 *
 * Supports multiple authentication methods:
 * 1. NextAuth session-based authentication (cookies)
 * 2. JWT token-based authentication (for embeds/external access)
 * 3. API key authentication (for programmatic access)
 *
 * Usage:
 * - Use flexibleAuth() for routes that should accept any auth method
 * - Use requireSessionOrToken() for routes that need either session or token
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";
import { verifyEditToken } from "@/src/lib/verify-edit-token";
import { AuthenticationError } from "@/src/lib/errors";
import type { Client } from "@prisma/client";

export interface AuthResult {
  client: Client;
  authMethod: "session" | "token" | "apiKey";
  configuratorId?: string; // Available when authenticated via edit token
}

/**
 * Try to authenticate using NextAuth session
 */
async function trySessionAuth(): Promise<Client | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true },
    });

    if (!user || !user.client) {
      return null;
    }

    const client = user.client;

    // Check if account is locked
    if (client.lockedUntil && client.lockedUntil > new Date()) {
      throw new AuthenticationError("Account is locked");
    }

    return client;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    return null;
  }
}

/**
 * Try to authenticate using JWT edit token or API token
 */
async function tryTokenAuth(
  request: NextRequest
): Promise<{ client: Client; configuratorId?: string } | null> {
  try {
    // Check Authorization header
    const authHeader = request.headers.get("authorization");
    let token: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Fallback to x-edit-token header
    if (!token) {
      token = request.headers.get("x-edit-token");
    }

    // Check x-api-token header (for external apps)
    if (!token) {
      token = request.headers.get("x-api-token");
    }

    if (!token) {
      return null;
    }

    const payload = await verifyEditToken(token);

    if (!payload || !payload.clientId) {
      return null;
    }

    const client = await prisma.client.findUnique({
      where: { id: payload.clientId },
    });

    if (!client) {
      return null;
    }

    // Check if account is locked
    if (client.lockedUntil && client.lockedUntil > new Date()) {
      throw new AuthenticationError("Account is locked");
    }

    // Check subscription status for API access
    if (
      client.subscriptionStatus === "CANCELED" ||
      client.subscriptionStatus === "SUSPENDED"
    ) {
      throw new AuthenticationError("Subscription is not active");
    }

    return {
      client,
      configuratorId: payload.configuratorId,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    return null;
  }
}

/**
 * Try to authenticate using API key
 */
async function tryApiKeyAuth(request: NextRequest): Promise<Client | null> {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return null;
    }

    const client = await prisma.client.findUnique({
      where: { apiKey },
    });

    if (!client) {
      return null;
    }

    return client;
  } catch {
    return null;
  }
}

/**
 * Flexible authentication that tries multiple methods
 * Priority: Session > Token > API Key
 *
 * @param request - The incoming request
 * @returns AuthResult with client and auth method used
 * @throws AuthenticationError if no valid authentication found
 */
export async function flexibleAuth(request: NextRequest): Promise<AuthResult> {
  // Try session authentication first (most common for dashboard)
  const sessionClient = await trySessionAuth();
  if (sessionClient) {
    return {
      client: sessionClient,
      authMethod: "session",
    };
  }

  // Try token authentication (for embeds and external access)
  const tokenResult = await tryTokenAuth(request);
  if (tokenResult) {
    return {
      client: tokenResult.client,
      authMethod: "token",
      configuratorId: tokenResult.configuratorId,
    };
  }

  // Try API key authentication (for programmatic access)
  const apiKeyClient = await tryApiKeyAuth(request);
  if (apiKeyClient) {
    return {
      client: apiKeyClient,
      authMethod: "apiKey",
    };
  }

  // No valid authentication found
  throw new AuthenticationError(
    "Authentication required. Please provide valid session, token, or API key."
  );
}

/**
 * Require either session or token authentication
 * Does not check API key (use flexibleAuth for that)
 *
 * @param request - The incoming request
 * @returns AuthResult with client and auth method
 * @throws AuthenticationError if no valid authentication found
 */
export async function requireSessionOrToken(
  request: NextRequest
): Promise<AuthResult> {
  // Try session authentication first
  const sessionClient = await trySessionAuth();
  if (sessionClient) {
    return {
      client: sessionClient,
      authMethod: "session",
    };
  }

  // Try token authentication
  const tokenResult = await tryTokenAuth(request);
  if (tokenResult) {
    return {
      client: tokenResult.client,
      authMethod: "token",
      configuratorId: tokenResult.configuratorId,
    };
  }

  throw new AuthenticationError(
    "Authentication required. Please provide valid session or token."
  );
}

/**
 * Optional authentication - returns null if not authenticated
 *
 * @param request - The incoming request
 * @returns AuthResult or null
 */
export async function optionalFlexibleAuth(
  request: NextRequest
): Promise<AuthResult | null> {
  try {
    return await flexibleAuth(request);
  } catch {
    return null;
  }
}
