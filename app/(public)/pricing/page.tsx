"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowLeft,
  Crown,
  ChevronDown,
  ChevronUp,
  Database,
  Sparkles,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import UserWidget from "@/components/user-widget";

export default function PricingPage() {
  const plans = [
    {
      duration: "yearly",
      name: "Yearly",
      price: "€999",
      monthlyEquivalent: "€83",
      period: "per year",
      description: "Best value for growing businesses",
      savings: "Save €189/year",
      popular: true,
      cta: "Best value for growing teams",
      coreFeatures: [
        "Unlimited configurators",
        "Unlimited quotes",
        "10 options included",
        "Priority email support",
        "Advanced analytics",
        "Custom branding",
      ],
      premiumFeatures: [
        "White-label option",
        "Dedicated account manager",
        "Custom integrations",
        "Early access to features",
        "99.9% uptime SLA",
        "API access",
      ],
    },
    {
      duration: "monthly",
      name: "Monthly",
      price: "€99",
      period: "per month",
      description: "Perfect for trying out Konfigra",
      popular: false,
      cta: "Perfect for quick trials and MVPs",
      coreFeatures: [
        "Unlimited configurators",
        "Unlimited quotes",
        "10 options included",
        "Email support",
        "Analytics dashboard",
        "Custom branding",
      ],
      premiumFeatures: ["API access", "Embed anywhere", "SSL security"],
    },
  ];

  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const handleSubscribe = async (duration: "monthly" | "yearly") => {
    if (!session) {
      signIn(undefined, { callbackUrl: `/dashboard/billing?plan=${duration}` });
      return;
    }

    // prevent duplicate checkout for active subscribers
    const currentStatus = session?.user?.subscriptionStatus;
    const currentDuration = session?.user?.subscriptionDuration;

    if (
      currentStatus === "ACTIVE" &&
      currentDuration?.toLowerCase() === duration
    ) {
      toast.info(`You already have an active ${duration} plan.`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/billing/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: duration === "monthly" ? "MONTHLY" : "YEARLY",
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (err: any) {
      toast.error(err?.message || "Failed to start checkout");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-20 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <UserWidget />
        </div>
      </nav>

      {/* HEADER */}
      <section className="container mx-auto px-4 py-20 max-w-6xl text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Sparkles className="h-4 w-4" />
          Simple, transparent pricing
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200">
          Choose Your Perfect Plan
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Unlock the full power of Konfigra. Every plan includes complete access
          to our core features and developer APIs.
        </p>
      </section>

      {/* PLANS */}
      <section className="container mx-auto px-4 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10">
        {plans.map((plan) => {
          const userHasThisPlan =
            (session?.user?.subscriptionStatus === "ACTIVE" &&
              session?.user?.subscriptionDuration?.toLowerCase() ===
                plan.duration) ||
            session?.user?.subscriptionDuration === "YEARLY";

          return (
            <Card
              key={plan.duration}
              className={`relative transition-all rounded-3xl backdrop-blur-lg ${
                plan.popular
                  ? "border-2 border-blue-600 shadow-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 scale-[1.03]"
                  : "border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-blue-400/70"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-2 px-5 rounded-full flex items-center gap-2 shadow-md">
                  <Crown className="h-4 w-4" /> Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pt-10">
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="mt-2 text-base text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span
                    className={`text-5xl font-extrabold ${
                      plan.popular
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {plan.period}
                  </span>
                  {plan.monthlyEquivalent && (
                    <p className="mt-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Only {plan.monthlyEquivalent}/month — billed annually
                    </p>
                  )}
                </div>
                {plan.savings && (
                  <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm mt-2">
                    <Check className="h-4 w-4" />
                    {plan.savings}
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex flex-col justify-between h-full px-6 pb-8 space-y-6">
                <Separator />
                <div>
                  <h4 className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-3">
                    Core Features
                  </h4>
                  <ul className="space-y-2">
                    {plan.coreFeatures.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.premiumFeatures.length > 0 && (
                  <div>
                    <button
                      onClick={() =>
                        setExpandedPlan(
                          expandedPlan === plan.duration ? null : plan.duration
                        )
                      }
                      className="flex items-center gap-2 text-xs font-semibold uppercase text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-4"
                    >
                      Premium Extras
                      {expandedPlan === plan.duration ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {expandedPlan === plan.duration && (
                      <ul className="space-y-2 mt-2">
                        {plan.premiumFeatures.map((f, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div className="pt-6">
                  <Button
                    onClick={() =>
                      handleSubscribe(plan.duration as "monthly" | "yearly")
                    }
                    disabled={loading || userHasThisPlan}
                    className={`w-full py-6 font-semibold text-base transition-all ${
                      userHasThisPlan
                        ? "opacity-70 cursor-not-allowed"
                        : plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                          : "border-2 hover:border-blue-400"
                    }`}
                    variant={
                      plan.popular && !userHasThisPlan ? "default" : "outline"
                    }
                  >
                    {userHasThisPlan
                      ? "Already Subscribed"
                      : loading
                        ? "Processing..."
                        : "Get Started"}
                  </Button>
                  <p className="text-xs text-center mt-3 text-muted-foreground italic">
                    {plan.cta}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* EXTRAS */}
      <section className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <Card className="bg-gradient-to-br from-slate-900 to-blue-900 text-white border-0 shadow-xl">
          <CardContent className="p-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Database className="h-12 w-12 text-blue-200" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-2">Need More Options?</h3>
              <p className="text-blue-100">
                All plans include{" "}
                <span className="font-semibold">10 options</span> for your
                configurators. Add extra capacity anytime for only €10 per 10
                options — directly from your billing dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40 py-8 px-4 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 KONFIGRA. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
