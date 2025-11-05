// Get performance metrics
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { AnalyticsService } from '@/src/services/analytics.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);

    const configuratorId = searchParams.get('configuratorId') || undefined;

    const metrics = await AnalyticsService.getPerformanceMetrics(client.id, configuratorId);

    return success(metrics);
  } catch (error: any) {
    return fail(error.message, 'ANALYTICS_ERROR', 500);
  }
}
