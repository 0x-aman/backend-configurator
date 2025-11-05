import { NextRequest } from "next/server";
import { BillingService } from "@/src/services/billing.service";
import { stripe } from "@/src/lib/stripe";
import { prisma } from "@/src/lib/prisma";
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

    // Handle one-off payments for OPTION_BLOCK (add +10 options)
    if (session.mode === "payment") {
      const type = session.metadata?.type;
      if (type === "OPTION_BLOCK") {
        // Find client by stripe customer id
        const customerId = session.customer as string;
        const client = await prisma.client.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });

        if (!client) {
          return fail(
            "Client not found for session customer",
            "NOT_FOUND",
            404
          );
        }

        // Idempotency: ensure we haven't already processed this session
        // Idempotency check: look for an audit event with this session id
        const existing = await prisma.auditBillingEvent.findFirst({
          where: {
            event: "OPTION_BLOCK_PURCHASED",
            details: { equals: { sessionId: session.id } } as any,
          },
        });

        if (existing) {
          return success({ updated: false, message: "Already processed" });
        }

        // Count current primary options in DB
        const currentOptions = await prisma.option.count({
          where: {
            category: {
              isPrimary: true,
              configurator: { clientId: client.id },
            },
          },
        });

        // Upsert usage: increment chargedBlocks by 1
        await prisma.billingUsage.upsert({
          where: { clientId: client.id },
          update: {
            chargedBlocks: { increment: 1 },
            totalPrimaryOptions: currentOptions,
            lastSync: new Date(),
          },
          create: {
            clientId: client.id,
            chargedBlocks: 1,
            totalPrimaryOptions: currentOptions,
          },
        });

        await prisma.auditBillingEvent.create({
          data: {
            clientId: client.id,
            event: "OPTION_BLOCK_PURCHASED",
            details: { sessionId: session.id },
          },
        });

        return success({ updated: true });
      }
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
