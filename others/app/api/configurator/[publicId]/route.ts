// Get configurator by public ID (for embed)
import { NextRequest } from "next/server";
import { ConfiguratorService } from "@/src/services/configurator.service";
import { ClientService } from "@/src/services/client.service";
import { success, fail } from "@/src/lib/response";
import { addCorsHeaders } from "@/src/lib/cors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    const configurator = await ConfiguratorService.getByPublicId(publicId);

    // Get the client to check allowed domains
    const client = await ClientService.getById(configurator.clientId);

    // Check origin if client has allowed domains configured
    const origin = request.headers.get("origin");
    if (client.allowedDomains && client.allowedDomains.length > 0 && origin) {
      const originHost = new URL(origin).hostname;
      const isAllowed = client.allowedDomains.some((domain) => {
        console.log(originHost, domain, "====");
        // Exact match or subdomain match
        return originHost === domain || originHost.endsWith(`.${domain}`);
      });

      if (!isAllowed) {
        const response = fail(
          "Origin not allowed. Please add your domain to allowed origins in your account settings.",
          "ORIGIN_NOT_ALLOWED",
          403
        );
        return addCorsHeaders(response, request, client.allowedDomains);
      }
    }

    // Update access time
    await ConfiguratorService.updateAccessedAt(configurator.id);

    const response = success(configurator);
    return addCorsHeaders(
      response,
      request,
      client.allowedDomains && client.allowedDomains.length > 0
        ? client.allowedDomains
        : ["*"]
    );
  } catch (error: any) {
    const response = fail(
      error.message,
      "CONFIGURATOR_ERROR",
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
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
