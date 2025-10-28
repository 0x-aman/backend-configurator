// Billing service
import { prisma } from '@/src/lib/prisma';
import { stripe, createCheckoutSession, createCustomer, createCustomerPortalSession } from '@/src/lib/stripe';
import { ClientService } from './client.service';
import type { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { PLAN_LIMITS } from '@/src/config/permissions';

export const BillingService = {
  async createCheckoutSession(
    clientId: string,
    duration: 'MONTHLY' | 'YEARLY',
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

    // Create or get price IDs for monthly and yearly subscriptions
    // In production, these should be created in Stripe dashboard and stored in env
    const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID;
    const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID;

    // If no price IDs in env, create them dynamically (for development)
    let priceId: string;
    
    if (duration === 'MONTHLY') {
      priceId = monthlyPriceId || await createOrGetPrice('monthly', 9900); // €99.00
    } else {
      priceId = yearlyPriceId || await createOrGetPrice('yearly', 99900); // €999.00
    }

    const session = await createCheckoutSession({
      customerId,
      priceId,
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

    // Determine duration from price interval
    const interval = subscription.items.data[0]?.price.recurring?.interval;
    const duration = interval === 'year' ? 'YEARLY' : 'MONTHLY';

    await prisma.client.update({
      where: { id: client.id },
      data: {
        subscriptionStatus: status,
        subscriptionDuration: duration,
        stripeSubscriptionId: subscriptionId,
        subscriptionEndsAt: currentPeriodEnd,
      },
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

    await prisma.client.update({
      where: { id: client.id },
      data: {
        subscriptionStatus: 'CANCELED',
        subscriptionDuration: null,
        stripeSubscriptionId: null,
        subscriptionEndsAt: new Date(),
      },
    });
  },
};

// Helper function to create or get Stripe price
async function createOrGetPrice(interval: 'month' | 'year', amount: number): Promise<string> {
  try {
    // Try to find existing product
    const products = await stripe.products.list({
      limit: 1,
    });

    let productId: string;

    if (products.data.length === 0) {
      // Create product if it doesn't exist
      const product = await stripe.products.create({
        name: 'Configurator Subscription',
        description: 'Product configurator platform subscription',
      });
      productId = product.id;
    } else {
      productId = products.data[0].id;
    }

    // Create price
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: amount,
      currency: 'eur',
      recurring: {
        interval: interval,
      },
    });

    return price.id;
  } catch (error) {
    console.error('Failed to create price:', error);
    // Fallback to dummy price IDs
    return interval === 'month' ? 'price_monthly' : 'price_yearly';
  }
}
