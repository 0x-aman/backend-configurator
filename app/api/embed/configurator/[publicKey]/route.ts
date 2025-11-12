// Embed API - Get configurator by public key
import { NextRequest } from "next/server";
import { ConfiguratorService } from "@/src/services/configurator.service";
import { validatePublicKey } from "@/src/middleware/api-key";
import { AnalyticsService } from "@/src/services/analytics.service";
import { success, fail } from "@/src/lib/response";
import { addCorsHeaders } from "@/src/lib/cors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicKey: string }> }
) {
  try {
    const client = await validatePublicKey(request);
    const { publicKey } = await params;

    // Get first published configurator for this client
    const configurators = await ConfiguratorService.list(client.id);
    const published = configurators.find(
      (c) => (c as any).isPublished && (c as any).isActive
    );

    if (!published) {
      const response = fail(
        "No published configurator found",
        "NOT_FOUND",
        404
      );
      return addCorsHeaders(response, request, client.allowedDomains);
    }

    // Track analytics
    const userAgent = request.headers.get("user-agent") || undefined;
    const origin = request.headers.get("origin") || undefined;

    await AnalyticsService.trackEvent(client.id, {
      configuratorId: published.id,
      eventType: "EMBED_LOAD",
      eventName: "Embed Loaded",
      userAgent,
      domain: origin,
    });

    const response = success(published);
    return addCorsHeaders(response, request, client.allowedDomains);
  } catch (error: any) {
    const response = fail(
      error.message,
      "EMBED_ERROR",
      error.statusCode || 500
    );
    return addCorsHeaders(response, request, ["*"]);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Public-Key",
    },
  });
}
