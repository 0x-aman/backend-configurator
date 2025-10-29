"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Plus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardStats {
  configurators: number;
  quotes: number;
  monthlyRequests: number;
  subscriptionStatus: string;
  subscriptionDuration: string | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/client/me");
        if (response.ok) {
          const { data } = await response.json();

          // Fetch configurators count
          const configResponse = await fetch("/api/configurator/list");
          let configCount = 0;
          if (configResponse.ok) {
            const configs = await configResponse.json();
            configCount = configs.data?.length || 0;
          }

          setStats({
            configurators: configCount,
            quotes: 0,
            monthlyRequests: data?.monthlyRequests || 0,
            subscriptionStatus: data?.subscriptionStatus || "INACTIVE",
            subscriptionDuration: data?.subscriptionDuration || null,
          });

          // Show create modal only if no configurators AND subscription is active
          if (
            configCount === 0 &&
            (data?.subscriptionStatus || "INACTIVE") === "ACTIVE"
          ) {
            setTimeout(() => setShowCreateModal(true), 500);
          }
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCreateConfigurator = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a configurator name");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/configurator/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Configurator created successfully!");
        setShowCreateModal(false);
        setFormData({ name: "", description: "" });

        // Refresh stats
        setStats((prev) =>
          prev ? { ...prev, configurators: prev.configurators + 1 } : null
        );

        // Redirect to configurator page or reload
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to create configurator");
      }
    } catch (error) {
      console.error("Failed to create configurator:", error);
      toast.error("Failed to create configurator. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getSubscriptionStatusDisplay = () => {
    if (!stats) return "Loading...";

    if (stats.subscriptionStatus === "ACTIVE" && stats.subscriptionDuration) {
      return stats.subscriptionDuration === "MONTHLY"
        ? "Active Monthly Plan"
        : "Active Yearly Plan";
    }

    return "Inactive";
  };

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
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid="dashboard-title"
        >
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user?.name || "User"}! Here's your overview.
        </p>
      </div>

      {/* Empty State Banner */}
      {!loading && stats?.configurators === 0 && (
        <Alert
          className="mb-6 border-primary/50 bg-primary/5"
          data-testid="create-configurator-banner"
        >
          <Sparkles className="h-5 w-5 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                Get started by creating your first configurator!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Build beautiful product configurators for your business in
                minutes.
              </p>
            </div>
            {stats.subscriptionStatus === "ACTIVE" ? (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="ml-4"
                data-testid="banner-create-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Configurator
              </Button>
            ) : (
              <Button
                asChild
                className="ml-4"
                data-testid="banner-start-subscription"
              >
                <a href="/dashboard/billing">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Subscription
                </a>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
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
          : statCards.map((stat, i) => (
              <Card
                key={i}
                data-testid={`stat-card-${stat.title.toLowerCase().replace(" ", "-")}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold"
                    data-testid={`stat-value-${stat.title.toLowerCase().replace(" ", "-")}`}
                  >
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  variant={
                    stats?.subscriptionStatus === "ACTIVE"
                      ? "default"
                      : "secondary"
                  }
                  className="text-sm"
                  data-testid="subscription-status-badge"
                >
                  {getSubscriptionStatusDisplay()}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {stats?.subscriptionStatus === "ACTIVE"
                    ? "Your subscription is active"
                    : "Start your subscription to unlock all features"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
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

      {/* Create Configurator Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent data-testid="create-configurator-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create Your First Configurator
            </DialogTitle>
            <DialogDescription>
              Give your configurator a name and description to get started. You
              can customize it further later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Configurator Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Product Configurator"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                data-testid="configurator-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what this configurator is for..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                data-testid="configurator-description-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
              data-testid="cancel-create-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConfigurator}
              disabled={creating}
              data-testid="submit-create-button"
            >
              {creating ? "Creating..." : "Create Configurator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
