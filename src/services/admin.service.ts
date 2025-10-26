// Admin service
import { prisma } from '@/src/lib/prisma';
import type { Client } from '@prisma/client';

export const AdminService = {
  async getAllClients(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          companyName: true,
          subscriptionStatus: true,
          subscriptionPlan: true,
          monthlyRequests: true,
          requestLimit: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              configurators: true,
              quotes: true,
            },
          },
        },
      }),
      prisma.client.count(),
    ]);

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getSystemStats() {
    const [totalClients, activeSubscriptions, totalConfigurators, totalQuotes, recentActivity] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({
        where: {
          subscriptionStatus: {
            in: ['ACTIVE', 'TRIALING'],
          },
        },
      }),
      prisma.configurator.count(),
      prisma.quote.count(),
      prisma.analyticsEvent.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    const subscriptionBreakdown = await prisma.client.groupBy({
      by: ['subscriptionPlan'],
      _count: true,
    });

    return {
      totalClients,
      activeSubscriptions,
      totalConfigurators,
      totalQuotes,
      recentActivity,
      subscriptionBreakdown: subscriptionBreakdown.reduce((acc, curr) => {
        acc[curr.subscriptionPlan] = curr._count;
        return acc;
      }, {} as Record<string, number>),
    };
  },

  async impersonateClient(clientId: string): Promise<Client> {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new Error('Client not found');
    return client;
  },

  async updateClientStatus(clientId: string, status: string) {
    return await prisma.client.update({
      where: { id: clientId },
      data: { subscriptionStatus: status as any },
    });
  },
};
