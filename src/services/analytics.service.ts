// Analytics service
import { prisma } from '@/src/lib/prisma';
import type { AnalyticsEventType } from '@prisma/client';

export const AnalyticsService = {
  async trackEvent(
    clientId: string,
    data: {
      configuratorId?: string;
      eventType: AnalyticsEventType;
      eventName: string;
      sessionId?: string;
      userAgent?: string;
      ipAddress?: string;
      path?: string;
      referrer?: string;
      domain?: string;
      metadata?: any;
    }
  ) {
    return await prisma.analyticsEvent.create({
      data: {
        clientId,
        ...data,
      },
    });
  },

  async getUsageStats(
    clientId: string,
    configuratorId?: string,
    dateRange?: { from: Date; to: Date }
  ) {
    const where: any = { clientId };
    if (configuratorId) where.configuratorId = configuratorId;
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    const [totalEvents, eventsByType, uniqueSessions] = await Promise.all([
      prisma.analyticsEvent.count({ where }),
      prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where,
        _count: true,
      }),
      prisma.analyticsEvent.findMany({
        where,
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
    ]);

    return {
      totalEvents,
      eventsByType: eventsByType.reduce((acc, curr) => {
        acc[curr.eventType] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      uniqueSessions: uniqueSessions.length,
    };
  },

  async getPerformanceMetrics(clientId: string, configuratorId?: string) {
    const where: any = { clientId };
    if (configuratorId) where.configuratorId = configuratorId;

    const [views, interactions, quotes, conversions] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'CONFIGURATOR_VIEW' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'CONFIGURATOR_INTERACTION' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'QUOTE_REQUEST' },
      }),
      prisma.analyticsEvent.count({
        where: { ...where, eventType: 'CONVERSION' },
      }),
    ]);

    return {
      views,
      interactions,
      quotes,
      conversions,
      conversionRate: views > 0 ? (conversions / views) * 100 : 0,
      quoteRate: views > 0 ? (quotes / views) * 100 : 0,
    };
  },

  async logApiRequest(data: {
    clientId?: string;
    method: string;
    path: string;
    statusCode: number;
    userAgent?: string;
    ipAddress?: string;
    responseTime: number;
    errorMessage?: string;
  }) {
    return await prisma.apiLog.create({ data });
  },
};
