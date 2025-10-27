import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ApiReferencePage() {
  const endpoints = [
    {
      category: "Authentication",
      routes: [
        { method: "POST", path: "/api/auth/register", description: "Register a new account" },
        { method: "POST", path: "/api/auth/login", description: "Login with credentials" },
        { method: "GET", path: "/api/auth/me", description: "Get current user", auth: true },
        { method: "POST", path: "/api/auth/logout", description: "Logout user" },
      ],
    },
    {
      category: "Configurators",
      routes: [
        { method: "GET", path: "/api/configurator/list", description: "List all configurators", auth: true },
        { method: "POST", path: "/api/configurator/create", description: "Create new configurator", auth: true },
        { method: "PUT", path: "/api/configurator/update", description: "Update configurator", auth: true },
        { method: "DELETE", path: "/api/configurator/delete", description: "Delete configurator", auth: true },
        { method: "GET", path: "/api/configurator/[publicId]", description: "Get configurator by public ID" },
      ],
    },
    {
      category: "Quotes",
      routes: [
        { method: "GET", path: "/api/quote/list", description: "List all quotes", auth: true },
        { method: "POST", path: "/api/quote/create", description: "Create new quote" },
        { method: "GET", path: "/api/quote/[quoteCode]", description: "Get quote by code" },
        { method: "PUT", path: "/api/quote/update", description: "Update quote", auth: true },
      ],
    },
    {
      category: "Client",
      routes: [
        { method: "GET", path: "/api/client/me", description: "Get client profile", auth: true },
        { method: "PUT", path: "/api/client/update", description: "Update client profile", auth: true },
        { method: "GET/PUT", path: "/api/client/domains", description: "Manage allowed domains", auth: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">API Reference</h1>
          <p className="text-xl text-muted-foreground">
            Complete API documentation for integrating KONFIGRA into your applications.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>All API requests require authentication using your API key. Include your API key in the request header:</p>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto font-mono text-sm">
                <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
              </pre>
              <p className="mt-4">You can find your API key in the dashboard under "Embed Script".</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Base URL</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto font-mono text-sm">
                <code>https://your-domain.com</code>
              </pre>
            </CardContent>
          </Card>
        </div>

        {endpoints.map((category, idx) => (
          <div key={idx} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
            <div className="space-y-4">
              {category.routes.map((route, routeIdx) => (
                <Card key={routeIdx} className="glass">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {route.method}
                        </Badge>
                        <code className="text-sm font-mono text-primary">{route.path}</code>
                      </div>
                      {route.auth && (
                        <Badge variant="secondary" className="text-xs">
                          🔒 Auth Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{route.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <Card className="glass">
          <CardHeader>
            <CardTitle>Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>API requests are rate limited based on your subscription plan:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Basic:</strong> 1,000 requests per hour</li>
              <li><strong>Pro:</strong> 10,000 requests per hour</li>
              <li><strong>Enterprise:</strong> Custom limits</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass mt-8">
          <CardHeader>
            <CardTitle>Error Handling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>The API uses standard HTTP status codes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>200:</strong> Success</li>
              <li><strong>400:</strong> Bad Request</li>
              <li><strong>401:</strong> Unauthorized</li>
              <li><strong>404:</strong> Not Found</li>
              <li><strong>429:</strong> Rate Limit Exceeded</li>
              <li><strong>500:</strong> Internal Server Error</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <footer className="border-t border-border/40 py-8 px-4 mt-16">
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
