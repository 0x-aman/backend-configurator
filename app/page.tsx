"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Code2,
  Palette,
  Zap,
  Shield,
  BarChart3,
  Sparkles,
  Check,
} from "lucide-react";
import Image from "next/image";
import UserWidget from "@/components/user-widget";

export default function LandingPageClient() {
  const { data: session } = useSession();

  const features = [
    {
      icon: Code2,
      title: "AI-powered code reviews",
      description: "Get real-time, smart suggestions for cleaner code.",
    },
    {
      icon: Zap,
      title: "Real-time coding previews",
      description: "Chat, collaborate, and instantly preview changes together.",
    },
    {
      icon: Palette,
      title: "One-click integrations",
      description: "Easily connect your workflow with popular dev tools.",
    },
    {
      icon: Shield,
      title: "Flexible MCP connectivity",
      description: "Effortlessly manage and configure MCP server access.",
    },
    {
      icon: BarChart3,
      title: "Launch parallel coding agents",
      description: "Solve complex problems faster with multiple AI agents.",
    },
    {
      icon: Sparkles,
      title: "Deployment made easy",
      description: "Go from code to live deployment on Vercel instantly.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Image src={"/logo.png"} alt="logo" height={64} width={256} />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              >
                Pricing
              </Link>
              <UserWidget />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-background dark:from-primary/10 dark:via-background dark:to-background" />
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-linear-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Build Custom Products -
            <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Smarter, Faster
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Empower your customers to design and personalize products in real
            time. Our intelligent product configurator SaaS makes customization
            seamless, visual, and ready to scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="text-lg px-8"
                data-testid="hero-cta-button"
              >
                Signup for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Code Editor Preview */}
          <div className="mt-16 relative">
            <div className="glass rounded-xl overflow-hidden border-2 border-primary/20 shadow-2xl">
              <div className="bg-card/50 backdrop-blur-sm p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    github.js
                  </span>
                </div>
              </div>
              <div className="bg-card/30 backdrop-blur-sm p-6 text-left font-mono text-sm">
                <pre className="text-muted-foreground">
                  <code>
                    {`// Configure your product options
const configurator = {
  categories: ['Color', 'Size', 'Material'],
  pricing: 'dynamic',
  theme: {
    primary: '#0ea5e9',
    borderRadius: '0.75rem'
  }
};`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Empower Your Workflow with AI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ask your AI Agent for real-time collaboration, seamless
              integrations, and actionable insights to streamline your
              operations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="glass p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-background dark:from-primary/10 dark:via-background dark:to-background" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Coding made effortless
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Hear how developers ship products faster, collaborate seamlessly,
            and build with confidence using KONFIGRA's powerful AI tools
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8" data-testid="cta-button">
              Signup for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="logo-text text-lg mb-4">KONFIGRA</h3>
              <p className="text-sm text-muted-foreground">
                Coding made effortless
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="/docs/api"
                    className="hover:text-foreground transition-colors"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="/docs/embedding"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of use
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/docs/customization"
                    className="hover:text-foreground transition-colors"
                  >
                    Customization
                  </a>
                </li>
                <li>
                  <a
                    href="/docs/embedding"
                    className="hover:text-foreground transition-colors"
                  >
                    Embedding Guide
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-12 pt-8 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 KONFIGRA. All rights reserved.
            </p>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
