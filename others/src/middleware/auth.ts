// Authentication middleware
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";
import { AuthenticationError } from "@/src/lib/errors";
import type { Client } from "@prisma/client";

export async function authenticateRequest(
  request: NextRequest
): Promise<Client> {
  try {
    // Use NextAuth session validation
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      throw new AuthenticationError("No valid session found");
    }

    // Get user with client data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true },
    });

    if (!user || !user.client) {
      throw new AuthenticationError("Client not found");
    }

    const client = user.client;

    if (client.lockedUntil && client.lockedUntil > new Date()) {
      throw new AuthenticationError("Account is locked");
    }

    return client;
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof AuthenticationError) {
      throw error;
    }
    
    throw new AuthenticationError("Authentication failed");
  }
}

export async function optionalAuth(
  request: NextRequest
): Promise<Client | null> {
  try {
    return await authenticateRequest(request);
  } catch {
    return null;
  }
}
