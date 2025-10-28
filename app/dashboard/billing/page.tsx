"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface BillingInfo {
  subscriptionStatus: string;
  subscriptionDuration: string | null;
  subscriptionEndsAt: string | null;
  stripeCustomerId: string | null;
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const response = await fetch("/api/client/me");
        if (response.ok) {
          const { data } = await response.json();
          setBilling({
            subscriptionStatus: data?.subscriptionStatus || "INACTIVE",
            subscriptionDuration: data?.subscriptionDuration || null,
            subscriptionEndsAt: data?.subscriptionEndsAt || null,
            stripeCustomerId: data?.stripeCustomerId || null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch billing:", error);
        toast.error("Failed to load billing information");
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, []);

  const handleSubscribe = async (duration: "MONTHLY" | "YEARLY") => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/billing/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        }),
      });

      const json = await response.json();
      // Handle new API response format: { success: true, data: {...} }
      const data = json.data || json;
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      toast.error("Failed to start checkout. Please try again.");
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/billing`,
        }),
      });

      const json = await response.json();
      // Handle new API response format: { success: true, data: {...} }
      const data = json.data || json;
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      toast.error("Failed to open billing portal. Please try again.");
      setActionLoading(false);
    }
  };

  const pricingPlans = [
    {
      duration: "MONTHLY" as const,
      price: "€99",
      period: "per month",
      description: "Billed monthly",
      features: [
        "Unlimited configurators",
        "Unlimited quotes",
        "Email support",
        "Custom branding",
        "Analytics dashboard",
        "API access",
      ],
    },
    {
      duration: "YEARLY" as const,
      price: "€999",
      period: "per year",
      description: "Billed annually",
      savings: "Save €189 per year",
      features: [
        "Everything in Monthly",
        "Priority support",
        "Advanced analytics",
        "White-label option",
        "Dedicated account manager",
        "Custom integrations",
      ],
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid="billing-title"
        >
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Subscription Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Your plan and billing status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    billing?.subscriptionStatus === "ACTIVE"
                      ? "default"
                      : "secondary"
                  }
                  className="text-base px-3 py-1"
                  data-testid="subscription-status"
                >
                  {billing?.subscriptionStatus}
                </Badge>
                {billing?.subscriptionDuration && (
                  <span
                    className="text-sm text-muted-foreground"
                    data-testid="subscription-duration"
                  >
                    {billing.subscriptionDuration === "MONTHLY"
                      ? "Monthly Plan"
                      : "Yearly Plan"}
                  </span>
                )}
              </div>

              {billing?.subscriptionEndsAt && (
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="subscription-ends"
                >
                  {billing.subscriptionStatus === "ACTIVE"
                    ? `Renews on ${new Date(billing.subscriptionEndsAt).toLocaleDateString()}`
                    : `Expires on ${new Date(billing.subscriptionEndsAt).toLocaleDateString()}`}
                </p>
              )}

              {billing?.stripeCustomerId &&
                billing?.subscriptionStatus === "ACTIVE" && (
                  <Button
                    onClick={handleManageBilling}
                    disabled={actionLoading}
                    data-testid="manage-billing-button"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Manage Billing
                      </>
                    )}
                  </Button>
                )}

              {(!billing?.subscriptionStatus ||
                billing?.subscriptionStatus === "INACTIVE" ||
                billing?.subscriptionStatus === "TRIALING") && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are currently on a trial. Choose a plan below to
                    continue after your trial ends.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the billing cycle that works best for you
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.duration}
            className={`relative ${plan.duration === "YEARLY" ? "border-primary shadow-lg" : ""}`}
            data-testid={`pricing-plan-${plan.duration.toLowerCase()}`}
          >
            {plan.duration === "YEARLY" && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <div className="space-y-2">
                <CardTitle className="text-2xl">
                  {plan.duration === "MONTHLY" ? "Monthly" : "Yearly"}
                </CardTitle>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold"
                    data-testid={`price-${plan.duration.toLowerCase()}`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                {plan.savings && (
                  <Badge variant="secondary" className="text-xs">
                    {plan.savings}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                size="lg"
                variant={plan.duration === "YEARLY" ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.duration)}
                disabled={
                  actionLoading ||
                  (billing?.subscriptionDuration === plan.duration &&
                    billing?.subscriptionStatus === "ACTIVE")
                }
                data-testid={`subscribe-button-${plan.duration.toLowerCase()}`}
              >
                {billing?.subscriptionDuration === plan.duration &&
                billing?.subscriptionStatus === "ACTIVE" ? (
                  "Current Plan"
                ) : actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Questions about billing or plans</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Contact our support team at{" "}
            <a
              href="mailto:support@brillance.com"
              className="text-primary hover:underline"
            >
              support@brillance.com
            </a>{" "}
            for any billing-related questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
