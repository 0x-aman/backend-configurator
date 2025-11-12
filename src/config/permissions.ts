// Permission and authorization rules

import { SubscriptionStatus } from "@prisma/client";

// Two-tier system: Free (trial/inactive) and Subscribed (active)
export const PLAN_LIMITS = {
  FREE: {
    configurators: 1,
    requests: 1000,
    storage: 100, // MB
    customDomain: false,
    apiAccess: false,
    analytics: false,
  },
  SUBSCRIBED: {
    configurators: -1, // unlimited
    requests: 1000000,
    storage: -1, // unlimited
    customDomain: true,
    apiAccess: true,
    analytics: true,
  },
};

// Helper to determine which limits apply based on subscription status
function getPlanLimits(status: SubscriptionStatus) {
  // Active and trialing users get subscribed features
  if (status === "ACTIVE" || (status as any) === "TRIALING") {
    return PLAN_LIMITS.SUBSCRIBED;
  }
  return PLAN_LIMITS.FREE;
}

export function canCreateConfigurator(
  status: SubscriptionStatus,
  currentCount: number
): boolean {
  const limits = getPlanLimits(status);
  return limits.configurators === -1 || currentCount < limits.configurators;
}

export function canMakeRequest(
  status: SubscriptionStatus,
  monthlyRequests: number
): boolean {
  const limits = getPlanLimits(status);
  return monthlyRequests < limits.requests;
}

export function hasFeature(
  status: SubscriptionStatus,
  feature: keyof typeof PLAN_LIMITS.FREE
): boolean {
  const limits = getPlanLimits(status);
  return limits[feature] === true;
}

export const ADMIN_PERMISSIONS = [
  "view:all_clients",
  "edit:all_clients",
  "delete:all_clients",
  "view:system_stats",
  "impersonate:client",
];

export const CLIENT_PERMISSIONS = [
  "create:configurator",
  "edit:own_configurator",
  "delete:own_configurator",
  "view:own_quotes",
  "manage:billing",
];
