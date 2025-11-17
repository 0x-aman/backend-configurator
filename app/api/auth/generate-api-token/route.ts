// Generate API token for external app access
// Accepts publicKey and returns a JWT token for API access

import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { prisma } from "@/src/lib/prisma";
import { success, fail, unauthorized } from "@/src/lib/response";
import { env } from "@/src/config/env";

type RequestBody = {
  publicKey: string;
  expiresIn?: string; // Optional: e.g., "7d", "30d", "1h" - defaults to "7d"
};

/**
 * POST /api/auth/generate-api-token
 * 
 * Generate a secure API token for external app access
 * 
 * Request Body:
 * {
 *   "publicKey": "your-public-key",
 *   "expiresIn": "7d" // optional, defaults to 7 days
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "expiresIn": "7d",
 *     "clientId": "client-id"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json().catch(() => ({}));
    const { publicKey, expiresIn = "7d" } = body;

    if (!publicKey) {
      return fail("publicKey is required", "VALIDATION_ERROR", 400);
    }

    // Find client by public key
    const client = await prisma.client.findUnique({
      where: { publicKey },
      select: {
        id: true,
        publicKey: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        lockedUntil: true,
        monthlyRequests: true,
        requestLimit: true,
      },
    });

    if (!client) {
      return unauthorized("Invalid public key");
    }

    // Check if account is locked
    if (client.lockedUntil && client.lockedUntil > new Date()) {
      return unauthorized("Account is locked");
    }

    // Check subscription status
    if (
      client.subscriptionStatus === "CANCELED" ||
      client.subscriptionStatus === "SUSPENDED"
    ) {
      return unauthorized("Subscription is not active");
    }

    // Check if approaching rate limit
    if (client.monthlyRequests >= client.requestLimit * 0.9) {
      console.warn(
        `Client ${client.id} is approaching rate limit: ${client.monthlyRequests}/${client.requestLimit}`
      );
    }

    // Get JWT secret
    const secret = env.EDIT_TOKEN_SECRET;
    if (!secret) {
      console.error("EDIT_TOKEN_SECRET is not set");
      return fail("Server misconfiguration", "SERVER_ERROR", 500);
    }

    // Validate expiry format
    const validExpiryFormats = /^(\d+[smhdwy])$/;
    if (!validExpiryFormats.test(expiresIn)) {
      return fail(
        "Invalid expiresIn format. Use format like: 1h, 7d, 30d, 1y",
        "VALIDATION_ERROR",
        400
      );
    }

    // Create JWT payload
    const payload = {
      sub: client.id,
      publicKey: client.publicKey,
      email: client.email,
      type: "api_access",
      iat: Math.floor(Date.now() / 1000),
    };

    // Generate token
    const token = sign(payload, secret, { expiresIn });

    // Log token generation (optional - for audit)
    await prisma.apiLog.create({
      data: {
        clientId: client.id,
        method: "POST",
        path: "/api/auth/generate-api-token",
        statusCode: 200,
        responseTime: 0,
        userAgent: request.headers.get("user-agent") || undefined,
        ipAddress: request.headers.get("x-forwarded-for") || 
                   request.headers.get("x-real-ip") || 
                   undefined,
      },
    }).catch(err => {
      console.error("Failed to log API token generation:", err);
    });

    return success(
      {
        token,
        expiresIn,
        clientId: client.id,
        clientName: client.name,
        tokenType: "Bearer",
        usage: `Include in requests as: X-API-Token: ${token.substring(0, 20)}...`,
      },
      "API token generated successfully"
    );
  } catch (error: any) {
    console.error("Generate API token error:", error);
    return fail(
      error.message || "Failed to generate API token",
      "TOKEN_GENERATION_ERROR",
      500
    );
  }
}
