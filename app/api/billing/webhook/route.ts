// Unified Stripe webhook
import { NextRequest } from "next/server";
import { constructWebhookEvent, stripe } from "@/src/lib/stripe";
import { BillingService } from "@/src/services/billing.service";
import { prisma } from "@/src/lib/prisma";
import { success, fail } from "@/src/lib/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) return fail("Missing signature", "WEBHOOK_ERROR", 400);

    const event = constructWebhookEvent(body, signature);
    console.log(`[Webhook] ${event.type} ID: ${event.id}`);

    switch (event.type) {
      // ✅ Subscription checkout finished
      case "checkout.session.completed": {
        const session: any = event.data.object;

        // Subscription plan checkout
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription
          );
          await BillingService.handleSubscriptionCreated(subscription);
        }

        // ✅ Option block one-time purchase
        // ✅ Option capacity upgrade (+10 options)
        if (session.mode === "payment") {
          const type = session.metadata?.type;

          if (type === "OPTION_BLOCK") {
            const customerId = session.customer as string;

            const client = await prisma.client.findFirst({
              where: { stripeCustomerId: customerId },
              select: { id: true },
            });

            if (client) {
              // Count current primary options in DB
              const currentOptions = await prisma.option.count({
                where: {
                  category: {
                    isPrimary: true,
                    configurator: { clientId: client.id },
                  },
                },
              });

              // Store +10 block
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

              // Log the transaction in audit
              await prisma.auditBillingEvent.create({
                data: {
                  clientId: client.id,
                  event: "OPTION_BLOCK_PURCHASED",
                  details: {
                    sessionId: session.id,
                    paymentIntentId: session.payment_intent,
                    amount: session.amount_total,
                  },
                },
              });

              console.log(
                `[Billing] +10 options added for client ${client.id} — transaction logged.`
              );
            }
          }
        }

        break;
      }

      // ✅ New sub
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await BillingService.handleSubscriptionCreated(event.data.object);
        break;

      // ✅ Cancel sub
      case "customer.subscription.deleted":
        await BillingService.handleSubscriptionDeleted(event.data.object);
        break;

      // ✅ Invoice paid = new billing cycle → reset block counter
      case "invoice.payment_succeeded": {
        const inv: any = event.data.object;
        const sub = inv.subscription as string;
        const client = await prisma.client.findFirst({
          where: { stripeSubscriptionId: sub },
        });
        if (client) {
          await prisma.billingUsage.updateMany({
            where: { clientId: client.id },
            data: { chargedBlocks: 0, lastSync: new Date() },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return success({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return fail(err.message, "WEBHOOK_ERROR", 400);
  }
}
