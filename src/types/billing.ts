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
