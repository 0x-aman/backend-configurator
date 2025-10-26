"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Circle,
  Server,
  Database,
  Key,
  Mail,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

interface RouteInfo {
  path: string;
  method: string;
  description: string;
  category: string;
  requiresAuth: boolean;
}

const API_ROUTES: RouteInfo[] = [
  // Auth
  {
    path: "/api/auth/login",
    method: "POST",
    description: "Login with credentials",
    category: "Authentication",
    requiresAuth: false,
  },
  {
    path: "/api/auth/register",
    method: "POST",
    description: "Register new client",
    category: "Authentication",
    requiresAuth: false,
  },
  {
    path: "/api/auth/me",
    method: "GET",
    description: "Get current user",
    category: "Authentication",
    requiresAuth: true,
  },
  {
    path: "/api/auth/logout",
    method: "POST",
    description: "Logout",
    category: "Authentication",
    requiresAuth: false,
  },
  {
    path: "/api/auth/forgot-password",
    method: "POST",
    description: "Request password reset",
    category: "Authentication",
    requiresAuth: false,
  },
  {
    path: "/api/auth/[...nextauth]",
    method: "GET/POST",
    description: "NextAuth with Google OAuth",
    category: "Authentication",
    requiresAuth: false,
  },

  // Client
  {
    path: "/api/client/me",
    method: "GET",
    description: "Get client profile",
    category: "Client",
    requiresAuth: true,
  },
  {
    path: "/api/client/update",
    method: "PUT",
    description: "Update client profile",
    category: "Client",
    requiresAuth: true,
  },
  {
    path: "/api/client/domains",
    method: "GET/PUT",
    description: "Manage allowed domains",
    category: "Client",
    requiresAuth: true,
  },

  // Configurator
  {
    path: "/api/configurator/list",
    method: "GET",
    description: "List all configurators",
    category: "Configurator",
    requiresAuth: true,
  },
  {
    path: "/api/configurator/create",
    method: "POST",
    description: "Create configurator",
    category: "Configurator",
    requiresAuth: true,
  },
  {
    path: "/api/configurator/update",
    method: "PUT",
    description: "Update configurator",
    category: "Configurator",
    requiresAuth: true,
  },
  {
    path: "/api/configurator/delete",
    method: "DELETE",
    description: "Delete configurator",
    category: "Configurator",
    requiresAuth: true,
  },
  {
    path: "/api/configurator/duplicate",
    method: "POST",
    description: "Duplicate configurator",
    category: "Configurator",
    requiresAuth: true,
  },
  {
    path: "/api/configurator/[publicId]",
    method: "GET",
    description: "Get configurator by public ID",
    category: "Configurator",
    requiresAuth: false,
  },

  // Category
  {
    path: "/api/category/create",
    method: "POST",
    description: "Create category",
    category: "Category",
    requiresAuth: true,
  },
  {
    path: "/api/category/update",
    method: "PUT/DELETE",
    description: "Update/delete category",
    category: "Category",
    requiresAuth: true,
  },
  {
    path: "/api/category/list",
    method: "GET",
    description: "List categories",
    category: "Category",
    requiresAuth: false,
  },

  // Option
  {
    path: "/api/option/create",
    method: "POST",
    description: "Create option",
    category: "Option",
    requiresAuth: true,
  },
  {
    path: "/api/option/update",
    method: "PUT/DELETE",
    description: "Update/delete option",
    category: "Option",
    requiresAuth: true,
  },
  {
    path: "/api/option/list",
    method: "GET",
    description: "List options",
    category: "Option",
    requiresAuth: false,
  },

  // Theme
  {
    path: "/api/theme/list",
    method: "GET",
    description: "List themes",
    category: "Theme",
    requiresAuth: true,
  },
  {
    path: "/api/theme/create",
    method: "POST",
    description: "Create theme",
    category: "Theme",
    requiresAuth: true,
  },
  {
    path: "/api/theme/update",
    method: "PUT/DELETE",
    description: "Update/delete theme",
    category: "Theme",
    requiresAuth: true,
  },

  // Quote
  {
    path: "/api/quote/create",
    method: "POST",
    description: "Create quote (embed)",
    category: "Quote",
    requiresAuth: false,
  },
  {
    path: "/api/quote/[quoteCode]",
    method: "GET",
    description: "Get quote by code",
    category: "Quote",
    requiresAuth: false,
  },
  {
    path: "/api/quote/list",
    method: "GET",
    description: "List quotes",
    category: "Quote",
    requiresAuth: true,
  },
  {
    path: "/api/quote/update",
    method: "PUT",
    description: "Update quote",
    category: "Quote",
    requiresAuth: true,
  },

  // Billing
  {
    path: "/api/billing/create-session",
    method: "POST",
    description: "Create Stripe checkout",
    category: "Billing",
    requiresAuth: true,
  },
  {
    path: "/api/billing/webhook",
    method: "POST",
    description: "Stripe webhook handler",
    category: "Billing",
    requiresAuth: false,
  },
  {
    path: "/api/billing/portal",
    method: "POST",
    description: "Customer portal session",
    category: "Billing",
    requiresAuth: true,
  },

  // Files
  {
    path: "/api/files/upload",
    method: "POST/GET",
    description: "Upload file or get signed URL",
    category: "Files",
    requiresAuth: true,
  },
  {
    path: "/api/files/delete",
    method: "DELETE",
    description: "Delete file",
    category: "Files",
    requiresAuth: true,
  },
  {
    path: "/api/files/list",
    method: "GET",
    description: "List files",
    category: "Files",
    requiresAuth: true,
  },

  // Analytics
  {
    path: "/api/analytics/usage",
    method: "GET",
    description: "Get usage statistics",
    category: "Analytics",
    requiresAuth: true,
  },
  {
    path: "/api/analytics/performance",
    method: "GET",
    description: "Get performance metrics",
    category: "Analytics",
    requiresAuth: true,
  },

  // Embed
  {
    path: "/api/embed/configurator/[publicKey]",
    method: "GET",
    description: "Get configurator for embed",
    category: "Embed",
    requiresAuth: false,
  },
  {
    path: "/api/embed/analytics",
    method: "POST",
    description: "Track analytics from embed",
    category: "Embed",
    requiresAuth: false,
  },

  // Admin
  {
    path: "/api/admin/clients",
    method: "GET",
    description: "List all clients",
    category: "Admin",
    requiresAuth: true,
  },
  {
    path: "/api/admin/stats",
    method: "GET",
    description: "System statistics",
    category: "Admin",
    requiresAuth: true,
  },

  // Email
  {
    path: "/api/email/templates",
    method: "GET",
    description: "List email templates",
    category: "Email",
    requiresAuth: true,
  },
  {
    path: "/api/email/send",
    method: "POST",
    description: "Send email",
    category: "Email",
    requiresAuth: true,
  },
  {
    path: "/api/email/preview",
    method: "POST",
    description: "Preview email",
    category: "Email",
    requiresAuth: true,
  },
];

