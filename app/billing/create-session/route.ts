// Create Stripe checkout session
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { BillingService } from '@/src/services/billing.service';
import { success, fail } from '@/src/lib/response';
import { env } from '@/src/config/env';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { duration, successUrl, cancelUrl } = body;

    if (!duration || (duration !== 'MONTHLY' && duration !== 'YEARLY')) {
      return fail('Valid duration (MONTHLY or YEARLY) is required', 'VALIDATION_ERROR');
    }

    const session = await BillingService.createCheckoutSession(
      client.id,
      duration,
      successUrl || `${env.APP_URL}/dashboard/billing?success=true`,
      cancelUrl || `${env.APP_URL}/dashboard/billing?canceled=true`
    );

    return success({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    return fail(error.message, 'BILLING_ERROR', 500);
  }
}
