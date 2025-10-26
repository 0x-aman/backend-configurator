// Track analytics from embed
import { NextRequest } from 'next/server';
import { validatePublicKey } from '@/src/middleware/api-key';
import { AnalyticsService } from '@/src/services/analytics.service';
import { success, fail } from '@/src/lib/response';
import { addCorsHeaders } from '@/src/lib/cors';

export async function POST(request: NextRequest) {
  try {
    const client = await validatePublicKey(request);
    const body = await request.json();

    const { configuratorId, eventType, eventName, metadata } = body;

    const userAgent = request.headers.get('user-agent') || undefined;
    const origin = request.headers.get('origin') || undefined;

    await AnalyticsService.trackEvent(client.id, {
      configuratorId,
      eventType: eventType || 'CONFIGURATOR_INTERACTION',
      eventName: eventName || 'Interaction',
      userAgent,
      domain: origin,
      metadata,
    });

    const response = success({ tracked: true });
    return addCorsHeaders(response, request, client.allowedDomains);
  } catch (error: any) {
    const response = fail(error.message, 'ANALYTICS_ERROR', error.statusCode || 500);
    return addCorsHeaders(response, request, ['*']);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Public-Key',
    },
  });
}
