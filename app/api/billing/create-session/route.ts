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

    const { plan } = body;

    if (!plan) {
      return fail('Plan is required', 'VALIDATION_ERROR');
    }

    const successUrl = `${env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${env.APP_URL}/billing`;

    const session = await BillingService.createCheckoutSession(
      client.id,
      plan,
      successUrl,
      cancelUrl
    );

    return success({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    return fail(error.message, 'BILLING_ERROR', 500);
  }
}
