// src/lib/verifyEditToken.ts
import { verify } from "jsonwebtoken";
import { env } from "@/src/config/env";

/**
 * Verify edit token (configurator-scoped) or API token (client-scoped)
 *
 * @param token - JWT token to verify
 * @returns Payload with clientId and optional configuratorId
 */
export async function verifyEditToken(token: string) {
  if (!token) return null;

  const secret = env.EDIT_TOKEN_SECRET;
  if (!secret) throw new Error("EDIT_TOKEN_SECRET not configured");

  try {
    const payload: any = verify(token, secret);

    if (!payload || !payload.sub) {
      return null;
    }

    // Handle configurator edit tokens (legacy/existing)
    if (payload.type === "configurator_edit" && payload.configuratorId) {
      return {
        clientId: String(payload.sub),
        configuratorId: String(payload.configuratorId),
      };
    }

    // Handle API access tokens (new - client-scoped)
    if (payload.type === "api_access") {
      return {
        clientId: String(payload.sub),
        configuratorId: undefined, // API tokens are not configurator-specific
      };
    }

    return null;
  } catch {
    // token expired, malformed, or otherwise cursed
    return null;
  }
}
