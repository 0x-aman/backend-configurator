// Cancel subscription (at period end)
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ClientService } from '@/src/services/client.service';
import { stripe } from '@/src/lib/stripe';
import { success, fail, unauthorized } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);

    if (!client.stripeSubscriptionId) {
      console.log(`Client ${client.id} attempted to cancel but has no active subscription`);
      return fail('No active subscription found', 'NO_SUBSCRIPTION', 404);
    }

    console.log(`Canceling subscription for client ${client.id}:`, {
      subscriptionId: client.stripeSubscriptionId,
      currentStatus: client.subscriptionStatus,
    });

    // Cancel subscription at period end (no immediate cancellation)
    const subscription = await stripe.subscriptions.update(
      client.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    console.log('Subscription marked for cancellation:', {
      subscriptionId: subscription.id,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    // Update client status
    await ClientService.update(client.id, {
      subscriptionStatus: 'CANCELED',
    });

    return success({
      message: 'Subscription will be canceled at the end of the billing period',
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    });
  } catch (error: any) {
    console.error('Failed to cancel subscription:', {
      message: error.message,
      type: error.type,
    });
    
    if (error.statusCode === 401 || error.message?.includes('session')) {
      return unauthorized(error.message || 'Authentication required');
    }
    
    return fail(
      error.message || 'Failed to cancel subscription',
      'CANCELLATION_ERROR',
      500
    );
  }
}
