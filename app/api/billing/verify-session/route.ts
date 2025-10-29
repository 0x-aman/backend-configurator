import { NextRequest } from "next/server";
import { BillingService } from "@/src/services/billing.service";
import { stripe } from "@/src/lib/stripe";
import { authenticateRequest } from "@/src/middleware/auth";
import { success, fail } from "@/src/lib/response";

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return fail("session_id is required", "VALIDATION_ERROR", 400);
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(
      sessionId as string
    );

    if (!session) {
      return fail("Checkout session not found", "NOT_FOUND", 404);
    }

    // If session contains a subscription, fetch it and update client via BillingService
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await BillingService.handleSubscriptionCreated(subscription);

      return success({ updated: true });
    }

    return success({
      updated: false,
      message: "No subscription attached to session",
    });
  } catch (error: any) {
    console.error("[verify-session] Error:", error);
    return fail(
      error.message || "Failed to verify session",
      "VERIFY_ERROR",
      500
    );
  }
}
