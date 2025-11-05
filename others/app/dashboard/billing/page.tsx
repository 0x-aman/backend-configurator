"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
  TrendingUp,
  X,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BillingInfo, Transaction } from "@/src/types/billing";
import type { ApiResponse } from "@/src/types/api";
import type { ClientProfile } from "@/src/types/auth";

export default function BillingPage() {
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const fetchBilling = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ Use consistent endpoint with proper typing
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result: ApiResponse<ClientProfile> = await response.json();
      
      if (result.success && result.data) {
        setBilling({
          subscriptionStatus: result.data.subscriptionStatus || "INACTIVE",
          subscriptionDuration: result.data.subscriptionDuration || null,
          subscriptionEndsAt: result.data.subscriptionEndsAt || null,
          stripeCustomerId: result.data.stripeCustomerId || null,
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch billing:", error);
      toast.error("Failed to load billing information", {
        description: error.message || "Please try refreshing the page",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoadingTransactions(true);
      const response = await fetch("/api/billing/transactions", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please sign in again.");
        }
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result: ApiResponse<Transaction[]> = await response.json();
      setTransactions(result.data || []);
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transaction history", {
        description: error.message || "Please try again later",
      });
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  // Check for payment success/cancel on mount
  // Use the serialized search params string as the dependency so the effect
  // doesn't re-run on every render (useSearchParams can return a new object
  // each render). This prevents an infinite refresh loop.
  const searchString = searchParams.toString();

  const processedSessionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const success = params.get("success");
    const canceled = params.get("canceled");
    const sessionId = params.get("session_id");

    let timer: ReturnType<typeof setTimeout> | null = null;

    const refreshAll = async () => {
      await fetchBilling();
      await fetchTransactions();
      await updateSession(); // Refresh NextAuth session
    };

    const handleSuccess = async () => {
      try {
        // Avoid processing the same session_id multiple times
        if (sessionId) {
          if (processedSessionsRef.current.has(sessionId)) {
            console.info("Session already processed:", sessionId);
            return;
          }

          const res = await fetch(
            `/api/billing/verify-session?session_id=${encodeURIComponent(sessionId)}`
          );
          if (!res.ok) console.warn("verify-session failed", await res.text());
          // small delay to allow DB writes to settle
          await new Promise((r) => setTimeout(r, 500));
          processedSessionsRef.current.add(sessionId);
        }

        toast.success("Payment successful! Your subscription is now active.", {
          duration: 5000,
          icon: <CheckCircle className="h-5 w-5" />,
        });

        // Clean URL to remove success/session_id params so effect won't re-run
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("success");
          url.searchParams.delete("session_id");
          url.searchParams.delete("canceled");
          window.history.replaceState({}, "", url.pathname + url.search);
        } catch (e) {
          // ignore
        }

        // Refresh data after successful payment (give webhook a little time)
        timer = setTimeout(refreshAll, 1500);
      } catch (err: any) {
        console.error("Post-checkout verification failed:", err);
        toast.success("Payment successful! Refreshing account info...", {
          icon: <CheckCircle className="h-5 w-5" />,
        });
        // try to refresh once
        await refreshAll();
      }
    };

    if (success === "true") {
      void handleSuccess();
    } else if (canceled === "true") {
      toast.error("Payment was canceled. Please try again.", {
        duration: 5000,
        icon: <XCircle className="h-5 w-5" />,
      });
    }

    // Only fetch on initial mount if no success/cancel params
    if (!success && !canceled) {
      void fetchBilling();
      void fetchTransactions();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchString, updateSession, fetchBilling, fetchTransactions]);

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

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const json = await response.json();
      const data = json.data || json;

      if (data.url) {
        toast.loading("Redirecting to checkout...", { duration: 2000 });
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);
      toast.error("Failed to start checkout", {
        description: error.message || "Please try again or contact support",
      });
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

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const json = await response.json();
      const data = json.data || json;

      if (data.url) {
        toast.loading("Opening billing portal...", { duration: 2000 });
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error: any) {
      console.error("Failed to open billing portal:", error);
      toast.error("Failed to open billing portal", {
        description: error.message || "Please try again or contact support",
      });
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const response = await fetch("/api/billing/cancel-subscription", {
        method: "POST",
      });

      const json = await response.json();

      if (response.ok && json.success) {
        toast.success("Subscription canceled successfully", {
          description:
            "You'll have access until the end of your billing period.",
          duration: 5000,
        });
        setShowCancelDialog(false);
        // Refresh billing info and session
        fetchBilling();
        updateSession();
      } else {
        throw new Error(json.message || "Failed to cancel subscription");
      }
    } catch (error: any) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription", {
        description: error.message || "Please try again or contact support",
      });
    } finally {
      setCanceling(false);
    }
  };

  const isActive = billing?.subscriptionStatus === "ACTIVE";
  const isCanceled = billing?.subscriptionStatus === "CANCELED";
  const hasSubscription = isActive || isCanceled;
  const currentPlan = billing?.subscriptionDuration;

  const getPageHeading = () => {
    if (!hasSubscription) return "Choose Your Plan";
    if (currentPlan === "MONTHLY") return "Upgrade Your Plan";
    return "Change Your Plan";
  };

  const pricingPlans = [
    {
      duration: "MONTHLY" as const,
      price: "€99",
      priceNumber: 99,
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
      priceNumber: 999,
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

  // Helper component to show a simple pro-rated upgrade estimate
  function UpgradeCostSummary({
    subscriptionEndsAt,
    monthlyPrice,
    yearlyPrice,
  }: {
    subscriptionEndsAt?: string | null;
    monthlyPrice: number;
    yearlyPrice: number;
  }) {
    if (!subscriptionEndsAt) {
      return (
        <p className="text-sm">
          Pay <strong>€{yearlyPrice.toFixed(2)}</strong> to switch now.
        </p>
      );
    }

    const now = new Date();
    const ends = new Date(subscriptionEndsAt);
    const diffDays = Math.max(
      0,
      Math.ceil((ends.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    const monthsRemaining = diffDays / 30; // approximate
    const credit = monthlyPrice * monthsRemaining;
    const upgradeCost = Math.max(0, yearlyPrice - credit);

    return (
      <div className="rounded-md p-3 bg-muted">
        <div className="text-sm">
          Estimated due now: <strong>€{upgradeCost.toFixed(2)}</strong>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          This includes a pro-rated credit of{" "}
          <strong>€{credit.toFixed(2)}</strong> for the remaining{" "}
          {Math.max(1, Math.ceil(monthsRemaining))} month(s) on your current
          plan.
        </div>
      </div>
    );
  }

  console.log(billing, "billing");
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
                  variant={isActive ? "default" : "secondary"}
                  className="text-base px-3 py-1"
                  data-testid="subscription-status"
                >
                  {isActive && currentPlan
                    ? currentPlan === "MONTHLY"
                      ? "Active Monthly Plan"
                      : "Active Yearly Plan"
                    : "Inactive"}
                </Badge>
              </div>

              {billing?.subscriptionEndsAt && (
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="subscription-ends"
                >
                  {isCanceled
                    ? `Access until ${new Date(billing.subscriptionEndsAt).toLocaleDateString()}`
                    : `Renews on ${new Date(billing.subscriptionEndsAt).toLocaleDateString()}`}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                {billing?.stripeCustomerId && isActive && (
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

                {isActive && !isCanceled && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(true)}
                    data-testid="unsubscribe-button"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>

              {!hasSubscription && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You don't have an active subscription. Choose a plan below
                    to get started.
                  </AlertDescription>
                </Alert>
              )}

              {isCanceled && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription is canceled. You'll have access until{" "}
                    {billing?.subscriptionEndsAt
                      ? new Date(
                          billing.subscriptionEndsAt
                        ).toLocaleDateString()
                      : "the end of your billing period"}
                    .
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{getPageHeading()}</h2>
        <p className="text-muted-foreground">
          {hasSubscription
            ? currentPlan === "MONTHLY"
              ? "You're on a monthly plan — upgrade to yearly to save money"
              : "You're on a yearly plan. Manage or change your subscription below."
            : "Select the billing cycle that works best for you"}
        </p>
      </div>

      {hasSubscription ? (
        // If subscribed, show a single action card (upgrade or manage)
        currentPlan === "MONTHLY" && isActive ? (
          // Monthly -> show upgrade to yearly with pro-rated estimate
          <Card className="mb-8 border-primary shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Upgrade to Yearly
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Save {pricingPlans[1].savings} and switch to annual billing.
                  </CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  Best Value
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {pricingPlans[1].price}
                </span>
                <span className="text-muted-foreground">
                  {pricingPlans[1].period}
                </span>
                <span className="ml-4 text-sm text-green-600 font-medium">
                  {pricingPlans[1].savings}
                </span>
              </div>
              <Separator />
              <ul className="space-y-2">
                {pricingPlans[1].features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Calculate a simple pro-rated upgrade amount based on time left */}
              <UpgradeCostSummary
                subscriptionEndsAt={billing?.subscriptionEndsAt}
                monthlyPrice={pricingPlans[0].priceNumber}
                yearlyPrice={pricingPlans[1].priceNumber}
              />

              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSubscribe("YEARLY")}
                disabled={actionLoading}
                data-testid="upgrade-to-yearly-button"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Upgrade to Yearly"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Yearly subscribers or other subscribed states: show current plan summary + manage button
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Your active subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">
                    {currentPlan === "YEARLY" ? "Yearly Plan" : "Monthly Plan"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {billing?.subscriptionEndsAt
                      ? `Renews on ${new Date(billing.subscriptionEndsAt).toLocaleDateString()}`
                      : "Managed via Stripe"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleManageBilling}
                    disabled={actionLoading}
                  >
                    Manage Billing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        // Not subscribed: show both plans for selection
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.duration}
              className={`relative ${
                plan.duration === "YEARLY" ? "border-primary shadow-lg" : ""
              }`}
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
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
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
                    actionLoading || (currentPlan === plan.duration && isActive)
                  }
                  data-testid={`subscribe-button-${plan.duration.toLowerCase()}`}
                >
                  {currentPlan === plan.duration && isActive ? (
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
      )}

      {/* Transaction History */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Your billing and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.planType}</Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.currency} {transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === "Paid"
                              ? "default"
                              : transaction.status === "Pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.invoicePdf && (
                          <a
                            href={transaction.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:underline"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Questions about billing or plans</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Contact our support team at{" "}
            <a
              href="mailto:support@Konfigra.com"
              className="text-primary hover:underline"
            >
              support@Konfigra.com
            </a>{" "}
            for any billing-related questions.
          </p>
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent data-testid="cancel-subscription-dialog">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will remain active until{" "}
                {billing?.subscriptionEndsAt
                  ? new Date(billing.subscriptionEndsAt).toLocaleDateString()
                  : "the end of your billing period"}
                , and you will not be charged again. No refunds will be issued
                for the current billing period.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={canceling}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={canceling}
              data-testid="confirm-cancel-button"
            >
              {canceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
