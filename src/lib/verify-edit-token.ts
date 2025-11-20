// src/lib/verifyEditToken.ts
import { verify } from "jsonwebtoken";
import { env } from "@/src/config/env";

export async function verifyEditToken(token: string) {
  if (!token) return null;

  const secret = env.EDIT_TOKEN_SECRET;
  if (!secret) throw new Error("EDIT_TOKEN_SECRET not configured");

  try {
    const payload: any = verify(token, secret);

    if (
      !payload ||
      payload.type !== "configurator_edit" ||
      !payload.sub ||
      !payload.configuratorId
    ) {
      return null;
    }

    return {
      clientId: String(payload.sub),
      publicKey: String(payload.publicKey),
      configuratorId: String(payload.configuratorId),
    };
  } catch {
    // token expired, malformed, or otherwise cursed
    return null;
  }
}


import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from "next/server";

/**
 * Try to resolve client context from:
 * 1) NextAuth session (server session)
 * 2) Authorization header Bearer <token>
 * 3) body.token (if provided as string)
 *
 * Returns: { clientId, configuratorId? } or null
 */
export async function getClientFromRequest(request: NextRequest, bodyToken?: string) {
  try {
    // 1) Try NextAuth session
    const session = await getServerSession(authOptions);
    if (session && session.user && session.user.email) {
      // fetch client by email
      const client = await (await import("@/src/lib/prisma")).prisma.client.findUnique({
        where: { email: session.user.email as string },
      });
      if (client) return { clientId: String(client.id) };
    }
  } catch (err) {
    // session might not be available in non-next contexts
  }

  // 2) Try token from header
  try {
    const header = request.headers.get("authorization") || "";
    const bearer = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    const tokenToUse = bearer || bodyToken;
    if (!tokenToUse) return null;

    const payload: any = await verifyEditToken(tokenToUse);
    if (!payload) return null;
    return { clientId: payload.clientId, configuratorId: payload.configuratorId };
  } catch (err) {
    return null;
  }
}
