// Create Stripe checkout session
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { BillingService } from "@/src/services/billing.service";
import { success, fail } from "@/src/lib/response";
import { env } from "@/src/config/env";

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { duration, successUrl, cancelUrl } = body;

    if (!duration || (duration !== "MONTHLY" && duration !== "YEARLY")) {
      return fail(
        "Valid duration (MONTHLY or YEARLY) is required",
        "VALIDATION_ERROR"
      );
    }

    // Ensure the success URL includes the Checkout session placeholder so we
    // can verify the session on redirect: Stripe will replace
    // {CHECKOUT_SESSION_ID} with the real session id.
    const baseSuccess =
      successUrl || `${env.APP_URL}/dashboard/billing?success=true`;
    const successWithSession = baseSuccess.includes("{CHECKOUT_SESSION_ID}")
      ? baseSuccess
      : `${baseSuccess}${baseSuccess.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;

    const baseCancel =
      cancelUrl || `${env.APP_URL}/dashboard/billing?canceled=true`;

    const session = await BillingService.createCheckoutSession(
      client.id,
      duration,
      successWithSession,
      baseCancel
    );

    return success({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    return fail(error.message, "BILLING_ERROR", 500);
  }
}
