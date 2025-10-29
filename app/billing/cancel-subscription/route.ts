// Cancel subscription (at period end)
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ClientService } from '@/src/services/client.service';
import { stripe } from '@/src/lib/stripe';
import { success, fail } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);

    if (!client.stripeSubscriptionId) {
      return fail('No active subscription found', 'NO_SUBSCRIPTION', 404);
    }

    // Cancel subscription at period end (no immediate cancellation)
    const subscription = await stripe.subscriptions.update(
      client.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Update client status
    await ClientService.update(client.id, {
      subscriptionStatus: 'CANCELED',
    });

    return success({
      message: 'Subscription will be canceled at the end of the billing period',
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    });
  } catch (error: any) {
    console.error('Failed to cancel subscription:', error);
    return fail(error.message, 'CANCELLATION_ERROR', 500);
  }
}
