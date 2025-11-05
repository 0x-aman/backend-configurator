// Billing and subscription types
import { SubscriptionDuration, SubscriptionStatus } from '@prisma/client';

export { SubscriptionDuration, SubscriptionStatus };

export interface CreateCheckoutSessionRequest {
  duration: SubscriptionDuration;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

export interface SubscriptionData {
  subscriptionId: string;
  customerId: string;
  status: SubscriptionStatus;
  duration: SubscriptionDuration | null;
  currentPeriodEnd: Date;
}

// ✅ Billing information for dashboard
export interface BillingInfo {
  subscriptionStatus: SubscriptionStatus;
  subscriptionDuration: SubscriptionDuration | null;
  subscriptionEndsAt: string | null;
  stripeCustomerId: string | null;
}

// ✅ Transaction history
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  planType: string;
  status: string;
  invoiceUrl: string | null;
  invoicePdf: string | null;
}
