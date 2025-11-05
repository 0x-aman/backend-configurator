// Stripe webhook handler
import { NextRequest } from "next/server";
import { constructWebhookEvent, stripe } from "@/src/lib/stripe";
import { BillingService } from "@/src/services/billing.service";
import { success, fail } from "@/src/lib/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return fail("Missing signature", "WEBHOOK_ERROR", 400);
    }

    const event = constructWebhookEvent(body, signature);

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
        console.log("Handling subscription created:", event.data.object.id);
        await BillingService.handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        console.log("Handling subscription updated:", event.data.object.id);
        await BillingService.handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        console.log("Handling subscription deleted:", event.data.object.id);
        await BillingService.handleSubscriptionDeleted(event.data.object);
        break;

      case "checkout.session.completed":
        console.log(
          "Handling checkout session completed:",
          event.data.object.id
        );
        // Fetch the subscription from the session and update client
        const session = event.data.object as any;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await BillingService.handleSubscriptionCreated(subscription);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return success({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return fail(error.message, "WEBHOOK_ERROR", 400);
  }
}
