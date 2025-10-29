// src/services/admin.service.ts
import { prisma } from "@/src/lib/prisma";

export const AdminService = {
  async getSystemStats() {
    // Parallel aggregate queries for performance
    const [
      totalClients,
      activeClients,
      trialingClients,
      totalConfigurators,
      publishedConfigurators,
      totalQuotes,
      acceptedQuotes,
      totalFiles,
      totalAnalyticsEvents,
      totalApiLogs,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { subscriptionStatus: "ACTIVE" } }),
      prisma.client.count({ where: { subscriptionStatus: "INACTIVE" } }),
      prisma.configurator.count(),
      prisma.configurator.count({ where: { isPublished: true } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: "ACCEPTED" } }),
      prisma.file.count(),
      prisma.analyticsEvent.count(),
      prisma.apiLog.count(),
    ]);

    // New clients this month
    const newClientsThisMonth = await prisma.client.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Quotes created in the last 30 days
    const recentQuotes = await prisma.quote.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        customerEmail: true,
        createdAt: true,
        client: { select: { name: true, email: true } },
      },
    });

    // Average quote value
    const avgQuote = await prisma.quote.aggregate({
      _avg: { totalPrice: true },
    });

    // API usage
    const apiStats = await prisma.apiLog.aggregate({
      _avg: { responseTime: true },
      _sum: { responseSize: true, requestSize: true },
      _count: { _all: true },
    });

    // Top 5 active clients by configurator count
    const topClients = await prisma.client.findMany({
      take: 5,
      orderBy: { configurators: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        _count: { select: { configurators: true, quotes: true } },
      },
    });

    // Calculate derived metrics
    const activeRate = totalClients
      ? ((activeClients / totalClients) * 100).toFixed(1)
      : "0";

    const quoteAcceptRate = totalQuotes
      ? ((acceptedQuotes / totalQuotes) * 100).toFixed(1)
      : "0";

    return {
      overview: {
        totalClients,
        activeClients,
        trialingClients,
        activeRate: `${activeRate}%`,
        totalConfigurators,
        publishedConfigurators,
        totalQuotes,
        acceptedQuotes,
        quoteAcceptRate: `${quoteAcceptRate}%`,
        totalFiles,
        totalAnalyticsEvents,
        totalApiLogs,
      },
      growth: {
        newClientsThisMonth,
        avgQuoteValue: avgQuote._avg.totalPrice || 0,
      },
      api: {
        totalRequests: apiStats._count._all,
        avgResponseTime: Math.round(apiStats._avg.responseTime || 0),
        dataTransferred: {
          requestBytes: apiStats._sum.requestSize || 0,
          responseBytes: apiStats._sum.responseSize || 0,
        },
      },
      leaderboard: {
        topClients,
      },
      recentQuotes,
      updatedAt: new Date(),
    };
  },
};
