// Billing and subscription types
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

export { SubscriptionPlan, SubscriptionStatus };

export interface CreateCheckoutSessionRequest {
  plan: SubscriptionPlan;
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
  plan: SubscriptionPlan;
  currentPeriodEnd: Date;
}