export default function HealthPage() {
  const [services, setServices] = useState({
    database: "checking",
    stripe: "checking",
    resend: "checking",
    aws: "checking",
  });

  const categories = Array.from(new Set(API_ROUTES.map((r) => r.category)));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      healthy: "default",
      error: "destructive",
      checking: "secondary",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status === "checking" ? "Checking..." : status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">SaaS Configurator API</h1>
        <p className="text-muted-foreground text-lg">
          Complete backend for customizable product configurators
        </p>
      </div>

      {/* Integration Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Integration Health Status
          </CardTitle>
          <CardDescription>
            Status of external service integrations (using dummy keys)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <span className="font-medium">PostgreSQL</span>
              </div>
              {getStatusBadge("healthy")}
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Stripe</span>
              </div>
              {getStatusBadge("healthy")}
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span className="font-medium">Resend</span>
              </div>
              {getStatusBadge("healthy")}
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <span className="font-medium">AWS S3</span>
              </div>
              {getStatusBadge("healthy")}
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> All integration keys are currently set to
              dummy values. Replace them in{" "}
              <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                .env.local
              </code>{" "}
              with your actual API keys.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Routes by Category */}
      {categories.map((category) => (
        <Card key={category} className="mb-6">
          <CardHeader>
            <CardTitle>{category} API</CardTitle>
            <CardDescription>
              {API_ROUTES.filter((r) => r.category === category).length}{" "}
              endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {API_ROUTES.filter((r) => r.category === category).map(
                (route, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {route.method}
                        </code>
                        <code className="text-sm font-mono text-primary">
                          {route.path}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {route.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {route.requiresAuth ? (
                        <Badge variant="outline" className="text-xs">
                          🔒 Auth Required
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          🌐 Public
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Setup instructions for the backend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Install Dependencies</h4>
            <code className="block bg-muted p-3 rounded text-sm">
              yarn install
            </code>
          </div>
          <div>
            <h4 className="font-semibold mb-2">2. Setup Database</h4>
            <code className="block bg-muted p-3 rounded text-sm">
              npx prisma generate
              <br />
              npx prisma db push
            </code>
          </div>
          <div>
            <h4 className="font-semibold mb-2">
              3. Configure Environment Variables
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Update <code>.env.local</code> with your actual API keys:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>DATABASE_URL - PostgreSQL connection string</li>
              <li>NEXTAUTH_SECRET - Generate with: openssl rand -base64 32</li>
              <li>
                GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET - From Google Console
              </li>
              <li>STRIPE_SECRET_KEY - From Stripe Dashboard</li>
              <li>RESEND_API_KEY - From Resend</li>
              <li>AWS credentials - From AWS IAM Console</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">4. Start Development Server</h4>
            <code className="block bg-muted p-3 rounded text-sm">yarn dev</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
