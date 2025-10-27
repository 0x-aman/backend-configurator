"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, Users, FileText, TrendingUp, DollarSign } from "lucide-react";

interface DashboardStats {
  configurators: number;
  quotes: number;
  monthlyRequests: number;
  subscriptionStatus: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/client/me");
        if (response.ok) {
          const data = await response.json();
          setStats({
            configurators: 0,
            quotes: 0,
            monthlyRequests: data.client?.monthlyRequests || 0,
            subscriptionStatus: data.client?.subscriptionStatus || "TRIALING",
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Configurators",
      value: stats?.configurators || 0,
      icon: LayoutDashboard,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Quotes",
      value: stats?.quotes || 0,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Monthly Requests",
      value: stats?.monthlyRequests || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user?.name || "User"}! Here's your overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, i) => (
            <Card key={i} data-testid={`stat-card-${stat.title.toLowerCase().replace(" ", "-")}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`stat-value-${stat.title.toLowerCase().replace(" ", "-")}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current plan and status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="flex items-center space-x-4">
                <Badge 
                  variant={stats?.subscriptionStatus === "ACTIVE" ? "default" : "secondary"}
                  className="text-sm"
                  data-testid="subscription-status-badge"
                >
                  {stats?.subscriptionStatus || "TRIALING"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {stats?.subscriptionStatus === "ACTIVE" ? "Your subscription is active" : "Start your subscription to unlock all features"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with these common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/dashboard/embed"
                className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
                data-testid="quick-action-embed"
              >
                <LayoutDashboard className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="text-sm font-medium">View Embed Script</span>
              </a>
              <a
                href="/dashboard/billing"
                className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
                data-testid="quick-action-billing"
              >
                <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="text-sm font-medium">Manage Billing</span>
              </a>
              <a
                href="/dashboard/quotes"
                className="flex items-center p-3 rounded-lg border hover:bg-accent transition-colors"
                data-testid="quick-action-quotes"
              >
                <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="text-sm font-medium">View Quotes</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}