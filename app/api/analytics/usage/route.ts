// Get usage analytics
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { AnalyticsService } from '@/src/services/analytics.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);

    const configuratorId = searchParams.get('configuratorId') || undefined;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const dateRange = from && to ? { from: new Date(from), to: new Date(to) } : undefined;

    const stats = await AnalyticsService.getUsageStats(client.id, configuratorId, dateRange);

    return success(stats);
  } catch (error: any) {
    return fail(error.message, 'ANALYTICS_ERROR', 500);
  }
}
