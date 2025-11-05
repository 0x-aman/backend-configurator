"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PricingPage() {
  const plans = [
    {
      duration: "monthly",
      name: "Monthly",
      price: "€99",
      period: "per month",
      description: "Perfect for trying out Konfigra",
      popular: false,
      features: [
        "Unlimited configurators",
        "Unlimited quotes",
        "Custom branding",
        "Email support",
        "Analytics dashboard",
        "API access",
        "Embed anywhere",
        "SSL security",
      ],
    },
    {
      duration: "yearly",
      name: "Yearly",
      price: "€999",
      period: "per year",
      description: "Best value for growing businesses",
      savings: "Save €189/year",
      popular: true,
      features: [
        "Everything in Monthly",
        "Priority email support",
        "Advanced analytics",
        "White-label option",
        "Dedicated account manager",
        "Custom integrations",
        "Early access to features",
        "99.9% uptime SLA",
      ],
    },
  ];

  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (duration: "monthly" | "yearly") => {
    if (!session) {
      // send user to sign in and preserve intent
      signIn(undefined, { callbackUrl: `/dashboard/billing?plan=${duration}` });
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
      const json = await res.json();
      const data = json.data || json;
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout url returned from server");
      }
    } catch (err: any) {
      console.error("Create session failed", err);
      toast.error(err?.message || "Failed to start checkout");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" data-testid="nav-signup-button">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            data-testid="pricing-title"
          >
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you. All plans include full
            access to core features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.duration}
              className={`relative glass ${plan.popular ? "border-primary shadow-xl" : ""} flex flex-col h-full`}
              data-testid={`pricing-card-${plan.duration}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-sm">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pt-6 pb-4">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span
                    className="text-4xl md:text-5xl font-extrabold"
                    data-testid={`price-${plan.duration}`}
                  >
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground ml-2">
                      {plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 mt-auto">
                <Separator />
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div>
                  {plan.price === "Custom" ? (
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      asChild
                    >
                      <a href="mailto:sales@konfigra.com">Contact Sales</a>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() =>
                        handleSubscribe(plan.duration as "monthly" | "yearly")
                      }
                      data-testid={`select-plan-${plan.duration}`}
                    >
                      {loading
                        ? "Processing..."
                        : `Get Started with ${plan.name}`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I switch plans later?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. When
                  upgrading, you'll be charged a prorated amount. When
                  downgrading, your new rate will apply at the next billing
                  cycle.
                </p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">
                  What payment methods do you accept?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, Mastercard, American
                  Express) via Stripe's secure payment processing.
                </p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. You can cancel your subscription at any time from
                  your billing dashboard. Your account will remain active until
                  the end of your current billing period.
                </p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer a 30-day money-back guarantee. If you're not
                  satisfied with KONFIGRA, contact us within 30 days of your
                  purchase for a full refund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-4">Need a custom plan?</h3>
          <p className="text-muted-foreground mb-6">
            Contact our sales team for enterprise pricing and custom features
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href="mailto:sales@konfigra.com">Contact Sales</a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="container mx-auto max-w-6xl flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 KONFIGRA. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
