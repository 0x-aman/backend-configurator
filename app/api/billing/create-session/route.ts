// Create Stripe checkout session
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { BillingService } from "@/src/services/billing.service";
import { success, fail } from "@/src/lib/response";
import { env } from "@/src/config/env";
import { prisma } from "@/src/lib/prisma";

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

    // Check if user is upgrading from MONTHLY to YEARLY
    const currentClient = await prisma.client.findUnique({
      where: { id: client.id },
      select: {
        subscriptionStatus: true,
        subscriptionDuration: true,
        subscriptionEndsAt: true,
        stripeSubscriptionId: true,
      },
    });

    const isUpgradeToYearly =
      duration === "YEARLY" &&
      currentClient?.subscriptionStatus === "ACTIVE" &&
      currentClient?.subscriptionDuration === "MONTHLY" &&
      currentClient?.subscriptionEndsAt &&
      currentClient?.stripeSubscriptionId;

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

    // If upgrading from monthly to yearly, calculate proration
    if (isUpgradeToYearly) {
      const session = await BillingService.createUpgradeCheckoutSession(
        client.id,
        currentClient! as any,
        successWithSession,
        baseCancel
      );
      return success({ sessionId: session.id, url: session.url });
    }

    // Regular subscription flow
    const session = await BillingService.createCheckoutSession(
      client.id,
      duration,
      successWithSession,
      baseCancel
    );

    return success({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Create session error:", error);
    return fail(error.message, "BILLING_ERROR", 500);
  }
}
