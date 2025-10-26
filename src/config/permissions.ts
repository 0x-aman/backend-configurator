// Permission and authorization rules

import { SubscriptionPlan } from '@prisma/client';

export const PLAN_LIMITS = {
  FREE: {
    configurators: 1,
    requests: 1000,
    storage: 100, // MB
    customDomain: false,
    apiAccess: false,
    analytics: false,
  },
  STARTER: {
    configurators: 5,
    requests: 10000,
    storage: 1000, // MB
    customDomain: true,
    apiAccess: true,
    analytics: true,
  },
  PRO: {
    configurators: 25,
    requests: 100000,
    storage: 10000, // MB
    customDomain: true,
    apiAccess: true,
    analytics: true,
  },
  ENTERPRISE: {
    configurators: -1, // unlimited
    requests: 1000000,
    storage: -1, // unlimited
    customDomain: true,
    apiAccess: true,
    analytics: true,
  },
};

export function canCreateConfigurator(plan: SubscriptionPlan, currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan].configurators;
  return limit === -1 || currentCount < limit;
}

export function canMakeRequest(plan: SubscriptionPlan, monthlyRequests: number): boolean {
  const limit = PLAN_LIMITS[plan].requests;
  return monthlyRequests < limit;
}

export function hasFeature(plan: SubscriptionPlan, feature: keyof typeof PLAN_LIMITS.FREE): boolean {
  return PLAN_LIMITS[plan][feature] === true;
}

export const ADMIN_PERMISSIONS = [
  'view:all_clients',
  'edit:all_clients',
  'delete:all_clients',
  'view:system_stats',
  'impersonate:client',
];

export const CLIENT_PERMISSIONS = [
  'create:configurator',
  'edit:own_configurator',
  'delete:own_configurator',
  'view:own_quotes',
  'manage:billing',
];
