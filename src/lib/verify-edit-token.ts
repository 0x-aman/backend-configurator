// src/lib/verifyEditToken.ts
import { verify } from "jsonwebtoken";
import { env } from "@/src/config/env";
import { unauthorized } from "@/src/lib/response";

export async function verifyEditToken(token: string) {
  if (!token) throw unauthorized("Missing edit token");

  const secret = env.EDIT_TOKEN_SECRET;
  if (!secret) throw new Error("EDIT_TOKEN_SECRET not configured");

  let payload: any;
  try {
    payload = verify(token, secret) as any;
  } catch {
    throw unauthorized("Invalid or expired edit token");
  }

  if (
    !payload ||
    payload.type !== "configurator_edit" ||
    !payload.sub ||
    !payload.configuratorId
  ) {
    throw unauthorized("Invalid token payload");
  }
  console.log(payload, "payload");
  return {
    clientId: String(payload.sub),
    configuratorId: String(payload.configuratorId),
  };
}
