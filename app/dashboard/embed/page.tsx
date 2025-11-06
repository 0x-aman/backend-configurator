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
import {
  Code,
  Copy,
  CheckCircle2,
  ExternalLink,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { ApiResponse } from "@/src/types/api";
import { Skeleton } from "@/components/ui/skeleton";

const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

interface ClientInfo {
  publicKey: string;
  apiKey: string;
  domain: string | null;
}

interface Configurator {
  id: string;
  name: string;
  description?: string;
  publicId: string;
}

export default function EmbedPage() {
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [configurators, setConfigurators] = useState<Configurator[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, listRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/configurator/list"),
        ]);

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

        if (listRes.ok) {
          const listJson: ApiResponse = await listRes.json();
          const data = listJson?.data || [];
          setConfigurators(data);

          // auto-expand if <3
          if (data.length && data.length < 3) {
            setExpandedIds(new Set(data.map((cfg: any) => cfg.id)));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const copyCode = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Embed script copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManageConfigurator = async (publicId: string) => {
    try {
      toast.loading("Opening editor...");

      const tokenRes = await fetch("/api/configurator/generate-edit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configuratorId: publicId }),
      });

      if (!tokenRes.ok) {
        toast.error("Failed to create edit token");
        return;
      }

      const tokenJson = await tokenRes.json();
      const token = tokenJson?.data?.token;
      if (!token) {
        toast.error("No token returned");
        return;
      }

      const host =
        window.location.hostname === "localhost"
          ? "http://localhost:8080"
          : "https://exact-dupe-engine.vercel.app";

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

  if (loading)
    return (
      <div className="p-6 lg:p-8 max-w-4xl space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Embed Script</h1>
      <p className="text-muted-foreground mb-8">
        Integrate your configurators into any website.
      </p>

      <div className="grid gap-6 max-w-4xl">
        {/* Configurators */}
        {configurators.map((cfg) => {
          const embedScript = `<!-- Konfigra Configurator: ${cfg.name} -->
<div id="konfigra-${cfg.publicId}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")}/embed.js';
    script.setAttribute('data-public-key', '${client?.publicKey}');
    script.setAttribute('data-configurator-id', '${cfg.publicId}');
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;

          const expanded = expandedIds.has(cfg.id);

          return (
            <Card key={cfg.id}>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>{cfg.name}</CardTitle>
                  <CardDescription>
                    {cfg.description || "No description provided."}
                  </CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `http://localhost:8080/?apiKey=${cfg.publicId}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleManageConfigurator(cfg.publicId)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleExpand(cfg.id)}
                  >
                    {expanded ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
              </CardHeader>

              {expanded && (
                <CardContent className="relative">
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-xs font-mono">
                    {embedScript}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(embedScript, cfg.id)}
                  >
                    {copiedId === cfg.id ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}
        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Your unique identifiers for API access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Public Key</label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 p-3 bg-muted rounded-md text-sm break-all">
                  {client?.publicKey || "Not available"}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(client?.publicKey || "");
                    toast.success("Public key copied");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">API Key (Secret)</label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 p-3 bg-muted rounded-md text-sm break-all">
                  {client?.apiKey || "Not available"}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(client?.apiKey || "");
                    toast.success("API key copied");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Keep this secret. Use only for backend API calls.
              </p>
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
        ;
      </div>
    </div>
  );
}
