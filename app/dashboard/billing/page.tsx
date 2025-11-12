"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
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
  X,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Gauge,
  Clock,
  AlertTriangle,
  Plus,
  Zap,
  ArrowRight,
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

type Usage = {
  included: number;
  used: number;
  remaining: number;
  limitReached: boolean;
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

import { DashboardLoading } from "@/components/dashboard-loading";

export default function BillingPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const searchParams = useSearchParams();

  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [configurators, setConfigurators] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const handledSuccessRef = useRef(false);
  const processedSessionsRef = useRef<Set<string>>(new Set());

  const fetchBilling = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
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
        if (response.status === 401) throw new Error("Please sign in again.");
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

  const fetchUsage = useCallback(async () => {
    try {
      setLoadingUsage(true);
      const [usageRes, configsRes] = await Promise.all([
        fetch("/api/billing/usage", { cache: "no-store" }),
        fetch("/api/configurator/list", { cache: "no-store" }),
      ]);
      if (!usageRes.ok)
        throw new Error(`Usage fetch failed: ${usageRes.status}`);
      const data: Usage = await usageRes.json();
      setUsage(data);

      if (configsRes.ok) {
        const json: ApiResponse = await configsRes.json();
        setConfigurators(json?.data || []);
      }
    } catch (e: any) {
      console.warn("Usage not available:", e?.message || e);
      setUsage(null);
    } finally {
      setLoadingUsage(false);
    }
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
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const json = await response.json();
      const data = json.data || json;
      if (!data.url) throw new Error("No checkout URL received");
      toast.loading("Redirecting to checkout...", { duration: 1200 });
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);
      toast.error("Failed to start checkout", {
        description: error.message || "Please try again.",
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
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const json = await response.json();
      const data = json.data || json;
      if (!data.url) throw new Error("No portal URL received");
      toast.loading("Opening billing portal...", { duration: 1200 });
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Failed to open billing portal:", error);
      toast.error("Failed to open billing portal", {
        description: error.message || "Please try again.",
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
        toast.success(
          "Subscription canceled. Access continues until period end.",
          {
            duration: 5000,
          }
        );
        setShowCancelDialog(false);
        await Promise.all([fetchBilling(), updateSession()]);
      } else {
        throw new Error(json.message || "Failed to cancel subscription");
      }
    } catch (error: any) {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription", {
        description: error.message || "Please try again.",
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleAddOptionsBlock = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/billing/create-usage-upgrade-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      const data = json.data || json;
      if (!data.url) throw new Error("No checkout URL received");
      toast.loading("Redirecting to checkout...", { duration: 1200 });
      window.location.href = data.url;
    } catch (e: any) {
      console.error("Add options failed:", e);
      toast.error("Failed to start upgrade", {
        description: e.message || "Please try again.",
      });
      setActionLoading(false);
    }
  };

  // Handle checkout return without re-running multiple times.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const success = params.get("success");
    const canceled = params.get("canceled");
    const sessionId = params.get("session_id");

    const clearUrl = () => {
      router.replace("/dashboard/billing");
    };

    const refreshAll = async () => {
      await Promise.all([fetchBilling(), fetchTransactions(), fetchUsage()]);
      await updateSession();
    };

    const handleSuccess = async () => {
      if (handledSuccessRef.current) return;
      handledSuccessRef.current = true;

      try {
        if (sessionId && !processedSessionsRef.current.has(sessionId)) {
          const res = await fetch(
            `/api/billing/verify-session?session_id=${encodeURIComponent(sessionId)}`
          );
          if (!res.ok) console.warn("verify-session failed", await res.text());
          processedSessionsRef.current.add(sessionId);
        }

        clearUrl();
        await refreshAll();

        toast.success("Payment successful. Your subscription is updated.", {
          duration: 4500,
          icon: <CheckCircle className="h-5 w-5" />,
        });
      } catch (err) {
        console.error("Post-checkout verification failed:", err);
        clearUrl();
        await refreshAll();
      }
    };

    if (success === "true") {
      void handleSuccess();
      return;
    }

    if (canceled === "true") {
      toast.error("Payment was canceled.", {
        duration: 4000,
        icon: <XCircle className="h-5 w-5" />,
      });
      clearUrl();
      void (async () => {
        await Promise.all([fetchBilling(), fetchTransactions(), fetchUsage()]);
      })();
      return;
    }

    void (async () => {
      await Promise.all([fetchBilling(), fetchTransactions(), fetchUsage()]);
    })();
  }, [
    searchParams,
    router,
    updateSession,
    fetchBilling,
    fetchTransactions,
    fetchUsage,
  ]);

  function ConfiguratorUsageSummary({
    configurators,
  }: {
    configurators: any[];
  }) {
    if (!configurators.length)
      return (
        <p className="text-xs text-muted-foreground">No configurators found.</p>
      );

    return (
      <div className="border rounded-md p-3 bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Breakdown by configurator:
        </p>
        <ul className="space-y-1 text-sm">
          {configurators.map((cfg) => (
            <li key={cfg.id} className="flex justify-between">
              <span className="truncate">
                {cfg.name || "Untitled Configurator"}
              </span>
              <span className="text-muted-foreground">
                {cfg.optionCount ?? 0} options
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function PricingCardsSection() {
    return (
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground">
            Select the perfect plan to power your configurators
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.duration}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.duration === "YEARLY" ? "md:scale-105 md:shadow-lg" : ""
              }`}
            >
              {plan.duration === "YEARLY" && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-500 hover:bg-amber-600">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {plan.duration === "MONTHLY" ? "Monthly" : "Yearly"} Plan
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  {plan.savings && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      ✓ {plan.savings}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleSubscribe(plan.duration)}
                  disabled={actionLoading}
                  size="lg"
                  className="w-full"
                  variant={plan.duration === "YEARLY" ? "default" : "outline"}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">What's included:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function UpgradeSection() {
    return (
      <Card className="mb-8 bg-primary/20 border-primary/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Ready to Upgrade?
          </CardTitle>
          <CardDescription>
            Enhance your plan or add more capacity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;re currently on the{" "}
            <span className="font-semibold">
              {currentPlan === "YEARLY" ? "Yearly" : "Monthly"} Plan
            </span>
            . Upgrade your billing cycle, add more options, or explore premium
            features.
          </p>
          <div className="flex flex-wrap gap-2">
            {currentPlan === "MONTHLY" && isActive && (
              <Button
                onClick={() => handleSubscribe("YEARLY")}
                variant="default"
              >
                <Zap className="mr-2 h-4 w-4" />
                Switch to Yearly
              </Button>
            )}
            <Button onClick={handleAddOptionsBlock}>
              <Plus className="mr-2 h-4 w-4" />
              Add +10 Options
            </Button>
            {billing?.stripeCustomerId && isActive && (
              <Button onClick={handleManageBilling} variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage via Stripe
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isActive = billing?.subscriptionStatus === "ACTIVE";
  const isCanceled = billing?.subscriptionStatus === "CANCELED";
  const hasSubscription = isActive || isCanceled;
  const currentPlan = billing?.subscriptionDuration;

  if (loading || loadingTransactions || loadingUsage) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/80">
            Billing & Subscription
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your subscription plan and billing information
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
                      You don&apos;t have an active subscription. Choose a plan
                      below to get started.
                    </AlertDescription>
                  </Alert>
                )}

                {isCanceled && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your subscription is canceled. You&apos;ll have access
                      until{" "}
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

        {!hasSubscription && <PricingCardsSection />}

        {hasSubscription && <UpgradeSection />}

        {/* Plan Duration card */}
        {hasSubscription && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Plan Duration
              </CardTitle>
              <CardDescription>Switch billing cycle</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">
                  {currentPlan === "YEARLY" ? "Yearly plan" : "Monthly plan"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentPlan === "MONTHLY"
                    ? "Save with annual billing"
                    : "Managed via Stripe"}
                </div>
              </div>
              {currentPlan === "MONTHLY" && isActive && (
                <Button
                  onClick={() => handleSubscribe("YEARLY")}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Upgrade to Yearly
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        {hasSubscription && (
          <>
            {/* Option Capacity card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Option Capacity
                </CardTitle>
                <CardDescription>
                  Included 10 options under primary categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingUsage ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : usage ? (
                  <>
                    <div className="text-sm">
                      {usage.used} / {usage.included} used{" "}
                      {usage.limitReached ? (
                        <span className="text-red-600 ml-2">Limit reached</span>
                      ) : usage.remaining <= 2 ? (
                        <span className="text-amber-600 ml-2">
                          You&apos;re close to the limit
                        </span>
                      ) : null}
                    </div>

                    <ConfiguratorUsageSummary configurators={configurators} />
                    {usage.limitReached && (
                      <div className="flex flex-col gap-2">
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            You&apos;ve reached the included option limit.
                            Purchase additional capacity to continue adding
                            options.
                          </AlertDescription>
                        </Alert>
                        <Button
                          variant="default"
                          onClick={handleAddOptionsBlock}
                          disabled={actionLoading}
                          data-testid="upgrade-button"
                        >
                          {actionLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          Add +10 Options Block
                        </Button>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      variant={
                        usage.limitReached || usage.remaining <= 2
                          ? "default"
                          : "outline"
                      }
                      onClick={handleAddOptionsBlock}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Add +10 options for €10"
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This increases your capacity for options under primary
                      categories.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Usage information is unavailable.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
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
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          {new Date(t.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{t.planType}</Badge>
                        </TableCell>
                        <TableCell>
                          {t.currency} {t.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              t.status === "Paid"
                                ? "default"
                                : t.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {t.invoicePdf && (
                            <a
                              href={t.invoicePdf}
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

        {/* Help */}
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
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Cancel Subscription Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent data-testid="cancel-subscription-dialog">
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your subscription remains active until{" "}
                  {billing?.subscriptionEndsAt
                    ? new Date(billing.subscriptionEndsAt).toLocaleDateString()
                    : "the end of the billing period"}
                  .
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
    </div>
  );
}
