// Billing service
import { prisma } from "@/src/lib/prisma";
import {
  stripe,
  createCheckoutSession,
  createCustomer,
  createCustomerPortalSession,
} from "@/src/lib/stripe";
import { ClientService } from "./client.service";
import type { SubscriptionStatus, SubscriptionDuration } from "@prisma/client";
import { PLAN_LIMITS } from "@/src/config/permissions";
import { env } from "@/src/config/env";

export const BillingService = {
  async createCheckoutSession(
    clientId: string,
    duration: "MONTHLY" | "YEARLY",
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
    const monthlyPriceId = env.STRIPE_MONTHLY_PRICE_ID;
    const yearlyPriceId = env.STRIPE_YEARLY_PRICE_ID;

    // If no price IDs in env, create them dynamically (for development)
    let priceId: string;

    if (duration === "MONTHLY") {
      priceId = monthlyPriceId || (await createOrGetPrice("month", 9900)); // €99.00
    } else {
      priceId = yearlyPriceId || (await createOrGetPrice("year", 99900)); // €999.00
    }

    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
    });

    return session;
  },

  async createUpgradeCheckoutSession(
    clientId: string,
    currentClient: {
      subscriptionEndsAt: Date | null;
      stripeSubscriptionId: string;
    },
    successUrl: string,
    cancelUrl: string
  ) {
    const client = await ClientService.getById(clientId);

    if (!client.stripeCustomerId) {
      throw new Error("No Stripe customer found");
    }

    // Calculate proration
    const now = new Date();
    const periodEnd = currentClient.subscriptionEndsAt!;
    const totalDaysInMonth = 30; // Approximate
    const daysRemaining = Math.max(
      0,
      Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    const daysUsed = totalDaysInMonth - daysRemaining;

    // Calculate remaining credit
    const monthlyPrice = 99; // €99
    const yearlyPrice = 999; // €999
    const dailyMonthlyRate = monthlyPrice / totalDaysInMonth;
    const remainingCredit = Math.max(0, daysRemaining * dailyMonthlyRate);

    // Amount to charge = yearly price - remaining credit
    const amountToCharge = Math.max(
      0,
      Math.round((yearlyPrice - remainingCredit) * 100)
    ); // in cents

    console.log("Upgrade proration calculation:", {
      daysUsed,
      daysRemaining,
      remainingCredit: remainingCredit.toFixed(2),
      amountToCharge: (amountToCharge / 100).toFixed(2),
    });

    // Cancel the current monthly subscription immediately
    try {
      await stripe.subscriptions.update(currentClient.stripeSubscriptionId, {
        cancel_at_period_end: false,
        proration_behavior: "none",
      });
      await stripe.subscriptions.cancel(currentClient.stripeSubscriptionId);
    } catch (err) {
      console.warn("Failed to cancel existing subscription:", err);
    }

    // Create a new yearly subscription checkout with prorated amount
    const yearlyPriceId =
      env.STRIPE_YEARLY_PRICE_ID || (await createOrGetPrice("year", 99900));

    // Create checkout session with custom amount if prorated
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: client.stripeCustomerId,
      line_items: [
        {
          price: yearlyPriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          upgrade_from: "MONTHLY",
          prorated_credit: remainingCredit.toFixed(2),
          original_subscription: currentClient.stripeSubscriptionId,
        },
      },
      discounts:
        remainingCredit > 0
          ? [
              {
                coupon: await createProrationCoupon(
                  Math.round(remainingCredit * 100)
                ),
              },
            ]
          : undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clientId: clientId,
        upgrade: "true",
      },
    });

    return session;
  },

  async createPortalSession(clientId: string, returnUrl: string) {
    const client = await ClientService.getById(clientId);

    if (!client.stripeCustomerId) {
      throw new Error("No Stripe customer found");
    }

    return await createCustomerPortalSession(
      client.stripeCustomerId,
      returnUrl
    );
  },

  async handleSubscriptionCreated(subscription: any) {
    try {
      const customerId = subscription.customer;
      const subscriptionId = subscription.id;
      const stripeStatus = subscription.status; // 'active', 'trialing', 'past_due', etc.
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      console.log("Processing subscription:", {
        subscriptionId,
        customerId,
        status: stripeStatus,
        currentPeriodEnd,
      });

      // Map Stripe status to our SubscriptionStatus enum
      let status: SubscriptionStatus;
      switch (stripeStatus) {
        case "active":
        case "trialing": // Map trialing to active since we don't support trials
          status = "ACTIVE";
          break;
        case "past_due":
          status = "PAST_DUE";
          break;
        case "canceled":
        case "unpaid":
          status = "CANCELED";
          break;
        case "incomplete":
        case "incomplete_expired":
        default:
          status = "INACTIVE";
          break;
      }

      // Find client by Stripe customer ID
      const client = await prisma.client.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (!client) {
        console.error(`No client found for Stripe customer: ${customerId}`);
        throw new Error(`Client not found for customer ${customerId}`);
      }

      // Determine duration from price interval
      const interval = subscription.items.data[0]?.price.recurring?.interval;
      const duration = interval === "year" ? "YEARLY" : "MONTHLY";

      // Get the price ID
      const priceId = subscription.items.data[0]?.price.id;

      console.log(
        `Updating client ${client.id} (${client.email}) subscription:`,
        {
          status,
          duration,
          subscriptionId,
          priceId,
          stripeStatus,
        }
      );

      await prisma.client.update({
        where: { id: client.id },
        data: {
          subscriptionStatus: status,
          subscriptionDuration: duration,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          subscriptionEndsAt: currentPeriodEnd,
        },
      });

      console.log(
        `✅ Successfully updated client ${client.id} subscription status to ${status}`
      );
    } catch (error: any) {
      console.error("Error in handleSubscriptionCreated:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
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
        subscriptionStatus: "CANCELED",
        subscriptionDuration: null,
        stripeSubscriptionId: null,
        subscriptionEndsAt: new Date(),
      },
    });
  },
};

// Helper function to create or get Stripe price
async function createOrGetPrice(
  interval: "month" | "year",
  amount: number
): Promise<string> {
  try {
    // Try to find existing product
    const products = await stripe.products.list({
      limit: 1,
    });

    let productId: string;

    if (products.data.length === 0) {
      // Create product if it doesn't exist
      const product = await stripe.products.create({
        name: "Configurator Subscription",
        description: "Product configurator platform subscription",
      });
      productId = product.id;
    } else {
      productId = products.data[0].id;
    }

    // Create price
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: amount,
      currency: "eur",
      recurring: {
        interval: interval,
      },
    });

    return price.id;
  } catch (error) {
    console.error("Failed to create price:", error);
    // Fallback to dummy price IDs
    return interval === "month" ? "price_monthly" : "price_yearly";
  }
}

// Helper to create a one-time coupon for proration
async function createProrationCoupon(amountOff: number): Promise<string> {
  try {
    const coupon = await stripe.coupons.create({
      amount_off: amountOff,
      currency: "eur",
      duration: "once",
      name: "Upgrade Credit",
    });
    return coupon.id;
  } catch (error) {
    console.error("Failed to create proration coupon:", error);
    throw error;
  }
}
