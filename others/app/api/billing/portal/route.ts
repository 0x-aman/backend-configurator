// Create Stripe customer portal session
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { BillingService } from "@/src/services/billing.service";
import { success, fail } from "@/src/lib/response";
import { env } from "@/src/config/env";

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);

    const returnUrl = `${env.APP_URL}/dashboard/billing`;
    const session = await BillingService.createPortalSession(
      client.id,
      returnUrl
    );

    return success({ url: session.url });
  } catch (error: any) {
    return fail(error.message, "PORTAL_ERROR", 500);
  }
}
