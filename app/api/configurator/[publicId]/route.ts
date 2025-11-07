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
    if (!configurator) {
      const res = fail("Configurator not found.", "NOT_FOUND", 404);
      return addCorsHeaders(res, request, ["*"]);
    }

    const client = await ClientService.getById(configurator.clientId);
    if (!client) {
      const res = fail("Client not found.", "CLIENT_NOT_FOUND", 404);
      return addCorsHeaders(res, request, ["*"]);
    }

    const origin = request.headers.get("origin");
    const allowed = client.allowedDomains || [];

    // Case 1: no allowed domains configured
    if (allowed.length === 0) {
      const res = fail(
        "No allowed domains configured. Please add your domain to allowed origins in your account settings.",
        "NO_ALLOWED_ORIGINS",
        403
      );
      return addCorsHeaders(res, request, ["*"]);
    }

    // Case 2: origin not present or doesn't match
    if (origin) {
      const originHost = new URL(origin).hostname;
      const isAllowed = allowed.some(
        (domain: string) =>
          originHost === domain || originHost.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        const res = fail(
          `Origin mismatch. Your domain (${originHost}) is not in allowed origins. Please add it to your account settings.`,
          "ORIGIN_MISMATCH",
          403
        );
        return addCorsHeaders(res, request, allowed);
      }
    } else {
      const res = fail("Missing Origin header.", "MISSING_ORIGIN", 400);
      return addCorsHeaders(res, request, allowed);
    }

    // Case 3: all good
    await ConfiguratorService.updateAccessedAt(configurator.id);
    const res = success(configurator);
    return addCorsHeaders(res, request, allowed);
  } catch (error: any) {
    const res = fail(error.message, "CONFIGURATOR_ERROR", 500);
    return addCorsHeaders(res, request, ["*"]);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
