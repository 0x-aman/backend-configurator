// Stripe webhook handler - CONSOLIDATED
import { NextRequest } from 'next/server';
import { constructWebhookEvent, stripe } from '@/src/lib/stripe';
import { BillingService } from '@/src/services/billing.service';
import { success, fail } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return fail('Missing signature', 'WEBHOOK_ERROR', 400);
    }

    const event = constructWebhookEvent(body, signature);

    console.log(`[Webhook] Received event: ${event.type} - ID: ${event.id}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Handling checkout session completed:', event.data.object.id);
        // When checkout completes, fetch the subscription and update client status
        const session = event.data.object as any;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          console.log(`[Webhook] Retrieved subscription ${subscription.id} from checkout session`);
          await BillingService.handleSubscriptionCreated(subscription);
        } else {
          console.warn('[Webhook] Checkout session completed without subscription');
        }
        break;

      case 'customer.subscription.created':
        console.log('Handling subscription created:', event.data.object.id);
        await BillingService.handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        console.log('Handling subscription updated:', event.data.object.id);
        await BillingService.handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        console.log('Handling subscription deleted:', event.data.object.id);
        await BillingService.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        // Invoices are automatically created by Stripe, no need to store separately
        // They will be fetched via API when needed
        console.log(`[Webhook] Invoice paid: ${event.data.object.id}`);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return success({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error:', error);
    return fail(error.message, 'WEBHOOK_ERROR', 400);
  }
}
