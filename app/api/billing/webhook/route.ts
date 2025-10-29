// Stripe webhook handler
import { NextRequest } from 'next/server';
import { constructWebhookEvent } from '@/src/lib/stripe';
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

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await BillingService.handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await BillingService.handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        // Invoices are automatically created by Stripe, no need to store separately
        // They will be fetched via API when needed
        console.log(`Invoice paid: ${event.data.object.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return success({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return fail(error.message, 'WEBHOOK_ERROR', 400);
  }
}
