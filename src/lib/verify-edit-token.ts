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
      configuratorId: String(payload.configuratorId),
    };
  } catch {
    // token expired, malformed, or otherwise cursed
    return null;
  }
}
