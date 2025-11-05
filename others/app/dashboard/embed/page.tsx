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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Copy, CheckCircle2, ExternalLink, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { ApiResponse } from "@/src/types/api";

// Client-side env variables (replaced at build time by Next.js)
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

interface ClientInfo {
  publicKey: string;
  apiKey: string;
  domain: string | null;
}

export default function EmbedPage() {
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Fetch client info using consistent endpoint
        const clientRes = await fetch("/api/auth/me");
        if (clientRes.ok) {
          const result: ApiResponse = await clientRes.json();
          if (result.success && result.data) {
            setClient({
              publicKey: result.data?.publicKey || "",
              apiKey: result.data?.apiKey || "",
              domain: result.data?.domain || null,
            });
          }
        }

        // Fetch configurators list
        const listRes = await fetch("/api/configurator/list");
        if (listRes.ok) {
          const listJson: ApiResponse = await listRes.json();
          const configs = listJson?.data || [];
          if (configs.length > 0) {
            setPublicId(configs[0].publicId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load configurator data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const embedScript = `<!-- Konfigra Configurator Embed -->
<div id="Konfigra-configurator"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")}/embed.js';
    script.setAttribute('data-public-key', '${client?.publicKey || "YOUR_PUBLIC_KEY"}');
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    toast.success("Embed script copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManageConfigurator = async () => {
    try {
      toast.dismiss();
      toast.loading("Opening editor...");

      if (!publicId) {
        toast.error("No configurator found");
        return;
      }

      // get edit token
      const tokenRes = await fetch("/api/configurator/generate-edit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configuratorId: publicId }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        toast.error(err?.message || "Failed to create edit token");
        return;
      }

      const tokenJson = await tokenRes.json();
      const token = tokenJson?.data?.token || tokenJson?.token;
      if (!token) {
        toast.error("No token returned");
        return;
      }

      const VITE_HOST_PROD = "https://exact-dupe-engine.vercel.app";
      const VITE_HOST_LOCAL = "http://localhost:8080";
      const host =
        window.location.hostname === "localhost"
          ? VITE_HOST_LOCAL
          : VITE_HOST_PROD;

      const url = `${host}/?admin=true&token=${encodeURIComponent(token)}`;
      window.open(url, "_blank");
      toast.success("Editor opened");
    } catch (err) {
      console.error(err);
      toast.error("Failed to open editor");
    } finally {
      toast.dismiss();
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid="embed-title"
        >
          Embed Script
        </h1>
        <p className="text-muted-foreground mt-2">
          Integrate your configurator into any website
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription>
              Copy and paste this script into your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Paste this code snippet where you want the configurator to
                appear on your website.
              </AlertDescription>
            </Alert>

            <div className="relative">
              <pre
                className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono"
                data-testid="embed-script"
              >
                <code>{embedScript}</code>
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
                data-testid="copy-embed-button"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Your unique identifiers for API access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Public Key</label>
              <div className="flex gap-2">
                <code
                  className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all"
                  data-testid="public-key"
                >
                  {loading
                    ? "Loading..."
                    : client?.publicKey || "Not available"}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(client?.publicKey || "");
                    toast.success("Public key copied!");
                  }}
                  disabled={!client?.publicKey}
                  data-testid="copy-public-key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this key for public embed scripts
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">API Key (Secret)</label>
              <div className="flex gap-2">
                <code
                  className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all"
                  data-testid="api-key"
                >
                  {loading ? "Loading..." : client?.apiKey || "Not available"}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (client?.apiKey) {
                      navigator.clipboard.writeText(client.apiKey);
                      toast.success("API key copied!");
                    }
                  }}
                  disabled={!client?.apiKey}
                  data-testid="copy-api-key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this secret! Use for backend API calls only
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurator Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurator Management
            </CardTitle>
            <CardDescription>
              Create and customize your product configurators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure your product options, categories, pricing, and themes
              using our configurator editor.
            </p>
            <div className="flex gap-4">
              <Button
                data-testid="manage-configurator-button"
                onClick={handleManageConfigurator}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Configurator
              </Button>

              <Button variant="outline" asChild disabled={!publicId}>
                <Link
                  href={
                    publicId ? `http://localhost:8080/?apiKey=${publicId}` : "#"
                  }
                  target="_blank"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Learn more about embedding and customization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors">
              <div className="flex-1">
                <h4 className="font-medium text-sm">Embedding Guide</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Step-by-step instructions for adding the configurator to your
                  site
                </p>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <a href="/docs/embedding" target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors">
              <div className="flex-1">
                <h4 className="font-medium text-sm">API Reference</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete API documentation for advanced integrations
                </p>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <a href="/docs/api" target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors">
              <div className="flex-1">
                <h4 className="font-medium text-sm">Customization Options</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Learn how to customize colors, fonts, and behavior
                </p>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <a href="/docs/customization" target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
