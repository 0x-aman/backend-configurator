"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsData {
  overview: {
    totalClients: number;
    activeClients: number;
    trialingClients: number;
    activeRate: string;
    totalConfigurators: number;
    publishedConfigurators: number;
    totalQuotes: number;
    acceptedQuotes: number;
    quoteAcceptRate: string;
    totalFiles: number;
    totalAnalyticsEvents: number;
    totalApiLogs: number;
  };
  growth: {
    newClientsThisMonth: number;
    avgQuoteValue: string;
  };
  api: {
    totalRequests: number;
    avgResponseTime: number;
    dataTransferred: {
      requestBytes: number;
      responseBytes: number;
    };
  };
  leaderboard: {
    topClients: Array<{
      id: string;
      name: string;
      email: string;
      companyName: string;
      _count: {
        configurators: number;
        quotes: number;
      };
    }>;
  };
  recentQuotes: Array<{
    id: string;
    totalPrice: string;
    status: string;
    customerEmail: string;
    createdAt: string;
    client: {
      name: string;
      email: string;
    };
  }>;
  updatedAt: string;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || "Failed to load statistics"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACCEPTED":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "REJECTED":
        return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300";
      case "PENDING":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            System overview and key metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Active Clients
              </div>
              <div className="text-3xl font-bold">
                {stats.overview.activeClients}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {stats.overview.activeRate} of total
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Published Configurators
              </div>
              <div className="text-3xl font-bold">
                {stats.overview.publishedConfigurators}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                of {stats.overview.totalConfigurators} total
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Total Quotes
              </div>
              <div className="text-3xl font-bold">
                {stats.overview.totalQuotes}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {stats.overview.quoteAcceptRate} acceptance
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Avg Quote Value
              </div>
              <div className="text-3xl font-bold">
                ${Number.parseFloat(stats.growth.avgQuoteValue).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                per quote
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                New Clients This Month
              </div>
              <div className="text-2xl font-bold">
                {stats.growth.newClientsThisMonth}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Total Files
              </div>
              <div className="text-2xl font-bold">
                {stats.overview.totalFiles}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Analytics Events
              </div>
              <div className="text-2xl font-bold">
                {stats.overview.totalAnalyticsEvents.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Total Requests
              </div>
              <div className="text-2xl font-bold">
                {stats.api.totalRequests.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Avg Response Time
              </div>
              <div className="text-2xl font-bold">
                {stats.api.avgResponseTime.toFixed(0)}ms
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Request Data
              </div>
              <div className="text-2xl font-bold">
                {formatBytes(stats.api.dataTransferred.requestBytes)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">
                Response Data
              </div>
              <div className="text-2xl font-bold">
                {formatBytes(stats.api.dataTransferred.responseBytes)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Top Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.leaderboard.topClients.length > 0 ? (
                  stats.leaderboard.topClients.map((client, idx) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-semibold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {client.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {client.companyName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {client._count.configurators}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {client._count.quotes}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No clients yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Recent Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentQuotes.length > 0 ? (
                  stats.recentQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {quote.client.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {quote.customerEmail}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            ${Number.parseFloat(quote.totalPrice).toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(quote.status)}`}
                        >
                          {quote.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No quotes yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Last updated: {new Date(stats.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
