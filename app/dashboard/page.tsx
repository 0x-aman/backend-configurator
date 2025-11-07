"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardLoading } from "@/components/dashboard-loading";
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
  FileText,
  TrendingUp,
  DollarSign,
  Plus,
  Sparkles,
  Settings,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ApiResponse } from "@/src/types/api";
import type { ClientProfile } from "@/src/types/auth";

interface DashboardStats {
  configurators: number;
  quotes: number;
  monthlyRequests: number;
  subscriptionStatus: string;
  subscriptionDuration: string | null;
}

interface Configurator {
  id: string;
  name: string;
  description?: string;
  publicId: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [configurators, setConfigurators] = useState<Configurator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientRes, configRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/configurator/list"),
        ]);

        if (clientRes.ok) {
          const result: ApiResponse<ClientProfile> = await clientRes.json();

          if (result.success && result.data) {
            const configList: ApiResponse = await configRes.json();
            const configs = configList.data || [];

            setConfigurators(configs);
            setStats({
              configurators: configs.length,
              quotes: 0,
              monthlyRequests: result.data?.monthlyRequests || 0,
              subscriptionStatus: result.data?.subscriptionStatus || "INACTIVE",
              subscriptionDuration: result.data?.subscriptionDuration || null,
            });

            if (
              configs.length === 0 &&
              result.data.subscriptionStatus === "ACTIVE"
            ) {
              setTimeout(() => setShowCreateModal(true), 400);
            }
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

        // Update configurators without full reload
        setConfigurators((prev) => [
          ...prev,
          data?.data || {
            name: formData.name,
            description: formData.description,
          },
        ]);
        setStats((prev) =>
          prev ? { ...prev, configurators: prev.configurators + 1 } : null
        );
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

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {session?.user?.name || "User"}! Here’s your overview.
          </p>
        </div>
        {stats?.subscriptionStatus === "ACTIVE" && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Configurator
          </Button>
        )}
      </div>

      {/* Empty State Banner */}
      {!loading && configurators.length === 0 && (
        <Alert className="mb-6 border-primary/50 bg-primary/5">
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
            {stats?.subscriptionStatus === "ACTIVE" ? (
              <Button onClick={() => setShowCreateModal(true)} className="ml-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Configurator
              </Button>
            ) : (
              <Button asChild className="ml-4">
                <a href="/dashboard/billing">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Subscription
                </a>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
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
          : [
              {
                title: "Configurators",
                value: stats?.configurators || 0,
                icon: LayoutDashboard,
                color: "text-blue-600",
                bg: "bg-blue-50 dark:bg-blue-950",
              },
              {
                title: "Total Quotes",
                value: stats?.quotes || 0,
                icon: FileText,
                color: "text-green-600",
                bg: "bg-green-50 dark:bg-green-950",
              },
              {
                title: "Monthly Requests",
                value: stats?.monthlyRequests || 0,
                icon: TrendingUp,
                color: "text-purple-600",
                bg: "bg-purple-50 dark:bg-purple-950",
              },
            ].map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Configurators List */}
      {configurators.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Your Configurators</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {configurators.map((cfg) => (
              <Card key={cfg.id}>
                <CardHeader>
                  <CardTitle className="truncate">{cfg.name}</CardTitle>
                  <CardDescription className="truncate">
                    {cfg.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
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
                    <ExternalLink className="h-4 w-4 mr-1" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/dashboard/configurators/${cfg.id}`,
                        "_blank"
                      )
                    }
                  >
                    <Settings className="h-4 w-4 mr-1" /> Manage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Configurator Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create Configurator
            </DialogTitle>
            <DialogDescription>
              Give your configurator a name and description to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Configurator Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Sofa Builder"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional short summary"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateConfigurator} disabled={creating}>
              {creating ? "Creating..." : "Create Configurator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
