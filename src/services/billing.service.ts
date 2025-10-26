// Billing service
import { prisma } from '@/src/lib/prisma';
import { stripe, createCheckoutSession, createCustomer, createCustomerPortalSession } from '@/src/lib/stripe';
import { ClientService } from './client.service';
import type { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { PLAN_LIMITS } from '@/src/config/permissions';

export const BillingService = {
  async createCheckoutSession(
    clientId: string,
    plan: SubscriptionPlan,
    successUrl: string,
    cancelUrl: string
  ) {
    const client = await ClientService.getById(clientId);

    let customerId = client.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createCustomer({
        email: client.email,
        name: client.name,
        metadata: { clientId: client.id },
      });
      customerId = customer.id;

      await ClientService.update(clientId, {
        stripeCustomerId: customerId,
      });
    }

    // Get price ID based on plan (these would be configured in Stripe)
    const priceIds: Record<SubscriptionPlan, string> = {
      FREE: '', // No price for free
      STARTER: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
      PRO: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
      ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    };

    const session = await createCheckoutSession({
      customerId,
      priceId: priceIds[plan],
      successUrl,
      cancelUrl,
    });

    return session;
  },

  async createPortalSession(clientId: string, returnUrl: string) {
    const client = await ClientService.getById(clientId);

    if (!client.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    return await createCustomerPortalSession(client.stripeCustomerId, returnUrl);
  },

  async handleSubscriptionCreated(subscription: any) {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status as SubscriptionStatus;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Find client by Stripe customer ID
    const client = await prisma.client.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!client) return;

    // Determine plan from price ID
    const priceId = subscription.items.data[0]?.price.id;
    let plan: SubscriptionPlan = 'FREE';

    // Map price ID to plan (configure these in env)
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) plan = 'STARTER';
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'PRO';
    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) plan = 'ENTERPRISE';

    await ClientService.updateSubscription(client.id, {
      subscriptionStatus: status,
      subscriptionPlan: plan,
      stripeSubscriptionId: subscriptionId,
      subscriptionEndsAt: currentPeriodEnd,
    });

    // Update request limit based on plan
    const limit = PLAN_LIMITS[plan].requests;
    await prisma.client.update({
      where: { id: client.id },
      data: { requestLimit: limit },
    });
  },

  async handleSubscriptionUpdated(subscription: any) {
    await this.handleSubscriptionCreated(subscription);
  },

  async handleSubscriptionDeleted(subscription: any) {
    const customerId = subscription.customer;

    const client = await prisma.client.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!client) return;

    await ClientService.updateSubscription(client.id, {
      subscriptionStatus: 'CANCELED',
      subscriptionPlan: 'FREE',
      stripeSubscriptionId: undefined,
      subscriptionEndsAt: new Date(),
    });
  },
};
