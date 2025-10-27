// Authentication middleware
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";
import { AuthenticationError } from "@/src/lib/errors";
import type { Client } from "@prisma/client";

export async function authenticateRequest(
  request: NextRequest
): Promise<Client> {
  // Use NextAuth session validation
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    throw new AuthenticationError("No valid session found");
  }

  const userWithId = session.user as typeof session.user & { id: string };
  const client = await prisma.client.findUnique({
    where: { id: userWithId.id },
  });

  if (!client) {
    throw new AuthenticationError("Client not found");
  }

  if (client.lockedUntil && client.lockedUntil > new Date()) {
    throw new AuthenticationError("Account is locked");
  }

  return client;
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
